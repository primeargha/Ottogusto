"use client";

/**
 * Pre–VIN-check PDP form (Support-only).
 * Shown when `checkout_vin_api_flow_feature_flag` is false.
 * Do not use for VinCheck API / Fit-Maybe-No flow.
 */
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { OGAlert } from "@/components/og-components/OGAlert";
import { useBranding } from "@/contexts/BrandingContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitSupportMutation } from "@/hooks/support";
import { useAuthStore, AuthUserType } from "@/stores/useAuthStore";
import Typography from "@/components/og-components/Typography";
import type { PostSupportPayload } from "@/type";
import {
  buildPdpManualVinSupportMessage,
  mapLocaleToSupportLanguageLabel,
  PDP_MANUAL_VIN_VERIFICATION_SUPPORT_SOURCE,
} from "@/utils/vinCheck";

interface ProductcompatibilityverifyinputLegacyProps {
  productname: string;
}

const ProductcompatibilityverifyinputLegacy = ({
  productname,
}: ProductcompatibilityverifyinputLegacyProps) => {
  const { getLabel } = useBranding();
  const params = useParams();
  const languageCountry = params?.["language-country"];
  const localeSegment = Array.isArray(languageCountry) ? languageCountry[0] : languageCountry;

  const schema = z.object({
    vin: z
      .string()
      .length(17, getLabel("vin_length_error"))
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, getLabel("vin_invalid_characters")),
    email: z
      .string()
      .min(1, getLabel("email_required"))
      .email(getLabel("email_invalid_errormessage")),
  });

  type FormData = z.infer<typeof schema>;

  const { authUser } = useAuthStore();
  const userdata = authUser as AuthUserType;
  const userEmail = userdata?.email || "";
  const generateVerifyVinMessage = () => {
    const baseMessage = getLabel("compatibility_verify_vin_prefill_message");
    return baseMessage.replace("{productTitle}", productname);
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vin: "",
      email: userEmail,
    },
  });
  const {
    mutate: submitSupport,
    isPending: isSubmittingSupport,
    isSuccess,
    isError,
    reset: resetMutation,
  } = useSubmitSupportMutation({
    onSuccess: () => {
      reset();
    },
  });
  useEffect(() => {
    if (userEmail) {
      setValue("email", userEmail);
    }
  }, [userEmail, setValue]);

  const onSubmit = (data: FormData) => {
    const contact = {
      firstName: userdata?.firstName || "",
      lastName: userdata?.lastName || "",
      email: data.email,
    };
    const message = buildPdpManualVinSupportMessage({
      contact,
      vin: data.vin,
      productTitle: productname,
      language: mapLocaleToSupportLanguageLabel(localeSegment),
      isAuthenticated: !!userdata,
      productMessage: generateVerifyVinMessage(),
    });

    const payload: PostSupportPayload = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: data.email,
      category: "PartQuery",
      vin: data.vin,
      invoiceNumber: null,
      orderId: null,
      message,
      files: null,
      source: PDP_MANUAL_VIN_VERIFICATION_SUPPORT_SOURCE,
    };
    submitSupport(payload);
  };

  return (
    <Box className="w-full bg-color-background-default">
      <Box className="flex flex-col gap-space-xs">
        <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
          {getLabel("vin_verification_title")}
        </Typography>
        <Typography className="text-color-text-muted body-regular-sm typography-body-02">
          {getLabel("vin_verification_subtitle")}
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Box className="items-start gap-3 gtsm:flex gtsm:flex-col gtlg:grid gtlg:max-w-[640px] gtlg:grid-cols-3">
          <Box className="flex w-full flex-col gap-[6px]">
            <Controller
              name="vin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <OGTextInput
                  value={value}
                  onChange={(val) => {
                    onChange(val.toUpperCase());
                    if (isSuccess || isError) {
                      resetMutation();
                    }
                  }}
                  placeholder={getLabel("enter_car_vin_number")}
                  state={errors.vin ? "error" : value ? "filled" : "default"}
                  error={errors.vin?.message}
                  maxLength={17}
                  className="w-full"
                />
              )}
            />
            <Typography className="text-color-text-muted typography-caption">
              {getLabel("VIN_information_message")}
            </Typography>
          </Box>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <OGTextInput
                value={value}
                onChange={(val) => {
                  if (userEmail) return;
                  onChange(val);
                  if (isSuccess || isError) {
                    resetMutation();
                  }
                }}
                placeholder={getLabel("enter_email_address")}
                state={
                  userEmail ? "disabled" : errors.email ? "error" : value ? "filled" : "default"
                }
                error={errors.email?.message}
                isReadOnly={!!userEmail}
              />
            )}
          />

          <OGButton
            type="primary"
            size="medium"
            className="button-primary-bg-default base:w-full gtsm:w-full gtlg:w-full"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmittingSupport}
            isLoading={isSubmittingSupport}
          >
            {getLabel("vin_verification_button")}
          </OGButton>
        </Box>
      </form>

      {isSuccess && (
        <Box className="w-full base:py-3 gtsm:py-3 gtlg:py-6">
          <OGAlert
            variant="info"
            title=""
            description={getLabel("vin_verification_success_title")}
          />
        </Box>
      )}
      {isError && (
        <Box className="w-full base:py-3 gtsm:py-3 gtlg:py-6">
          <OGAlert
            variant="error"
            title=""
            description={getLabel("vin_verification_error_title")}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductcompatibilityverifyinputLegacy;
