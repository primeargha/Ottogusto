import React from "react";

import { Pressable } from "@/components/ui/pressable";
import Image from "next/image";
import carimg from "@/assets/our-brands/2.png";
import { Box } from "@/components/ui/box";
import noImage from "@/assets/Frame.svg";

export default function ImageCardPopularBrands({
  data,
  handleBrandClick,
}: {
  data: any;
  handleBrandClick: (brand: string) => void;
}) {
  return (
    <Box className="">
      <Pressable onPress={() => handleBrandClick(data)} className="h-full w-full">
        <Box className="h-full w-full overflow-hidden">
          <Image
            className="duration-400 bg-rgb(247 247 243 / var(--tw-bg-opacity)) w-full cursor-pointer object-cover transition-transform [clip-path:polygon(0%_0,_100%_0,_100%_80%,70%_100%,0%_100%)] hover:scale-110 base:h-[94px] gtlg:h-[255px]"
            src={data.icon || noImage}
            alt="car Image"
            height={348}
            width={252}
            quality={90}
            priority
          />
        </Box>
        <Box className="flex items-start justify-start font-Overpass font-bold text-color-primary-main base:text-[18px] base:leading-5 gtlg:text-[24px] gtlg:leading-[26px]">
          {data.brand}
        </Box>
      </Pressable>
    </Box>
  );
}
