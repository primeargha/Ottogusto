import React from "react";

import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import IconCircle from "../icons/IconCircle";
import Alert01 from "../icons/Alert01";
import AlertDiamond from "../icons/AlertDiamond";
import Typography from "./Typography";

export type AlertVariant = "info" | "warning" | "error" | "transparent";

interface OGAlertProps {
  title: string;
  description: string;
  variant: AlertVariant;
  className?: string;
  iconSize?: number;
  textClassName?: string;
  iconColor?: string;
  paddingClasses?: string;
}

const getAlertStyles = (variant: AlertVariant, iconSize: number = 24, iconColor: string) => {
  const styles = {
    info: {
      bg: "bg-color-background-info-muted",
      text: "text-color-text-body",
      subText: "text-color-text-body",
      icon: <IconCircle size={iconSize} color={iconColor} />,
    },
    warning: {
      bg: "bg-[--System-Colors-Warning-Extra-Light]",
      text: "text-color-text-body",
      subText: "text-color-text-body",
      icon: <Alert01 size={iconSize} color={iconColor} />,
    },
    error: {
      bg: "bg-[--System-Colors-Error-Extra-Light]",
      text: "text-color-text-body",
      subText: "text-color-text-body",
      icon: <AlertDiamond size={iconSize} color={iconColor} />,
    },
    transparent: {
      bg: "bg-transparent",
      text: "text-color-text-body",
      subText: "text-color-text-body",
      icon: <IconCircle size={iconSize} color={iconColor} />,
    },
  };

  return styles[variant];
};

export const OGAlert: React.FC<OGAlertProps> = ({
  title,
  description,
  variant,
  className = "",
  iconSize = 24,
  textClassName = "",
  iconColor = "var(--Text-Tarmac)",
  paddingClasses = "px-space-md",
}) => {
  const styles = getAlertStyles(variant, iconSize, iconColor);
  return (
    <Box
      className={`flex flex-row items-center gap-space-sm rounded-md ${paddingClasses} py-space-md ${styles.bg} ${className}`}
    >
      <Box className="h-4 max-h-4 min-h-4 w-4 min-w-4 max-w-4">{styles.icon}</Box>
      <Typography className={`typography-caption ${styles.text}`}>
        {title !== "" && (
          <Typography className={`typography-caption ${styles.text} ${textClassName}`}>
            {title}:
          </Typography>
        )}{" "}
        <Typography className={`typography-caption ${styles.subText} ${textClassName} mt-1`}>
          {description}
        </Typography>
      </Typography>
    </Box>
  );
};
