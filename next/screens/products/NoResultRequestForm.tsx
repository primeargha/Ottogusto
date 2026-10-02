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

export default function NoResultRequestForm() {
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
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
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
    },

    onError: (error) => {
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

  const onSubmit = (data: any) => {
    const finalMessage = `
     Category: PartQuery
     ${data.chassis_number ? `VIN: ${data.chassis_number}` : ""}
     ${data.lookingfor}
    Source: No Products Found Page`;

    const payLoad: any = {
      firstName: "",
      lastName: "",
      message: finalMessage.replace(/\n/g, "<br />"),
      email: data.email,
      category: "PartQuery",
    };

    submitSupportMail(payLoad);
  };

  return (
    <Box className="flex h-auto flex-col items-start justify-center rounded-radius-small border border-color-border-emphasis card-padding-default base:w-fit gtsm:w-[560px] gtsm:max-w-[560px] gtlg:w-[560px] gtlg:max-w-[560px]">
      <OGAlert
        title=""
        description={getLabel("no_results_request_form_title")}
        variant="info"
        className="w-full gap-form-row"
      />
      <form className="w-full">
        <Box className="w-full gap-form-row">
          <Controller
            control={control}
            name="lookingfor"
            render={({ field: { onChange, value, onBlur } }) => (
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
        </Box>
        <Box className="flex w-full flex-col gap-3">
          <Box className="flex w-full gap-6 base:flex-col gtsm:flex-row">
            <Box className="w-full flex-1">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <OGTextInput
                    title={`${getLabel("email")}`}
                    value={value}
                    onChange={onChange}
                    placeholder={getLabel("enter_email_address")}
                    error={errors.email?.message}
                    state={errors.email ? "error" : value ? "filled" : "default"}
                    className="w-full"
                    //   error={errors.email?.message}
                    mandatory={true}
                  />
                )}
              />
            </Box>
            <Box className="w-full flex-1">
              <Controller
                name="chassis_number"
                control={control}
                render={({ field }) => (
                  <OGTextInput
                    {...field}
                    title={`${getLabel("vin")}`}
                    placeholder={getLabel("enter_car_vin_number")}
                    state={errors.chassis_number ? "error" : "default"}
                    error={errors.chassis_number?.message || undefined}
                    className="bg-white"
                  />
                )}
              />
              {/* <Typography className="text-color-text-muted typography-caption mt-2">
                {getLabel("VIN_information_message")}
              </Typography> */}
            </Box>
          </Box>
          <Box className="w-full gap-form-row">
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
                  indicatorClassName="w-4 h-4  border border-color-icon-default rounded-radius-small"
                />
              )}
            />
          </Box>
        </Box>

        <Typography className="text-color-text-muted gap-form-row typography-caption">
          {getLabel("response_time_text")}
        </Typography>

        <Box className="flex w-full flex-col gap-space-sm">
          <OGButton
            type="primary"
            disabled={isSubmittingSupportPending}
            onClick={handleSubmit(onSubmit)}
            size="medium"
            className="w-full"
          >
            {getLabel("submit_button")}
          </OGButton>

          {/* <Box className="flex flex-row items-center justify-center gap-space-sm">
            <Box className="h-[1px] w-full border border-color-border-emphasis" />
            <Typography className="text-nowrap text-color-text-muted typography-caption">
              {getLabel("Quick_response")}
            </Typography>
            <Box className="h-[1px] w-full border border-color-border-emphasis" />
          </Box> */}
          {/* <a target="_blank" href={`tel:${getLabel("footer_info_telephone").replaceAll(" ", "")}`}>
            <OGButton type="outlined" size="medium" className="w-full">
              {getLabel("call_us_text")}
            </OGButton>
          </a> */}
        </Box>
      </form>
    </Box>
  );
}
