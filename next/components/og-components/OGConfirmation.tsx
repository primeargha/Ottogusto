import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useConfirmationStore } from "@/stores/useConfirmationStore";
import Image from "next/image";
import WarnICO_IMG from "@/assets/icons/setting-error-03.svg";
import { PlusIcon } from "lucide-react-native";
import { OGButton } from "./OGButton";
import AlertDiamond from "../icons/AlertDiamond";
import { OGText } from "./OGText";
import { Icon } from "../ui/icon";
// import { color_text_body } from "@/config/theme-alias";

interface OGConfirmationProps {
  className?: string;
}

export const OGConfirmation: React.FC<OGConfirmationProps> = ({ className = "" }) => {
  const {
    isOpen,
    title,
    body,
    confirm,
    cancel,
    closeConfirmation,
    cancelButtonTxt,
    confirmButtonTxt,
    variant = "confirm",
  } = useConfirmationStore();

  if (!isOpen) return null;

  const ConfirmVariation = () => {
    return (
      <Box
        className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 ${className}`}
      >
        <Box
          className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
          //@ts-ignore
          onPress={(e: any) => e.stopPropagation()}
        >
          {/* Header */}
          <Box className="border-b border-gray-200 px-6 py-4">
            <Text className="font-Overpass text-[18px] font-bold leading-[22px] text-color-text-body">
              {title}
            </Text>
          </Box>

          {/* Content */}
          <Box className="px-6 py-6">
            <Box className="flex flex-col items-center justify-center gap-4">
              {/* Icon */}
              <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
                <AlertDiamond size={48} color="var(--System-Colors-Error-Main)" />
              </Box>

              {/* Body Text */}
              <Text className="text-center font-Overpass text-[14px] font-normal leading-[18px] text-color-text-body">
                {body}
              </Text>
            </Box>
          </Box>

          {/* Footer */}
          <Box className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Box className="flex flex-row justify-end gap-3">
              <OGButton size="medium" type="outlined" onClick={cancel}>
                {cancelButtonTxt}
              </OGButton>
              <OGButton size="medium" type="error" onClick={confirm}>
                {confirmButtonTxt}
              </OGButton>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const ReportVariation = () => {
    return (
      <Box
        className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 ${className}`}
      >
        <Box
          className="w-full max-w-md overflow-hidden rounded-lg bg-white p-[24px] shadow-xl"
          //@ts-ignore
          onPress={(e: any) => e.stopPropagation()}
        >
          <Box className="w-full items-center gap-6">
            <Image src={WarnICO_IMG} alt={title} className="h-[62px] w-[62px] p-[12px]" />
            <Box className="text-color-text-body body-bold-md">{title}</Box>
            <Box className="text-color-text-body body-regular-sm">{body}</Box>
            <Box className="flex flex-row gap-[24px]">
              <OGButton
                type="outlined"
                size="medium"
                leftcomp={<Icon as={PlusIcon} />}
                onClick={cancel}
              >
                {cancelButtonTxt ?? "Cancel"}
              </OGButton>
              <OGButton
                type="primary"
                leftcomp={<Icon as={PlusIcon} className="text-white" />}
                onClick={confirm}
              >
                {confirmButtonTxt ?? "Ok"}
              </OGButton>
            </Box>
          </Box>
        </Box>
      </Box>
    );
    // return (
    //   <Box
    //     className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 ${className}`}
    //   >
    //     <Box
    //       className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
    //        //@ts-ignore
    //       onPress={(e: any) => e.stopPropagation()}
    //     >
    //       {/* Header */}
    //       <Box className="border-b border-gray-200 px-6 py-4">
    //         <Text className="font-Overpass text-[18px] font-bold leading-[22px] text-color-text-body">
    //           RR-{title}
    //         </Text>
    //       </Box>

    //       {/* Content */}
    //       <Box className="px-6 py-6">
    //         <Box className="flex flex-col items-center justify-center gap-4">
    //           {/* Icon */}
    //           <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
    //             <AlertDiamond size={48} color="var(--System-Colors-Error-Main)" />
    //           </Box>

    //           {/* Body Text */}
    //           <Text className="text-center font-Overpass text-[14px] font-normal leading-[18px] text-color-text-body">
    //             {body}
    //           </Text>
    //         </Box>
    //       </Box>

    //       {/* Footer */}
    //       <Box className="border-t border-gray-200 bg-gray-50 px-6 py-4">
    //         <Box className="flex flex-row justify-end gap-3">
    //           <OGButton size="medium" type="outlined" onClick={cancel}>
    //             {cancelButtonTxt}
    //           </OGButton>
    //           <OGButton size="medium" type="error" onClick={confirm}>
    //             {confirmButtonTxt}
    //           </OGButton>
    //         </Box>
    //       </Box>
    //     </Box>
    //   </Box>
    // );
  };

  if (variant === "report") {
    return ReportVariation();
  }

  if (variant === "confirm") {
    return ConfirmVariation();
  }
};
