"use client";

import React from "react";
import { Box } from "../ui/box";
import Image from "next/image";
import Typography from "./Typography";
import ArrowB from "./assets/arrow_back.svg";
interface OGPageHeaderProps {
  /**
   * Main title of the page header
   */
  title: string;
  /**
   * Optional badge text (e.g., "OE")
   */
  badge?: string;
  /**
   * Additional class names to apply to the header container
   */
  className?: string;
  /**
   * Additional class names to apply to the title
   */
  titleClassName?: string;
  /**
   * Show/hide the icon on the left
   * @default true
   */
  showIcon?: boolean;
  /**
   * Callback function when the icon is clicked
   */
  onIconClick?: () => void;
}

/**
 * OGPageHeader - A page header component with a specific design including an optional icon and badge.
 *
 * @example
 * // Basic usage
 * <OGPageHeader
 *   title="Page Title"
 *   badge="OE"
 * />
 */
const OGPageHeader: React.FC<OGPageHeaderProps> = ({
  title,
  badge,
  className = "",
  titleClassName = "",
  showIcon = true,
  onIconClick,
}) => {
  return (
    <Box className={`flex min-h-12 flex-row items-center justify-start gap-4 ${className}`}>
      {showIcon && (
        // @ts-ignore
        <Box
          className={`hidden items-center justify-start gap-2.5 p-2 md:flex ${onIconClick ? "cursor-pointer" : ""}`}
          onClick={onIconClick}
        >
          <Image src={ArrowB} alt="arrow" />
        </Box>
      )}
      <Box className="flex items-center justify-start gap-4">
        <Typography
          type="h1"
          onlyTypo
          className={`line-clamp-1 justify-start font-Anton text-3xl font-normal leading-9 tracking-tight text-color-text-emphasis ${titleClassName}`}
        >
          {title}
        </Typography>
        {badge && (
          <Box className="relative h-10 w-10">
            <Box className="bg-Color-Primary-Main outline-Color-Primary-Main absolute left-0 top-0 h-10 w-10 outline outline-1 outline-offset-[-0.56px]" />
            <Box className="text-Color-Background-None absolute left-[8.89px] top-[13.33px] h-3.5 w-6 justify-start text-center font-Anton text-2xl font-normal leading-3">
              {badge}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OGPageHeader;
