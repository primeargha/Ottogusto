"use client";

/**
 * E2E VIN 406 (brand not supported) support form — reuses OD-2093 No Product Found fields.
 * VIN stays in the sidebar field above (not duplicated here).
 * Source: VIN Side panel.
 */

import { OGAlert } from "@/components/og-components/OGAlert";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";
import { Controller, useForm } from "react-hook-form";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTextArea } from "@/components/og-components/OGTextArea";
import { AuthUserType, useAuthStore } from "@/stores/useAuthStore";
import { useSubmitSupportMutation } from "@/hooks/support";
import { trackProductNotFoundFormSuccess } from "@/utils/gtm";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { useEffect } from "react";
import type { PostSupportPayload } from "@/type";

const VIN_SIDE_PANEL_SOURCE = "VIN Side panel";

type NewVinBrandUnsupportedSupportFormProps = {
  /** Current sidebar VIN — included in Support payload (field not shown again). */
  vinNumber: string;
  onSuccess?: () => void;
  className?: string;
};

export default function NewVinBrandUnsupportedSupportForm({
  vinNumber,
  onSuccess,
  className = "",
}: NewVinBrandUnsupportedSupportFormProps) {
  const { getLabel } = useBranding();
  const { authUser } = useAuthStore();
  const toast = useToast();

  const lookingforSchema = z.object({
    lookingfor: z.string().min(1, getLabel("what_are_you_looking_for_required_error")),
    email: z.string().email(getLabel("cart_email_invalid")),
    emailconfirm: z.boolean().optional(),
  });
  type LookingForFormData = z.infer<typeof lookingforSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LookingForFormData>({
    resolver: zodResolver(lookingforSchema),
    defaultValues: {
      lookingfor: "",
      email: authUser ? (authUser as AuthUserType)?.email || "" : "",
      emailconfirm: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if ((authUser as AuthUserType)?.email) {
      setValue("email", (authUser as AuthUserType)?.email, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [authUser, setValue]);

  const {
    mutate: submitSupportMail,
    isPending: isSubmittingSupportPending,
    reset: resetMutation,
  } = useSubmitSupportMutation({
    onSuccess: () => {
      trackProductNotFoundFormSuccess();
      resetMutation();
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
              {/* @ts-ignore */}
              <ToastTitle>{getLabel("submit_success_message")}</ToastTitle>
            </Toast>
          );
        },
      });
      reset({
        lookingfor: "",
        email: authUser ? (authUser as AuthUserType)?.email || "" : "",
        emailconfirm: false,
      });
      onSuccess?.();
    },
    onError: () => {
      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast
              nativeID={id}
              variant="solid"
              action="error"
              className="bg-color-icon-negative border-0"
            >
              {/* @ts-ignore */}
              <ToastTitle>{getLabel("submit_error_message")}</ToastTitle>
            </Toast>
          );
        },
      });
    },
  });

  const onSubmit = (data: LookingForFormData) => {
    const vin = vinNumber.trim().toUpperCase();
    const finalMessage = `
     Category: PartQuery
     ${vin ? `VIN: ${vin}` : ""}
     ${data.lookingfor}
    Source: ${VIN_SIDE_PANEL_SOURCE}`;

    const payLoad: PostSupportPayload = {
      firstName: "",
      lastName: "",
      message: finalMessage.replace(/\n/g, "<br />"),
      email: data.email,
      category: "PartQuery",
      files: null,
      invoiceNumber: null,
      orderId: null,
      vin: vin || null,
    };

    submitSupportMail(payLoad);
  };

  const helpMessage =
    getLabel("vin_side_panel_we_can_still_help_message") !==
    "vin_side_panel_we_can_still_help_message"
      ? getLabel("vin_side_panel_we_can_still_help_message")
      : "We can still help you.";

  return (
    <Box className={`flex w-full flex-col gap-space-md ${className}`}>
      <OGAlert title="" description={helpMessage} variant="info" className="w-full gap-form-row" />

      <form className="flex w-full flex-col gap-3">
        <Controller
          control={control}
          name="lookingfor"
          render={({ field: { onChange, value } }) => (
            <OGTextArea
              title={`${getLabel("what_are_you_looking_for_label")}`}
              value={value}
              onChange={onChange}
              placeholder={getLabel("what_are_you_looking_for_placeholder")}
              state={errors.lookingfor ? "error" : value ? "filled" : "default"}
              className="w-full"
              error={errors.lookingfor?.message}
              mandatory={true}
              customClassName="h-[78px]"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <OGTextInput
              title={`${getLabel("email")}`}
              value={value}
              onChange={onChange}
              placeholder={getLabel("enter_email_address")}
              error={errors.email?.message}
              state={errors.email ? "error" : value ? "filled" : "default"}
              className="w-full"
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
              className="w-full"
              labelClassName="typography-body-02 text-color-text-default mt-1"
              indicatorClassName="w-4 h-4 border border-color-icon-default rounded-radius-small"
            />
          )}
        />

        <Typography className="text-color-text-muted typography-caption">
          {getLabel("response_time_text")}
        </Typography>

        <OGButton
          type="primary"
          disabled={isSubmittingSupportPending}
          onClick={handleSubmit(onSubmit)}
          size="medium"
          className="w-full"
        >
          {getLabel("submit_button")}
        </OGButton>
      </form>
    </Box>
  );
}
