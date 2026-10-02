"use client";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useMarketingConsentModal } from "@/hooks/consentModalHook";
import ModalCross from "@/screens/landing/ModalCross";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { useEffect, useRef, useState } from "react";
import GreenCrossIcon from "@/assets/GreenCrossIcon";
import { useMedia } from "@/hooks/useMedia";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth0 } from "@auth0/auth0-react";

const MarketingConsentModal = () => {
  const { getLabel } = useBranding();
  const toast = useToast();
  const isMobile = useMedia("(max-width: 639px)");
  const authUser = useAuthStore((s) => s.authUser);
  const { user: auth0User } = useAuth0();
  // Zustand's authUser is only populated after an explicit login-button click (see RedirectManager),
  // so a returning user with a valid Auth0 session but an empty Zustand store needs this fallback.
  const updatedEmailAuth =
    (authUser && typeof authUser === "object" && "email" in authUser && authUser.email) ||
    auth0User?.email ||
    undefined;
  const emailSchema = z.object({
    email: z.string().min(1, getLabel("email_required")).email(getLabel("cart_email_invalid")),
    emailConsent: z.boolean(),
  });

  type EmailAddressData = z.infer<typeof emailSchema>;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmailAddressData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      emailConsent: false,
    },
    mode: "onChange",
  });

  const hasPrefilledAuthEmail = useRef(false);
  useEffect(() => {
    if (updatedEmailAuth && !hasPrefilledAuthEmail.current) {
      reset({ email: updatedEmailAuth, emailConsent: false });
      hasPrefilledAuthEmail.current = true;
    }
  }, [updatedEmailAuth, reset]);

  const emailConsent = watch("emailConsent");
  const emailValue = watch("email");
  const isEmailValid = emailSchema.shape.email.safeParse(emailValue).success;
  const { showModal, handleDecision } = useMarketingConsentModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);
  if (!showModal) return null;

  const handleSubscribe = async (data: EmailAddressData) => {
    if (!data.emailConsent) return;
    try {
      const response = await fetch("/api/marketing/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupSource: "email_capture_widget",
          email: data.email.trim(),
        }),
      });

      if (!response.ok) return;

      const result = await response.json().catch(() => null);
      if (!result?.ok) return;

      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast
              nativeID={id}
              variant="solid"
              action="success"
              className="border-0 bg-color-icon-positive"
            >
              <ToastTitle>{getLabel("Marketing_subscribed_confirmation")}</ToastTitle>
            </Toast>
          );
        },
      });
      reset({ email: "", emailConsent: false });
      handleDecision("accepted");
    } catch {
      // Fail silently per OD-2146
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isMobile ? (
        <>
          <Box
            className="fixed inset-0 z-[2147483646] h-full w-full bg-black bg-opacity-50"
            onClick={() => handleDecision("declined")}
          />

          <div className="fixed bottom-0 left-0 right-0 z-[2147483647] rounded-t-3xl bg-color-background-default px-space-xs pb-5 pt-space-xs base:w-full base:max-w-full gtsm:w-[320px] gtsm:max-w-[320px]">
            <Box className="flex flex-col gap-space-md">
              <Box className="flex w-full items-center justify-center p-space-2xs">
                <Box className="h-1 w-16 rounded-lg bg-color-icon-default" />
              </Box>
              <Box className="flex w-full flex-col">
                <Box className="flex h-11 max-h-11 flex-row items-start justify-between">
                  <Box className="flex flex-row items-center justify-center gap-space-xs">
                    <Box className="p-[10px]" onClick={() => handleDecision("declined")}>
                      <GreenCrossIcon className="h-[14px] w-[14px] text-button-ghost-icon" />
                    </Box>

                    <Typography className="text-color-text-emphasis typography-heading-04">
                      {getLabel("subscription_title")}
                    </Typography>
                  </Box>
                </Box>
                <Box className="w-full border-b border-color-border-default" />
                <Box className="flex flex-col gap-5 px-2 py-4">
                  <Typography className="text-color-text-default typography-body-01">
                    {getLabel("subscription_body")}
                  </Typography>
                  <Box className="flex w-full flex-col gap-3">
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <OGTextInput
                          title={""}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder={getLabel("enter_email_address")}
                          state={errors.email ? "error" : "default"}
                          isReadOnly={false}
                          error={errors.email?.message}
                        />
                      )}
                    />

                    <label className="flex cursor-pointer items-center gap-2">
                      <Controller
                        control={control}
                        name="emailConsent"
                        render={({ field: { onChange, value, onBlur } }) => (
                          //@ts-ignore
                          <OGCheckboxInput
                            selected={value === true ? "yes" : "no"}
                            state={"default"}
                            label={getLabel("email_agree_terms")}
                            onChange={(isSelected) => {
                              onChange(isSelected);
                            }}
                            onBlur={() => {
                              onBlur();
                            }}
                            isInvalid={!!errors.emailConsent}
                            error={errors.emailConsent?.message}
                            labelClassName="typography-body-02 text-color-text-default"
                            indicatorClassName="rounded-[4px] border border-color-icon-default"
                          />
                        )}
                      />
                    </label>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className="flex w-full flex-col gap-space-md px-2">
              <Box className="w-full border-b border-color-border-default" />
              <OGButton
                onClick={handleSubmit(handleSubscribe)}
                disabled={isSubmitting || !emailConsent || !isEmailValid}
                className="h-[44px] w-full p-[10px]"
              >
                {getLabel("subscription_cta")}
              </OGButton>
            </Box>
          </div>
        </>
      ) : (
        <Box
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          onClick={() => handleDecision("declined")}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] overflow-hidden rounded-[8px] bg-color-background-default shadow-xl"
          >
            <Box className="flex flex-row items-center justify-between border-b border-color-border-default px-6 py-4">
              <Typography className="text-color-text-emphasis typography-heading-04">
                {getLabel("subscription_title")}
              </Typography>
              <button
                type="button"
                onClick={() => handleDecision("declined")}
                aria-label="Close modal"
              >
                <ModalCross className="text-color-icon-emphasis" />
              </button>
            </Box>
            <Box className="flex flex-col gap-5 px-6 py-8">
              <Typography className="text-color-text-default typography-body-01">
                {getLabel("subscription_body")}
              </Typography>
              <Box className="flex w-full flex-col gap-3">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGTextInput
                      title={""}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder={getLabel("enter_email_address")}
                      state={updatedEmailAuth ? "disabled" : "default"}
                      isReadOnly={false}
                      error={errors.email?.message}
                    />
                  )}
                />

                <label className="flex cursor-pointer items-center gap-2">
                  <Controller
                    control={control}
                    name="emailConsent"
                    render={({ field: { onChange, value, onBlur } }) => (
                      //@ts-ignore
                      <OGCheckboxInput
                        selected={value === true ? "yes" : "no"}
                        state={"default"}
                        label={getLabel("email_agree_terms")}
                        onChange={(isSelected) => {
                          onChange(isSelected);
                        }}
                        onBlur={() => {
                          onBlur();
                        }}
                        isInvalid={!!errors.emailConsent}
                        error={errors.emailConsent?.message}
                        indicatorClassName="rounded-[4px] border border-color-icon-default w-4 h-4"
                        labelClassName="typography-body-02 text-color-text-default mt-1"
                      />
                    )}
                  />
                </label>
              </Box>
            </Box>
            <Box className="flex w-full flex-row items-center justify-end border border-t-color-border-default p-6">
              <OGButton
                onClick={handleSubmit(handleSubscribe)}
                disabled={isSubmitting || !emailConsent || !isEmailValid}
                className="px-4 py-2"
              >
                {getLabel("subscription_cta")}
              </OGButton>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MarketingConsentModal;
