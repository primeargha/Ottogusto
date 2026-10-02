"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box } from "../ui/box";
import { InfoCircleIcon } from "@/components/og-components/icons/InfoCircleIcon";
import { CustomTooltip } from "./OGtooltip";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
interface OGDiscountButtonProps {
  color: "positive" | "warning" | "neutral" | "danger" | "info";
  type: "emphasis" | "muted";
  label: string;
  trailingIcon?: React.ReactNode | boolean;
  className?: string;
  tooltipText?: string;
  headingContent?: string | undefined;
}

/** Blocks product-card/cart PDP navigation right after info-icon click on mobile. */
let productCardNavSuppressUntil = 0;

export function suppressProductCardNavigation(ms = 1000) {
  productCardNavSuppressUntil = Date.now() + ms;
}

export function isProductCardNavigationSuppressed() {
  return Date.now() < productCardNavSuppressUntil;
}

function blockNavigationEvent(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
  const native = (e as React.SyntheticEvent & { nativeEvent?: Event }).nativeEvent;
  native?.stopPropagation?.();
  native?.preventDefault?.();
}

export function OGDiscountButton({
  color,
  type,
  label,
  trailingIcon,
  className,
  tooltipText,
  headingContent,
}: OGDiscountButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { getLabel } = useBranding();

  useEffect(() => {
    setIsMounted(true);
    const mq = window.matchMedia("(max-width: 639.98px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  let colorClasses = "";
  let textColor = "";

  if (type === "emphasis") {
    switch (color) {
      case "positive":
        colorClasses = "bg-color-background-positive-emphasis";
        break;

      case "warning":
        colorClasses = "bg-color-background-attention-emphasis";
        break;

      case "danger":
        colorClasses = "bg-color-background-danger-emphasis";
        break;

      case "info":
        colorClasses = "bg-color-background-info-emphasis";
        break;

      case "neutral":
      default:
        colorClasses = "bg-color-background-neutral-emphasis";
        break;
    }
  } else if (type === "muted") {
    switch (color) {
      case "positive":
        colorClasses = "bg-color-background-positive-muted border border-color-border-positive";
        break;

      case "warning":
        colorClasses = "bg-color-background-attention-muted border border-color-border-attention";
        break;

      case "danger":
        colorClasses = "bg-color-background-danger-muted border border-color-border-danger";
        break;

      case "info":
        colorClasses = "bg-color-background-info-muted border border-color-border-info";
        break;

      case "neutral":
        colorClasses = "bg-color-background-neutral-muted border border-color-border-neutral";
        break;
      default:
        colorClasses = "bg-color-background-neutral-muted border border-color-neutral";
        break;
    }
  }

  switch (type) {
    case "emphasis":
      textColor = "text-white";
      break;
    case "muted":
      switch (color) {
        case "positive":
          textColor = "text-color-text-positive";
          break;
        case "warning":
          textColor = "text-color-text-attention";
          break;
        case "danger":
          textColor = "text-color-text-danger";
          break;
        case "info":
          textColor = "text-color-text-info";
          break;
        case "neutral":
        default:
          textColor = "text-color-text-default";
          break;
      }
      break;
  }

  const modalTitle = headingContent ? getLabel(headingContent) : "";
  const modalBody = tooltipText ? getLabel(tooltipText) : "";
  const closeModal = () => setIsModalOpen(false);

  const openInfoModal = (e: React.SyntheticEvent) => {
    blockNavigationEvent(e);
    suppressProductCardNavigation();
    setIsModalOpen(true);
  };

  const trailingIconNode =
    trailingIcon && tooltipText ? (
      isMobile ? (
        <button
          type="button"
          aria-label={modalTitle || "More information"}
          className="relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          onClickCapture={openInfoModal}
          onMouseDownCapture={blockNavigationEvent}
          onPointerDownCapture={blockNavigationEvent}
        >
          <InfoCircleIcon className={textColor} />
        </button>
      ) : (
        <CustomTooltip
          content={getLabel(tooltipText)}
          headingContent={headingContent ? getLabel(headingContent) : undefined}
        >
          <InfoCircleIcon className={`${textColor} cursor-pointer`} />
        </CustomTooltip>
      )
    ) : null;

  return (
    <>
      <div
        data-og-discount-button="true"
        className={`flex h-6 max-h-6 w-auto flex-row items-center justify-center gap-2 rounded-md px-space-xs py-space-2xs ${colorClasses} ${className ?? ""}`}
      >
        <span
          className={`mt-[2px] flex items-center justify-center leading-none ${textColor} typography-overline`}
        >
          {label}
        </span>
        {trailingIconNode}
      </div>

      {isMounted &&
        isMobile &&
        isModalOpen &&
        createPortal(
          <>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              style={
                {
                  position: "fixed",
                  inset: 0,
                  zIndex: 9998,
                  backgroundColor: "rgba(0,0,0,0.5)",
                } as any
              }
            />

            <Box
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={
                {
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  maxHeight: "90dvh",
                } as any
              }
              className="flex w-full max-w-full flex-col gap-space-md rounded-t-3xl border border-color-border-default bg-color-background-default px-space-xs pb-[calc(20px+env(safe-area-inset-bottom))] pt-space-xs"
            >
              <Box className="flex flex-col gap-space-md">
                <Box className="flex w-full items-center justify-center p-space-2xs">
                  <Box className="h-1 w-16 rounded-lg bg-color-icon-default" />
                </Box>

                <Box className="flex w-full flex-col">
                  <Box className="flex h-11 max-h-11 flex-row items-center justify-between">
                    <Box className="flex flex-row items-center justify-center gap-space-xs">
                      {modalTitle ? (
                        <Typography className="text-color-text-emphasis typography-heading-04">
                          {modalTitle}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                  <Box className="h-[1px] w-full border-b border-color-border-default" />
                </Box>
              </Box>

              <Box className="flex w-full flex-col gap-space-md px-space-2xs pb-space-sm">
                <Typography className="text-start text-color-text-muted typography-body-02">
                  {modalBody}
                </Typography>
              </Box>

              <Box className="w-full flex-col gap-space-md bg-color-background-default">
                <Box className="h-[1px] w-full border-b border-color-border-default" />
                <OGButton type="primary" size="medium" className="w-full" onClick={closeModal}>
                  {getLabel("tag_modal_dismiss")}
                </OGButton>
              </Box>
            </Box>
          </>,
          document.body,
        )}
    </>
  );
}
