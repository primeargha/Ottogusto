import React from "react";

import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import VectorDropdown from "../icons/VectorDropdown";

type SelectState = "default" | "filled" | "error" | "disabled";
type IconPosition = "left" | "right";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface OGSelectDropdownProps {
  state?: SelectState;
  mandatory?: boolean;
  isInfo?: boolean;
  infoText?: string;
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  placeholder?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  error?: string | undefined;
  className?: string;
  isIcon?: boolean;
  options?: SelectOption[];
  isDisabled?: boolean;
}

export const OGSelectDropdown: React.FC<OGSelectDropdownProps> = ({
  state = "default",
  mandatory = false,
  isInfo = false,
  infoText,
  title,
  icon,
  iconPosition = "left",
  placeholder = "Select an option",
  value,
  onChange,
  error,
  className = "",
  isIcon = false,
  options = [],
  isDisabled = false,
}) => {
  const getBorderAndBgStyle = (isFocused: boolean) => {
    if (state === "error")
      return "border border-color-system-error-main bg-color-background-default";
    if (state === "disabled" && value && value.trim() !== "")
      return "border-color-background-l8 bg-[var(--color-beige-800)]";
    //
    if (isFocused) return "border-color-neutral-main bg-color-background-default";
    if (value && value.trim() !== "") {
      if (state === "disabled") return "border-color-background-l8 bg-[var(--color-beige-800)]";
      return "border-color-border-emphasis bg-color-background-default";
    }
    return "border-color-border-emphasis bg-color-background-default";
  };

  const getTextStyle = () => {
    if (state === "disabled") return "text-color-text-body font-medium";
    if (state === "filled") return "text-color-text-body font-medium";
    return "text-color-text-body font-medium";
  };

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <FormControl isInvalid={state === "error"} className="w-full">
      {title && (
        <FormControlLabel>
          <FormControlLabelText className="text-color-text-default typography-body-02">
            {title}
            {mandatory && <Text className="ml-1 text-color-text-danger typography-caption">*</Text>}
          </FormControlLabelText>
        </FormControlLabel>
      )}

      <Select
        selectedValue={value as string}
        onValueChange={onChange as (value: string) => void}
        className="h-auto w-full"
        isDisabled={isDisabled || state === "disabled"}
      >
        <SelectTrigger
          className={`h-auto w-full shrink-0 rounded-[4px] p-[7px] ${getBorderAndBgStyle(isFocused)} ${className} ${getTextStyle()}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {icon && iconPosition === "left" && <Box className="ml-3">{icon}</Box>}

          {value && options.find((opt) => opt.value === value) ? (
            <Text className={`body-medium-sm ${getTextStyle()}`}>
              {options.find((opt) => opt.value === value)?.label}
            </Text>
          ) : (
            <SelectInput placeholder={placeholder} />
          )}

          <Box className="ml-auto flex flex-row items-center px-2">
            <VectorDropdown
              width={12}
              height={6}
              color={
                state === "disabled" ? "var(--Text-Tarmac-Disabled)" : "var(--Primary-Colors-Main)"
              }
            />
          </Box>
        </SelectTrigger>

        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-color-background-l1">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>

            {options?.map((option) => (
              <SelectItem
                key={option.value}
                label={option.label}
                value={option.value}
                isDisabled={option.disabled || false}
                className={` ${
                  option.disabled ? "cursor-not-allowed text-gray-400 opacity-50" : "cursor-pointer"
                } `}
              />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>

      {state === "error" && error && (
        <FormControlError className="mt-[6px]">
          <FormControlErrorText className="text-color-system-error-main body-regular-sm">
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
