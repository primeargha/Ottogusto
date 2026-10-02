"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { OGSelectDropdown } from "./og-components/OGSelectDropdown";
import { OGTextInput } from "./og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { OGPhoneInput } from "./og-components/OGPhoneInput";
import { Box } from "./ui/box";

import whitesearchicon from "../public/assets/whitesearchicon.svg";
import { DEBOUNCE_DELAY, ogSearchIcons, SEARCH_CHARACTORS, searchIcons } from "@/constants";
import { OGCheckboxInput } from "./og-components/OGCheckboxInput";
import SavedAddressIcon from "./icons/SavedAddressIcon";
import { OGButton } from "./og-components/OGButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useGetConfigQuery } from "@/hooks/config";
import { OGTextSearch } from "./og-components/OGTextSearch";
import useDeviceType from "@/hooks/useDeviceType";

const findMatchingCountryCode = (
  countryCode: string,
  availableCountries: Record<string, string> | undefined,
): string => {
  if (!countryCode || !availableCountries) return "";

  // Convert to lowercase for case-insensitive comparison
  const lowerCaseCountryCode = countryCode.toLowerCase();

  // Check if the country code exists in our config (case-insensitive)
  const matchingCountryCode = Object.keys(availableCountries).find(
    (code) => code.toLowerCase() === lowerCaseCountryCode,
  );

  return matchingCountryCode || "";
};

export const ClickandCollectInput = () => {
  const { getLabel } = useBranding();
  const deviceType = useDeviceType();
  const { authUser, setAddresses } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const { data: config, isLoading: isConfigLoading } = useGetConfigQuery();
  const addressSchema = z.object({
    name: z.string().optional(),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, getLabel("Checkout_city_required")),
    state: z.string().optional(), // Changed from required to optional
    postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z
      .string()
      .optional()
      .refine((value) => !value || isPossiblePhoneNumber(value), {
        message: "Please enter a valid phone number",
      }),
    isDefaultBilling: z.boolean().optional(),
    isDefaultShipping: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    type: z.enum(["Billing", "Shipping"]),
  });

  type AddressFormData = z.infer<typeof addressSchema>;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<AddressFormData>({
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phoneNumber: "",
      //@ts-ignore
      isDefaultBilling: authUser?.addresses?.length === 0,
      //@ts-ignore
      isDefaultShipping: authUser?.addresses?.length === 0,
      // isDefault: false,
      // type: "Billing",
    },
    mode: "onChange", // Set validation mode to onChange
  });

  const handleInputChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleInputClick = () => {
    if (deviceType === "mobile" || deviceType === "tablet") {
      setTimeout(() => {
        inputRef.current?.focus(); // Ensure keyboard opens
      }, 50); // Delay for smoother execution
    }
  };

  return (
    <>
      <Box className="h-full w-full">
        <Box className="flex-1 bg-transparent">
          <Box className="relative h-full gap-6">
            {/* Add onScroll handler to the scrollable container */}
            <Box className="w-full gap-3">
              <Box className="py-3">
                <Box className="text-color-text-body body-bold-lg">{getLabel("Pick_up_point")}</Box>
              </Box>
              <Box className="text-color-text-body body-medium-sm">
                {getLabel("search_for_location")} *
              </Box>

              <OGTextSearch
                inputRef={inputRef}
                placeholder="Choose your city"
                className="relative flex h-[48px] w-full items-center gap-[12px] rounded-[4px] border border-[--text-white-light2] bg-transparent p-6 text-lg leading-relaxed text-color-text-body focus:outline-none"
                value={value}
                onChange={handleInputChange}
                onClick={handleInputClick}
                onTouchStart={handleInputClick}
                //   onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="on"
                name="oe-ref-num"
                id="oe-ref-num"
                leftcomp={
                  <Image src={searchIcons.aisearch} alt="Advanced Search" height={24} width={24} />
                }
              />

              <OGButton
                //   onClick={onAdvancedSearch}
                type="primary"
                size="medium"
                className="w-full flex-1"
                leftcomp={
                  <Image src={whitesearchicon} alt="Advanced Search" height={20} width={20} />
                }
              >
                {getLabel("search_pickup")}
              </OGButton>
            </Box>
            {/* @ts-ignore */}
            <Box className="custom-scrollbar h-full overflow-y-auto" onScroll={handleScroll}>
              <Box className="py-3">
                <Box className="text-color-text-body body-bold-lg">
                  {getLabel("billing_address")}
                </Box>
              </Box>

              {/* Here Goes the Form */}
              <form>
                <Box className="mt-3 grid w-full grid-cols-1 gap-6">
                  {/*   Name field (optional) */}

                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("name")}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter Name"
                        state={errors.name ? "error" : value ? "filled" : "default"}
                        error={errors.name?.message}
                      />
                    )}
                  />

                  {/* Street address field */}
                  <Controller
                    control={control}
                    name="street"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("street_address")}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter Street Address"
                        state={errors.street ? "error" : value ? "filled" : "default"}
                        error={errors.street?.message}
                        mandatory={true}
                      />
                    )}
                  />

                  {/* Postal code field */}
                  <Controller
                    control={control}
                    name="postalCode"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("postal_code")}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter Postal Code"
                        state={errors.postalCode ? "error" : value ? "filled" : "default"}
                        error={errors.postalCode?.message}
                        mandatory={true}
                      />
                    )}
                  />

                  {/* City field */}
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("city")}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter City"
                        state={errors.city ? "error" : value ? "filled" : "default"}
                        error={errors.city?.message}
                        mandatory={true}
                      />
                    )}
                  />

                  {/* State field */}
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("state")}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter State/Province"
                        state={errors.state ? "error" : value ? "filled" : "default"}
                        error={errors.state?.message}
                      />
                    )}
                  />

                  {/* Country field - Changed to dropdown */}
                  <Controller
                    control={control}
                    name="country"
                    render={({ field: { onChange, value } }) => (
                      <OGSelectDropdown
                        title={getLabel("country")}
                        value={value}
                        onChange={onChange}
                        placeholder={isConfigLoading ? "Loading countries..." : "Select country"}
                        state={errors.country ? "error" : value ? "filled" : "default"}
                        error={errors.country?.message}
                        mandatory={true}
                        isDisabled={isConfigLoading}
                        options={
                          config?.countries
                            ? Object.entries(config?.countries)?.map(([code, name]) => ({
                                label: name as string,
                                value: code,
                              }))
                            : []
                        }
                      />
                    )}
                  />

                  {/* Phone number field */}
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <OGPhoneInput
                        title={getLabel("phone_number")}
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue || "");
                        }}
                        placeholder="Enter phone number"
                        error={errors.phoneNumber?.message}
                      />
                    )}
                  />
                </Box>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};
