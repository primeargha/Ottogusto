import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { useMedia } from "@/hooks/useMedia";

export default function SkeletonOverview() {
  const isMobile = useMedia("(max-width: 639px)");
  return (
    <Box
      className={`${isMobile ? "z-50 h-[800px] w-full" : "rounded-[9px]"} h-fit gtsm:min-w-[350px] gtlg:min-w-[390px] gtlg:bg-transparent`}
    >
      <Box
        className={`${isMobile ? "z-90 right-0" : ""} "z-100 w-full rounded-[8px] bg-color-background-l1 p-6 base:h-auto gtsm:mx-0 gtlg:mx-0 gtlg:h-auto`}
      >
        <Box className="flex h-full flex-col justify-between gap-[32px]">
          <Box className="flex flex-col gap-[24px]">
            <Box className="h-5 w-[95px] rounded-md bg-gray-300" />

            <Box className="flex flex-col gap-3">
              <Box className="flex w-full flex-row justify-between">
                <Box className="h-5 w-[90px] rounded-md bg-gray-200" />
                <Box className="h-5 w-[65px] rounded-md bg-gray-200" />
              </Box>
              {/* Items block parent*/}
              <Box className="mb-4 flex w-full flex-col gap-3 pl-3">
                {/* Item 1 */}
                <Box className="flex w-full flex-row justify-between">
                  <Box className="h-5 w-[60px] rounded-md bg-gray-200" />
                  <Box className="h-5 w-[50px] rounded-md bg-gray-200" />
                </Box>
                <Box className="flex w-full flex-row justify-between">
                  <Box className="h-5 w-[60px] rounded-md bg-gray-200" />
                  <Box className="h-5 w-[50px] rounded-md bg-gray-200" />
                </Box>
              </Box>

              <Box className="flex w-full flex-row justify-between">
                <Box className="h-5 w-[90px] rounded-md bg-gray-200" />
                <Box className="h-5 w-[60px] rounded-md bg-gray-200" />
              </Box>
            </Box>
          </Box>

          <Divider />

          <Box className="flex h-auto flex-col gap-3">
            <Box className="flex w-full flex-row items-center justify-between gap-3">
              <Box className="flex flex-row items-center">
                <Box className="h-5 w-[90px] rounded-md bg-gray-300" />
              </Box>
              <Box className="h-5 w-[90px] rounded-md bg-gray-300" />
            </Box>
            {!isMobile && (
              <Box className="flex w-full flex-col gap-4">
                <Box className="h-[42px] w-full rounded-md bg-gray-300" />
                <Box className="h-3 w-[90px] rounded-sm bg-gray-300" />
              </Box>
            )}
            {isMobile && (
              <Box className="z-50 flex h-[68px] bg-color-background-l2 px-3 py-3 shadow-[-5px_-5px_20px_0px_rgba(0,0,0,0.12)]">
                <Box className="h-[42px] w-full rounded-md bg-gray-300" />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
