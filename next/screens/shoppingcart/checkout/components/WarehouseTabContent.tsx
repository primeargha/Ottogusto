"use client";

import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import { CollectionPoint } from "@/components/CollectionPoint";
import Vincompatibilitycheck, { type VincompatibilitycheckProps } from "../Vincompatibilitycheck";
import VincompatibilitycheckLegacy from "../VincompatibilitycheckLegacy";
import { CheckoutDetailsBlock } from "./CheckoutDetailsBlock";
import { BillingSection } from "./BillingSection";
import { RefObject } from "react";
import { ContactInfo2Ref } from "../ConatctInfo2";
import { CheckoutTabContentSkeleton } from "./CheckoutTabContentSkeleton";
import { getClientFeatureFlag } from "@/utils/theme-utils";

interface WarehouseTabContentProps {
  getLabel: (key: string) => string;
  typoClass: string;
  isAuthenticated: boolean;
  isBusiness: boolean;
  setShowBusinessLoginModal: (v: boolean) => void;
  onAccountType: (type: "personal" | "business") => void;
  formRefs: {
    billing: RefObject<any>;
    contact: RefObject<ContactInfo2Ref | null>;
  };
  isSameBilling: boolean;
  setIsSameBilling: (v: boolean) => void;
  setProfileData: (fn: (prev: any) => any) => void;
  onBillingAddressSaved: () => void;
  savedBillingAddresses: any[];
  vinCheckProps: VincompatibilitycheckProps;
  buttonRenderKey: number;
  isConfirmDisabled: boolean;
  onOrderAndPay: () => void;
  isPaymentPending: boolean;
  isSavingAddresses: boolean;
  vinError: boolean;
  isLoading: boolean;
}

export function WarehouseTabContent({
  getLabel,
  typoClass,
  isAuthenticated,
  isBusiness,
  setShowBusinessLoginModal,
  onAccountType,
  formRefs,
  isSameBilling,
  setIsSameBilling,
  setProfileData,
  onBillingAddressSaved,
  savedBillingAddresses,
  vinCheckProps,
  buttonRenderKey,
  isConfirmDisabled,
  onOrderAndPay,
  isPaymentPending,
  isSavingAddresses,
  vinError,
  isLoading,
}: WarehouseTabContentProps) {
  if (isLoading) {
    return <CheckoutTabContentSkeleton variant="warehouse" isAuthenticated={isAuthenticated} />;
  }

  return (
    <Box className="flex h-auto flex-col rounded-[4px] border border-color-border-default grid-gap-listing base:p-space-sm gtsm:px-space-xl gtsm:py-space-lg">
      <CheckoutDetailsBlock
        getLabel={getLabel}
        isBusiness={isBusiness}
        isAuthenticated={isAuthenticated}
        typoClass={typoClass}
        onAccountType={onAccountType}
        onBusinessClickRequiresLogin={() => setShowBusinessLoginModal(true)}
        contactFormRef={formRefs.contact}
      />

      <CollectionPoint />

      <BillingSection
        isAuthenticated={isAuthenticated}
        savedBillingAddresses={savedBillingAddresses ?? []}
        isSameBilling={isSameBilling}
        setIsSameBilling={setIsSameBilling}
        isBusiness={isBusiness}
        billingFormRef={formRefs.billing}
        setProfileData={setProfileData}
        onBillingAddressSaved={onBillingAddressSaved}
      />

      <Box className="flex w-full flex-col grid-gap-listing">
        {getClientFeatureFlag("checkout_vin_api_flow_feature_flag") ? (
          <Vincompatibilitycheck {...vinCheckProps} />
        ) : (
          <VincompatibilitycheckLegacy
            error={vinCheckProps.onVinError}
            onVinChange={vinCheckProps.onVinChange}
          />
        )}
        <OGButton
          key={`confirm-btn-warehouse-${buttonRenderKey}-${isConfirmDisabled}`}
          onClick={onOrderAndPay}
          type="primary"
          size="large"
          className="w-full"
          // disabled={isConfirmDisabled || isPaymentPending || isSavingAddresses || vinError}
        >
          {getLabel("order_and_pay")}
        </OGButton>
      </Box>
    </Box>
  );
}
