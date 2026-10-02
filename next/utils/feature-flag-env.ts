/**
 * Env-only feature flags (see plan: ops edit NEXT_PUBLIC_* JSON per deployment; no code change).
 *
 * Each flag is process.env.NEXT_PUBLIC_<FLAG_NAME_UPPERCASE> with JSON:
 * { "default": boolean, "exception_countries": string[] }
 *
 * - If exception_countries is empty → return default for everyone.
 * - Else → countries in exception_countries get the inverse of default (!default); others get default.
 *   Example: default true + ["BE"] → false in BE, true elsewhere.
 *
 * Country is taken from the language-country URL segment (e.g. en-BE → BE).
 */

import type { FeatureFlags } from "../config/feature-flags.types";

export interface FeatureFlagEnvPayload {
  default: boolean;
  exception_countries: string[];
}

export function featureFlagNameToEnvKey(featureName: keyof FeatureFlags): string {
  return `NEXT_PUBLIC_${String(featureName).toUpperCase()}`;
}

export function getLanguageCountryFromPathname(pathname: string): string | null {
  const clean = (pathname.split("?")[0] ?? "").replace(/\/$/, "");
  const segments = clean.split("/").filter(Boolean);
  return segments[0] ?? null;
}

/** e.g. en-BE → BE (uses last segment after `-`, typical lang-REGION). */
export function getCountryCodeFromLanguageCountrySegment(locale: string): string | null {
  const trimmed = locale.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("-");
  if (parts.length < 2) return null;
  const region = parts[parts.length - 1];
  return region ? region.toUpperCase() : null;
}

export function parseFeatureFlagJson(raw: string | undefined): FeatureFlagEnvPayload | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.default !== "boolean") return null;
    if (!Array.isArray(obj.exception_countries)) return null;
    const countries = obj.exception_countries
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim());
    return { default: obj.default, exception_countries: countries };
  } catch {
    return null;
  }
}

/**
 * Each NEXT_PUBLIC_* must be referenced statically so Next.js/webpack can inline it in the
 * browser bundle. Dynamic access `process.env[computedKey]` is always undefined on the client.
 */
const NEXT_PUBLIC_FEATURE_FLAG_JSON: Record<keyof FeatureFlags, string | undefined> = {
  header_countrylanguage_flag: process.env.NEXT_PUBLIC_HEADER_COUNTRYLANGUAGE_FLAG,
  new_mme_feature_flag: process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG,
  mme_feature_flag: process.env.NEXT_PUBLIC_MME_FEATURE_FLAG,
  brands_filter_feature_flag: process.env.NEXT_PUBLIC_BRANDS_FILTER_FEATURE_FLAG,
  show_left_nav_flag: process.env.NEXT_PUBLIC_SHOW_LEFT_NAV_FLAG,
  vin_feature_flag: process.env.NEXT_PUBLIC_VIN_FEATURE_FLAG,
  engine_trim_feature_flag: process.env.NEXT_PUBLIC_ENGINE_TRIM_FEATURE_FLAG,
  fbt_feature_flag: process.env.NEXT_PUBLIC_FBT_FEATURE_FLAG,
  mobile_bottom_nav_enabled: process.env.NEXT_PUBLIC_MOBILE_BOTTOM_NAV_ENABLED,
  saved_car_feature_flag: process.env.NEXT_PUBLIC_SAVED_CAR_FEATURE_FLAG,
  view_all_brands_page_flag: process.env.NEXT_PUBLIC_VIEW_ALL_BRANDS_PAGE_FLAG,
  featured_makes_feature_flag: process.env.NEXT_PUBLIC_FEATURED_MAKES_FEATURE_FLAG,
  delivery_method_flag: process.env.NEXT_PUBLIC_DELIVERY_METHOD_FLAG,
  social_pages_feature_flag: process.env.NEXT_PUBLIC_SOCIAL_PAGES_FEATURE_FLAG,
  testimonials_feature_flag: process.env.NEXT_PUBLIC_TESTIMONIALS_FEATURE_FLAG,
  footer_PopularLinks_feature_flag: process.env.NEXT_PUBLIC_FOOTER_POPULARLINKS_FEATURE_FLAG,
  pride_job_well_done_flag: process.env.NEXT_PUBLIC_PRIDE_JOB_WELL_DONE_FLAG,
  homepage_ottogusto_way_flag: process.env.NEXT_PUBLIC_HOMEPAGE_OTTOGUSTO_WAY_FLAG,
  MyGarage_page_feature_flag: process.env.NEXT_PUBLIC_MYGARAGE_PAGE_FEATURE_FLAG,
  compatible_car_section_flag: process.env.NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG,
  payment_method_feature_flag: process.env.NEXT_PUBLIC_PAYMENT_METHOD_FEATURE_FLAG,
  checkout_email_capture_feature_flag: process.env.NEXT_PUBLIC_CHECKOUT_EMAIL_CAPTURE_FEATURE_FLAG,
  Notcompatibilepop_up_feature_flag: process.env.NEXT_PUBLIC_NOTCOMPATIBILEPOP_UP_FEATURE_FLAG,
  selected_car_componentPDP_feature_flag:
    process.env.NEXT_PUBLIC_SELECTED_CAR_COMPONENTPDP_FEATURE_FLAG,
  confirm_car_popup_feature_flag: process.env.NEXT_PUBLIC_CONFIRM_CAR_POPUP_FEATURE_FLAG,
  manufacturer_hamburger_nav: process.env.NEXT_PUBLIC_MANUFACTURER_HAMBURGER_NAV_FLAG,
  home_previous_search_feature_flag: process.env.NEXT_PUBLIC_HOME_PREVIOUS_SEARCH_FEATURE_FLAG,
  end_to_end_vin_flow_feature_flag: process.env.NEXT_PUBLIC_END_TO_END_VIN_FLOW_FEATURE_FLAG,
  top_car_brands_category_feature_flag:
    process.env.NEXT_PUBLIC_TOP_CAR_BRANDS_CATEGORY_FEATURE_FLAG,
  gcr_opt_in_feature_flag: process.env.NEXT_PUBLIC_GCR_OPT_IN_FEATURE_FLAG,
  checkout_vin_api_flow_feature_flag: process.env.NEXT_PUBLIC_CHECKOUT_VIN_API_FLOW_FEATURE_FLAG,
};

export function evaluateFeatureFlag(
  featureName: keyof FeatureFlags,
  countryCodeUpper: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const key = featureFlagNameToEnvKey(featureName) as keyof NodeJS.ProcessEnv;
  const raw = NEXT_PUBLIC_FEATURE_FLAG_JSON[featureName] ?? env[key];
  const payload = parseFeatureFlagJson(raw);

  if (!payload) {
    return false;
  }
  if (!countryCodeUpper) {
    return false;
  }

  const countryUpper = countryCodeUpper.toUpperCase();
  const exceptions = payload.exception_countries.map((c) => c.toUpperCase());
  if (exceptions.length === 0) {
    return payload.default;
  }
  if (exceptions.includes(countryUpper)) {
    return !payload.default;
  }
  return payload.default;
}
