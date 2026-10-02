"use client";

import { Box } from "@/components/ui/box";
import OGLayoutXL from "@/components/og-components/OGLayoutXL";

const L1_COUNT = 12;
const TAB_COUNT = 8;
const L2_CARD_COUNT = 12;

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <Box className={`animate-pulse bg-color-background-muted rounded ${className}`} aria-hidden />
  );
}

/** L1 card shell — matches CategoryL1Card (min-h-[212px]). */
function CategoryL1CardSkeleton() {
  return (
    <Box
      className="flex min-h-[125px] w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis px-4"
      aria-hidden
    >
      <Box className="flex flex-1 items-center justify-center pt-4">
        <SkeletonBlock className="h-[120px] w-[120px] base:h-[100px] base:w-[100px] gtsm:h-[120px] gtsm:w-[120px]" />
      </Box>
      <Box className="flex min-h-[64px] items-center justify-center border-t border-color-border-emphasis py-4">
        <SkeletonBlock className="h-4 w-3/4 max-w-[120px]" />
      </Box>
    </Box>
  );
}

/** L2 row card — matches CategoryL3Card (min-h-[64px]). */
function CategoryL2CardSkeleton() {
  return (
    <Box
      className="flex min-h-[64px] w-full flex-row items-center gap-2 rounded-[6px] border border-color-border-default bg-color-background-default py-1 pl-2 pr-3"
      aria-hidden
    >
      <SkeletonBlock className="h-14 w-14 shrink-0 gtsm:h-16 gtsm:w-16" />
      <SkeletonBlock className="h-4 max-w-[140px] flex-1" />
    </Box>
  );
}

function CategoryTabSkeleton({ isFirst = false }: { isFirst?: boolean }) {
  return (
    <Box
      className={`inline-flex min-w-28 items-center justify-center gap-2.5 border-b border-color-border-default px-4 py-1 ${
        isFirst ? "border-b-2 border-color-border-focus" : ""
      }`}
      aria-hidden
    >
      <Box className="flex min-w-20 items-center justify-center rounded-md p-3">
        <SkeletonBlock className="h-4 w-16 gtsm:w-20" />
      </Box>
    </Box>
  );
}

type BrowseByCategorySkeletonProps = {
  errorMessage?: string;
};

/**
 * Layout-matched skeleton for landing BrowseByCategory2 (L1 grid + tabs + L2 cards + view-all).
 * Mobile: 3-col L1, 2-col L2. Desktop: 6-col L1, 4-col L2. Heights align with loaded UI to reduce CLS.
 */
export default function BrowseByCategorySkeleton({ errorMessage }: BrowseByCategorySkeletonProps) {
  return (
    <Box
      className="grid-gap flex flex-col bg-color-background-default base:pb-0"
      aria-busy={!errorMessage}
      aria-live="polite"
      role={errorMessage ? undefined : "status"}
    >
      <OGLayoutXL className="flex w-full flex-col gap-stack">
        {errorMessage ? (
          <Box className="py-4 text-center">
            <p className="text-color-text-error typography-body-02">{errorMessage}</p>
          </Box>
        ) : null}

        {/* L1 — same grid as loaded */}
        <Box className="grid grid-gap-listing base:mb-4 base:grid-cols-3 gtsm:mb-0 gtsm:grid-cols-4 gtlg:mb-0 gtlg:grid-cols-6">
          {Array.from({ length: L1_COUNT }).map((_, index) => (
            <CategoryL1CardSkeleton key={`l1-skel-${index}`} />
          ))}
        </Box>

        {/* Tabs + L2 + view-all — same wrapper as loaded */}
        <Box className="flex w-full base:gap-3 gtsm:gap-8 gtlg:gap-8">
          <Box className="min-w-0 flex-1 pt-[26px] md:py-0">
            <Box className="overflow-x-auto scroll-smooth scrollbar-hide base:mx-[-12px] md:mx-0">
              <Box className="flex w-full min-w-max flex-row p-0">
                {Array.from({ length: TAB_COUNT }).map((_, index) => (
                  <CategoryTabSkeleton key={`tab-skel-${index}`} isFirst={index === 0} />
                ))}
              </Box>
            </Box>

            <Box className="grid w-full grid-gap-listing base:grid-cols-2 base:py-3 gtsm:grid-cols-4 gtsm:py-0 gtsm:pt-8 gtlg:py-0 gtlg:pt-8">
              {Array.from({ length: L2_CARD_COUNT }).map((_, index) => (
                <CategoryL2CardSkeleton key={`l2-skel-${index}`} />
              ))}
            </Box>
          </Box>

          <Box className="flex w-auto shrink-0 items-center py-[10px]">
            <SkeletonBlock className="h-5 w-44 max-w-[176px]" />
          </Box>
        </Box>
      </OGLayoutXL>
    </Box>
  );
}
