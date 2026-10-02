/**
 * Middleware locale helpers (Edge-safe).
 * LANG_COUNTRY_COMBINATIONS from NEXT_PUBLIC_LANG_COUNTRY_COMBINATIONS; see lang-country-combinations-env.ts.
 */
export {
  LANG_COUNTRY_COMBINATIONS,
  PUBLIC_LANG_COUNTRY_COMBINATIONS,
} from "./lang-country-combinations-env";

/** Default locale for root "/" redirect */
export const DEFAULT_HOMEPAGE_LOCALE = "en-BE";

/** Language-only (e.g. /en) → default locale for that language */
export const LANG_TO_DEFAULT_LOCALE: Record<string, string> = {
  en: "en-BE",
  nl: "nl-BE",
  fr: "fr-BE",
  de: "de-BE",
  key: "key-BE",
};
