/**
 * Single source of truth for locale-specific URL path segments under `[language-country]/`.
 * Used by route builders, middleware, hreflang, and pathname detection.
 *
 * @see docs/lang-based-dynamic-urls.md
 */

import { LANG_COUNTRY_COMBINATIONS } from "./locale-constants";

export type PartsLangKey = "en" | "nl" | "fr" | "de";

export const PARTS_ROUTE_SEGMENT_BY_LANG = {
  en: "car-parts",
  nl: "auto-onderdelen",
  fr: "pieces-auto",
  de: "autoteile",
} as const satisfies Record<PartsLangKey, string>;

export const CATEGORY_ROUTE_SEGMENT_BY_LANG = {
  en: "category",
  nl: "categorie",
  fr: "categorie",
  de: "kategorie",
} as const satisfies Record<PartsLangKey, string>;

/** Canonical App Router folder names under `[language-country]/` (rewrite targets). */
export const CANONICAL_PARTS_APP_SEGMENT = "car-parts";
export const CANONICAL_CATEGORY_APP_SEGMENT = "category";
export const CANONICAL_MANUFACTURERS_APP_SEGMENT = "manufacturers";

export type PartsRouteSegment = (typeof PARTS_ROUTE_SEGMENT_BY_LANG)[PartsLangKey];

export function normalizePartsLangKey(lang: string): PartsLangKey {
  const key = (lang.split("-")[0] ?? "en").toLowerCase();
  if (key === "nl") return "nl";
  if (key === "fr") return "fr";
  if (key === "de") return "de";
  return "en";
}

export function getPartsRouteSegmentForLang(lang: string): PartsRouteSegment {
  return PARTS_ROUTE_SEGMENT_BY_LANG[normalizePartsLangKey(lang)];
}

export function getCategoryRouteSegmentForLang(lang: string): string {
  return CATEGORY_ROUTE_SEGMENT_BY_LANG[normalizePartsLangKey(lang)];
}

/** Public Car Part Brands list/landing path (rewritten to app folder `manufacturers`). */
export const MANUFACTURERS_ROUTE_SEGMENT_BY_LANG = {
  en: "car-parts-brands",
  nl: "auto-onderdelen-merken",
  fr: "auto-pieces-marques",
  de: "autoteile-marken",
} as const satisfies Record<PartsLangKey, string>;

export type ManufacturersRouteSegment = (typeof MANUFACTURERS_ROUTE_SEGMENT_BY_LANG)[PartsLangKey];

export function getManufacturersRouteSegmentForLang(lang: string): ManufacturersRouteSegment {
  return MANUFACTURERS_ROUTE_SEGMENT_BY_LANG[normalizePartsLangKey(lang)];
}

export const ALL_MANUFACTURERS_ROUTE_SEGMENTS: readonly ManufacturersRouteSegment[] = Array.from(
  new Set(Object.values(MANUFACTURERS_ROUTE_SEGMENT_BY_LANG)),
);

/** Legacy Manufacturer landing page → new Car Part Brands landing page, localized per locale. */
export const LEGACY_MANUFACTURERS_ROUTE_SEGMENT_BY_LANG = {
  en: "manufacturers",
  nl: "fabrikant",
  fr: "fabricant",
  de: "hersteller",
} as const satisfies Record<PartsLangKey, string>;

export function getLegacyManufacturersRouteSegmentForLang(lang: string): string {
  return LEGACY_MANUFACTURERS_ROUTE_SEGMENT_BY_LANG[normalizePartsLangKey(lang)];
}

export function isKnownManufacturersRouteSegment(segment: string): boolean {
  if (segment === CANONICAL_MANUFACTURERS_APP_SEGMENT) return true;
  return ALL_MANUFACTURERS_ROUTE_SEGMENTS.includes(segment as ManufacturersRouteSegment);
}

/** True if pathname is the Car Part Brands list (public localized segment or rewritten app folder). */
export function pathnameIncludesManufacturersRouteSegment(
  pathname: string | null | undefined,
  languageCountry?: string,
): boolean {
  if (!pathname) return false;
  if (pathname.includes(`/${CANONICAL_MANUFACTURERS_APP_SEGMENT}`)) return true;
  if (languageCountry) {
    const expected = getManufacturersRouteSegmentForLang(languageCountry);
    return pathname.includes(`/${expected}`);
  }
  return ALL_MANUFACTURERS_ROUTE_SEGMENTS.some(
    (seg) => pathname.includes(`/${seg}/`) || pathname.endsWith(`/${seg}`),
  );
}

