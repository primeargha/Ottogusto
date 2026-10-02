// @ts-nocheck
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useModalStore } from "@/stores/useModalStore";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Pressable } from "react-native";
import { lockBodyScroll, unlockBodyScroll } from "@/utils/bodyScrollLock";

interface ModalProps {
  children: ReactNode;
  backdropClass?: string;
  width?: string;
  height?: string;
  containerClassName?: string;
  modalClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  showCloseButton?: boolean;
  closeIcon?: ReactNode;
  headerComponent?: ReactNode;
  footerComponent?: ReactNode;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  children,
  backdropClass = "",
  width = "max-w-md",
  height = "auto",
  containerClassName = "",
  modalClassName = "",
  headerClassName = "px-6 py-4 border-b border-gray-200",
  footerClassName = "px-6 py-4 border-t border-gray-200",
  onCancel,
  onSubmit,
  showCloseButton = true,
  closeIcon,
  headerComponent,
  footerComponent,
  contentClassName = "p-6",
}) => {
  const { isOpen, closeModal } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Nested-safe scroll lock (e.g. delete confirm opened over right sidebar drawer).
  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      closeModal();
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return createPortal(
    <Box
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClass} ${containerClassName}`}
      as={Pressable}
      onPress={closeModal}
    >
      <Box
        className={`${width} ${height} relative overflow-hidden rounded-lg bg-white shadow-xl ${modalClassName}`}
        onPress={(e: any) => e.stopPropagation()}
      >
        {headerComponent && <Box className={headerClassName}>{headerComponent}</Box>}

        {showCloseButton && (
          <Button
            className="absolute right-2 top-2 z-10"
            variant="link"
            size="noPadding"
            onPress={closeModal}
          >
            {closeIcon ? (
              closeIcon
            ) : (
              <ButtonIcon
                as={(props: any) => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    {...props}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                className="text-gray-500 hover:text-gray-700"
              />
            )}
          </Button>
        )}

        <Box className={contentClassName}>{children}</Box>

        {footerComponent && <Box className={footerClassName}>{footerComponent}</Box>}
      </Box>
    </Box>,
    document.body,
  );
};

export default Modal;
