"use client";

import React, { useEffect, useState } from "react";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { OGAlert } from "@/components/og-components/OGAlert";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";
import GreenCircleTick from "@/screens/productdetails/GreenCircleTick";
import VinWarningIcon from "@/screens/shoppingcart/checkout/components/VinWarningIcon";
import { InfoCircleIcon } from "@/components/og-components/icons/InfoCircleIcon";
import { PdpVinCheckResultBoxes } from "./components/PdpVinCheckResultBoxes";
import { usePdpVinCheck } from "./hooks/usePdpVinCheck";

interface ProductcompatibilityverifyinputProps {
  partId: string;
  name?: string;
  title?: string;
  oeReference?: string;
  price?: number | null;
}

function getVinFieldError(vin: string, getLabel: (key: string) => string): string | undefined {
  if (!vin.length) return undefined;
  if (vin.length !== 17) return getLabel("vin_length_error");
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return getLabel("vin_invalid_characters");
  return undefined;
}

const Productcompatibilityverifyinput = ({
  partId,
  name,
  title,
  oeReference,
  price,
}: ProductcompatibilityverifyinputProps) => {
  const { getLabel } = useBranding();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  const {
    vinNumber,
    uiCase,
    isVinCheckPending,
    isValidVin,
    isInputLocked,
    userEmail,
    isSubmittingSupport,
    isSupportSuccess,
    isSupportError,
    resetSupportMutation,
    handleVinChange,
    handleVerifyVin,
    handleChangeVin,
    submitMaybeSupport,
  } = usePdpVinCheck({
    partId,
    ...(name ? { name } : {}),
    ...(title ? { title } : {}),
    ...(oeReference ? { oeReference } : {}),
    ...(price != null ? { price } : {}),
  });

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  /** Maybe + NO FIT: same email CTA / Freshdesk request (manual click only). */
  const showSupportEmailBlock = isInputLocked && (uiCase === 4 || uiCase === 5 || uiCase === 6);
  const showWarningIcon = isInputLocked && (uiCase === 5 || uiCase === 6);
  const showSuccessIcon = isInputLocked && uiCase === 3;
  const showInfoIcon = isInputLocked && uiCase === 4;

  const inputIcon = showWarningIcon ? (
    <VinWarningIcon className="h-5 w-5 text-color-icon-attention" />
  ) : showSuccessIcon ? (
    <GreenCircleTick className="h-5 w-5 text-color-icon-positive" />
  ) : showInfoIcon ? (
    <InfoCircleIcon className="h-5 w-5 text-color-icon-info" />
  ) : undefined;

  const vinFieldError = !isInputLocked ? getVinFieldError(vinNumber, getLabel) : undefined;

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError(getLabel("email_required"));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      setEmailError(getLabel("email_invalid_errormessage"));
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleRequestCompatibilityCheck = () => {
    if (!validateEmail(email)) return;
    resetSupportMutation();
    const matchType = uiCase === 5 || uiCase === 6 ? "NO_FIT" : "MAY_FIT";
    submitMaybeSupport(email, matchType);
  };

  return (
    <Box className="w-full bg-color-background-default">
      <Box className="flex flex-col gap-space-xs">
        <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
          {getLabel("vin_verification_title")}
        </Typography>
        <Typography className="text-color-text-muted body-regular-sm typography-body-02">
          {getLabel("vin_verification_subtitle")}
        </Typography>
      </Box>

      <Box className="mt-space-md flex w-full flex-col gap-space-md">
        <Box className="flex w-full flex-col gap-[6px]">
          {/* VIN row: 308px total = input + 12px gap + button */}
          <Box className="flex w-full max-w-[308px] flex-row items-center gap-3">
            <Box className="min-w-0 flex-1">
              <OGTextInput
                value={vinNumber}
                onChange={(val) => {
                  if (!isInputLocked) {
                    handleVinChange(val);
                    resetSupportMutation();
                  }
                }}
                placeholder={getLabel("enter_car_vin_number")}
                state={isInputLocked ? "disabled" : vinFieldError ? "error" : "default"}
                isReadOnly={isInputLocked}
                icon={inputIcon}
                iconPosition="right"
                maxLength={17}
                className="w-full"
              />
            </Box>
            <Box className="flex h-[44px] flex-shrink-0 items-center">
              {isInputLocked ? (
                <OGButton
                  type="outlined"
                  size="small"
                  className="h-[44px] min-h-[44px] p-[10px]"
                  onClick={() => {
                    resetSupportMutation();
                    handleChangeVin();
                  }}
                >
                  {getLabel("checkout_change_vin")}
                </OGButton>
              ) : (
                <OGButton
                  type="primary"
                  size="small"
                  className="h-[44px] min-h-[44px] min-w-[85px]"
                  disabled={!isValidVin || isVinCheckPending}
                  isLoading={isVinCheckPending}
                  onClick={handleVerifyVin}
                  aria-busy={isVinCheckPending}
                >
                  {getLabel("vin_verify")}
                </OGButton>
              )}
            </Box>
          </Box>
          {vinFieldError ? (
            <Typography className="font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main">
              {vinFieldError}
            </Typography>
          ) : null}
          <Typography className="text-color-text-muted typography-caption">
            {getLabel("VIN_information_message")}
          </Typography>
        </Box>

        {showSupportEmailBlock ? (
          /* Email row: 360px total = input + 12px gap + button */
          <Box className="flex w-full max-w-[530px] flex-row items-start gap-3">
            <Box className="min-w-0 flex-1">
              <OGTextInput
                value={email}
                onChange={(val) => {
                  setEmail(val);
                  setEmailError(undefined);
                  resetSupportMutation();
                }}
                placeholder={getLabel("enter_email_address")}
                state={userEmail ? "disabled" : emailError ? "error" : "default"}
                error={emailError}
                isReadOnly={!!userEmail}
                className="w-full"
              />
            </Box>
            <Box className="flex h-[44px] min-w-[230px] flex-shrink-0 items-center justify-center">
              <OGButton
                type="primary"
                size="small"
                className="h-[44px] min-h-[44px] w-full min-w-[230px] whitespace-nowrap px-3 text-center button-button-01"
                disabled={isSubmittingSupport || isSupportSuccess}
                isLoading={isSubmittingSupport}
                onClick={handleRequestCompatibilityCheck}
              >
                {getLabel("vin_verification_button")}
              </OGButton>
            </Box>
          </Box>
        ) : null}

        {/* Maybe: expert message until support succeeds; never fit / no-fit in this flow */}
        {uiCase === 4 && !isSupportSuccess ? (
          <OGAlert
            variant="info"
            title=""
            description={getLabel("pdp_vin_compatibility_expert_verification_required")}
            className="border-radius-small border border-color-border-info bg-color-background-info-muted py-space-md typography-body-strong-02"
            textClassName="text-color-text-info typography-body-strong-02"
            iconColor="var(--color-border-info)"
          />
        ) : null}

        {/* Fit / No-fit only (not Maybe) — NO FIT message stays visible with email CTA */}
        {uiCase !== 4 ? <PdpVinCheckResultBoxes uiCase={uiCase} getLabel={getLabel} /> : null}

        {(uiCase === 4 || uiCase === 5 || uiCase === 6) && isSupportSuccess ? (
          <OGAlert
            variant="info"
            title=""
            description={getLabel("pdp_vin_compatibility_message_sent")}
          />
        ) : null}
        {isSupportError ? (
          <OGAlert
            variant="error"
            title=""
            description={getLabel("vin_verification_error_title")}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export default Productcompatibilityverifyinput;
