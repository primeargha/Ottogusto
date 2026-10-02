"use client";

import { Box } from "@/components/ui/box";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { useState } from "react";
import {
  isMarketingSubscribedInSession,
  markMarketingSubscribedInSession,
} from "@/utils/marketingSubscribeSession";

type OfferSubscribeEmailProps = {
  onSubscribeSuccess?: () => void;
};

const OfferSubscribeEmail = ({ onSubscribeSuccess }: OfferSubscribeEmailProps) => {
  const { getLabel } = useBranding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => isMarketingSubscribedInSession());

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

  const emailConsent = watch("emailConsent");
  const emailValue = watch("email");
  const isEmailValid = emailSchema.shape.email.safeParse(emailValue).success;

  const handleSubscribe = async (data: EmailAddressData) => {
    if (!data.emailConsent) return;

    setIsSubmitting(true);

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

      setIsSuccess(true);
      markMarketingSubscribedInSession();
      reset({ email: "", emailConsent: false });
      onSubscribeSuccess?.();
    } catch {
      // Fail silently per OD-2146
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Box className="flex w-full flex-col gap-3">
        <Typography className="text-color-text-default typography-body-strong-01">
          {getLabel("Marketing_subscribed_confirmation")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex w-full flex-col gap-3">
      <Box className="flex w-full flex-col gap-space-sm">
        <Typography className="text-color-text-default typography-body-strong-01">
          {getLabel("subscription_title")}
        </Typography>

        <Box className="flex w-full flex-row items-center justify-start gap-[6px]">
          <Box className="flex w-[310px] max-w-[310px]">
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
          </Box>

          <Box className="flex items-center justify-center">
            <OGButton
              type="primary"
              size="medium"
              onClick={handleSubmit(handleSubscribe)}
              className="w-full"
              disabled={isSubmitting || !emailConsent || !isEmailValid}
            >
              {getLabel("subscription_cta")}
            </OGButton>
          </Box>
        </Box>
      </Box>
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
            indicatorClassName="rounded-[4px] border border-color-icon-default"
          />
        )}
      />
    </Box>
  );
};

export default OfferSubscribeEmail;
