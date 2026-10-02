import { Box } from "@/components/ui/box";
import { CheckboxIcon } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { useModalStore } from "@/stores/useModalStore";
import successImg from "@/public/assets/support/support-success.svg";
import closeIcon from "@/public/assets/support/Close.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/BrandingContext";

const SuccessModal = () => {
  const { isOpen, closeModal } = useModalStore();
  const { getLabel } = useBranding();

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 z-50 flex flex-row items-center justify-center bg-black bg-opacity-50 p-4">
      <Box className="relative w-full overflow-hidden rounded-[8px] bg-color-background-l2 p-[24px] base:min-h-[222px] gtsm:max-w-[600px] gtlg:max-w-[740px]">
        <Button
          onPress={closeModal}
          className="absolute right-2 top-2 z-10 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
        >
          <Image src={closeIcon} alt="close" height={18} width={18} />
        </Button>

        <Box className="flex h-full flex-col items-center justify-center gap-[24px] px-[82px]">
          <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Success-Extra-Light] p-[12px]">
            <Image src={successImg} alt="success" />
          </Box>

          <Text className="text-center text-color-text-body body-bold-md">
            {getLabel("support_success_modal_title")}
          </Text>

          <Text className="text-center text-color-text-body body-regular-sm">
            {getLabel("support_success_modal_desc")}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default SuccessModal;
