"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { OGButton } from "@/components/og-components/OGButton";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import { useBranding } from "@/contexts/BrandingContext";
import { safeNextImageSrc } from "@/utils/translationDisplayMode";

type Props = {};

const JoinTheCrew = (props: Props) => {
  const { getLabel } = useBranding();
  return (
    <Box className="inline-flex flex-col items-start justify-start gap-2.5 self-stretch bg-[var(--color-beige-800)] px-[38px] pt-[38px] base:pb-[38px] md:pb-[76px]">
      <Box className="flex flex-col items-start justify-start gap-12 self-stretch overflow-hidden">
        <Box className="flex flex-col items-start justify-start gap-3 self-stretch">
          <Box className="justify-start text-color-text-body body-bold-lg">
            {getLabel("aboutus_careers_title")}
          </Box>
          <Box className="flex flex-row flex-wrap items-start justify-start gap-10 self-stretch">
            <Image
              alt="Our Crew"
              className="w-full flex-1 object-contain object-center"
              src={safeNextImageSrc(getLabel("aboutus_jointhecrew_image"))}
              width={500}
              height={500}
            />
            <Box className="inline-flex flex-1 flex-col items-center justify-center gap-3 self-stretch md:items-start">
              <Box className="justify-center text-color-text-body body-regular-sm">
                {getLabel("aboutus_careers_jobs")}
              </Box>

              <OGButton
                type="primary"
                size="large"
                leftcomp={
                  <Image src={AdvancedSearchIcon} alt="Advanced Search" height={20} width={20} />
                }
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.open(getLabel("aboutus_careers_cta_link"));
                  }
                }}
              >
                {getLabel("aboutus_careers_cta_text")}
              </OGButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JoinTheCrew;
