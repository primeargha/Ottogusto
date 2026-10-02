"use client";

import { useState, useEffect, useRef } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useRouter, useParams } from "next/navigation";
import { testSavedCars } from "./SavedCarEBPanel";
import SavedCarsListView from "./SavedCarsListView";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import {
  carByIdQueryOptions,
  useAddUpdateMyCarsToEB,
  useGetCarByIdQuery,
  useGetMySavedCarsQuery,
} from "@/hooks/garage";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import { garageBayIcons, heroSection } from "@/constants";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useMmeStore } from "@/stores/useMmeStore";
import CarDetailView from "./CarDetailView";
import PreviousSearchCarousel from "../landing/previous-search-carousel";
import { useQueryClient } from "@tanstack/react-query";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { queryKeys } from "@/lib/query-keys";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { SavedCarInterface } from "@/types/globalTypes";
import MMESearchModal from "@/components/MMESearchModal";
import Typography from "@/components/og-components/Typography";

interface BlurOverlayProps {
  isVisible: boolean;
}

export default function MySavedCars() {
  const router = useRouter();
  const params = useParams();
  const { data: savedCarsData, refetch, isFetched } = useGetMySavedCarsQuery();
  const { getLabel } = useBranding();
  const { setSelectedCar, selectedCar, editcarId, setEditCarId } = useSelectedCarStore();
  const {
    generateMmeSearchData,
    setSearchMode,
    setMmeModalStep,
    openMmeModal,
    setIsEB: setIsEBMme,
    setEbMode: setEbModeMme,
    setSearchData,
    selectedSavedCarInLandingPage,
  } = useMmeStore();

  const queryClient = useQueryClient();
  const isFirstRender = useRef(true);
  // const carId = params?.id as string;

  // const sortedCars = savedCarsData?.data?.sort((a, b) => {
  //   // Prioritize `isFavorite` (true should come first)
  //   if (a.isFavorite !== b.isFavorite) {
  //     return b.isFavorite ? 1 : -1;
  //   }

  //   // Then prioritize `isNew` (true should come first)
  //   if (a.isNew !== b.isNew) {
  //     return b.isNew ? 1 : -1;
  //   }

  //   return 0; // Maintain original order for remaining records
  // });

  // Responsive breakpoints
  const isDesktop = useMedia("(min-width: 1024px)");
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const isMobile = useMedia("(max-width: 639px)");
  const [showBlurOverlay, setShowBlurOverlay] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if current URL contains garage-bay/my-saved-cars
  // TRAILING SLASH FIX
  const isGarageBayMySavedCars =
    typeof window !== "undefined" && window.location.pathname.includes("/garage-bay/my-saved-cars");

  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: () => {
      // TODO: show success message
      // closeModal();
      // resetSearch();
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const fetchLatestCarDataBySelectedCarId = async (id: string) => {
    const carData = await queryClient.fetchQuery(carByIdQueryOptions(id));
    setSelectedCar(carData.data);
  };

  // useEffect block for handling fadeout at last scroll logic
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollBottom: number = scrollTop + clientHeight;

      // Check if scrolled to bottom (with small tolerance for precision)
      const isAtBottom: boolean = scrollBottom >= scrollHeight - 5;

      setShowBlurOverlay(!isAtBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    // Initial check in case content doesn't fill container
    handleScroll();

    return (): void => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const defaultCarSelectionAfterRules = () => {
    const data: SavedCarInterface[] | any = savedCarsData?.data;
    // priority order (favorite → new → recently searched)

    // check for FAV car
    const favoriteCar = data.find((node) => {
      return node.isFavorite;
    });
    if (!!favoriteCar) {
      if (editcarId === null) {
        setSelectedCar(favoriteCar);
      }
      return;
    }

    // now check for newCar
    const newCar = data.find((node) => {
      return node.isFavorite;
    });
    if (!!newCar) {
      setSelectedCar(selectedCar || newCar);
      return;
    }
    if (editcarId === null) {
      setSelectedCar(savedCarsData?.data[0] || null);
    } else {
      setEditCarId(null);
    }
    //  setSelectedCar(savedCarsData.data[0]);
  };

  useEffect(() => {
    if (isFetched) {
      // if no saved cars
      if (savedCarsData?.data?.length === 0) {
        return;
      }

      // if just one car
      if (savedCarsData?.data?.length === 1) {
        setSelectedCar(savedCarsData?.data[0] || null);
        return;
      }

      if (selectedSavedCarInLandingPage) {
        setSelectedCar(selectedSavedCarInLandingPage as any);
        return;
      }

      defaultCarSelectionAfterRules();
    }
    // if (savedCarsData?.data?.length > 0 || selectedCar) {
    //   // setting the first car as selected car
    //   setSelectedCar(selectedCar || savedCarsData?.data[0]);
    //   // isFirstRender.current = false;
    // } else {
    //   setSelectedCar(null);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCarsData, isFetched, selectedSavedCarInLandingPage]);

  useEffect(() => {
    refetch();
    return () => {
      setSelectedCar(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carouselConfig = {
    itemsPerView: {
      desktop: 2, // Show 4 cards on desktop
      mobile: 2, // Show 1 card on mobile
    },

    isSavedCar: true,
    isHeroCart: false,
    isEngineBay: true,

    containerClassName: "h-auto w-full",
    cardClassName: "h-[176px] w-[580px] flex-shrink-0", // Custom card widths
    breakpoint: 992, // Custom breakpoint
  };

  // Handle car selection
  const handleSelectCar = (item: any, event?: React.MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation(); // Prevent unwanted propagation

    // if the car is new, then update the car to the EB
    if (item?.isNew) {
      updateMyCarsToEB({
        id: item?.id,
        isNew: false,
      });
    }

    if (isMobile) {
      if (params && typeof params["language-country"] === "string") {
        // router.push("/garage-bay/my-saved-cars");
        router.push(`${Routes.mySavedCars(params["language-country"])}/${item?.id}`);
      }
      // router.push(`/garage-bay/my-saved-cars/${item?.id}`); // TODO:Should be this
      // router.push(`/garage-bay/my-saved-car?id=${item?.id}`); // For now
    } else {
      // Perform desktop-specific action
      setSelectedCar(item);
    }
  };

  const handleEdit = async (car: any) => {
    // new start here ---------------------
    // it has car.makeModelTypeId: "00l06t00t5n001000"
    setSelectedCar(car);

    // 1. pre populate searchData in useMmeStore using makeModelTypeId

    // 2. Open the MME modal at step 1, searchMode = "manually"
    setSearchMode("manually");
    openMmeModal(1);

    // 3. Set isEB to true
    setIsEBMme(true);

    // 4. set isEBMode to "edit"
    setEbModeMme("edit");

    if (car.makeModelTypeId) {
      await generateMmeSearchData(car.makeModelTypeId);
    }

    // end here -------------------

    // const { getRouteLocaleString } = await import("@/helpers/UtilityHelper");
    // const { Routes } = await import("@/config/routes");
    // const sData = await formatEditSearchData(car);

    // setSearchData(sData);
    // debugger;
    // setNewSearchData({
    //   ...sData,
    //   id: car?.id,
    //   cc: searchData?.cc || "",
    //   fuel: searchData?.fuel || "",
    //   hp: searchData?.hp || "",
    //   body: car?.body || "",
    //   doors: car?.doors || "",
    //   variant: car?.variant || "",
    // });

    // router.push(`${getRouteLocaleString(Routes.search, params)}manually/?step=1&carId=${car?.id}`);
    // setIsEB(true);
    // setEbMode("edit");

    // openModal();
  };

  // useEffect(() => {
  // }, []);
  // Update selected car when URL param changes
  // useEffect(() => {
  //   if (carId) {
  //     setSelectedCarId(carId);
  //   }
  // }, [carId]);

  // If we're on the detail page on mobile
  // if (isMobile && carId) {
  //   return <CarDetailView car={selectedCar} />;
  // }

  if (savedCarsData?.data && savedCarsData?.data?.length <= 0) {
    const redirectRoute = getRouteLocaleString(Routes.garageBay, params);
    return router.push(redirectRoute);
  }
  const handlereturncar = (item: any) => {
    const truncatedData =
      item?.length > 0 &&
      item?.map((car: any) => ({
        ...car,
        name: car.name && car.name.length > 25 ? `${car.name.slice(0, 25)}...` : car.name,
      }));
    return truncatedData;
  };

  const refreshSavedCars = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
  };

  // Fadeout effect
  const BlurOverlayR: React.FC<BlurOverlayProps> = ({ isVisible }) => (
    <Box
      className={`pointer-events-none absolute z-50 rounded-b-md bg-gradient-to-t from-[--background-white] to-transparent transition-opacity duration-300 base:h-[317px] base:w-[75px] gtlg:bottom-0 gtlg:h-[165px] gtlg:min-w-[403px] ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitMask:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,1) 100%)",
        mask: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,1) 100%)",
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,255,0.3)",
      }}
    />
  );

  return (
    <Box className="relative h-full w-full pt-[110px] base:pb-[16px] gtsm:pb-[40px] lg:pt-[112px] gtlg:pr-[36px]">
      <Box
        className={`flex h-full flex-col overflow-hidden lg:h-full ${isTablet ? "px-[32px]" : "px-0"}`}
      >
        <Typography
          hasBack
          type="h1"
          className="mb-4 text-color-text-body typography-heading-01 base:pl-6 gtsm:pl-0 gtlg:pl-0"
        >
          {getLabel("my_saved_cars")}
        </Typography>

        {/* Updated layout with all required breakpoints, using 3xl instead of 2xl */}
        <Box
          className={`grid flex-1 grid-cols-1 gap-6 overflow-hidden base:px-4 base:pb-0 gtsm:grid-cols-1 gtsm:px-0 gtsm:pb-[100px] gtlg:flex gtlg:flex-row gtlg:px-0 gtlg:pb-0 ${
            isMobile && isGarageBayMySavedCars ? "" : ""
          }`}
        >
          {/* MARUTI MAKE CHANGES HERE ONLY... IN THIS BELOW DIV AND ITS CONTENTS */}
          <Box className="relative col-span-1 mb-[6px] w-full rounded-[8px] bg-color-background-none base:shadow-none gtsm:ml-1 gtlg:w-[402px]">
            <Box
              ref={scrollContainerRef as any}
              className="relative grid grid-cols-1 gap-4 overflow-x-hidden scrollbar-hide base:bg-color-background-l4 base:p-0 gtsm:grid-cols-1 gtsm:bg-transparent gtsm:p-6 gtlg:p-6"
            >
              {isTablet ? (
                <Box className="z-50 gap-5 bg-color-background-none">
                  <PreviousSearchCarousel
                    items={handlereturncar(savedCarsData?.data)}
                    config={carouselConfig}
                    handleSelectCar={handleSelectCar as any}
                    selectedCar={selectedCar}
                  />
                  {/* Add new car button */}
                  <Box
                    onClick={async () => {
                      setIsEBMme(true);
                      setEbModeMme("add");

                      // Open MME modal at step 1 with manual search mode
                      // clear searchData
                      setSearchData({
                        make: null,
                        model: null,
                        engine: null,
                      });
                      setSearchMode("manually");
                      openMmeModal(1);
                    }}
                    data-icon="Left"
                    data-size="Medium"
                    data-state="Default"
                    data-type="Primary"
                    className="inline-flex cursor-pointer items-center justify-center gap-3 self-stretch rounded bg-color-primary-main p-3"
                  >
                    <Box className="gap-x- flex flex-row items-center gap-x-2">
                      <Box className="relative h-5 w-5 justify-center">
                        <Image src={garageBayIcons.car} height={18} width={18} alt="star" />
                      </Box>
                      <Box className="justify-center text-color-text-on-dark body-regular-sm">
                        {getLabel("add_a_new_car")}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <SavedCarsListView
                    handleSelectCar={handleSelectCar}
                    selectedCar={selectedCar}
                    cars={handlereturncar(savedCarsData?.data)}
                  />
                </>
              )}
            </Box>
            <BlurOverlayR isVisible={showBlurOverlay} />
          </Box>

          {/* Car Detail Section (consist of Image and Details) - Only show on tablet/desktop */}
          {!isMobile && (
            <Box className="col-span-1 mx-1 mb-[6px] overflow-y-auto rounded-[8px] gtsm:col-span-1 gtlg:flex-1">
              {selectedCar ? (
                <CarDetailView car={selectedCar} handleEdit={handleEdit} />
              ) : (
                <Box className="flex h-64 items-center justify-center rounded-lg bg-gray-50 p-6">
                  <p className="text-gray-500">{getLabel("select_car")}</p>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <MMESearchModal refetch={refreshSavedCars} />
    </Box>
  );
}
