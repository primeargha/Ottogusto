/**
 * Legacy MakeModelType car compatibility (brands list, PDP matching cars).
 * Disabled when `new_mme_feature_flag` is on — Cars API is canonical (see docs/new-car-compatibility-with-cars.md).
 */

import type { FeatureFlags } from "@/config/feature-flags.types";
import {
  evaluateFeatureFlag,
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
  parseFeatureFlagJson,
} from "@/utils/feature-flag-env";

function resolveCountryCode(countryCode?: string | null): string | null {
  if (countryCode?.trim()) return countryCode.trim().toUpperCase();
  if (typeof window === "undefined") return null;
  const locale = getLanguageCountryFromPathname(window.location.pathname);
  if (!locale) return null;
  return getCountryCodeFromLanguageCountrySegment(locale);
}

/** True when new MME (Cars API) is active for the given market. */
export function isNewMmeFeatureEnabledForCountry(countryCode?: string | null): boolean {
  const code = resolveCountryCode(countryCode);
  if (code) {
    return evaluateFeatureFlag("new_mme_feature_flag", code);
  }
  const payload = parseFeatureFlagJson(process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG);
  if (payload && payload.exception_countries.length === 0) {
    return payload.default;
  }
  return false;
}

function isFlagEnabled(featureName: keyof FeatureFlags, countryCode?: string | null): boolean {
  const code = resolveCountryCode(countryCode);
  if (code) {
    return evaluateFeatureFlag(featureName, code);
  }
  const envKey = `NEXT_PUBLIC_${String(featureName).toUpperCase()}` as keyof NodeJS.ProcessEnv;
  const payload = parseFeatureFlagJson(process.env[envKey]);
  if (payload && payload.exception_countries.length === 0) {
    return payload.default;
  }
  return false;
}

/**
 * Whether to call GET /MakeModelType/brands.
 * Skipped when new MME is on; legacy MME / featured makes still use brands when new MME is off.
 */
export function shouldFetchMakeModelBrandsApi(countryCode?: string | null): boolean {
  return !isNewMmeFeatureEnabledForCountry(countryCode);
}

/**
 * PDP compatible-cars section: matching cars API, saved-car / all-cars accordions.
 * Controlled by `compatible_car_section_flag` (`NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG`).
 * When false: VIN verification only, no `GET /MakeModelType/part/{id}`.
 */
export function isCompatibleCarSectionEnabled(countryCode?: string | null): boolean {
  return isFlagEnabled("compatible_car_section_flag", countryCode);
}
