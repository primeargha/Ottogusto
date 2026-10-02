"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Box } from "@/components/ui/box";
import { View } from "react-native";
import RightSidebarCarSelection from "@/components/RightSidebarCarSelection";
import NewRightSidebarCarSelection from "@/components/NewRightSidebarCarSelection";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { lockBodyScroll, unlockBodyScroll } from "@/utils/bodyScrollLock";

const RightSidebar = () => {
  const menuRef = useRef<View | null>(null);
  const params = useParams();
  const { showRightSidebar: isMenuOpen, hideRightSidebar } = useRightSidebarStore();
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const localeForFlags =
    (params as Record<string, string> | null)?.["language-country"] ?? undefined;
  const isE2EVinFlowEnabled = getClientFeatureFlag(
    "end_to_end_vin_flow_feature_flag",
    localeForFlags,
  );
  const [mobileSheetHeight, setMobileSheetHeight] = React.useState<number | null>(null);

  useEffect(() => {
    function updateHeight() {
      // window.innerHeight is the visible viewport — excludes browser chrome on iOS
      setMobileSheetHeight(Math.round(window.innerHeight * 0.82));
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  useEffect(() => {
    const isInsideHelpModal = (target: Node | null) => {
      if (!target || !(target instanceof Node)) return false;
      return Boolean(document.querySelector("[data-right-sidebar-help-modal]")?.contains(target));
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isInsideHelpModal(event.target as Node)) return;

      if (menuRef.current) {
        const menuElement = menuRef.current as unknown as HTMLElement;
        if (!menuElement.contains(event.target as Node)) {
          hideRightSidebar();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isInsideHelpModal(event.target as Node)) return;
        if (document.querySelector("[data-right-sidebar-help-modal]")) return;
        hideRightSidebar();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      lockBodyScroll();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (isMenuOpen) {
        unlockBodyScroll();
      }
    };
  }, [isMenuOpen, hideRightSidebar]);

  if (!isNewMmeEnabled) {
    return null;
  }

  return (
    <>
      {isMenuOpen && <Box className="fixed inset-0 z-[55] h-full w-full bg-black bg-opacity-50" />}

      <Box
        ref={menuRef}
        style={
          {
            // JS-measured height — reliable on all iOS versions including < 15.4
            // Only applied on mobile (gtsm handles desktop via h-screen class)
            ...(mobileSheetHeight !== null &&
            typeof window !== "undefined" &&
            window.innerWidth < 640
              ? { maxHeight: mobileSheetHeight, minHeight: mobileSheetHeight }
              : {}),
          } as any
        }
        className={`fixed z-[60] flex h-full flex-col gap-space-md overflow-hidden border border-[--humburger-white] bg-color-background-default shadow-lg base:bottom-0 base:left-0 base:right-0 base:w-full base:rounded-t-3xl base:px-space-xs base:pb-[calc(20px+env(safe-area-inset-bottom))] base:pt-space-xs gtsm:left-auto gtsm:right-0 gtsm:top-0 gtsm:h-screen gtsm:min-w-[400px] gtsm:max-w-[400px] gtsm:rounded-none gtsm:px-space-lg gtsm:pb-space-md gtsm:pt-space-md ${
          isMenuOpen
            ? "opacity-100 base:translate-y-0 gtsm:translate-x-0"
            : "pointer-events-none opacity-0 base:translate-y-full gtsm:translate-x-full"
        }`}
      >
        <Box className="w-full shrink-0 items-center justify-center p-space-2xs base:flex gtsm:hidden">
          <Box className="h-1 w-16 rounded-lg bg-color-icon-default" />
        </Box>

        <Box className="flex h-full min-h-0 w-full flex-col">
          {!isE2EVinFlowEnabled && <RightSidebarCarSelection isOpen={isMenuOpen} />}
          {isE2EVinFlowEnabled && <NewRightSidebarCarSelection isOpen={isMenuOpen} />}
        </Box>
      </Box>
    </>
  );
};

export default RightSidebar;
