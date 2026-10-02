"use client";
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";

import Image from "next/image";
import PhoneInput, { isPossiblePhoneNumber, getCountryCallingCode } from "react-phone-number-input";
import { OGSelectDropdown } from "./og-components/OGSelectDropdown";
import { OGTextInput } from "./og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { OGPhoneInput } from "./og-components/OGPhoneInput";
import { Box } from "./ui/box";
import { OGCheckboxInput } from "./og-components/OGCheckboxInput";
import SavedAddressIcon from "./icons/SavedAddressIcon";
import { OGButton } from "./og-components/OGButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useGetConfigQuery } from "@/hooks/config";
import { useCartStore } from "@/stores/useCartStore";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getLocale } from "@/helpers/getLocale";
import { useSaveAddressMutation } from "@/hooks/address";
import { getProfile } from "@/services/authService";
import Typography from "./og-components/Typography";
// eslint-disable-next-line import/no-restricted-paths
import { useCheckoutCalculate } from "@/screens/shoppingcart/checkout/hooks/useCheckoutCalculate";
import { InfoCircleIcon } from "./og-components/icons/InfoCircleIcon";
import { OGAlert } from "./og-components/OGAlert";

// Countries that have states/provinces - State field is only visible for these countries
const COUNTRIES_WITH_STATES = ["DE", "IT", "ES", "PL", "PT"];

const getDialCodeForCountry = (country?: string): string => {
  if (!country) return "";
  try {
    const code = getCountryCallingCode(country as any);
    return code ? `+${code}` : "";
  } catch {
    return "";
  }
};

const isPhoneEmptyOrCodeOnly = (phone?: string | null): boolean => {
  if (!phone || !phone.trim()) return true;
  const digits = phone.replace(/\D/g, "");
  return digits.length > 0 && digits.length <= 3;
};

export interface DeliveryaddressInputProps {
  savedShippingAddresses?: any[];
  isSameBilling: boolean;
  setIsSameBilling: (val: boolean) => void;
  setProfileData: (data: any) => void;
  onAddressSaved?: () => void; // Callback to notify parent that delivery address was saved
  isBillingForm?: boolean; // Flag to indicate if this form is used for billing (guest users)
  hideSaveButton?: boolean; // Hide the save button (used when "Order and Pay" handles saving)
}

export interface DeliveryaddressInputRef {
  getFormData: () => any;
  isValid: () => boolean;
  triggerValidation: () => Promise<boolean>;
  scrollToFirstError: () => void;
}

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

/** Delivery form must never be prefilled with business address data. */
function isBusinessAddress(
  data:
    | { isCompany?: boolean | undefined; vatNumber?: string | null | undefined }
    | null
    | undefined,
): boolean {
  if (!data) return false;
  if (data.isCompany === true) return true;
  const vat = data.vatNumber;
  return typeof vat === "string" && vat.trim() !== "";
}

