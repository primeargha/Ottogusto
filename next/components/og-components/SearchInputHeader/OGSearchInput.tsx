import React from "react";

import { Input, InputField } from "@/components/og-components/SearchInputHeader";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";

type InputState = "default" | "filled" | "error" | "disabled";
type IconPosition = "left" | "right";

interface OGSearchInputProps {
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
  onIconClick?: () => void;
  //   isHeaderTrue?: boolean | string;
}

export const OGSearchInput: React.FC<OGSearchInputProps> = ({
  state = "default",
  mandatory = false,
  isInfo = false,
  onKeyDown,
  onSubmitEditing,
  infoText,
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
  //   isHeaderTrue,
  isReadOnly = false,
  autoComplete = "off",
  isOutline = false,
  autoFocus = false,
  onIconClick,
}) => {
  // const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
  const getBorderAndBgStyle = (isFocused: boolean) => {
    // Error state has priority
    if (state === "error")
      return "border border-color-system-error-main bg-color-header-searchbar-bg";
    if (state === "disabled" && value && value.trim() !== "") {
      return `border-color-border-default bg-color-header-searchbar-bg cursor-not-allowed`;
    }
    if (isFocused) {
      return ` border focus:border-color-border-focus bg-color-header-searchbar-bg`;
    }
    if (value && value.trim() !== "") {
      if (state === "disabled" || isReadOnly) {
        return `border-color-background-emphasis bg-color-neutral-disabled cursor-not-allowed`;
      }
      return `border bg-color-header-searchbar-bg border-color-border-default hover:border-color-border-focus`;
    }
    return `border   bg-color-header-searchbar-bg border-color-border-default hover:border-color-border-focus `;
  };

  const getTextStyle = () => {
    if (state === "disabled")
      return `text-color-text-muted placeholder:text-color-text-muted typography-body-02`;
    if (state === "filled") return `text-color-text-muted typography-body-02 `;
    return `text-color-text-muted typography-body-02`;
  };

  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<any>(null);
  return (
    <FormControl isInvalid={state === "error"} className="w-full">
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

      <Input
        isReadOnly={isReadOnly || state === "disabled"}
        className={`bg-color-searchbar-bg h-[40px] w-full shrink-0 rounded-md px-space-sm py-space-xs ${getBorderAndBgStyle(isFocused)} ${className} ${getTextStyle()} ${!isOutline ? " " : ""}`}
        id="searchInputHeader"
      >
        {icon && iconPosition === "left" && <Box className="ml-3">{icon}</Box>}
        <InputField
          id="OGsearchInput"
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
          className={`${icon && iconPosition === "left" ? "pl-[12px]" : "pl-0"} ${isReadOnly || state === "disabled" ? "pointer-events-none" : ""}border-none outline-none focus:border-none focus:outline-none`}
          tabIndex={isReadOnly || state === "disabled" ? -1 : undefined}
          autoComplete={autoComplete as any}
          autoFocus={autoFocus}
        />
        {icon && iconPosition === "right" && (
          <Box
            {...(onIconClick ? { "data-brand-search-clear": "" } : {})}
            className="flex shrink-0 cursor-pointer items-center justify-center p-1"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onIconClick) {
                onIconClick();
              } else {
                inputRef.current?.focus();
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
        <Text className="mt-1 font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body opacity-70">
          {infoText}
        </Text>
      )}
    </FormControl>
  );
};
