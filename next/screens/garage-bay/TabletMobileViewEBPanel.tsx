import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import { useRouter, useParams } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import MMESearchModal from "@/components/MMESearchModal";
import Typography from "@/components/og-components/Typography";

interface Props {
  isIpad?: boolean;
}

export default function TabletMobileViewEBPanel({ isIpad }: Props) {
  const { isAuthenticated, authUser } = useAuthStore();
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const { setIsEB, setEbMode, openMmeModal, setMmeModalStep, setSearchMode, setSearchData } =
    useMmeStore();

  return (
    <Box
      className={`flex min-h-[90vh] flex-col items-center justify-evenly gap-6 pb-[100px] pt-[75px] gtsm:px-[60px] ${isIpad ? "" : "gtlg:hidden"}`}
    >
      <Text className="text-center text-color-text-body body-bold-md">
        {getLabel("eb_logged_in_no_cars_title")}
      </Text>
      <Typography type="h1" className="text-center text-color-text-body">
        {getLabel("eb_logged_in_no_cars_subtitle", {
          //@ts-ignore
          username: authUser?.firstName ? `${authUser?.firstName}, ` : " ",
        })}
      </Typography>
      <Box className="flex w-fit flex-col gap-4 rounded-[8px] bg-color-background-none p-[24px] shadow-[0px_8px_60px_10px_rgba(0,0,0,0.15)]">
        <Image
          src="/assets/eb-panel/no-car.svg"
          height={60}
          width={60}
          alt="no car"
          className="mx-auto"
        />
        <Text className="text-color-text-body body-bold-md">
          {getLabel("eb_logged_in_add_car_card_title")}
        </Text>
        <Text className="text-color-text-body body-regular-sm">
          ✔ {getLabel("eb_logged_in_add_car_card_point1")}
        </Text>
        <Text className="text-color-text-body body-regular-sm">
          ✔ {getLabel("eb_logged_in_add_car_card_point2")}
        </Text>
        <Box className="min-h-[44px]">
          <OGButton
            className="flex w-fit flex-row items-center gap-2 self-center rounded-[4px] p-[16px] text-color-text-on-dark"
            onClick={async () => {
              setIsEB(true);
              setEbMode("add");

              // Open MME modal at step 1 with manual search mode
              // clear searchData
              setSearchData({
                make: null,
                model: null,
                engine: null,
              });
              setSearchMode("manually");
              openMmeModal();
              setMmeModalStep(1);
            }}
            leftcomp={
              <Image
                src="/assets/eb-panel/car-button.svg"
                height={20}
                width={20}
                alt="add saved car"
              />
            }
          >
            <Text className="text-color-text-on-dark body-regular-sm">
              {getLabel("eb_logged_in_add_car_button_text")}
            </Text>
          </OGButton>
        </Box>
      </Box>
      <Box className="relative hidden h-[280px] w-[480px] gtsm:mx-auto gtsm:block">
        <Image
          src="/assets/eb-panel/eb-panel-right-frame.png"
          fill
          alt="eb panel"
          className="object-cover"
        />
      </Box>
      {/* MME Search Modal */}
      <MMESearchModal />
    </Box>
  );
}
