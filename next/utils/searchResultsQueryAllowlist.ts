import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ProductFilters } from "@/hooks/useUrlParams";
import { convertQueryParamsToObj } from "@/utils/queryParams";
import {
  evaluateFeatureFlag,
  getCountryCodeFromLanguageCountrySegment,
} from "@/utils/feature-flag-env";

/** Allowed URL query param names on search-results (`ProductFilters` keys). */
export type SearchResultsQueryParamKey = keyof ProductFilters;

/** Base keys for OD-1670 validation (excludes new-MME-only params). */
const PRODUCT_FILTER_KEYS_BASE: SearchResultsQueryParamKey[] = [
  "vendorId",
  "search",
  "name",
  "oeReference",
  "makeModelTypeId",
  "categoryId",
  "take",
  "minPrice",
  "maxPrice",
  "manufacturerIds",
  "order",
  "year",
  "cc",
  "fuel",
  "hp",
  "body",
  "doors",
  "variant",
  "availability",
  "brandId",
  "manufacturerTypes",
];

/**
 * Allowed product filter keys for search-results URL validation.
 * Includes `carIds` only when `new_mme_feature_flag` is enabled for the URL locale country
 * (`NEXT_PUBLIC_NEW_MME_FEATURE_FLAG`).
 */
export function getSearchResultsProductFilterKeys(
  languageCountrySegment: string | null | undefined,
): SearchResultsQueryParamKey[] {
  const country = languageCountrySegment
    ? getCountryCodeFromLanguageCountrySegment(languageCountrySegment)
    : null;
  if (evaluateFeatureFlag("new_mme_feature_flag", country)) {
    const keys: SearchResultsQueryParamKey[] = [...PRODUCT_FILTER_KEYS_BASE, "carIds"];
    if (evaluateFeatureFlag("end_to_end_vin_flow_feature_flag", country)) {
      keys.push("vin");
    }
    return keys;
  }
  return [...PRODUCT_FILTER_KEYS_BASE];
}

/**
 * Base list only (no `carIds`). Prefer `getSearchResultsProductFilterKeys(locale)` for validation.
 * Kept for backward compatibility and re-exports.
 */
export const productFilterKeys: SearchResultsQueryParamKey[] = [...PRODUCT_FILTER_KEYS_BASE];

const ALLOWED_TRACKING_PARAM_KEYS = new Set([
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);

export function isAllowedTrackingParam(key: string): boolean {
  return ALLOWED_TRACKING_PARAM_KEYS.has(key) || key.startsWith("gad_");
}

/** Appends only marketing/tracking params allowed on the search-results page. */
export function appendAllowedTrackingParamsToQueryString(
  queryString: string,
  sp: ReadonlyURLSearchParams | null,
): string {
  if (!sp) return queryString;
  const extra = new URLSearchParams();
  sp.forEach((value, key) => {
    if (!isAllowedTrackingParam(key) || value === "") return;
    extra.append(key, value);
  });
  const extraStr = extra.toString();
  if (!extraStr) return queryString;
  if (!queryString) return `?${extraStr}`;
  return queryString.startsWith("?") ? `${queryString}&${extraStr}` : `?${queryString}&${extraStr}`;
}

/**
 * Reads only allowed product filter keys from the URL (does not set `oeReference` — caller sets it).
 * Pass `language-country` first path segment (e.g. `en-BE`) so `carIds` is picked when new MME flag is on.
 */
export function pickSearchResultsAllowedProductFiltersFromSearchParams(
  sp: ReadonlyURLSearchParams | null,
  languageCountrySegment?: string | null,
): Partial<ProductFilters> {
  if (!sp) return {};
  const raw = convertQueryParamsToObj(sp.toString());
  const out: Partial<ProductFilters> = {};
  const allowedKeys = getSearchResultsProductFilterKeys(languageCountrySegment ?? null);

  const vendorRaw = raw.vendorId;
  if (vendorRaw != null && String(vendorRaw).trim() !== "") {
    const n = Number(vendorRaw);
    if (!Number.isNaN(n)) out.vendorId = n;
  }

  const searchVal = raw.search;
  if (searchVal != null && String(searchVal).trim() !== "") {
    out.search = String(searchVal);
  }
  const nameVal = raw.name;
  if (nameVal != null && String(nameVal).trim() !== "") {
    out.name = String(nameVal);
  }

  const mmyt = raw.makeModelTypeId;
  if (mmyt != null && String(mmyt).trim() !== "") {
    out.makeModelTypeId = String(mmyt);
  }

  if (raw.categoryId != null && String(raw.categoryId).trim() !== "") {
    out.categoryId = String(raw.categoryId).trim();
  }

  const takeRaw = raw.take;
  if (takeRaw != null && String(takeRaw).trim() !== "" && !Number.isNaN(Number(takeRaw))) {
    out.take = Number(takeRaw);
  }

  if (raw.minPrice != null && String(raw.minPrice).trim() !== "") {
    const n = Number(raw.minPrice);
    if (!Number.isNaN(n)) out.minPrice = n;
  }
  if (raw.maxPrice != null && String(raw.maxPrice).trim() !== "") {
    const n = Number(raw.maxPrice);
    if (!Number.isNaN(n)) out.maxPrice = n;
  }

  if (raw.manufacturerIds != null && String(raw.manufacturerIds).trim() !== "") {
    out.manufacturerIds = raw.manufacturerIds as ProductFilters["manufacturerIds"];
  }

  if (raw.order != null && String(raw.order).trim() !== "") {
    const rawOrder = String(raw.order);
    out.order =
      rawOrder === "ASC" || rawOrder === "DESC" || rawOrder === "priority" ? rawOrder : "priority";
  }

  const y = raw.year;
  if (y !== undefined && y !== null && String(y).trim() !== "" && String(y) !== "undefined") {
    out.year = String(y);
  }

  const ccVal = raw.cc;
  if (ccVal != null && String(ccVal).trim() !== "") out.cc = String(ccVal);
  const fuelVal = raw.fuel;
  if (fuelVal != null && String(fuelVal).trim() !== "") out.fuel = String(fuelVal);
  const hpVal = raw.hp;
  if (hpVal != null && String(hpVal).trim() !== "") out.hp = String(hpVal);
  const bodyVal = raw.body;
  if (bodyVal != null && String(bodyVal).trim() !== "") out.body = String(bodyVal);
  const doorsVal = raw.doors;
  if (doorsVal != null && String(doorsVal).trim() !== "") out.doors = String(doorsVal);
  const variantVal = raw.variant;
  if (variantVal != null && String(variantVal).trim() !== "") out.variant = String(variantVal);

  if (raw.availability != null && String(raw.availability).trim() !== "") {
    const a = raw.availability;
    out.availability = Array.isArray(a) ? a : String(a).split(",").filter(Boolean);
  }

  if (allowedKeys.includes("carIds") && raw.carIds != null && String(raw.carIds).trim() !== "") {
    const c = raw.carIds;
    out.carIds = Array.isArray(c) ? c : String(c).split(",").filter(Boolean);
  }

  if (allowedKeys.includes("vin") && raw.vin != null && String(raw.vin).trim() !== "") {
    out.vin = String(raw.vin).trim().toUpperCase();
  }

  return out;
}
