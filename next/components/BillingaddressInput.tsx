"use client";
// eslint-disable-next-line import/no-restricted-paths
import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from "react";

import Image from "next/image";
import { Text } from "@/components/ui/text";
import PhoneInput, { isPossiblePhoneNumber, getCountryCallingCode } from "react-phone-number-input";
import { OGSelectDropdown } from "./og-components/OGSelectDropdown";
import { OGTextInput } from "./og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { OGPhoneInput } from "./og-components/OGPhoneInput";
import { Box } from "./ui/box";
// import { OGCheckboxInput } from "./og-components/OGCheckboxInput";
// import SavedAddressIcon from "./icons/SavedAddressIcon";
import { OGButton } from "./og-components/OGButton";
import { useAuthStore, AuthUserType } from "@/stores/useAuthStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useGetConfigQuery } from "@/hooks/config";
import { useCartStore } from "@/stores/useCartStore";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getLocale } from "@/helpers/getLocale";
import { useSaveAddressMutation } from "@/hooks/address";
import { getProfile } from "@/services/authService";
import { Address } from "@/types/profile";
import { vatLookup, companyVatLookup } from "@/services/profile";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import { CustomTooltip } from "./og-components/OGtooltip";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import Typography from "./og-components/Typography";
// eslint-disable-next-line import/no-restricted-paths
import { useCheckoutCalculate } from "@/screens/shoppingcart/checkout/hooks/useCheckoutCalculate";
import { clearVatPendingSupportDedupe } from "@/utils/checkoutSupportDedupe";
import { OGAlert } from "./og-components/OGAlert";

// Countries that have states/provinces - State field is only visible for these countries
const COUNTRIES_WITH_STATES = ["DE", "IT", "ES", "PL", "PT"];

type VatValidationStatus = "VALID" | "INVALID" | "PENDING_VERIFICATION";

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

/** Billing form in business mode must never be prefilled with personal address data. */
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

export interface BillingaddressInputProps {
  setProfileData: (data: any) => void;
  onAddressSaved?: () => void; // Callback to notify parent that billing address was saved
  hideSaveButton?: boolean; // Hide the save button (used when "Order and Pay" handles saving)
}

export interface BillingaddressInputRef {
  getFormData: () => any;
  isValid: () => boolean;
  triggerValidation: () => Promise<boolean>;
  scrollToFirstError: () => void;
  getVatValidationStatus: () => VatValidationStatus | null;
}

