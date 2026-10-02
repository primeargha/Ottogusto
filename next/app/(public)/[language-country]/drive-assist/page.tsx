// import { Blank } from "@/screens/blank";
import React, { Suspense } from "react";

import { Box } from "@/components/ui/box";
import { HeroSection } from "@/screens/landing/hero-section";
import PreviousSearchCarousel from "@/screens/landing/previous-search-carousel";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import FooterLanding from "@/screens/landing/footer";
import HeaderRowSkeleton from "@/screens/landing/header-row-skeleton";

export const metadata: Metadata = {
  title: "Drive Assist | Ottogusto",
  keywords: "",
  description: "Drive Assist...",
};

const HeaderRowWithNoSSR = dynamic(() => import("@/screens/landing/header-row"), {
  ssr: false, // Disable SSR for this component
  loading: () => <HeaderRowSkeleton />,
});

const DriveAssistPage = () => {
  const carouselConfig = {
    itemsPerView: {
      desktop: 5, // Show 4 cards on desktop
      mobile: 2, // Show 1 card on mobile
    },
    containerClassName:
      "pr-8 base:pb-[110px] xs:pb-[100px] xs:pt-[2rem] lg:ml-[220px] lg:pb-[2rem] lg:pt-[57px]",
    cardClassName: "w-[45%] flex-shrink-0 lg:w-[19%]", // Custom card widths
    breakpoint: 992, // Custom breakpoint
  };
  return (
    <Box className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<HeaderRowSkeleton />}>
        <HeaderRowWithNoSSR />
      </Suspense>

      <FooterLanding />
    </Box>
  );
};

export default DriveAssistPage;
