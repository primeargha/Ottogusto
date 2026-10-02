// @ts-nocheck
"use client";

import BackIcon from "@/components/icons/BackIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { CheckIcon, CircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useEffect, useState } from "react";
import DeleteUserIcon from "@/components/icons/DeleteUserIcon";
import DeleteBinIcon from "@/components/icons/DeleteBinIcon";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useDeleteAccountMutation,
  useGetProfileInformationQuery,
  useUpdateHasLoggedInInformationMutation,
  useUpdateProfileInformationMutation,
} from "@/hooks/profile";
import { Address, ProfileUpdatePayload } from "@/types/profile";
import { useToast, Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { useModalStore } from "@/stores/useModalStore";
import Modal from "@/components/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import { vatLookup } from "@/services/profile";
import { getLocale } from "../landing/footer/language-selector";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGPhoneInput } from "@/components/og-components/OGPhoneInput";
import { OGButton } from "@/components/og-components/OGButton";
import { useCartStore } from "@/stores/useCartStore";
import { useBranding } from "@/contexts/BrandingContext";
import Productnavigation from "../productdetails/productnavigation";

export default function ProfileInformation() {
  const router = useRouter();
  const { getLabel } = useBranding();
  const { locale, setLocale } = useLandingPageDataStore();
  const [tempPhone, setTempPhone] = useState("");
  const { authUser, setAuthUser, logoutUser } = useAuthStore();
  const [toastId, setToastId] = useState(0);
  const [vatValidationError, setVatValidationError] = useState<string | null>(null);
  const [isValidatingVat, setIsValidatingVat] = useState(false);
  const toast = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen, openModal, closeModal } = useModalStore();
  const { logout, getAccessTokenSilently } = useAuth0();
  const currentLocale = getLocale(locale);
  const { resetEB, resetSearch, resetOgSearch } = useSearchModalStore();
  const { resetCart } = useCartStore();
  // Add this function to handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccountMutation({
    onSuccess: async () => {
      const returnUrl = process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || window.location.origin;

      logout({
        logoutParams: {
          returnTo: returnUrl,
        },
      });
      // const token = await getAccessTokenSilently(); // Get the access token
      // await revokeToken(token);
      closeModal();
      logoutUser();
      resetCart();
      // resetEB();
      // resetSearch();
      // resetOgSearch();
      // Clear cache and perform hard refresh with redirect
      // const redirectUrl =
      //   process.env.NODE_ENV === "development"
      //     ? process.env.NEXT_PUBLIC_FRONTEND_DEV_URL
      //     : process.env.NEXT_PUBLIC_FRONTEND_PROD_URL;

      // Clear browser cache and storage
      window.localStorage.clear();
      window.sessionStorage.clear();

      // For a more aggressive cache clearing approach
      if (window.caches) {
        // Clear all caches (if supported by browser)
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }

      // Redirect with cache-busting parameter
      // window.location.href = `${redirectUrl}?refresh=${new Date().getTime()}`;

      // Alternative: force reload and then redirect
      // window.location.reload(true);
      // setTimeout(() => { window.location.href = redirectUrl; }, 100);
    },
  });
  const { isPending: isProfileLoading } = useGetProfileInformationQuery();

  // Form validation schema
  const profileSchema = z.object({
    gender: z.string().optional(),
    firstName: z
      .string()

      .optional(),
    lastName: z
      .string()

      .optional(),
    // email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .refine((value) => !value || isPossiblePhoneNumber(value), {
        message: "Please enter a valid phone number",
      })
      .optional(),
    marketingConsent: z.boolean().optional(),
    vatNumber: z.string().optional(),
    companyName: z.string().optional(),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  // Add this new function to handle VAT field blur
  const handleVatBlur = async (value: string, onChange: any, onBlur: any) => {
    onBlur(); // Call the original onBlur to mark field as touched

    if (value && value.length >= 2) {
      // Extract country code and VAT number
      const countryCode = value.substring(0, 2);
      const vatNumber = value.substring(2);
      setIsValidatingVat(true);
      setVatValidationError(null);

      // Validate the VAT number
      try {
        const validationResult = await vatLookup(value);
        if (validationResult.data && validationResult.data.name) {
          setValue("companyName", validationResult.data.name, {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Once successful try to submit the form
          handleSubmit(onSubmit)();
        } else if (validationResult.data && !validationResult.data.valid) {
          // Handle case where VAT number is invalid but no error was thrown
          setVatValidationError("Invalid VAT number");
          // Clear company name on validation error
          setValue("companyName", "", {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      } catch (error) {
        console.error("Error validating VAT number:", error?.response?.data?.detail);
        // Set the validation error message from the API response if available
        if (error?.response?.data?.detail) {
          setVatValidationError(error.response.data.detail);
        } else if (error?.message) {
          setVatValidationError(error.message);
        } else {
          setVatValidationError("VAT validation failed. Please check the number and try again.");
        }

        // Clear company name on validation error
        setValue("companyName", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      } finally {
        setIsValidatingVat(false);
      }
    }
  };

  const showSuccessToast = () => {
    const newId = Math.random();
    setToastId(newId);

    // Check if window exists and set placement based on window width
    const placement =
      typeof window !== "undefined" && window.innerWidth > 992 ? "top right" : "top";

    toast.show({
      id: newId,
      placement: placement,
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            nativeID={uniqueToastId}
            className="h-[44px] w-[308px] rounded-[4px] bg-[--light-blue] 2xl:top-20"
          >
            <ToastDescription className="font-Overpass text-[16px] font-normal leading-[18px] text-[--Text-White]">
              {getLabel("profile_changes_saved")}
            </ToastDescription>
          </Toast>
        );
      },
    });
  };

  const {
    mutate: updateProfileInformation,
    isPending: isUpdatingProfile,
    error,
  } = useUpdateProfileInformationMutation({
    onSuccess: (data, variables) => {
      if (variables) {
        const current = useAuthStore.getState().authUser;
        setAuthUser({ ...current, ...variables } as any);
      }
      if (!toast.isActive(toastId)) showSuccessToast();
    },
    onError: (error) => {
      console.error("Error updating profile information:", error);
    },
  });
  const {
    mutate: updateHasLoggedInInformation,
    isPending: isUpdatingHasLoggedInInformation,
    // error,
  } = useUpdateHasLoggedInInformationMutation({
    onSuccess: () => {
      // authUser already updated in updateHasLoggedIn effect
    },
    onError: (error) => {
      console.error("Error updating profile information:", error);
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "",
      firstName: "",
      lastName: "",
      email: authUser ? authUser.email || "" : "",
      phoneNumber: "",
      marketingConsent: false,
    },
    mode: "onBlur", // Changed to onBlur mode
  });

  useEffect(() => {
    if (authUser) {
      reset({
        gender: authUser?.initials || "",
        firstName: authUser?.firstName || "",
        lastName: authUser?.lastName || "",
        email: authUser ? authUser.email || "" : "",
        phoneNumber: authUser?.phoneNumber || "",
        marketingConsent: authUser?.marketingConsent || false,
        // ...(authUser && authUser?.businessAccount
        //   ? {
        //       vatNumber: authUser?.vatNumber || "",
        //       companyName: authUser?.companyName || "",
        //     }
        //   : {}),
      });
    }
  }, [authUser, reset]);

  useEffect(() => {
    const updateHasLoggedIn = async () => {
      // Only proceed if authUser is available and hasLoggedIn is false
      if (authUser && !authUser.hasLoggedIn) {
        await updateHasLoggedInInformation({
          ...authUser,
          hasLoggedIn: true,
        });
        setAuthUser({ ...authUser, hasLoggedIn: true });
      }
    };
    updateHasLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.hasLoggedIn]);

  const onSubmit = async (data: ProfileFormData) => {
    // Only submit if the field was actually changed
    if (Object.keys(dirtyFields).length > 0) {
      // For new users with non-business accounts, and already saved address earlier(old normal user)
      if (
        authUser &&
        !authUser.businessAccount &&
        authUser?.firstName &&
        authUser?.lastName &&
        authUser?.phoneNumber
      ) {
        // of NON business OLD user, no address change required
        const payload: ProfileUpdatePayload = {
          id: authUser?.id,
          marketingConsent: data.marketingConsent,
          firstName: data.firstName,
          lastName: data.lastName,
          email: authUser?.email,
          phoneNumber: data.phoneNumber,
          initials: data.gender,
          lang: authUser?.lang,
          picture: authUser?.picture,
          hasLoggedIn: authUser?.hasLoggedIn,
          middleName: authUser?.middleName,
          // businessAccount: authUser ? authUser?.businessAccount : false,
          addresses: [...(authUser?.addresses ?? [])], // copy the whole address array
        };

        updateProfileInformation(payload);
      } else if (
        authUser &&
        // !authUser?.businessAccount &&
        (!authUser?.firstName || !authUser?.lastName || !authUser?.phoneNumber)
      ) {
        // Save minimalAddress instead
        const payload: ProfileUpdatePayload = {
          id: authUser?.id,
          marketingConsent: data.marketingConsent,
          firstName: data.firstName,
          lastName: data.lastName,
          email: authUser?.email,
          phoneNumber: data.phoneNumber,
          initials: data.gender,
          lang: authUser?.lang,
          picture: authUser?.picture,
          hasLoggedIn: authUser?.hasLoggedIn,
          middleName: authUser?.middleName,
          businessAccount: false,
          addresses: [], // new user
        };

        updateProfileInformation(payload);
      }
      // else if (authUser && authUser?.businessAccount && !authUser?.vatNumber)
      else if (authUser && !authUser?.vatNumber) {
        // If new business user
        const minimalAddress: Address = {
          phoneNumber: data.phoneNumber,
          name: data.companyName,
          city: "",
          country: "",
          // type: "Billing",
          // isDefault: true,
          postalCode: "",
          state: "",
          street: "",
          isDefaultBilling: true, //? BY DEFAULT SET TO TRUE
          isDefaultShipping: true, //? BY DEFAULT SET TO TRUE
          // isBilling: true, // NOT NEEDED
          // isShipping: true,
        };

        const payload: ProfileUpdatePayload = {
          id: authUser?.id,
          marketingConsent: data.marketingConsent,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          email: authUser?.email,
          initials: data.gender,
          lang: authUser?.lang,
          picture: authUser?.picture,
          hasLoggedIn: authUser?.hasLoggedIn,
          middleName: authUser?.middleName,
          businessAccount: true,
          vatNumber: data.vatNumber,
          companyName: data.companyName,
          addresses: [minimalAddress],
        };

        updateProfileInformation(payload);
      }
      //  else if (authUser && authUser?.businessAccount && authUser?.vatNumber)
      else if (authUser && authUser?.vatNumber) {
        // If business user with VAT number OLD user
        const payload: ProfileUpdatePayload = {
          id: authUser?.id,
          marketingConsent: data.marketingConsent,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          email: authUser?.email,
          initials: data.gender,
          lang: authUser?.lang,
          picture: authUser?.picture,
          hasLoggedIn: authUser?.hasLoggedIn,
          middleName: authUser?.middleName,
          vatNumber: data.vatNumber,
          companyName: data.companyName,
          addresses: [...(authUser?.addresses ?? [])],
        };

        updateProfileInformation(payload);
      }
    }
  };

  // if (isProfileLoading) return null;

  return (
    <Box
      className={`relative h-auto w-full pb-[40px] base:mt-5 base:pl-3 base:pr-3 gtsm:pr-3 md:pl-0 gtlg:mt-[94px] between-640-767:mt-[78px] between-768-1023:mt-[94px] between-728-767:mt-[78px]`}
    >
      {/* Back button - only visible on mobile */}
      <Box className="flex w-full items-start justify-center">
        <Box
          onPress={() => router.back()}
          className="mb-4 flex flex-row items-center bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtsm:hidden"
        >
          <Productnavigation />
          <Text className="ml-1 mt-[2px] text-color-text-body body-medium-md">
            {getLabel("back")}
          </Text>
        </Box>
      </Box>

      <Card className="max-w-[600px] items-center overflow-hidden border border-color-border-default bg-color-background-default p-0 base:h-auto md:h-full lg:max-w-full">
        {/* Container box with border and padding */}
        <Box className="w-full px-5 pt-6">
          <Box className="flex w-full flex-row items-center justify-between">
            <Box className="flex w-full flex-col">
              <Box>
                <Text className="break-words text-color-text-body body-bold-lg">
                  {getLabel("profile_info_title")}
                </Text>
                <Text className="break-words pb-[12px] text-color-text-body body-regular-sm">
                  {getLabel("profile_info_subtitle")}
                </Text>
              </Box>
            </Box>
            {isUpdatingProfile && (
              <Text className="ml-4 mt-2 text-color-text-body body-regular-xs">
                {getLabel("saving")}...
              </Text>
            )}
          </Box>
        </Box>

        {/* Scrollable form content */}
        <Box className="relative w-full border-t">
          <Box
            className="custom-scrollbar h-full w-full overflow-y-auto px-[20px] py-[26px]"
            onScroll={handleScroll}
          >
            <Box className="grid min-h-fit grid-cols-1 gap-4">
              {/* Title field */}
              <Box className="w-full">
                <Box className="mb-2">
                  <Text className="text-color-text-body body-medium-sm">
                    {getLabel("profile_title")}
                  </Text>
                </Box>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGRadioGroup
                      value={value}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      onBlur={() => {
                        onBlur();
                        handleSubmit(onSubmit)();
                      }}
                      isInvalid={!!errors.gender}
                      error={errors.gender?.message}
                      isReadOnly={isUpdatingProfile}
                    >
                      <OGRadioInput
                        value="Mr."
                        label={getLabel("profile_title_mr")}
                        isInvalid={!!errors.gender}
                        state={isUpdatingProfile ? "disabled" : "default"}
                      />
                      <OGRadioInput
                        value="Mrs."
                        label={getLabel("profile_title_mrs")}
                        isInvalid={!!errors.gender}
                        state={isUpdatingProfile ? "disabled" : "default"}
                      />
                      <OGRadioInput
                        value="Ms."
                        label={getLabel("profile_title_ms")}
                        isInvalid={!!errors.gender}
                        state={isUpdatingProfile ? "disabled" : "default"}
                      />
                      <OGRadioInput
                        value="Mx."
                        label={getLabel("profile_title_mx")}
                        isInvalid={!!errors.gender}
                        state={isUpdatingProfile ? "disabled" : "default"}
                      />
                    </OGRadioGroup>
                  )}
                />
              </Box>

              {/* First name and last name fields */}
              <Box className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGTextInput
                      title={getLabel("First_Name")}
                      value={value}
                      onChange={onChange}
                      onBlur={() => {
                        onBlur();
                        handleSubmit(onSubmit)();
                      }}
                      placeholder={getLabel("enter_first_name")}
                      state={
                        errors.firstName
                          ? "error"
                          : isUpdatingProfile
                            ? "disabled"
                            : value
                              ? "filled"
                              : "default"
                      }
                      error={errors.firstName?.message}
                      maxLength={50}
                      isReadOnly={isUpdatingProfile}
                    />
                  )}
                />

                {/* last name field */}
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGTextInput
                      title={getLabel("Last_Name")}
                      value={value}
                      onChange={onChange}
                      onBlur={() => {
                        onBlur();
                        handleSubmit(onSubmit)();
                      }}
                      placeholder={getLabel("enter_last_name")}
                      state={
                        errors.lastName
                          ? "error"
                          : isUpdatingProfile
                            ? "disabled"
                            : value
                              ? "filled"
                              : "default"
                      }
                      error={errors.lastName?.message}
                      maxLength={50}
                      isReadOnly={isUpdatingProfile}
                    />
                  )}
                />
              </Box>

              <Box className="flex w-full flex-col gap-[6px]">
                {/* Email field */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGTextInput
                      title={getLabel("email")}
                      value={value}
                      onChange={onChange}
                      onBlur={() => {
                        onBlur();
                        handleSubmit(onSubmit)();
                      }}
                      placeholder={getLabel("enter_email")}
                      state={"disabled"} // Email is always disabled
                      isReadOnly={true}
                    />
                  )}
                />

                {/* Checkbox - still needs immediate handling since it has no blur event */}
                <Controller
                  control={control}
                  name="marketingConsent"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGCheckboxInput
                      selected={value === true ? "yes" : "no"}
                      state={isUpdatingProfile ? "disabled" : "default"}
                      label={getLabel("email_me_with_news_and_offers")}
                      onChange={(isSelected) => {
                        onChange(isSelected);
                        handleSubmit(onSubmit)();
                      }}
                      onBlur={() => {
                        onBlur();
                        handleSubmit(onSubmit)();
                      }}
                      isInvalid={!!errors.marketingConsent}
                      error={errors.marketingConsent?.message}
                    />
                  )}
                />
              </Box>

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
                      // setTempPhone(newValue || "");
                    }}
                    onBlur={() => {
                      //onChange(tempPhone || "");
                      onBlur();
                      handleSubmit(onSubmit)();
                    }}
                    placeholder={getLabel("enter_phone_number")}
                    state={
                      errors.phoneNumber
                        ? "error"
                        : isUpdatingProfile
                          ? "disabled"
                          : value
                            ? "filled"
                            : "default"
                    }
                    error={errors.phoneNumber?.message}
                    defaultCountry={currentLocale?.country_code}
                    isReadOnly={isUpdatingProfile}
                  />
                )}
              />

              {/* Delete account button */}
              <OGButton
                type="outlined"
                isDanger
                onClick={() => {
                  openModal();
                }}
                leftcomp={<DeleteBinIcon height={20} width={20} color="#E84855" />}
                size="medium"
                className="gap-3"
              >
                {getLabel("Profile_delete_account")}
              </OGButton>

              {/* Delete Account Confirmation Modal */}
              <Modal
                width="max-w-md"
                containerClassName="z-[1000]"
                modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] h-auto"
                backdropClass="bg-black bg-opacity-50"
                showCloseButton={false}
                contentClassName="px-[82px] py-6"
                footerClassName="bg-color-background-l2 pb-4 gtsm:pb-0"
                footerComponent={
                  <Box className="flex w-full flex-row justify-center gap-6 px-[26px] py-6">
                    {/* Cancel Button */}
                    <OGButton
                      size="medium"
                      type="outlined"
                      onClick={() => {
                        // Handle account deletion logic here
                        closeModal();
                      }}
                      isLoading={isDeletingAccount}
                      className=""
                    >
                      {getLabel("cancel")}
                    </OGButton>

                    {/* Delete Button */}
                    <OGButton
                      size="medium"
                      type="error"
                      onClick={() => {
                        // Handle account deletion logic here
                        deleteAccount();
                      }}
                      isLoading={isDeletingAccount}
                      className=""
                    >
                      {getLabel("delete")}
                    </OGButton>
                  </Box>
                }
              >
                <Box className="flex flex-col items-center justify-center gap-4">
                  <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
                    <Image
                      src={`/assets/profile/alert-diamond.svg`}
                      height={62}
                      width={62}
                      alt="delete"
                    />
                  </Box>

                  <Text className="text-center font-Overpass text-[18px] font-bold leading-[22px] text-color-text-body">
                    {getLabel("delete_account_confirmation")}
                  </Text>

                  <Text className="text-center font-Overpass text-[14px] font-normal leading-[18px] text-color-text-body">
                    {getLabel("delete_account_warning")}
                  </Text>
                </Box>
              </Modal>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
