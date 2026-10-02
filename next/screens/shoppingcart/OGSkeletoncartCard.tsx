import { Box } from "@/components/ui/box";

const OGSkeletoncartCard = () => {
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
      <Box className="z-0 flex h-[150px] w-full cursor-pointer flex-row gap-[48px] self-stretch rounded-[8px] bg-color-background-l1 px-[24px] py-3 base:h-auto base:flex-col base:gap-[12px] base:px-[20px] gtsm:flex-col gtsm:gap-[12px] gtsm:px-[20px] gtlg:h-[140px] gtlg:flex-row gtlg:gap-[48px] gtlg:px-6">
        {/* Image Skeleton */}
        <Box className="flex w-full flex-row base:gap-[14px] gtlg:gap-[48px]">
          {/* image box */}
          <Box className="my-auto flex w-[122px] flex-row items-center overflow-hidden base:h-[85px] gtlg:h-[113px]">
            <Box className="skeleton-shimmer h-full w-full rounded-md bg-gray-200" />
          </Box>

          {/* Text Details Skeleton */}
          <Box className="flex h-full w-full flex-col justify-between base:gap-2">
            <Box className="flex w-full flex-row items-center gap-3">
              <Box className="skeleton-shimmer h-full w-[50%] rounded bg-gray-200" />
              <Box className="skeleton-shimmer h-[22px] w-5 rounded-full bg-gray-200" />
            </Box>
            {/* description box */}
            <Box className="skeleton-shimmer h-[28px] w-[35%] rounded bg-gray-200" />
            {/* price box */}
            <Box className="skeleton-shimmer h-[26px] w-[90px] rounded bg-gray-200" />
          </Box>
        </Box>

        {/* Button + Quantity Skeleton */}
        <Box className="flex flex-row items-end justify-between gap-3 base:w-full gtlg:h-full gtlg:w-[190px]">
          <Box className="flex w-full flex-row items-center justify-between gap-3">
            <Box className="skeleton-shimmer flex min-h-[45px] w-[100px] items-center justify-between rounded-[4px] bg-gray-200 p-[6px]" />
            <Box className="skeleton-shimmer h-[45px] w-[48px] rounded-[4px] bg-gray-200" />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default OGSkeletoncartCard;
