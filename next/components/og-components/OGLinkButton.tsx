import { Box } from "../ui/box";

interface OGLinkButtonProps {
  type?: "primary" | "secondary";
  state?: "default" | "hover" | "disabled";
  icon?: "left" | "right" | "none";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  isDanger?: boolean; // Add isDanger prop

  children: React.ReactNode;
  onClick?: () => void;
  rightcomp?: React.ReactNode;
  leftcomp?: React.ReactNode;
  className?: string;
  textClass?: string;
}

export const OGLinkButton = (props: OGLinkButtonProps) => {
  const { textClass = "", ...rest } = props;
  const {
    className = ``,
    children,
    rightcomp = null,
    leftcomp = null,
    disabled = false,
    type = "primary",
    size = "medium",
    icon = "none",
    isDanger = false,
  } = rest;

  let btnContainerClass = `flex w-fit flex-row items-center inline-flex rounded justify-center items-center cursor-pointer`;

  // add margin for text box if left or right icon is applied
  let fontClass = `font-Overpass underline ${leftcomp && "ml-[12px]"} ${rightcomp && "mr-[12px]"}`;

  // Check for type prop with isDanger consideration
  let bgColor = "";
  if (isDanger) {
    // Danger variants
    if (type === "primary") {
      fontClass = `${fontClass} text-[--Primary-Colors-Main] hover:text-[--primary-colors-primary-hover]`;
    }
  } else {
    // Regular variants
    if (type === "primary") {
      fontClass = `${fontClass} text-[--Primary-Colors-Main] hover:text-[--primary-colors-primary-hover]`;
    }

    if (type === "secondary") {
      fontClass = `${fontClass} text-[--brand-traffic-light-green] hover:text-[--secondary-colors-hover]`;
    }
  }

  // If Disabled
  if (disabled) {
    if (isDanger) {
      if (type === "primary") {
        fontClass = `${fontClass} text-white`;
      }
    } else {
      if (type === "primary") {
        fontClass = `${fontClass} text-[--primary-colors-disabled]`;
      }
      if (type === "secondary") {
        fontClass = `${fontClass} text-[--secondary-colors-disabled]`;
      }
    }
  }

  // Check for sizes
  let sizeClasses = "";
  if (size === "small") {
    sizeClasses = "p-[8px] gap-[12px] text-[16px] leading-[18px]";
  }
  if (size === "medium") {
    sizeClasses = "p-[12px] text-[16px] leading-[18px]";
  }
  if (size === "large") {
    sizeClasses = "p-[16px] text-[18px] leading-[20px]";
  }

  const containerClass = `${btnContainerClass} ${bgColor} ${sizeClasses} ${className}`;
  return (
    <Box {...rest} className={containerClass}>
      {leftcomp && (
        <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{leftcomp}</Box>
      )}
      <Box className={`${fontClass} ${textClass}`}>{children}</Box>
      {rightcomp && (
        <Box className={`relative h-5 w-5 ${disabled ? "opacity-55" : ""}`}>{rightcomp}</Box>
      )}
    </Box>
  );
};
