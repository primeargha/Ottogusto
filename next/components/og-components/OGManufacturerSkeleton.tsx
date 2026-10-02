import { Box } from "@/components/ui/box";
import React from "react";

/**
 * Homepage shows 2 rows × 4 cols (mobile) / 2 rows × 9 cols (desktop) = 8 / 18 items.
 * We use the desktop count (18) as the canonical value since the skeleton renders
 * the same count on both — mobile simply wraps into more rows.
 */
export const HOME_MANUFACTURER_VISIBLE_COUNT = 18;

// Homepage: 4-col mobile, 6-col tablet, 9-col desktop
export const MANUFACTURER_GRID_CLASS = "grid grid-cols-4 gap-3 gtsm:grid-cols-6 gtlg:grid-cols-9";
// Car Part Brands list: 2-col mobile, 4-col tablet, 8-col desktop (Figma)
export const LIST_MANUFACTURER_GRID_CLASS =
  "grid grid-cols-2 gap-3 gtsm:grid-cols-4 gtlg:grid-cols-8";

type OGManufacturerSkeletonProps = {
  count?: number;
  gridClass?: string;
};

const OGManufacturerSkeleton = ({
  count = HOME_MANUFACTURER_VISIBLE_COUNT,
  gridClass = MANUFACTURER_GRID_CLASS,
}: OGManufacturerSkeletonProps) => {
  return (
    <Box className={gridClass} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          className="flex aspect-square w-full items-center justify-center rounded-full border border-color-border-emphasis bg-color-background-emphasis"
        >
          <Box className="animate-pulse bg-color-background-muted h-[10%] w-[70%] rounded-lg" />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Full-page skeleton for the /manufacturers (car part brands) list route.
 * The page is a server component that awaits the brands API before returning
 * any JSX, so `OGManufacturerSkeleton` alone (rendered inside the client
 * `ManufacturerBlock`) never gets a chance to paint while that fetch is slow —
 * only a `<Suspense fallback>` around the whole page can. This mirrors the
 * breadcrumb + H1 + description + grid layout of the real page so there's no
 * layout shift once data arrives.
 */
export function ManufacturerListPageSkeleton() {
  return (
    <Box className="flex w-full flex-col bg-color-background-default gap-content-to-footer base:gap-6 gtsm:gap-6 gtlg:gap-8">
      <Box className="section-standard" aria-hidden>
        <Box className="flex min-h-[36px] items-center gap-2 py-space-sm gtsm:min-h-0">
          <Box className="animate-pulse h-3 w-10 rounded bg-color-background-emphasis" />
          <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
          <Box className="animate-pulse h-3 w-28 rounded bg-color-background-emphasis" />
        </Box>
      </Box>
      <Box className="section-standard" aria-hidden>
        <Box className="animate-pulse h-8 w-64 max-w-full rounded bg-color-background-emphasis" />
      </Box>
      <Box className="section-standard" aria-hidden>
        <Box className="animate-pulse bg-color-background-muted h-4 w-full max-w-2xl rounded" />
      </Box>
      <Box className="flex flex-col gap-content-to-footer section-standard">
        <OGManufacturerSkeleton count={27} gridClass={LIST_MANUFACTURER_GRID_CLASS} />
      </Box>
    </Box>
  );
}

/**
 * Reserves the same grid footprint as 18 manufacturer logos (mobile + desktop)
 * for empty/error states.
 */
export function ManufacturerGridHeightShell({
  children,
  gridClass = MANUFACTURER_GRID_CLASS,
}: {
  children: React.ReactNode;
  gridClass?: string;
}) {
  return (
    <Box className="relative w-full">
      <Box className={gridClass} aria-hidden>
        {Array.from({ length: HOME_MANUFACTURER_VISIBLE_COUNT }).map((_, index) => (
          <Box
            key={`mfr-placeholder-${index}`}
            className="aspect-square w-full rounded-full border border-transparent"
          />
        ))}
      </Box>
      <Box className="absolute inset-0 flex items-center justify-center px-4 text-center">
        {children}
      </Box>
    </Box>
  );
}

export default OGManufacturerSkeleton;
