"use client";
import React, { useEffect, useRef } from "react";

import { Box } from "@/components/ui/box";
// import Image from "next/image";
// import { Text } from "@/components/ui/text";
// import { Button } from "@/components/ui/button";
// import { FORCE_iPAD } from "@/config/app";
import { useMedia } from "@/hooks/useMedia";
import DesktopViewEBPanel from "./DesktopViewEBPanel";
import TabletMobileViewEBPanel from "./TabletMobileViewEBPanel";
import useIpadDetection from "@/hooks/useIpadDetection";

export default function NoSavedCarEBPanel() {
  const tillTab = useMedia("(max-width: 1023px)");
  const isIpad = useIpadDetection();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  return (
    <Box
      ref={containerRef as any}
      className="relative block h-full w-full content-center justify-center px-[16px] pb-[10px] pt-[75px]"
    >
      {/* Desktop and Larget view */}
      {/* container this will have scaling down effect on screen size 1024 to 1600, after that it will be normal again */}
      {!isIpad && !tillTab && <DesktopViewEBPanel />}

      {/* Tablet and Mobile view */}
      {(isIpad || tillTab) && <TabletMobileViewEBPanel isIpad={isIpad} />}
    </Box>
  );
}
