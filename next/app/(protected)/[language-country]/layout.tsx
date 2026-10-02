import { Suspense, useLayoutEffect } from "react";

import { Box } from "@/components/ui/box";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import FooterLanding from "@/screens/landing/footer";
import FaqSection from "@/screens/landing/faq";
import HeaderRowSkeleton from "@/screens/landing/header-row-skeleton";

const HeaderRowWithNoSSR = dynamic(() => import("@/screens/landing/header-row"), {
  ssr: false, // Disable SSR for this component
  loading: () => <HeaderRowSkeleton />,
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
  title: siteName,
  keywords: "",
  description: `${siteName} Protected Layout`,
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box className={`flex min-h-screen flex-col`}>
      <Suspense fallback={<HeaderRowSkeleton />}>
        <HeaderRowWithNoSSR />
      </Suspense>

      {children}
    </Box>
  );
}
