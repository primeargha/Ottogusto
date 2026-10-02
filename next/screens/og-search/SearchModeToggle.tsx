import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { getClientFeatureFlag } from "@/utils/theme-utils";

interface SearchModeToggleProps {
  mode: "vehicle" | "vin";
  onChange: (mode: "vehicle" | "vin") => void;
}

export default function SearchModeToggle({ mode, onChange }: SearchModeToggleProps) {
  const { getLabel } = useBranding();
  const { resetOgSearch, setCurrentStep, searchMode } = useSearchModalStore();
  return (
    <Box className="flex flex-row space-x-4">
      <OGRadioGroup
        onChange={(val: string) => {
          onChange(val as "vin" | "vehicle");
          setCurrentStep(1);
        }}
        value={searchMode}
      >
        <OGRadioInput label={getLabel("by_mmyt")} value="vehicle" />
        {getClientFeatureFlag("vin_feature_flag") && (
          <OGRadioInput label={getLabel("by_vin_number")} value="vin" />
        )}
      </OGRadioGroup>
    </Box>
  );
}