export const DeliveryaddressInput = forwardRef<DeliveryaddressInputRef, DeliveryaddressInputProps>(
  (
    {
      savedShippingAddresses,
      isSameBilling,
      setIsSameBilling,
      setProfileData,
      onAddressSaved,
      isBillingForm = false,
      hideSaveButton = false,
    },
    ref,
  ) => {
    const { getLabel } = useBranding();
    const { authUser, setAddresses, isAuthenticated } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const {
      formMode,
      setFormMode,
      guestDeliveryFormData,
      setGuestDeliveryFormData,
      guestBillingFormData,
      setGuestBillingFormData,
      setGuestIsSameBilling,
      showAlert,
      setShowAlert,
    } = useCartStore();
    const { locale } = useLandingPageDataStore();
    const currentLocale = getLocale(locale);
    const [isFormValid, setIsFormValid] = useState(false);
    const formElementRef = useRef<HTMLFormElement | null>(null);
    const { data: config, isLoading: isConfigLoading } = useGetConfigQuery();
    const [profile, setProfile] = useState<any>(null);
    const [addresschanged, setaddresschanged] = useState(false);
    // const [profileData, setProfileData] = useState<any>(null);
    const { isPending: isSavingCalculate } = useCheckoutCalculate({
      profileData: profile,
      addresschanged,
      setaddresschanged,
      isAuthenticated,
    });

    const { mutate: saveAddress, isPending: isSavingAddress } = useSaveAddressMutation({
      onSuccess: async (data: any) => {
        const profile = await getProfile({});
        // @ts-ignore
        setAddresses(profile?.data?.addresses);
        setFormMode({ delivery: "hidden", billing: "hidden" });
        setProfileData(profile);
        setProfile(profile);
        // Notify parent that delivery address was saved
        if (onAddressSaved) {
          onAddressSaved();
        }
      },
      onError: (error: any) => {
        console.error("checkout-address-delivery: saveAddress API error", error);
      },
    });

    // Export the schema for use in checkout page validation
    const addressSchema = z
      .object({
        // name: z.string().optional(),
        street: z.string().min(1, getLabel("Checkout_streetname_required")),
        houseNumber: z.string().optional(),
        buildingNumber: z.string().optional(),
        city: z.string().min(1, getLabel("Checkout_city_required")),
        state: z.string().optional(),
        postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
        country: z.string().min(1, "Country is required"),
        phoneNumber: z.string().optional(),
        isDefaultBilling: z.boolean().optional(),
        isDefaultShipping: z.boolean().optional(),
      })
      .refine(
        (data) => {
          // House Number validation: Required for BE, NL, LU; Optional for FR
          const requiredCountries = ["be", "nl", "lu"];
          const countryLower = data.country?.toLowerCase();

          if (requiredCountries.includes(countryLower)) {
            return !!data.houseNumber && data.houseNumber.trim() !== "";
          }
          return true;
        },
        {
          message: getLabel("Checkout_housenumber_required"),
          path: ["houseNumber"],
        },
      );
    type AddressFormData = z.infer<typeof addressSchema>;

    // Delivery form must only use guestDeliveryFormData, never guestBillingFormData. Do not prefill if data has VAT (business).
    const deliveryFormSource =
      !isBillingForm && guestDeliveryFormData && !isBusinessAddress(guestDeliveryFormData)
        ? guestDeliveryFormData
        : null;
    const dataSource = isBillingForm ? guestBillingFormData : deliveryFormSource;

    const {
      control,
      reset,
      handleSubmit,
      trigger,
      formState: { errors, isValid, isDirty },
      watch,
      setValue,
    } = useForm<AddressFormData>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        // name: dataSource?.name || "",
        street: dataSource?.street || "",
        houseNumber: dataSource?.houseNumber || "",
        buildingNumber: dataSource?.buildingNumber || "",
        city: dataSource?.city || "",
        state: dataSource?.state || "",
        postalCode: dataSource?.postalCode || "",
        country: (
          dataSource?.country ||
          (currentLocale?.country_code
            ? findMatchingCountryCode(
                currentLocale.country_code,
                config?.countries as Record<string, string>,
              )
            : "") ||
          ""
        ).toUpperCase(),
        phoneNumber: dataSource?.phoneNumber || "",
        isDefaultBilling: false,
        isDefaultShipping: false,
      },
      mode: "onChange",
    });

    // Reset form when user logs in (isAuthenticated changes from false to true)
    // Use a ref to track previous authentication state
    const prevIsAuthenticatedRef = useRef(isAuthenticated);
    useEffect(() => {
      // Check if user just logged in (transitioned from false to true)
      if (isAuthenticated && !prevIsAuthenticatedRef.current) {
        // User just logged in - reset form to clear any stale guest data
        reset({
          // name: "",
          street: "",
          houseNumber: "",
          buildingNumber: "",
          city: "",
          state: "",
          postalCode: "",
          country: (currentLocale?.country_code
            ? findMatchingCountryCode(
                currentLocale.country_code,
                config?.countries as Record<string, string>,
              )
            : ""
          ).toUpperCase(),
          phoneNumber: "",
          isDefaultBilling: false,
          isDefaultShipping: false,
        });
        setIsFormValid(false);
      }
      // Update ref to current authentication state
      prevIsAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated, reset, currentLocale, config]);

    // When delivery form is shown, clear form if store has business data or null (strict personal-only prefill)
    useEffect(() => {
      if (isBillingForm) return;
      if (guestDeliveryFormData == null || isBusinessAddress(guestDeliveryFormData)) {
        reset({
          // name: "",
          street: "",
          houseNumber: "",
          buildingNumber: "",
          city: "",
          state: "",
          postalCode: "",
          country: (currentLocale?.country_code
            ? findMatchingCountryCode(
                currentLocale.country_code,
                config?.countries as Record<string, string>,
              )
            : ""
          ).toUpperCase(),
          phoneNumber: "",
          isDefaultBilling: false,
          isDefaultShipping: false,
        });
        setIsFormValid(false);
      }
    }, [isBillingForm, guestDeliveryFormData, reset, currentLocale, config]);

    // Trigger validation for houseNumber / buildingNumber when country changes,
    // but skip the very first render so errors don't show before user interaction.
    const watchedCountry = watch("country");
    const hasCountryEverChangedRef = useRef(false);
    const [initialCountry, setInitialCountry] = useState("");

    useEffect(() => {
      setInitialCountry(watchedCountry);
      if (watchedCountry === "BE") {
        setShowAlert(false);
      } else {
        setShowAlert(true);
      }

      if (initialCountry && watchedCountry !== initialCountry) {
        setShowAlert(true);
      }
    }, [watchedCountry, initialCountry, setShowAlert]);

    useEffect(() => {
      if (!watchedCountry) return;
      if (!hasCountryEverChangedRef.current) {
        hasCountryEverChangedRef.current = true;
        return;
      }

      trigger("houseNumber");
      // Always revalidate Box/Unit so errors are also cleared when leaving BE
      trigger("buildingNumber");
    }, [watchedCountry, trigger]);

    // Add this useEffect to check form validity and persist guest data
    useEffect(() => {
      const subscription = watch((value) => {
        const requiredFields = ["street", "city", "postalCode", "country"];
        const allFieldsFilled = requiredFields.every(
          (field) =>
            value[field as keyof AddressFormData] &&
            String(value[field as keyof AddressFormData]).trim() !== "",
        );

        // Check houseNumber requirement based on country
        const requiredCountries = ["be", "nl", "lu"];
        const countryLower = value.country?.toLowerCase();
        const houseNumberValid = requiredCountries.includes(countryLower || "")
          ? !!value.houseNumber && String(value.houseNumber).trim() !== ""
          : true;
        setIsFormValid(allFieldsFilled && houseNumberValid);

        // Persist form data for all users (guest AND logged-in with no saved addresses)
        // This is needed for the "Order and Pay" button validation
        if (isBillingForm) {
          // Store as billing form data when used for billing
          setGuestBillingFormData(value);
        } else {
          // Store as delivery form data when used for delivery
          setGuestDeliveryFormData(value);
        }
      });

      return () => subscription.unsubscribe();
    }, [watch, isBillingForm, setGuestDeliveryFormData, setGuestBillingFormData]);

    const onSubmit = (data: AddressFormData) => {
      if (!isFormValid) {
        return;
      }

      // Check if this is the first address for the user
      const isFirstAddress =
        !(authUser as any)?.addresses || (authUser as any).addresses.length === 0;

      const formData = {
        // name: data.name,
        street: data.street,
        houseNumber: data.houseNumber,
        buildingNumber: data.buildingNumber,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phoneNumber: data.phoneNumber || undefined,
        isDefaultBilling: isFirstAddress,
        isDefaultShipping: isFirstAddress,
      };

      saveAddress(formData as any);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setIsScrolled(e.currentTarget.scrollTop > 0);
    };

    const scrollToFirstError = () => {
      const formEl = formElementRef.current;
      if (!formEl) return;

      const invalidContainers = Array.from(
        formEl.querySelectorAll<HTMLElement>('[data-invalid="true"]'),
      ).filter((node) => node.offsetParent !== null);
      const firstInvalid = invalidContainers[0];
      if (!firstInvalid) return;

      const focusTarget =
        firstInvalid.querySelector<HTMLElement>("input:not([disabled]):not([readonly])") ||
        firstInvalid.querySelector<HTMLElement>('[role="combobox"]') ||
        firstInvalid.querySelector<HTMLElement>("button:not([disabled])") ||
        firstInvalid.querySelector<HTMLElement>("[tabindex]");

      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      focusTarget?.focus?.({ preventScroll: true });
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        const values = watch();
        // Check if this is the first address for the user
        const isFirstAddress =
          !(authUser as any)?.addresses || (authUser as any).addresses.length === 0;

        const formData = {
          // name: values.name,
          street: values.street,
          houseNumber: values.houseNumber,
          buildingNumber: values.buildingNumber,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phoneNumber: values.phoneNumber || undefined,
          isDefaultBilling: isFirstAddress,
          isDefaultShipping: isFirstAddress,
        };

        return formData;
      },
      isValid: () => {
        return isValid && isDirty;
      },
      triggerValidation: async () => {
        return await trigger();
      },
      scrollToFirstError,
    }));

    return (
      <>
        <Box className="h-full w-full">
          <Box className="h-auto flex-1 bg-transparent">
            <Box className="relative h-auto">
              {/* @ts-ignore */}
              <Box className="custom-scrollbar h-full overflow-y-auto" onScroll={handleScroll}>
                <Box className="py-3">
                  <Typography className="text-color-text-body typography-subtitle-01">
                    {isBillingForm ? getLabel("billing_address") : getLabel("delivery_add")}
                  </Typography>
                </Box>
                {/*  */}
                <form ref={formElementRef} onSubmit={handleSubmit(onSubmit)}>
                  <Box className="w-full flex-col gap-space-lg">
                    {/* <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row"> */}
                    {/*  Address Name field */}
                    {/* <Box className="flex-1">
                        <Controller
                          control={control}
                          name="name"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("address_name")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_address_name")}
                              state={errors.name ? "error" : value ? "filled" : "default"}
                              error={errors.name?.message}
                              mandatory={true}
                            />
                          )}
                        />
                      </Box> */}
                    {/*  */}
                    {/* Phone number field */}
                    {/* <Box className="flex-1">
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
                              placeholder={getLabel("phone_number")}
                              state={errors.phoneNumber ? "error" : value ? "filled" : "default"}
                              error={errors.phoneNumber?.message}
                              defaultCountry={
                                (watch("country") || currentLocale?.country_code || "BE") as any
                              }
                              mandatory={false}
                            />
                          )}
                        />
                      </Box> */}
                    {/* </Box> */}

                    {/* <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row"> */}
                    {/* House Number field */}
                    {/* <Box className="flex-1">
                        <Controller
                          control={control}
                          name="houseNumber"
                          render={({ field: { onChange, value } }) => {
                            const requiredCountries = ["be", "nl", "lu"];
                            const countryValue = watch("country");
                            const countryLower = countryValue?.toLowerCase();
                            const isRequired = requiredCountries.includes(countryLower);

                            return (
                              <OGTextInput
                                title={`${getLabel("address_house_number") || "House Number"}`}
                                value={value || ""}
                                onChange={onChange}
                                placeholder={
                                  getLabel("enter_address_house_number") || "Enter house number"
                                }
                                state={errors.houseNumber ? "error" : value ? "filled" : "default"}
                                error={errors.houseNumber?.message}
                                mandatory={isRequired}
                              />
                            );
                          }}
                        />
                      </Box> */}

                    {/* Bus Number field */}
                    {/* <Box className="flex-1">
                        <Controller
                          control={control}
                          name="buildingNumber"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("address_bus_number") || "Bus number"}
                              value={value || ""}
                              onChange={onChange}
                              placeholder={
                                getLabel("enter_address_bus_number") || "Enter bus number"
                              }
                              state={errors.buildingNumber ? "error" : value ? "filled" : "default"}
                              error={errors.buildingNumber?.message}
                              // mandatory={(watch("country") || "").toLowerCase() === "be"}
                            />
                          )}
                        />
                      </Box> */}
                    {/* </Box> */}

                    {/* Street name field */}
                    {/* <Controller
                      control={control}
                      name="street"
                      render={({ field: { onChange, value } }) => (
                        <OGTextInput
                          title={getLabel("street_address")}
                          value={value}
                          onChange={onChange}
                          placeholder={getLabel("enter_street_address")}
                          state={errors.street ? "error" : value ? "filled" : "default"}
                          error={errors.street?.message}
                          mandatory={true}
                        />
                      )}
                    /> */}
                    {/* <Box className="flex flex-row gap-4 base:flex-col gtsm:flex-row gtlg:flex-row"> */}
                    {/* City field */}
                    {/* <Box className="flex-1">
                        <Controller
                          control={control}
                          name="city"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("city")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_city")}
                              state={errors.city ? "error" : value ? "filled" : "default"}
                              error={errors.city?.message}
                              mandatory={true}
                            />
                          )}
                        />
                      </Box> */}
                    {/* <Box className="flex-1"> */}
                    {/* Postal code field */}
                    {/* <Controller
                          control={control}
                          name="postalCode"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("postal_code")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_postal_code")}
                              state={errors.postalCode ? "error" : value ? "filled" : "default"}
                              error={errors.postalCode?.message}
                              mandatory={true}
                            />
                          )}
                        /> */}
                    {/* </Box> */}
                    {/* </Box> */}

                    <Box className="flex flex-row gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      {/* Country field - Changed to dropdown */}
                      <Box className="flex-1">
                        <Box className="flex flex-col gap-3">
                          <Controller
                            control={control}
                            name="country"
                            render={({ field: { onChange, value } }) => {
                              const handleCountryChange = (selectedValue: string) => {
                                onChange(selectedValue);
                                const currentPhone = watch("phoneNumber");
                                if (isPhoneEmptyOrCodeOnly(currentPhone)) {
                                  const dialCode = getDialCodeForCountry(selectedValue);
                                  if (dialCode) {
                                    setValue("phoneNumber", dialCode, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }
                                }
                                setaddresschanged(true);
                              };

                              return (
                                <OGSelectDropdown
                                  title={getLabel("country")}
                                  value={value || "Belgium"}
                                  onChange={handleCountryChange}
                                  placeholder={
                                    isConfigLoading
                                      ? getLabel("loading_countries")
                                      : getLabel("select_country")
                                  }
                                  className="bg-color-background-default"
                                  state={errors.country ? "error" : value ? "filled" : "default"}
                                  error={errors.country?.message || ""}
                                  mandatory={true}
                                  isDisabled={isConfigLoading}
                                  options={
                                    config?.countries
                                      ? Object.entries(config?.countries).map(([code, name]) => ({
                                          label: name as string,
                                          value: code.toUpperCase(),
                                        }))
                                      : []
                                  }
                                />
                              );
                            }}
                          />
                          {/* <Typography className="text-color-text-muted typography-caption">
                            {getLabel("Checkout_DeliveryAddress_VATCountryNote")}
                          </Typography> */}
                          {/* <OGAlert
                            title=""
                            description={getLabel("address_country_change_warning")}
                            variant="info"
                          /> */}
                        </Box>
                      </Box>
                      {/* State field - only visible for countries with states */}

                      {COUNTRIES_WITH_STATES.includes(watch("country")?.toUpperCase()) && (
                        <Box className="flex-1">
                          <Controller
                            control={control}
                            name="state"
                            render={({ field: { onChange, value } }) => (
                              <OGTextInput
                                title={getLabel("state")}
                                value={value}
                                onChange={onChange}
                                placeholder={getLabel("enter_state_province")}
                                state={errors.state ? "error" : value ? "filled" : "default"}
                                error={errors.state?.message}
                                mandatory={false}
                              />
                            )}
                          />
                        </Box>
                      )}
                    </Box>

                    {showAlert && (
                      <OGAlert
                        title=""
                        variant="info"
                        description={getLabel("price_VAT_updated_on_country_change")}
                      />
                    )}

                    {/* Street name field */}
                    <Controller
                      control={control}
                      name="street"
                      render={({ field: { onChange, value } }) => (
                        <OGTextInput
                          title={getLabel("street_address")}
                          value={value}
                          onChange={onChange}
                          placeholder={getLabel("enter_street_address")}
                          state={errors.street ? "error" : value ? "filled" : "default"}
                          error={errors.street?.message}
                          mandatory={true}
                        />
                      )}
                    />

                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      {/* House Number field */}
                      <Box className="flex-1">
                        <Controller
                          control={control}
                          name="houseNumber"
                          render={({ field: { onChange, value } }) => {
                            const requiredCountries = ["be", "nl", "lu"];
                            const countryValue = watch("country");
                            const countryLower = countryValue?.toLowerCase();
                            const isRequired = requiredCountries.includes(countryLower);

                            return (
                              <OGTextInput
                                title={`${getLabel("address_house_number") || "House Number"}`}
                                value={value || ""}
                                onChange={onChange}
                                placeholder={
                                  getLabel("enter_address_house_number") || "Enter house number"
                                }
                                state={errors.houseNumber ? "error" : value ? "filled" : "default"}
                                error={errors.houseNumber?.message}
                                mandatory={isRequired}
                              />
                            );
                          }}
                        />
                      </Box>

                      {/* Bus Number field */}
                      <Box className="flex-1">
                        <Controller
                          control={control}
                          name="buildingNumber"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("address_bus_number") || "Bus number"}
                              value={value || ""}
                              onChange={onChange}
                              placeholder={
                                getLabel("enter_address_bus_number") || "Enter bus number"
                              }
                              state={errors.buildingNumber ? "error" : value ? "filled" : "default"}
                              error={errors.buildingNumber?.message}
                              // mandatory={(watch("country") || "").toLowerCase() === "be"}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    <Box className="flex flex-row gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      {/* City field */}
                      <Box className="flex-1">
                        <Controller
                          control={control}
                          name="city"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("city")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_city")}
                              state={errors.city ? "error" : value ? "filled" : "default"}
                              error={errors.city?.message}
                              mandatory={true}
                            />
                          )}
                        />
                      </Box>
                      <Box className="flex-1">
                        {/* Postal code field */}
                        <Controller
                          control={control}
                          name="postalCode"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("postal_code")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_postal_code")}
                              state={errors.postalCode ? "error" : value ? "filled" : "default"}
                              error={errors.postalCode?.message}
                              mandatory={true}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      {/* Phone number field */}
                      <Box className="flex-1">
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
                              placeholder={getLabel("phone_number")}
                              state={errors.phoneNumber ? "error" : value ? "filled" : "default"}
                              error={errors.phoneNumber?.message}
                              defaultCountry={
                                (watch("country") || currentLocale?.country_code || "BE") as any
                              }
                              mandatory={false}
                            />
                          )}
                        />
                      </Box>
                      {/*  Address Name field (not in use anymore) */}
                      <Box className="flex-1">
                        {/* <Controller
                          control={control}
                          name="name"
                          render={({ field: { onChange, value } }) => (
                            <OGTextInput
                              title={getLabel("address_name")}
                              value={value}
                              onChange={onChange}
                              placeholder={getLabel("enter_address_name")}
                              state={errors.name ? "error" : value ? "filled" : "default"}
                              error={errors.name?.message}
                              mandatory={true}
                            />
                          )}
                        /> */}
                      </Box>
                      {/*  */}
                    </Box>

                    {/* Save Delivery Address Button - Only for authenticated users with saved addresses (not hidden) */}
                    {isAuthenticated && !hideSaveButton && (
                      <OGButton
                        onClick={handleSubmit(onSubmit)}
                        type="primary"
                        size="large"
                        className="w-full"
                        disabled={!isFormValid || isSavingAddress}
                      >
                        {isSavingAddress
                          ? getLabel("saving")
                          : getLabel("checkout_savedelivery_address")}
                      </OGButton>
                    )}
                  </Box>
                </form>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  },
);
