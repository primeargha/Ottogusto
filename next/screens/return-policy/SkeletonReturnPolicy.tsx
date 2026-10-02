import { Box } from "@/components/ui/box";
import React from "react";

const SkeletonReturnPolicy = () => {
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

      <Box className="flex h-full w-full flex-col gap-6 pb-[10px]">
        {/* Header Section */}

        {/* Content Section */}
        <Box className="base:px-3 gtsm:px-3 gtlg:px-0">
          {/* Paragraph 1 */}
          <Box className="mb-6 flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[24px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[95%] rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[90%] rounded-md bg-gray-200" />
          </Box>

          {/* Heading 2 */}
          <Box className="skeleton-shimmer mb-4 h-[28px] w-[400px] rounded-md bg-gray-200" />

          {/* Paragraph 2 */}
          <Box className="mb-6 flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[20px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[98%] rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[92%] rounded-md bg-gray-200" />
          </Box>

          {/* Subheading */}
          <Box className="skeleton-shimmer mb-4 h-[24px] w-[350px] rounded-md bg-gray-200" />

          {/* Paragraph 3 */}
          <Box className="mb-6 flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[20px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[96%] rounded-md bg-gray-200" />
          </Box>

          {/* Subheading */}
          <Box className="skeleton-shimmer mb-4 h-[24px] w-[380px] rounded-md bg-gray-200" />

          {/* Paragraph 4 */}
          <Box className="mb-6 flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[20px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[94%] rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[89%] rounded-md bg-gray-200" />
          </Box>

          {/* Paragraph 5 */}
          <Box className="mb-6 flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[20px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[97%] rounded-md bg-gray-200" />
          </Box>

          {/* Heading 3 */}
          <Box className="skeleton-shimmer mb-4 h-[24px] w-[320px] rounded-md bg-gray-200" />

          {/* Address Box */}
          <Box className="skeleton-shimmer mb-6 h-[80px] w-full rounded-md bg-gray-200" />

          {/* Heading 4 */}
          <Box className="skeleton-shimmer mb-4 h-[28px] w-[450px] rounded-md bg-gray-200" />

          {/* Paragraph 6 */}
          <Box className="flex flex-col gap-3">
            <Box className="skeleton-shimmer h-[20px] w-full rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[93%] rounded-md bg-gray-200" />
            <Box className="skeleton-shimmer h-[20px] w-[88%] rounded-md bg-gray-200" />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SkeletonReturnPolicy;
