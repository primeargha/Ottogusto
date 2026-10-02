"use client";

import { PreviousSearchDataInterface } from "@/stores/useMmeStore";
import PreviousSearchCarousel from "./previous-search-carousel";
import { usePathname } from "next/navigation";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { useEffect, useState } from "react";
import { useMmeStore } from "@/stores/useMmeStore";

export default function PreviousSearchContainer({
  isMobile = false,
  isEBPanel = false,
}: {
  isMobile?: boolean;
  isEBPanel?: boolean;
}) {
  // const { previousSearches } = useSearchModalStore();
  const { previousSearches, generateMmeSearchData, searchData } = useMmeStore();
  const { selectedCar, setSelectedCar } = useSelectedCarStore();

  const [filteredData, setFilteredData] = useState<PreviousSearchDataInterface[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      try {
        if (!previousSearches) return;

        let formatedData: PreviousSearchDataInterface[] = [];

        if (isEBPanel) {
          // For Engine Bay Panel: Filter by selectedCar.makeModelTypeId
          if (!selectedCar) return; // Need selectedCar for EB panel filtering

          const selectedCarMakeModelTypeId = (selectedCar as any)?.makeModelTypeId;

          formatedData = previousSearches.filter((searchItem) => {
            const matches = searchItem.makeModelTypeId === selectedCarMakeModelTypeId;

            return matches;
          });
        } else {
          // For regular landing page: Show all previous searches
          formatedData = previousSearches;
        }
        setFilteredData(formatedData);
      } catch (error) {
        console.error("Error filtering previous searches:", error);
      }
    })();
  }, [selectedCar, previousSearches, isEBPanel]); // Added isEBPanel to dependencies

  const containerClass = isMobile
    ? "bg-[var(--color-beige-800)] min-h-[342px}] rounded-lg pr-3 pl-4 relative"
    : "bg-[var(--color-beige-800)] h-auto min-h-[222px}] pt-[20px] rounded-lg pr-3 pl-4 relative  shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mx-[4px] mb-[8px]";
  const carouselConfig = {
    isPreviousSearch: true,
    isEngineBay: true,
    itemsPerView: {
      desktop: 5,
      mobile: 2,
    },
    containerClassName: containerClass,
    cardClassName: "w-[251px] h-full flex-shrink-0", // Fixed width instead of percentage
    breakpoint: 992,
  };

  return (
    <>
      {filteredData.length > 0 && (
        <PreviousSearchCarousel items={filteredData} config={carouselConfig} />
      )}
    </>
  );
}
