import { Box } from "@/components/ui/box";
import { getServerFeatureFlag } from "@/utils/server-feature";

export function ProductDetailsCompatibilityLoading() {
  return (
    <Box className="flex w-full flex-col gap-space-md section-standard base:pb-6 gtsm:pb-8 gtlg:pb-10">
      <Box className="h-[1px] w-full bg-color-border-default" />

      {/* Guaranteed VIN Verification block */}
      <Box className="flex flex-col gap-3">
        <Box className="animate-pulse h-7 w-72 rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-4 w-full rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-4 w-5/6 rounded bg-color-background-emphasis" />
        <Box className="flex flex-row gap-2 base:flex-col gtsm:flex-row">
          <Box className="animate-pulse h-10 flex-1 rounded bg-color-background-emphasis" />
          <Box className="animate-pulse h-10 flex-1 rounded bg-color-background-emphasis" />
          <Box className="animate-pulse h-10 w-36 rounded bg-color-background-emphasis base:w-full gtsm:w-36" />
        </Box>
      </Box>

      <Box className="h-[1px] w-full bg-color-border-default" />

      {/* Potential compatibility list block */}
      <Box className="flex flex-col gap-3">
        <Box className="animate-pulse h-7 w-64 rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-4 w-full rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-4 w-2/3 rounded bg-color-background-emphasis" />
        <Box className="rounded-[6px] border border-color-border-default p-3">
          <Box className="animate-pulse mb-3 h-5 w-28 rounded bg-color-background-emphasis" />
          <Box className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box
                key={index}
                className="animate-pulse h-4 w-full rounded bg-color-background-emphasis"
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function ProductDetailsPageLoading() {
  const isLegacyMmeSearchEnabled = getServerFeatureFlag("mme_feature_flag");

  return (
    <Box className="w-full bg-color-background-default">
      {isLegacyMmeSearchEnabled && (
        <Box className="w-full border-b border-t border-color-border-positive bg-color-background-positive-muted">
          <Box className="section-base base:py-4 gtsm:py-6">
            <Box className="animate-pulse h-12 w-full rounded bg-color-background-emphasis" />
          </Box>
        </Box>
      )}

      <Box className="flex w-full flex-col gap-space-md section-standard base:pb-6 base:pt-2 gtsm:pb-8 gtsm:pt-3 gtlg:pb-10 gtlg:pt-4">
        {/* Breadcrumb reserve — matches OGBreadcrumb's <nav className="py-space-sm"> */}
        <Box className="flex items-center py-space-sm">
          <Box className="animate-pulse h-4 w-2/3 rounded bg-color-background-emphasis" />
        </Box>

        {/* Title + subtitle + badges reserve — Products component only renders this block
            below gtlg (isMobileTab, <1024px); on desktop the title lives inside the
            description column instead, so hide this reserve there to avoid a shift.
            Title bar is h-16 (64px) to match the real title's line-clamp-2 min-h-[64px]. */}
        <Box className="flex min-h-[120px] flex-col gap-3 gtlg:hidden">
          <Box className="animate-pulse h-16 w-3/4 rounded bg-color-background-emphasis" />
          <Box className="animate-pulse h-6 w-1/2 rounded bg-color-background-emphasis" />
          <Box className="flex flex-row gap-2">
            <Box className="animate-pulse h-8 w-20 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-8 w-36 rounded bg-color-background-emphasis" />
          </Box>
        </Box>

        {/* Main PDP body reserve (mobile-first, then desktop) */}
        <Box className="flex w-full base:flex-col base:gap-space-md gtsm:flex-col gtsm:gap-space-lg gtlg:flex-row gtlg:items-start gtlg:justify-between gtlg:gap-space-lg">
          <Box className="mx-auto flex-row gap-3 base:max-h-[240px] base:min-h-[239px] base:w-full gtsm:h-[432px] gtsm:max-h-[433px] gtlg:flex gtlg:max-h-[395px] gtlg:min-h-[394px] gtlg:max-w-[400px] between-1024-1200:w-1/2">
            {/* Vertical thumbnail column reserve — matches OGImageCarousal's left thumbnail rail.
                Thumbnails stack inside their own tight-gap wrapper (like the real scroll
                container) rather than being spread across the full rail height. */}
            <Box className="flex flex-col items-center justify-between gap-3 bg-transparent base:w-[98px] gtlg:w-[85px]">
              <Box className="flex flex-col gap-1.5">
                <Box className="animate-pulse rounded-0 h-[67px] w-[67px] flex-shrink-0 bg-color-background-emphasis" />
                <Box className="animate-pulse rounded-0 h-[67px] w-[67px] flex-shrink-0 bg-color-background-emphasis" />
                <Box className="animate-pulse rounded-0 h-[67px] w-[67px] flex-shrink-0 bg-color-background-emphasis" />
              </Box>
            </Box>
            {/* Main image reserve — matches OGImageCarousal's main image box */}
            <Box className="relative flex flex-1 overflow-hidden bg-color-background-none">
              <Box className="animate-pulse h-[240px] w-full rounded-[6px] bg-color-background-emphasis gtsm:h-[432px] gtlg:h-[394px]" />
            </Box>
          </Box>

          <Box className="flex w-full base:flex-col base:gap-space-md gtsm:flex-col gtsm:gap-space-md gtlg:flex-row gtlg:gap-space-lg">
            <Box className="flex flex-1 flex-col gap-3 between-1024-1200:w-1/2">
              {/* Desktop-only title/subtitle/badges reserve — Productfulldescription renders
                  this at gtlg instead of the top-of-page block (which is mobile/tablet-only) */}
              <Box className="hidden flex-col gap-space-xs gtlg:flex">
                <Box className="animate-pulse h-10 w-3/4 rounded bg-color-background-emphasis" />
                <Box className="animate-pulse h-6 w-1/2 rounded bg-color-background-emphasis" />
                <Box className="flex flex-row gap-2">
                  <Box className="animate-pulse h-8 w-20 rounded bg-color-background-emphasis" />
                  <Box className="animate-pulse h-8 w-36 rounded bg-color-background-emphasis" />
                </Box>
              </Box>

              {/* Manufacturer / reference / EAN info-box row reserve */}
              <Box className="flex w-full flex-row gap-space-sm">
                <Box className="animate-pulse h-[52px] flex-1 rounded bg-color-background-emphasis" />
                <Box className="animate-pulse h-[52px] flex-1 rounded bg-color-background-emphasis" />
                <Box className="animate-pulse hidden h-[52px] flex-1 rounded bg-color-background-emphasis gtsm:block" />
              </Box>

              <Box className="animate-pulse h-4 w-full rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-4 w-11/12 rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-4 w-10/12 rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-32 w-full rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-4 w-full rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-4 w-11/12 rounded bg-color-background-emphasis" />
              <Box className="animate-pulse h-4 w-10/12 rounded bg-color-background-emphasis" />
            </Box>

            {/* Price panel reserve — matches Productprice's actual stacked rows (price,
                add-to-cart button, divider, availability/return/payment/delivery rows)
                instead of one guessed flat box, so it self-sizes correctly at every
                breakpoint (mobile included) rather than needing a hand-picked min-height. */}
            <Box className="flex w-full min-w-[340px] base:min-w-0 gtlg:w-auto">
              <Box className="flex w-full flex-col rounded-md border border-color-border-emphasis bg-color-background-emphasis card-padding-default card-gap-default">
                <Box className="flex w-full flex-col gap-space-md">
                  <Box className="flex w-full flex-col gap-1">
                    <Box className="animate-pulse h-8 w-32 rounded bg-color-background-default" />
                    <Box className="animate-pulse h-3 w-20 rounded bg-color-background-default" />
                  </Box>
                  <Box className="animate-pulse h-11 w-full rounded bg-color-background-default" />
                </Box>

                <Box className="h-[1px] w-full border-t border-color-border-emphasis" />

                <Box className="flex w-full flex-col gap-space-md">
                  <Box className="animate-pulse h-4 w-32 rounded bg-color-background-default" />
                  <Box className="animate-pulse h-4 w-48 rounded bg-color-background-default" />
                  <Box className="animate-pulse h-4 w-40 rounded bg-color-background-default" />
                  <Box className="animate-pulse h-4 w-44 rounded bg-color-background-default" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <ProductDetailsCompatibilityLoading />
      </Box>
    </Box>
  );
}
