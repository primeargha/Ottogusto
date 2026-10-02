import React from "react";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { Pressable } from "../ui/pressable";
import { Spinner } from "../ui/spinner";

type ButtonVariant = "primary" | "outline" | "danger" | "danger-outline";

type ButtonSize = "small" | "medium" | "large";
type Rounded = "none" | "sm" | "md" | "lg" | "full";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: Rounded;
  disabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;

  leftcomp?: React.ReactNode;
  rightcomp?: React.ReactNode;
}

export const OGButton2: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  rounded = "md",
  disabled = false,
  isLoading = false,
  onPress,
  children,
  style,
  leftcomp,
  rightcomp,
}) => {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bgDefault: "var(--color-button-primary-bg-default)",
          bgHover: "var(--color-button-primary-bg-hover)",
          bgDisabled: "var(--color-button-primary-bg-disabled)",
          text: "var(--color-button-primary-text)",
          textDisabled: "var(--color-button-primary-text-disabled)",
          icon: "var(--color-button-primary-icon)",
          iconDisabled: "var(--color-button-primary-icon-disabled)",
          borderColor: "transparent",
        };

      case "outline":
        return {
          bgDefault: "var(--color-button-outline-bg-default)",
          bgHover: "var(--color-button-outline-bg-hover)",
          bgDisabled: "var(--color-button-outline-bg-disabled)",
          text: "var(--color-button-outline-text)",
          textDisabled: "var(--color-button-outline-text-disabled)",
          icon: "var(--color-button-outline-icon)",
          iconDisabled: "var(--color-button-outline-icon-disabled)",
          borderColor: "var(--color-button-outline-border)",
        };

      case "danger":
        return {
          bgDefault: "var(--color-button-danger-bg-default)",
          bgHover: "var(--color-button-danger-bg-hover)",
          bgDisabled: "var(--color-button-danger-bg-disabled)",
          text: "var(--color-button-danger-text)",
          textDisabled: "var(--color-button-danger-text-disabled)",
          icon: "var(--color-button-danger-icon)",
          iconDisabled: "var(--color-button-danger-icon-disabled)",
          borderColor: "transparent",
        };

      case "danger-outline":
        return {
          bgDefault: "var(--color-button-danger-outline-bg-default)",
          bgHover: "var(--color-button-danger-outline-bg-hover)",
          bgDisabled: "var(--color-button-danger-outline-bg-disabled)",
          text: "var(--color-button-danger-outline-text)",
          textDisabled: "var(--color-button-danger-outline-text-disabled)",
          icon: "var(--color-button-danger-outline-icon)",
          iconDisabled: "var(--color-button-danger-outline-icon-disabled)",
          borderColor: "var(--color-button-danger-outline-border)",
        };

      default:
        return {};
    }
  };

  /* ---------- Size Classes ---------- */
  const sizeClasses = {
    small: "px-3 py-1.5",
    medium: "px-4 py-2",
    large: "px-5 py-3",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const styles = getStyles();
  const isDisabled = disabled || isLoading;

  const getBg = (hovered: boolean) => {
    if (isDisabled) return styles.bgDisabled;
    if (hovered) return styles.bgHover;
    return styles.bgDefault;
  };

  const textColor = isDisabled ? styles.textDisabled : styles.text;
  const iconColor = isDisabled ? styles.iconDisabled : styles.icon;

  return (
    <Pressable
      onPress={!isDisabled ? onPress : undefined}
      style={({ hovered }: any) => [
        {
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {({ hovered }: any) => (
        <Box
          className={`flex w-fit flex-row items-center justify-center ${sizeClasses[size]} ${roundedClasses[rounded]} ${variant.includes("outline") ? "border" : ""} `}
          style={{
            backgroundColor: getBg(hovered),
            borderColor: styles.borderColor,
          }}
        >
          {/* ------- LOADING SPINNER ------- */}
          {isLoading && <Spinner size={size as any} color={textColor} />}

          {/* ------- CONTENT (HIDDEN WHEN LOADING) ------- */}
          {!isLoading && (
            <>
              {leftcomp && (
                <Box className="mr-2" style={{ color: iconColor ?? "" }}>
                  {leftcomp}
                </Box>
              )}

              <Text className={`font-medium ${textSizeClasses[size]}`} style={{ color: textColor }}>
                {children}
              </Text>

              {rightcomp && (
                <Box className="ml-2" style={{ color: iconColor ?? "" }}>
                  {rightcomp}
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Pressable>
  );
};
