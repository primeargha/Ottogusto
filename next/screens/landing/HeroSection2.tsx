"use client";
import OGLayoutXL from "@/components/og-components/OGLayoutXL";
import React from "react";
import HeroCard2 from "./heroCard2";
import { Box } from "@/components/ui/box";

type HeroSection2Props = {
  isMmeFeatureEnabled: boolean;
};

export const HeroSection2 = ({ isMmeFeatureEnabled }: HeroSection2Props) => {
  return (
    <Box className="flex w-full bg-color-border-default base:p-0 gtlg:p-0">
      <OGLayoutXL className="flex w-full flex-col gap-6">
        {/* will need authentication case chnages here */}
        <HeroCard2 isMmeFeatureEnabled={isMmeFeatureEnabled} />
        {/* <TabsSection />
        <Box className="flex max-h-[81px] min-h-20 w-full items-center justify-center rounded-md border">
          Tabs section
        </Box> */}
      </OGLayoutXL>
    </Box>
  );
};
