"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import React from "react";

import CarIcoYellow from "./assets/car-ico-yellow.svg";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { usePathname } from "next/navigation";

type Props = {
  forceVisible?: boolean;
  noLeftNavSpace?: boolean;
  containerClassName?: string;
};

type WhyUsBlockPropType = {
  title: string;
  description: string;
  icon?: string;
};

export type { WhyUsBlockPropType };

const WhyUsBlock = (props: WhyUsBlockPropType) => {
  const { title, description, icon } = props;
  return (
    <Box className="">
      <Image
        src={icon || CarIcoYellow}
        height={24}
        width={24}
        alt=""
        className="pb-[24px] pt-[40px]"
      />
      <Box className="relative border-y border-[var(--color-chrome-800)] py-[12px] text-color-text-on-brand body-bold-md">
        {title}
      </Box>
      <Box className="relative justify-center pt-[24px] text-white body-regular-sm">
        {description}
        <br />
      </Box>
    </Box>
  );
};

export { WhyUsBlock };

const WhyUs_BrandValues = ({
  forceVisible = false,
  noLeftNavSpace = false,
  containerClassName,
}: Props) => {
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const ifLandingPage = useCheckForLandingPage();
  const pathname = usePathname();

  if (!ifLandingPage && !forceVisible) {
    // return <p>We're on the root path!</p>;
    return null;
  }

  if (!getClientFeatureFlag("homepage_ottogusto_way_flag") && !pathname?.includes("about-us")) {
    return null;
  }

  let contanerClass = `${isIpad ? "" : `${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[220px]" : "lg:ml-[36px]"}`} gtsm:mx-[38px] base:mx-3 lg:pl-0`;
  if (noLeftNavSpace) {
    contanerClass = `mx-[38px] lg:pl-0`;
  }
  return (
    <Box className={`mt-6 overflow-x-hidden pb-[60px] ${containerClassName}`}>
      <Box className={contanerClass}>
        <Box className="bg-color-primary-main pb-[51px] clip-top-left-bottom-right base:px-5 base:pt-[30px] md:px-[32.84px] md:pt-[65px]">
          <Box>
            <Box className="relative justify-start text-color-text-on-brand body-bold-lg">
              {getLabel("why_us_main_title")}
            </Box>
            <Box className="relative justify-center text-white body-medium-sm">
              {getLabel("why_us_main_desc")}
            </Box>
          </Box>
          <Box className="grid justify-between gap-6 lg:grid-cols-4 between-640-1080:grid-cols-2">
            <WhyUsBlock
              title={getLabel("why_us_1_title")}
              description={getLabel("why_us_1_desc")}
              icon="/assets/why-us/road.svg"
            />
            <WhyUsBlock
              title={getLabel("why_us_2_title")}
              description={getLabel("why_us_2_desc")}
              icon="/assets/why-us/checkmark-badge-02.svg"
            />
            <WhyUsBlock
              title={getLabel("why_us_3_title")}
              description={getLabel("why_us_3_desc")}
              icon="/assets/why-us/award-02.svg"
            />
            <WhyUsBlock
              title={getLabel("why_us_4_title")}
              description={getLabel("why_us_4_desc")}
              icon="/assets/why-us/stack-star.svg"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WhyUs_BrandValues;
