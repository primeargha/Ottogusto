import { Box } from "@/components/ui/box";
import Image from "next/image";
import ActiveByCar from "@/assets/search/by-car-btn-icon.svg";
import ByCar from "@/assets/search/by-vehicle.svg";
import ActiveByVin from "@/assets/search/active-binary-code.svg";
import ByVin from "@/assets/search/by-vin-btn-icon.svg";
import { Button } from "@/components/ui/button";
import { OGButton } from "@/components/og-components/OGButton";

type SearchMode = "vehicle" | "vin";

interface SearchModeButtonsProps {
  currentMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

const SearchModeDesktopButtons = ({ currentMode, onModeChange }: SearchModeButtonsProps) => {
  const buttons = [
    {
      mode: "vehicle" as const,
      label: "By Vehicle details",
      icon: currentMode === "vehicle" ? ActiveByCar : ByCar,
    },
    {
      mode: "vin" as const,
      label: "By VIN Number",
      icon: currentMode === "vin" ? ActiveByVin : ByVin,
    },
  ];

  return (
    <Box className="flex h-auto w-full flex-row gap-2 rounded-[4px] bg-[--Brand-Pure-White] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] xs:mb-[40px] xs:mt-[24px] xs:p-[12px] gtsm:max-w-[450px]">
      {buttons?.map(({ mode, label, icon }) => (
        <OGButton
          key={mode}
          onClick={() => onModeChange(mode)}
          type={currentMode === mode ? "primary" : "outlined"}
          size="medium"
          className="h-[36px] flex-1"
          leftcomp={<Image src={icon} alt={label} width={20} height={20} />}
        >
          {label}
        </OGButton>
      ))}
    </Box>
  );
};

export default SearchModeDesktopButtons;
