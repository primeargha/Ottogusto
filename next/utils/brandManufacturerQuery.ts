/**
 * Brand+L3: part-brand manufacturer id.
 * Maps to POST /Parts `manufacturerIds` and search-results `manufacturerIds` — not vehicle `carIds`.
 *
 * Preferred source: `GET /Manufacturer/slug/{brandSlug}` → `id` (path), not the URL query.
 * Legacy URL `?brandId=` / `?carId=` are stripped to a clean path on Brand+L3.
 */
export const BRAND_MANUFACTURER_QUERY_KEY = "brandId" as const;
export const LEGACY_BRAND_MANUFACTURER_QUERY_KEY = "carId" as const;

type SearchParamsLike = {
  get(name: string): string | null;
};

/**
 * Read manufacturer id from Brand+L3 URL (legacy only).
 * Prefers `brandId`; falls back to legacy `carId`.
 */
export function getBrandManufacturerIdFromSearchParams(
  sp: SearchParamsLike | URLSearchParams | null | undefined,
): string | null {
  if (!sp) return null;
  const brandId = sp.get(BRAND_MANUFACTURER_QUERY_KEY)?.trim();
  if (brandId) return brandId;
  const legacy = sp.get(LEGACY_BRAND_MANUFACTURER_QUERY_KEY)?.trim();
  return legacy || null;
}

/** True when URL still carries manufacturer id as query (`brandId` or legacy `carId`). */
export function hasBrandManufacturerQuery(
  sp: SearchParamsLike | URLSearchParams | null | undefined,
): boolean {
  return Boolean(getBrandManufacturerIdFromSearchParams(sp));
}

/** @deprecated Use `hasBrandManufacturerQuery` — kept for older call sites. */
export function hasLegacyBrandManufacturerQueryOnly(
  sp: SearchParamsLike | URLSearchParams | null | undefined,
): boolean {
  if (!sp) return false;
  const brandId = sp.get(BRAND_MANUFACTURER_QUERY_KEY)?.trim();
  if (brandId) return false;
  return Boolean(sp.get(LEGACY_BRAND_MANUFACTURER_QUERY_KEY)?.trim());
}

/**
 * Brand+L3 href with vehicle context only (no manufacturer `brandId` / legacy `carId`).
 * Manufacturer id for Parts / SRP comes from the slug API, not the query string.
 */
export function buildBrandL3HrefWithVehicleOnly(
  path: string,
  searchParams?: {
    carIds?: string | string[];
    vin?: string;
  } | null,
): string {
  const qs = new URLSearchParams();
  const carIds = searchParams?.carIds;
  if (carIds) {
    const value = Array.isArray(carIds) ? carIds.join(",") : String(carIds);
    if (value.trim()) qs.set("carIds", value);
  }
  if (searchParams?.vin?.trim()) {
    qs.set("vin", searchParams.vin.trim());
  }
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}
