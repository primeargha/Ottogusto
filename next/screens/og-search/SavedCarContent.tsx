import { useEffect } from "react";

import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useSliderStore } from "@/stores/useSliderStore";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import SavedCarsListView from "../garage-bay/SavedCarsListView";

export default function SavedCarContent() {
  const { isAuthenticated, authUser } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { getLabel } = useBranding();
  const {
    openModal,
    resetSearch,
    setIsOgSearch,
    setIsEB,
    setEbMode,
    fromRoute,
    setFromRoute,
    closeModal,
    setOgSearchModalContent,
  } = useSearchModalStore();
  const { resetSearch: resetNewSearch } = useNewSearchModalStore();

  const { data: savedCarsData } = useGetMySavedCarsQuery();
  const { mySavedCarsForSlider, setMySavedCarsForSlider } = useSliderStore();

  useEffect(() => {
    setMySavedCarsForSlider(savedCarsData?.data as any[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCarsData]);

  return (
    <>
      {mySavedCarsForSlider?.length > 0 ? (
        <Box className="relative h-full w-full overflow-hidden p-[12px]">
          <Box className="h-full w-full overflow-y-auto">
            <SavedCarsListView cars={mySavedCarsForSlider} isOGSearch={true} />
          </Box>
        </Box>
      ) : (
        <Box
          className={`flex h-[70vh] max-h-[900px] flex-col items-center justify-around gap-6 px-[24px] pb-[60px] gtsm:px-[60px]`}
        >
          <Box className="flex w-fit flex-col gap-4 rounded-[8px] bg-[--Brand-Pure-White] p-[24px] shadow-[0px_8px_60px_10px_rgba(0,0,0,0.15)]">
            <Image
              src="/assets/eb-panel/no-car.svg"
              height={60}
              width={60}
              alt="no car"
              className="mx-auto"
            />
            <Text className="font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body">
              {getLabel("eb_logged_in_add_car_card_title")}
            </Text>
            <Text className="font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body">
              ✔ {getLabel("eb_logged_in_add_car_card_point1")}
            </Text>
            <Text className="font-Overpass text-[14px] font-normal leading-[16px] text-color-text-body">
              ✔ {getLabel("eb_logged_in_add_car_card_point2")}
            </Text>
            <Box className="min-h-[44px]">
              <OGButton
                className="flex w-fit flex-row items-center gap-2 self-center rounded-[4px] p-[16px] text-[--Text-White]"
                onClick={async () => {
                  resetSearch();
                  resetNewSearch();

                  setIsEB(true);
                  setEbMode("add");
                  setFromRoute("garage-bay");
                  const { getRouteLocaleString } = await import("@/helpers/UtilityHelper");
                  const { Routes } = await import("@/config/routes");
                  router.push(`${getRouteLocaleString(Routes.search, params)}manually/?step=1`);
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
                <Text className="font-Overpass text-[18px] font-normal leading-[20px] text-[--Text-White] between-1024-1215:text-[16px]">
                  {getLabel("eb_logged_in_add_car_button_text")}
                </Text>
              </OGButton>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
