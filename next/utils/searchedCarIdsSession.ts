import { getClientFeatureFlag } from "@/utils/theme-utils";
import { invalidateEditPrefillCache } from "@/utils/newMmeEditPrefillCache";
import {
  clearE2ESavedCarMeta,
  normalizeSavedCarVin,
  registerSessionCarVinLookup,
  syncE2ESavedCarMakeModelOnlyMeta,
} from "@/utils/e2eSavedCarMeta";

export const SEARCHED_CAR_IDS_SESSION_KEY = "searched_car_id";
export const SEARCHED_CAR_EDITING_ID_SESSION_KEY = "searched_car_editing_id";
/** Guest-only: active selection was cleared (Deselect) while history list is kept. */
export const SEARCHED_CAR_SELECTION_CLEARED_KEY = "searched_car_selection_cleared";

const MAX_SESSION_CAR_IDS = 10;

/** Guest session car entry — VIN travels with the car id (same sessionStorage key). */
export type SearchedSessionCar = {
  carId: string;
  /** 17-char VIN when this car was saved via Search by VIN. */
  vin?: string;
};

function normalizeEntry(raw: unknown): SearchedSessionCar | null {
  if (typeof raw === "string") {
    const carId = raw.trim();
    return carId ? { carId } : null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const carId = String(obj.carId ?? obj.id ?? "").trim();
  if (!carId) return null;
  const vin = normalizeSavedCarVin(typeof obj.vin === "string" ? obj.vin : null);
  return vin ? { carId, vin } : { carId };
}

function readRawEntries(): SearchedSessionCar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SEARCHED_CAR_IDS_SESSION_KEY);
    if (!raw?.trim()) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const out: SearchedSessionCar[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      const entry = normalizeEntry(item);
      if (!entry || seen.has(entry.carId)) continue;
      seen.add(entry.carId);
      out.push(entry);
      if (out.length >= MAX_SESSION_CAR_IDS) break;
    }
    return out;
  } catch {
    return [];
  }
}

function writeRawEntries(entries: SearchedSessionCar[]): void {
  if (typeof window === "undefined") return;
  const capped = entries.slice(0, MAX_SESSION_CAR_IDS).map((e) => {
    const vin = normalizeSavedCarVin(e.vin);
    return vin ? { carId: e.carId, vin } : { carId: e.carId };
  });
  sessionStorage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(capped));
}

/** Session history is only for logged-out users on the new car search flow. */
export function shouldUseSessionCarHistory(isAuthenticated: boolean): boolean {
  return getClientFeatureFlag("new_mme_feature_flag") && !isAuthenticated;
}

/** Full guest session car objects (ids + optional VIN). */
export function getSearchedSessionCars(): SearchedSessionCar[] {
  return readRawEntries();
}

export function getSearchedCarIds(): string[] {
  return readRawEntries().map((e) => e.carId);
}

/** VIN attached to a guest session car, or null. */
export function getSearchedCarVin(carId: string | null | undefined): string | null {
  const id = carId?.trim();
  if (!id) return null;
  const entry = readRawEntries().find((e) => e.carId === id);
  return normalizeSavedCarVin(entry?.vin);
}

/**
 * Set or clear VIN on an existing guest session car entry.
 * No-op if the car id is not in session history.
 */
export function setSearchedCarVin(
  carId: string | null | undefined,
  vin: string | null | undefined,
): void {
  const id = carId?.trim();
  if (!id || typeof window === "undefined") return;

  const entries = readRawEntries();
  const idx = entries.findIndex((e) => e.carId === id);
  if (idx < 0) return;

  const normalized = normalizeSavedCarVin(vin);
  const current = entries[idx]!;
  const next: SearchedSessionCar = normalized ? { carId: id, vin: normalized } : { carId: id };
  if ((current.vin ?? null) === (next.vin ?? null)) return;
  entries[idx] = next;
  writeRawEntries(entries);
}

/** Whether this Cars API id is already in session history. */
export function isSearchedCarIdInSession(carId: string): boolean {
  const id = String(carId).trim();
  if (!id) return false;
  return readRawEntries().some((e) => e.carId === id);
}

export function pushSearchedCarIds(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;

  const incoming = ids.map((id) => String(id).trim()).filter(Boolean);
  if (incoming.length === 0) return;

  const existing = readRawEntries();
  const byId = new Map(existing.map((e) => [e.carId, e]));
  const merged: SearchedSessionCar[] = [];
  const seen = new Set<string>();

  for (const id of [...incoming, ...existing.map((e) => e.carId)]) {
    if (seen.has(id)) continue;
    seen.add(id);
    // Preserve VIN when re-pushing an existing car id.
    merged.push(byId.get(id) ?? { carId: id });
    if (merged.length >= MAX_SESSION_CAR_IDS) break;
  }

  writeRawEntries(merged);
  clearGuestSelectionClearedFlag();
}

