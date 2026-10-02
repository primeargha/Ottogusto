/**
 * OD-2305: Legacy PDP URLs `/{locale}/part/{slug?}/{partId}`.
 * Pure helpers for middleware (Edge-safe) — unit-testable without NextRequest.
 */

import {
  DEFAULT_HOMEPAGE_LOCALE,
  LANG_COUNTRY_COMBINATIONS,
  LANG_TO_DEFAULT_LOCALE,
} from "@/config/locale-constants";
import { getPartsRouteSegmentForLang } from "@/config/url-segments";
import { isValidPartIdForApi } from "@/utils/part-id";

export type LegacyPartPdpCandidate = {
  locale: string;
  /** Present for `/{locale}/part/{slug}/{partId}`; null for older `/{locale}/part/{partId}`. */
  slug: string | null;
  partid: string;
};

function normalizePathSegments(pathname: string): string[] {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized.split("/").filter(Boolean);
}

function normalizeLanguage(value: string | null | undefined): "en" | "nl" | "fr" | "de" {
  const lang = (value || "").toLowerCase();
  if (lang === "nl") return "nl";
  if (lang === "fr") return "fr";
  if (lang === "de") return "de";
  return "en";
}

/** True when second path segment is the literal legacy route `part`. */
export function isLegacyPartUrl(pathname: string): boolean {
  const segments = normalizePathSegments(pathname);
  return segments.length >= 2 && (segments[1] ?? "").toLowerCase() === "part";
}

/**
 * Parse crawlable legacy PDP shapes:
 * - `/{locale}/part/{slug}/{partId}` (OD-832)
 * - `/{locale}/part/{partId}` (Apr 2025)
 * Returns null when shape is wrong or partId fails API validation.
 */
export function parseLegacyPartPdpCandidate(pathname: string): LegacyPartPdpCandidate | null {
  const segments = normalizePathSegments(pathname);
  if (segments.length < 3) return null;

  const locale = segments[0] ?? "";
  const routeSeg = (segments[1] ?? "").toLowerCase();
  if (!locale || routeSeg !== "part") return null;

  let slug: string | null = null;
  let partid = "";

  if (segments.length === 3) {
    partid = segments[2] ?? "";
  } else if (segments.length === 4) {
    slug = segments[2] ?? null;
    partid = segments[3] ?? "";
  } else {
    return null;
  }

  if (!partid || !isValidPartIdForApi(partid)) return null;

  return { locale, slug, partid };
}

/**
 * Map phantom locales (`en-EU`, …) to a configured market.
 * Valid allowlisted locales are kept as-is.
 */
export function resolveCanonicalLocaleForLegacyPart(incomingLocale: string): string {
  const raw = (incomingLocale || "").trim();
  if (!raw) return DEFAULT_HOMEPAGE_LOCALE;

  if (LANG_COUNTRY_COMBINATIONS.includes(raw)) return raw;

  // Case-insensitive allowlist match (e.g. en-be → en-BE)
  const lower = raw.toLowerCase();
  const matched = LANG_COUNTRY_COMBINATIONS.find((lc) => lc.toLowerCase() === lower);
  if (matched) return matched;

  const lang = normalizeLanguage(raw.split("-")[0] || "en");
  return LANG_TO_DEFAULT_LOCALE[lang] || DEFAULT_HOMEPAGE_LOCALE;
}

/** Middleware-safe manufacturer slug for PDP path segment. */
export function slugifyManufacturerForPdp(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .replaceAll("+", "plus")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

/** Build live PDP path: `/{locale}/{parts-segment}/{manufacturerSlug}/{partId}`. */
export function buildCanonicalPartPdpPath(
  locale: string,
  manufacturerSlug: string,
  partid: string,
): string {
  const resolvedLocale = resolveCanonicalLocaleForLegacyPart(locale);
  const lang = normalizeLanguage(resolvedLocale.split("-")[0] || "en");
  const partsSeg = getPartsRouteSegmentForLang(lang);
  const slug = slugifyManufacturerForPdp(manufacturerSlug) || "manufacturer";
  return `/${resolvedLocale}/${partsSeg}/${slug}/${partid}`;
}
