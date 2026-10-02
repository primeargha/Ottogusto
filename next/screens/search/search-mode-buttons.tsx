import { Box } from "@/components/ui/box";
import Image from "next/image";
import ActiveByCar from "@/assets/search/by-car-btn-icon.svg";
import ByCar from "@/assets/search/by-vehicle.svg";
import ActiveByVin from "@/assets/search/active-binary-code.svg";
import ByVin from "@/assets/search/by-vin-btn-icon.svg";
import { Button } from "@/components/ui/button";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTabs } from "@/components/og-components/OGTabs";

type SearchMode = "vehicle" | "vin";

interface SearchModeButtonsProps {
  currentMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

const SearchModeButtons = ({ currentMode, onModeChange }: SearchModeButtonsProps) => {
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
    <Box className="mx-auto flex flex-row items-center justify-center rounded-[4px] bg-[--Brand-Pure-White] p-[12px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] base:mb-[24px] base:mt-[12px] base:w-full gtsm:mb-[40px] gtsm:mt-[24px] gtsm:w-[450px] gtlg:hidden">
      <Box className="flex w-full flex-row justify-center gap-[12px] align-middle">
        {buttons?.map(({ mode, label, icon }) => {
          let itemContainClass = `inline-flex flex-wrap content-center items-center justify-start gap-1 rounded bg-emerald-900 px-2 py-2  border-[1px] border-[--Primary-Colors-Main]`;
          let itemTextClass = `justify-start font-Overpass text-[16px] text-base font-medium leading-[18px]`;
          if (currentMode === mode) {
            // selected
            itemContainClass = `${itemContainClass} text-white bg-[--Primary-Colors-Main] hover:bg-[--primary-colors-primary-hover]`;
            itemTextClass = `${itemTextClass} text-white`;
          } else {
            itemContainClass = `${itemContainClass} text-color-text-body bg-transparent hover:bg-color-hover-action-primary`;
            itemTextClass = `${itemTextClass} text-color-text-body`;
          }
          return (
            // <OGButton
            //   key={mode}
            //   onClick={() => onModeChange(mode)}
            //   type={currentMode === mode ? "primary" : "outlined"}
            //   size="medium"
            //   className="h-[36px] flex-1 font-[500] base:text-[14px] gtsm:text-[16px]"
            //   leftcomp={<Image src={icon} alt={label} width={20} height={20} />}
            // >
            //   {label}
            // </OGButton>
            <Box key={mode} onClick={() => onModeChange(mode)} className={itemContainClass}>
              <Box className="flex flex-row items-center justify-between gap-3">
                <Box className="relative h-5 w-5">
                  <Image src={icon} alt={label} width={20} height={20} />
                </Box>
                <Box className={itemTextClass}>{label}</Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SearchModeButtons;
