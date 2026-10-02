"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AuthUserType } from "@/stores/useAuthStore";
import { useEffect, useState, useRef } from "react";
import { useGetConfigQuery } from "@/hooks/config";
import { useDeleteAddressMutation, useSaveAddressMutation } from "@/hooks/address";
import { isPossiblePhoneNumber, getCountryCallingCode } from "react-phone-number-input";
// import "react-phone-number-input/style.css";
import { useQueryClient } from "@tanstack/react-query";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getLocale } from "../landing/footer/language-selector";
import SavedAddressIcon from "@/components/icons/SavedAddressIcon";
import { useBranding } from "@/contexts/BrandingContext";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGSelectDropdown } from "@/components/og-components/OGSelectDropdown";
import { OGButton } from "@/components/og-components/OGButton";
import { OGPhoneInput } from "@/components/og-components/OGPhoneInput";
import { useCartStore } from "@/stores/useCartStore";
import { companyVatLookup } from "@/services/profile";
import { Address } from "@/types/profile";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useParams, usePathname } from "next/navigation";
import { Routes } from "@/config/routes";
import { detectPage } from "@/utils/detectPage";
import { findDuplicateAddress } from "@/utils/addressDuplicates";
import { queryKeys } from "@/lib/query-keys";
import Typography from "@/components/og-components/Typography";
import { useMedia } from "@/hooks/useMedia";
import { OGAlert } from "@/components/og-components/OGAlert";
// Countries that have states/provinces - State field is only visible for these countries
const COUNTRIES_WITH_STATES = ["DE", "IT", "ES", "PT", "PL"];

const getDialCodeForCountry = (country?: string): string => {
  if (!country) return "";
  try {
    const code = getCountryCallingCode(country as any);
    return code ? `+${code}` : "";
  } catch {
    return "";
  }
};
type VatValidationStatus = "VALID" | "INVALID" | "PENDING_VERIFICATION";

const isPhoneEmptyOrCodeOnly = (phone?: string | null): boolean => {
  if (!phone || !phone.trim()) return true;
  const digits = phone.replace(/\D/g, "");
  return digits.length > 0 && digits.length <= 3;
};

// Reusable function to find matching country code (case-insensitive)
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

const EMPTY_VAT_LOCKED_FIELDS = {
  street: false,
  city: false,
  postalCode: false,
  country: false,
  houseNumber: false,
};

