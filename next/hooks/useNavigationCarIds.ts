"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNewMmeGarageCarsQuery } from "@/hooks/garage";
import { resolveNavigationCarIds, resolveNavigationVin } from "@/utils/categorySearchUrl";
import { findGarageSiblingCarIdsByCarId, findGarageVinByCarId } from "@/utils/garageCarId";
import {
  getE2ESavedCarSiblingCarIds,
  getE2ESavedCarVin,
  resolveUrlCarIdsForSavedCar,
} from "@/utils/e2eSavedCarMeta";
import { shouldUseSessionCarHistory } from "@/utils/searchedCarIdsSession";
import { getClientFeatureFlag } from "@/utils/theme-utils";

/** URL `carIds` first, then hero slider selection — when new MME flag is on.
 * Deselect must clear both URL `carIds` and `useLandingHeroCarStore` so outbound
 * header/footer links do not re-attach a stale vehicle.
 * E2E: expand a single primary id to stored sibling list (2–5) when present. */
export function useNavigationCarIds(): string[] {
  const searchParams = useSearchParams();
  const heroCarsApiId = useLandingHeroCarStore((s) => s.selectedCarsApiId);
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const isE2EVinFlow = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");
  const { isAuthenticated } = useAuthStore();
  const usesSession = shouldUseSessionCarHistory(isAuthenticated);
  const { data: garageCars = [] } = useNewMmeGarageCarsQuery();

  return useMemo(() => {
    const base = resolveNavigationCarIds({
      searchParams,
      heroCarsApiId,
      enabled: isNewMmeEnabled,
    });
    if (!isE2EVinFlow || base.length === 0) return base;
    // URL already has multi ids — keep as-is for listing filters.
    if (base.length >= 2) return base;

    const primary = base[0]!;
    return resolveUrlCarIdsForSavedCar(primary, {
      getSiblingCarIds: (id) =>
        usesSession
          ? getE2ESavedCarSiblingCarIds(id)
          : findGarageSiblingCarIdsByCarId(garageCars, id),
    });
  }, [garageCars, heroCarsApiId, isE2EVinFlow, isNewMmeEnabled, searchParams, usesSession]);
}

/**
 * E2E: VIN for outbound nav (header L1–L3, footer, manufacturers, homepage categories).
 * URL `vin` wins; else guest meta / Garage VIN for the active navigation car.
 * Flag off or search-by-car cars → null (never invent a VIN).
 */
export function useNavigationVin(): string | null {
  const searchParams = useSearchParams();
  const navigationCarIds = useNavigationCarIds();
  const { isAuthenticated } = useAuthStore();
  const usesSession = shouldUseSessionCarHistory(isAuthenticated);
  const { data: garageCars = [] } = useNewMmeGarageCarsQuery();
  const isE2EVinFlow = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");

  return useMemo(
    () =>
      resolveNavigationVin({
        searchParams,
        carIds: navigationCarIds,
        enabled: isE2EVinFlow,
        getVinForCarId: (carId) =>
          usesSession ? getE2ESavedCarVin(carId) : findGarageVinByCarId(garageCars, carId),
      }),
    [garageCars, isE2EVinFlow, navigationCarIds, searchParams, usesSession],
  );
}
