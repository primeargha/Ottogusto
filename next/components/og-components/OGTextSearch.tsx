import React from "react";

import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";

type InputState = "default" | "filled" | "error" | "disabled";
interface OGTextSearchProps {
  state?: InputState;
  inputRef?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClick?: () => void;
  onTouchStart?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  name?: string;
  id?: string;
  leftcomp?: React.ReactNode; // Allows passing a left-side icon or image
  rightcomp?: React.ReactNode; // Allows passing a left-side icon or image
  error?: string;
}

export const OGTextSearch: React.FC<OGTextSearchProps> = ({
  state = "default",
  inputRef,
  placeholder,
  className = "",
  value,
  onChange,
  onClick,
  onTouchStart,
  onKeyDown,
  autoFocus = false,
  autoComplete = "off",
  name,
  id,
  leftcomp,
  rightcomp,
  error,
}) => {
  const getBorderStyle = () => {
    switch (state) {
      case "error":
        return "border border-color-system-error-main bg-[var(--color-beige-800)]";
      case "disabled":
        return "border border-color-background-l8 bg-[var(--color-beige-800)]";
      case "filled":
        return "border border-color-background-l8 bg-[var(--color-beige-800)]";
      default:
        return "border !border-[--brand-piston-green]";
    }
  };

  const getTextStyle = () => {
    if (state === "disabled")
      return "text-[--Text-Tarmac-Placeholder] placeholder:text-[--Text-Tarmac-Placeholder]";
    if (state === "filled") return "text-color-text-body";
    return "";
  };
  return (
    <FormControl isInvalid={!!error} className="w-full">
      <Input
        ref={inputRef as any}
        // className={`flex w-full items-center text-center font-Overpass justify-between gap-3 self-stretch rounded-[4px] border border-[#CDC8B6] bg-transparent p-6 px-0 py-2 text-lg leading-relaxed text-[--searchbar-text-green] focus:outline-none ${className}`}
        className={`h-auto w-full shrink-0 rounded-[4px] bg-color-background-l2 ${getBorderStyle()} ${className} ${getTextStyle()} data-[focus=true]:border-[--Primary-Colors-Main] data-[focus=true]:bg-[--brand-pure-white] data-[focus=true]:shadow-[0px_24px_65px_0px_rgba(20,20,43,0.16)] ${state === "disabled" ? "data-[focus=true]:border-color-background-l8 data-[focus=true]:bg-[var(--color-beige-800)]" : ""} outline-none focus:outline-none`}
      >
        {leftcomp && <Box>{leftcomp}</Box>}
        <InputField
          value={value}
          //@ts-ignore
          onChange={(e) => onChange && onChange(e.target.value)}
          onClick={onClick}
          onTouchStart={onTouchStart}
          // @ts-ignore
          onKeyPress={onKeyDown} // KeyDown event is not available for this input
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={"off"}
          className="font-Overpass text-[16px] font-medium outline-none focus:border-none focus:outline-none"
          name={name}
          id={id}
        />
        {rightcomp && <Box>{rightcomp}</Box>}
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main [font-feature-settings:'liga'_off,'clig'_off]">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
