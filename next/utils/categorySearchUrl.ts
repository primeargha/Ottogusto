import type { ReadonlyURLSearchParams } from "next/navigation";

import { Routes } from "@/config/routes";
import { pathnameIncludesPartsRouteSegment } from "@/config/url-segments";
import { OTHER_CATEGORY_ID } from "@/constants";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { parseSingleCategoryId } from "@/utils/singleCategoryFilter";

/** Query key for single category filter (search results). */

export const CATEGORY_ID_QUERY_KEY = "categoryId";

/** Read single category id from URL. */

export function getCategoryIdFromSearchParams(
  sp: ReadonlyURLSearchParams | null | undefined,
): string | null {
  if (!sp) return null;

  return parseSingleCategoryId(sp.get(CATEGORY_ID_QUERY_KEY));
}

/** Pick the most specific category id when multiple ids are available (longest id wins). */

export function pickPrimaryCategoryId(ids: (string | null | undefined)[]): string | null {
  const valid = ids.filter((id): id is string => typeof id === "string" && id.trim() !== "");

  if (valid.length === 0) return null;

  return [...valid].sort((a, b) => b.length - a.length)[0] ?? null;
}

export type CategorySearchQueryOptions = {
  categoryId: string;

  /** Cars API id(s) for new-MME search-results (comma-separated in URL). */
  carIds?: string | string[] | null;

  /**
   * E2E VIN search marker only — persist on SRP URL; never sent to Parts filter API.
   * 17-char VIN when `end_to_end_vin_flow_feature_flag` search used VIN.
   */
  vin?: string | null;

  manufacturerIds?: string | null;

  take?: string;

  order?: string;
};

function normalizeCarIdsQueryValue(carIds: string | string[] | null | undefined): string | null {
  if (carIds == null) return null;
  const list = (Array.isArray(carIds) ? carIds : [carIds])
    .map((id) => String(id).trim())
    .filter(Boolean);
  return list.length > 0 ? list.join(",") : null;
}

