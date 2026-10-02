import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";

// Skeleton for category hero block (back icon + title + image + description)
export function CategoryHeroSkeleton() {
  return (
    <Box className="min-h-[220px] section-standard">
      <Box className="flex h-full flex-col gap-5">
        <Box className="flex flex-row items-center gap-4">
          <Box className="animate-pulse h-6 w-6 rounded bg-color-background-emphasis" />
          <Box className="animate-pulse h-10 w-52 rounded bg-color-background-emphasis" />
        </Box>

        <Box className="flex h-auto grid-gap-listing base:flex-col base:items-start gtlg:flex-row">
          <Box className="relative h-[120px] max-h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[6px] bg-color-background-emphasis">
            <Box className="animate-pulse h-full w-full bg-color-border-emphasis" />
          </Box>
          <Box className="min-w-0 flex-1 space-y-3 pt-1">
            <Box className="animate-pulse h-4 w-full rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-4 w-11/12 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-4 w-5/6 rounded bg-color-background-emphasis" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Skeleton for the image + description hero section
export function CategoryDescriptionSkeleton() {
  return (
    <Box className="flex h-auto grid-gap-listing section-standard base:flex-col base:items-start gtlg:flex-row">
      <Box className="relative h-[120px] max-h-[120px] shrink-0 items-center overflow-hidden rounded-[6px] bg-color-background-default base:w-full base:justify-center gtlg:w-[120px] gtlg:max-w-[120px]">
        <Box className="animate-pulse bg-color-background-muted h-full w-full" />
      </Box>
      <Box className="min-w-0 flex-1 space-y-3 layout-width-text">
        <Box className="animate-pulse bg-color-background-muted h-4 w-full rounded" />
        <Box className="animate-pulse bg-color-background-muted h-4 w-5/6 rounded" />
        <Box className="animate-pulse bg-color-background-muted h-4 w-4/6 rounded" />
      </Box>
    </Box>
  );
}

// Skeleton for L2 cards + tabs + L3 grid area
export function CategoryL2SectionSkeleton() {
  return (
    <Box className="flex flex-col gap-6">
      <Box className="section-standard">
        <Box className="grid grid-cols-3 gap-3 gtsm:grid-cols-4 gtlg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box
              key={index}
              className="animate-pulse flex h-[212px] w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis"
            >
              <Box className="flex flex-1 items-center justify-center py-3">
                <Box className="bg-color-background-muted h-24 w-24 rounded" />
              </Box>
              <Box className="flex min-h-[64px] items-center justify-center border-t border-color-border-emphasis py-4">
                <Box className="bg-color-background-muted h-4 w-3/4 rounded" />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="section-standard">
        <Box className="flex flex-col gap-4">
          <Box className="animate-pulse h-9 w-full rounded bg-color-background-emphasis" />
          <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box
                key={index}
                className="animate-pulse flex min-h-[64px] w-full flex-row items-center gap-2 rounded-[6px] border border-color-border-default bg-color-background-emphasis py-1 pl-2 pr-3"
              >
                <Box className="bg-color-background-muted h-14 w-14 rounded" />
                <Box className="bg-color-background-muted h-4 w-3/4 rounded" />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Skeleton for L3 grid on L2/L3 pages
export function CategoryL3GridSkeleton() {
  return (
    <Box className="section-standard">
      <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box
            key={index}
            className="animate-pulse flex min-h-[64px] w-full flex-row items-center gap-2 rounded-[6px] border border-color-border-default bg-color-background-emphasis py-1 pl-2 pr-3"
          >
            <Box className="bg-color-background-muted h-14 w-14 rounded" />
            <Box className="bg-color-background-muted h-4 w-3/4 rounded" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Shared skeleton for Featured Makes / Top Car Brands sections (L1/L2/L3)
export function CategoryBrandsSectionSkeleton() {
  return (
    <Box className="flex flex-col gap-4 section-standard">
      <Box className="h-[1px] w-full bg-color-border-default" />
      <Typography className="text-color-text-emphasis typography-heading-03">
        {/* Placeholder heading bar */}
        <Box className="animate-pulse bg-color-background-muted mt-2 h-6 w-1/3 rounded" />
      </Typography>
      <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box
            key={index}
            className="animate-pulse flex h-32 w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis p-4"
          >
            <Box className="bg-color-background-muted h-10 w-full rounded" />
            <Box className="bg-color-background-muted h-4 w-2/3 rounded" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Skeleton for L3 Top Parts section (above the fold on L3 / brand+L3).
// Same markup as category L3 `loading.tsx` / CategoryPageLoading — keep in sync.
export function CategoryTopPartsSkeleton({
  hideHeading = false,
}: {
  /** Brand+L3 omits the “Top {L3}” heading — keep skeleton in sync. */
  hideHeading?: boolean;
} = {}) {
  return (
    <Box className="flex flex-col gap-4 section-standard">
      {!hideHeading ? (
        <Box className="animate-pulse bg-color-background-muted h-6 w-1/3 rounded" />
      ) : null}
      <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box
            key={index}
            className="animate-pulse h-64 w-full rounded-[6px] bg-color-background-emphasis"
          />
        ))}
      </Box>
      <Box className="animate-pulse bg-color-background-muted mt-4 h-11 w-full rounded" />
    </Box>
  );
}

// Generic skeleton for Learn & FAQ sections
export function CategoryLearnAndFAQSkeleton() {
  return (
    <Box className="section-standard">
      <Box className="flex flex-col gap-3">
        <Box className="animate-pulse bg-color-background-muted h-5 w-1/4 rounded" />
        <Box className="animate-pulse bg-color-background-muted h-4 w-full rounded" />
        <Box className="animate-pulse bg-color-background-muted h-4 w-5/6 rounded" />
        <Box className="animate-pulse bg-color-background-muted h-4 w-4/6 rounded" />
      </Box>
    </Box>
  );
}

// Skeleton for the L3 "no results" empty state (brand+L3 and L3 top parts).
// Mirrors CategoryL3TopPartsSection's real empty-state markup 1:1 (same wrapper
// classes, same icon/button dimensions) so swapping skeleton -> real content
// causes no layout shift on mobile or desktop.
export function NoResultsSkeleton() {
  return (
    <Box className="flex flex-col gap-space-sm section-standard">
      <Box className="bg-color-background-subtle flex flex-col items-center justify-center gap-space-sm">
        <Box className="animate-pulse h-[87px] w-[98px] rounded-full bg-color-background-emphasis" />
        <Box className="animate-pulse h-6 w-52 max-w-full rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-5 w-72 max-w-full rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-11 w-40 rounded-[6px] bg-color-background-emphasis between-0-640:w-full" />
      </Box>
    </Box>
  );
}

// Skeleton for Recently Viewed section at the bottom
export function RecentlyViewedSkeleton() {
  return (
    <Box className="section-standard">
      <Box className="flex flex-col gap-4">
        <Box className="animate-pulse bg-color-background-muted h-5 w-1/4 rounded" />
        <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box
              key={index}
              className="animate-pulse h-64 w-full rounded-[6px] bg-color-background-emphasis"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
