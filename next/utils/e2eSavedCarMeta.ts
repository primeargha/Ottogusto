/**
 * Frontend-only metadata for E2E VIN flow saved cars (**guest / session only**).
 *
 * Stored in **sessionStorage** (same lifetime as guest `searched_car_id`) so VIN /
 * sibling context survives login→logout the same way guest cars do. Legacy entries
 * in localStorage are migrated once on read.
 *
 * When the user applies with 2–5 `carIds`, we persist only `carIds[0]` (make+model
 * representative). Sibling ids are kept here so Find / dropdown / nav can restore
 * `?carIds=id0,id1,…` for listing filters.
 *
 * When the user saves via Search by VIN, we also store that VIN so homepage Find /
 * Edit can restore `?vin=` / sidebar VIN without relying on a live URL.
 *
 * Logged-in users use Garage `name` (`makeModelOnly` / `makeModelOnly:id0,id1,…`)
 * and Garage `vin` instead.
 */

import { VALID_VIN_REGEX } from "@/utils/vinCheck";

export const E2E_SAVED_CAR_META_KEY = "e2e_saved_car_meta";

/**
 * Optional lookup for VIN stored on the guest session car object.
 * Registered from searchedCarIdsSession to avoid import/no-cycle.
 */
type SessionCarVinLookup = (carId: string) => string | null;
let sessionCarVinLookup: SessionCarVinLookup | null = null;

export function registerSessionCarVinLookup(lookup: SessionCarVinLookup): void {
  sessionCarVinLookup = lookup;
}

/** Garage POST/GET sentinel prefix: logged-in car was saved from a 2–5 `carIds` resolve. */
export const E2E_GARAGE_MAKE_MODEL_ONLY_NAME = "makeModelOnly";

const GARAGE_MAKE_MODEL_ONLY_WITH_IDS_PREFIX = `${E2E_GARAGE_MAKE_MODEL_ONLY_NAME}:`;

export function isE2EGarageMakeModelOnlyName(name: string | null | undefined): boolean {
  const raw = name?.trim() ?? "";
  if (!raw) return false;
  return (
    raw === E2E_GARAGE_MAKE_MODEL_ONLY_NAME ||
    raw.startsWith(GARAGE_MAKE_MODEL_ONLY_WITH_IDS_PREFIX)
  );
}

/** Normalize a carIds list for storage / URL (unique, max 5). */
export function normalizeE2ESiblingCarIds(carIds: string[] | null | undefined): string[] {
  if (!Array.isArray(carIds)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of carIds) {
    const id = String(raw).trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= 5) break;
  }
  return out;
}

/**
 * Garage `name` for make+model-only saves:
 * - length 2–5 → `makeModelOnly:id0,id1,…` (full filter set)
 * - legacy / no ids → `makeModelOnly`
 * - single-id clear → caller sends `null`
 */
export function encodeGarageMakeModelOnlyName(resolvedCarIds: string[] | null | undefined): string {
  const ids = normalizeE2ESiblingCarIds(resolvedCarIds);
  if (ids.length >= 2 && ids.length <= 5) {
    return `${E2E_GARAGE_MAKE_MODEL_ONLY_NAME}:${ids.join(",")}`;
  }
  return E2E_GARAGE_MAKE_MODEL_ONLY_NAME;
}

/** Parse sibling / full filter carIds from Garage `name` (null if not makeModelOnly or legacy flag-only). */
export function parseGarageMakeModelOnlyCarIds(name: string | null | undefined): string[] | null {
  const raw = name?.trim() ?? "";
  if (!raw.startsWith(GARAGE_MAKE_MODEL_ONLY_WITH_IDS_PREFIX)) return null;
  const ids = normalizeE2ESiblingCarIds(
    raw.slice(GARAGE_MAKE_MODEL_ONLY_WITH_IDS_PREFIX.length).split(","),
  );
  return ids.length >= 2 ? ids : null;
}

