"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { getClientFeatureFlag } from "@/utils/theme-utils";
import {
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
} from "@/utils/feature-flag-env";

/**
 * Client-side feature flag probe without hydration guards.
 */
export default function FlagsPageClient() {
  const pathname = usePathname();
  const localeFromPath = useMemo(() => getLanguageCountryFromPathname(pathname ?? ""), [pathname]);
  const countryFromPath = localeFromPath
    ? getCountryCodeFromLanguageCountrySegment(localeFromPath)
    : null;

  const vin = getClientFeatureFlag("vin_feature_flag");
  const savedCar = getClientFeatureFlag("saved_car_feature_flag");

  return (
    <section className="rounded-lg border border-color-system-info-light bg-color-background-l2 p-4">
      <h2 className="mb-2 text-color-text-body typography-heading-03">Client component</h2>
      <p className="mb-4 text-sm text-color-text-placeholder">
        Uses <code className="rounded bg-color-background-l3 px-1">getClientFeatureFlag</code> with{" "}
        immediate evaluation. Pathname below is from{" "}
        <code className="rounded bg-color-background-l3 px-1">usePathname</code>.
      </p>
      <dl className="grid gap-2 font-mono text-sm text-color-text-body">
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">Pathname</dt>
          <dd>{pathname ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">Locale (from pathname)</dt>
          <dd>{localeFromPath ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">Country (for flags)</dt>
          <dd>{countryFromPath ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">vin_feature_flag</dt>
          <dd className={vin ? "text-color-system-success-dark" : "text-color-system-error-dark"}>
            {String(vin)}
          </dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">saved_car_feature_flag</dt>
          <dd
            className={savedCar ? "text-color-system-success-dark" : "text-color-system-error-dark"}
          >
            {String(savedCar)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
