import React from "react";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import { CircleIcon } from "@/components/ui/icon";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { useMedia } from "@/hooks/useMedia";

type RadioState = "default" | "disabled" | "hover";

interface OGRadioInputProps<T extends string> {
  value: T;
  label: string | React.ReactNode;
  isInvalid?: boolean;
  state?: RadioState;
  isDisabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

interface OGRadioGroupProps<T extends string> {
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  children: React.ReactNode;
  className?: string;
  error?: string;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

export function OGRadioInput<T extends string>({
  value,
  label,
  size = "md",
  isInvalid,
  state = "default",
  isDisabled,
}: OGRadioInputProps<T>) {
  const truncateLabel = (text?: string, maxLength = 35) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const truncateLabelmobile = (text?: string, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const isMobile = useMedia("(max-width: 539px)");
  return (
    <Radio
      value={value}
      size={size as any}
      isInvalid={isInvalid || false}
      isDisabled={isDisabled || state === "disabled"}
      className="inline-flex cursor-pointer items-center justify-start"
    >
      <RadioIndicator className="mt-[-2px] border-color-icon-default data-[checked=true]:border-color-icon-default data-[hover=true]:border-color-icon-default">
        <RadioIcon
          as={CircleIcon}
          className={`${
            isDisabled || state === "disabled"
              ? "fill-[--primary-colors-disabled] text-[--primary-colors-disabled]"
              : "fill-color-icon-brand text-color-icon-default"
          }`}
        />
      </RadioIndicator>
      <RadioLabel
        className={`font-400 font-Overpass text-[16px] leading-[18px] ${
          isDisabled || state === "disabled"
            ? "text-[--Text-Tarmac-Disabled]"
            : "text-color-text-body data-[checked=true]:text-color-text-body"
        }`}
      >
        {isMobile ? truncateLabelmobile(label as string) : truncateLabel(label as string)}
      </RadioLabel>
    </Radio>
  );
}

export function OGRadioGroup<T extends string>({
  value,
  onChange,
  onBlur,
  children,
  className = "",
  error,
  isInvalid,
  isReadOnly,
}: OGRadioGroupProps<T>) {
  return (
    <FormControl isInvalid={isInvalid || false}>
      <RadioGroup
        className={`flex flex-row gap-4 ${className}`}
        value={value ?? ""}
        onChange={(val: string) => {
          onChange?.(val as T);
        }}
        onBlur={onBlur}
        isReadOnly={isReadOnly || false}
      >
        {children}
      </RadioGroup>
      {isInvalid && error && (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