export const BillingaddressInput = forwardRef<BillingaddressInputRef, BillingaddressInputProps>(
  ({ setProfileData, onAddressSaved, hideSaveButton = false }, ref) => {
    const { getLabel } = useBranding();
    const { isBusiness, setIsBusiness, selectedSavedBillingAddress } = useCartStore();
    const { authUser, setAddresses, isAuthenticated } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);

    const {
      formMode,
      setFormMode,
      isSameBilling,
      setIsSameBilling,
      guestBillingFormData,
      setGuestBillingFormData,
      setShowAlert,
      showAlert,
    } = useCartStore();
    const { locale } = useLandingPageDataStore();
    const params = useParams();
    const currentLocale = getLocale(locale);
    const [isFormValid, setIsFormValid] = useState(false);
    const formElementRef = useRef<HTMLFormElement | null>(null);
    const { data: config, isLoading: isConfigLoading } = useGetConfigQuery();
    const [isValidatingVat, setIsValidatingVat] = useState(false);
    const isValidatingVatRef = useRef(false);
    const [vatValidationError, setVatValidationError] = useState<string | null>(null);
    const [vatValidationStatus, setVatValidationStatus] = useState<VatValidationStatus | null>(
      null,
    );
    const vatValidationStatusRef = useRef<VatValidationStatus | null>(null);
    const [vatValidatedSuccessfully, setVatValidatedSuccessfully] = useState(false);
    const vatValidatedSuccessfullyRef = useRef(false);
    const [lastValidatedVatNumber, setLastValidatedVatNumber] = useState<string | null>(null);
    const lastValidatedVatNumberRef = useRef<string | null>(null);

    const setVatValidationCache = useCallback(
      (status: VatValidationStatus | null, validated: boolean, vatNumber: string | null) => {
        setVatValidationStatus(status);
        vatValidationStatusRef.current = status;
        setVatValidatedSuccessfully(validated);
        vatValidatedSuccessfullyRef.current = validated;
        setLastValidatedVatNumber(vatNumber);
        lastValidatedVatNumberRef.current = vatNumber;

        if (status === "PENDING_VERIFICATION" && vatNumber?.trim()) {
          const orderId = useCartStore.getState().cartid;
          if (orderId) {
            clearVatPendingSupportDedupe(orderId, vatNumber);
          }
        }
      },
      [],
    );

    const clearVatValidationCache = useCallback(() => {
      setVatValidationCache(null, false, null);
    }, [setVatValidationCache]);

    const setIsValidatingVatState = (validating: boolean) => {
      isValidatingVatRef.current = validating;
      setIsValidatingVat(validating);
    };
    const [prefilledFields, setPrefilledFields] = useState<{
      street: boolean;
      city: boolean;
      postalCode: boolean;
      country: boolean;
      houseNumber: boolean;
    }>({
      street: false,
      city: false,
      postalCode: false,
      country: false,
      houseNumber: false,
    });
    const [profile, setProfile] = useState<any>(null);
    const [addresschanged, setaddresschanged] = useState(false);
    // const [profileData, setProfileData] = useState<any>(null);
    const { isPending: isSavingCalculate } = useCheckoutCalculate({
      profileData: profile,
      addresschanged,
      setaddresschanged,
      isAuthenticated,
    });

    // Determine if we should show business fields
    // Add Mode: Check isBusiness
    // Edit Mode: Check isCompany property of the address being edited
    const shouldShowBusinessFields =
      formMode.billing === "add"
        ? isBusiness
        : formMode.billing === "edit" && selectedSavedBillingAddress?.isCompany === true;
    const { mutate: saveAddress, isPending: isSavingAddress } = useSaveAddressMutation({
      onSuccess: async (data: any) => {
        const profile = await getProfile({});
        setProfile(profile);
        setAddresses((profile as any)?.data?.addresses);
        setFormMode({ delivery: "hidden", billing: "hidden" });
        setProfileData(profile);
        // Reset VAT validation state after successful save
        clearVatValidationCache();
        setVatValidationError(null);
        setPrefilledFields({
          street: false,
          city: false,
          postalCode: false,
          country: false,
          houseNumber: false,
        });
        // Notify parent that billing address was saved
        if (onAddressSaved) {
          onAddressSaved();
        }
      },
      onError: (error: any) => {
        console.error("checkout-address-billing: saveAddress API error", error);
      },
    });

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
        vatNumber: shouldShowBusinessFields
          ? z.string().min(1, "VAT number is required")
          : z.string().optional(),
        companyName: shouldShowBusinessFields
          ? z.string().min(1, "Company name is required")
          : z.string().optional(),
        email: shouldShowBusinessFields
          ? z.string().min(1, "Email is required").email("Please enter a valid email address")
          : z.string().optional(),
      })
      .refine(
        (data) => {
          // House Number validation: Required for BE, NL, LU; Optional for FR
          // Same validation applies for both personal and business addresses
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

    // Strict separation: only use guestBillingFormData when type matches current tab.
    // Personal tab: do not prefill with business data (has VAT/isCompany).
    // Business tab: do not prefill with personal data (no VAT).
    const billingFormSource =
      (shouldShowBusinessFields &&
        guestBillingFormData &&
        !isBusinessAddress(guestBillingFormData)) ||
      (!shouldShowBusinessFields && guestBillingFormData && isBusinessAddress(guestBillingFormData))
        ? null
        : guestBillingFormData;

    const {
      control,
      reset,
      handleSubmit,
      trigger,
      setValue,
      getValues,
      formState: { errors, isValid, isDirty },
      watch,
    } = useForm<AddressFormData>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        // name: billingFormSource?.name || "",
        street: billingFormSource?.street || "",
        houseNumber: billingFormSource?.houseNumber || "",
        buildingNumber: billingFormSource?.buildingNumber || "",
        city: billingFormSource?.city || "",
        state: billingFormSource?.state || "",
        postalCode: billingFormSource?.postalCode || "",
        country: (
          billingFormSource?.country ||
          (currentLocale?.country_code
            ? findMatchingCountryCode(
                currentLocale.country_code,
                config?.countries as Record<string, string>,
              )
            : "") ||
          ""
        ).toUpperCase(),
        phoneNumber: billingFormSource?.phoneNumber || "",
        isDefaultBilling: false,
        isDefaultShipping: false,
        vatNumber: billingFormSource?.vatNumber || "",
        companyName: billingFormSource?.companyName || "",
        email:
          billingFormSource?.email ||
          (isAuthenticated && "email" in authUser ? (authUser as AuthUserType)?.email : "") ||
          "",
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
          vatNumber: "",
          companyName: "",
          email: isAuthenticated && "email" in authUser ? (authUser as AuthUserType)?.email : "",
        });
        setIsFormValid(false);
      }
      // Update ref to current authentication state
      prevIsAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated, reset, currentLocale, config, authUser]);

    // Reset VAT validation state when switching between business and personal modes
    useEffect(() => {
      // Reset VAT validation state when shouldShowBusinessFields changes
      clearVatValidationCache();
      setVatValidationError(null);
      setPrefilledFields({
        street: false,
        city: false,
        postalCode: false,
        country: false,
        houseNumber: false,
      });
    }, [shouldShowBusinessFields, clearVatValidationCache]);

    // Strict separation: clear form when store data type does not match current tab
    useEffect(() => {
      const emptyBillingValues = {
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
        vatNumber: "",
        companyName: "",
        email: isAuthenticated && "email" in authUser ? (authUser as AuthUserType)?.email : "",
      };
      if (
        shouldShowBusinessFields &&
        guestBillingFormData &&
        !isBusinessAddress(guestBillingFormData)
      ) {
        reset(emptyBillingValues);
        setIsFormValid(false);
      } else if (
        !shouldShowBusinessFields &&
        guestBillingFormData &&
        isBusinessAddress(guestBillingFormData)
      ) {
        reset(emptyBillingValues);
        setIsFormValid(false);
      }
    }, [
      shouldShowBusinessFields,
      guestBillingFormData,
      reset,
      currentLocale,
      config,
      isAuthenticated,
      authUser,
    ]);

    // Prefill email when user is authenticated and in business mode
    useEffect(() => {
      if (isAuthenticated && shouldShowBusinessFields && "email" in authUser) {
        const userEmail = (authUser as AuthUserType)?.email;
        if (userEmail && !watch("email")) {
          setValue("email", userEmail, {
            shouldValidate: true,
            shouldDirty: false,
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, shouldShowBusinessFields, authUser, setValue]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedCountry, trigger]);

    // Detect VAT number changes and reset validation state if needed
    useEffect(() => {
      const subscription = watch((value, { name }) => {
        if (name === "vatNumber" && shouldShowBusinessFields) {
          const currentVat = value.vatNumber || "";
          // If VAT number changed from the last validated one, reset validation state
          if (lastValidatedVatNumber && currentVat !== lastValidatedVatNumber) {
            clearVatValidationCache();
            setVatValidationError(null);
            const orderId = useCartStore.getState().cartid;
            if (orderId) {
              clearVatPendingSupportDedupe(orderId, lastValidatedVatNumber);
              if (currentVat.trim()) {
                clearVatPendingSupportDedupe(orderId, currentVat);
              }
            }
            // Do not clear other address fields when VAT changes (invalid lookup / re-entry UX).
            // Previous logic retained for reference:
            // setValue("companyName", "", { shouldValidate: true, shouldDirty: true });
            // setValue("street", "", { shouldValidate: true, shouldDirty: true });
            // setValue("city", "", { shouldValidate: true, shouldDirty: true });
            // setValue("postalCode", "", { shouldValidate: true, shouldDirty: true });
            // setValue("country", "", { shouldValidate: true, shouldDirty: true });
            // setValue("houseNumber", "", { shouldValidate: true, shouldDirty: true });
            // setValue("buildingNumber", "", { shouldValidate: true, shouldDirty: true });
            // setPrefilledFields({
            //   street: false,
            //   city: false,
            //   postalCode: false,
            //   country: false,
            //   houseNumber: false,
            // });
          }
          // If VAT number is cleared, reset state
          if (!currentVat || currentVat.trim() === "") {
            clearVatValidationCache();
            setVatValidationError(null);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, [
      watch,
      lastValidatedVatNumber,
      shouldShowBusinessFields,
      setValue,
      clearVatValidationCache,
    ]);

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
        // Same validation applies for both personal and business addresses
        const requiredCountries = ["be", "nl", "lu"];
        const countryLower = value.country?.toLowerCase() || "";
        const houseNumberValid = requiredCountries.includes(countryLower)
          ? !!value.houseNumber && String(value.houseNumber).trim() !== ""
          : true;

        // Check business fields if in business mode
        let businessFieldsValid = true;
        if (shouldShowBusinessFields) {
          const vatValid =
            !vatValidationError && !!value.vatNumber && String(value.vatNumber).trim() !== "";
          const companyNameValid = !!value.companyName && String(value.companyName).trim() !== "";
          const emailValid = !!value.email && String(value.email).trim() !== "";
          businessFieldsValid = vatValid && companyNameValid && emailValid;
        }

        setIsFormValid(allFieldsFilled && houseNumberValid && businessFieldsValid);

        const addressData: Address = {
          // name: value.name || "",
          street: value.street || "",
          city: value.city || "",
          postalCode: value.postalCode || "",
          state: value.state || "",
          country: value.country || "",
          phoneNumber: value.phoneNumber || undefined,
          isDefaultBilling: value.isDefaultBilling || false,
          isDefaultShipping: value.isDefaultShipping || false,
          houseNumber: value.houseNumber || undefined,
          buildingNumber: value.buildingNumber || undefined,
          isCompany: shouldShowBusinessFields,
          companyName: value.companyName || undefined,
          vatNumber: value.vatNumber || undefined,
          email: value.email || undefined,
        };

        // Persist form data for guest users AND logged-in users with no saved addresses
        // This is needed for the "Order and Pay" button validation
        setGuestBillingFormData(addressData);
      });

      return () => subscription.unsubscribe();
    }, [watch, setGuestBillingFormData, shouldShowBusinessFields, vatValidationError]);

    const waitForOngoingVatValidation = async () => {
      while (isValidatingVatRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return true;
    };

    const hasCachedVatValidation = (vatValue: string) =>
      vatValidatedSuccessfullyRef.current &&
      lastValidatedVatNumberRef.current === vatValue &&
      vatValidationStatusRef.current !== "INVALID" &&
      vatValidationStatusRef.current !== null;

    const ensureVatValidatedBeforeSubmit = async (): Promise<boolean> => {
      if (!shouldShowBusinessFields) return true;

      const vatValue = (getValues("vatNumber") || "").trim();
      if (!vatValue) return true;

      if (hasCachedVatValidation(vatValue)) {
        return true;
      }

      await waitForOngoingVatValidation();

      if (hasCachedVatValidation(vatValue)) {
        return true;
      }

      return await handleVatBlur(
        vatValue,
        () => {},
        () => {},
      );
    };

    const onSubmit = async (_data: AddressFormData) => {
      const vatReady = await ensureVatValidatedBeforeSubmit();
      if (!vatReady) {
        return;
      }

      // Block submission if VAT validation error exists
      if (shouldShowBusinessFields && vatValidationError) {
        return;
      }

      if (!isFormValid) {
        return;
      }

      const latestValues = getValues();
      const formData = {
        street: latestValues.street,
        houseNumber: latestValues.houseNumber,
        buildingNumber: latestValues.buildingNumber,
        city: latestValues.city,
        state: latestValues.state,
        postalCode: latestValues.postalCode,
        country: latestValues.country,
        phoneNumber: latestValues.phoneNumber || undefined,
        isDefaultBilling: false,
        isDefaultShipping: false,
        ...(shouldShowBusinessFields && {
          vatNumber: latestValues.vatNumber,
          companyName: latestValues.companyName,
          email: latestValues.email,
          isCompany: true,
        }),
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
        const formData = {
          // name: shouldShowBusinessFields ? values.companyName : values.name,
          street: values.street,
          houseNumber: values.houseNumber,
          buildingNumber: values.buildingNumber,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phoneNumber: values.phoneNumber || undefined,
          isDefaultBilling: false,
          isDefaultShipping: false,
          // Add business-specific fields when shouldShowBusinessFields is true
          ...(shouldShowBusinessFields && {
            vatNumber: values.vatNumber,
            companyName: values.companyName,
            email: values.email,
            isCompany: true,
          }),
        };

        return formData;
      },
      isValid: () => {
        return isValid && isDirty;
      },
      triggerValidation: async () => {
        const vatReady = await ensureVatValidatedBeforeSubmit();
        if (!vatReady) {
          return false;
        }
        return await trigger();
      },
      getVatValidationStatus: () => vatValidationStatusRef.current,
      scrollToFirstError,
    }));

    const handleVatBlur = async (value: string, onChange: any, onBlur: any): Promise<boolean> => {
      onBlur(); // Call the original onBlur to mark field as touched

      if (value && value.length >= 2) {
        if (hasCachedVatValidation(value)) {
          return true;
        }

        // Extract country code and VAT number
        const countryCode = value.substring(0, 2);
        const vatNumber = value.substring(2);
        setIsValidatingVatState(true);
        setVatValidationError(null);
        clearVatValidationCache();

        // Validate the VAT number
        try {
          const validationResult = await companyVatLookup(value);
          if (validationResult.data && validationResult.data.name) {
            // Prefill all company fields from VAT lookup response
            setValue("companyName", validationResult.data.name, {
              shouldValidate: true,
              shouldDirty: true,
            });

            // Prefill address fields from VAT lookup response and mark as prefilled
            const newPrefilledFields = {
              street: false,
              city: false,
              postalCode: false,
              country: false,
              houseNumber: false,
            };

            if (validationResult.data.street) {
              setValue("street", validationResult.data.street, {
                shouldValidate: true,
                shouldDirty: true,
              });
              newPrefilledFields.street = true;
            }

            if (validationResult.data.city) {
              setValue("city", validationResult.data.city, {
                shouldValidate: true,
                shouldDirty: true,
              });
              newPrefilledFields.city = true;
            }

            if (validationResult.data.postalCode) {
              setValue("postalCode", validationResult.data.postalCode, {
                shouldValidate: true,
                shouldDirty: true,
              });
              newPrefilledFields.postalCode = true;
            }

            if (validationResult.data.country) {
              const vatCountryCode = validationResult.data.country;
              const resolvedCountryCode = vatCountryCode
                ? findMatchingCountryCode(
                    vatCountryCode,
                    config?.countries as unknown as Record<string, string> | undefined,
                  )
                : "";

              // Check if user's locale is FR - if so, preserve FR country to keep houseNumber optional
              const localeCountry = currentLocale?.country_code
                ? findMatchingCountryCode(
                    currentLocale.country_code,
                    config?.countries as unknown as Record<string, string> | undefined,
                  )
                : "";
              const localeCountryLower = localeCountry?.toLowerCase();
              const vatCountryLower =
                resolvedCountryCode?.toLowerCase() || vatCountryCode?.toLowerCase();

              // If locale is FR, preserve FR country (don't override with VAT country)
              // This ensures houseNumber remains optional for FR users
              if (localeCountryLower === "fr" && vatCountryLower !== "fr") {
                // Explicitly set FR country to ensure form state is correct (uppercase)
                if (localeCountry) {
                  const frCountryUpper = (localeCountry || "").toUpperCase();
                  setValue("country", frCountryUpper, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  newPrefilledFields.country = true;
                  const currentPhoneFr = getValues("phoneNumber");
                  if (isPhoneEmptyOrCodeOnly(currentPhoneFr)) {
                    const dialCodeFr = getDialCodeForCountry(frCountryUpper);
                    if (dialCodeFr) {
                      setValue("phoneNumber", dialCodeFr, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }
                }
              } else {
                // Set country from VAT response (use resolved country code, uppercase)
                const vatCountryUpper = (resolvedCountryCode || vatCountryCode || "").toUpperCase();
                setValue("country", vatCountryUpper, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                newPrefilledFields.country = true;
                const currentPhoneVat = getValues("phoneNumber");
                if (isPhoneEmptyOrCodeOnly(currentPhoneVat)) {
                  const dialCodeVat = getDialCodeForCountry(vatCountryUpper);
                  if (dialCodeVat) {
                    setValue("phoneNumber", dialCodeVat, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }
              }
            }

            // Prefill houseNumber and buildingNumber if available from VAT lookup
            if (validationResult.data.houseNumber) {
              setValue("houseNumber", validationResult.data.houseNumber, {
                shouldValidate: true,
                shouldDirty: true,
              });
              newPrefilledFields.houseNumber = true;
            }

            if (validationResult.data.buildingNumber) {
              setValue("buildingNumber", validationResult.data.buildingNumber, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            if (validationResult.data.state) {
              setValue("state", validationResult.data.state, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            setPrefilledFields(newPrefilledFields);

            // Mark VAT validation as successful and store the validated VAT number
            setVatValidationCache("VALID", true, value);
            setVatValidationError(null);

            // Trigger validation for houseNumber after all fields are set
            // This ensures validation runs correctly based on the country requirement
            // Use a small delay to ensure all setValue operations complete first
            setTimeout(async () => {
              // Trigger validation in the correct order: country first, then houseNumber
              await trigger("country");
              await trigger("houseNumber");
              setaddresschanged(true);
            }, 100);

            return true;
          } else if (
            validationResult &&
            validationResult.data &&
            validationResult.data.isCompany === false
          ) {
            // Handle case where VAT number is invalid but no error was thrown
            setVatValidationCache("INVALID", false, null);
            setVatValidationError(getLabel("error_invalid_vat"));
            // Keep entered/prefilled values on invalid VAT (do not clear fields).
            // Previous logic retained for reference:
            // setValue("companyName", "", { shouldValidate: true, shouldDirty: true });
            // setValue("street", "", { shouldValidate: true, shouldDirty: true });
            // setValue("city", "", { shouldValidate: true, shouldDirty: true });
            // setValue("postalCode", "", { shouldValidate: true, shouldDirty: true });
            // setValue("country", "", { shouldValidate: true, shouldDirty: true });
            // setValue("houseNumber", "", { shouldValidate: true, shouldDirty: true });
            // setValue("buildingNumber", "", { shouldValidate: true, shouldDirty: true });
            // setValue("state", "", { shouldValidate: true, shouldDirty: true });

            // Reset prefilled fields state
            setPrefilledFields({
              street: false,
              city: false,
              postalCode: false,
              country: false,
              houseNumber: false,
            });
            return false;
          }
          // Fallback: treat unknown VAT lookup results as invalid VAT.
          // setVatValidationStatus("INVALID");
          // vatValidationStatusRef.current = "INVALID";
          // setVatValidationError(getLabel("error_invalid_vat"));
          // setVatValidatedSuccessfully(false);
          // setLastValidatedVatNumber(null);

          setVatValidationCache("VALID", true, value);
          setVatValidationError(null);
          return false;
        } catch (error: any) {
          const title = error?.response?.data?.title ?? error?.title;
          const detail =
            error?.response?.data?.detail ??
            error?.response?.data?.message ??
            error?.detail ??
            error?.message ??
            null;

          const combined = `${title ?? ""} ${detail ?? ""}`.toLowerCase();

          // Temporary VIES/service failures should not hard-block checkout.
          const isTemporaryViesIssue =
            title === "VAT-ValidationError" ||
            combined.includes("busy") ||
            combined.includes("temporar") ||
            combined.includes("rate") ||
            combined.includes("concurr") ||
            combined.includes("overload") ||
            combined.includes("vies") ||
            combined.includes("unavailable");

          if (isTemporaryViesIssue) {
            setVatValidationCache("PENDING_VERIFICATION", true, value);
            setVatValidationError(null);
          } else {
            setVatValidationCache("INVALID", false, null);
            setVatValidationError(getLabel("error_invalid_vat"));
          }

          // Keep entered/prefilled values on VAT lookup error (do not clear fields).
          // Previous logic retained for reference:
          // setValue("companyName", "", { shouldValidate: true, shouldDirty: true });
          // setValue("street", "", { shouldValidate: true, shouldDirty: true });
          // setValue("city", "", { shouldValidate: true, shouldDirty: true });
          // setValue("postalCode", "", { shouldValidate: true, shouldDirty: true });
          // setValue("country", "", { shouldValidate: true, shouldDirty: true });
          // setValue("houseNumber", "", { shouldValidate: true, shouldDirty: true });
          // setValue("buildingNumber", "", { shouldValidate: true, shouldDirty: true });
          // setValue("state", "", { shouldValidate: true, shouldDirty: true });

          // Reset prefilled fields state
          setPrefilledFields({
            street: false,
            city: false,
            postalCode: false,
            country: false,
            houseNumber: false,
          });
          return isTemporaryViesIssue;
        } finally {
          setIsValidatingVatState(false);
        }
      }
      return true;
    };

    const handleContactClick = () => {
      // Navigate to support page with "Other" category pre-selected
      const supportRoute = getRouteLocaleString(Routes.support, params);
      window.location.href = `${supportRoute}/other`;
    };

    return (
      <Box className="h-full w-full">
        <Box className="flex-1 bg-transparent">
          <Box className="relative h-full">
            {/* @ts-ignore */}
            <Box className="custom-scrollbar h-full overflow-y-auto" onScroll={handleScroll}>
              <Box className="py-3">
                <Typography className="text-color-text-body typography-subtitle-01">
                  {getLabel("billing_address")}
                </Typography>
              </Box>

              <form ref={formElementRef} onSubmit={handleSubmit(onSubmit)}>
                <Box className="grid w-full flex-col gap-space-lg">
                  {shouldShowBusinessFields && (
                    <>
                      <Box className="flex w-full flex-row gap-4">
                        {/* VAT number field */}
                        <Box className="flex w-1/2 flex-col gap-[6px]">
                          <Controller
                            control={control}
                            name="vatNumber"
                            render={({ field: { onChange, value, onBlur } }) => (
                              <OGTextInput
                                title={getLabel("vat_number")}
                                value={value || ""}
                                onChange={onChange}
                                onBlur={() => handleVatBlur(value || "", onChange, onBlur)}
                                placeholder={getLabel("enter_vat_number")}
                                state={
                                  errors.vatNumber || vatValidationError
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.vatNumber?.message || vatValidationError || ""}
                                maxLength={50}
                                isReadOnly={isValidatingVat}
                                mandatory={true}
                                // VAT Number is always editable (never read-only after validation)
                              />
                            )}
                          />
                          {isValidatingVat && (
                            <Text className="mt-1 font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body">
                              {getLabel("validate_vat")}...
                            </Text>
                          )}
                          {vatValidationStatus === "VALID" && (
                            <OGAlert
                              variant="info"
                              title=""
                              description={getLabel("valid_vat_number")}
                              className="mt-1"
                            />
                          )}
                          {vatValidationStatus === "PENDING_VERIFICATION" && (
                            <OGAlert
                              variant="warning"
                              title=""
                              description={getLabel("error_vat_busy")}
                              className="mt-1"
                            />
                          )}
                          <Text className="mt-1 font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body opacity-70">
                            {getLabel("format_country_code_placeholder")}
                          </Text>
                        </Box>

                        <Box className="flex w-1/2 flex-col gap-[6px]">
                          {/* Company name field */}
                          <Controller
                            control={control}
                            name="companyName"
                            render={({ field: { onChange, value, onBlur } }) => (
                              <OGTextInput
                                title={getLabel("company_name")}
                                value={value || ""}
                                onChange={onChange}
                                onBlur={onBlur}
                                placeholder={getLabel("enter_company_name")}
                                state={
                                  errors.companyName
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                isReadOnly={isValidatingVat}
                                error={errors.companyName?.message || ""}
                                maxLength={250}
                                mandatory={true}
                              />
                            )}
                          />
                        </Box>
                      </Box>

                      <Box className="flex w-full flex-row items-center gap-3 bg-color-system-info-extra-light p-2">
                        {/* Info icon with tooltip */}
                        <CustomTooltip content={getLabel("deposit_hover_text")}>
                          <Image
                            src={exclamicon}
                            alt="icon"
                            className="mt-[2px] flex min-h-6 min-w-6 shrink-0 cursor-pointer"
                          />
                        </CustomTooltip>

                        {/* Continuous text block */}
                        <Box className="">
                          {/* <Typography className="text-noWrap typography-heading-04 font-bold"> */}
                          <Typography className="typography-caption">
                            {getLabel("business_order_billing_address")}{" "}
                            {getLabel("business_order_billing_details")}{" "}
                            <span
                              className="cursor-pointer whitespace-nowrap underline"
                              onClick={handleContactClick}
                            >
                              {getLabel("contact_us")}
                            </span>
                          </Typography>{" "}
                          {/* </Typography>{" "} */}
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Country + state block */}
                  <Box
                    className={`${shouldShowBusinessFields ? "flex w-full base:flex-col gtsm:flex-col gtlg:flex-col" : "flex w-full base:flex-col gtsm:flex-col gtlg:flex-col"}`}
                  >
                    {/* country */}

                    <Box className="flex w-full gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      <Box className={`flex-1`}>
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
                                value={value}
                                onChange={handleCountryChange}
                                placeholder={
                                  isConfigLoading
                                    ? getLabel("loading_countries")
                                    : getLabel("select_country")
                                }
                                className="bg-color-background-default"
                                state={
                                  errors.country
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.country?.message || ""}
                                mandatory={true}
                                isDisabled={isConfigLoading || isValidatingVat}
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
                        {/* <Typography classNameext="t-color-text-muted typography-caption">
                          {getLabel("Checkout_DeliveryAddress_VATCountryNote")}
                        </Typography> */}

                        {/* <OGAlert variant="error" title="Error" description="This is an error alert message." /> */}
                      </Box>

                      {/* state field - only visible for countries with states */}
                      {COUNTRIES_WITH_STATES.includes(watch("country")?.toUpperCase()) && (
                        <Box className={`flex-1`}>
                          <Controller
                            control={control}
                            name="state"
                            render={({ field: { onChange, value } }) => (
                              <OGTextInput
                                title={getLabel("state")}
                                value={value || ""}
                                onChange={onChange}
                                placeholder={getLabel("enter_state_province")}
                                state={
                                  errors.state
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.state?.message || ""}
                                isReadOnly={isValidatingVat}
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
                  </Box>

                  {/* street name */}
                  <Controller
                    control={control}
                    name="street"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("street_address")}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={getLabel("enter_street_address")}
                        state={
                          errors.street
                            ? "error"
                            : isValidatingVat
                              ? "disabled"
                              : value
                                ? "filled"
                                : "default"
                        }
                        error={errors.street?.message || ""}
                        mandatory={true}
                        isReadOnly={isValidatingVat}
                      />
                    )}
                  />

                  {/* House Number field */}
                  {shouldShowBusinessFields && (
                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      <Box className="flex-1">
                        {/* House number */}
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
                                state={
                                  errors.houseNumber
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.houseNumber?.message || ""}
                                mandatory={isRequired}
                                isReadOnly={isValidatingVat}
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
                              state={
                                errors.buildingNumber
                                  ? "error"
                                  : isValidatingVat
                                    ? "disabled"
                                    : value
                                      ? "filled"
                                      : "default"
                              }
                              error={errors.buildingNumber?.message || ""}
                              isReadOnly={isValidatingVat}
                              // mandatory={(watch("country") || "").toLowerCase() === "be"}
                              // mandatory={false}
                            />
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {!shouldShowBusinessFields && (
                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      <Box className="flex-1">
                        {/* House Number field */}
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
                                state={
                                  errors.houseNumber
                                    ? "error"
                                    : isValidatingVat
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.houseNumber?.message || ""}
                                mandatory={isRequired}
                                isReadOnly={isValidatingVat}
                              />
                            );
                          }}
                        />
                      </Box>
                      <Box className="flex-1">
                        {" "}
                        {/* Bus Number field */}
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
                              state={
                                errors.buildingNumber
                                  ? "error"
                                  : isValidatingVat
                                    ? "disabled"
                                    : value
                                      ? "filled"
                                      : "default"
                              }
                              error={errors.buildingNumber?.message || ""}
                              isReadOnly={isValidatingVat}
                              // mandatory={(watch("country") || "").toLowerCase() === "be"}
                            />
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* street name */}
                  {/* <Controller
                    control={control}
                    name="street"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={getLabel("street_address")}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={getLabel("enter_street_address")}
                        state={
                          errors.street
                            ? "error"
                            : isValidatingVat
                              ? "disabled"
                              : value
                                ? "filled"
                                : "default"
                        }
                        error={errors.street?.message || ""}
                        mandatory={true}
                        isReadOnly={isValidatingVat || shouldShowBusinessFields}
                      />
                    )}
                  /> */}
                  {/* House Number field */}
                  {/* {shouldShowBusinessFields && (
                    <Box className="flex flex-col gap-space-lg">
                      
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
                              state={
                                errors.houseNumber
                                  ? "error"
                                  : isValidatingVat
                                    ? "disabled"
                                    : value
                                      ? "filled"
                                      : "default"
                              }
                              error={errors.houseNumber?.message || ""}
                              mandatory={isRequired}
                              isReadOnly={true}
                            />
                          );
                        }}
                      />
// 
                      
                      <Controller
                        control={control}
                        name="buildingNumber"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={getLabel("address_bus_number") || "Bus number"}
                            value={value || ""}
                            onChange={onChange}
                            placeholder={getLabel("enter_address_bus_number") || "Enter bus number"}
                            state={
                              errors.buildingNumber
                                ? "error"
                                : isValidatingVat
                                  ? "disabled"
                                  : value
                                    ? "filled"
                                    : "default"
                            }
                            error={errors.buildingNumber?.message || ""}
                            isReadOnly={isValidatingVat}
                            // Bus/building number should not show the "required" asterisk.
                            mandatory={false}
                          />
                        )}
                      />
                    </Box>
                  )} */}

                  <Box
                    className={`${shouldShowBusinessFields ? "flex w-full gap-4 base:flex-col gtsm:flex-row gtlg:flex-row" : "flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row"}`}
                  >
                    {/* city filed */}
                    <Box className={`flex-1`}>
                      <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={getLabel("city")}
                            value={value || ""}
                            onChange={onChange}
                            placeholder={getLabel("enter_city")}
                            state={
                              errors.city
                                ? "error"
                                : isValidatingVat
                                  ? "disabled"
                                  : value
                                    ? "filled"
                                    : "default"
                            }
                            error={errors.city?.message || ""}
                            mandatory={true}
                            isReadOnly={isValidatingVat}
                          />
                        )}
                      />
                    </Box>

                    {/* Postal code field */}
                    <Box className={`flex-1`}>
                      <Controller
                        control={control}
                        name="postalCode"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={getLabel("postal_code")}
                            value={value || ""}
                            onChange={onChange}
                            placeholder={getLabel("enter_postal_code")}
                            state={
                              errors.postalCode
                                ? "error"
                                : isValidatingVat
                                  ? "disabled"
                                  : value
                                    ? "filled"
                                    : "default"
                            }
                            error={errors.postalCode?.message || ""}
                            mandatory={true}
                            isReadOnly={isValidatingVat}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* phone number business */}
                  {shouldShowBusinessFields && (
                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      <Box className="flex-1">
                        <Controller
                          control={control}
                          name="phoneNumber"
                          render={({ field: { onChange, value, onBlur } }) => (
                            <OGPhoneInput
                              title={getLabel("phone_number")}
                              value={value || ""}
                              onChange={(newValue) => {
                                onChange(newValue || "");
                              }}
                              placeholder={getLabel("phone_number")}
                              state={errors.phoneNumber ? "error" : value ? "filled" : "default"}
                              error={errors.phoneNumber?.message || ""}
                              defaultCountry={
                                (watch("country") || currentLocale?.country_code || "BE") as any
                              }
                              isReadOnly={isValidatingVat}
                            />
                          )}
                        />
                      </Box>

                      <Box className="flex-1"></Box>
                    </Box>
                  )}

                  {!shouldShowBusinessFields && (
                    <Box className="flex gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
                      {/* phone number personal */}
                      <Box className="flex-1">
                        <Controller
                          control={control}
                          name="phoneNumber"
                          render={({ field: { onChange, value, onBlur } }) => (
                            <OGPhoneInput
                              title={getLabel("phone_number")}
                              value={value || ""}
                              onChange={(newValue) => {
                                onChange(newValue || "");
                              }}
                              placeholder={getLabel("phone_number")}
                              state={errors.phoneNumber ? "error" : value ? "filled" : "default"}
                              error={errors.phoneNumber?.message || ""}
                              defaultCountry={
                                (watch("country") || currentLocale?.country_code || "BE") as any
                              }
                              // mandatory={true}
                            />
                          )}
                        />
                      </Box>

                      <Box className="flex-1"></Box>
                    </Box>
                  )}

                  {/* Add Invoice Email field and find to "email" payload */}
                  {shouldShowBusinessFields && (
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <OGTextInput
                          title={getLabel("invoice_email_address")}
                          value={value || ""}
                          onChange={onChange}
                          placeholder={getLabel("invoice_email_placeholder")}
                          state={errors.email ? "error" : value ? "filled" : "default"}
                          error={errors.email?.message || ""}
                          mandatory={true}
                          isReadOnly={isValidatingVat}
                        />
                      )}
                    />
                  )}

                  {/* Save Billing Address Button - Only for authenticated users with saved addresses (not hidden) */}
                  {isAuthenticated && !hideSaveButton && (
                    <OGButton
                      onClick={handleSubmit(onSubmit)}
                      type="primary"
                      size="large"
                      className="w-full"
                      disabled={
                        !isFormValid ||
                        isSavingAddress ||
                        (shouldShowBusinessFields && !!vatValidationError)
                      }
                    >
                      {isSavingAddress
                        ? getLabel("saving")
                        : getLabel("checkout_savebilling_address")}
                    </OGButton>
                  )}
                </Box>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
);
