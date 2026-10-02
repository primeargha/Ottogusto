import { Box } from "@/components/ui/box";
import { OGProductcardSkeleton } from "@/components/og-components/OGProductcardSkeleton";

const FILTER_PILL_WIDTHS = ["w-24", "w-32", "w-28", "w-36", "w-20"];
const SIDEBAR_ROW_WIDTHS = ["w-3/5", "w-2/5", "w-4/5", "w-1/2", "w-3/5", "w-2/5", "w-3/5", "w-1/2"];

export default function ProductsPageLoading() {
  return (
    <main
      className="min-min-h-screen relative w-full bg-color-background-default"
      aria-busy="true"
      aria-label="Loading search results"
    >
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

      <Box className="min-h-[calc(100vh-200px)] w-full gap-content-to-footer">
        <Box className="flex w-full flex-col base:mt-0 gtlg:mt-0">
          {/* Breadcrumb reserve */}
          <Box className="flex items-start py-space-sm section-standard">
            <Box className="animate-pulse h-4 w-1/2 rounded bg-color-background-emphasis" />
          </Box>

          {/* Heading reserve. The mobile filter-pill row lives here too (matching the
              real component's base:block gtsm:hidden mobile row) — the desktop filter
              row lives further down, inside the right column past the sidebar, not here. */}
          <Box className="flex flex-col gap-header-to-title section-standard base:pt-0">
            <Box className="flex w-full items-start gap-title-to-content base:mr-0 base:w-full gtlg:mr-[38px] gtlg:w-auto">
              <Box className="flex w-full flex-col gap-2">
                <Box className="animate-pulse h-8 w-64 rounded bg-color-background-emphasis" />
              </Box>
            </Box>

            <Box className="flex w-full flex-col base:block gtsm:hidden">
              <Box className="flex w-full flex-row items-center gap-space-xs overflow-hidden">
                {FILTER_PILL_WIDTHS.map((widthClass, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Box
                    key={index}
                    className={`animate-pulse h-10 ${widthClass} shrink-0 rounded-full bg-color-background-emphasis`}
                  />
                ))}
              </Box>
              <Box className="animate-pulse mt-2 h-4 w-32 rounded bg-color-background-emphasis base:block gtsm:hidden" />
            </Box>
          </Box>

          {/* Products panel: sidebar + grid, mirrors the real split layout */}
          <Box
            className="overflow-visible section-split-primary-left base:mb-0 base:w-full"
            style={{ minHeight: "calc(100vh - 300px)" } as any}
          >
            {/* Sidebar reserve — desktop only, like the real filter column */}
            <Box className="h-fit w-full bg-color-background-default base:hidden gtsm:hidden gtlg:flex">
              <Box className="relative h-auto rounded-[8px] p-4 base:hidden gtsm:hidden gtlg:flex">
                <Box className="flex h-auto w-full flex-col gap-2 rounded-[8px] bg-white pr-[6px]">
                  {SIDEBAR_ROW_WIDTHS.map((widthClass, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Box key={index} className="w-full py-2 pr-2">
                      <Box
                        className={`animate-pulse h-4 ${widthClass} rounded bg-color-background-emphasis`}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Right column: desktop-only filter row (aligned past the sidebar, matching
                the real component's grid content column, not the full-width header),
                item-count line, then the card grid. */}
            <Box className="base:w-full">
              <Box className="relative grid w-full flex-col gap-space-md rounded-[8px] base:bg-transparent base:px-0">
                <Box className="flex-row items-center justify-start base:hidden gtsm:flex gtlg:max-h-[40px] gtlg:min-h-[40px]">
                  <Box className="flex flex-row items-center gap-space-xs">
                    {FILTER_PILL_WIDTHS.map((widthClass, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Box
                        key={index}
                        className={`animate-pulse h-10 ${widthClass} shrink-0 rounded-full bg-color-background-emphasis`}
                      />
                    ))}
                  </Box>
                </Box>

                <Box className="animate-pulse h-4 w-32 rounded bg-color-background-emphasis" />

                <Box className="base:flex base:flex-col gtsm:flex gtsm:flex-col gtsm:grid-gap-listing gtlg:grid gtlg:grid-cols-3 gtlg:gap-6 2xl:grid-cols-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <OGProductcardSkeleton key={index} view="grid" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </main>
  );
}