export type E2ESavedCarMetaEntry = {
  /** True when this car was saved from a 2–5 `carIds` resolve (make+model only). */
  makeModelOnly?: boolean;
  /** 17-char VIN when this car was saved via Search by VIN. */
  vin?: string;
  /**
   * Full resolved `carIds` (2–5) from the apply response, including primary `[0]`.
   * Used to restore multi-id URL filters after homepage / dropdown / nav.
   */
  siblingCarIds?: string[];
};

type E2ESavedCarMetaMap = Record<string, E2ESavedCarMetaEntry>;

function parseMetaMap(raw: string | null): E2ESavedCarMetaMap {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as E2ESavedCarMetaMap;
  } catch {
    return {};
  }
}

/**
 * Guest meta lives in sessionStorage with `searched_car_id`.
 * One-time migrate from legacy localStorage so older VIN context is not lost.
 */
function readMap(): E2ESavedCarMetaMap {
  try {
    if (typeof sessionStorage === "undefined") return {};

    const fromSession = parseMetaMap(sessionStorage.getItem(E2E_SAVED_CAR_META_KEY));
    if (Object.keys(fromSession).length > 0) return fromSession;

    if (typeof localStorage === "undefined") return {};
    const fromLocal = parseMetaMap(localStorage.getItem(E2E_SAVED_CAR_META_KEY));
    if (Object.keys(fromLocal).length === 0) return {};

    sessionStorage.setItem(E2E_SAVED_CAR_META_KEY, JSON.stringify(fromLocal));
    localStorage.removeItem(E2E_SAVED_CAR_META_KEY);
    return fromLocal;
  } catch {
    return {};
  }
}

function writeMap(map: E2ESavedCarMetaMap): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(E2E_SAVED_CAR_META_KEY, JSON.stringify(map));
    // Avoid split-brain with legacy localStorage copies.
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(E2E_SAVED_CAR_META_KEY);
    }
  } catch {
    // Quota / private mode — prefill falls back to URL-only rules.
  }
}

/** Keep only meaningful fields; drop empty entries from the map. */
function pruneEntry(entry: E2ESavedCarMetaEntry): E2ESavedCarMetaEntry | null {
  const next: E2ESavedCarMetaEntry = {};
  if (entry.makeModelOnly === true) next.makeModelOnly = true;
  const vin = normalizeSavedCarVin(entry.vin);
  if (vin) next.vin = vin;
  const siblings = normalizeE2ESiblingCarIds(entry.siblingCarIds);
  if (siblings.length >= 2) next.siblingCarIds = siblings;
  return Object.keys(next).length > 0 ? next : null;
}

function writeEntry(carId: string, entry: E2ESavedCarMetaEntry | null): void {
  const map = readMap();
  const pruned = entry ? pruneEntry(entry) : null;
  if (!pruned) {
    if (!map[carId]) return;
    delete map[carId];
    writeMap(map);
    return;
  }
  map[carId] = pruned;
  writeMap(map);
}

/** Normalize + validate a stored / Garage VIN for URL / sidebar use. */
export function normalizeSavedCarVin(vin: string | null | undefined): string | null {
  const v = vin?.trim().toUpperCase() ?? "";
  if (v.length !== 17 || !VALID_VIN_REGEX.test(v)) return null;
  return v;
}

export function isE2ESavedCarMakeModelOnly(carId: string | null | undefined): boolean {
  const id = carId?.trim();
  if (!id) return false;
  return readMap()[id]?.makeModelOnly === true;
}

export function getE2ESavedCarVin(carId: string | null | undefined): string | null {
  const id = carId?.trim();
  if (!id) return null;
  // Prefer VIN on the guest session car object (same lifetime as searched_car_id).
  const fromSession = sessionCarVinLookup?.(id) ?? null;
  if (fromSession) return fromSession;
  return normalizeSavedCarVin(readMap()[id]?.vin);
}

/**
 * Guest: full filter `carIds` (2–5) stored with the primary saved car, or null if single / missing.
 */
