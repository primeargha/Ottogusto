import { Box } from "@/components/ui/box";
import React from "react";
import Typography from "@/components/og-components/Typography";
import DownArrowFilterIcon from "./DownArrowFilterIcon";
import UpArrowFilterIcon from "./UpArrowFilterIcon";

interface BrandsDropdownProps {
  label?: string;
  value?: string;
  placeholder?: string;
  property: "open" | "filled" | "active" | "inactive";
  direction: "vertical" | "horizontal";
  onDropdownClick?: () => void;
  isDisabled?: boolean;
}

const BrandsDropdown: React.FC<BrandsDropdownProps> = ({
  label,
  value,
  placeholder = "Brands",
  property,
  direction,
  onDropdownClick,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (!isDisabled && onDropdownClick) {
      onDropdownClick();
    }
  };

  const isOpen = property === "open";

  // What to display: selected value → label → placeholder (in priority order)
  const displayText = value || label || placeholder;

  // Is a real brand selected?
  const hasSelection = !!value;

  return (
    <Box className="relative flex w-auto flex-nowrap">
      <Box
        className={`flex ${
          direction === "vertical" ? "flex-col gap-[8px]" : "flex-row items-center justify-between"
        }`}
      >
        <Box
          onClick={handleClick}
          className={`flex w-full cursor-pointer flex-row items-center justify-between gap-3 bg-color-background-default ${
            isDisabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Typography
            className={`line-clamp-1 typography-body-02 ${
              isDisabled
                ? "text-color-text-emphasis"
                : hasSelection
                  ? "text-color-text-emphasis"
                  : "text-color-text-emphasis"
            }`}
          >
            {displayText}
          </Typography>
          <Box className="flex flex-row items-center justify-center gap-[6px]">
            <Box className="h-5 max-h-5 w-[1px] border border-color-border-default" />
            {isOpen ? (
              <UpArrowFilterIcon className="text-color-icon-default" />
            ) : (
              <DownArrowFilterIcon className="text-color-icon-default" />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandsDropdown;
