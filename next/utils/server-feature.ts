import { headers } from "next/headers";

import type { FeatureFlags } from "../config/feature-flags.types";
import {
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
} from "./feature-flag-env";
import { getFeatureFlag } from "./theme-utils";

function getLocaleSegmentFromHeaders(): string | null {
  const h = headers();
  const apiLocale = h.get("x-api-locale");
  if (apiLocale) return apiLocale;
  const path = h.get("x-current-path");
  if (path) {
    return getLanguageCountryFromPathname(path);
  }
  return null;
}

export function getServerFeatureFlag(featureName: keyof FeatureFlags): boolean {
  const locale = getLocaleSegmentFromHeaders();
  const countryCode = locale ? getCountryCodeFromLanguageCountrySegment(locale) : null;
  return getFeatureFlag(featureName, countryCode);
}
