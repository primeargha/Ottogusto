"use client";

import React, { useEffect, useState } from "react";

import { Box } from "@/components/ui/box";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import { ROTATION_INTERVAL } from "@/constants";
import OERefNumber from "../oe-search/oe-ref-number";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useOERefStore } from "@/stores/useOERefStore";
import SavedCarHeroContainer from "./saved-car-hero-container";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import useIpadDetection from "@/hooks/useIpadDetection";
import { useRouter, useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import MMESearchModal from "@/components/MMESearchModal";

const ROTATING_WORDS = [
  "hero_t2_dyn_1",
  "hero_t2_dyn_2",
  "hero_t2_dyn_3",
  "hero_t2_dyn_4",
  "hero_t2_dyn_5",
];
const ROTATING_WORDS_LOGGEDIN = [
  "hero_t2_dyn_1_loggedin",
  "hero_t2_dyn_2_loggedin",
  "hero_t2_dyn_3_loggedin",
  "hero_t2_dyn_4_loggedin",
  "hero_t2_dyn_5_loggedin",
];

const HeroCardTab = ({ savedCarsData }: { savedCarsData: any }) => {
  const { getLabel } = useBranding();
  const { isAuthenticated, authUser } = useAuthStore();
  const { openOERefSearch } = useOERefStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const { resetSearch, setIsOgSearch, openModal } = useSearchModalStore();
  // const { savedCarsData } = useSavedCarsStore();
  const router = useRouter();
  const params = useParams();

  // const { data: savedCarsData } = useGetMySavedCarsQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentWordIndex(0);
      setAnimationKey((prev) => prev + 1); // Increment key to force animation restart
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      }, ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const renderLoggedOutContent = () => (
    <>
      <Box className="">
        <Box className="font-Anton text-[24px] font-normal leading-10 text-[--brand-highway-yellow]">
          {getLabel("hero_t1_loggedout")}
        </Box>

        {/* Latest Change Here, below */}
        <Box className="gap-1">
          <Box className="font-Anton text-[44px] font-normal leading-[84px] text-[--background-beige-800]">
            {getLabel("hero_t2_loggedout")}
          </Box>

          <Box className="h-[64px] w-[350px] overflow-hidden bg-transparent">
            {/* Container box */}
            <Box className="relative h-full w-fit bg-transparent">
              {/* Single animated container with background and text */}
              <Box
                key={animationKey}
                className="h-full w-fit animate-expandWidth whitespace-nowrap bg-[--brand-racing-green] pr-1"
              >
                <Box className="ml-[4px] overflow-hidden font-Anton text-[44px] font-normal text-[--brand-highway-yellow]">
                  {ROTATING_WORDS[currentWordIndex] && getLabel(ROTATING_WORDS[currentWordIndex])}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );

  const renderLoggedInContent = () => (
    <>
      <Box className="gap-2">
        <Box className="font-Anton text-[24px] font-normal leading-10 text-[--brand-highway-yellow]">
          {" "}
          {/* @ts-ignore */}
          {authUser?.firstName // @ts-ignore
            ? `${getLabel("welcome")}, ${authUser?.firstName ?? ""}!`
            : `${getLabel("welcome")}!`}
        </Box>
        <Box className="font-Anton text-7xl font-normal leading-[84px] text-[--background-beige-800]">
          {getLabel("hero_t2_loggedin")}
        </Box>

        <Box className="h-[94px] min-w-[295px] overflow-hidden bg-transparent">
          {/* Container box */}
          <Box className="h-full w-fit bg-transparent">
            {/* Animated green background */}
            <Box className="h-full w-fit animate-expandWidth whitespace-nowrap bg-[--brand-racing-green] pr-1">
              <Box className="ml-[4px] overflow-hidden font-Anton text-7xl font-normal leading-[84px] text-[--brand-highway-yellow]">
                {ROTATING_WORDS_LOGGEDIN[currentWordIndex] &&
                  getLabel(ROTATING_WORDS_LOGGEDIN[currentWordIndex])}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );

  const isIpad = useIpadDetection();

  return (
    <Box className={`${isIpad ? "" : "ml-[71px]"} hidden animate-fadeIn md:block`}>
      <Box className="mt-[-100px] max-w-[640px] justify-self-center">
        <Box className="relative w-full overflow-hidden">
          {/* <Box className="absolute left-[90px] top-[73px] h-[58px] w-full bg-gradient-to-b from-black via-black to-black blur-[104px]" />
        <Box className="absolute left-0 top-[37px] h-[94px] w-[495px] bg-gradient-to-b from-black via-black to-black blur-[104px]" /> */}
          {isAuthenticated ? renderLoggedInContent() : renderLoggedOutContent()}
        </Box>
        {/* New Search Boxes */}
        {isAuthenticated && savedCarsData?.data.length > 0 ? (
          <SavedCarHeroContainer />
        ) : (
          <Box className="relative mt-[20px] flex h-[140px] w-[640px] flex-row rounded-[8px] shadow-[0px_6px_0px_0px_#009F4D]">
            {/* Left Search Box */}
            <Box
              // @ts-ignore
              onClick={() => {
                // reset the search modal
                resetSearch();
                setIsOgSearch(false);
                // Navigate to search page using getRouteLocaleString
                router.push(getRouteLocaleString(Routes.search, params));
              }}
              className="relative flex w-1/2 cursor-pointer items-center justify-start rounded-l-lg bg-[--background-beige-800] px-4 py-6 transition-colors hover:bg-[--hover-green-color]"
            >
              <Box className="flex h-full flex-col justify-between">
                {/* Top section with image and text in flex */}
                <Box className="flex flex-row items-start">
                  <Image
                    src="/assets/icons/car.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="mr-3"
                  />
                  <Box className="font-Overpass text-base font-normal leading-[18px] text-color-primary-main">
                    {getLabel("searchcar_cta_lp_desc_1")}
                    <br />
                    {getLabel("searchcar_cta_lp_desc_2")}
                  </Box>
                </Box>

                {/* Bottom text */}
                <Box className="font-Overpass text-2xl font-bold text-color-primary-main">
                  {getLabel("search_for_car")}
                </Box>
              </Box>
              {/* Border divider */}
              <Box className="absolute right-0 top-[50%] h-[80%] w-[1px] -translate-y-1/2 bg-[--primary-colors-primary-dark] opacity-20" />
            </Box>

            {/* Right Search Box */}
            <Box
              // @ts-ignore
              onClick={openOERefSearch}
              className="flex w-1/2 cursor-pointer items-center justify-start rounded-r-lg bg-[--background-beige-800] px-4 py-6 transition-colors hover:bg-[--hover-green-color]"
            >
              <Box className="flex h-full flex-col justify-between">
                {/* Top section with image and text in flex */}
                <Box className="flex flex-row items-start">
                  <Image
                    src="/assets/icons/parts.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="mr-3"
                  />
                  <Box className="font-Overpass text-base font-normal leading-[18px] text-color-primary-main">
                    {getLabel("searchpart_cta_lp_desc1")}
                    <br />
                    {getLabel("searchpart_cta_lp_desc2")}
                  </Box>
                </Box>

                {/* Bottom text */}
                <Box className="font-Overpass text-2xl font-bold text-color-primary-main">
                  {getLabel("search_for_parts")}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
        <MMESearchModal />
      </Box>
    </Box>
  );
};

export default HeroCardTab;