export const EditAddressModal = () => {
  const {
    isOpen,
    closeModal,
    modalType,
    selectedAddress,
    modalSaveType,
    setModalSaveType,
    setHasDuplicateInSavedAddresses,
    setJustSelectedDuplicateForCheckout,
  } = useEditAddressModalStore();
  const { authUser, setAddresses, isAuthenticated } = useAuthStore();
  const { setiscartchanged, setShowAlert, showAlert } = useCartStore();
  const { getLabel } = useBranding();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 639px)");
  // const { "language-country": languagecountry } = (params as Record<string, string>) || {};
  // Safety check: use fallback if language-country param is missing
  // const country = languagecountry?.split("-")[1] || "EU";
  const { data: config, isLoading: isConfigLoading } = useGetConfigQuery();

  const [isFormValid, setIsFormValid] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [vatValidationStatus, setVatValidationStatus] = useState<VatValidationStatus | null>(null);
  const vatValidationStatusRef = useRef<VatValidationStatus | null>(null);
  const [vatValidatedSuccessfully, setVatValidatedSuccessfully] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pre-select Business tab based on modalSaveType
      if (modalSaveType === "Business") {
        setIsBusiness(true);
      } else if (modalSaveType === "Personal") {
        setIsBusiness(false);
      } else if (modalType === "edit" && selectedAddress?.isCompany) {
        // For edit mode without modalSaveType, use the address's isCompany value
        setIsBusiness(true);
      } else {
        setIsBusiness(false);
      }
    }
  }, [isOpen, modalSaveType, modalType, selectedAddress]);
  //  useEffect(() => {
  //   if (isOpen) {
  //     setIsBusiness(
  //       authUser?.businessAccount
  //         ? modalType === "add" || modalSaveType === "Personal"
  //           ? false
  //           : true
  //         : false,
  //     );
  //   }
  // }, [isOpen]);
  // Add these lines to get the current locale

  const { locale } = useLandingPageDataStore();
  const currentLocale = getLocale(locale);
  const [isValidatingVat, setIsValidatingVat] = useState(false);
  // const [vatresult, setvatresult] = useState<Address | null>(null);
  const [vatValidationError, setVatValidationError] = useState<string | null>(null);
  // const [vatValidatedSuccessfully, setVatValidatedSuccessfully] = useState(false);
  const [lastValidatedVatNumber, setLastValidatedVatNumber] = useState<string | null>(null);
  const [vatLockedFields, setVatLockedFields] = useState(EMPTY_VAT_LOCKED_FIELDS);
  const hasValidatedVatLookup = isBusiness && !!lastValidatedVatNumber && !vatValidationError;
  // Add this function to handle scroll events
  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   setIsScrolled(e.currentTarget.scrollTop > 0);
  // };

  // Add this useEffect to reset tempPhone and VAT validation state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // setTempPhone("");
      // setVatValidatedSuccessfully(false);
      setLastValidatedVatNumber(null);
      setVatValidationError(null);
      setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
      // setvatresult(null);
    }
  }, [isOpen]);

  //Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const handleclosemodal = () => {
    closeModal();
    // setvatresult(null);
    reset();
    clearErrors();
    setVatValidationError(null);
    // setVatValidatedSuccessfully(false);
    setLastValidatedVatNumber(null);
    setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
    setShowAlert(false);
  };
  const queryClient = useQueryClient();
  const { mutate: saveAddress, isPending: isSavingAddress } = useSaveAddressMutation({
    onSuccess: async () => {
      // Old behavior (direct API call): const profile = await getProfile({}); setAddresses(profile?.addresses);
      // Invalidate profile queries so Profile saved addresses and Checkout address lists auto-update
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.formation() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.userData() }),
      ]);
      setiscartchanged(true);
      handleclosemodal();
      setModalSaveType(null);
    },
    onError: (error) => {},
  });
  const { mutate: deleteAddress, isPending: isDeletingAddress } = useDeleteAddressMutation({
    onSuccess: () => {
      handleclosemodal();
    },
  });
  // Form validation schema based on the Address type in profile.ts
  const addressSchema = z
    .object({
      // name: z.string().optional(),
      street: z.string().min(1, getLabel("Checkout_streetname_required")),
      city: z.string().min(1, getLabel("Checkout_city_required")),
      houseNumber: z.string().optional(),
      buildingNumber: z.string().optional(),
      state: z.string().optional(), // Changed from required to optional
      postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
      country: z.string().min(1, "Country is required"),
      phoneNumber: z.string().optional(),
      isDefaultBilling: z.boolean().optional(),
      isDefaultShipping: z.boolean().optional(),
      vatNumber: z.string().optional(),
      companyName: z.string().optional(),
      isDefaultBusinessBilling: z.boolean().optional(),
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
    )
    .refine(
      (data) => {
        // VAT Number validation: Required when isBusiness is true
        if (isBusiness) {
          return !!data.vatNumber && data.vatNumber.trim() !== "";
        }
        return true;
      },
      {
        message: "VAT number is required",
        path: ["vatNumber"],
      },
    )
    .refine(
      (data) => {
        // Company Name validation: Required when isBusiness is true
        if (isBusiness) {
          return !!data.companyName && data.companyName.trim() !== "";
        }
        return true;
      },
      {
        message: "Company name is required",
        path: ["companyName"],
      },
    );

  type AddressFormData = z.infer<typeof addressSchema>;

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    trigger,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      // name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phoneNumber: "",
      houseNumber: "",
      buildingNumber: "",
      isDefaultBilling: (authUser as AuthUserType)?.addresses?.length === 0,
      isDefaultShipping: (authUser as AuthUserType)?.addresses?.length === 0,
      vatNumber: "",
      companyName: "",
    },
    mode: "onChange", // Set validation mode to onChange
  });

  // Trigger validation for houseNumber / buildingNumber / state when country changes,
  // but skip the very first render so errors don't show before user interaction.
  const watchedCountry = watch("country");
  const hasCountryEverChangedRef = useRef(false);
  const initialCountryRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!initialCountryRef.current && watchedCountry) {
      //@ts-ignore
      initialCountryRef.current = watchedCountry;
    }
  }, [watchedCountry, initialCountryRef]);

  useEffect(() => {
    if (watchedCountry === "BE") {
      setShowAlert(false);
    } else {
      setShowAlert(true);
    }

    if (initialCountryRef.current && watchedCountry !== initialCountryRef.current) {
      setShowAlert(true);
    }
  }, [watchedCountry, initialCountryRef, setShowAlert]);

  useEffect(() => {
    if (!watchedCountry) return;
    if (!hasCountryEverChangedRef.current) {
      hasCountryEverChangedRef.current = true;
      return;
    }

    trigger("houseNumber");
    trigger("buildingNumber");
    trigger("state");
  }, [watchedCountry, trigger]);

  // Detect VAT number changes and reset validation state if needed
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "vatNumber" && isBusiness) {
        const currentVat = value.vatNumber || "";
        // If VAT number changed from the last validated one, reset validation state
        if (lastValidatedVatNumber && currentVat !== lastValidatedVatNumber) {
          // setVatValidatedSuccessfully(false);
          setLastValidatedVatNumber(null);
          setVatValidationError(null);
          setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
          setVatValidationStatus(null);
          vatValidationStatusRef.current = null;
          // setvatresult(null);
          // Do not clear other address fields when VAT changes (invalid lookup / re-entry UX).
          // Previous logic retained for reference:
          // setValue("companyName", "", { shouldValidate: true, shouldDirty: true });
          // setValue("street", "", { shouldValidate: true, shouldDirty: true });
          // setValue("city", "", { shouldValidate: true, shouldDirty: true });
          // setValue("postalCode", "", { shouldValidate: true, shouldDirty: true });
          // setValue("country", "", { shouldValidate: true, shouldDirty: true });
          // setValue("houseNumber", "", { shouldValidate: true, shouldDirty: true });
          // setValue("buildingNumber", "", { shouldValidate: true, shouldDirty: true });
          // setValue("state", "", { shouldValidate: true, shouldDirty: true });
        }
        // If VAT number is cleared, reset state
        if (!currentVat || currentVat.trim() === "") {
          // setVatValidatedSuccessfully(false);
          setLastValidatedVatNumber(null);
          setVatValidationError(null);
          setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
          setVatValidationStatus(null);
          vatValidationStatusRef.current = null;
          // setvatresult(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, lastValidatedVatNumber, isBusiness, setValue]);

  // Reset VAT validation state when switching between business and personal modes
  useEffect(() => {
    // setVatValidatedSuccessfully(false);
    setLastValidatedVatNumber(null);
    setVatValidationError(null);
    setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
    // setvatresult(null);
  }, [isBusiness]);

  // Keep a simple "is form valid enough to enable Save button" flag
  useEffect(() => {
    const subscription = watch((value) => {
      const requiredFields = ["street", "city", "postalCode", "country"];

      const allFieldsFilled = requiredFields.every(
        (field) =>
          value[field as keyof AddressFormData] &&
          String(value[field as keyof AddressFormData]).trim() !== "",
      );

      const countryLower = value.country?.toLowerCase() || "";

      // House number required for BE, NL, LU
      const requiredHouseCountries = ["be", "nl", "lu"];
      const houseNumberValid = requiredHouseCountries.includes(countryLower)
        ? !!value.houseNumber && String(value.houseNumber).trim() !== ""
        : true;

      const shouldBeValid = allFieldsFilled && houseNumberValid;

      setIsFormValid(shouldBeValid);
    });

    return () => subscription.unsubscribe();
  }, [watch, isValid]);

  // Prefill the form when in edit mode and selectedAddress is available
  useEffect(() => {
    if (modalType === "edit" && selectedAddress) {
      let countryCode = selectedAddress.country || "";
      if (config?.countries && countryCode) {
        const matchingCode = findMatchingCountryCode(
          countryCode,
          config.countries as Record<string, string>,
        );
        if (matchingCode) {
          countryCode = matchingCode;
        }
      }
      countryCode = (countryCode || "").toUpperCase(); // dropdown expects uppercase codes
      reset({
        // name: selectedAddress.name || "",
        street: selectedAddress.street || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        postalCode: selectedAddress.postalCode || "",
        vatNumber: selectedAddress.vatNumber || "",
        companyName: selectedAddress.name || "",
        country: countryCode, // Use the correctly cased country code
        phoneNumber: selectedAddress.phoneNumber || "",
        isDefaultBusinessBilling: selectedAddress.isDefaultBilling || false,
        houseNumber: selectedAddress.houseNumber || "",
        buildingNumber: selectedAddress.buildingNumber || "",
        isDefaultBilling:
          (authUser as AuthUserType)?.addresses?.length <= 1
            ? true
            : selectedAddress.isDefaultBilling || false,
        isDefaultShipping:
          (authUser as AuthUserType)?.addresses?.length <= 1
            ? true
            : selectedAddress.isDefaultShipping || false,
      });
      // if (selectedAddress.isCompany) {
      //   setvatresult(selectedAddress);
      // }
    } else if (modalType === "add") {
      let defaultCountry = "";
      if (currentLocale?.country_code && config?.countries) {
        defaultCountry = (
          findMatchingCountryCode(
            currentLocale.country_code,
            config.countries as Record<string, string>,
          ) || ""
        ).toUpperCase();
      }
      reset({
        // name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: defaultCountry,
        phoneNumber: "",
        houseNumber: "",
        buildingNumber: "",
        isDefaultBilling: (authUser as AuthUserType)?.addresses?.length === 0,
        isDefaultShipping: (authUser as AuthUserType)?.addresses?.length === 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modalType,
    selectedAddress,
    reset,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (authUser as AuthUserType)?.addresses?.length,
    config?.countries,
    currentLocale,
  ]);

  const waitForOngoingVatValidation = async () => {
    while (isValidatingVat) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const ensureVatValidatedBeforeSubmit = async (): Promise<boolean> => {
    if (!isBusiness) return true;

    const vatValue = (getValues("vatNumber") || "").trim();
    if (!vatValue) return true;

    if (
      vatValidatedSuccessfully &&
      lastValidatedVatNumber === vatValue &&
      vatValidationStatus !== "INVALID"
    ) {
      return true;
    }

    // In edit mode, do not re-run VAT lookup on Save when VAT is unchanged.
    const originalVatValue = (selectedAddress?.vatNumber || "").trim();
    if (
      modalType === "edit" &&
      originalVatValue &&
      vatValue.toUpperCase() === originalVatValue.toUpperCase()
    ) {
      return true;
    }

    // if (!vatValidationError && lastValidatedVatNumber === vatValue) {
    //   return true;
    // }

    await waitForOngoingVatValidation();

    // if (!vatValidationError && lastValidatedVatNumber === vatValue) {
    //   return true;
    // }
    if (
      vatValidatedSuccessfully &&
      lastValidatedVatNumber === vatValue &&
      vatValidationStatus !== "INVALID"
    ) {
      return true;
    }

    await handleVatBlur(
      vatValue,
      () => {},
      () => {},
    );

    return !vatValidationError && lastValidatedVatNumber === vatValue;
  };

  const onSubmit = async (_data: AddressFormData) => {
    const vatReady = await ensureVatValidatedBeforeSubmit();
    if (!vatReady) {
      return;
    }

    const data = getValues();
    setShowAlert(false);
    initialCountryRef.current = watchedCountry;
    const addressPayload: Address = {
      street: data.street || "",
      city: data.city || "",
      state: data.state || "",
      postalCode: data.postalCode || "",
      country: data.country || "",
      isDefaultShipping: !!data.isDefaultShipping,
      ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
      ...(data.houseNumber !== undefined && data.houseNumber !== null
        ? { houseNumber: data.houseNumber }
        : {}),
      ...(data.buildingNumber !== undefined && data.buildingNumber !== null
        ? { buildingNumber: data.buildingNumber }
        : {}),
      ...(isBusiness
        ? {
            name: data.companyName || "",
            isCompany: true,
            isDefaultBilling: !!data.isDefaultBusinessBilling,
            ...(data.vatNumber ? { vatNumber: data.vatNumber } : {}),
          }
        : {
            isCompany: false,
            isDefaultBilling: !!data.isDefaultBilling,
          }),
    };

    const existingAddresses = (authUser as AuthUserType)?.addresses ?? [];
    const candidate = {
      id: modalType === "edit" ? selectedAddress?.id : undefined,
      companyName: isBusiness
        ? (addressPayload.name ?? (addressPayload as Address).companyName ?? "")
        : undefined,
      houseNumber: addressPayload.houseNumber ?? "",
      street: addressPayload.street ?? "",
      city: addressPayload.city ?? "",
      postalCode: addressPayload.postalCode ?? "",
      country: addressPayload.country ?? "",
      isCompany: isBusiness,
    };
    const excludeId = modalType === "edit" ? (selectedAddress?.id ?? null) : null;
    const mode = isBusiness ? "business" : "personal";
    const duplicate = findDuplicateAddress(candidate, existingAddresses, { excludeId, mode });

    if (duplicate) {
      const currentPage = detectPage(typeof pathname === "string" ? pathname : "") as
        "checkout" | "saved-addresses" | string;

      if (currentPage === "saved-addresses") {
        setHasDuplicateInSavedAddresses(true);
        handleclosemodal();
        return;
      }

      if (currentPage === "checkout") {
        const cart = useCartStore.getState();
        cart.setSelectedSavedBillingAddress(duplicate as Address);
        if (cart.isSameShipping) {
          cart.setSelectedSavedDeliveryAddress(duplicate as Address);
        }
        setJustSelectedDuplicateForCheckout(true);
        const after = useCartStore.getState();

        handleclosemodal();
        return;
      }

      handleclosemodal();
      return;
    }

    // Handle form submission based on modalType
    if (modalType === "edit" && selectedAddress?.id) {
      // Update existing address
      saveAddress({ ...addressPayload, id: selectedAddress.id } as any);
    } else {
      // Add new address
      //@ts-ignore
      saveAddress(addressPayload);
    }
  };

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      let defaultCountry = "";
      if (currentLocale?.country_code && config?.countries) {
        defaultCountry = (
          findMatchingCountryCode(
            currentLocale.country_code,
            config.countries as Record<string, string>,
          ) || ""
        ).toUpperCase();
      }
      reset({
        // name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: defaultCountry,
        phoneNumber: "",
        houseNumber: "",
        buildingNumber: "",
        isDefaultBilling: (authUser as AuthUserType)?.addresses?.length === 0,
        isDefaultShipping: (authUser as AuthUserType)?.addresses?.length === 0,
      });
      // Also reset form validity
      setIsFormValid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset, authUser, currentLocale, config?.countries]);

  if (!isOpen) return null;

  // Handle VAT field blur: validate VAT, prefill address fields, and manage VAT state
  const handleVatBlur = async (
    value: string,
    onChange: (val: string) => void,
    onBlur: () => void,
  ) => {
    onBlur(); // Call the original onBlur to mark field as touched

    if (value && value.length >= 2) {
      setIsValidatingVat(true);
      setVatValidationError(null);
      setVatValidationStatus(null);
      vatValidationStatusRef.current = null;
      // setvatresult(null);
      // setVatValidatedSuccessfully(false);

      try {
        const validationResult = await companyVatLookup(value);
        if (validationResult && validationResult.data && validationResult.data.name) {
          const nextVatLockedFields = { ...EMPTY_VAT_LOCKED_FIELDS };
          setValue("companyName", validationResult.data.name || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (validationResult.data.street) {
            setValue("street", validationResult.data.street || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            nextVatLockedFields.street = true;
          }
          setValue("city", validationResult.data.city || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (validationResult.data.city) {
            nextVatLockedFields.city = true;
          }
          if (validationResult.data.postalCode) {
            setValue("postalCode", validationResult.data.postalCode || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            nextVatLockedFields.postalCode = true;
          }
          const localeCountry = currentLocale?.country_code
            ? findMatchingCountryCode(
                currentLocale.country_code,
                config?.countries as Record<string, string>,
              )
            : "";
          const localeCountryLower = localeCountry?.toLowerCase();
          const vatCountryLower = validationResult.data.country?.toLowerCase();

          // Resolve VAT country code to match config format
          const resolvedVatCountry = validationResult.data.country
            ? findMatchingCountryCode(
                validationResult.data.country,
                config?.countries as Record<string, string>,
              )
            : "";

          if (localeCountryLower === "fr" && vatCountryLower !== "fr") {
            // Keep the FR country, don't override with VAT country to keep houseNumber optional
          } else {
            const vatCountry = (
              resolvedVatCountry ||
              validationResult.data.country ||
              ""
            ).toUpperCase();
            setValue("country", vatCountry, {
              shouldValidate: true,
              shouldDirty: true,
            });
            nextVatLockedFields.country = true;
            const currentPhoneAfterVat = getValues("phoneNumber");
            if (isPhoneEmptyOrCodeOnly(currentPhoneAfterVat)) {
              const dialCode = getDialCodeForCountry(vatCountry);
              if (dialCode) {
                setValue("phoneNumber", dialCode, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }
          }
          setValue("state", validationResult.data.state || "", {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Set houseNumber with validation enabled
          setValue("houseNumber", validationResult.data.houseNumber || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (validationResult.data.houseNumber) {
            nextVatLockedFields.houseNumber = true;
          }
          setValue("buildingNumber", validationResult.data.buildingNumber || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          // setvatresult(validationResult.data);

          // setVatValidatedSuccessfully(true);
          setLastValidatedVatNumber(value);
          setVatValidationError(null);
          setVatLockedFields(nextVatLockedFields);
          setVatValidationStatus("VALID");
          vatValidationStatusRef.current = "VALID";

          setTimeout(async () => {
            await trigger("country");
            await trigger("houseNumber");
          }, 100);

          // Once successful try to submit the form
          // handleSubmit(onSubmit)();
        } else if (
          validationResult &&
          validationResult.data &&
          validationResult.data.isCompany === false
        ) {
          setVatValidationStatus("INVALID");
          vatValidationStatusRef.current = "INVALID";
          setVatValidationError(getLabel("error_invalid_vat"));
          // setVatValidatedSuccessfully(false);
          setLastValidatedVatNumber(null);
          setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
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
        }

        setVatValidationStatus("VALID");
        vatValidationStatusRef.current = "VALID";
        setVatValidatedSuccessfully(true);
        setLastValidatedVatNumber(value);
        setVatValidationError(null);
      } catch (error: any) {
        const title = error?.response?.data?.title ?? error?.title;
        const detail =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.detail ??
          error?.message ??
          null;

        const combined = `${title ?? ""} ${detail ?? ""}`.toLowerCase();
        const isTemporaryViesIssue =
          // title === "VAT-ValidationError" ||
          combined.includes("busy") ||
          combined.includes("temporar") ||
          combined.includes("rate") ||
          combined.includes("concurr") ||
          combined.includes("overload") ||
          combined.includes("vies") ||
          combined.includes("unavailable");

        if (isTemporaryViesIssue) {
          setVatValidationStatus("PENDING_VERIFICATION");
          vatValidationStatusRef.current = "PENDING_VERIFICATION";
          setVatValidationError(null);
          setVatValidatedSuccessfully(true);
          setLastValidatedVatNumber(value);
        } else {
          setVatValidationStatus("INVALID");
          vatValidationStatusRef.current = "INVALID";
          setVatValidationError(getLabel("error_invalid_vat"));
          setVatValidatedSuccessfully(false);
          setLastValidatedVatNumber(null);
        }

        // setVatValidationError(getLabel("error_invalid_vat"));
        // // setVatValidatedSuccessfully(false);
        // setLastValidatedVatNumber(null);
        // setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
        // Keep entered/prefilled values on VAT lookup error (do not clear fields).
        // Previous logic retained for reference:
        // const vatnumber = getValues("vatNumber");
        // reset({
        //   street: "",
        //   city: "",
        //   state: "",
        //   postalCode: "",
        //   country: "",
        //   phoneNumber: "",
        //   houseNumber: "",
        //   buildingNumber: "",
        //   isDefaultBilling: (authUser as AuthUserType)?.addresses?.length === 0,
        //   isDefaultShipping: (authUser as AuthUserType)?.addresses?.length === 0,
        //   vatNumber: vatnumber,
        //   companyName: "",
        // });
      } finally {
        setIsValidatingVat(false);
      }
    }
  };

  // Switch between personal and business address modes
  const handleAccountType = (type: "personal" | "business") => {
    const currentCountry = (watch("country") || "").toUpperCase();
    const defaultFromLocale =
      currentLocale?.country_code && config?.countries
        ? (
            findMatchingCountryCode(
              currentLocale.country_code,
              config.countries as Record<string, string>,
            ) || ""
          ).toUpperCase()
        : "";
    setIsBusiness(type === "business");
    reset({
      // name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: currentCountry || defaultFromLocale,
      phoneNumber: "",
      houseNumber: "",
      buildingNumber: "",
      isDefaultBilling: (authUser as AuthUserType)?.addresses?.length === 0,
      isDefaultShipping: (authUser as AuthUserType)?.addresses?.length === 0,
      vatNumber: "",
      companyName: "",
      isDefaultBusinessBilling: false,
    });
    clearErrors();
    setVatValidationError(null);
    // setVatValidatedSuccessfully(false);
    setLastValidatedVatNumber(null);
    setVatLockedFields(EMPTY_VAT_LOCKED_FIELDS);
    // setvatresult(null);
  };
  // Navigate to support page with "Other" category pre-selected
  const handleContactClick = () => {
    const supportRoute = getRouteLocaleString(Routes.support, params);
    window.location.href = `${supportRoute}/other`;
  };

  const typoClass = `flex-1 justify-center text-center ${!isBusiness ? "text-color-text-brand" : "text-color-text-default"} typography-body-strong-01 hover:text-color-text-brand`;
  // Main input form for ADD and EDIT Address Modal
  return (
    <Box className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 md:items-center">
      {" "}
      <Box className="flex w-full flex-col items-center justify-center base:h-full">
        <Box className="w-full base:h-full md:max-h-[90vh] md:w-[600px]">
          <Box className="h-full w-full bg-color-background-default md:rounded-lg">
            {/* Header No Change Needed*/}
            <Box className="sticky top-0 flex h-[76px] flex-row items-center justify-between border-b xs:py-[25px]">
              <Text className="text-color-text-body body-bold-lg base:pl-6 gtsm:pl-0 gtlg:pl-5">
                {modalType === "add" ? getLabel("add_new_address") : getLabel("edit_address")}
              </Text>
              <Button
                onPress={handleclosemodal}
                className="hidden bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtlg:block"
              >
                <Image src={CancelSquare} alt="Cancel" height={36} width={36} />
              </Button>
              <Button
                onPress={handleclosemodal}
                className="block bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtlg:hidden"
              >
                <Image src={CancelSquare} alt="Cancel" height={28} width={28} />
              </Button>
            </Box>
            <Box className="custom-scrollbar mx-5 flex-1 overflow-hidden overflow-y-auto bg-color-background-default pb-0">
              <Box className="relative h-full">
                <Box className="custom-scrollbar mt-4 h-full overflow-y-auto pb-[2rem] scrollbar-hide">
                  <Box className="flex min-h-11 w-full flex-row gap-3">
                    {/* Personal button - no-op when already selected or when locked to Business (edit) */}
                    <Box
                      // @ts-ignore
                      onClick={() => {
                        if (modalSaveType !== "Business" && isBusiness) {
                          handleAccountType("personal");
                        }
                      }}
                      className={`inline-flex ${!isBusiness || modalSaveType === "Business" ? "cursor-not-allowed" : "cursor-pointer"} items-center justify-center gap-2.5 border-b border-color-border-default px-4 py-1 base:w-1/2 ${!isBusiness ? "border-b-2 border-color-border-focus" : "hover:border-b-2 hover:border-color-border-focus"} `}
                    >
                      <Box className="flex min-w-20 items-center justify-center gap-2.5 rounded-md p-3">
                        <Typography className={typoClass}>
                          {getLabel("personal_purchase")}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Business button */}

                    {!isAuthenticated && !isMobile ? (
                      <Box className="flex h-full w-full">
                        <CustomTooltip content={getLabel("business_select_rule_text")}>
                          <Pressable
                            onPress={() => {
                              if (!isAuthenticated) return;
                              handleAccountType("business");
                            }}
                            className={`inline-flex items-center justify-center gap-2.5 border-b border-color-border-default px-4 py-1 hover:border-b-2 hover:border-color-border-focus base:w-1/2 gtsm:min-w-48 gtsm:max-w-48 gtlg:min-w-48 gtlg:max-w-48 ${isBusiness ? "border-b-2 border-color-border-focus" : ""} `}
                          >
                            <Box className="flex min-w-20 items-center justify-center gap-2.5 rounded-md p-3">
                              <Typography className={typoClass}>
                                {getLabel("business_purchase")}
                              </Typography>
                            </Box>
                          </Pressable>
                        </CustomTooltip>
                      </Box>
                    ) : (
                      <Box
                        // @ts-ignore
                        onClick={() => {
                          if (modalSaveType !== "Personal" && !isBusiness) {
                            handleAccountType("business");
                          }
                        }}
                        className={`inline-flex ${modalSaveType === "Personal" ? "cursor-not-allowed" : isBusiness ? "cursor-not-allowed" : "cursor-pointer"} group items-center justify-center gap-2.5 base:w-1/2 ${!isAuthenticated ? "cursor-not-allowed bg-color-primary-disabled opacity-40" : ""} border-b border-color-border-default px-4 py-1 ${isBusiness ? "border-b-2 border-color-border-focus" : "hover:border-b-2 hover:border-color-border-focus"} `}
                      >
                        <Typography
                          className={`${isBusiness ? "text-color-text-brand" : "text-color-text-default"} justify-center text-center typography-body-strong-01 group-hover:text-color-text-brand`}
                        >
                          {getLabel("business_purchase")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {/* )} */}
                  {/* Account Type panel */}

                  {/* Here Goes the Form */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Box className="mt-6 grid w-full grid-cols-1 gap-6">
                      {/*   Name field (optional) */}

                      {isBusiness ? (
                        <Box className="flex w-full flex-row gap-3">
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
                                  error={errors.companyName?.message || ""}
                                  maxLength={250}
                                  isReadOnly={isValidatingVat}
                                  mandatory={true}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      ) : (
                        // Name field for personal accounts if needed
                        // <Controller
                        //   control={control}
                        //   name="name"
                        //   render={({ field: { onChange, value } }) => (
                        //     <OGTextInput
                        //       title={getLabel("name")}
                        //       value={value || ""}
                        //       onChange={onChange}
                        //       placeholder={getLabel("enter_name")}
                        //       state={errors.name ? "error" : value ? "filled" : "default"}
                        //       error={errors.name?.message || ""}
                        //     />
                        //   )}
                        // />
                        <Box className="flex w-full flex-col gap-3">
                          {/* Country field - Changed to dropdown */}
                          <Controller
                            control={control}
                            name="country"
                            render={({ field: { onChange, value } }) => {
                              const handleCountryChange = (selectedValue: string) => {
                                onChange(selectedValue);
                                const currentPhone = getValues("phoneNumber");
                                if (isPhoneEmptyOrCodeOnly(currentPhone)) {
                                  const dialCode = getDialCodeForCountry(selectedValue);
                                  if (dialCode) {
                                    setValue("phoneNumber", dialCode, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }
                                }
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
                                      ? Object.entries(config.countries)?.map(([code, name]) => ({
                                          label: name as string,
                                          value: code.toUpperCase(),
                                        }))
                                      : []
                                  }
                                />
                              );
                            }}
                          />
                          {showAlert && (
                            <OGAlert
                              title=""
                              variant="info"
                              description={getLabel("price_VAT_updated_on_country_change")}
                            />
                          )}
                        </Box>
                      )}

                      {isBusiness && (
                        <Box className="flex w-full flex-col gap-6">
                          {/* Business Phone Number */}
                          <Controller
                            control={control}
                            name="phoneNumber"
                            render={({ field: { onChange, value, onBlur } }) => (
                              <OGPhoneInput
                                title={getLabel("phone_number")}
                                value={value || ""}
                                className="flex h-full w-full items-center bg-color-background-l2 font-Overpass"
                                onChange={(newValue) => {
                                  onChange(newValue || "");
                                }}
                                placeholder={getLabel("cap_phone_number")}
                                state={
                                  errors.phoneNumber
                                    ? "error"
                                    : isSavingAddress
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.phoneNumber?.message || ""}
                                defaultCountry={
                                  (watch("country") || currentLocale?.country_code || "") as any
                                }
                                isReadOnly={isSavingAddress}
                              />
                            )}
                          />

                          <Controller
                            control={control}
                            name="isDefaultBusinessBilling"
                            render={({ field: { onChange, value } }) => (
                              <OGCheckboxInput
                                selected={value ? "yes" : "no"}
                                state={
                                  modalType === "edit"
                                    ? (authUser as AuthUserType)?.addresses?.length <= 1
                                      ? "disabled"
                                      : "default"
                                    : (authUser as AuthUserType)?.addresses?.length === 0
                                      ? "disabled"
                                      : "default"
                                }
                                label={getLabel("default_business_billing_address")}
                                onChange={(isSelected) => onChange(isSelected)}
                              />
                            )}
                          />

                          <Box className="flex w-full flex-row items-center gap-3 bg-color-system-info-extra-light px-[12px] py-[8px]">
                            {/* Info icon with tooltip */}
                            <CustomTooltip content={getLabel("deposit_hover_text")}>
                              <Image
                                src={exclamicon}
                                alt="icon"
                                className="mt-[2px] shrink-0 cursor-pointer"
                              />
                            </CustomTooltip>

                            {/* Continuous text block */}
                            <Box className="leading-normal text-color-text-body body-regular-sm">
                              <span className="text-wrap font-bold">
                                {getLabel("business_address")}:
                                <span className="font-normal">
                                  {getLabel("business_address_details")}
                                  <span
                                    className="cursor-pointer whitespace-nowrap underline"
                                    onClick={handleContactClick}
                                  >
                                    {getLabel("contact_us")}
                                  </span>
                                </span>{" "}
                              </span>{" "}
                            </Box>
                          </Box>

                          {/* Country field for business - matches checkout billing form */}
                          <Box className="flex w-full flex-col gap-3">
                            <Controller
                              control={control}
                              name="country"
                              render={({ field: { onChange, value } }) => {
                                const handleCountryChange = (selectedValue: string) => {
                                  onChange(selectedValue);
                                  const currentPhone = getValues("phoneNumber");
                                  if (isPhoneEmptyOrCodeOnly(currentPhone)) {
                                    const dialCode = getDialCodeForCountry(selectedValue);
                                    if (dialCode) {
                                      setValue("phoneNumber", dialCode, {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      });
                                    }
                                  }
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
                                        ? Object.entries(config.countries)?.map(([code, name]) => ({
                                            label: name as string,
                                            value: code.toUpperCase(),
                                          }))
                                        : []
                                    }
                                  />
                                );
                              }}
                            />
                            {showAlert && (
                              <OGAlert
                                title=""
                                variant="info"
                                description={getLabel("price_VAT_updated_on_country_change")}
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* State field - only visible for countries with states */}
                      {COUNTRIES_WITH_STATES.includes(watch("country")?.toUpperCase() || "") && (
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
                      )}

                      {/* Street address field */}
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
                      {/* House number field */}
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
                      {/* Building number field */}
                      <Controller
                        control={control}
                        name="buildingNumber"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={getLabel("address_bus_number")}
                            value={value || ""}
                            onChange={onChange}
                            placeholder={getLabel("enter_address_bus_number")}
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

                      {/* City field */}
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
                      {/* Postal code field */}
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
                      {/* <OGAlert
                        title=""
                        description={getLabel("address_country_change_warning")}
                        variant="info"
                      /> */}

                      {/* Phone number field */}
                      {!isBusiness && (
                        <Box className="flex w-full flex-col gap-3">
                          {/* Personal Phone Number */}
                          <Controller
                            control={control}
                            name="phoneNumber"
                            render={({ field: { onChange, value, onBlur } }) => (
                              <OGPhoneInput
                                title={getLabel("phone_number")}
                                value={value || ""}
                                className="flex h-full w-full items-center font-Overpass"
                                onChange={(newValue) => {
                                  onChange(newValue || "");
                                }}
                                placeholder={getLabel("cap_phone_number")}
                                state={
                                  errors.phoneNumber
                                    ? "error"
                                    : isSavingAddress
                                      ? "disabled"
                                      : value
                                        ? "filled"
                                        : "default"
                                }
                                error={errors.phoneNumber?.message || ""}
                                defaultCountry={
                                  (watch("country") || currentLocale?.country_code || "") as any
                                }
                                isReadOnly={isSavingAddress}
                              />
                            )}
                          />
                          {/* isDefault checkbox */}
                          <Controller
                            control={control}
                            name="isDefaultBilling"
                            render={({ field: { onChange, value } }) => (
                              <OGCheckboxInput
                                selected={value ? "yes" : "no"}
                                state={
                                  modalType === "edit"
                                    ? (authUser as AuthUserType)?.addresses?.length <= 1
                                      ? "disabled"
                                      : "default"
                                    : (authUser as AuthUserType)?.addresses?.length === 0
                                      ? "disabled"
                                      : "default"
                                }
                                label={getLabel("default_billing_address")}
                                onChange={(isSelected) => onChange(isSelected)}
                              />
                            )}
                          />

                          {/* isDefaultShipping checkbox */}
                          <Controller
                            control={control}
                            name="isDefaultShipping"
                            render={({ field: { onChange, value } }) => (
                              <OGCheckboxInput
                                selected={value ? "yes" : "no"}
                                state={
                                  modalType === "edit"
                                    ? (authUser as AuthUserType)?.addresses?.length <= 1
                                      ? "disabled"
                                      : "default"
                                    : (authUser as AuthUserType)?.addresses?.length === 0
                                      ? "disabled"
                                      : "default"
                                }
                                label={getLabel("default_shipping_address")}
                                onChange={(isSelected) => onChange(isSelected)}
                              />
                            )}
                          />
                        </Box>
                      )}
                      {/* isDefaultBusinessBilling */}
                      {/* Default Address Checkboxes */}
                    </Box>
                  </form>
                </Box>
              </Box>
            </Box>

            <Box className="flex h-[88px] w-full flex-row items-center justify-center rounded-b-[8px] bg-color-background-l2 px-[24px] pb-[24px] pt-[20px] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.25)]">
              <OGButton
                type="primary"
                disabled={!isFormValid || isSavingAddress || isValidatingVat}
                onClick={handleSubmit(onSubmit)}
                leftcomp={<SavedAddressIcon height={20} width={20} color="#fff" />}
                size="large"
                className="w-full gap-3"
              >
                {getLabel("save")}
              </OGButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
