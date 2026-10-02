import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { loggedInUserOGSearchIcons } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { Pressable } from "@/components/ui/pressable";
import SavedCarContainer from "./SavedCarContainer";
import useRouter from "@unitools/router";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useParams } from "next/navigation";
import { Routes } from "@/config/routes";

interface SavedCar {
  make?: string;
  model?: string;
  type?: string;
  year?: number;
  VIN?: string;
  isFavorite?: boolean; // ✅ Boolean type
}
interface SavedCarContainerProps {
  savedCarsData: SavedCar[]; // ✅ Ensure it's an array
}

// ✅ Correct Function Declaration
export default function SearchBySavedCarView({ savedCarsData }: SavedCarContainerProps) {
  const { getLabel } = useBranding();
  const router = useRouter(); // Initialize router
  const params = useParams();
  const { openModal, resetSearch, setIsOgSearch, setIsEB, setEbMode, fromRoute, setFromRoute } =
    useSearchModalStore();

  if (!Array.isArray(savedCarsData)) {
    return <Box>{getLabel("error_invalid_data")}</Box>;
  }

  const sortedSavedCarsData = [...savedCarsData].sort(
    (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0),
  );

  const onclick = () => {
    // resetSearch();
    // setIsOgSearch(false);
    // setIsEB(true);
    //setEbMode("add");
    //openModal();
    // setFromRoute("garage-bay");
    // router.push(`/garage-bay`);
    router.push(getRouteLocaleString(Routes.garageBay, params));
  };

  return (
    <Box className="h-[218px] w-full rounded-lg bg-white gtsm:text-gray-500">
      {sortedSavedCarsData.length === 0 ? (
        <Box className="flex flex-col items-center text-center">
          <Image
            src={loggedInUserOGSearchIcons.noCar}
            height={60}
            width={60}
            alt="no car icon"
            className="2xl:h-11 2xl:w-11"
          />
          <Box className="text-center font-Overpass text-lg font-bold leading-tight text-color-primary-main 2xl:text-[14px]">
            {getLabel("og_search_no_car_for_search_heading")}
          </Box>
          <Box className="text-center font-Overpass text-base font-normal leading-[18px] text-color-primary-main 2xl:pt-1 2xl:text-[14px]">
            {getLabel("og_search_add_your_car_sub")}
          </Box>
          <Pressable
            onPress={onclick}
            className="mt-2 flex h-8 w-[140px] items-center justify-center gap-2.5 rounded border border-[--brand-piston-green] p-1.5 hover:bg-[--hover-green-color] 2xl:h-6"
          >
            <Box className="pb-4 font-Overpass text-base font-normal leading-[18px] text-color-primary-main 2xl:text-[14px]">
              {getLabel("add_your_car")}
            </Box>
          </Pressable>
        </Box>
      ) : (
        <SavedCarContainer />
      )}
    </Box>
  );
}
