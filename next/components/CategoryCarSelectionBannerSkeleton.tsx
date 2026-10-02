"use client";

import { Box } from "@/components/ui/box";

/** Fixed-height placeholder matching `SearchResultsCarSelectionBanner` State B (avoids CLS). */
export default function CategoryCarSelectionBannerSkeleton() {
  return (
    <Box
      className={`w-full border-b border-t border-color-border-emphasis bg-color-background-emphasis`}
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
