import { getPartsRouteSegmentForLang } from "@/config/url-segments";
import { LANG_COUNTRY_COMBINATIONS, DEFAULT_HOMEPAGE_LOCALE } from "@/config/locale-constants";
import { isValidPartIdForApi, normalizePartId } from "@/utils/part-id";
import { getCarIdsFromSearchParams, getVinFromSearchParams } from "@/utils/categorySearchUrl";
import type { ReadonlyURLSearchParams } from "next/navigation";
import slugify from "slugify";

export type BuildPartPdpHrefOptions = {
  makeModelTypeId?: string | null | undefined;
  /** Cars API id(s); comma-separated in URL when multiple. */
  carIds?: string | string[] | null | undefined;
  /** E2E VIN flow marker — append when present on listing/catalog URL. */
  vin?: string | null | undefined;
  seoName?: string | null | undefined;
};

function normalizeCarIdsForQuery(carIds: string | string[] | null | undefined): string | null {
  if (carIds == null) return null;
  const list = (Array.isArray(carIds) ? carIds : [carIds])
    .map((id) => String(id).trim())
    .filter(Boolean);
  return list.length > 0 ? list.join(",") : null;
}

function normalizeVinForQuery(vin: string | null | undefined): string | null {
  if (vin == null) return null;
  const trimmed = String(vin).trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

function appendPartPdpQuery(base: string, options: BuildPartPdpHrefOptions): string {
  const params = new URLSearchParams();
  const mme = options.makeModelTypeId?.trim();
  if (mme) params.set("makeModelTypeId", mme);
  const carIdsValue = normalizeCarIdsForQuery(options.carIds);
  if (carIdsValue) params.set("carIds", carIdsValue);
  const vinValue = normalizeVinForQuery(options.vin);
  if (vinValue) params.set("vin", vinValue);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Builds `/{locale}/{partsRoute}/{seoSlug}/{partId}` or null when partId is invalid.
 */
export function buildPartPdpHref(
  languageCountry: string,
  partId: string | number | null | undefined,
  options: BuildPartPdpHrefOptions = {},
): string | null {
  const id = normalizePartId(partId);
  if (!id || !isValidPartIdForApi(id)) return null;

  const locale = LANG_COUNTRY_COMBINATIONS.includes(languageCountry)
    ? languageCountry
    : DEFAULT_HOMEPAGE_LOCALE;
  const partsSeg = getPartsRouteSegmentForLang(locale.split("-")[0] || "en");
  const rawSeo = options.seoName?.trim() || "part";
  const seoSlug =
    slugify(rawSeo, {
      strict: true,
      trim: true,
    }) || "part";

  const base = `/${locale}/${partsSeg}/${seoSlug}/${id}`;
  return appendPartPdpQuery(base, options);
}

/** Resolve locale from pathname first segment, with fallback. */
export function localeFromPathname(pathname: string | null | undefined): string {
  const seg = (pathname || "").split("/").filter(Boolean)[0] || "";
  return LANG_COUNTRY_COMBINATIONS.includes(seg) ? seg : DEFAULT_HOMEPAGE_LOCALE;
}

export function buildPartPdpHrefFromPathname(
  pathname: string | null | undefined,
  partId: string | number | null | undefined,
  options: BuildPartPdpHrefOptions = {},
): string | null {
  return buildPartPdpHref(localeFromPathname(pathname), partId, options);
}

/**
 * Vehicle context from the current page URL for PDP navigation (SRP, L3 cards, recently viewed).
 */
export function partPdpOptionsFromSearchParams(
  searchParams: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
  options?: { includeCarIds?: boolean; makeModelTypeId?: string | null | undefined },
): Pick<BuildPartPdpHrefOptions, "makeModelTypeId" | "carIds" | "vin"> {
  const mme =
    options?.makeModelTypeId?.trim() || searchParams?.get("makeModelTypeId")?.trim() || undefined;
  const carIds =
    options?.includeCarIds && searchParams ? getCarIdsFromSearchParams(searchParams) : [];
  const vin = searchParams ? getVinFromSearchParams(searchParams) : null;
  return {
    makeModelTypeId: mme || undefined,
    carIds: carIds.length > 0 ? carIds : undefined,
    vin: vin || undefined,
  };
}
