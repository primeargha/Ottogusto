"use client";

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

type CarInfoModalInputProps = {
  className?: string;
  source?: string;
  onSuccess?: () => void;
  variant?: "default" | "drawer";
};

export default function CarInfoModalInput({
  className = "",
  source = "Car Selection Sidebar",
  onSuccess,
  variant = "default",
}: CarInfoModalInputProps) {
  const { getLabel } = useBranding();
  const { authUser } = useAuthStore();
  const toast = useToast();
  const lookingforSchema = z.object({
    lookingfor: z.string().min(1, getLabel("what_are_you_looking_for_required_error")),
    email: z.string().email(getLabel("cart_email_invalid")),
    chassis_number: z
      .string()
      .length(17, getLabel("vin_length_error"))
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/)
      .optional()
      .or(z.literal("")),
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
      chassis_number: "",
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
        chassis_number: "",
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
    const finalMessage = `
     Category: PartQuery
     ${data.chassis_number ? `VIN: ${data.chassis_number}` : ""}
     ${data.lookingfor}
    Source: ${source}`;

    const payLoad: PostSupportPayload = {
      firstName: "",
      lastName: "",
      message: finalMessage.replace(/\n/g, "<br />"),
      email: data.email,
      category: "PartQuery",
      files: null,
      invoiceNumber: null,
      orderId: null,
      vin: data.chassis_number?.trim() || null,
    };

    submitSupportMail(payLoad);
  };

  const isDrawer = variant === "drawer";

  const emailField = (
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
  );

  const chassisField = (
    <Controller
      name="chassis_number"
      control={control}
      render={({ field }) => (
        <OGTextInput
          {...field}
          onChange={(value) => field.onChange(value.toUpperCase().slice(0, 17))}
          title={`${getLabel("chassis_number")}`}
          placeholder={getLabel("enter_car_vin_number")}
          state={errors.chassis_number ? "error" : "default"}
          error={errors.chassis_number?.message || undefined}
          className="w-full bg-white"
          maxLength={17}
        />
      )}
    />
  );

  const carInfoField = (
    <Controller
      control={control}
      name="lookingfor"
      render={({ field: { onChange, value } }) => (
        <OGTextArea
          title={`${getLabel("car_info")}`}
          value={value}
          onChange={onChange}
          placeholder={getLabel("car_info_placeholder")}
          state={errors.lookingfor ? "error" : value ? "filled" : "default"}
          className="w-full"
          error={errors.lookingfor?.message}
          mandatory={true}
          customClassName="h-[78px]"
        />
      )}
    />
  );

  const emailConfirmField = (
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
  );

  const responseTimeText = (
    <Typography className="text-color-text-muted typography-caption">
      {getLabel("response_time_text")}
    </Typography>
  );

  const submitButton = (
    <OGButton
      type="primary"
      disabled={isSubmittingSupportPending}
      onClick={handleSubmit(onSubmit)}
      size="medium"
      className={isDrawer ? "w-full" : "w-auto"}
    >
      {getLabel("submit_button")}
    </OGButton>
  );

  if (isDrawer) {
    return (
      <Box className={`flex min-h-0 w-full flex-1 flex-col ${className}`}>
        <Box className="min-h-0 w-full flex-1 overflow-y-auto px-space-xs py-4">
          <form className="flex w-full flex-col gap-3">
            <Box className="w-full">{emailField}</Box>
            <Box className="w-full">{emailConfirmField}</Box>
            <Box className="w-full">{chassisField}</Box>
            <Box className="w-full">{carInfoField}</Box>
            {responseTimeText}
          </form>
        </Box>

        <Box className="w-full shrink-0 border-t border-color-border-default px-space-xs pb-space-xs pt-space-sm">
          {submitButton}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`flex h-auto w-full flex-col items-stretch justify-center ${className}`}>
      {/* <OGAlert
        title=""
        description={getLabel("no_results_request_form_title")}
        variant="info"
        className="w-full gap-form-row"
      /> */}
      <form className="w-full px-6 py-space-xl">
        <Box className="flex w-full flex-col gap-3">
          <Box className="flex w-full gap-6 gap-form-row base:flex-col gtsm:flex-row">
            <Box className="w-full flex-1">{emailField}</Box>
            <Box className="w-full flex-1">{chassisField}</Box>
          </Box>
        </Box>

        <Box className="w-full gap-form-row">
          <Box className="gap-form-row">{carInfoField}</Box>
          <Box className="w-full gap-form-row">{emailConfirmField}</Box>
        </Box>

        {responseTimeText}
      </form>

      <Box className="flex w-full flex-row justify-between border-t border-color-border-default p-6">
        <Box />
        {submitButton}
      </Box>
    </Box>
  );
}
