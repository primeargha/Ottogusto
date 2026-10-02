"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
// import Pic1 from "@/assets/about-us/pic1_cropped.jpg";
// import React from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { safeNextImageSrc } from "@/utils/translationDisplayMode";

type Props = {};

const OurStory = (props: Props) => {
  const { getLabel } = useBranding();
  return (
    <Box className="grid grid-cols-1 gap-6 base:px-[12px] base:pb-[12px] md:grid-cols-2 md:px-[38px] md:pb-[38px]">
      <Box className="md:col-span-2">
        <Box className="text-color-text-body body-bold-lg">{getLabel("aboutus_story_title")}</Box>
      </Box>
      <Box className="justify-center">
        <Box
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: getLabel("aboutus_story_desc") }}
          className="justify-center text-color-text-body body-regular-md"
        ></Box>
      </Box>
      <Box className="">
        <Box className="aspect-[16/9] h-auto w-full">
          <Image
            src={safeNextImageSrc(getLabel("aboutus_ourstory_image"))}
            alt="our team"
            width={500}
            height={500}
            className="h-full w-full object-contain object-center"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OurStory;
