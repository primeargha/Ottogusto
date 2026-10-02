import { Box } from "@/components/ui/box";
import React from "react";

type ViewMode = "grid" | "list";

interface OGProductcardSkeletonProps {
  view?: ViewMode;
}

/**
 * Loading placeholder for OGProductcard. Renders BOTH shapes and lets CSS pick the
 * visible one at the same `gtsm` (640px) breakpoint OGProductcard/ProductList.getView()
 * use to force the "Mobile" (short horizontal row) shape below that width, regardless
 * of `view`/viewMode. Without this, on mobile the skeleton showed the tall vertical
 * "grid" card (h-[470px]) while the real card that replaces it is the short "Mobile"
 * row (min-h-[260px]) — a large shape/height mismatch causing a big layout shift.
 */
export const OGProductcardSkeleton = ({ view }: OGProductcardSkeletonProps) => {
  // Check for view (desktop/tablet shape — hidden below gtsm, real card is "Mobile" there)
  let viewClasses = "";
  if (view === "grid") {
    viewClasses =
      "hidden gtsm:flex flex-col gap-3 justify-between w-full h-[470px] rounded-[8px] bg-color-background-l1 p-[12px]";
  }
  if (view === "list") {
    viewClasses =
      "hidden gtsm:flex h-[140px] w-full flex-row gap-[48px] self-stretch rounded-[8px] bg-color-background-l1 px-[24px] py-[12px]";
  }

  // Check for image class
  let imgClass = "";
  if (view === "grid") {
    imgClass = "w-full h-[217px]";
  }
  if (view === "list") {
    imgClass = "w-[140px] h-[116px]";
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }

        .skeleton-shimmer {
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(
            to right,
            #d1d5db 0%,
            #e5e7eb 20%,
            #d1d5db 40%,
            #d1d5db 100%
          );
          background-size: 800px 104px;
        }
      `}</style>

      {/* Mobile shape — matches OGProductcard's view="Mobile" exactly (flex-row,
          image basis-1/2, min-h-[260px]). Only shown below gtsm. */}
      <Box className="flex min-h-[260px] w-full flex-row gap-3 self-stretch rounded-[6px] bg-color-background-l1 p-[12px] gtsm:hidden">
        <Box className="h-auto min-w-0 max-w-none basis-1/2">
          <Box className="skeleton-shimmer h-[236px] w-full rounded-md bg-gray-200" />
        </Box>
        <Box className="flex min-h-[120px] min-w-0 max-w-none basis-1/2 flex-col justify-between gap-3">
          <Box className="flex flex-col gap-2">
            <Box className="skeleton-shimmer h-3 w-2/5 rounded-md bg-gray-300" />
            <Box className="skeleton-shimmer h-4 w-full rounded-md bg-gray-400" />
            <Box className="skeleton-shimmer h-4 w-3/5 rounded-md bg-gray-400" />
            <Box className="skeleton-shimmer h-3 w-1/2 rounded-md bg-gray-300" />
          </Box>
          <Box className="flex flex-col gap-2">
            <Box className="skeleton-shimmer h-6 w-2/5 rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-8 w-full rounded-md bg-gray-300" />
          </Box>
        </Box>
      </Box>

      {/* Desktop/tablet shape — grid or list, per `view`. Hidden below gtsm. */}
      <Box className={viewClasses}>
        {/* Image Skeleton */}

        <Box className="flex h-auto w-full flex-col gap-2">
          <Box className={`${imgClass} skeleton-shimmer rounded-md bg-gray-200`} />
          <Box className="flex w-full flex-row items-center gap-2">
            <Box className="flex w-full flex-col gap-1">
              <Box className="skeleton-shimmer h-4 w-full rounded-md bg-gray-400" />
              <Box className="skeleton-shimmer h-4 w-3/5 rounded-md bg-gray-400" />
            </Box>
            <Box className="skeleton-shimmer flex h-7 w-7 rounded-md bg-gray-300"></Box>
          </Box>
        </Box>

        <Box className="flex h-auto w-full flex-col justify-between gap-3">
          <Box className="flex flex-col gap-4">
            {/* Title Skeleton */}
            <Box className="skeleton-shimmer h-6 w-[150px] rounded-md bg-gray-200" />

            {/* Description Skeleton */}
            <Box className="skeleton-shimmer h-4 w-4/5 rounded-md bg-gray-200" />
          </Box>

          {/* Price and Button Skeleton */}
          <Box className="flex w-full flex-row items-center justify-between gap-3">
            <Box className="skeleton-shimmer h-8 w-[200px] rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-8 w-20 rounded-md bg-gray-200" />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default OGProductcardSkeleton;