function normalizeVinQueryValue(vin: string | null | undefined): string | null {
  if (vin == null) return null;
  const trimmed = String(vin).trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

/** Build query string for search-results redirects. */

export function buildCategorySearchQueryString(options: CategorySearchQueryOptions): string {
  const query = new URLSearchParams();

  query.set(CATEGORY_ID_QUERY_KEY, options.categoryId);

  query.set("take", options.take ?? "12");

  query.set("order", options.order ?? "priority");

  const carIdsValue = normalizeCarIdsQueryValue(options.carIds);
  if (carIdsValue) {
    query.set("carIds", carIdsValue);
  }

  const vinValue = normalizeVinQueryValue(options.vin);
  if (vinValue) {
    query.set("vin", vinValue);
  }

  if (options.manufacturerIds) {
    query.set("manufacturerIds", options.manufacturerIds);
  }

  return query.toString();
}

/** Append category search query to a base path (handles existing `?` in base). */

export function appendCategorySearchQuery(
  basePath: string,

  options: CategorySearchQueryOptions,
): string {
  const qs = buildCategorySearchQueryString(options);

  const separator = basePath.includes("?") ? "&" : "?";

  return `${basePath}${separator}${qs}`;
}

/**
 * Brand landing with zero brand-scoped categories → search-results for that manufacturer.
 * `categoryId=000000000` (Other) + `manufacturerIds={brandId}`.
 */
export function buildBrandEmptyCategoriesSrpHref(
  languageCountry: string,
  manufacturerId: string,
): string {
  const id = manufacturerId?.trim();
  const base = Routes.searchresults(languageCountry).replace(/\/+$/, "");
  return appendCategorySearchQuery(base, {
    categoryId: OTHER_CATEGORY_ID,
    ...(id ? { manufacturerIds: id } : {}),
    take: "12",
    order: "priority",
  });
}

export type VehicleContextQuery = {
  carIds?: string | string[] | null;
  /** URL-only VIN search marker (not a Parts filter field). */
  vin?: string | null;
};

/** Read `carIds` from URL search params (comma-separated). */
export function getCarIdsFromSearchParams(
  sp: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
): string[] {
  if (!sp) return [];
  return parseCarIdsParam(sp.get("carIds"));
}

/** Read `vin` from URL (E2E VIN flow marker). */
export function getVinFromSearchParams(
  sp: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
): string | null {
  if (!sp) return null;
  return normalizeVinQueryValue(sp.get("vin"));
}

/** Active car ids for outbound nav: URL `carIds` then hero slider (new MME only). */
export function resolveNavigationCarIds(options: {
  searchParams?: ReadonlyURLSearchParams | URLSearchParams | null;
  heroCarsApiId?: string | null;
  enabled: boolean;
}): string[] {
  if (!options.enabled) return [];
  const fromUrl = getCarIdsFromSearchParams(options.searchParams);
  if (fromUrl.length > 0) return fromUrl;
  const hero = options.heroCarsApiId?.trim();
  return hero ? [hero] : [];
}

/**
 * VIN for outbound nav (E2E only): URL `vin` first, else lookup for the active nav car
 * (guest meta / Garage). Search-by-car cars return null — do not invent a VIN.
 */
export function resolveNavigationVin(options: {
  searchParams?: ReadonlyURLSearchParams | URLSearchParams | null;
  /** Already-resolved navigation `carIds` (URL or hero). */
  carIds: string[];
  /** Return stored VIN for a Cars API id, or null. */
  getVinForCarId: (carId: string) => string | null;
  enabled: boolean;
}): string | null {
  if (!options.enabled) return null;
  const fromUrl = getVinFromSearchParams(options.searchParams);
  if (fromUrl) return fromUrl;
  const primary = options.carIds[0]?.trim();
  if (!primary) return null;
  return normalizeVinQueryValue(options.getVinForCarId(primary));
}

function shouldAppendNavigationCarIds(pathname: string): boolean {
  if (pathnameIncludesPartsRouteSegment(pathname)) return true;
  return pathname.includes("/search-results");
}

/** Append resolved `carIds` (+ optional URL `vin`) to href for parts/catalog/category or search-results routes. */
export function appendNavigationCarIdsToPartsHref(
  href: string,
  carIds: string[],
  vin?: string | null,
): string {
  if (!href || href === "#" || carIds.length === 0) return href;
  try {
    const path = new URL(href, "http://local").pathname;
    if (!shouldAppendNavigationCarIds(path)) return href;
  } catch {
    return href;
  }
  return appendVehicleContextToHref(href, { carIds, vin: vin ?? null });
}

/** Localized category catalog path, e.g. `/en-BE/car-parts/`. */
export function buildPartsCatalogPath(languageCountry: string): string {
  return Routes.parts(languageCountry);
}

/** Catalog URL with `carIds` and optional `vin` (Phase 4b / E2E header–hamburger). */
export function buildPartsCatalogUrl(
  languageCountry: string,
  carIds: string | string[],
  vin?: string | null,
): string {
  const base = buildPartsCatalogPath(languageCountry);
  return appendVehicleContextToHref(base, { carIds, vin: vin ?? null });
}

/** Append `carIds` and optional `vin` to an existing href (breadcrumbs, SEO links, browse→SRP). */
export function appendVehicleContextToHref(href: string, context: VehicleContextQuery): string {
  if (!href || href === "#") return href;

  const hashIndex = href.indexOf("#");
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";

  const qIndex = withoutHash.indexOf("?");
  const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  const params = new URLSearchParams(qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "");

  const carIdsValue = normalizeCarIdsQueryValue(context.carIds);
  if (carIdsValue) {
    params.set("carIds", carIdsValue);
  }

  // Explicit `vin: null` clears a stale VIN when switching to a non-VIN saved car.
  if (Object.prototype.hasOwnProperty.call(context, "vin")) {
    const vinValue = normalizeVinQueryValue(context.vin);
    if (vinValue) {
      params.set("vin", vinValue);
    } else {
      params.delete("vin");
    }
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}${hash}` : `${path}${hash}`;
}

/** Breadcrumb / link context from URL (`carIds` + `vin` when present). */
export function getVehicleContextFromSearchParams(
  sp: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
  options: { includeCarIds: boolean },
): VehicleContextQuery {
  const vin = getVinFromSearchParams(sp);
  if (!options.includeCarIds) {
    return vin ? { vin } : {};
  }
  const carIds = getCarIdsFromSearchParams(sp);
  return {
    carIds: carIds.length > 0 ? carIds : null,
    ...(vin ? { vin } : {}),
  };
}

/**
 * Copy current-page URL `carIds` and/or `vin` onto a destination href.
 * Used for shopping-cart (and checkout round-trip) so PDP vehicle query is not dropped.
 * Does not invent VIN or carIds from session, Garage, or hero.
 */
export function appendCurrentVehicleQueryToHref(
  href: string,
  searchParams: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
): string {
  if (!href || href === "#") return href;
  return appendVehicleContextToHref(
    href,
    getVehicleContextFromSearchParams(searchParams, { includeCarIds: true }),
  );
}
