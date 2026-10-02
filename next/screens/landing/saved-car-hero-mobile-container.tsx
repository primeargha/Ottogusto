import { useBranding } from "@/contexts/BrandingContext";
import PreviousSearchCarousel from "./previous-search-carousel";
import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useSliderStore } from "@/stores/useSliderStore";
import { useEffect, useState } from "react";
// import { OGButton } from "@/components/og-components/OGButton";
import { useRouter, useParams } from "next/navigation";
// import { getRouteLocaleString } from "@/helpers/UtilityHelper";
// import { Routes } from "@/config/routes";
import { useMmeStore } from "@/stores/useMmeStore";
import { G } from "react-native-svg";

interface SavedCar {
  make?: string;
  model?: string;
  type?: string;
  year?: number;
  vin?: string;
  isFavorite?: boolean; // ✅ Boolean type
}

interface SavedCarHeroContainerProps {
  savedCarsData: SavedCar[]; // ✅ Ensure it's an array
}

export default function SavedCarHeroMobileContainer() {
  const { getLabel } = useBranding();
  const { resetSearch, setIsOgSearch, setFromRoute, getMakeModelTypeId } = useSearchModalStore();
  const { openMmeModal, setMmeModalStep, setSearchMode } = useMmeStore();
  const router = useRouter();
  const params = useParams();
  const { data: savedCarsDataFromQuery } = useGetMySavedCarsQuery();
  const [savedCarsData, setsavedCarsData] = useState(
    savedCarsDataFromQuery?.data.sort((node: any, nodeB: any) => {
      // ClientSide sort for maintaing order of saved cars
      // Note: Don't use ClientSide sort in EngineBay
      return node.id.localeCompare(nodeB.id);
    }),
  );
  const { mySavedCarsForSlider, setMySavedCarsForSlider } = useSliderStore();

  // ClientSide sort for maintaing order of saved cars
  // Note: Don't use ClientSide sort in EngineBay
  useEffect(() => {
    const updatedData: any = savedCarsDataFromQuery?.data.sort((node: any, nodeB: any) => {
      return node.id.localeCompare(nodeB.id);
    });
    setMySavedCarsForSlider(updatedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCarsDataFromQuery]);

  if (!Array.isArray(mySavedCarsForSlider)) {
    console.error("Error: savedCarsData is not an array", mySavedCarsForSlider);
    return <Box>{getLabel("error_invalid_data")}</Box>;
  }

  // const sortedSavedCarsData = [...savedCarsData].sort(
  //   (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0),
  // );

  const carouselConfig = {
    itemsPerView: {
      desktop: 2, // Show 4 cards on desktop
      mobile: 2, // Show 1 card on mobile
    },

    isSavedCar: true,
    isHeroCart: true,

    containerClassName:
      "inline-flex w-[255px] h-[210px] flex-col items-center justify-center gap-2.5 rounded-lg bg-[var(--color-beige-800)] py-2 shadow-[0px_2px_6px_0px_rgba(20,20,43,0.06)]",
    cardClassName: "bg-[var(--color-beige-800)] h-auto w-[240px] flex-shrink-0", // Custom card widths
    breakpoint: 992, // Custom breakpoint
  };
  return (
    <Box className="relative">
      {/* Background transparent card UI */}
      {mySavedCarsForSlider.length > 1 && (
        <Box className="z-1 absolute left-[-10px] right-[0px] top-[15px] h-[151px] w-[275px] items-center justify-center rounded-lg bg-color-background-l1 opacity-80 shadow-md"></Box>
      )}

      <Box className="w-fit gap-3">
        <PreviousSearchCarousel items={mySavedCarsForSlider} config={carouselConfig} />

        {/* <Box className="bottom-[40px] z-10 h-[2px] w-[80%] bg-[var(--color-beige-800)] drop-shadow-md"></Box> */}
        <Box className="top-[-55px]">
          <Box className="z-10 h-[2px] w-full bg-[var(--color-beige-800)] drop-shadow-md"></Box>
          {/* <OGButton
            type="outlined"
            className="flex w-full justify-start border-0"
            onClick={() => {
              resetSearch();
              setIsOgSearch(false);
              setFromRoute("saved-cars");
              router.push(getRouteLocaleString(Routes.search, params));
            }}
          >
            {getLabel("search_for_new_car")}
          </OGButton> */}

          <div
            className="mt-1 flex max-h-[38px] min-h-[37px] w-full items-center justify-start border-0 bg-transparent px-3 font-[Overpass] font-normal leading-5 text-[--Primary-Colors-Main]"
            // onClick={() => {
            //   resetSearch();
            //   setIsOgSearch(false);
            //   setFromRoute("saved-cars");
            //   // Navigate to search page using getRouteLocaleString
            //   router.push(getRouteLocaleString(Routes.search, params));
            // }}
            onClick={() => {
              // Set search mode to manually first
              setSearchMode("manually");
              //
              // Open MME modal (this sets step to 2 by default)
              openMmeModal();

              // Then override to set step to 1
              setMmeModalStep(1);

              // Keep existing legacy code for compatibility
              setIsOgSearch(false);
              setFromRoute("saved-cars");
            }}
          >
            {getLabel("search_for_new_car")}
          </div>
        </Box>
      </Box>
    </Box>
  );
}
