import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";

interface MobileSearchModeToggleProps {
  mode: "vehicle" | "vin";
  onChange: (mode: "vehicle" | "vin") => void;
}

export default function MobileSearchModeToggle({ mode, onChange }: MobileSearchModeToggleProps) {
  const { getLabel } = useBranding();
  const { resetOgSearch, setCurrentStep } = useSearchModalStore();
  return (
    <Box className="flex w-full flex-row items-center justify-start gap-6 px-2">
      <label className="flex items-center">
        <input
          type="radio"
          checked={mode === "vehicle"}
          onChange={() => {
            onChange("vehicle");
            setCurrentStep(1);
            // resetOgSearch();
          }}
          className="radio-green"
        />
        <Text className="ml-2 font-Overpass text-[16px] font-[400] leading-[18px] text-[--black]">
          {getLabel("by_mmyt")}
        </Text>
      </label>

      <label className="flex items-center">
        <input
          type="radio"
          checked={mode === "vin"}
          onChange={() => {
            onChange("vin");
            // resetOgSearch();
            setCurrentStep(1);
          }}
          className="radio-green"
        />
        <Text className="ml-2 font-Overpass text-[16px] font-[400] leading-[18px] text-[--black]">
          {getLabel("by_vin_number")}
        </Text>
      </label>
    </Box>
  );
}
