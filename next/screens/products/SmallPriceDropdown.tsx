import { Box } from "@/components/ui/box";
import React from "react";
import Typography from "@/components/og-components/Typography";
import DownArrowFilterIcon from "./DownArrowFilterIcon";
import UpArrowFilterIcon from "./UpArrowFilterIcon";

interface PriceDropdownProps {
  label: string;
  value?: string;
  placeholder?: string;
  property: "open" | "filled" | "active" | "inactive";
  direction: "vertical" | "horizontal";
  onDropdownClick?: () => void;
  isDisabled?: boolean;
  selectedValue?: "priority" | "ASC" | "DESC" | "";
}

const SmallPriceDropdown: React.FC<PriceDropdownProps> = ({
  label,
  value,
  placeholder = "Price",
  property,
  direction,
  onDropdownClick,
  isDisabled = false,
  selectedValue,
}: PriceDropdownProps) => {
  // const { updateFilters } = useUrlParams();
  const handleClick = () => {
    if (!isDisabled && onDropdownClick) {
      onDropdownClick();
    }
  };

  const isOpen = property === "open";
  const isActive = property === "active";
  const isVisible = isActive || isOpen;

  return (
    <Box
      className={`relative flex ${selectedValue === "priority" ? "w-auto" : "w-full"} flex-nowrap`}
    >
      <Box
        className={`flex ${
          direction === "vertical" ? "flex-col gap-[8px]" : "flex-row items-center justify-between"
        }`}
      >
        {/* Dropdown Trigger */}
        <Box
          onClick={handleClick}
          className="flex w-full cursor-pointer flex-row items-center justify-between gap-3 bg-color-background-default"
        >
          <Typography
            className={`min-w-0 truncate text-center typography-body-02 ${
              value
                ? "text-color-text-emphasis"
                : placeholder && isDisabled
                  ? "text-color-text-emphasis"
                  : "text-color-text-emphasis"
            }`}
          >
            {value || placeholder}
          </Typography>
          <Box className="flex shrink-0 flex-row items-center justify-center gap-[6px]">
            <Box className="h-5 max-h-5 w-[1px] border border-color-border-default" />
            {isOpen ? (
              <UpArrowFilterIcon className="text-color-icon-default" />
            ) : (
              <DownArrowFilterIcon className="h-5 w-5 text-color-icon-default" />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SmallPriceDropdown;
