"use client";

// import { Box } from "@/components/ui/box";
import { DeliveryaddressInput } from "@/components/DeliveryaddressInput";
import { BillingaddressInput } from "@/components/BillingaddressInput";
import { SavedBillingAddress2 } from "@/components/SavedBillingAddress2";
import { RefObject } from "react";

interface BillingSectionProps {
  isAuthenticated: boolean;
  savedBillingAddresses: any[];
  isSameBilling: boolean;
  setIsSameBilling: (v: boolean) => void;
  isBusiness: boolean;
  billingFormRef: RefObject<{
    getFormData: () => any;
    isValid: () => boolean;
    triggerValidation: () => Promise<boolean>;
    scrollToFirstError: () => void;
  } | null>;
  setProfileData: (fn: (prev: any) => any) => void;
  onBillingAddressSaved: () => void;
}

export function BillingSection({
  isAuthenticated,
  savedBillingAddresses,
  isSameBilling,
  setIsSameBilling,
  isBusiness,
  billingFormRef,
  setProfileData,
  onBillingAddressSaved,
}: BillingSectionProps) {
  return (
    <>
      {!isAuthenticated && (
        <DeliveryaddressInput
          ref={billingFormRef as never}
          isSameBilling={isSameBilling}
          setIsSameBilling={setIsSameBilling}
          setProfileData={setProfileData}
          onAddressSaved={onBillingAddressSaved}
          isBillingForm={true}
        />
      )}

      {isAuthenticated && (!savedBillingAddresses || savedBillingAddresses.length === 0) && (
        <BillingaddressInput
          ref={billingFormRef as never}
          setProfileData={setProfileData}
          onAddressSaved={onBillingAddressSaved}
          hideSaveButton={true}
        />
      )}

      {isAuthenticated && savedBillingAddresses && savedBillingAddresses.length > 0 && (
        <SavedBillingAddress2
          addresses={savedBillingAddresses}
          isSameBilling={isSameBilling}
          setIsSamesavedBilling={setIsSameBilling}
          isBusiness={isBusiness}
        />
      )}
    </>
  );
}
