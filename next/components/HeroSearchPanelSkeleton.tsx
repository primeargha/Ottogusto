"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import {
  MOBILE_HERO_CAR_SLIDE_CLASS,
  MOBILE_HERO_PANEL_BODY_CLASS,
  MOBILE_HERO_PANEL_FOOTER_CLASS,
  MOBILE_HERO_PANEL_ROOT_CLASS,
} from "@/components/heroMobileSearchPanelLayout";

function HeroSearchPanelSkeletonDesktop() {
  return (
    <Box className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-color-border-emphasis bg-color-background-default">
      <Box className="flex min-h-0 w-full flex-col gap-4 px-6 pb-4 pt-6">
        <Box className="animate-pulse h-6 w-48 max-w-[80%] shrink-0 rounded bg-color-background-emphasis" />

        <Box className="flex w-full flex-col gap-2">
          <Box className="animate-pulse h-5 w-32 max-w-[60%] shrink-0 rounded-sm bg-color-background-emphasis" />
          <Box className="animate-pulse h-10 w-full shrink-0 rounded-md bg-color-background-emphasis" />
        </Box>

        <Box className="flex w-full flex-row items-center gap-4">
          <Box className="h-px flex-1 bg-color-border-default" />
          <Box className="animate-pulse h-4 w-6 shrink-0 rounded-sm bg-color-background-emphasis" />
          <Box className="h-px flex-1 bg-color-border-default" />
        </Box>

        <Box className="flex w-full flex-row items-center gap-6 rounded-md border border-color-border-default p-2">
          <Box className="animate-pulse h-10 w-10 shrink-0 rounded-md bg-color-background-emphasis" />
          <Box className="flex min-w-0 flex-1 flex-col gap-1">
            <Box className="animate-pulse h-5 w-24 max-w-[70%] rounded-sm bg-color-background-emphasis" />
            <Box className="animate-pulse h-4 w-40 max-w-full rounded-sm bg-color-background-emphasis" />
          </Box>
        </Box>
      </Box>

      <Box className="mt-auto flex shrink-0 flex-row items-center border-t border-color-border-default px-6 py-4">
        <Box className="animate-pulse h-10 w-full shrink-0 rounded-md bg-color-background-emphasis" />
      </Box>
    </Box>
  );
}

function HeroSearchPanelSkeletonDesktopNoVin() {
  return (
    <Box className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-color-border-emphasis bg-color-background-default">
      <Box className="flex min-h-0 w-full flex-col gap-6 px-6 pb-4 pt-6">
        <Box className="animate-pulse h-6 w-48 max-w-[80%] shrink-0 rounded bg-color-background-emphasis" />

        <Box className="flex w-full flex-row items-center gap-6 rounded-md border border-color-border-default p-2">
          <Box className="animate-pulse h-10 w-10 shrink-0 rounded-md bg-color-background-emphasis" />
          <Box className="flex min-w-0 flex-1 flex-col gap-1">
            <Box className="animate-pulse h-5 w-24 max-w-[70%] rounded-sm bg-color-background-emphasis" />
            <Box className="animate-pulse h-4 w-40 max-w-full rounded-sm bg-color-background-emphasis" />
          </Box>
        </Box>
      </Box>

      <Box className="mt-auto flex shrink-0 flex-row items-center border-t border-color-border-default px-6 py-4">
        <Box className="animate-pulse h-10 w-full shrink-0 rounded-md bg-color-background-emphasis" />
      </Box>
    </Box>
  );
}

/**
 * Mobile skeleton — mirrors HeroCarDataCard DOM/classes; visible below `md`.
 *
 * `showVin` mirrors the desktop Desktop/DesktopNoVin split: when the E2E VIN
 * flow is on, the real empty-state card (`NewHeroNewCarSelectionCard`) has an
 * extra VIN input + "or" divider above the car-selection row that the legacy
 * empty-state card (`HeroNewCarSelectionCard`) doesn't — without this branch
 * the skeleton undershoots that card's height and the real content growing in
 * after load pushes the rest of the page down.
 */
function HeroSearchPanelSkeletonMobile({ showVin }: { showVin: boolean }) {
  return (
    <Box className={`${MOBILE_HERO_PANEL_ROOT_CLASS} animate-pulse`} aria-hidden aria-busy>
      <Box className={MOBILE_HERO_PANEL_BODY_CLASS}>
        <Box className="shrink-0 text-color-text-body typography-heading-01">
          <Box className="inline-block h-[1em] w-48 max-w-[70%] rounded-sm bg-color-background-emphasis opacity-80" />
        </Box>

        {showVin && (
          <>
            <Box className="flex w-full flex-col gap-2">
              <Box className="h-[1em] w-32 max-w-[60%] rounded-sm bg-color-background-emphasis opacity-80" />
              <Box className="h-10 w-full rounded-md bg-color-background-emphasis opacity-80" />
            </Box>

            <Box className="flex w-full flex-row items-center gap-4">
              <Box className="h-px flex-1 bg-color-border-default" />
              <Box className="h-4 w-6 shrink-0 rounded-sm bg-color-background-emphasis opacity-80" />
              <Box className="h-px flex-1 bg-color-border-default" />
            </Box>
          </>
        )}

        <Box className={MOBILE_HERO_CAR_SLIDE_CLASS} />
      </Box>

      <Box className={MOBILE_HERO_PANEL_FOOTER_CLASS}>
        <Box className="flex w-full flex-row items-center justify-end gap-2">
          <Box className="animate-pulse h-10 min-h-10 w-full rounded-md bg-color-background-emphasis" />
        </Box>
      </Box>
    </Box>
  );
}

export default function HeroSearchPanelSkeleton({ showVin }: { showVin: boolean }) {
  return (
    <>
      <Box className="h-full w-full md:hidden">
        <HeroSearchPanelSkeletonMobile showVin={showVin} />
      </Box>
      <Box className="hidden h-full w-full md:block">
        {showVin ? <HeroSearchPanelSkeletonDesktop /> : <HeroSearchPanelSkeletonDesktopNoVin />}
      </Box>
    </>
  );
}
