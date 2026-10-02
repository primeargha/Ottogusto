import React from "react";

import { Text } from "@/components/ui/text";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import Typography from "./Typography";

type CheckboxState = "default" | "hover" | "disabled";
type CheckboxSelected = "yes" | "no" | "partial";

interface OGCheckboxInputProps {
  state?: CheckboxState;
  selected?: CheckboxSelected;
  label: string;
  onChange?: (isSelected: boolean) => void;
  onBlur?: () => void;
  error?: string;
  isInvalid?: boolean;
  title?: string;
  className?: string;
  indicatorClassName?: string;
  labelClassName?: string;
  value?: number | null | string;
}

export const OGCheckboxInput: React.FC<OGCheckboxInputProps> = ({
  state = "default",
  selected = "no",
  label,
  onChange,
  onBlur,
  error,
  isInvalid,
  title,
  className,
  indicatorClassName,
  value,
  labelClassName,
}) => {
  const isChecked = selected === "yes";
  const isDisabled = state === "disabled";
  const checkboxId = `checkbox-${value || label}`;

  return (
    <FormControl isInvalid={isInvalid || false}>
      {title && <Text className="mb-2 text-color-text-body typography-body-01">{title}</Text>}
      <Checkbox
        size="md"
        isChecked={isChecked}
        isDisabled={isDisabled}
        onChange={() => {
          // Toggle the checkbox - pass the NEW value (opposite of current)
          onChange?.(!isChecked);
        }}
        onBlur={onBlur}
        className={`rounded-[2px] ${isDisabled ? "opacity-40" : ""} ${className || ""}`}
        aria-label={label}
        id={checkboxId}
        value={""}
      >
        {/*@ts-ignore */}
        <CheckboxIndicator
          className={`cursor-pointer rounded-[2px] border-color-border-neutral data-[hover=true]:border-color-background-l8 ${
            isDisabled
              ? "data-[checked=true]:border-[--primary-colors-disabled] data-[checked=true]:bg-[--primary-colors-disabled]"
              : "data-[checked=true]:border-color-border-focus data-[checked=true]:bg-color-icon-brand"
          } ${isInvalid ? "!border-color-system-error-main" : ""}${indicatorClassName || ""}`}
        >
          {/* @ts-ignore */}
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>
        {/*@ts-ignore */}
        <Typography className={labelClassName}>{label}</Typography>
        {/* <CheckboxLabel
          htmlFor={checkboxId}
          className={`cursor-pointer base:text-wrap ${
            isDisabled
              ? "text-[--Text-Tarmac-Disabled]"
              : isChecked
                ? "text-color-text-body"
                : "text-color-text-body"
          }${labelClassName || ""}`}
        >
          {label}
        </CheckboxLabel> */}
      </Checkbox>
      {isInvalid && error && (
        <FormControlError>
          <FormControlErrorText className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
