import { useBranding } from "@/contexts/BrandingContext";
import PreviousSearchCarousel from "../landing/previous-search-carousel";
import { Box } from "@/components/ui/box";
import { useSliderStore } from "@/stores/useSliderStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useEffect, useState } from "react";

interface SavedCar {
  make?: string;
  model?: string;
  type?: string;
  year?: number;
  VIN?: string;
  isFavorite?: boolean;
}

interface SavedCarContainerProps {
  savedCarsData: SavedCar[];
}

export default function SavedCarContainer() {
  const { getLabel } = useBranding();
  const { data: savedCarsData, refetch: savedCarsRefetch } = useGetMySavedCarsQuery();
  const { mySavedCarsForSlider, setMySavedCarsForSlider } = useSliderStore();
  const [cardata, setcardata] = useState([]);

  useEffect(() => {
    if (savedCarsData?.data) {
      const truncatedData: any =
        savedCarsData?.data?.length > 0 &&
        savedCarsData.data?.map((car) => ({
          ...car,
          name: car.name && car.name.length > 25 ? `${car.name.slice(0, 25)}...` : car.name,
        }));
      setMySavedCarsForSlider(savedCarsData?.data);
      setcardata(truncatedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCarsData]);

  useEffect(() => {
    savedCarsRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!Array.isArray(mySavedCarsForSlider)) {
    console.error("Error: savedCarsData is not an array", mySavedCarsForSlider);
    return <Box>{getLabel("error_invalid_data")}</Box>;
  }

  const carouselConfig = {
    itemsPerView: {
      desktop: 2,
      mobile: 2,
    },

    isSavedCar: true,

    containerClassName: "h-auto w-full",
    cardClassName: "h-auto lg:w-[400px] between-992-1024:w-[360px] md:w-[330px] flex-shrink-0",
    breakpoint: 992,
  };

  return (
    <>
      <PreviousSearchCarousel items={cardata} config={carouselConfig} onMarkFavorite={(a) => {}} />
    </>
  );
}
