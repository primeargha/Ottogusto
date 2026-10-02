import { Box } from "@/components/ui/box";

const SkeletonField = ({ className = "" }: { className?: string }) => (
  <Box className={`flex w-full flex-col gap-2 ${className}`}>
    <Box className="animate-pulse h-4 w-[90px] rounded bg-gray-300" />
    <Box className="animate-pulse h-11 w-full rounded-[4px] bg-gray-200" />
  </Box>
);

export function CheckoutDetailsBlockSkeleton() {
  return (
    <Box className="flex w-full flex-col gap-space-lg rounded-[4px]">
      <Box className="flex flex-col gap-space-lg">
        {/* "Details" heading */}
        <Box className="animate-pulse h-6 w-[100px] rounded bg-gray-300" />

        <Box className="w-full gap-space-xl">
          {/* Personal / Business purchase tabs */}
          <Box className="flex max-h-14 min-h-14 w-full flex-row base:w-1/2">
            <Box className="flex w-full min-w-20 items-center justify-center gap-2.5 border-b border-color-border-default p-3 gtsm:min-w-48 gtsm:max-w-48 gtlg:min-w-48 gtlg:max-w-48">
              <Box className="animate-pulse h-5 w-[120px] rounded bg-gray-300" />
            </Box>
            <Box className="flex w-full min-w-20 items-center justify-center gap-2.5 border-b border-color-border-default p-3 gtsm:max-w-52 gtlg:max-w-52">
              <Box className="animate-pulse h-5 w-[120px] rounded bg-gray-200" />
            </Box>
          </Box>

          {/* Contact information form */}
          <Box className="flex w-full flex-col gap-6">
            <Box className="animate-pulse h-5 w-[160px] rounded bg-gray-300" />

            <Box className="grid w-full grid-cols-1 gap-6">
              <Box className="flex flex-row gap-6">
                <SkeletonField />
                <SkeletonField />
              </Box>

              <SkeletonField />

              <Box className="flex flex-row items-center gap-2">
                <Box className="animate-pulse h-4 w-4 rounded bg-gray-300" />
                <Box className="animate-pulse h-4 w-[220px] rounded bg-gray-200" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CheckoutDetailsBlockSkeleton;
