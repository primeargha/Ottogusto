"use client";
import React, { useEffect, useState } from "react";
import DesktopViewEBPanel from "./DesktopViewEBPanel";
import TabletMobileViewEBPanel from "./TabletMobileViewEBPanel";
import { FORCE_iPAD } from "@/config/app";
import { useMedia } from "@/hooks/useMedia";
import { Box } from "@/components/ui/box";
import DesktopEBPanelNotLogggedIn from "./EBPanelNotLogggedIn/DesktopEBPanelNotLogggedIn";
import TabletMobileViewEBPanelNotLogggedIn from "./EBPanelNotLogggedIn/TabletMobileViewEBPanelNotLogggedIn";
import useIpadDetection from "@/hooks/useIpadDetection";

export default function NotLoggedInEBPanel() {
  const isIpad = useIpadDetection();
  const tillTab = useMedia("(max-width: 1023px)");

  return (
    <Box className="relative block h-[100vh] w-full content-center justify-center px-[16px] pb-[10px] pt-[75px]">
      {/* Desktop and Larget view */}
      {/* container this will have scaling down effect on screen size 1024 to 1600, after that it will be normal again */}
      {!isIpad && !tillTab && <DesktopEBPanelNotLogggedIn />}

      {/* Tablet and Mobile view */}
      {(isIpad || tillTab) && <TabletMobileViewEBPanelNotLogggedIn isIpad={isIpad} />}
    </Box>
  );
}
