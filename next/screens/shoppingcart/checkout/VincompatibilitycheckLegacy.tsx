"use client";

/**
 * Pre–VIN-check checkout VIN box (no Verify / no Order VinCheck API).
 * Shown when `checkout_vin_api_flow_feature_flag` is false.
 * Support ticket is created on Order and pay via PartQuery — not from this component.
 */
import React, { useEffect } from "react";
import { Box } from "@/components/ui/box";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Typography from "@/components/og-components/Typography";

export type VincompatibilitycheckLegacyProps = {
  error: (hasError: boolean) => void;
  onVinChange?: (vinNumber: string) => void;
};

const VincompatibilitycheckLegacy = ({ error, onVinChange }: VincompatibilitycheckLegacyProps) => {
  const { getLabel } = useBranding();

  const vinSchema = z.object({
    vinNumber: z
      .string()
      .length(17, getLabel("vin_length_error"))
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, getLabel("vin_invalid_characters")),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vinSchema),
    mode: "onChange",
    defaultValues: {
      vinNumber: "",
    },
  });

  const vinNumber = watch("vinNumber") || "";
  useEffect(() => {
    onVinChange?.(vinNumber);
  }, [onVinChange, vinNumber]);

  useEffect(() => {
    if (vinNumber?.length > 0) {
      error(!!errors.vinNumber);
    } else {
      error(false);
    }
  }, [errors.vinNumber, error, vinNumber]);

  const onSubmit = () => {};

  return (
    <Box className="w-full gap-space-xl rounded-[4px] bg-color-background-info-muted base:p-space-md gtsm:px-space-xl gtsm:py-space-lg">
      <Box className="flex w-full flex-col gap-space-sm">
        <Typography className="text-color-text-emphasis typography-heading-03">
          {getLabel("vin_verification_title")}
        </Typography>
        <Typography className="text-color-text-default typography-body-02">
          {getLabel("vin_verificationChcekout_subtitle")}
        </Typography>
      </Box>

      <Box className="w-full gtsm:w-1/2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box className="flex w-full flex-col gap-[6px]">
            <Controller
              name="vinNumber"
              control={control}
              render={({ field }) => (
                <OGTextInput
                  {...field}
                  onChange={(value) => field.onChange(String(value ?? "").toUpperCase())}
                  placeholder={getLabel("enter_car_vin_number")}
                  state={errors.vinNumber ? "error" : "default"}
                  error={errors.vinNumber?.message || undefined}
                  className="bg-white"
                  maxLength={17}
                />
              )}
            />
            <Typography className="text-color-text-muted typography-caption">
              {getLabel("VIN_information_message")}
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default VincompatibilitycheckLegacy;
