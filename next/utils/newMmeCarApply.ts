import type { QueryClient } from "@tanstack/react-query";
import { postGarageNewMmeCar } from "@/services/garageService";
import { findGarageRecordIdByCarIdFromCache, isCarIdInGarageCache } from "@/utils/garageCarId";
import { encodeGarageMakeModelOnlyName, normalizeSavedCarVin } from "@/utils/e2eSavedCarMeta";
import {
  clearEditingSearchedCarId,
  pushSearchedCarIds,
  replaceSearchedCarId,
} from "@/utils/searchedCarIdsSession";

export function primaryCarId(carIds: string[]): string {
  return carIds[0]?.trim() ?? "";
}

function normalizeCarIds(carIds: string[]): string[] {
  return carIds.map((id) => id.trim()).filter(Boolean);
}

/** Add → full Cars API array; edit → `[carIds[0]]` only. */
export function carIdsForPersistence(carIds: string[], isEdit: boolean): string[] {
  const trimmed = normalizeCarIds(carIds);
  if (trimmed.length === 0) return [];
  if (isEdit) return [trimmed[0]!];
  return trimmed;
}

/**
 * E2E flow (`end_to_end_vin_flow_feature_flag`): always persist **only** `carIds[0]`
 * (make+model car). Multi ids stay in the URL for filtering, not as separate saved cars.
 */
export function carIdsForE2EPersistence(carIds: string[]): string[] {
  const primary = primaryCarId(carIds);
  return primary ? [primary] : [];
}

/** URL always reflects the single selected dropdown car (`carIds[0]`). Legacy / flag-off. */
export function urlCarIdsForApply(carIds: string[], _isEdit?: boolean): string[] {
  const trimmed = normalizeCarIds(carIds);
  if (trimmed.length === 0) return [];
  return [trimmed[0]!];
}

/**
 * E2E apply URL: put **all** resolved ids (1–5) in `?carIds=` for listing filters.
 * Caller must not apply when length is 0 or >5.
 */
export function urlCarIdsForE2EApply(carIds: string[]): string[] {
  return normalizeCarIds(carIds).slice(0, 5);
}

/** True when resolved Cars/`GET /Vin` length is 2–5 (make+model representative save). */
export function isE2EMakeModelOnlyResolvedLength(carIds: string[] | null | undefined): boolean {
  if (!Array.isArray(carIds)) return false;
  const n = carIds.map((id) => String(id).trim()).filter(Boolean).length;
  return n >= 2 && n <= 5;
}

export function persistSessionCarsForApply(
  carIds: string[],
  isEdit: boolean,
  editOldCarsApiId: string | null | undefined,
): void {
  const resolved = carIdsForPersistence(carIds, isEdit);
  if (resolved.length === 0) return;

  if (isEdit && editOldCarsApiId?.trim()) {
    replaceSearchedCarId(editOldCarsApiId.trim(), resolved[0]!);
    clearEditingSearchedCarId();
    return;
  }

  pushSearchedCarIds(resolved);
}

export async function persistGarageCarsForApply(options: {
  carIds: string[];
  isEdit: boolean;
  editOldCarsApiId: string | null | undefined;
  editingMyCarRecordId: string | null | undefined;
  queryClient: QueryClient;
  garageSavedCarsQueryKey: readonly unknown[];
  /**
   * E2E logged-in only:
   * - `true` → POST `name: "makeModelOnly:id0,id1,…"` (or legacy flag-only if no resolved list)
   * - `false` → POST `name: null` (clear flag after single-id save)
   * - omit → do not send `name` (legacy Sprint 35)
   */
  makeModelOnly?: boolean;
  /**
   * Full resolved Cars/`GET /Vin` ids (before slicing to `[0]` for storage).
   * Encoded into Garage `name` when `makeModelOnly === true`.
   */
  resolvedCarIdsForName?: string[] | null;
  /**
   * E2E logged-in only:
   * - string → POST `vin` (Search by VIN save)
   * - `null` → POST `vin: null` (search-by-car clears VIN context)
   * - omit → do not send `vin`
   */
  vin?: string | null;
}): Promise<void> {
  const {
    carIds,
    isEdit,
    editOldCarsApiId,
    editingMyCarRecordId,
    queryClient,
    garageSavedCarsQueryKey,
    makeModelOnly,
    resolvedCarIdsForName,
    vin,
  } = options;

  const resolved = carIdsForPersistence(carIds, isEdit);
  if (resolved.length === 0) return;

  const namePayload =
    makeModelOnly === true
      ? {
          name: encodeGarageMakeModelOnlyName(
            resolvedCarIdsForName && resolvedCarIdsForName.length > 0
              ? resolvedCarIdsForName
              : carIds,
          ),
        }
      : makeModelOnly === false
        ? { name: null }
        : {};

  const vinPayload =
    vin === undefined
      ? {}
      : vin === null
        ? { vin: null }
        : (() => {
            const normalized = normalizeSavedCarVin(vin);
            return normalized ? { vin: normalized } : { vin: null };
          })();

  const metaPayload = { ...namePayload, ...vinPayload };
  const shouldUpdateExistingMeta = makeModelOnly !== undefined || vin !== undefined;

  let didPersist = false;

  if (isEdit) {
    const newCarId = resolved[0]!;
    const garageRecordId =
      editingMyCarRecordId?.trim() ||
      (editOldCarsApiId?.trim()
        ? findGarageRecordIdByCarIdFromCache(
            queryClient,
            garageSavedCarsQueryKey,
            editOldCarsApiId.trim(),
          )
        : undefined);

    await postGarageNewMmeCar({
      ...(garageRecordId ? { id: garageRecordId } : {}),
      carId: newCarId,
      ...metaPayload,
    });
    didPersist = true;
  } else {
    const toAdd = resolved.filter(
      (carId) => !isCarIdInGarageCache(queryClient, garageSavedCarsQueryKey, carId),
    );
    if (toAdd.length > 0) {
      await Promise.all(toAdd.map((carId) => postGarageNewMmeCar({ carId, ...metaPayload })));
      didPersist = true;
    } else if (shouldUpdateExistingMeta && resolved[0]) {
      // Already in Garage — still update E2E `name` / `vin` flags.
      const garageRecordId = findGarageRecordIdByCarIdFromCache(
        queryClient,
        garageSavedCarsQueryKey,
        resolved[0],
      );
      if (garageRecordId) {
        await postGarageNewMmeCar({
          id: garageRecordId,
          carId: resolved[0],
          ...metaPayload,
        });
        didPersist = true;
      }
    }
  }

  if (didPersist) {
    await queryClient.invalidateQueries({
      queryKey: garageSavedCarsQueryKey,
      refetchType: "all",
    });
  }
}
