export const VIN_COMPAT_CACHE_KEY = "vin_compatibility_cache";

/** Legacy key — migrate once then remove. */
const LEGACY_VIN_COMPAT_CACHE_KEY = "ottogusto_vin_compatibility_cache";

export type VinCompatApiStatus = "Yes" | "No" | "Maybe";

/** Single VIN key → partId → API status (`Yes` | `No` | `Maybe`). */
export type VinCompatCache = Record<string, Record<string, VinCompatApiStatus>>;

function normalizeVinKey(vin: string): string {
  return vin.trim().toUpperCase();
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function migrateLegacyCacheIfNeeded(): void {
  if (!isBrowser()) return;

  try {
    if (localStorage.getItem(VIN_COMPAT_CACHE_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_VIN_COMPAT_CACHE_KEY);
    if (!legacy) return;
    localStorage.setItem(VIN_COMPAT_CACHE_KEY, legacy);
    localStorage.removeItem(LEGACY_VIN_COMPAT_CACHE_KEY);
  } catch {
    // Ignore localStorage errors.
  }
}

export function getVinCompatCache(): VinCompatCache {
  if (!isBrowser()) return {};

  try {
    migrateLegacyCacheIfNeeded();
    const raw = localStorage.getItem(VIN_COMPAT_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VinCompatCache;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeVinCompatCache(cache: VinCompatCache): void {
  if (!isBrowser()) return;

  try {
    if (!Object.keys(cache).length) {
      localStorage.removeItem(VIN_COMPAT_CACHE_KEY);
      return;
    }
    localStorage.setItem(VIN_COMPAT_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore localStorage errors.
  }
}

/** Returns the single cached VIN key, or null when cache is empty. */
export function getCachedVin(): string | null {
  const cache = getVinCompatCache();
  const keys = Object.keys(cache);
  return keys.length > 0 ? (keys[0] ?? null) : null;
}

export function getCachedPartsForVin(vin: string): Record<string, VinCompatApiStatus> {
  const cache = getVinCompatCache();
  return cache[normalizeVinKey(vin)] ?? {};
}

export function getCachedPartStatus(vin: string, partId: string): VinCompatApiStatus | null {
  const parts = getCachedPartsForVin(vin);
  return parts[partId] ?? null;
}

export function areAllPartsCached(vin: string, partIds: string[]): boolean {
  if (!partIds.length) return false;
  const parts = getCachedPartsForVin(vin);
  return partIds.every((id) => id in parts);
}

export function getUncachedPartIds(vin: string, partIds: string[]): string[] {
  const parts = getCachedPartsForVin(vin);
  return partIds.filter((id) => !(id in parts));
}

/** Replaces entire cache with one VIN entry (new verify with different VIN). */
export function setVinCompatCache(vin: string, parts: Record<string, VinCompatApiStatus>): void {
  const normalizedVin = normalizeVinKey(vin);
  if (!normalizedVin) return;
  writeVinCompatCache({ [normalizedVin]: { ...parts } });
}

/** Merges part statuses under an existing VIN (same VIN, additional parts). */
export function appendVinCompatCache(vin: string, parts: Record<string, VinCompatApiStatus>): void {
  const normalizedVin = normalizeVinKey(vin);
  if (!normalizedVin) return;

  const cache = getVinCompatCache();
  const existing = cache[normalizedVin] ?? {};
  writeVinCompatCache({
    ...cache,
    [normalizedVin]: { ...existing, ...parts },
  });
}

export function clearVinCompatCache(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(VIN_COMPAT_CACHE_KEY);
  } catch {
    // Ignore localStorage errors.
  }
}
