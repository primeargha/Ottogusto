import { PUBLIC_LANG_COUNTRY_COMBINATIONS } from "@/constants";
import {
  ALL_MANUFACTURERS_ROUTE_SEGMENTS,
  ALL_PARTS_ROUTE_SEGMENTS,
  CANONICAL_MANUFACTURERS_APP_SEGMENT,
  getCategoryRouteSegmentForLang,
  getManufacturersRouteSegmentForLang,
  getPartsRouteSegmentForLang,
} from "@/config/url-segments";
import type { CategoryNode } from "@/types/categories";

const PARTS_LANGS = ["en", "nl", "fr", "de"] as const;

/**
 * For each target language, map any known parts-root segment to that language's segment.
 */
const ROUTE_SEGMENT_MAP: Record<string, Record<string, string>> = Object.fromEntries(
  PARTS_LANGS.map((targetLang) => {
    const targetPartsSeg = getPartsRouteSegmentForLang(targetLang);
    const targetManufacturersSeg = getManufacturersRouteSegmentForLang(targetLang);
    const row: Record<string, string> = {};
    for (const sourceSeg of ALL_PARTS_ROUTE_SEGMENTS) {
      row[sourceSeg] = targetPartsSeg;
    }
    for (const sourceSeg of ALL_MANUFACTURERS_ROUTE_SEGMENTS) {
      row[sourceSeg] = targetManufacturersSeg;
    }
    row[CANONICAL_MANUFACTURERS_APP_SEGMENT] = targetManufacturersSeg;
    return [targetLang, row];
  }),
);

/** All known translated segments (used to detect if a segment needs translation) */
const TRANSLATED_SEGMENTS = new Set<string>([
  ...ALL_PARTS_ROUTE_SEGMENTS,
  ...ALL_MANUFACTURERS_ROUTE_SEGMENTS,
  CANONICAL_MANUFACTURERS_APP_SEGMENT,
]);

const DEFAULT_LOCALE = "en-BE";

/**
 * Translate a pathname from the current locale to a target locale.
 * Only the first translatable route segment is swapped; the rest (slugs, IDs) are preserved.
 *
 * Example:
 *   translatePath("/en-BE/car-parts/toyota/abc123", "fr-LU")
 *   → "/fr-LU/pieces-auto/toyota/abc123"
 */
function translatePath(pathname: string, targetLocale: string): string {
  const targetLang = targetLocale.split("-")[0] || "en"; // "en", "nl", or "fr"

  // Split: ["", "en-BE", "car-parts", "toyota", "abc123"]
  const segments = pathname.split("/");

  // segments[0] is "" (leading slash), segments[1] is the locale
  // Replace locale
  segments[1] = targetLocale;

  // Translate the first translatable route segment (if any), then the category keyword after it
  for (let i = 2; i < segments.length; i++) {
    const seg = segments[i];
    if (seg && TRANSLATED_SEGMENTS.has(seg)) {
      const mapped = ROUTE_SEGMENT_MAP[targetLang]?.[seg];
      if (mapped) segments[i] = mapped;
      const catSeg = segments[i + 1];
      if (catSeg === "category" || catSeg === "categorie" || catSeg === "kategorie") {
        segments[i + 1] = getCategoryRouteSegmentForLang(targetLang);
      }
      break; // only one translatable parts-root segment per path
    }
  }

  return segments.join("/");
}

/**
 * Build `alternates.languages` object for Next.js Metadata API.
 *
 * Usage in generateMetadata():
 *   alternates: {
 *     canonical: "...",
 *     languages: buildAlternateLanguages("/en-BE/car-parts/toyota/abc123"),
 *   }
 *
 * Returns an object like:
 *   {
 *     "en-BE": "https://ottogusto.com/en-BE/car-parts/toyota/abc123",
 *     "nl-BE": "https://ottogusto.com/nl-BE/auto-onderdelen/toyota/abc123",
 *     ...
 *     "x-default": "https://ottogusto.com/en-BE/car-parts/toyota/abc123",
 *   }
 */
export function buildAlternateLanguages(pathname: string): Record<string, string> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const translatedPath = translatePath(pathname, locale);
    languages[locale] = `${baseUrl}${translatedPath}`;
  }

  // x-default points to the en-BE equivalent
  const defaultPath = translatePath(pathname, DEFAULT_LOCALE);
  languages["x-default"] = `${baseUrl}${defaultPath}`;

  return languages;
}

