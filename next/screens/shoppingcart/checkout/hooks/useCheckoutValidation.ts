"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useTabsStore } from "@/stores/useTabsStore";
import { Address } from "@/types/profile";

export interface UseCheckoutValidationParams {
  formRefs: {
    delivery: React.RefObject<{
      getFormData: () => Partial<Address>;
      isValid: () => boolean;
      triggerValidation: () => Promise<boolean>;
      scrollToFirstError: () => void;
    } | null>;
    billing: React.RefObject<{
      getFormData: () => Partial<Address>;
      isValid: () => boolean;
      triggerValidation: () => Promise<boolean>;
      scrollToFirstError: () => void;
    } | null>;
  };
  guestAddressSchema: z.ZodType<Partial<Address>>;
  /** Schema for delivery form only. Use so delivery is never required to have VAT (billing uses guestAddressSchema). */
  guestDeliveryAddressSchema: z.ZodType<Partial<Address>>;
}

function validateGuestAddressFormData(
  guestAddressSchema: z.ZodType<Partial<Address>>,
  formData: Partial<Address> | null | undefined,
): boolean {
  if (!formData) return false;
  const result = guestAddressSchema.safeParse(formData);
  return result.success;
}

export function useCheckoutValidation({
  formRefs,
  guestAddressSchema,
  guestDeliveryAddressSchema,
}: UseCheckoutValidationParams) {
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);
  const [buttonRenderKey, setButtonRenderKey] = useState(0);
  const lastDisabledRef = useRef<boolean | null>(null);

  const activeTab = useTabsStore((state) => state.activeTab);
  const { isAuthenticated } = useAuthStore();
  const {
    isSameShipping,
    isBusiness,
    contactinfo,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    savedBillingAddresses,
    guestBillingFormData,
    guestDeliveryFormData,
  } = useCartStore();

  useEffect(() => {
    const isWarehousePickup = activeTab === "warehousePickup";

    const isEmailValid = (() => {
      try {
        z.string()
          .email()
          .parse(contactinfo?.email?.trim() || "");
        return true;
      } catch {
        return false;
      }
    })();

    const isContactInfoValid =
      contactinfo?.firstName?.trim() && contactinfo?.lastName?.trim() && isEmailValid;

    let disabled = true;

    if (isAuthenticated) {
      const hasSavedAddresses = savedBillingAddresses && savedBillingAddresses.length > 0;

      if (hasSavedAddresses) {
        const hasBillingSelected = selectedSavedBillingAddress !== null;
        const billingHasVatWhenBusiness =
          !isBusiness ||
          (selectedSavedBillingAddress?.vatNumber != null &&
            String(selectedSavedBillingAddress.vatNumber).trim() !== "");
        const isBillingOk = hasBillingSelected && billingHasVatWhenBusiness;

        if (isWarehousePickup) {
          disabled = !(isBillingOk && isContactInfoValid);
        } else if (isSameShipping) {
          disabled = !(isBillingOk && isContactInfoValid);
        } else {
          const hasDeliverySelected = selectedSavedDeliveryAddress !== null;
          disabled = !(isBillingOk && hasDeliverySelected && isContactInfoValid);
        }
      } else {
        const billingData = guestBillingFormData || formRefs.billing?.current?.getFormData();
        const isBillingValid = validateGuestAddressFormData(guestAddressSchema, billingData);

        if (isWarehousePickup) {
          disabled = !(isBillingValid && isContactInfoValid);
        } else {
          const deliveryData = guestDeliveryFormData || formRefs.delivery?.current?.getFormData();
          const isDeliveryValid =
            isBillingValid && isSameShipping
              ? true
              : validateGuestAddressFormData(guestDeliveryAddressSchema, deliveryData);

          disabled = !(
            (isBillingValid && isSameShipping && isContactInfoValid) ||
            (!isSameShipping && isBillingValid && isDeliveryValid && isContactInfoValid)
          );
        }
      }
    } else {
      const billingData = guestBillingFormData || formRefs.billing?.current?.getFormData();
      const isBillingValid = validateGuestAddressFormData(guestAddressSchema, billingData);

      if (isWarehousePickup) {
        disabled = !(isBillingValid && isContactInfoValid);
      } else {
        const deliveryData = guestDeliveryFormData || formRefs.delivery?.current?.getFormData();
        const isDeliveryValid =
          isBillingValid && isSameShipping
            ? true
            : validateGuestAddressFormData(guestDeliveryAddressSchema, deliveryData);

        disabled = !(
          (isBillingValid && isSameShipping && isContactInfoValid) ||
          (!isSameShipping && isBillingValid && isDeliveryValid && isContactInfoValid)
        );
      }
    }

    if (disabled !== lastDisabledRef.current) {
      lastDisabledRef.current = disabled;
      setIsConfirmDisabled(disabled);
      setButtonRenderKey((prev) => prev + 1);
    }
  }, [
    isAuthenticated,
    isSameShipping,
    isBusiness,
    activeTab,
    guestBillingFormData,
    guestDeliveryFormData,
    contactinfo,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    savedBillingAddresses,
    formRefs.billing,
    formRefs.delivery,
    guestAddressSchema,
    guestDeliveryAddressSchema,
  ]);

  return { isConfirmDisabled, buttonRenderKey };
}
