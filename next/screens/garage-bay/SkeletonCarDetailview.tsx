import { Box } from "@/components/ui/box";
import React from "react";

const SkeletonCarDetailview = () => {
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
          background-size: 900px 104px;
        }
      `}</style>
      <Box className="flex h-full w-full flex-col items-center justify-start gap-6 px-6">
        {" "}
        {/* top car name and rename line */}
        <Box className="flex h-[50px] w-full flex-row justify-between">
          <Box className="flex h-full w-full flex-row items-center gap-6">
            <Box className="skeleton-shimmer flex h-full w-[60%] items-start justify-start rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer flex h-9 w-9 rounded-md bg-gray-200" />
          </Box>
          <Box className="skeleton-shimmer h-full w-[50px] rounded-md bg-gray-200" />
        </Box>
        {/* divider line */}
        <Box className="h-[1px] w-full bg-color-background-l8" />
        {/* car data bloack */}
        <Box className="flex w-full flex-row gap-6 gtsm:max-h-[233px] gtsm:min-h-[232px] gtlg:max-h-[233px] gtlg:min-h-[232px]">
          {/* img */}
          <Box className="skeleton-shimmer h-full w-full rounded-md bg-gray-200" />
          {/* car data line of MME */}
          <Box className="flex h-full w-full flex-col gap-3">
            <Box className="flex h-full w-full">
              <Box className="flex h-auto flex-col gap-1">
                <Box className="skeleton-shimmer h-[46px] w-full rounded-md bg-gray-200" />
                <Box className="skeleton-shimmer h-[46px] w-full rounded-md bg-gray-200" />
                <Box className="skeleton-shimmer h-[46px] w-full rounded-md bg-gray-200" />
              </Box>
            </Box>
            <Box className="flex h-[60px] w-full flex-row gap-6">
              <Box className="skeleton-shimmer h-[44px] w-1/2 rounded-md bg-gray-200" />
              <Box className="skeleton-shimmer h-[44px] w-1/2 rounded-md bg-gray-200" />
            </Box>
          </Box>
        </Box>
        <Box className="skeleton-shimmer w-full rounded-md bg-gray-200 gtsm:max-h-[221px] gtsm:min-h-[220px] gtlg:max-h-[221px] gtlg:min-h-[220px]" />
      </Box>
    </>
  );
};

export default SkeletonCarDetailview;
