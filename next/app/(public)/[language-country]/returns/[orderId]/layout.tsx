import React, { Suspense } from "react";

import { Box } from "@/components/ui/box";
import BottomNavBar from "@/screens/landing/bottom-navbar";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import ProfileNavbar from "@/screens/profile/ProfileNavbar";
import LeftNavBar from "@/screens/landing/left-navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { headers } from "next/headers";

const HeaderRowWithNoSSR = dynamic(() => import("@/screens/landing/header-row"), {
  ssr: false, // Disable SSR for this component
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";

export const metadata: Metadata = {
  title: "Refunds",
  keywords: "",
  description: `${siteName} Profile Layout`,
};

interface ProfileLayoutInterface {
  children?: React.ReactNode;
}

export default function ProfileLayout(props: ProfileLayoutInterface) {
  const { children } = props;
  const pathname = headers().get("x-current-path"); // Only for SSR instead of usePathname()

  return (
    <Box className={`relative h-full w-full`}>
      <main className="z-[10] h-full">
        <Box className="h-full w-full">
          {/* this is the main content of profile, will include Left profile Nav, Right content for Desktop/tablet,
     BUT for mobile this will be full width and height of both i.e. of on profile 
    page the show Nav only if other sub routes then show that with a back icon */}

          <Box className="flex h-full w-full flex-row">{children}</Box>
        </Box>
      </main>
    </Box>
  );
}
