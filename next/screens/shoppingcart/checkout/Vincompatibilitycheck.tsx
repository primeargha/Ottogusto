"use client";

import React, { useEffect } from "react";
import { Box } from "@/components/ui/box";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";
import GreenCircleTick from "@/screens/productdetails/GreenCircleTick";
import VinWarningIcon from "./components/VinWarningIcon";
import { VinCheckResultBoxes } from "./components/VinCheckResultBoxes";
import type { CartItem } from "@/stores/useCartStore";
import type { VinCheckPhase } from "./hooks/useCheckoutVinCheck";
import { VALID_VIN_REGEX, type VinCheckResult, type VinCheckUiCase } from "@/utils/vinCheck";

function getVinFieldError(vin: string, getLabel: (key: string) => string): string | undefined {
  if (!vin.length) return undefined;
  if (vin.length !== 17) return getLabel("vin_length_error");
  if (!VALID_VIN_REGEX.test(vin)) return getLabel("vin_invalid_characters");
  return undefined;
}

export interface VincompatibilitycheckProps {
  vinNumber: string;
  onVinChange: (vinNumber: string) => void;
  onVinError: (hasError: boolean) => void;
  isValidVin: boolean;
  isInputLocked: boolean;
  isVinCheckPending: boolean;
  phase: VinCheckPhase;
  uiCase: VinCheckUiCase | null;
  result: VinCheckResult | null;
  cartItems: CartItem[];
  localeCode: string;
  params: Record<string, string | string[] | undefined>;
  onVerifyVin: () => void;
  onChangeVin: () => void;
  onRemoveNoFitItem: (itemId: string) => void;
}

const Vincompatibilitycheck = ({
  vinNumber,
  onVinChange,
  onVinError,
  isValidVin,
  isInputLocked,
  isVinCheckPending,
  phase,
  uiCase,
  result,
  cartItems,
  localeCode,
  params,
  onVerifyVin,
  onChangeVin,
  onRemoveNoFitItem,
}: VincompatibilitycheckProps) => {
  const { getLabel } = useBranding();

  useEffect(() => {
    if (!vinNumber?.length) {
      onVinError(false);
      return;
    }
    onVinError(!isValidVin);
  }, [isValidVin, onVinError, vinNumber]);

  const showWarningIcon = phase === "verified" && (uiCase === 5 || uiCase === 6);
  const showSuccessIcon = phase === "verified" && (uiCase === 3 || uiCase === 4);

  const inputIcon = showWarningIcon ? (
    <VinWarningIcon className="h-5 w-5 text-color-icon-attention" />
  ) : showSuccessIcon ? (
    <GreenCircleTick className="h-5 w-5 text-color-icon-positive" />
  ) : undefined;

  const vinFieldError = !isInputLocked ? getVinFieldError(vinNumber, getLabel) : undefined;

  return (
    <Box className="flex w-full flex-col grid-gap-listing">
      <Box className="w-full gap-space-xl rounded-[4px] bg-color-background-info-muted base:p-space-md gtsm:px-space-xl gtsm:py-space-lg">
        <Box className="flex w-full flex-col gap-space-sm">
          <Typography className="text-color-text-emphasis typography-heading-03">
            {getLabel("vin_verification_title")}
          </Typography>
          <Typography className="text-color-text-default typography-body-02">
            {getLabel("vin_verificationChcekout_subtitle")}
          </Typography>
        </Box>

        <Box className="w-full">
          {/* <Typography className="text-color-text-default typography-body-02">
            {getLabel("VIN_number_input")}
          </Typography> */}
          <Box className="mt-[6px] flex w-full flex-row gap-[6px] gtsm:items-center gtsm:gap-space-sm">
            <Box className="min-w-0 flex-1 base:w-full gtsm:w-[250px] gtsm:max-w-[250px]">
              <OGTextInput
                placeholder={getLabel("enter_car_vin_number")}
                value={vinNumber}
                onChange={(value) => {
                  if (!isInputLocked) onVinChange(value);
                }}
                state={isInputLocked ? "disabled" : vinFieldError ? "error" : "default"}
                isReadOnly={isInputLocked}
                icon={inputIcon}
                iconPosition="right"
                className="bg-white"
                maxLength={17}
              />
            </Box>
            <Box className="flex h-[44px] flex-shrink-0 items-center">
              {isInputLocked ? (
                <OGButton
                  type="outlined"
                  size="medium"
                  className="h-[44px] min-h-[44px] p-[10px]"
                  onClick={onChangeVin}
                >
                  {getLabel("checkout_change_vin")}
                </OGButton>
              ) : (
                <OGButton
                  type="primary"
                  size="medium"
                  className="h-[44px] min-h-[44px] min-w-[85px]"
                  disabled={!isValidVin}
                  isLoading={isVinCheckPending}
                  usageAt="checkoutPage"
                  onClick={onVerifyVin}
                >
                  {getLabel("vin_verify")}
                </OGButton>
              )}
            </Box>
          </Box>
          {vinFieldError ? (
            <Typography className="mt-[6px] font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main">
              {vinFieldError}
            </Typography>
          ) : null}
          <Typography className="mt-[6px] text-color-text-muted typography-caption">
            {getLabel("VIN_information_message")}
          </Typography>
        </Box>
      </Box>

      <VinCheckResultBoxes
        uiCase={uiCase}
        result={result}
        cartItems={cartItems}
        localeCode={localeCode}
        params={params}
        getLabel={getLabel}
        onRemoveNoFitItem={onRemoveNoFitItem}
      />
    </Box>
  );
};

export default Vincompatibilitycheck;