/** Append ids that are not already in session — does not reorder existing entries. */
export function ensureSearchedCarIds(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;

  const incoming = ids.map((id) => String(id).trim()).filter(Boolean);
  if (incoming.length === 0) return;

  // URL/active selection sync — re-enable hero/nav car context for guests.
  clearGuestSelectionClearedFlag();

  const existing = readRawEntries();
  const seen = new Set(existing.map((e) => e.carId));
  const merged = [...existing];

  for (const id of incoming) {
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push({ carId: id });
    if (merged.length >= MAX_SESSION_CAR_IDS) break;
  }

  if (merged.length === existing.length) return;
  writeRawEntries(merged);
}

/**
 * Banner URL→session sync for guest history.
 * - Legacy (E2E off): ensure all URL `carIds` (Sprint 35).
 * - E2E on + multi URL ids: ensure **only** `carIds[0]` (make+model saved car) and
 *   remove sibling URL ids from session so the dropdown does not list the same make+model twice.
 */
export function syncGuestSessionFromUrlCarIds(
  urlCarIds: string[],
  options?: { e2eSingleSave?: boolean },
): void {
  const trimmed = urlCarIds.map((id) => String(id).trim()).filter(Boolean);
  if (trimmed.length === 0) return;

  if (!options?.e2eSingleSave) {
    ensureSearchedCarIds(trimmed);
    return;
  }

  const primary = trimmed[0]!;
  ensureSearchedCarIds([primary]);
  for (const sibling of trimmed.slice(1)) {
    if (sibling !== primary) removeSearchedCarId(sibling);
  }
  // Multi URL ids → saved car is make+model representative (homepage edit needs this flag).
  if (trimmed.length >= 2 && trimmed.length <= 5) {
    syncE2ESavedCarMakeModelOnlyMeta(primary, trimmed);
  }
}

export function clearSearchedCarIds(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SEARCHED_CAR_IDS_SESSION_KEY);
}

export function removeSearchedCarId(idToRemove: string): void {
  if (typeof window === "undefined") return;
  const trimmed = idToRemove.trim();
  const next = readRawEntries().filter((e) => e.carId !== trimmed);
  writeRawEntries(next);
  if (getEditingSearchedCarId() === trimmed) {
    clearEditingSearchedCarId();
  }
  invalidateEditPrefillCache(trimmed);
  clearE2ESavedCarMeta(trimmed);
}

export function replaceSearchedCarId(oldId: string, newId: string): void {
  if (typeof window === "undefined") return;
  const from = oldId.trim();
  const to = newId.trim();
  if (!from || !to) return;

  const existing = readRawEntries();
  const movedVin = existing.find((e) => e.carId === from)?.vin;
  const next: SearchedSessionCar[] = [];
  const seen = new Set<string>();

  for (const entry of existing) {
    const carId = entry.carId === from ? to : entry.carId;
    if (!carId || seen.has(carId)) continue;
    seen.add(carId);
    if (carId === to) {
      // Prefer VIN that was on the old primary; keep existing new entry VIN if any.
      const vin = normalizeSavedCarVin(movedVin ?? entry.vin);
      next.push(vin ? { carId, vin } : { carId });
    } else {
      next.push(entry);
    }
    if (next.length >= MAX_SESSION_CAR_IDS) break;
  }

  writeRawEntries(next);
  clearGuestSelectionClearedFlag();
}

/**
 * Guest deselect: mark that history may remain but there is no active vehicle
 * for URL / hero / outbound nav until the user selects again.
 */
export function markGuestSelectionCleared(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SEARCHED_CAR_SELECTION_CLEARED_KEY, "1");
}

export function clearGuestSelectionClearedFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SEARCHED_CAR_SELECTION_CLEARED_KEY);
}

export function isGuestSelectionCleared(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SEARCHED_CAR_SELECTION_CLEARED_KEY) === "1";
}

export function setEditingSearchedCarId(id: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY, id);
}

/** Read editing id without clearing (sidebar prefill). */
export function getEditingSearchedCarId(): string | null {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY);
  return id && id.trim() ? id.trim() : null;
}

export function clearEditingSearchedCarId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY);
}

/** Clear abandoned edit context when guest opens an add flow (not edit). */
export function clearGuestEditingSearchedCarIdOnAddEntry(isAuthenticated: boolean): void {
  if (!shouldUseSessionCarHistory(isAuthenticated)) return;
  clearEditingSearchedCarId();
}

export function consumeEditingSearchedCarId(): string | null {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY);
  sessionStorage.removeItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY);
  return id && id.trim() ? id : null;
}

/** Wire session-car VIN into getE2ESavedCarVin without an import cycle. */
registerSessionCarVinLookup((carId) => getSearchedCarVin(carId));
