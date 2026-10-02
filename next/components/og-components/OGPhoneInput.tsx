import React, { useEffect, useMemo, useState } from "react";

import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";

//@ts-ignore
import "react-phone-number-input/style.css";

type InputState = "default" | "filled" | "error" | "disabled";

interface OGPhoneInputProps {
  state?: InputState;
  mandatory?: boolean;
  title?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  placeholder?: string;
  defaultCountry?: string;
  isReadOnly?: boolean;
  className?: string;
}

export const OGPhoneInput: React.FC<OGPhoneInputProps> = ({
  state = "default",
  mandatory = false,
  title,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Enter phone number",
  defaultCountry,
  isReadOnly = false,
  className,
}) => {
  const [userSelectedCountry, setUserSelectedCountry] = useState<string | undefined>(undefined);

  // Decide which country to show the flag for:
  // - Prefer the country implied by the current phone `value` (if parsable),
  // - Otherwise fall back to the provided `defaultCountry` (from dropdown / locale).
  const derivedDefaultCountry = useMemo(() => {
    const trimmed = value?.trim() || "";
    // If the input is empty, respect the last manual country selection.
    // When there is a phone value, prefer the country implied by the value
    // so the flag never gets stuck after repeated country switches.
    if (!trimmed) {
      return userSelectedCountry || defaultCountry;
    }

    // 1. Special-case: +39 is ambiguous in libphonenumber (Italy, Vatican, etc.).
    //    For our use case we always want to treat +39 as Italy when we can't parse it.
    if (trimmed.startsWith("+39")) {
      return "IT";
    }

    // 2. Prefer the country implied by the current phone value, when parsable.
    if (trimmed) {
      try {
        const parsed = parsePhoneNumber(trimmed as any);
        if (parsed && parsed.country) {
          return parsed.country as string;
        }
      } catch {
        // Ignore parse errors and fall back to the provided defaultCountry below.
      }
    }

    // 3. Fallback: whatever the parent passed in (dropdown / locale).
    return defaultCountry;
  }, [value, defaultCountry, userSelectedCountry]);

  // Reset the manual country override when the user clears the input.
  useEffect(() => {
    const trimmed = value?.trim() || "";
    if (!trimmed) {
      setUserSelectedCountry(undefined);
    }
  }, [value]);

  // If the parent is driving the input with a dial-code-only value (e.g. "+34", "+39"),
  // clear any stale manual country override that may be preventing the correct flag
  // from being shown on the first change.
  useEffect(() => {
    if (!userSelectedCountry) return;

    const trimmed = value?.trim() || "";
    if (!trimmed) return;

    // Dial-code-only heuristic: "+<digits>" where digits length <= 3.
    // (This matches how we treat "only dial code" in the address forms.)
    const digits = trimmed.replace(/\D/g, "");
    const isDialCodeOnly = trimmed.startsWith("+") && digits.length > 0 && digits.length <= 3;
    if (!isDialCodeOnly) return;

    const desiredCountry = (() => {
      if (trimmed.startsWith("+39")) return "IT";
      try {
        const parsed = parsePhoneNumber(trimmed as any);
        if (parsed?.country) return parsed.country as string;
      } catch {
        // ignore
      }
      return defaultCountry;
    })();

    if (desiredCountry && userSelectedCountry !== desiredCountry) {
      setUserSelectedCountry(undefined);
    }
  }, [value, userSelectedCountry, defaultCountry]);

  // Note: we intentionally do not clear `userSelectedCountry` on blur/value changes,
  // because selecting a country from the phone input UI may trigger blur before the
  // new country flag is rendered.

  const getBorderAndBgStyle = () => {
    return "border border-color-border-emphasis bg-color-background-default";
    // if (state === "error") return "border border-color-system-error-main bg-color-background-l1";
    // if (state === "disabled" && value && value.trim() !== "")
    //   return "border border-[#CDC8B6] bg-[#F2F1EB]";
    // if (isFocused) return "border border-[#CDC8B6] bg-color-background-l1";
    // if (value && value.trim() !== "") {
    //   if (state === "disabled") return "border border-[#CDC8B6] bg-[#F2F1EB]";
    //   return "border border-[#CDC8B6] bg-color-background-l1";
    // }
    // if (defaultCountry) return "border border-[#CDC8B6] bg-color-background-l1";
    // return "border border-[#CDC8B6] bg-color-background-l1";
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
      {title && (
        <FormControlLabel>
          <FormControlLabelText className="text-color-text-default typography-body-02">
            {title}
            {mandatory && (
              <span className="ml-1 text-[18px] text-color-text-danger typography-caption">*</span>
            )}
          </FormControlLabelText>
        </FormControlLabel>
      )}

      <Box
        className={`relative h-auto w-full shrink-0 rounded-[4px] p-[12px] transition-all duration-200 ${getBorderAndBgStyle()} ${getHoverStyle()} ${getTextStyle()}`}
      >
        <Box className="absolute bottom-0 left-14 top-0 h-auto w-[1px] bg-[--neutral-chrome-800]" />
        {/*
          FUTURE: Do not re-enable this key on PhoneInput while the user is typing.
          It remounts the input when dial-code vs full or derivedDefaultCountry changes,
          which steals focus and hides the caret. Kept for reference if we need a
          controlled remount only in specific parent-driven cases (e.g. external reset).

          key={`ogphone-${(() => {
            const trimmed = value?.trim() || "";
            const digits = trimmed.replace(/\D/g, "");
            const isDialCodeOnly =
              trimmed.startsWith("+") && digits.length > 0 && digits.length <= 3;
            return isDialCodeOnly ? "dial" : "full";
          })()}-${derivedDefaultCountry}`}
        */}
        <PhoneInput
          disabled={isReadOnly || state === "disabled"}
          international
          defaultCountry={derivedDefaultCountry as any}
          value={value || ""}
          className={className || ""}
          onChange={onChange as any}
          onCountryChange={(country) => {
            // Keep the selection only when user chose a specific country.
            // (country can be undefined when the library can't determine it)
            if (country && typeof country === "string" && /^[A-Z]{2}$/.test(country)) {
              setUserSelectedCountry(country as string);
            }
          }}
          onBlur={() => {
            onBlur?.();
          }}
          placeholder={placeholder}
          numberInputProps={{
            className:
              "h-full w-full pl-2 flex-1 bg-transparent outline-none placeholder:text-gray-500 p-0 font-medium",
            onBlur: () => {
              onBlur?.();
            },
          }}
        />
      </Box>

      {state === "error" && error && (
        <FormControlError>
          <FormControlErrorText className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
