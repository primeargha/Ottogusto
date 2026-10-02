import React, { useEffect } from "react";
import { Box } from "@/components/ui/box";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Typography from "@/components/og-components/Typography";

const VincompatibilitySimple = ({
  error,
  onVinChange,
}: {
  error: (hasError: boolean) => void;
  onVinChange?: (vinNumber: string) => void;
}) => {
  const { getLabel } = useBranding();

  const vinSchema = z.object({
    vinNumber: z
      .string()
      .length(17, getLabel("vin_length_error"))
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, getLabel("vin_invalid_characters")),
    email: z.string().email(getLabel("cart_email_invalid")),
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
      email: "",
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
    <Box className="w-full">
      <Box className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box className="flex w-full flex-col gap-[6px]">
            <Controller
              name="vinNumber"
              control={control}
              render={({ field }) => (
                <OGTextInput
                  {...field}
                  onChange={(value) => field.onChange(value.toUpperCase())}
                  title={getLabel("VIN_number_input")}
                  placeholder={getLabel("enter_car_vin_number_placeholder")}
                  state={errors.vinNumber ? "error" : "default"}
                  error={errors.vinNumber?.message || undefined}
                  className="bg-white"
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

export default VincompatibilitySimple;
