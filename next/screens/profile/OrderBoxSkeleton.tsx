import { Box } from "@/components/ui/box";

export default function OrderBoxSkeleton() {
  return (
    <Box className="mb-3 flex min-h-[218px] w-full flex-col gap-4 rounded-[8px] bg-[var(--color-beige-800)] p-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <Box className="flex items-center base:h-full base:flex-col base:gap-3 gtsm:h-full gtsm:flex-col gtsm:gap-3 gtlg:h-11 gtlg:flex-row gtlg:justify-between">
        {/* This should come second on small screens (order-2), default order on large */}
        <Box className="flex rounded-md bg-gray-200 base:h-10 base:w-full gtsm:h-10 gtsm:w-full gtlg:h-7 gtlg:w-[220px]" />

        {/* This should come first on small screens (order-1), default order on large */}
        <Box className="flex rounded-md bg-gray-300 p-3 base:h-10 base:w-full gtsm:h-10 gtsm:w-full gtlg:h-11 gtlg:w-24" />
      </Box>

      <Box className="flex w-full gap-5 base:flex-col gtsm:flex-col gtlg:flex-row">
        <Box className="flex w-full flex-col gap-4">
          <Box className="w-full gap-3">
            <Box className="h-9 w-[250px] rounded-md bg-gray-200" />
            <Box className="h-6 w-[160px] rounded-md bg-gray-200" />
            <Box className="h-6 w-[160px] rounded-md bg-gray-200" />
          </Box>

          <Box className="flex flex-row gap-6">
            <Box className="h-8 w-20 rounded-md bg-gray-200" />
            <Box className="h-8 w-20 rounded-md bg-gray-200" />
          </Box>
        </Box>

        {/* More details buttonButton */}
        <Box className="flex cursor-pointer items-end justify-end base:w-full gtsm:w-full gtlg:w-[180px]">
          <Box className="flex h-[42px] items-end justify-end rounded-md bg-gray-300 base:w-full gtsm:w-full gtlg:w-full" />
        </Box>
      </Box>
    </Box>
  );
}
