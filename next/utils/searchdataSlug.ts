import slugify from "slugify";

/**
 * [searchdata] segment is either:
 * - An allowed non-MME slug (e.g. "search-results" for generic search), or
 * - An MME slug: brand-model-type from slugify(brandName, modelName, typeName with "+" → "plus").
 * Validation is done server-side (segment + makeModelTypeId vs slug) and client-side (seoUrl vs searchdata).
 * If not allowed slug and no matching makeModelTypeId → 404.
 */
export const ALLOWED_SEARCHDATA_SLUGS: readonly string[] = ["search-results"];

/**
 * Builds the canonical [searchdata] slug from car API data.
 * Must match the format used in useMmeStore (generateMmeSearchData) and useUrlParams (carInfoRedirection).
 * Server-safe (no browser APIs).
 */
export function buildSearchdataSlugFromCarData(data: {
  brandName?: string | null;
  modelName?: string | null;
  typeName?: string | null;
}): string {
  const typePart = (data.typeName ?? "").replaceAll("+", "plus");
  return slugify([data.brandName, data.modelName, typePart].filter(Boolean).join("-"), {
    strict: true,
    trim: true,
  });
}

/**
 * Returns true if the segment is a valid [searchdata] value: either in the allow list
 * or would match an MME slug (caller must compare built slug === segment when makeModelTypeId is present).
 */
export function isAllowedSearchdataSegment(segment: string): boolean {
  return ALLOWED_SEARCHDATA_SLUGS.includes(segment);
}
