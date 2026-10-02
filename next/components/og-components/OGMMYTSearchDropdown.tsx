import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import UpArrowIcon from "@/assets/og-search/arrow-up-active.svg";
import DownArrowIcon from "@/assets/og-search/arrow-down-inactive.svg";
import InactiveArrowIconMobile from "@/components/og-components/icons/InactiveArrowIconMobile";
import { useSearchModalStore } from "@/stores/useSearchModalStore";

interface OGMMYTSearchDropdownProps {
  label: string;
  value?: string;
  placeholder?: string;
  property: "open" | "filled" | "active" | "inactive";
  direction: "vertical" | "horizontal";
  onDropdownClick?: () => void;
  isDisabled?: boolean;
  step: number;
}

export const OGMMYTSearchDropdown: React.FC<OGMMYTSearchDropdownProps> = ({
  label,
  value,
  placeholder = "Select",
  property,
  direction,
  onDropdownClick,
  isDisabled = false,
  step,
}) => {
  const { currentStep } = useSearchModalStore();
  const isOpen = property === "open";
  const isActive = property === "active";
  const isVisible = isActive || isOpen;

  // I want for placeholder if currentStep === step => color red and if
  // step > current step => color gray

  const handleClick = () => {
    if (!isDisabled && onDropdownClick) {
      onDropdownClick();
    }
  };

  return (
    <Box className="relative w-full">
      <Box
        className={`flex ${
          direction === "vertical" ? "flex-col gap-[8px]" : "flex-row items-center gap-[12px]"
        }`}
      >
        <Text
          className={`min-w-16 max-w-16 font-Overpass text-[18px] font-[700] leading-[20px] ${
            currentStep >= step || value ? "text-color-text-body" : "text-[--Text-Tarmac-Disabled]"
          }`}
        >
          {label}
        </Text>

        {/* Dropdown Trigger */}
        <Box
          onClick={(e: any) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`flex flex-1 cursor-pointer flex-row items-center justify-between base:bg-color-background-l1 ml:bg-[--background-white]`}
        >
          <Text
            className={`font-Overpass text-[16px] font-[400] leading-[18px] text-color-text-body ${
              value
                ? "text-color-text-body"
                : placeholder && isDisabled
                  ? "text-[--Text-Tarmac-Disabled]"
                  : "text-[--Text-Tarmac-Placeholder]"
            }`}
          >
            {value || placeholder}
          </Text>
          {isOpen ? (
            <Image src={UpArrowIcon} alt="Up Arrow" height={6} width={12} />
          ) : (
            <>
              {isVisible ? (
                <Image src={DownArrowIcon} alt="Down Arrow" height={6} width={12} />
              ) : (
                <Image src={DownArrowIcon} alt="Down Arrow" height={6} width={12} />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OGMMYTSearchDropdown;
