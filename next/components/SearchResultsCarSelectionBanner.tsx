"use client";

import React, { useCallback } from "react";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import SearchResultsSearchedCarsDropdown, {
  SearchResultsCarIcon,
} from "@/components/SearchResultsSearchedCarsDropdown";
import { useBranding } from "@/contexts/BrandingContext";
import { useSearchResultsCarBannerModel } from "@/hooks/useSearchResultsCarBannerModel";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export type SearchResultsCarSelectionBannerProps = {
  /** Path segment for `updateFilters` (e.g. `/en-BE/search-results` or `/en-BE/car-parts`). */
  applyBasePath?: string | undefined;
};

export default function SearchResultsCarSelectionBanner({
  applyBasePath,
}: SearchResultsCarSelectionBannerProps) {
  const { getLabel } = useBranding();
  const {
    hasUrlCar,
    primaryCarId,
    hasDropdownOptions,
    isBannerLoading,
    labelOptions,
    selectedLabelLoading,
    setDropdownOpen,
    showRightSidebarPanel,
    showRightSidebarForNewCar,
    handleDropdownSelect,
    handleDeselectCar,
    handleEditCar,
  } = useSearchResultsCarBannerModel({ applyBasePath });

  const getLabelText = useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  if (!getClientFeatureFlag("new_mme_feature_flag")) {
    return null;
  }

  const isCompatible = hasUrlCar;
  const borderClasses = isCompatible
    ? "border-t border-b border-color-border-positive"
    : "border-t border-b border-color-border-emphasis";
  const backgroundClasses = isCompatible
    ? "bg-color-background-positive-muted"
    : "bg-color-background-emphasis";

  if (isBannerLoading) {
    return (
      <Box
        className={`w-full ${borderClasses} ${backgroundClasses}`}
        aria-busy
        aria-label="Checking VIN compatibility"
      >
        <Box className="flex min-h-[120px] flex-col gap-4 py-4 section-standard gtsm:flex-row gtsm:items-start gtsm:gap-8 gtsm:py-space-xl">
          <Box className="animate-pulse base:hidden gtsm:block gtsm:h-20 gtsm:w-20 gtsm:shrink-0 gtsm:rounded-full gtsm:bg-color-background-default" />
          <Box className="flex min-w-0 flex-1 flex-col gap-2">
            <Box className="animate-pulse h-6 max-w-xl rounded bg-color-background-default" />
            <Box className="flex w-full flex-col items-stretch gap-2 gtsm:flex-row gtsm:items-center">
              <Box className="animate-pulse h-11 w-full shrink-0 rounded bg-color-background-default gtsm:max-w-[360px]" />
              <Box className="animate-pulse h-11 w-full shrink-0 rounded bg-color-background-default gtsm:w-40" />
            </Box>
          </Box>
          <Box className="animate-pulse h-5 w-20 shrink-0 rounded bg-color-background-default base:hidden gtsm:block gtsm:self-end" />
        </Box>
      </Box>
    );
  }

  /** State A — no URL car, no session history */
  if (!hasUrlCar && !hasDropdownOptions) {
    const selectCarLabel = getLabelText("pick_select_car", "Select car");
    return (
      <Box className={`w-full ${borderClasses} ${backgroundClasses}`}>
        <Box className="flex flex-col justify-start gap-4 py-4 section-standard gtsm:flex-col gtsm:py-6">
          <Box className="flex flex-row items-center gap-space-xl">
            <SearchResultsCarIcon compatible={false} className="base:hidden gtsm:block" />
            <Box className="flex flex-col items-start justify-center gap-2 base:w-full gtsm:w-auto">
              <Typography className="text-color-text-emphasis typography-heading-04">
                {getLabelText(
                  "identify_your_vehicle",
                  "Identify your vehicle to view compatible products",
                )}
              </Typography>
              <OGButton
                type="outlined"
                className="shrink-0 base:w-full gtsm:w-auto"
                onClick={showRightSidebarPanel}
              >
                {selectCarLabel}
              </OGButton>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  /** State A′ (gray) or State B (green) — dropdown visible */
  return (
    <Box className={`w-full ${borderClasses} ${backgroundClasses}`}>
      <Box className="flex h-auto flex-col gap-4 py-4 section-standard gtsm:flex-row gtsm:items-start gtsm:gap-8 gtsm:py-space-xl">
        <div className="base:hidden gtsm:block">
          <SearchResultsCarIcon compatible={isCompatible} />
        </div>

        <Box className="flex min-w-0 flex-1 flex-col gap-2">
          <Typography className="text-color-text-emphasis typography-heading-04">
            {isCompatible
              ? getLabelText("vehicle_compatible_label", "Showing products compatible with")
              : getLabelText(
                  "identify_your_vehicle_subtitle",
                  "Identify your vehicle to view compatible products",
                )}
          </Typography>

          <Box className="flex w-full flex-row items-start justify-start gap-2 gtsm:flex-row gtsm:items-center">
            <SearchResultsSearchedCarsDropdown
              options={labelOptions}
              selectedCarId={hasUrlCar ? primaryCarId : null}
              onSelectCar={handleDropdownSelect}
              onAddNewCar={showRightSidebarForNewCar}
              onDeselectCar={handleDeselectCar}
              onDropdownOpenChange={setDropdownOpen}
              labelsLoading={selectedLabelLoading}
              disabled={labelOptions.length === 0}
            />

            {hasUrlCar && primaryCarId && (
              <OGButton
                className="text-color-primary-default shrink-0 text-sm font-medium base:flex base:w-auto gtsm:hidden gtsm:w-auto gtsm:self-end"
                onClick={handleEditCar}
                type="ghost"
              >
                {getLabelText("edit_car", "Edit car")}
              </OGButton>
            )}
          </Box>
        </Box>

        {hasUrlCar && primaryCarId && (
          <OGButton
            className="text-color-primary-default shrink-0 text-sm font-medium base:hidden base:w-full gtsm:block gtsm:w-auto gtsm:self-end"
            onClick={handleEditCar}
            type="ghost"
          >
            {getLabelText("edit_car", "Edit car")}
          </OGButton>
        )}
      </Box>
    </Box>
  );
}
