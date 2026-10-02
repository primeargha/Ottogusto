import React from "react";

import { Box } from "@/components/ui/box";
import { useSavedCarModal } from "@/stores/useSavedCarModal";
import SavedCarsHeader from "./SavedCarsHeader";

export default function SavedCarsMobileModal() {
  const { isOpen, closeModal } = useSavedCarModal();

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 z-50 flex h-screen flex-row items-start justify-center bg-black/50">
      <Box className="flex w-full flex-row items-center justify-center base:h-full gtsm:pl-[24px] gtsm:pr-[24px]">
        <Box className="w-full bg-color-background-l2 base:h-full gtsm:mx-auto gtsm:h-[965px] gtsm:max-w-[1222px] gtsm:rounded-[8px] gtlg:h-[760px] gtlg:p-[24px] 2xl:max-w-[1400px]">
          {/* Header No Change Needed*/}
          <SavedCarsHeader onClose={closeModal} />
        </Box>
      </Box>
    </Box>
  );
}
