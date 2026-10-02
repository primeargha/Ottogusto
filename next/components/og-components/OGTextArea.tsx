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
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { custom } from "zod";

type InputState = "default" | "filled" | "error" | "disabled";

interface OGTextAreaProps {
  state?: InputState;
  mandatory?: boolean;
  title?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  placeholder?: string;
  className?: string;
  isReadOnly?: boolean;
  rows?: number;
  customClassName?: string;
}

export const OGTextArea: React.FC<OGTextAreaProps> = ({
  state = "default",
  mandatory = false,
  title,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Enter text",
  className = "",
  isReadOnly = false,
  customClassName,
  rows = 6,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const getBorderAndBgStyle = () => {
    if (state === "error")
      return "border border-color-system-error-main bg-color-background-default";
    if (state === "disabled" && value && value.trim() !== "")
      return "border border-color-border-emphasis bg-color-background-default";
    if (isFocused) return "border border-color-border-emphasis bg-color-background-default";
    if (value && value.trim() !== "") {
      if (state === "disabled")
        return "border border-color-border-emphasis bg-color-background-default";
      return "border border-color-border-emphasis bg-color-background-default";
    }
    return "border border-color-border-emphasis bg-color-background-default";
  };

  const getHoverStyle = () => {
    if (state === "disabled") return "";
    return "hover:border-[--Primary-Colors-Main]";
  };

  const getTextStyle = () => {
    if (state === "disabled")
      return "text-color-text-body placeholder:text-color-text-body font-medium";
    if (state === "filled") return "text-color-text-body font-medium";
    return "font-medium";
  };

  return (
    <FormControl isInvalid={state === "error"} className="w-full">
      {/* {title && (
        <FormControlLabel>
          <FormControlLabelText className="font-Overpass text-[18px] font-medium leading-[20px] text-color-text-body [font-feature-settings:'liga_off','clig_off']">
            {title}
            {mandatory && <Text className="ml-1 text-[18px] text-color-text-body">*</Text>}
          </FormControlLabelText>
        </FormControlLabel>
      )} */}
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

      <Box
        className={`relative w-full shrink-0 rounded-[4px] p-[12px] transition-all duration-200 ${getBorderAndBgStyle()} ${getHoverStyle()} ${getTextStyle()} ${className}`}
      >
        <Textarea
          isDisabled={isReadOnly || state === "disabled"}
          isInvalid={state === "error"}
          className={`h-full w-full border-0 ${customClassName ? customClassName : "min-h-[120px]"} `}
        >
          <TextareaInput
            value={value}
            onChangeText={onChange}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`text-default h-full w-full resize-none bg-transparent font-Overpass leading-[18px] text-color-text-body outline-none placeholder:text-[--Text-Tarmac-Placeholder] ${getTextStyle()}`}
          />
        </Textarea>
      </Box>

      {state === "error" && error && (
        <FormControlError>
          <FormControlErrorText className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main [font-feature-settings:'liga'_off,'clig'_off]">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
