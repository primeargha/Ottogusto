import { useEffect, useState } from "react";

import { useBranding } from "@/contexts/BrandingContext";
import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useMmeStore } from "@/stores/useMmeStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useSliderStore } from "@/stores/useSliderStore";
import { useRouter, useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import PreviousSearchCarousel from "./previous-search-carousel";
import { GarageItem } from "@/type";

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

export default function SavedCarHeroContainer() {
  const { getLabel } = useBranding();
  const { data: savedCarsDataFromQuery, refetch } = useGetMySavedCarsQuery();
  const [sortedOnce, setSortedOnce] = useState<GarageItem[]>([]);
  const router = useRouter();
  const params = useParams();

  // 📦 On initial mount only
  useEffect(() => {
    if (Array.isArray(savedCarsDataFromQuery?.data)) {
      const sorted = [...savedCarsDataFromQuery.data].sort(
        (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0),
      );
      setSortedOnce(sorted);
    }
  }, [savedCarsDataFromQuery?.data]);

  // ✅ run only once on mount
  const dataWithLiveProps = sortedOnce?.map((item) => {
    const updated = savedCarsDataFromQuery?.data?.find((d) => d.id === item.id);
    return {
      ...item,
      ...updated, // ✅ merge latest props, preserve original order
    };
  });

  const carouselConfig = {
    itemsPerView: {
      desktop: 2, // Show 4 cards on desktop
      mobile: 2, // Show 1 card on mobile
    },

    isSavedCar: true,
    isHeroCart: true,

    containerClassName:
      "inline-flex mt-[35px] h-[255px] w-[520px] flex-col items-start justify-center gap-2.5 rounded-lg bg-color-background-l3 py-2 shadow-[0px_2px_6px_0px_rgba(20,20,43,0.06)]",
    cardClassName: "bg-[--background-white] z-10 h-auto w-[500px] flex-shrink-0", // Custom card widths
    breakpoint: 992, // Custom breakpoint
  };

  const { resetSearch, setIsOgSearch, setFromRoute, getMakeModelTypeId } = useSearchModalStore();
  const { openMmeModal, setMmeModalStep, setSearchMode } = useMmeStore();
  return (
    <Box className="relative">
      {dataWithLiveProps.length > 1 && (
        // <></>
        <Box className="z-1 absolute left-[-15px] right-auto top-[40px] h-[241px] w-[553px] rounded-lg bg-color-background-l1 opacity-80 shadow-md"></Box>
      )}
      <PreviousSearchCarousel items={dataWithLiveProps} config={carouselConfig} />

      <Box className="bottom-[60px] z-10 h-[2px] w-[520px] bg-[var(--color-beige-800)] drop-shadow-md"></Box>

      <Box className="bottom-[54px] z-10 mt-[-2px] h-[58px] w-[520px] cursor-pointer rounded-b-lg bg-color-background-l1 hover:bg-[--card-hover-green]">
        <Box
          className="z-10 mt-4 shrink cursor-pointer px-[18px] font-Overpass text-lg font-normal leading-tight text-color-primary-main"
          onClick={() => {
            setSearchMode("manually");
            //
            openMmeModal();

            // Then override to set step to 1
            setMmeModalStep(1);

            // Keep existing legacy code for compatibility
            setIsOgSearch(false);
            setFromRoute("saved-cars");
          }}
        >
          {getLabel("search_for_new_car")}
        </Box>
      </Box>
    </Box>
  );
}
