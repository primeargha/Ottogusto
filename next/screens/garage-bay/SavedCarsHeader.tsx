"use client";

import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";
import BackIcon from "@/assets/search/back.svg";
import { useSavedCarModal } from "@/stores/useSavedCarModal";
import Typography from "@/components/og-components/Typography";

const SavedCarsHeader = ({ onClose }: { onClose: () => void }) => {
  const { getLabel } = useBranding();

  return (
    <Box className="flex flex-row items-center justify-between border-b base:px-[24px] base:pb-[12px] base:pt-[24px] gtlg:px-0 gtlg:py-0">
      <Box className="flex flex-row items-center gap-[12px]">
        <Button
          className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onPress={() => {
            onClose();
          }}
        >
          <Image src={BackIcon} alt="Back" width={32} height={17} />
        </Button>

        <Typography
          type="h2"
          className="font-Overpass text-2xl font-bold leading-[26px] text-color-text-body"
        >
          {getLabel("search_by_saved_car")}
        </Typography>
      </Box>

      <button onClick={onClose} className="block p-1 gtlg:hidden">
        <Image src={CancelSquare} alt="Cancel" height={48} width={48} />
      </button>
    </Box>
  );
};

export default SavedCarsHeader;
