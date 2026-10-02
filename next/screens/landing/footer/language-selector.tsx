"use client";
import { Button } from "@/components/ui/button";
// import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import Image from "next/image";
import React, { useEffect } from "react";

import LanguageICO from "./assets/language-circle.svg";
import DownArrowICO from "./assets/down-arrow.svg";
import { Box } from "@/components/ui/box";
// import { Icon } from "@/components/ui/icon";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
// import { LOCALEs_LIST } from "@/constants";
// import { LocaleInterface } from "@/types/globalTypes";
import { useBranding } from "@/contexts/BrandingContext";
export { getLocale } from "@/helpers/getLocale";

type Props = {};

const LanguageSelector = (props: Props) => {
  const { changeLocale } = useBranding();
  const { locale, setLocale, getLanguageCountryString, openLanguageSelector } =
    useLandingPageDataStore();
  useEffect(() => {
    changeLocale(locale.split("-")[0] || "en");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <Button
      variant="outline"
      className="justify-start border-none p-0 hover:bg-transparent hover:text-white"
      // {...triggerProps}
      onPress={openLanguageSelector}
    >
      <Image alt="Select Language" title="Select Language" src={LanguageICO} className="mr-3" />
      {/* <ButtonText className="text-white text-base font-medium bg-transparent font-Overpass leading-[18px]">BE - English</ButtonText> */}
      <Box className="font-Overpass text-base font-medium leading-[18px] text-white">
        {/* BE - English */}
        {getLanguageCountryString()}
      </Box>
      {/* <Icon className="pl-1 text-white" as={DownArrowICO} height={12} width={18} /> */}
      <Image
        alt="Select Language"
        title="Select Language"
        src={DownArrowICO}
        className="ml-2 h-[8px] w-[14px]"
      />
    </Button>
  );

  // return (
  //   <Menu
  //     placement="top"
  //     trigger={({ ...triggerProps }) => {
  //       // const currentLocale = getLocale(locale);
  //       return (
  //         <Button
  //           variant="outline"
  //           className="justify-start border-none p-0 hover:bg-transparent hover:text-white"
  //           {...triggerProps}
  //         >
  //           <Image alt="Select Language" src={LanguageICO} className="mr-3" />
  //           {/* <ButtonText className="text-white text-base font-medium bg-transparent font-Overpass leading-[18px]">BE - English</ButtonText> */}
  //           <Box className="font-Overpass text-base font-medium leading-[18px] text-white">
  //             {/* BE - English */}
  //             {getLanguageCountryString()}
  //           </Box>
  //           {/* <Icon className="pl-1 text-white" as={DownArrowICO} height={12} width={18} /> */}
  //           <Image alt="Select Language" src={DownArrowICO} className="ml-2 h-[8px] w-[14px]" />
  //         </Button>
  //       );
  //     }}
  //   >
  //     {LOCALEs_LIST?.map((lng: LocaleInterface, indx: number) => {
  //       return (
  //         <MenuItem
  //           onPress={() => {
  //             setLocale(lng.locale);
  //           }}
  //           key={indx}
  //         >
  //           <MenuItemLabel>{lng.title}</MenuItemLabel>
  //         </MenuItem>
  //       );
  //     })}
  //   </Menu>
  // );
};

export default LanguageSelector;
