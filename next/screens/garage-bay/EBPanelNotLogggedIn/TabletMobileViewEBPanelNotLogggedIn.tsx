import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
// import { Button } from "@/components/ui/button";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { ListFeatues } from "./DesktopEBPanelNotLogggedIn";
import { useAuthStore } from "@/stores/useAuthStore";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";

interface Props {
  isIpad?: boolean;
}

export default function TabletMobileViewEBPanelNotLogggedIn({ isIpad }: Props) {
  const { openModal, resetSearch, setIsOgSearch, setIsEB, setEbMode } = useSearchModalStore();
  const { getLabel } = useBranding();
  const { openLoginModal } = useAuthStore();

  return (
    <Box
      className={`flex h-[90vh] max-h-[900px] flex-col items-center justify-center gap-6 px-[24px] pb-[90px] pt-[75px] gtsm:px-[60px] ${isIpad ? "" : "gtlg:hidden"}`}
    >
      <Text className="text-center text-color-text-body body-bold-md">
        {getLabel("eb_not_logged_in_subtitle")}
      </Text>
      <Typography type="h1" className="text-center text-color-text-body">
        {getLabel("eb_not_logged_in_title")}
      </Typography>
      <Box className="flex w-[80vw] max-w-[50vw] items-start">
        <ListFeatues isMobileImport={true} />
      </Box>
      <Box
        data-icon="Right"
        data-size="Large"
        data-state="Default"
        data-type="Primary"
        className="inline-flex items-center justify-center gap-3 rounded bg-color-primary-main p-4"
      >
        <OGButton
          onClick={() => {
            // debugger;
            openLoginModal("/garage-bay");
          }}
          rightcomp={
            <Image
              src={"/assets/icons/arrow-right-02.svg"}
              width={24}
              height={24}
              alt="arrow-right"
              className=""
            />
          }
          className="flex cursor-pointer flex-row content-center items-center justify-center gap-0 p-0"
        >
          <Text className="text-color-text-on-dark body-regular-sm between-1024-1215:text-[16px]">
            {getLabel("eb_not_logged_in_btn_text")}
          </Text>
        </OGButton>
      </Box>
      <Box className="relative hidden h-[280px] w-[480px] gtsm:mx-auto gtsm:block">
        <Image
          src="/assets/eb-panel/eb-panel-right-frame.png"
          fill
          alt="eb panel"
          className="object-cover"
        />
      </Box>
    </Box>
  );
}
