"use client";

import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import Vincompatibilitycheck, { type VincompatibilitycheckProps } from "../Vincompatibilitycheck";
import VincompatibilitycheckLegacy from "../VincompatibilitycheckLegacy";
import { CheckoutDetailsBlock } from "./CheckoutDetailsBlock";
import { BillingSection } from "./BillingSection";
import { DeliverySection } from "./DeliverySection";
import { RefObject } from "react";
import { ContactInfo2Ref } from "../ConatctInfo2";
import { CheckoutTabContentSkeleton } from "./CheckoutTabContentSkeleton";
import { getClientFeatureFlag } from "@/utils/theme-utils";

interface HomeDeliveryTabContentProps {
  getLabel: (key: string) => string;
  typoClass: string;
  isAuthenticated: boolean;
  isBusiness: boolean;
  setShowBusinessLoginModal: (v: boolean) => void;
  onAccountType: (type: "personal" | "business") => void;
  formRefs: {
    billing: RefObject<any>;
    delivery: RefObject<any>;
    contact: RefObject<ContactInfo2Ref | null>;
  };
  isSameBilling: boolean;
  setIsSameBilling: (v: boolean) => void;
  setProfileData: (fn: (prev: any) => any) => void;
  onBillingAddressSaved: () => void;
  onDeliveryAddressSaved: () => void;
  savedBillingAddresses: any[];
  savedShippingAddresses: any[];
  isSameShipping: boolean;
  setIsSameShipping: (v: boolean) => void;
  selectedSavedBillingAddress: any;
  setSelectedSavedDeliveryAddress: (addr: any) => void;
  vinCheckProps: VincompatibilitycheckProps;
  buttonRenderKey: number;
  isConfirmDisabled: boolean;
  onOrderAndPay: () => void;
  isPaymentPending: boolean;
  isSavingAddresses: boolean;
  vinError: boolean;
  customLoader: boolean;
  isLoading: boolean;
}

export function HomeDeliveryTabContent({
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
  onDeliveryAddressSaved,
  savedBillingAddresses,
  savedShippingAddresses,
  isSameShipping,
  setIsSameShipping,
  selectedSavedBillingAddress,
  setSelectedSavedDeliveryAddress,
  vinCheckProps,
  buttonRenderKey,
  isConfirmDisabled,
  onOrderAndPay,
  isPaymentPending,
  isSavingAddresses,
  vinError,
  customLoader,
  isLoading,
}: HomeDeliveryTabContentProps) {
  if (isLoading) {
    return <CheckoutTabContentSkeleton variant="home" isAuthenticated={isAuthenticated} />;
  }

  return (
    <Box className="flex h-auto flex-col gap-space-lg rounded-[4px] border border-color-border-default base:p-space-sm gtsm:px-space-xl gtsm:py-space-lg">
      <CheckoutDetailsBlock
        getLabel={getLabel}
        isBusiness={isBusiness}
        isAuthenticated={isAuthenticated}
        typoClass={typoClass}
        onAccountType={onAccountType}
        onBusinessClickRequiresLogin={() => setShowBusinessLoginModal(true)}
        contactFormRef={formRefs.contact}
      />

      {/* {country?.toUpperCase() === "NL" && currentStore === STORE_IDS.OTTOGUSTO && (
      )} */}
      {/* <Box className="w-full">
        <VincompatibilitySimple
          error={onVinError}
          onVinChange={onVinChange}
        />
      </Box> */}

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

      <DeliverySection
        getLabel={getLabel}
        isSameShipping={isSameShipping}
        setIsSameShipping={setIsSameShipping}
        selectedSavedBillingAddress={selectedSavedBillingAddress}
        setSelectedSavedDeliveryAddress={setSelectedSavedDeliveryAddress}
        isAuthenticated={isAuthenticated}
        savedShippingAddresses={savedShippingAddresses ?? []}
        isSameBilling={isSameBilling}
        setIsSameBilling={setIsSameBilling}
        deliveryFormRef={formRefs.delivery}
        setProfileData={setProfileData}
        onDeliveryAddressSaved={onDeliveryAddressSaved}
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
          key={`confirm-btn-${buttonRenderKey}-${isConfirmDisabled}`}
          onClick={onOrderAndPay}
          type="primary"
          size="large"
          className="w-full"
          // disabled={
          //   isConfirmDisabled || isPaymentPending || isSavingAddresses || vinError || customLoader
          // }
        >
          {getLabel("order_and_pay")}
        </OGButton>
      </Box>
    </Box>
  );
}