/** Rewrites legacy manufacturers route segments to the canonical app folder segment. */
export function getLegacyManufacturersRedirectPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [locale, seg] = segments;
  if (!locale || !seg) return null;
  if (!LANG_COUNTRY_COMBINATIONS.includes(locale)) return null;

  const lang = locale.split("-")[0] ?? "en";
  const legacySegForLang = getLegacyManufacturersRouteSegmentForLang(lang);
  const isLegacySegment = seg === CANONICAL_MANUFACTURERS_APP_SEGMENT || seg === legacySegForLang;
  if (!isLegacySegment) return null;

  const expected = getManufacturersRouteSegmentForLang(lang);
  const out = [...segments];
  out[1] = expected;
  const rebuilt = `/${out.join("/")}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * When the second path segment is a known manufacturers keyword but not the one for this
 * locale (e.g. /fr-FR/car-parts-brands → /fr-FR/auto-pieces-marques), return the corrected
 * public pathname for a permanent 301 — same idea as `fixPartsLocaleSegmentsInPathname`.
 * Applies to list / brand / brand×L3 depths.
 */
export function fixManufacturersLocaleSegmentsInPathname(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [locale, seg] = segments;
  if (!locale || !seg) return null;
  if (!LANG_COUNTRY_COMBINATIONS.includes(locale)) return null;
  if (!isKnownManufacturersRouteSegment(seg)) return null;

  const expected = getManufacturersRouteSegmentForLang(locale);
  if (seg === expected) return null;

  const out = [...segments];
  out[1] = expected;
  const rebuilt = `/${out.join("/")}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * @deprecated Prefer `fixManufacturersLocaleSegmentsInPathname` (301 to correct slug).
 * Kept for callers/tests that still expect a not-found path.
 */
export function getManufacturersLocaleSegmentMismatchNotFoundPath(pathname: string): string | null {
  const fixed = fixManufacturersLocaleSegmentsInPathname(pathname);
  if (!fixed) return null;
  const locale = pathname.replace(/\/$/, "").split("/").filter(Boolean)[0];
  return locale ? `/${locale}/not-found` : null;
}

/** Distinct segments used as the parts-catalog root in URLs (path matching, middleware). */
export const ALL_PARTS_ROUTE_SEGMENTS: readonly PartsRouteSegment[] = Array.from(
  new Set(Object.values(PARTS_ROUTE_SEGMENT_BY_LANG)),
);

export function isKnownPartsRouteSegment(segment: string): segment is PartsRouteSegment {
  return ALL_PARTS_ROUTE_SEGMENTS.includes(segment as PartsRouteSegment);
}

/** Footer / nav: true if pathname includes any locale's parts root (catalog, category tree, PDP). */
export function pathnameIncludesPartsRouteSegment(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return ALL_PARTS_ROUTE_SEGMENTS.some(
    (seg) => pathname.includes(`/${seg}/`) || pathname.endsWith(`/${seg}`),
  );
}

/** True if segment is any locale's category path keyword (including canonical `category`). */
export function isCategoryPathSegment(segment: string | undefined): boolean {
  if (!segment) return false;
  if (segment === CANONICAL_CATEGORY_APP_SEGMENT) return true;
  return (Object.values(CATEGORY_ROUTE_SEGMENT_BY_LANG) as string[]).includes(segment);
}

/** All localized category path keywords (`category`, `categorie`, `kategorie`, …). */
const CATEGORY_SEGMENT_VALUES = new Set(Object.values(CATEGORY_ROUTE_SEGMENT_BY_LANG) as string[]);

/**
 * When the parts (and optional category) segment does not match the URL locale language
 * (e.g. /nl-NL/pieces-auto → /nl-NL/auto-onderdelen), return the corrected public pathname.
 * Used for 301 canonicalization before internal app-folder rewrite.
 */
