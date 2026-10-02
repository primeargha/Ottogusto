"use client";
import Productnavigation from "@/components/og-components/Productnavigation";
import React from "react";

export type TypographyType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  type?: TypographyType; // Defaults to 'p' if not provided
  children: React.ReactNode;
  hasBack?: boolean; // optional back arrow
  onlyTypo?: boolean;
  /** Target path for back navigation; locale prefix is applied from localStorage on click. */
  backroute?: string;
  /** When true, back uses navigation history with locale from localStorage (see OGLanguageSelectionModel). */
  isOverrideBackButton?: boolean;
}

/**
 *
 * <Typography type="h1" className="text-3xl font-bold">Page Title</Typography>
 * <Typography type="h1" hasBack>My Profile</Typography>
 *
 */

const Typography: React.FC<TypographyProps> = ({
  type = "p",
  children,
  hasBack = false,
  className = "",
  onlyTypo = false,
  backroute = "",
  isOverrideBackButton = false,
  ...rest
}) => {
  const Tag = type as keyof JSX.IntrinsicElements;
  // Only apply flex layout when back arrow exists
  const customclassName = hasBack ? "flex flex-row items-center gap-space-lg" : "";

  if (onlyTypo) {
    return (
      // @ts-ignore
      <Tag className={`${className}`} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    // @ts-ignore
    <Tag
      className={`${type.startsWith("h") ? type : ""} ${customclassName} ${className}`}
      {...rest}
    >
      {/* Hidden on mobile via CSS (not a client-only media-query hook), so
          there's no post-mount pop-in/out of the back arrow shifting the
          heading text next to it. */}
      {hasBack && (
        <span className="mr-space-md hidden gtsm:inline-flex">
          <Productnavigation isOverrideBackButton={isOverrideBackButton} backroute={backroute} />
        </span>
      )}
      {children}
    </Tag>
  );
};

export default Typography;
