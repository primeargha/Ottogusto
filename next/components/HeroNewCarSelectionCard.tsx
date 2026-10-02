"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import CarBrandsIcon from "@/assets/CarBrandsIcon";

export default function HeroNewCarSelectionCard() {
  const { getLabel } = useBranding();
  const { showRightSidebarPanel } = useRightSidebarStore();

  const title =
    getLabel("homepage_select_your_car_title") !== "select_your_car"
      ? getLabel("homepage_select_your_car_title")
      : "SELECT YOUR CAR";
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

  const openSidebar = () => showRightSidebarPanel();

  return (
    <Box className="base:gap- flex h-full min-h-0 w-full flex-col border border-color-background-emphasis bg-color-background-default base:min-h-0 base:rounded-none gtsm:min-h-0 gtsm:rounded-md gtlg:rounded-md">
      <Box className="flex min-h-0 w-full flex-col gap-space-lg px-space-lg pb-space-md pt-space-lg">
        <Typography type="h2" className="text-start typography-heading-01">
          {title}
        </Typography>

        <button
          type="button"
          onClick={openSidebar}
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
        <OGButton type="primary" className="w-full" onClick={openSidebar}>
          {cta}
        </OGButton>
      </Box>
    </Box>
  );
}
