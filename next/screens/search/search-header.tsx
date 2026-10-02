"use client";

import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square-searchpanel.svg";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";
import BackIcon from "@/assets/search/back.svg";
import { Text } from "@/components/ui/text";

const SearchHeader = ({ onClose }: { onClose: () => void }) => {
  const { getLabel } = useBranding();
  const { isEB, isOgSearch, ebMode, carByVinResults, currentStep, setStep } = useSearchModalStore();

  const getHeaderTitle = () => {
    if (isEB && ebMode === "add") {
      return getLabel("search_header_title_for_eb_add");
    }
    if (isEB && ebMode === "edit") {
      return getLabel("search_header_title_for_eb_edit");
    }
    if (isOgSearch) {
      return getLabel("search_header_title_for_og_search");
    }
    return getLabel("search_header_title_for_search_for_car");
  };

  return (
    <Box className="flex flex-row items-center justify-between border-b base:px-[24px] base:pb-[12px] base:pt-[24px] gtsm:pb-5 gtlg:px-6 gtlg:pb-5">
      <Box className="flex flex-row items-center gap-[12px]">
        {currentStep !== 1 || carByVinResults.length === 0 ? (
          <Button
            className="bg-transparent px-2 hover:bg-transparent focus:bg-transparent active:bg-transparent"
            onPress={() => {
              if (currentStep === 1) {
                onClose();
              } else {
                setStep(currentStep - 1);
              }
            }}
          >
            <Image src={BackIcon} alt="Back" width={32} height={17} />
          </Button>
        ) : (
          <></>
        )}
        <Text className="font-Overpass text-2xl font-bold leading-[26px] text-color-text-body">
          {getHeaderTitle()}
        </Text>
      </Box>

      {/* Desktop View */}
      <Box onClick={onClose} className="hidden cursor-pointer gtlg:block">
        <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
      </Box>

      {/* Tablet */}
      <button onClick={onClose} className="hidden gtsm:block gtlg:hidden">
        <Image src={CancelSquare} alt="Cancel" height={48} width={48} />
      </button>

      {/* Mobile View */}
      <button onClick={onClose} className="block p-1 gtsm:hidden">
        <Image src={CancelSquare} alt="Cancel" height={30} width={30} />
      </button>
    </Box>
  );
};

export default SearchHeader;
