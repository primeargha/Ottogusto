/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getClientFeatureFlag } from "@/utils/theme-utils";

/** Shown while `MMEBaseSearch` chunk loads. Hidden when legacy MME is off for this locale (no flash). */
function MMEBaseSearchDynamicLoading() {
  const params = useParams();
  const languageCountry =
    typeof params?.["language-country"] === "string" ? params["language-country"] : "";
  if (languageCountry !== "" && !getClientFeatureFlag("mme_feature_flag", languageCountry)) {
    return null;
  }
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 section-standard">
        <div className="h-4 w-40 rounded bg-color-background-emphasis" />
        <div className="flex flex-col gap-2 gtsm:flex-row">
          <div className="h-10 w-full rounded bg-color-background-emphasis gtsm:max-w-[200px]" />
          <div className="h-10 w-full rounded bg-color-background-emphasis gtsm:max-w-[200px]" />
          <div className="h-10 w-full rounded bg-color-background-emphasis gtsm:max-w-[200px]" />
          <div className="h-10 w-28 rounded bg-color-background-emphasis" />
        </div>
      </div>
    </div>
  );
}

const MMEBaseSearch = dynamic(() => import("./MMEBaseSearch"), {
  ssr: false,
  loading: MMEBaseSearchDynamicLoading,
});

// BaseSearchComponent (View 1)
// Contains MME search interface with Make, Model, Engine dropdowns and Enter button
interface BaseSearchComponentProps {
  onEnterClick?: () => void;
  isIncompatible?: boolean;
  tempData?: any;
  currentPageType?: "category-catalog" | "category-l1" | "search-results" | "product-details";
}

export default function BaseSearchComponent({
  onEnterClick,
  isIncompatible,
  tempData,
  currentPageType,
}: BaseSearchComponentProps) {
  return (
    // need to work from here for Not-LoggedIn user cases
    <div className="w-full">
      <MMEBaseSearch
        isIncompatible={isIncompatible ?? false}
        onEnterClick={onEnterClick ?? (() => {})}
        tempData={tempData}
        currentPageType={currentPageType ?? "search-results"}
      />
    </div>
  );
}