export function getE2ESavedCarSiblingCarIds(carId: string | null | undefined): string[] | null {
  const id = carId?.trim();
  if (!id) return null;
  const siblings = normalizeE2ESiblingCarIds(readMap()[id]?.siblingCarIds);
  if (siblings.length < 2) return null;
  // Ensure primary is first when stored list still includes it.
  if (siblings[0] === id) return siblings;
  const withoutPrimary = siblings.filter((x) => x !== id);
  return normalizeE2ESiblingCarIds([id, ...withoutPrimary]);
}

/**
 * Guest only: attach or clear VIN context for a saved Cars API id.
 * Pass `null` / empty to clear VIN while preserving `makeModelOnly` when set.
 */
export function setE2ESavedCarVin(
  carId: string | null | undefined,
  vin: string | null | undefined,
): void {
  const id = carId?.trim();
  if (!id) return;

  const existing = readMap()[id] ?? {};
  const normalized = normalizeSavedCarVin(vin);
  if (normalized) {
    writeEntry(id, { ...existing, vin: normalized });
    return;
  }

  const { vin: _removed, ...rest } = existing;
  writeEntry(id, rest);
}

/**
 * After an E2E save/apply: mark (or clear) make+model-only + sibling ids for the persisted id.
 * Uses the **resolved** `carIds` length (before slicing to `[0]` for storage).
 * **Merges** with existing entry so VIN metadata is not wiped.
 * **Guest only** — logged-in uses Garage `name`.
 */
export function syncE2ESavedCarMakeModelOnlyMeta(
  persistedCarId: string | null | undefined,
  resolvedCarIds: string[] | null | undefined,
): void {
  const id = persistedCarId?.trim();
  if (!id) return;

  const siblings = normalizeE2ESiblingCarIds(resolvedCarIds);
  const n = siblings.length;

  const existing = readMap()[id] ?? {};
  if (n >= 2 && n <= 5) {
    writeEntry(id, { ...existing, makeModelOnly: true, siblingCarIds: siblings });
    return;
  }

  // Single linked car (or empty / >5 not applied) → full deep prefill; keep vin if present.
  const { makeModelOnly: _cleared, siblingCarIds: _siblings, ...rest } = existing;
  writeEntry(id, rest);
}

/** Drop metadata when a car is deleted from session / Garage. */
export function clearE2ESavedCarMeta(carId: string | null | undefined): void {
  const id = carId?.trim();
  if (!id) return;
  const map = readMap();
  if (!map[id]) return;
  delete map[id];
  writeMap(map);
}

/**
 * Guest edit replace: move make+model-only / VIN / sibling meta from old Cars API id to the new one.
 * If the new apply was single-id, caller should `syncE2ESavedCarMakeModelOnlyMeta` after.
 */
export function transferE2ESavedCarMeta(
  oldCarId: string | null | undefined,
  newCarId: string | null | undefined,
): void {
  const from = oldCarId?.trim();
  const to = newCarId?.trim();
  if (!from || !to || from === to) return;

  const map = readMap();
  const entry = map[from];
  if (!entry) return;
  delete map[from];

  const siblings = normalizeE2ESiblingCarIds(entry.siblingCarIds);
  const nextEntry: E2ESavedCarMetaEntry = { ...entry };
  if (siblings.length >= 2) {
    // Replace old primary with new; keep remaining filter siblings.
    nextEntry.siblingCarIds = normalizeE2ESiblingCarIds([
      to,
      ...siblings.filter((id) => id !== from && id !== to),
    ]);
  }
  map[to] = nextEntry;
  writeMap(map);
}

/**
 * URL `carIds` for a saved primary id: sibling list (2–5) when known, else `[primary]`.
 */
export function resolveUrlCarIdsForSavedCar(
  primaryCarId: string | null | undefined,
  options?: {
    getSiblingCarIds?: (carId: string) => string[] | null;
  },
): string[] {
  const primary = primaryCarId?.trim();
  if (!primary) return [];
  const siblings = options?.getSiblingCarIds?.(primary) ?? getE2ESavedCarSiblingCarIds(primary);
  if (siblings && siblings.length >= 2) {
    return siblings[0] === primary
      ? siblings
      : normalizeE2ESiblingCarIds([primary, ...siblings.filter((id) => id !== primary)]);
  }
  return [primary];
}
