"use client";

import { Box } from "@/components/ui/box";
// import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { useMmeStore } from "@/stores/useMmeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { useRouter, useParams } from "next/navigation";
import MMESearchModal from "@/components/MMESearchModal";
import Typography from "@/components/og-components/Typography";

export default function DesktopViewEBPanel() {
  const { isAuthenticated, authUser } = useAuthStore();
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const { setIsEB, setEbMode, openMmeModal, setMmeModalStep, setSearchMode, setSearchData } =
    useMmeStore();

  return (
    <Box className="hidden items-center gtlg:flex gtlg:flex-row">
      {/* left section - now spans 2/3 */}
      <Box className="h-full gtlg:w-8/12 3xl:w-8/12">
        <Box className="flex flex-col gap-2">
          <Text className="text-color-text-body body-bold-md">
            {getLabel("eb_logged_in_no_cars_title", {
              //@ts-ignore
              username: authUser?.firstName ? `${authUser?.firstName}` : "",
            })}
          </Text>
          <Typography type="h1" className="text-color-text-body">
            {/* {authUser?.firstName ? `${authUser?.firstName}, ` : ""}Your Engine Bay, Your Way! */}
            {getLabel("eb_logged_in_no_cars_subtitle", {
              //@ts-ignore
              username: authUser?.firstName ? `${authUser?.firstName}` : "",
            })}
          </Typography>
          <Box className="flex w-fit flex-col gap-2 rounded-[8px] bg-color-background-none p-[24px] shadow-[0px_8px_60px_10px_rgba(0,0,0,0.15)] lg:mt-[20px]">
            <Image src="/assets/eb-panel/no-car.svg" height={60} width={60} alt="no car" />
            <Text className="text-color-text-body body-bold-lg">
              {getLabel("eb_logged_in_add_car_card_title")}
            </Text>
            <Text className="text-color-text-body body-regular-sm">
              ✔ {getLabel("eb_logged_in_add_car_card_point1")}
            </Text>
            <Text className="text-color-text-body body-regular-sm">
              ✔ {getLabel("eb_logged_in_add_car_card_point2")}
            </Text>

            <OGButton
              type="primary"
              size="large"
              onClick={() => {
                // Set Engine Bay state
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
              {getLabel("eb_logged_in_add_car_button_text")}
            </OGButton>
          </Box>
        </Box>
      </Box>
      {/* right section - now spans 1/3 */}
      <Box className="relative h-[90vh] w-4/12 min-w-[397px] pt-[150px] md:pt-[140px]">
        <Image
          src="/assets/eb-panel/eb-panel-right-frame.png"
          alt="eb-panel-hero-image"
          fill
          className="mt-[45px] object-contain"
          // className="mt-[-100px] object-contain gtlg:object-contain 2xl:object-cover"
        />
      </Box>

      {/* MME Search Modal */}
      <MMESearchModal />
    </Box>
  );
}
