import React from "react";

import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import Typography from "./Typography";

type InputState = "default" | "filled" | "error" | "disabled";
type IconPosition = "left" | "right";

interface OGTextInputProps {
  state?: InputState;
  mandatory?: boolean;
  isInfo?: boolean;
  infoText?: string;
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  placeholder?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  onKeyDown?: (e: any) => void;
  onBlur?: () => void;
  error?: string | undefined;
  className?: string;
  maxLength?: number;
  autoComplete?: string;
  isReadOnly?: boolean;
  isOutline?: boolean;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  isHeaderTrue?: boolean | string;
  customWidth?: boolean | string;
}

export const OGTextInput: React.FC<OGTextInputProps> = ({
  state = "default",
  mandatory = false,
  isInfo = false,
  onKeyDown,
  onSubmitEditing,
  infoText,
  customWidth,
  title,
  icon,
  iconPosition = "right",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  className = "",
  maxLength,
  isHeaderTrue,
  isReadOnly = false,
  autoComplete = "off",
  isOutline = false,
  autoFocus = false,
}) => {
  const getBorderAndBgStyle = (isFocused: boolean) => {
    // Error state has priority
    if (state === "error") return "border border-color-system-error-main bg-color-background-l1";
    if (state === "disabled" && value && value.trim() !== "") {
      return `${isHeaderTrue ? " border-color-background-emphasis" : "border-color-background-emphasis"} border bg-[var(--color-beige-800)]`;
    }
    if (isFocused) {
      return ` border ${isHeaderTrue ? "bg-color-header-searchbar-bg hover:border-color-border-focus focus:border-color-border-focus" : "bg-color-background-default border-color-background-emphasis"}`;
    }
    if (value && value.trim() !== "") {
      if (state === "disabled" || isReadOnly) {
        return `border-color-background-emphasis bg-color-neutral-disabled cursor-not-allowed`;
      }
      // if (state === "disabled") return "border-color-background-l8 bg-color-neutral-disabled";
      return `border ${isHeaderTrue ? "bg-color-header-searchbar-bg border-color-border-default hover:border-color-border-focus " : "bg-color-background-default border-color-border-emphasis"}`;
    }
    return `border  ${isHeaderTrue ? "bg-color-header-searchbar-bg border-color-border-default hover:border-color-border-focus " : "bg-color-background-default border-color-border-emphasis"} `;
  };

  const getTextStyle = () => {
    if (state === "disabled")
      return `text-color-text-body placeholder:text-color-text-body ${isHeaderTrue ? "typography-body-02" : " body-medium-sm"}`;
    if (state === "filled")
      return `text-color-text-body   ${isHeaderTrue ? "typography-body-02" : " body-medium-sm"}`;
    return ` ${isHeaderTrue ? "typography-body-02" : " body-medium-sm"}`;
  };

  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<any>(null);
  return (
    <FormControl isInvalid={state === "error"} className={` ${customWidth ? "" : "w-full"} `}>
      {title && (
        <FormControlLabel>
          <FormControlLabelText className="text-color-text-default typography-body-02">
            {title}
            {mandatory && (
              <Text className="ml-1 mt-1 text-color-text-danger typography-caption">*</Text>
            )}
          </FormControlLabelText>
        </FormControlLabel>
      )}
      {/*  */}
      <Input
        isReadOnly={isReadOnly || state === "disabled"}
        className={`${icon && iconPosition === "right" ? "relative" : ""} bg-color-searchbar-bg h-auto w-full shrink-0 rounded-[4px] p-[12px] ${getBorderAndBgStyle(isFocused)} ${className} ${getTextStyle()} ${!isOutline ? " " : ""}`}
      >
        {icon && iconPosition === "left" && <Box className="ml-3 shrink-0">{icon}</Box>}
        <InputField
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          //@ts-ignore
          onKeyDown={onKeyDown}
          onSubmitEditing={onSubmitEditing}
          onBlur={() => {
            setIsFocused(false);

            onBlur && onBlur();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`min-w-0 flex-1 ${icon && iconPosition === "left" ? "pl-[12px]" : "pl-0"} ${icon && iconPosition === "right" ? "pr-8" : ""} ${isReadOnly || state === "disabled" ? "pointer-events-none" : ""} border-none outline-none focus:border-none focus:outline-none`}
          tabIndex={isReadOnly || state === "disabled" ? -1 : undefined}
          autoComplete={autoComplete as any}
          autoFocus={autoFocus}
        />
        {icon && iconPosition === "right" && (
          <Box
            className="absolute right-3 top-1/2 flex shrink-0 -translate-y-1/2 items-center justify-center"
            onClick={() => inputRef.current?.focus()}
          >
            {icon}
          </Box>
        )}
      </Input>

      {state === "error" && error && (
        <FormControlError className="mt-[6px]">
          <FormControlErrorText className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main [font-feature-settings:'liga'_off,'clig'_off]">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}

      {isInfo && infoText && (
        <Typography className="mt-1 font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body opacity-70">
          {infoText}
        </Typography>
      )}
    </FormControl>
  );
};
