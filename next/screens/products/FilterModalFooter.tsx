import React from "react";

import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import { useMmeStore } from "@/stores/useMmeStore";
import Image from "next/image";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import { useBranding } from "@/contexts/BrandingContext";

export default function FilterModalFooter({
  onFilter,
  isChanged,
  requireMake = true,
}: {
  onFilter: () => void;
  isChanged: boolean;
  /** When false, enable Apply based on isChanged only (e.g. category filter modal). */
  requireMake?: boolean;
}) {
  const { searchData } = useMmeStore();
  const { getLabel } = useBranding();

  const isButtonDisabled = !isChanged || (requireMake && !searchData?.make?.value);

  return (
    <Box className="flex h-auto w-full flex-row items-center justify-center bg-color-background-l2 shadow-[0px_2px_20px_10px_rgba(0,0,0,0.05)] base:mt-[24px] base:py-[12px] gtsm:mt-0 gtsm:py-[24px]">
      <OGButton
        onClick={() => {
          if (isButtonDisabled) return;
          onFilter();
        }}
        disabled={isButtonDisabled}
        type="primary"
        size="large"
        className="mx-[12px] h-full w-full p-[12px] font-Overpass text-[16px] font-normal leading-[18px]"
        leftcomp={<Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />}
      >
        {getLabel("apply_filters")}
      </OGButton>
    </Box>
  );
}
