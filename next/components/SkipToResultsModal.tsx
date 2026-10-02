import React, { useEffect, useRef } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { OGButton } from "@/components/og-components/OGButton";
import { useSkipToResultsModal } from "@/stores/useSkipToResultsModal";
import Image from "next/image";
import modalCross from "@/assets/og-search/modalCross.svg";
import { useBranding } from "@/contexts/BrandingContext";

interface SkipToResultsModalProps {
  onContinueSearch: () => void;
  onResultsPage: () => void;
}

export default function SkipToResultsModal({
  onContinueSearch,
  onResultsPage,
}: SkipToResultsModalProps) {
  const { isOpen, closeModal } = useSkipToResultsModal();
  const { getLabel } = useBranding();

  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const resultsBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      continueBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation between buttons and trigger click on Enter
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (document.activeElement === continueBtnRef.current) {
          resultsBtnRef.current?.focus();
        } else if (document.activeElement === resultsBtnRef.current) {
          continueBtnRef.current?.focus();
        }
      }
      if (e.key === "Enter") {
        if (document.activeElement === continueBtnRef.current) {
          continueBtnRef.current?.click();
        } else if (document.activeElement === resultsBtnRef.current) {
          resultsBtnRef.current?.click();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Box
      ref={modalRef as any}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 gtlg:w-full"
    >
      <Box className="mx-4 flex h-auto w-full items-center gap-[30px] rounded-lg bg-white p-6 shadow-xl gtlg:w-[660px]">
        {/* Header */}

        <Box className="flex w-full flex-row justify-between">
          <Box></Box>
          <Box className="cursor-pointer rounded-md p-1 hover:bg-gray-100">
            <Image src={modalCross} alt="" className="cursor-pointer" onClick={onContinueSearch} />
          </Box>
        </Box>
        <Box className="flex flex-col items-center justify-between text-center base:h-auto base:w-auto gtlg:h-[120px] gtlg:w-[566px]">
          <Text className="font-[Overpass] text-[25px] font-bold leading-[22px] text-black">
            {getLabel("please_note")}
          </Text>
          <Text className="mt-2 text-center font-[Overpass] text-[20px] leading-7 text-black">
            {getLabel("leaving_search")}
          </Text>
        </Box>

        {/* Buttons */}
        <Box className="mb-6 flex h-11 flex-row gap-3 gtlg:max-w-[280px]">
          <OGButton
            ref={continueBtnRef}
            type="primary"
            size="medium"
            className="bg-[--brand-traffic-light-green-2]"
            onClick={onContinueSearch}
          >
            {getLabel("continue_search")}
          </OGButton>
          <OGButton ref={resultsBtnRef} type="outlined" size="medium" onClick={onResultsPage}>
            {getLabel("results_page")}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
