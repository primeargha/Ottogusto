import React from "react";
import Image from "next/image";
import { Box } from "@/components/ui/box";
import Typography, { type TypographyType } from "../Typography";
import ArrowFWD from "./assets/arrow_forward.svg";
import Link from "next/link";
// import Link from "@unitools/link";

export interface OGCardProps {
  href?: string;
  id?: string | number;
  title?: string;
  brand?: string;
  /** Semantic tag for the brand label via Typography (inside the card link). Default `h1` for legacy; use `span` on /allbrands. */
  brandLabelType?: TypographyType;
  description?: string;
  image?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
}

/**
 * OGCard - A reusable card component for displaying individual items
 * @param props - Card configuration and content
 * @returns Card component
 */
export const OGCard: React.FC<OGCardProps> = ({
  href,
  brand,
  description,
  image,
  icon,
  brandLabelType,
  children,
  onClick,
  className = "",
  variant = "default",
}) => {
  let variantClasses = "";

  switch (variant) {
    case "elevated":
      variantClasses =
        "bg-color-background-default border border-color-border-default shadow-lg hover:shadow-xl transition-shadow";
      break;
    case "outlined":
      variantClasses =
        "bg-color-background-none border-2 border-color-border-default hover:border-color-primary-main transition-colors";
      break;
    default:
      variantClasses =
        "bg-color-background-default border border-color-border-default transition-colors";
  }

  const containerClass = `
    flex flex-col gap-3 p-4 rounded-md cursor-pointer
    ${variantClasses}
    ${className}
  `;

  return (
    <Link
      prefetch
      title={brand}
      about={brand}
      href={href || "#"}
      className={`${containerClass} py-3 pl-6 pr-3 hover:border-[1px] hover:border-color-border-focus hover:bg-color-background-default focus:border-[2px] focus:border-[#009F4D]`}
      onClick={(e) => {
        // Next.js Link expects a MouseEventHandler; call the provided callback only when set.
        void e;
        onClick?.();
      }}
    >
      {/* Content Section */}
      <Box className="flex flex-row items-center justify-between p-1">
        {brand && (
          <Typography
            onlyTypo
            type={brandLabelType || "h3"}
            className="overflow-hidden text-ellipsis font-Overpass text-sm font-semibold text-[#28261F] text-color-text-default"
          >
            {brand}
          </Typography>
        )}

        <Image src={ArrowFWD} className="h-6 w-6" alt="arrow" />
      </Box>
    </Link>
  );
};
