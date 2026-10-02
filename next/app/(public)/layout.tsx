import BackgroundProvider from "@/components/BackgroundProvider";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Box } from "@/components/ui/box";
import HeaderRowSkeleton from "@/screens/landing/header-row-skeleton";

// PERF: Removed 8 unused imports that were bundled but never rendered (~2+ MiB savings)
// SevenPreviousSearches, BottomNavBar, PreviousSearchCarousel, PreviousSearchClientContainer,
// FooterLanding, WhyUs_BrandValues, OurBrandsYourTrust, BrowseByCategory, Reviews,
// KeyFeaturesSection, FaqSection, RedirectManager, Anton/Inter/Overpass fonts

const HeaderRowWithNoSSR = dynamic(() => import("@/screens/landing/header-row"), {
  ssr: false,
  loading: () => <HeaderRowSkeleton />,
});

const EmailLinkOnboarding = dynamic(() => import("@/components/EmailLinkOnboarding"), {
  ssr: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto",
  keywords: "",
  description: "",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BackgroundProvider>
      <Box className="flex w-full flex-col bg-color-background-default">
        <Suspense fallback={<HeaderRowSkeleton />}>
          <HeaderRowWithNoSSR />
        </Suspense>
        {children}
        <EmailLinkOnboarding />
      </Box>
    </BackgroundProvider>
  );
}
