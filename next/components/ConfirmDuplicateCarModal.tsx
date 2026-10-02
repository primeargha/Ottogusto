"use client";
import React, { useEffect } from "react";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { useConfirmDuplicateCarStore } from "@/stores/useConfirmDuplicateCarStore";
import { useBranding } from "@/contexts/BrandingContext";

// Define the schema for car name validation
const carNameSchema = z.object({
  carName: z.string().min(1, "Car name is required"),
});

type CarNameFormData = z.infer<typeof carNameSchema>;

interface ConfirmDuplicateCarModalProps {
  onConfirm: (carName: string) => void;
  errorMessage?: string | null;
}

const ConfirmDuplicateCarModal: React.FC<ConfirmDuplicateCarModalProps> = ({
  onConfirm,
  errorMessage,
}) => {
  const { isOpen, closeModal, setErrorMessage } = useConfirmDuplicateCarStore();
  const { getLabel } = useBranding();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setError,
  } = useForm<CarNameFormData>({
    resolver: zodResolver(carNameSchema),
    defaultValues: {
      carName: "",
    },
    mode: "onChange",
  });

  // Set server-side error if provided
  useEffect(() => {
    if (errorMessage) {
      setError("carName", {
        type: "server",
        message: errorMessage,
      });
    }
  }, [errorMessage, setError]);

  const handleSave = (data: CarNameFormData) => {
    setErrorMessage(null);
    onConfirm(data.carName);
  };

  const handleCancel = () => {
    reset();
    closeModal();
    setErrorMessage(null);
  };

  // Add effect to control body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Scroll to top of the page
      window.scrollTo(0, 0);

      // Save current scroll position and styles
      const scrollY = window.scrollY;
      const originalStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };

      // Disable scrolling and hide scrollbars
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Cleanup function to restore original state
      return () => {
        document.body.style.overflow = originalStyles.overflow;
        document.body.style.position = originalStyles.position;
        document.body.style.top = originalStyles.top;
        document.body.style.width = originalStyles.width;

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Button
        className="absolute inset-0 h-full w-full cursor-default bg-transparent opacity-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
        onPress={closeModal}
      />

      <Box
        className="relative w-full max-w-md overflow-hidden rounded-[8px] bg-color-background-l2 shadow-xl gtsm:min-w-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content section */}
        <Box className="px-[24px] py-8 md:px-[42px]">
          <Box className="flex flex-col items-center justify-center gap-4">
            <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
              <Image
                src={`/assets/eb-panel/alert-triangle.svg`}
                height={62}
                width={62}
                alt="duplicate"
              />
            </Box>

            <Text className="text-center text-color-text-body body-bold-md">
              {getLabel("eb_car_already_saved")}
            </Text>

            <Text className="text-center text-color-text-body body-medium-sm">
              {getLabel("eb_save_with_unique_name")}
            </Text>

            <Box className="w-full">
              <Controller
                control={control}
                name="carName"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormControl isInvalid={!!errors.carName} className="w-full">
                    <Input
                      className={`h-16 w-full shrink-0 rounded-[4px] bg-white shadow-[0px_4px_10px_3px_rgba(0,0,0,0.11)] ${
                        errors.carName
                          ? "border border-color-system-error-main focus:outline-none"
                          : "border !border-[--brand-piston-green] focus:outline-none active:border-[--brand-piston-green]"
                      }`}
                    >
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter a Unique Car Name"
                        className="pl-[12px]"
                      />
                    </Input>
                    {errors.carName && (
                      <FormControlError>
                        <FormControlErrorText className="text-color-system-error-main body-regular-sm">
                          {errors.carName.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer section */}
        <Box className="bg-color-background-l2 pb-4 gtsm:pb-0">
          <Box className="flex w-full flex-row justify-center gap-4 px-[26px] py-[16px]">
            <Button
              className="flex h-[42px] w-[74px] flex-row items-center rounded-[4px] border border-[--Primary-Colors-Main] bg-transparent p-[10px] text-color-primary-main hover:bg-transparent focus:bg-transparent active:bg-transparent"
              onPress={handleCancel}
            >
              <Text className="text-color-primary-main body-regular-sm">{getLabel("cancel")}</Text>
            </Button>
            <Button
              className="flex h-[42px] w-[114px] flex-row items-center rounded-[4px] bg-[--Primary-Colors-Main] p-[10px] hover:bg-[var(--color-piston-900m)] focus:bg-[var(--color-piston-900m)] active:bg-[var(--color-piston-900m)] disabled:opacity-50"
              isDisabled={!isValid}
              onPress={handleSubmit(handleSave)}
            >
              <Text className="text-white body-regular-sm">
                {getLabel("confirm_save_modal_btn")}
              </Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfirmDuplicateCarModal;