export function fixPartsLocaleSegmentsInPathname(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const locale = segments[0] ?? "";
  const partsSeg = segments[1] ?? "";
  if (!LANG_COUNTRY_COMBINATIONS.includes(locale)) return null;
  if (!partsSeg || !isKnownPartsRouteSegment(partsSeg)) return null;

  const lang = locale.split("-")[0] ?? "en";
  const expectedParts = getPartsRouteSegmentForLang(lang);
  const out = [...segments];
  let changed = false;

  if (partsSeg !== expectedParts) {
    out[1] = expectedParts;
    changed = true;
  }

  if (out.length >= 3 && isCategoryPathSegment(out[2])) {
    const expectedCategory = getCategoryRouteSegmentForLang(lang);
    if (out[2] !== expectedCategory) {
      out[2] = expectedCategory;
      changed = true;
    }
  }

  if (!changed) return null;
  const rebuilt = `/${out.join("/")}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * Public URLs stay localized (`auto-onderdelen`, `pieces-auto`, `autoteile`, `categorie`, …).
 * Only `app/.../car-parts` + `.../category/...` exist — middleware rewrites here before routing.
 */
export function rewriteLocalizedPartsUrlToCanonicalAppPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const out = [...segments];
  let changed = false;

  const partsSeg = out[1];
  if (partsSeg && partsSeg !== CANONICAL_PARTS_APP_SEGMENT && isKnownPartsRouteSegment(partsSeg)) {
    out[1] = CANONICAL_PARTS_APP_SEGMENT;
    changed = true;
  }

  if (out.length >= 3) {
    const catSeg = out[2];
    if (
      catSeg &&
      catSeg !== CANONICAL_CATEGORY_APP_SEGMENT &&
      CATEGORY_SEGMENT_VALUES.has(catSeg)
    ) {
      out[2] = CANONICAL_CATEGORY_APP_SEGMENT;
      changed = true;
    }
  }

  if (!changed) return null;
  const rebuilt = `/${out.join("/")}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * Legacy Category landing page (bare `/{locale}/category`, `/categorie`, `/kategorie`) →
 * new Car Part Brands landing page (Sprint 40 Car Part Brands SEO update).
 * Only matches the exact 2-segment landing URL, not the nested
 * `/{locale}/{parts}/category/{l1}[/{l2}]` listing pages.
 */
export function getLegacyCategoryLandingRedirectPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length !== 2) return null;

  const [locale, seg] = segments;
  if (!locale || !seg) return null;
  if (!LANG_COUNTRY_COMBINATIONS.includes(locale)) return null;
  if (!isCategoryPathSegment(seg)) return null;

  const lang = locale.split("-")[0] ?? "en";
  const target = getPartsRouteSegmentForLang(lang);
  const rebuilt = `/${locale}/${target}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * Legacy `/{locale}/{parts}/category` (bare, no L1) has no page — only
 * `/{locale}/{parts}/category/{l1}[/{l2}]` do. Permanent 301 to the Car Part
 * landing page `/{locale}/{parts}` instead of 404ing.
 */
export function getBareCategoryUnderPartsRedirectPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length !== 3) return null;

  const [locale, partsSeg, catSeg] = segments;
  if (!locale || !partsSeg || !catSeg) return null;
  if (!LANG_COUNTRY_COMBINATIONS.includes(locale)) return null;
  if (!isKnownPartsRouteSegment(partsSeg)) return null;
  if (!isCategoryPathSegment(catSeg)) return null;

  const rebuilt = `/${locale}/${partsSeg}`;
  return rebuilt !== normalized ? rebuilt : null;
}

/**
 * Rewrites localized manufacturers route segments to the canonical app folder segment.
 * Example: /nl-BE/auto-onderdelen-merken -> /nl-BE/manufacturers
 */
export function rewriteLocalizedManufacturersUrlToCanonicalAppPath(
  pathname: string,
): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const out = [...segments];
  const manufacturersSeg = out[1];
  if (!manufacturersSeg || manufacturersSeg === CANONICAL_MANUFACTURERS_APP_SEGMENT) return null;
  if (!isKnownManufacturersRouteSegment(manufacturersSeg)) return null;

  out[1] = CANONICAL_MANUFACTURERS_APP_SEGMENT;
  const rebuilt = `/${out.join("/")}`;
  return rebuilt !== normalized ? rebuilt : null;
}