export function buildCategoryAlternateLanguages(
  category: CategoryNode,
  languageCountry: string,
): Record<string, string> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const [currentLangRaw] = languageCountry.split("-");
  const currentLang = currentLangRaw || "en";
  const fallbackSlug = (category.slugs && category.slugs[currentLang]) || category.name;

  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const [langRaw] = locale.split("-");
    const lang = langRaw || "en";
    const slug = (category.slugs && category.slugs[lang]) || fallbackSlug;
    const partsSegment = getPartsRouteSegmentForLang(lang);
    const categorySegment = getCategoryRouteSegmentForLang(lang);
    languages[locale] = `${baseUrl}/${locale}/${partsSegment}/${categorySegment}/${slug}`;
  }

  const defaultSlug = (category.slugs && category.slugs.en) || fallbackSlug;
  languages["x-default"] =
    `${baseUrl}/en-BE/${getPartsRouteSegmentForLang("en")}/${getCategoryRouteSegmentForLang("en")}/${defaultSlug}`;

  return languages;
}

export function buildCategoryL2AlternateLanguages(
  l1Node: CategoryNode,
  l2Node: CategoryNode,
  languageCountry: string,
): Record<string, string> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const [currentLangRaw] = languageCountry.split("-");
  const currentLang = currentLangRaw || "en";

  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const [langRaw] = locale.split("-");
    const lang = langRaw || "en";
    const l1Slug = (l1Node.slugs && l1Node.slugs[lang]) || l1Node.name || "";
    const l2Slug = (l2Node.slugs && l2Node.slugs[lang]) || l2Node.name || "";
    const partsSegment = getPartsRouteSegmentForLang(lang);
    const categorySegment = getCategoryRouteSegmentForLang(lang);
    languages[locale] =
      `${baseUrl}/${locale}/${partsSegment}/${categorySegment}/${l1Slug}/${l2Slug}`;
  }

  const defaultL1Slug = (l1Node.slugs && l1Node.slugs.en) || l1Node.name || "";
  const defaultL2Slug = (l2Node.slugs && l2Node.slugs.en) || l2Node.name || "";
  languages["x-default"] =
    `${baseUrl}/en-BE/${getPartsRouteSegmentForLang("en")}/${getCategoryRouteSegmentForLang("en")}/${defaultL1Slug}/${defaultL2Slug}`;

  return languages;
}

export function buildCategoryL3AlternateLanguages(
  l1Node: CategoryNode,
  l2Node: CategoryNode,
  l3Node: CategoryNode,
  languageCountry: string,
): Record<string, string> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const [langRaw] = locale.split("-");
    const lang = langRaw || "en";
    const l1Slug = (l1Node.slugs && l1Node.slugs[lang]) || l1Node.name || "";
    const l2Slug = (l2Node.slugs && l2Node.slugs[lang]) || l2Node.name || "";
    const l3Slug = (l3Node.slugs && l3Node.slugs[lang]) || l3Node.name || "";
    const partsSegment = getPartsRouteSegmentForLang(lang);
    const categorySegment = getCategoryRouteSegmentForLang(lang);
    languages[locale] =
      `${baseUrl}/${locale}/${partsSegment}/${categorySegment}/${l1Slug}/${l2Slug}/${l3Slug}`;
  }

  const defaultL1Slug = (l1Node.slugs && l1Node.slugs.en) || l1Node.name || "";
  const defaultL2Slug = (l2Node.slugs && l2Node.slugs.en) || l2Node.name || "";
  const defaultL3Slug = (l3Node.slugs && l3Node.slugs.en) || l3Node.name || "";
  languages["x-default"] =
    `${baseUrl}/en-BE/${getPartsRouteSegmentForLang("en")}/${getCategoryRouteSegmentForLang("en")}/${defaultL1Slug}/${defaultL2Slug}/${defaultL3Slug}`;

  return languages;
}

/** Hreflang for Car Part Brand × L3 — localized manufacturers segment + L3 slug; brand slug stays FE-stable. */
export function buildCarPartBrandL3AlternateLanguages(
  brandSlug: string,
  l3Node: CategoryNode,
): Record<string, string> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const [langRaw] = locale.split("-");
    const lang = langRaw || "en";
    const l3Slug = (l3Node.slugs && l3Node.slugs[lang]) || l3Node.slugs?.en || l3Node.name || "";
    const segment = getManufacturersRouteSegmentForLang(lang);
    languages[locale] = `${baseUrl}/${locale}/${segment}/${brandSlug}/${l3Slug}`;
  }

  const defaultL3Slug = (l3Node.slugs && l3Node.slugs.en) || l3Node.name || "";
  languages["x-default"] =
    `${baseUrl}/en-BE/${getManufacturersRouteSegmentForLang("en")}/${brandSlug}/${defaultL3Slug}`;

  return languages;
}
