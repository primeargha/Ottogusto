"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useE2EVinFindCarParts } from "@/hooks/useE2EVinFindCarParts";
import { useE2EVinUrlSync } from "@/hooks/useE2EVinUrlSync";
import CarBrandsIcon from "@/assets/CarBrandsIcon";

/**
 * E2E VIN flow copy of `HeroNewCarSelectionCard` (`New` prefix).
 * Mounted when `end_to_end_vin_flow_feature_flag` is on.
 * Does not replace or modify the original component.
 */
export default function NewHeroNewCarSelectionCard() {
  useE2EVinUrlSync();
  const { getLabel } = useBranding();
  const { showRightSidebarPanel } = useRightSidebarStore();
  const vinNumber = useE2EVinSearchStore((s) => s.vinNumber);
  const setVinNumber = useE2EVinSearchStore((s) => s.setVinNumber);
  const setSidebarVinError = useE2EVinSearchStore((s) => s.setSidebarVinError);
  const setSidebarVinBrandUnsupported = useE2EVinSearchStore(
    (s) => s.setSidebarVinBrandUnsupported,
  );
  const clearVinResolvedCarIds = useE2EVinSearchStore((s) => s.clearVinResolvedCarIds);
  const { runVinFindCarParts, isVinFindPending } = useE2EVinFindCarParts();

  const title =
    getLabel("homepage_select_your_car_title") !== "select_your_car"
      ? getLabel("homepage_select_your_car_title")
      : "SELECT YOUR CAR";
  const knowYourVin =
    getLabel("homepage_vin_search_title") !== "homepage_vin_search_title"
      ? getLabel("homepage_vin_search_title")
      : "Know your VIN?";
  const vinPlaceholder =
    getLabel("homepage_vin_search_input_placeholder") !== "homepage_vin_search_input_placeholder"
      ? getLabel("homepage_vin_search_input_placeholder")
      : "Enter your VIN";
  const orLabel =
    getLabel("homepage_vin_mme_selection_seperator") !== "homepage_vin_mme_selection_seperator"
      ? getLabel("homepage_vin_mme_selection_seperator")
      : "or";
  const selectionTitle =
    getLabel("homepage_select_your_car_mme_modal_title") !==
    "homepage_select_your_car_mme_modal_title"
      ? getLabel("homepage_select_your_car_mme_modal_title")
      : "Car selection";
  const subtitle =
    getLabel("homepage_select_your_car_placeholder") !== "homepage_select_your_car_placeholder"
      ? getLabel("homepage_select_your_car_placeholder")
      : "Make, model, year, version...";
  const cta =
    getLabel("find_car_parts") !== "find_car_parts"
      ? getLabel("find_car_parts")
      : "Find your parts";

  const openSidebarForCarSelection = () => {
    setSidebarVinError(null);
    setSidebarVinBrandUnsupported(false);
    clearVinResolvedCarIds();
    showRightSidebarPanel();
  };

  const handleVinChange = (value: string) => {
    // Homepage: never show inline validation errors (doc §4.2).
    setVinNumber(value.toUpperCase());
    setSidebarVinError(null);
    setSidebarVinBrandUnsupported(false);
    clearVinResolvedCarIds();
  };

  const handleFindYourParts = () => {
    void runVinFindCarParts(vinNumber);
  };

  return (
    <Box className="base:gap- flex h-full min-h-0 w-full flex-col border border-color-background-emphasis bg-color-background-default base:min-h-0 base:rounded-none gtsm:min-h-0 gtsm:rounded-md gtlg:rounded-md">
      <Box className="flex min-h-0 w-full flex-col gap-space-md px-space-lg pb-space-md pt-space-lg">
        <Typography type="h2" className="text-start typography-heading-01">
          {title}
        </Typography>

        <Box className="flex w-full flex-col gap-space-xs">
          <Typography className="text-color-text-muted typography-body-02">
            {knowYourVin}
          </Typography>
          <OGTextInput
            value={vinNumber}
            onChange={handleVinChange}
            placeholder={vinPlaceholder}
            maxLength={17}
            autoComplete="off"
            className="bg-white"
            onKeyDown={(e) => {
              if (e?.key === "Enter" || e?.nativeEvent?.key === "Enter") {
                e?.preventDefault?.();
                handleFindYourParts();
              }
            }}
          />
        </Box>

        <Box className="flex w-full flex-row items-center gap-space-md">
          <Box className="h-px flex-1 bg-color-border-default" />
          <Typography className="shrink-0 text-color-text-muted typography-body-02">
            {orLabel}
          </Typography>
          <Box className="h-px flex-1 bg-color-border-default" />
        </Box>

        <button
          type="button"
          onClick={openSidebarForCarSelection}
          className="flex w-full cursor-pointer flex-row items-center gap-space-lg rounded-md border border-color-border-default bg-color-background-default p-space-xs text-left transition-colors hover:border-color-border-focus"
        >
          <CarBrandsIcon className="h-10 w-10 text-color-icon-default group-hover:text-color-icon-emphasis" />
          <Box className="flex min-w-0 flex-col">
            <Typography className="text-color-text-emphasis typography-heading-03">
              {selectionTitle}
            </Typography>
            <Typography className="text-color-text-muted typography-body-02">{subtitle}</Typography>
          </Box>
        </button>
      </Box>

      <Box className="mt-auto shrink-0 border-t border-color-border-default px-space-lg py-space-md">
        <OGButton
          type="primary"
          className="w-full"
          onClick={handleFindYourParts}
          disabled={isVinFindPending}
          isLoading={isVinFindPending}
        >
          {cta}
        </OGButton>
      </Box>
    </Box>
  );
}
