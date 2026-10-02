/**
 * Supported URL locales from NEXT_PUBLIC_LANG_COUNTRY_COMBINATIONS (JSON array).
 * Edge-safe: no React / Node-only APIs. Use static process.env.* for Next inlining.
 */

import { LOCALE_PATH_SEGMENT_RE, isTranslationKeysLang } from "@/utils/translationDisplayMode";

const DEFAULT_LANG_COUNTRY_COMBINATIONS: readonly string[] = [
  "en-BE",
  "nl-BE",
  "fr-BE",
  "de-BE",
  "key-BE",
  "en-NL",
  "nl-NL",
  "fr-NL",
  "de-NL",
  "key-NL",
  "en-FR",
  "nl-FR",
  "fr-FR",
  "de-FR",
  "key-FR",
  "en-LU",
  "nl-LU",
  "fr-LU",
  "de-LU",
  "key-LU",
];

function normalizeLocaleEntry(raw: string): string | null {
  const t = raw.trim();
  const m = t.match(LOCALE_PATH_SEGMENT_RE);
  if (!m?.[1] || !m[2]) return null;
  return `${m[1].toLowerCase()}-${m[2].toUpperCase()}`;
}

function parseLangCountryCombinationsFromEnv(
  raw: string | undefined,
  fallback: readonly string[],
): string[] {
  if (!raw) return [...fallback];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...fallback];

    const out: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const n = normalizeLocaleEntry(item);
      if (n) out.push(n);
    }

    return out.length > 0 ? out : [...fallback];
  } catch {
    return [...fallback];
  }
}

const rawLangCountryCombinations =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LANG_COUNTRY_COMBINATIONS : undefined;

export const LANG_COUNTRY_COMBINATIONS: string[] = parseLangCountryCombinationsFromEnv(
  rawLangCountryCombinations,
  DEFAULT_LANG_COUNTRY_COMBINATIONS,
);

/**
 * Real, publicly-indexable locales — excludes the "key" translation-key debug pseudo-locale.
 * Use this (not LANG_COUNTRY_COMBINATIONS) for anything SEO-facing: hreflang, sitemap, robots.
 */
export const PUBLIC_LANG_COUNTRY_COMBINATIONS: string[] = LANG_COUNTRY_COMBINATIONS.filter(
  (combo) => !isTranslationKeysLang(combo),
);
