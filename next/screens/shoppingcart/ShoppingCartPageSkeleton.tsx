import { Box } from "@/components/ui/box";
import SkeletonOverview from "./SkeletonOverview";
import { useMedia } from "@/hooks/useMedia";

const ShoppingCartCardSkeleton = () => {
  const isMobile = useMedia("(max-width: 639px)");

  return (
    <Box className="gtlg:max-h-auto base:max-h-auto z-0 flex w-full rounded-[6px] border border-color-border-default bg-color-background-default card-padding-compact card-gap-compact base:min-h-[262px] base:flex-row base:gap-[12px] gtsm:flex-col gtsm:gap-[12px] gtlg:min-h-[152px] gtlg:flex-row">
      {/* image box */}
      <Box className="relative flex w-full flex-row card-gap-compact base:min-w-[136px] base:max-w-[137px] gtlg:min-w-[180px] gtlg:max-w-[181px]">
        <Box className="relative my-auto flex flex-row items-center justify-center overflow-hidden">
          <Box className="animate-pulse h-[120px] w-[136px] rounded-md bg-gray-300 gtlg:w-[180px]" />
        </Box>
        <Box className="animate-pulse absolute z-40 h-[22px] w-[74px] rounded bg-gray-300 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0" />
      </Box>

      <Box
        className={`flex w-full card-gap-compact base:flex-col gtlg:flex-row ${isMobile ? "justify-between" : ""}`}
      >
        {/* rest of item details */}
        <Box className="flex w-full base:h-auto gtlg:h-full">
          <Box className="flex flex-col items-start justify-start">
            <Box className="animate-pulse h-4 w-[180px] rounded bg-gray-300" />
            <Box className="animate-pulse mt-1 h-5 w-[230px] rounded bg-gray-300" />
            <Box className="mt-1 flex flex-row items-start gap-2">
              <Box className="animate-pulse h-4 w-[70px] rounded bg-gray-300" />
              <Box className="animate-pulse h-4 w-[95px] rounded bg-gray-300" />
            </Box>
            <Box className="mt-1 flex h-auto w-full flex-row items-center gap-space-xs">
              <Box className="animate-pulse h-3 w-3 rounded-full bg-gray-300" />
              <Box className="animate-pulse h-4 w-[70px] rounded bg-gray-300" />
            </Box>
          </Box>
        </Box>

        {isMobile && <Box className="h-[1px] w-full bg-color-border-default" />}

        {/* buttons group */}
        <Box className="flex flex-col justify-between gap-space-xs base:w-full gtlg:h-full gtlg:max-w-[170px]">
          <Box className="flex flex-row items-center gap-space-xs">
            <Box className="animate-pulse h-4 w-[72px] rounded bg-gray-300" />
            <Box className="animate-pulse h-6 w-[54px] rounded bg-gray-300" />
          </Box>

          <Box className="flex w-full flex-col gap-space-xs">
            <Box className="flex w-full flex-col">
              <Box className="flex w-auto flex-row gap-space-xs">
                <Box className="animate-pulse h-[28px] w-[90px] rounded bg-gray-300" />
              </Box>
              <Box className="animate-pulse mt-1 h-3 w-[115px] rounded bg-gray-300" />
            </Box>

            <Box className="animate-pulse min-h-9 w-full rounded-md border border-color-border-default bg-gray-100" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const ShoppingCartPageSkeleton = () => {
  return (
    <Box className="my-4 flex w-full flex-col gap-4 base:pb-[90px] gtsm:pb-[12px] gtlg:flex-row gtlg:justify-center gtlg:pb-0">
      <Box className="flex w-full flex-col gap-4 gtlg:w-1/2 gtlg:px-10">
        {[...Array(4)]?.map((_, index) => (
          <ShoppingCartCardSkeleton key={index} />
        ))}
      </Box>

      <SkeletonOverview />
    </Box>
  );
};

export default ShoppingCartPageSkeleton;
