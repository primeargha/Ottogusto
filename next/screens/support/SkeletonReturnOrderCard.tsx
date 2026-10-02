import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import React from "react";

export default function SkeletonReturnOrderCard() {
  return (
    <Box className="mb-3 flex h-auto w-full flex-col gap-4 rounded-[8px] bg-color-background-l1 p-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <Box className="flex h-auto w-full flex-row gap-[14px] md:gap-[48px]">
        <Box className="h-[95px] min-w-[100px] rounded-md bg-gray-300" />

        <Box className="flex h-auto w-full flex-col gap-3">
          <Box className="flex flex-col gap-4">
            <Box className="h-5 rounded-md bg-gray-300 base:w-full gtsm:w-[130px] gtlg:w-[180px]" />
            <Box className="h-5 rounded-md bg-gray-300 base:w-full gtsm:w-[250px] gtlg:w-[380px]" />
          </Box>
          <Box className="h-6 rounded-md bg-gray-300 base:w-20 gtlg:w-[150px]" />
        </Box>
      </Box>

      <Box className="flex items-center justify-between gap-6 base:w-full base:flex-col gtlg:w-full gtlg:flex-row">
        <Box className="h-12 rounded-md bg-gray-300 base:w-full md:w-full gtlg:min-w-[550px]" />
        <Box className="flex w-full items-center gap-3 base:flex-row">
          <Box className="h-12 rounded-md bg-gray-300 base:w-[180px] gtsm:w-[280px] gtlg:w-[180px]" />
          <Box className="h-5 w-[70px] rounded-md bg-gray-300" />
        </Box>
      </Box>
    </Box>
  );
}
