"use client";
import { Box } from "@/components/ui/box";
import { B } from "@expo/html-elements";
import React from "react";

import LeftImg from "./assets/left-img.png";
import Image from "next/image";
import CategoryList from "@/screens/advanced-search/category-list";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useBranding } from "@/contexts/BrandingContext";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";

type Props = {
  forceVisible?: boolean;
};

const L1CategoriesSection = () => {
  const { L1Categories, gotoStep, setSelectedCategories } = useAdvancedSearchStore();
  return (
    <CategoryList
      categories={L1Categories}
      gotoStep={gotoStep}
      setSelectedCategories={setSelectedCategories}
      forLandingPage={true}
    />
  );
  //   return <Box></Box>;
};

const BrowseByCategory = ({ forceVisible = false }: Props) => {
  const ifLandingPage = useCheckForLandingPage();
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();

  if (!ifLandingPage && !forceVisible) {
    // return <p>We're on the root path!</p>;
    return null;
  }

  return (
    <Box
      className={`mt-0 overflow-x-hidden bg-color-background-default py-0 md:py-[37px] ${isIpad ? "" : "lg:bg-color-background-default"}`}
    >
      <Box className={`${isIpad ? "" : "lg:ml-[200px]"} xs:pl-0 md:pl-[36px] lg:pl-0`}>
        <Box className="min-h-[848px] content-center justify-center">
          <Box className="flex flex-row flex-wrap content-center items-center justify-between bg-[--background-neutral-chrome-200] p-[36px] md:p-0 lg:p-[36px] gtlg:h-[480px]">
            {/* on left with images and Titles */}
            <Box
              className={`mb-[24px] mt-[37px] basis-full flex-col items-start justify-center gap-3 ${isIpad ? "basis-12/12" : "gtlg:basis-3/12"}`}
            >
              <Box className="h-auto min-w-[186px]">
                <Image
                  src={LeftImg}
                  height={1000}
                  width={1000}
                  alt="discover img"
                  className="h-full w-full"
                />
              </Box>

              {/* <img className="relative h-[194px] w-[186.43px]" src="https://placehold.co/186x194" /> */}
              <Box className="relative justify-start font-Overpass text-2xl font-bold leading-relaxed text-color-text-body">
                {getLabel("categorysection_btf_title1")}
              </Box>
              <Box className="relative justify-center font-Overpass text-base font-normal leading-[18px] text-color-text-body">
                {getLabel("your_next_favorite_text")}
              </Box>
            </Box>

            {/* Bigger white box for categories list */}
            <Box
              className={`min-h-[648px] bg-[--neutral-beige-600] p-12 md:mr-[38px] lg:mb-0 lg:mr-0 ${isIpad ? "basis-full" : "max-w-[924px] gtlg:basis-8/12"}`}
            >
              {/* <Box className="min-h-[648px] max-w-[924px] basis-full bg-[--neutral-beige-600] p-12 md:mr-[36px] lg:mb-0 gtlg:basis-8/12"> */}
              <L1CategoriesSection />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BrowseByCategory;
