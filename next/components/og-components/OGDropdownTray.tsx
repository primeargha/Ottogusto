"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box } from "../ui/box";
import GreenCrossIcon from "@/assets/GreenCrossIcon";
import Typography from "./Typography";
import { OGButton } from "./OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { lockBodyScroll, unlockBodyScroll } from "@/utils/bodyScrollLock";

interface OGDropdownTrayProps {
  children: React.ReactNode;
  headerLabel?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasResetButton?: boolean;
  showTitleCloseIcon?: boolean;
  showTopDivider?: boolean;
  showBottomBorder?: boolean;
  hasPendingSelection?: boolean;
  modalCloseHandler?: () => void;
  resetHandler?: () => void;
  saveHandler?: () => void;
  hasFooterResetButton?: boolean;
  hasFooterSaveButton?: boolean;
  handleShowAll?: () => void;
  customText?: string;
  filterName?: "sorting" | "availability" | "brands" | "price" | "type" | "categories";
}

const DESKTOP_VIEWPORT_PADDING_PX = 16;
const DESKTOP_MIN_PANEL_HEIGHT_PX = 160;

export function OGDropdownTray({
  children,
  headerLabel,
  hasHeader = true,
  filterName,
  hasFooter = false,
  hasResetButton = false,
  showTitleCloseIcon = true,
  showTopDivider = false,
  showBottomBorder = true,
  hasPendingSelection = false,
  modalCloseHandler,
  handleShowAll,
  customText,
  hasFooterResetButton = false,
  hasFooterSaveButton = false,
  resetHandler,
  saveHandler,
}: OGDropdownTrayProps) {
  const { getLabel } = useBranding();

  // Track whether we're on mobile (< gtsm breakpoint = 640px).
  // We read this once on mount and keep it stable — avoids SSR mismatch.
  const isMobileRef = useRef(false);
  const desktopPanelRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [desktopMaxHeight, setDesktopMaxHeight] = useState<number | null>(null);

  const isBrandsTray = filterName === "brands";

  const updateDesktopMaxHeight = useCallback(() => {
    if (isMobileRef.current || !isBrandsTray) return;
    const panel = desktopPanelRef.current;
    if (!panel) return;
    const top = panel.getBoundingClientRect().top;
    const available = window.innerHeight - top - DESKTOP_VIEWPORT_PADDING_PX;
    setDesktopMaxHeight(Math.max(available, DESKTOP_MIN_PANEL_HEIGHT_PX));
  }, [isBrandsTray]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 639.98px)");
    setIsMobile(mq.matches);
    isMobileRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      isMobileRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock page scroll while the mobile bottom sheet is open so swipe gestures
  // on the sheet (or empty option lists) cannot scroll/dismiss via the page.
  useEffect(() => {
    if (!mounted || !isMobile) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [mounted, isMobile]);

  // Desktop/tablet: cap tray height to remaining viewport below the trigger (brands only).
  useLayoutEffect(() => {
    if (!mounted || isMobile || !isBrandsTray) {
      setDesktopMaxHeight(null);
      return;
    }

    const measure = () => updateDesktopMaxHeight();
    measure();
    const frameId = requestAnimationFrame(measure);

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
    };
  }, [
    mounted,
    isMobile,
    updateDesktopMaxHeight,
    filterName,
    hasFooter,
    hasHeader,
    hasPendingSelection,
    headerLabel,
    isBrandsTray,
  ]);

  const filterSizeMap: Record<string, { mobile: string; desktop: string }> = {
    brands: {
      mobile: "base:min-h-[500px] base:h-[500px]",
      desktop: "gtsm:w-[320px] gtsm:max-w-[320px]",
    },
    availability: {
      mobile: "base:h-[400px] base:min-h-[400px] gtsm:h-auto gtsm:min-h-0",
      desktop: "gtsm:w-[320px] gtsm:max-w-[320px]",
    },
    type: {
      mobile: "base:h-[268px] base:min-h-[268px] gtsm:h-auto gtsm:min-h-0",
      desktop: "gtsm:w-[320px] gtsm:max-w-[320px]",
    },
    price: {
      mobile: "base:h-[300px] base:min-h-[300px]",
      desktop: "gtsm:w-[360px] gtsm:max-w-[360px]",
    },
    sorting: { mobile: "", desktop: "gtsm:w-[320px] gtsm:max-w-[320px]" },
    categories: {
      mobile: "base:h-auto base:max-h-[70vh]",
      desktop: "gtsm:w-[320px] gtsm:max-w-[320px]",
    },
  };

  const sizeClasses = filterSizeMap[filterName ?? ""] ?? {
    mobile: "",
    desktop: "gtsm:w-[320px] gtsm:max-w-[320px]",
  };

  // Per-filter panel heights in px — used for the portal inline style so we
  // don't rely on Tailwind classes being available in the portal DOM context.
  const mobileHeightMap: Record<string, number> = {
    brands: 550,
    availability: 400,
    type: 345,
    price: 300,
    sorting: 0,
    categories: 500,
  };
  const mobileHeight = mobileHeightMap[filterName ?? ""] ?? 0;

  // ─── Shared inner JSX (same node structure as original) ───────────────────
  const panelContent = (
    <>
      {/* Header — only visible on mobile */}
      {hasHeader && (
        <Box className="flex flex-col gap-space-md base:flex gtsm:hidden">
          {/* Drag handle */}
          <Box className="flex w-full items-center justify-center p-space-2xs">
            <Box className="h-1 w-16 rounded-lg bg-color-icon-default" />
          </Box>

          {/* Header title + divider */}
          <Box className="flex w-full flex-col">
            <Box className="flex h-11 max-h-11 flex-row items-start justify-between">
              <Box className="flex flex-row items-center justify-center gap-space-xs">
                {showTitleCloseIcon && (
                  <OGButton type="ghost" onClick={modalCloseHandler ?? (() => {})}>
                    <GreenCrossIcon className="h-[24px] w-[24px] text-button-ghost-icon" />
                  </OGButton>
                )}
                {headerLabel && (
                  <Typography className="text-color-text-emphasis typography-heading-04">
                    {headerLabel}
                  </Typography>
                )}
              </Box>
              {hasResetButton && (
                <OGButton
                  type="ghost"
                  size="small"
                  className="min-w-0"
                  onClick={resetHandler ?? (() => {})}
                >
                  <Typography className="text-color-text-default typography-body-02">
                    {getLabel("filter_reset")}
                  </Typography>
                </OGButton>
              )}
            </Box>
            {showTopDivider && (
              <Box className="h-[1px] w-full border-b border-color-border-default" />
            )}
          </Box>
        </Box>
      )}

      {/* Main content + footer */}
      <Box
        className={`relative flex w-full flex-col gap-space-xs bg-color-background-default ${
          isBrandsTray
            ? "gtsm:min-h-0 gtsm:flex-1 gtsm:overflow-hidden gtsm:rounded-md gtsm:border gtsm:border-color-border-default gtsm:p-space-sm"
            : "gtsm:h-auto gtsm:overflow-visible gtsm:rounded-md gtsm:border gtsm:border-color-border-default gtsm:p-space-sm"
        }`}
      >
        {children}

        {/* Footer */}
        {hasFooter && (
          <Box className="w-full flex-col gap-space-md bg-color-background-default base:fixed base:bottom-0 base:left-0 base:right-0 base:px-space-xs base:pb-5 gtsm:static gtsm:flex gtsm:shrink-0 gtsm:px-0 gtsm:pb-0">
            {showBottomBorder && (
              <Box className="h-[1px] w-full border-b border-color-border-default" />
            )}
            {hasPendingSelection ? (
              <Box className="flex h-[42px] w-full flex-row gap-[4px]">
                {hasFooterResetButton && (
                  <OGButton
                    type="outlined"
                    size="small"
                    className="w-full"
                    onClick={resetHandler ?? (() => {})}
                  >
                    {getLabel("filter_reset")}
                  </OGButton>
                )}
                {hasFooterSaveButton && (
                  <OGButton
                    type="primary"
                    size="small"
                    className="w-full py-[11px]"
                    onClick={saveHandler ?? (() => {})}
                  >
                    {getLabel("filter_save")}
                  </OGButton>
                )}
              </Box>
            ) : (
              <OGButton
                type="outlined"
                size="small"
                className="w-full py-[10px]"
                onClick={() => {
                  saveHandler?.();
                  modalCloseHandler?.();
                }}
              >
                {customText ? customText : getLabel("filter_show_all")}
              </OGButton>
            )}
          </Box>
        )}
      </Box>
    </>
  );

  // ─── Mobile: portal to <body> ─────────────────────────────────────────────
  // This is the ONLY fix that reliably works on iOS Safari. position:fixed
  // inside any overflow:auto/scroll ancestor is clipped to that ancestor on
  // WebKit (bug #160953). Portaling escapes the scroll container entirely.
  if (mounted && isMobile) {
    return createPortal(
      <>
        {/* Backdrop */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            modalCloseHandler?.();
          }}
          style={
            {
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(0,0,0,0.5)",
            } as any
          }
          className=""
        />

        {/* Panel — same classes as original, but now portal-rooted at body */}
        <Box
          data-dropdown-panel={filterName ?? "dropdown"}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={
            {
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              // px fallback first, then dvh cap for iOS 15.4+
              maxHeight: mobileHeight > 0 ? `min(${mobileHeight}px, 90dvh)` : "90dvh",
              minHeight: mobileHeight > 0 ? `${mobileHeight}px` : undefined,
              // Keep vertical gestures on the sheet; don't chain-scroll the page.
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            } as any
          }
          className={`flex w-full max-w-full flex-col gap-space-md rounded-t-3xl border border-color-border-default bg-color-background-default px-space-xs pb-[calc(20px+env(safe-area-inset-bottom))] pt-space-xs`}
        >
          {panelContent}
        </Box>
      </>,
      document.body,
    );
  }

  // ─── Desktop: original inline rendering ───────────────────────────────────
  return (
    <>
      {/* Backdrop — only visible on mobile (hidden on desktop via gtsm:hidden) */}
      <Box
        className="fixed inset-0 z-[9998] h-full w-full bg-black/50 base:block gtsm:hidden"
        onClick={() => modalCloseHandler?.()}
      />

      {/* Panel */}
      <Box
        ref={desktopPanelRef as any}
        data-dropdown-panel={filterName ?? "dropdown"}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={
          isBrandsTray && desktopMaxHeight != null
            ? ({ maxHeight: `${desktopMaxHeight}px` } as any)
            : undefined
        }
        className={`border border-color-border-default bg-color-background-default base:fixed base:bottom-0 base:left-0 base:right-0 base:z-[9999] ${
          filterName === "brands"
            ? "base:h-[550px] base:min-h-[550px]"
            : filterName === "availability"
              ? "base:h-[400px] base:min-h-[400px] gtsm:h-auto gtsm:min-h-0"
              : filterName === "type"
                ? "min-h-[345px] base:h-[345px] gtsm:h-auto gtsm:min-h-0"
                : ""
        } base:flex base:w-full base:max-w-full base:flex-col base:gap-space-md base:rounded-t-3xl base:px-space-xs base:pb-5 base:pt-space-xs gtsm:absolute gtsm:top-[48px] gtsm:z-50 gtsm:flex gtsm:flex-col ${
          isBrandsTray ? "gtsm:min-h-0 gtsm:overflow-hidden" : "gtsm:h-auto gtsm:overflow-visible"
        } ${
          filterName === "price"
            ? "gtsm:left-[-70px] gtsm:w-[360px] gtsm:max-w-[360px] gtlg:left-[-8px]"
            : filterName === "sorting"
              ? "gtsm:left-[-162px] gtsm:w-[320px] gtsm:max-w-[320px] gtlg:left-[-178px]"
              : "gtsm:left-[-8px] gtsm:w-[320px] gtsm:max-w-[320px]"
        } gtsm:rounded-xl gtsm:border-none gtsm:pt-0`}
      >
        {panelContent}
      </Box>
    </>
  );
}
