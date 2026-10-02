"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import React from "react";
import QLeft from "@/assets/about-us/QuoteStart.png";
import { useBranding } from "@/contexts/BrandingContext";

type Props = {};

const MissionNVision = (props: Props) => {
  const { getLabel } = useBranding();
  return (
    <Box className="grid grid-cols-1 gap-[40px] bg-[var(--color-beige-800)] base:p-[12px] md:grid-cols-2 md:p-[38px]">
      <Box className="flex-1 basis-1/2 flex-col items-center justify-start gap-12 overflow-hidden">
        <Box className="flex flex-col items-start justify-start gap-3 self-stretch">
          <Box className="justify-start self-stretch text-center text-color-text-body body-bold-lg">
            {getLabel("aboutus_mission_title")}
          </Box>
          <Box className="flex flex-row items-start justify-start gap-10 self-stretch">
            <Box className="flex flex-1 flex-row justify-center text-center font-Overpass text-[18px] font-bold leading-5 text-emerald-950 lg:font-Anton lg:text-3xl lg:font-normal lg:leading-10">
              <Image src={QLeft} className="h-[48px] w-[48px]" alt='"' />
              <Box>{getLabel("aboutus_mission_desc")}</Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 basis-1/2 flex-col items-start justify-start gap-2.5 self-stretch">
        <Box className="flex flex-1 flex-col items-start justify-start gap-12 self-stretch overflow-hidden">
          <Box className="flex flex-1 flex-col items-start justify-start gap-3 self-stretch">
            <Box className="justify-start self-stretch text-center text-color-text-body body-bold-lg">
              {getLabel("aboutus_vision_title")}
            </Box>
            <Box className="flex flex-1 flex-row items-end justify-end gap-10 self-stretch">
              <Box className="flex flex-1 flex-row justify-center self-stretch text-center align-middle font-Overpass text-[18px] font-bold leading-5 text-emerald-950 lg:font-Anton lg:text-3xl lg:font-normal lg:leading-10">
                <Box>{getLabel("aboutus_vision_desc")}</Box>
                <Image
                  src={QLeft}
                  className="float-end h-[48px] w-[48px] -rotate-180 self-end"
                  alt='"'
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MissionNVision;
