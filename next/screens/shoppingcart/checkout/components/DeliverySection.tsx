"use client";

import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { DeliveryaddressInput } from "@/components/DeliveryaddressInput";
import { SavedDeliveryAddress2 } from "@/components/SavedDeliveryAddress2";
import { RefObject } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import z from "zod";
import { useCartStore } from "@/stores/useCartStore";

interface DeliverySectionProps {
  getLabel: (key: string) => string;
  isSameShipping: boolean;
  setIsSameShipping: (v: boolean) => void;
  selectedSavedBillingAddress: any;
  setSelectedSavedDeliveryAddress: (addr: any) => void;
  isAuthenticated: boolean;
  savedShippingAddresses: any[];
  isSameBilling: boolean;
  setIsSameBilling: (v: boolean) => void;
  deliveryFormRef: RefObject<{
    getFormData: () => any;
    isValid: () => boolean;
    triggerValidation: () => Promise<boolean>;
    scrollToFirstError: () => void;
  } | null>;
  setProfileData: (fn: (prev: any) => any) => void;
  onDeliveryAddressSaved: () => void;
  // setDeliveryInstructions: (instructions: string) => void;
}

export function DeliverySection({
  getLabel,
  isSameShipping,
  setIsSameShipping,
  selectedSavedBillingAddress,
  setSelectedSavedDeliveryAddress,
  isAuthenticated,
  savedShippingAddresses,
  isSameBilling,
  setIsSameBilling,
  deliveryFormRef,
  setProfileData,
  onDeliveryAddressSaved,
}: DeliverySectionProps) {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      deliveryInstruction: "",
    },
    resolver: zodResolver(
      z.object({
        deliveryInstruction: z
          .string()
          .max(50, getLabel("checkout_delivery_instructions_max_length_error"))
          .optional(),
      }),
    ),
    mode: "onChange",
  });
  const { deliveryInstructions, setDeliveryInstructions } = useCartStore();

  return (
    <>
      <Box className="flex w-full flex-col items-start gap-space-md">
        <Typography className="text-color-text-emphasis typography-subtitle-01">
          {getLabel("delivery_address")}
        </Typography>
        <OGCheckboxInput
          selected={isSameShipping ? "yes" : "no"}
          label={getLabel("billing_same_as_delivery")}
          onChange={(newValue: boolean) => {
            setIsSameShipping(newValue);
            if (newValue) {
              setSelectedSavedDeliveryAddress(selectedSavedBillingAddress);
            } else {
              if (isAuthenticated && savedShippingAddresses && savedShippingAddresses.length > 0) {
                const defaultDeliveryAddress = savedShippingAddresses.find(
                  (addr: any) => addr.isDefaultShipping,
                );
                const firstDeliveryAddress = savedShippingAddresses[0];
                const deliveryToSelect = defaultDeliveryAddress || firstDeliveryAddress;
                setSelectedSavedDeliveryAddress(deliveryToSelect);
              } else {
                setSelectedSavedDeliveryAddress(null);
              }
            }
          }}
        />
      </Box>

      {!isSameShipping && (
        <Box className="mt-3 flex w-full flex-col">
          {!isAuthenticated && (
            <DeliveryaddressInput
              ref={deliveryFormRef as never}
              isSameBilling={isSameBilling}
              setIsSameBilling={setIsSameBilling}
              setProfileData={setProfileData}
              onAddressSaved={onDeliveryAddressSaved}
            />
          )}

          {isAuthenticated && (!savedShippingAddresses || savedShippingAddresses.length === 0) && (
            <DeliveryaddressInput
              ref={deliveryFormRef as never}
              isSameBilling={isSameBilling}
              setIsSameBilling={setIsSameBilling}
              setProfileData={setProfileData}
              onAddressSaved={onDeliveryAddressSaved}
              hideSaveButton={true}
            />
          )}

          {isAuthenticated && savedShippingAddresses && savedShippingAddresses.length > 0 && (
            <SavedDeliveryAddress2
              addresses={savedShippingAddresses}
              isSameBilling={isSameBilling}
              setIsSamesavedBilling={setIsSameBilling}
            />
          )}
        </Box>
      )}

      <Box className="flex flex-col gap-space-md">
        <OGCheckboxInput
          selected={isSameBilling ? "yes" : "no"}
          label={getLabel("delivery_instruction_same_as_billing")}
          onChange={(newValue: boolean) => {
            setIsSameBilling(newValue);
            if (newValue) {
              setProfileData((prev: any) => ({
                ...prev,
                deliveryInstruction: prev.billingInstruction || "",
              }));
            } else {
              setProfileData((prev: any) => ({
                ...prev,
                deliveryInstruction: "",
              }));
              setDeliveryInstructions("");
            }
          }}
        />

        {isSameBilling && (
          <Controller
            control={control}
            name="deliveryInstruction"
            render={({ field: { onChange, value } }) => {
              const handleChange = (val: string) => {
                // Allow only letters, numbers, space, and hyphen
                const sanitizedValue = val.replace(/[^a-zA-Z0-9 -]/g, "");
                if (sanitizedValue.length > 50) {
                  setError("deliveryInstruction", {
                    type: "manual",
                    message: getLabel("checkout_delivery_instructions_max_length_error"),
                  });
                  return; // stop update
                }
                // clear error if valid
                clearErrors("deliveryInstruction");
                setDeliveryInstructions(sanitizedValue);
                onChange(sanitizedValue);
              };

              return (
                <OGTextInput
                  title={getLabel("checkout_adddelivery_instructions")}
                  value={deliveryInstructions || value}
                  onChange={handleChange}
                  placeholder={getLabel("checkout_adddelivery_instructions_placeholder")}
                  state={errors.deliveryInstruction ? "error" : "default"}
                  error={errors.deliveryInstruction?.message}
                  mandatory={false}
                />
              );
            }}
          />
        )}
      </Box>
    </>
  );
}
