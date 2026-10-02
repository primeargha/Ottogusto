"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Accordion } from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { Productfaqcard } from "../productfaqcard";
import { CarBrand } from "@/types/cars";
import { createSafeStorage } from "@/utils/safeStorage";

interface CompatibleCarListProps {
  groupedCars: CarBrand[];
  /** True while the compatible-cars API call is pending. */
  isLoading?: boolean;
}

// Matches tailwind.config.js `screens.gtsm` ("640px") — mobile/desktop render
// at different widths and therefore different real heights (text wraps more
// on mobile), so each gets its own remembered-height cache entry below.
const MOBILE_BREAKPOINT_PX = 640;

// The compatible-cars API can return anywhere from a couple of cars to
// hundreds for a single brand, so the real, all-expanded accordion height is
// unbounded and unknowable up front — no fixed skeleton height can match it
// for every part. To actually close the gap instead of re-guessing a number
// each time, we remember the real rendered height per part (+ viewport
// bucket) in sessionStorage after it first loads, and reuse that exact value
// as the skeleton's reserved height on the next visit to the same part. Only
// a part's very first-ever view (no cached height yet) falls back to the
// rough static estimate below — every repeat view (the vast majority of
// traffic) reserves the correct height and has ~0 shift from this component.
const HEIGHT_CACHE_PREFIX = "compatible-car-list-height:";
const heightStorage = createSafeStorage(() => sessionStorage);

// Site-wide fallback for a part's very first-ever view, when no per-part
// entry exists yet in `heightStorage` above. Persisted in localStorage (not
// sessionStorage) so it improves across sessions on the same device, not
// just within one tab. Tracked as an exponential moving average rather than
// the raw last-seen value so one outlier part (a handful of brands vs.
// dozens) doesn't swing the fallback back to a bad guess for the next part.
const GLOBAL_HEIGHT_KEY_PREFIX = "compatible-car-list-height:global:";
const globalHeightStorage = createSafeStorage(() => localStorage);
const GLOBAL_HEIGHT_EMA_WEIGHT = 0.2;

function cacheKeyFor(partId: string, isMobile: boolean): string {
  return `${HEIGHT_CACHE_PREFIX}${partId}:${isMobile ? "mobile" : "desktop"}`;
}

function globalCacheKeyFor(isMobile: boolean): string {
  return `${GLOBAL_HEIGHT_KEY_PREFIX}${isMobile ? "mobile" : "desktop"}`;
}

function readHeight(storage: typeof heightStorage, key: string): number | null {
  const raw = storage.getItem(key);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getCachedHeight(key: string): number | null {
  return readHeight(heightStorage, key);
}

function setCachedHeight(key: string, height: number): void {
  if (!Number.isFinite(height) || height <= 0) return;
  heightStorage.setItem(key, String(Math.round(height)));
}

function getGlobalFallbackHeight(isMobile: boolean): number | null {
  return readHeight(globalHeightStorage, globalCacheKeyFor(isMobile));
}

function updateGlobalFallbackHeight(isMobile: boolean, measuredHeight: number): void {
  if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return;
  const key = globalCacheKeyFor(isMobile);
  const previous = readHeight(globalHeightStorage, key);
  const next = previous
    ? previous * (1 - GLOBAL_HEIGHT_EMA_WEIGHT) + measuredHeight * GLOBAL_HEIGHT_EMA_WEIGHT
    : measuredHeight;
  globalHeightStorage.setItem(key, String(Math.round(next)));
}

const SKELETON_CARDS = 2;
// Rough median-case fallback for a part's first-ever view (no cached height
// yet): header (~52px) + 4 rows (~48px each incl. gap) + card padding
// (~24px) = min-h-[268px] (gtsm) / a shorter 3-row estimate on mobile
// (min-h-[260px]), not a worst-case upper bound — a modest shift here is far
// less jarring than reserving multiple screen-heights "just in case".
const SKELETON_ROWS_PER_CARD = 4;
// Rows past this index render `hidden gtsm:flex` — visible (and contributing
// height) only at gtsm+, so mobile shows a shorter row count than desktop
// without needing separate markup.
const SKELETON_MOBILE_VISIBLE_ROWS = 3;

/**
 * Loading placeholder matching the real accordion cards below. `minHeightPx`,
 * when set, is the real height remembered from this part's last load (see
 * cacheKeyFor above) and overrides the generic per-card estimate so repeat
 * views reserve the exact right amount of space.
 */
function CompatibleCarListLoading({ minHeightPx }: { minHeightPx: number | null }) {
  return (
    <div
      className="mt-space-md flex w-full flex-col gap-space-md md:basis-2/3"
      style={minHeightPx ? { minHeight: `${minHeightPx}px` } : undefined}
    >
      {Array.from({ length: SKELETON_CARDS }).map((_, cardIndex) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={cardIndex}
          className="min-h-[260px] w-full rounded-[6px] border border-color-border-default bg-color-background-default gtsm:min-h-[268px]"
        >
          <Box className="flex items-center justify-between px-space-lg py-space-md">
            <Box className="animate-pulse h-5 w-32 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-5 w-5 rounded bg-color-background-emphasis" />
          </Box>
          <Box className="flex flex-col gap-space-md px-space-lg pb-space-md">
            {Array.from({ length: SKELETON_ROWS_PER_CARD }).map((_, rowIndex) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={rowIndex}
                className={`flex flex-row items-center gap-3 gtsm:gap-[10px] ${
                  rowIndex >= SKELETON_MOBILE_VISIBLE_ROWS ? "hidden gtsm:flex" : ""
                }`}
              >
                <Box className="animate-pulse h-8 w-8 flex-shrink-0 rounded-full bg-color-background-emphasis" />
                <Box className="animate-pulse h-[52px] flex-1 rounded bg-color-background-emphasis gtsm:h-10" />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </div>
  );
}

/**
 * Component to render a list of compatible cars grouped by brand.
 * Maps through an array of brands and renders each brand's accordion section.
 *
 * @param groupedCars - Array of CarBrand objects
 * @param isLoading - Shows a skeleton reserving space for the (all-expanded) accordion list
 */
export const CompatibleCarList = ({ groupedCars, isLoading = false }: CompatibleCarListProps) => {
  const params = useParams();
  const partId = (params?.partid as string | undefined) ?? null;

  // This component only ever mounts client-side (rendered under a `dynamic`
  // import with `ssr: false` further up the tree), so `window` is always
  // available on the very first render — computed once, synchronously, no
  // isMounted-style flip/re-render needed.
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX,
  );

  const cacheKey = partId ? cacheKeyFor(partId, isMobile) : null;
  const [cachedHeight] = useState<number | null>(() => {
    const perPart = cacheKey ? getCachedHeight(cacheKey) : null;
    return perPart ?? getGlobalFallbackHeight(isMobile);
  });

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !cacheKey || !groupedCars || groupedCars.length === 0) return;
    const node = contentRef.current;
    if (!node) return;
    // Runs once per real data load (not on every internal accordion
    // open/close, since those don't change `groupedCars`), capturing the
    // genuine "just loaded, all-expanded" height for next time.
    const measuredHeight = node.getBoundingClientRect().height;
    setCachedHeight(cacheKey, measuredHeight);
    updateGlobalFallbackHeight(isMobile, measuredHeight);
  }, [isLoading, cacheKey, groupedCars, isMobile]);

  if (isLoading) {
    return <CompatibleCarListLoading minHeightPx={cachedHeight} />;
  }

  if (!groupedCars || groupedCars.length === 0) {
    return null;
  }

  const allAccordionValues = groupedCars.map((car) => `acr-${car.brandId}`);

  return (
    <div ref={contentRef} className="md:basis-2/3">
      <Accordion
        size="md"
        variant="filled"
        type="multiple"
        defaultValue={allAccordionValues}
        isCollapsible={true}
        className="mx-0 mt-space-md w-full bg-transparent"
      >
        <Box className="flex flex-col grid-gap-listing">
          {groupedCars.map((car, indx) => (
            <Productfaqcard key={indx} car={car} />
          ))}
        </Box>
      </Accordion>
    </div>
  );
};

export default CompatibleCarList;
