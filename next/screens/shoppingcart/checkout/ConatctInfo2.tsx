"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Box } from "@/components/ui/box";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { OGButton } from "@/components/og-components/OGButton";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";

import { useCartStore } from "@/stores/useCartStore";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRedirectData } from "@/utils/useRedirectData";

export interface ContactInfo2Ref {
  triggerValidation: () => Promise<boolean>;
  scrollToFirstError: () => void;
}

const ContactInfo2 = forwardRef<ContactInfo2Ref>((_, ref) => {
  const { setcontactinfo, contactinfo, setIsAccordionOpen } = useCartStore();
  const { getLabel } = useBranding();

  // Define contact schema with dynamic translation
  const contactSchema = z.object({
    firstName: z.string().min(1, getLabel("error_first_name_required")),
    lastName: z.string().min(1, getLabel("error_last_name_required")),
    email: z.string().email(getLabel("cart_email_invalid")),
    emailconfirm: z.boolean(),
  });

  type ContactFormData = z.infer<typeof contactSchema>;
  const { isAuthenticated, authUser } = useAuthStore();
  const { getRedirectData, clearRedirectData } = useRedirectData();
  const hasPrefilled = useRef(false);
  const lastAuthStatus = useRef(isAuthenticated);
  const formElementRef = useRef<HTMLFormElement | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contactinfo?.firstName || "",
      lastName: contactinfo?.lastName || "",
      email: contactinfo?.email || "",
      emailconfirm: contactinfo?.emailconfirm || false,
    },
    mode: "onChange",
  });

  // Prefill contact info based on authentication status
  useEffect(() => {
    // Reset prefill flag when auth status changes
    if (lastAuthStatus.current !== isAuthenticated) {
      hasPrefilled.current = false;
      lastAuthStatus.current = isAuthenticated;
    }

    if (isAuthenticated && authUser && "email" in authUser) {
      // For authenticated users: prefill from auth store
      const user = authUser as { email?: string; firstName?: string; lastName?: string };
      // Only prefill if authUser has data and we haven't prefilled yet
      if (user.email && !hasPrefilled.current) {
        reset({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          emailconfirm: false,
        });
        hasPrefilled.current = true;
      }
    } else if (!isAuthenticated && !hasPrefilled.current) {
      // For guest users: prefill from session data (latest email from shopping cart)
      const redirectData = getRedirectData<{ email?: string }>();
      if (redirectData?.email) {
        reset({
          firstName: contactinfo?.firstName || "",
          lastName: contactinfo?.lastName || "",
          email: redirectData.email,
          emailconfirm: contactinfo?.emailconfirm || false,
        });
        // Clear redirect data after using it
        clearRedirectData();
        hasPrefilled.current = true;
      }
    }
  }, [isAuthenticated, authUser, reset, getRedirectData, clearRedirectData, contactinfo]);

  // Watch form fields
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const emailconfirm = watch("emailconfirm");

  // Sync form data to store in real-time
  React.useEffect(() => {
    setcontactinfo({
      firstName,
      lastName,
      email,
      emailconfirm,
    });
  }, [firstName, lastName, email, emailconfirm, setcontactinfo]);

  const onSubmit = (data: ContactFormData) => {
    setcontactinfo(data);
    setIsAccordionOpen(true); // move to Delivery Address section
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
    triggerValidation: async () => await trigger(),
    scrollToFirstError,
  }));

  return (
    <Box className="flex w-full flex-col gap-6">
      {/* Header */}
      <Box className="text-color-text-emphasis typography-subtitle-01">
        {getLabel("contact_information")}
      </Box>

      {/* Form */}
      <form ref={formElementRef} onSubmit={handleSubmit(onSubmit)}>
        <Box className="grid w-full grid-cols-1 gap-6">
          <Box className="flex flex-row gap-6">
            <Box className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <OGTextInput
                    title={`${getLabel("first_name")}`}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={getLabel("enter_first_name")}
                    state={errors.firstName ? "error" : field.value ? "filled" : "default"}
                    error={errors.firstName?.message}
                    mandatory={true}
                  />
                )}
              />
            </Box>

            <Box className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <OGTextInput
                    title={`${getLabel("last_name")}`}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={getLabel("enter_last_name")}
                    state={errors.lastName ? "error" : field.value ? "filled" : "default"}
                    error={errors.lastName?.message}
                    mandatory={true}
                  />
                )}
              />
            </Box>
          </Box>

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <OGTextInput
                title={`${getLabel("email")}`}
                value={field.value}
                onChange={field.onChange}
                placeholder={getLabel("enter_email_address")}
                state={errors.email ? "error" : field.value ? "filled" : "default"}
                error={errors.email?.message}
                mandatory={true}
              />
            )}
          />

          <Controller
            control={control}
            name="emailconfirm"
            render={({ field }) => (
              <OGCheckboxInput
                selected={field.value ? "yes" : "no"}
                label={getLabel("email_me_with_news_and_offers")}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
      </form>
    </Box>
  );
});

export default ContactInfo2;
