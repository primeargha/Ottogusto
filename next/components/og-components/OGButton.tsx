import React, { forwardRef } from "react";
import Link from "next/link";

import { Box } from "../ui/box";
import { Spinner } from "../ui/spinner";
// import { color_primary_main, color_system_error_main, color_text_on_dark } from "@/config/theme-alias";

interface OGButtonProps {
  href?: string;
  type?:
    "primary" | "outlined" | "secondary" | "error" | "ghost" | "danger outline" | "danger ghost";
  state?: "default" | "hover" | "disabled";
  icon?: "left" | "right" | "none";
  size?: "small" | "medium" | "large" | "link";
  disabled?: boolean;
  isDanger?: boolean; // Add isDanger prop

  children: React.ReactNode;
  onClick?: () => void;
  rightcomp?: React.ReactNode;
  leftcomp?: React.ReactNode;
  passedIcon?: React.ReactNode;
  className?: string;
  onlyIcon?: boolean;
  isLoading?: boolean;
  usageAt?: string;
}

export const OGButton = forwardRef<HTMLButtonElement, OGButtonProps>((props, ref) => {
  const {
    className = ``,
    children,
    href,
    rightcomp = null,
    leftcomp = null,
    disabled = false,
    type = "primary",
    size = "medium",
    icon = "none",
    isDanger = false,
    onlyIcon = false,
    passedIcon = null,
    isLoading = false,
    usageAt,
    onClick,
    ...rest
  } = props;

  const handleButtonClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.();
  };
  let btnContainerClass = `flex w-fit flex-row items-center inline-flex rounded justify-center items-center cursor-pointer`;
  // const { currentStore, currentDevice } = useTheme();
  // add margin for text box if left or right icon is applied
  let fontClass = `typography-button-01 ${leftcomp && "ml-0"} ${rightcomp && "mr-[12px]"}`;

  // Check for type prop with isDanger consideration
  let bgColor = "";
  if (isDanger) {
    // Danger variants
    if (type === "primary") {
      bgColor = disabled
        ? "bg-button-primary-bg-disabled"
        : "bg-button-danger-bg-default hover:bg-button-danger-bg-hover";
      fontClass = `${fontClass} text-button-danger-text`;
    }
    if (type === "outlined") {
      bgColor = disabled
        ? "bg-button-danger-outline-bg-disabled border border-button-danger-outline-border"
        : "bg-button-danger-outline-bg-default border border-button-danger-outline-border hover:bg-button-danger-outline-bg-hover";
      fontClass = `${fontClass} text-button-danger-outline-text`;
    }
  } else {
    // Regular variants
    if (type === "error") {
      bgColor =
        "bg-button-danger-bg-default border border-button-danger-bg-default hover:bg-button-danger-bg-hover";
      fontClass = `${fontClass} text-button-danger-text`;
    }
    if (type === "primary") {
      bgColor = disabled
        ? "bg-button-primary-bg-disabled border-button-primary-bg-disabled"
        : "bg-button-primary-bg-default border-button-primary-bg-default hover:bg-button-primary-bg-hover";
      fontClass = `${fontClass} text-button-primary-text`;
    }
    if (type === "secondary") {
      bgColor = `bg-[--brand-traffic-light-green] border border-[--color-button-primary-bg-default] hover:bg-[--secondary-colors-hover]`;
      fontClass = `${fontClass} text-white`;
    }
    if (type === "outlined") {
      bgColor = disabled
        ? "bg-button-outline-bg-disabled border border-button-outline-border"
        : "border border-button-outline-border hover:bg-button-outline-bg-hover";
      fontClass = `${fontClass} text-button-outline-text`;
    }
    // ghost button type block logic
    if (type === "ghost") {
      bgColor = `bg-transparent hover:bg-button-ghost-bg-hover`;
      fontClass = `${fontClass} text-button-ghost-text underline`;
    }
  }

  // If Disabled - override with disabled colors
  if (disabled) {
    if (isDanger) {
      if (type === "primary") {
        bgColor = `bg-button-danger-bg-disabled cursor-not-allowed`;
        fontClass = `${fontClass} text-button-danger-text-disabled`;
      }
      if (type === "outlined") {
        bgColor = `bg-button-danger-outline-bg-disabled border border-button-danger-outline-border cursor-not-allowed`;
        fontClass = `${fontClass} text-button-danger-outline-text-disabled`;
      }
    } else {
      if (type === "primary") {
        bgColor = `bg-button-primary-bg-disabled cursor-not-allowed`;
        fontClass = `${fontClass} text-button-primary-text-disabled`;
      }
      if (type === "secondary") {
        bgColor = `bg-[--secondary-colors-disabled] cursor-not-allowed`;
        fontClass = `${fontClass} text-white`;
      }
      if (type === "outlined") {
        bgColor = `bg-button-outline-bg-disabled border border-button-outline-border cursor-not-allowed`;
        fontClass = `${fontClass} text-button-outline-text-disabled`;
      }
      if (type === "ghost") {
        bgColor = `bg-transparent cursor-not-allowed`;
        fontClass = `${fontClass} text-color-text-disabled underline`;
      }
    }
  }

  // Check for sizes
  let sizeClasses = "";
  if (size === "small") {
    sizeClasses = "p-[8px]";
    if (type === "outlined") {
      sizeClasses += "p-[7px]";
    }
  }
  if (size === "medium") {
    sizeClasses = "p-[10px] text-[16px] leading-[16px]";
    if (type === "outlined") {
      sizeClasses += "p-[11px]";
    }
  }
  if (size === "large") {
    sizeClasses = "p-[16px] text-[18px] leading-[20px]";
    if (type === "outlined") {
      sizeClasses += "p-[15px]";
    }
  }

  const containerClass = `${btnContainerClass} ${bgColor} ${sizeClasses} ${disabled ? "pointer-events-none cursor-not-allowed" : ""} ${className}`;
  if (onlyIcon) {
    if (href) {
      const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      return (
        <Link
          href={href}
          aria-disabled={disabled || undefined}
          onClick={handleClick}
          // next/link renders an <a>; ref typing is not always compatible across Next versions.
          ref={ref as any}
          className={containerClass}
        >
          {leftcomp && (
            <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{leftcomp}</Box>
          )}
          {rightcomp && (
            <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{rightcomp}</Box>
          )}
        </Link>
      );
    }

    return (
      <Box
        ref={ref as any}
        {...rest}
        {...(disabled ? { "aria-disabled": true as const } : {})}
        className={containerClass}
        {...(onClick ? { onClick: handleButtonClick } : {})}
      >
        {leftcomp && (
          <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{leftcomp}</Box>
        )}
        {rightcomp && (
          <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{rightcomp}</Box>
        )}
      </Box>
    );
  }

  // OD-1332
  if (size === "large") fontClass += ` typography-button-01`;
  if (size === "medium") fontClass += ` typography-button-01`;
  if (size === "small") fontClass += ` typography-button-02`;
  if (size === "link") fontClass += ` typography-link-03`;

  const stripHoverClasses = (classes: string) =>
    classes
      .replace(/\bhover:\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if (isLoading) {
    let loadingBg = stripHoverClasses(bgColor);
    if (type === "primary" && !disabled) {
      loadingBg = "bg-button-primary-bg-disabled border border-button-primary-bg-disabled";
    }

    const loadingContainerClass = `${btnContainerClass} ${loadingBg} ${sizeClasses} pointer-events-none cursor-wait ${className}`;

    return (
      <Box
        ref={ref as any}
        {...{ onClick: undefined, ...rest }}
        className={loadingContainerClass}
        onClick={() => {}}
      >
        <Box className={`select-none ${fontClass} flex items-center justify-center`}>
          <Spinner size="small" color={usageAt ? "#918f7c" : "#0a4932"} />
        </Box>
      </Box>
    );
  }

  if (href) {
    const handleClick = (e: React.MouseEvent) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleOnClick = (e: React.MouseEvent) => {
      handleClick(e);
      // In link-mode we keep behavior identical for non-disabled clicks:
      if (!disabled) {
        onClick?.();
      }
    };

    return (
      <Link
        href={href}
        aria-disabled={disabled || undefined}
        onClick={handleOnClick}
        ref={ref as any}
        className={containerClass}
      >
        {leftcomp && (
          <Box
            className={`relative flex h-5 w-5 select-none items-start justify-center ${disabled ? "opacity-55" : ""}`}
          >
            {leftcomp}
          </Box>
        )}
        <Box className={`select-none ${fontClass}`}>{children}</Box>
        {rightcomp && (
          <Box className={`relative h-5 w-5 select-none ${disabled ? "opacity-55" : ""}`}>
            {rightcomp}
          </Box>
        )}
      </Link>
    );
  }

  return (
    <Box
      ref={ref as any}
      {...rest}
      {...(disabled ? { "aria-disabled": true as const } : {})}
      className={containerClass}
      {...(onClick ? { onClick: handleButtonClick } : {})}
    >
      {leftcomp && (
        <Box
          className={`relative flex h-5 w-5 select-none items-center justify-start ${disabled ? "opacity-55" : ""}`}
        >
          {leftcomp}
        </Box>
      )}
      {passedIcon ? (
        <Box className="flex items-center justify-center">{passedIcon}</Box>
      ) : (
        <Box className={`select-none ${fontClass}`}>{children}</Box>
      )}

      {rightcomp && (
        <Box
          className={`relative flex h-5 w-5 select-none items-center justify-center ${disabled ? "opacity-55" : ""}`}
        >
          {rightcomp}
        </Box>
      )}
    </Box>
  );
});

OGButton.displayName = "OGButton";
