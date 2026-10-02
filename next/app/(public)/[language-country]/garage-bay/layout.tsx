"use client";

import { Box } from "@/components/ui/box";
import useIpadDetection from "@/hooks/useIpadDetection";
import LeftNavBar from "@/screens/landing/left-navbar";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { usePathname } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";

export default function GarageBayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const isIpad = useIpadDetection();

  const isSavedCarsTheme =
    pathname?.includes("my-saved-cars") || pathname?.includes("my-saved-car");
  const isSavedCarsExact = pathname === "/garage-bay/my-saved-cars";

  const mainBgClass = isSavedCarsTheme
    ? "bg-color-background-l2"
    : "bg-eb-panel-hero-image bg-cover bg-center bg-no-repeat transition-all duration-1000";

  const innerClass = [
    "h-full w-full",
    isSavedCarsExact
      ? `lg:pl-0 ${getClientFeatureFlag("show_left_nav_flag") ? "lg:pl-[200px]" : ""} gtlg:pl-[200px]`
      : isIpad
        ? ""
        : `${getClientFeatureFlag("show_left_nav_flag") ? "lg:pl-[196px]" : "lg:pl-[36px]"}`,
    isIpad ? "bg-[--Saved-Cars-Tablet]" : "bg-color-background-l4",
    "gtlg:overflow-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Box className="relative h-full w-full gtlg:h-screen">
      {!isTablet && <LeftNavBar />}
      <main className={`h-full ${mainBgClass}`}>
        <Box className="absolute inset-0 bg-white opacity-50" />
        <Box className={innerClass}>{children}</Box>
      </main>
    </Box>
  );
}
