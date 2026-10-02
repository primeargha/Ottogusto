"use client";

import { Box } from "@/components/ui/box";
import LeftNavBar from "./left-navbar";
import HeroCard from "./heroCard2";
import HeroCardMobile from "./hero-card-mobile";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROTATION_INTERVAL } from "@/constants";
import { getClientFeatureFlag } from "@/utils/theme-utils";
// import HeroCardTab from "./hero-card-tab";
// import { FORCE_iPAD } from "@/config/app";
import useIpadDetection from "@/hooks/useIpadDetection";
import { useMedia } from "@/hooks/useMedia";

export const HeroSection = () => {
  const { isAuthenticated } = useAuthStore();
  const isMmeFeatureEnabled = getClientFeatureFlag("mme_feature_flag");
  const [bgIndex, setBgIndex] = useState(1);
  const isIpad = useIpadDetection();
  const isMobile = useMedia("(max-width: 639px)");
  const backDropFilters = [
    "backdrop-brightness-75 backdrop-contrast-125 bg-black/20", // Fiat
    "backdrop-brightness-75 backdrop-contrast-125 bg-black/20", // Opel
    "backdrop-brightness-75 backdrop-contrast-125 bg-black/10", // Mini Cooper
    "backdrop-brightness-75 backdrop-contrast-125 bg-black/25", // BMW
    "backdrop-brightness-75 backdrop-contrast-125 bg-black/25", // Merc
  ];

  useEffect(() => {
    setBgIndex(1); // Reset to initial state
    if (isAuthenticated) {
      setBgIndex(3);
    }
    const interval = setInterval(() => {
      // setBgIndex((prev) => (prev + 1) % 2);
      setBgIndex((prev) => {
        return prev < 5 ? prev + 1 : 1;
      });
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
    // }
  }, [isAuthenticated]);
  const isSmallMobile = useMedia("(max-width: 380px)");

  const containerClass = `relative bg-center bg-hero-n-${bgIndex} ${
    isMobile
      ? isSmallMobile
        ? "min-h-[calc(120vh)]"
        : "min-h-[calc(90vh)]"
      : "min-h-[calc(100vh)]"
  } bg-cover bg-no-repeat transition-all duration-1000 md:pb-[30px] md:pt-[50px] 2xl:pb-[169px] 2xl:pt-[176px]`;

  const backDropClass = `absolute inset-0 ${backDropFilters[bgIndex]}`;

  return (
    // <Box className="relative bg-center bg-[url('/assets/bg.jpg')] bg-[position:43%_75px] bg-cover bg-no-repeat min-h-[calc(100vh+75px)] md:pt-[50px] md:pb-[30px] 2xl:pt-[176px] 2xl:pb-[169px]">
    // <Box
    //   className={`relative bg-center ${
    //     isAuthenticated ? "bg-hero-1" : bgIndex === 0 ? "bg-hero-1" : "bg-hero-2"
    //   } min-h-[calc(100vh)] bg-cover bg-no-repeat transition-all duration-1000 md:pb-[30px] md:pt-[50px] 2xl:pb-[169px] 2xl:pt-[176px]`}
    // >
    <Box className={containerClass}>
      <Box className={backDropClass}></Box>
      <LeftNavBar />
      <Box className="flex flex-row items-center">
        <Box
          className="w-full base:mt-16 md:mt-[10px] between-640-1080:scale-[70%] ml:ml-[calc(vw-118px)]" // between-900-1080:scale-[87%] removed class due to overlaping css for OE sarch ref no
          id="hero_container"
        >
          {/* <Box className="mt-[15%] lg:mt-[calc(36vh)] between-900-1080:scale-[87%] ml:ml-[calc(vw-118px)]"> */}
          {/* {isIpad == true && <HeroCardTab savedCarsData={savedCarsData} />} */}
          {/* {isIpad == false && <HeroCard savedCarsData={savedCarsData} />} */}

          <HeroCard isMmeFeatureEnabled={isMmeFeatureEnabled} />
        </Box>
      </Box>
      <Box className="relative flex flex-col items-center">
        <HeroCardMobile />
      </Box>
    </Box>
  );
};
