"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import alertImg from "../public/assets/profile/alert-diamond.svg";
type DeleteCarConfirmModalProps = {
  isOpen: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteCarConfirmModal({
  isOpen,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteCarConfirmModalProps) {
  const { getLabel } = useBranding();

  if (!isOpen) return null;

  return (
    <Modal
      width="max-w-md"
      containerClassName="z-[1000]"
      modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] gtsm:min-h-[288px] h-auto"
      backdropClass="bg-black bg-opacity-50"
      showCloseButton={false}
      contentClassName="base:px-[55px] gtsm:px-[82px] py-8"
      footerClassName="bg-color-background-l2 gtsm:pb-0"
      footerComponent={
        <Box className="my-4 flex w-full flex-row flex-wrap justify-center gap-4">
          <Button
            onPress={onCancel}
            className="flex h-[42px] min-w-[74px] items-center justify-center whitespace-nowrap rounded-[4px] border border-color-primary-main bg-transparent px-[10px] hover:bg-color-primary-disabled"
          >
            <Text className="text-color-primary-main body-regular-sm">
              {getLabel("cancel") !== "cancel" ? getLabel("cancel") : "Cancel"}
            </Text>
          </Button>
          <Button
            className="h-[42px] whitespace-nowrap rounded-[4px] bg-button-danger-bg-default px-5 py-2 hover:bg-button-danger-bg-hover"
            onPress={onConfirm}
            isDisabled={isDeleting}
          >
            <Text className="text-center text-color-text-on-dark body-regular-sm">
              {getLabel("delete") !== "delete" ? getLabel("delete") : "Delete"}
            </Text>
          </Button>
        </Box>
      }
    >
      <Box className="flex flex-col items-center justify-center gap-4">
        <Box className="flex flex-row items-center justify-center rounded-[8px] bg-color-system-error-extra-light">
          <Image src={alertImg} height={52} width={52} alt="delete" />
        </Box>
        <Text className="text-center text-color-text-body body-bold-md">
          {getLabel("delete_car_confirmation") !== "delete_car_confirmation"
            ? getLabel("delete_car_confirmation")
            : "Delete this car?"}
        </Text>
        <Text className="text-color-text-body body-regular-sm">
          {getLabel("action_undone") !== "action_undone"
            ? getLabel("action_undone")
            : "This action cannot be undone."}
        </Text>
      </Box>
    </Modal>
  );
}
