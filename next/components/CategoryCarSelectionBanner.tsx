"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

import SearchResultsCarSelectionBanner from "@/components/SearchResultsCarSelectionBanner";
import NewSearchResultsCarSelectionBanner from "@/components/NewSearchResultsCarSelectionBanner";
import { Routes } from "@/config/routes";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type CategoryCarSelectionBannerProps = {
  /** Override apply target; defaults to current pathname (catalog / SEO). */
  applyBasePath?: string;
};

export default function CategoryCarSelectionBanner({
  applyBasePath,
}: CategoryCarSelectionBannerProps) {
  const pathname = usePathname() ?? "";
  const params = useParams();
  const languageCountry = (params?.["language-country"] as string | undefined) ?? "";

  const resolvedApplyBase = useMemo(() => {
    if (applyBasePath?.trim()) return applyBasePath.trim();
    const pathOnly = pathname.split("?")[0] || "";
    if (pathOnly) return pathOnly;
    return languageCountry ? Routes.parts(languageCountry) : "/search-results";
  }, [applyBasePath, languageCountry, pathname]);

  if (getClientFeatureFlag("end_to_end_vin_flow_feature_flag")) {
    return (
      <NewSearchResultsCarSelectionBanner applyBasePath={resolvedApplyBase} surface="listing" />
    );
  }

  return <SearchResultsCarSelectionBanner applyBasePath={resolvedApplyBase} />;
}
