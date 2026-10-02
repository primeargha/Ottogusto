import { Box } from "@/components/ui/box";
import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";
import { getServerFeatureFlag } from "@/utils/server-feature";

const L1_CARD_COUNT = 6;
const L1_SECTION_COUNT = 3;
const L3_LINK_COUNT = 10;

/**
 * Full-page skeleton for `/{locale}/car-parts-brands/{brand}` (OD-2340).
 * `[brandSlug]/page.tsx` streams this as the `<Suspense>` fallback while the
 * brand (slug API) + category tree SSR fetches are in flight, so a slow
 * backend never blocks the whole route — mirrors the real layout 1:1
 * (banner → breadcrumb → H1/logo/description → L1 cards → sticky tabs →
 * per-L1 L3 link rows) so there is no CLS once real content streams in.
 */
export default function CarPartBrandLandingSkeleton() {
  const isNewMmeEnabled = getServerFeatureFlag("new_mme_feature_flag");
  const isLegacyMmeEnabled = getServerFeatureFlag("mme_feature_flag");

  return (
    <Box className="flex w-full flex-col bg-color-background-default" aria-hidden>
      {isNewMmeEnabled ? (
        <CategoryCarSelectionBannerSkeleton />
      ) : (
        isLegacyMmeEnabled && (
          <Box className="w-full border-b border-t border-color-border-positive bg-color-background-positive-muted">
            <Box className="section-standard base:py-4 gtsm:py-6">
              <Box className="animate-pulse h-12 w-full rounded bg-color-background-emphasis" />
            </Box>
          </Box>
        )
      )}

      <Box className="flex w-full flex-col gap-content-to-footer base:gap-stack">
        {/* Breadcrumb: Home / Car Part Brands / {Brand} */}
        <Box className="section-standard">
          <Box className="flex min-h-[36px] items-center gap-2 py-space-sm gtsm:min-h-0">
            <Box className="animate-pulse h-3 w-10 rounded bg-color-background-emphasis" />
            <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-3 w-28 rounded bg-color-background-emphasis" />
            <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-3 w-20 rounded bg-color-background-emphasis" />
          </Box>
        </Box>

        {/* H1 (back icon + brand name) + logo + short description */}
        <Box className="flex flex-col gap-6 section-standard">
          <Box className="flex flex-row items-center gap-4">
            <Box className="animate-pulse h-6 w-6 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-9 w-56 max-w-full rounded bg-color-background-emphasis" />
          </Box>
          <Box className="flex flex-col items-center gap-4 gtsm:flex-row gtsm:items-center gtsm:gap-8">
            <Box className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[6px] bg-color-background-emphasis">
              <Box className="animate-pulse h-full w-full bg-color-border-emphasis" />
            </Box>
            <Box className="min-w-0 flex-1 space-y-2">
              <Box className="animate-pulse bg-color-background-muted h-4 w-full rounded" />
              <Box className="animate-pulse bg-color-background-muted h-4 w-5/6 rounded" />
              <Box className="animate-pulse bg-color-background-muted h-4 w-2/3 rounded" />
            </Box>
          </Box>
        </Box>

        {/* L1 image cards */}
        <Box className="grid grid-cols-2 gap-3 section-standard gtsm:grid-cols-3 gtlg:grid-cols-6">
          {Array.from({ length: L1_CARD_COUNT }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box
              key={index}
              className="animate-pulse flex h-full min-h-[125px] w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis base:px-2 gtsm:px-4"
            >
              {/* aspect-square + w-full mirrors the real 144x144 next/image's auto-scaled
                  height (image width == card width, height == width) so this reserves the
                  same footprint at every breakpoint/column-count instead of a fixed px guess. */}
              <Box className="bg-color-background-muted aspect-square w-full rounded base:pt-2 gtsm:pt-4" />
              <Box className="flex min-h-[64px] items-center justify-center border-t border-color-border-emphasis py-4">
                <Box className="bg-color-background-muted h-4 w-3/4 rounded" />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Sticky L1 tab bar */}
        <Box className="border-b border-color-border-default bg-color-background-default">
          <Box className="section-standard">
            <Box className="flex flex-row gap-6 overflow-hidden py-3">
              {Array.from({ length: L1_CARD_COUNT }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Box
                  key={index}
                  className="animate-pulse h-6 w-20 shrink-0 rounded bg-color-background-emphasis"
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Per-L1 sections: heading + dense L3 text-link grid */}
        <Box className="flex flex-col gap-stack section-standard">
          {Array.from({ length: L1_SECTION_COUNT }).map((_, sectionIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box key={sectionIndex} className="flex flex-col gap-4">
              <Box className="animate-pulse h-7 w-40 rounded bg-color-background-emphasis" />
              <Box className="grid grid-cols-1 gap-x-6 gap-y-3 gtsm:grid-cols-2 gtlg:grid-cols-5">
                {Array.from({ length: L3_LINK_COUNT }).map((_, linkIndex) => (
                  <Box
                    // eslint-disable-next-line react/no-array-index-key
                    key={linkIndex}
                    className="animate-pulse bg-color-background-muted h-4 w-full max-w-[160px] rounded"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
