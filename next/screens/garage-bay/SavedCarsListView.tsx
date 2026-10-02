"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import { carouselImages, garageBayIcons, heroSection } from "@/constants";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useMmeStore } from "@/stores/useMmeStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { OGButton } from "@/components/og-components/OGButton";
import QuickSearchIcon from "@/assets/search/quick-search.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import StarFavourite from "@/components/icons/StarFavourite";
import { Text } from "@/components/ui/text";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { OGSearchMobileSavedCar } from "./OGSearchMobileSavedCar";
import { useRouter, useParams } from "next/navigation";
import MMESearchModal from "@/components/MMESearchModal";
import Typography from "@/components/og-components/Typography";
interface SavedCarsListViewProps {
  isOGSearch?: boolean;
  config?: {
    minWidth?: string;
    maxWidth?: string;
  };
  handleSelectCar?: (item: any, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; // Accept function as a prop
  selectedCar?: any | null;
  cars?: any[] | null;
}

const SavedCarsListView: React.FC<SavedCarsListViewProps> = ({
  isOGSearch = false,
  config = { minWidth: "390px", maxWidth: "390px" }, // ✅ Set default config object here
  handleSelectCar, // Use the function from props
  selectedCar,
  cars,
}) => {
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { data: savedCarsData } = useGetMySavedCarsQuery();
  const { resetSearch: resetNewSearch } = useNewSearchModalStore();
  const { setSearchMode, openMmeModal, setMmeModalStep, setIsEB, setEbMode, setSearchData } =
    useMmeStore();

  // Function to refresh saved cars list by invalidating React Query cache
  const refreshSavedCars = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
  };

  return (
    <>
      {!isOGSearch &&
        cars &&
        cars.length > 0 &&
        cars?.map((item: any, index: any) => (
          <Box
            key={index}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
              handleSelectCar && handleSelectCar(item, event)
            } // Pass event as the second argument
            data-property-1="Pers"
            className={`relative inline-flex w-full cursor-pointer flex-col items-start justify-start self-stretch rounded-lg base:h-auto gtlg:h-auto gtlg:min-h-[150px] min-w-[${config?.minWidth}] max-w-[${config?.maxWidth}] p-3 outline outline-1 outline-offset-[-1px] outline-color-primary-main ${
              isOGSearch
                ? "bg-color-primary-main"
                : selectedCar?.id === item?.id
                  ? "bg-color-primary-main"
                  : "bg-color-none hover:bg-color-hover-action-primary"
            }`}
          >
            {item?.isNew && (
              <Box
                data-property-1="Default"
                className="absolute -top-3 right-3 inline-flex items-center justify-start rounded-lg bg-color-primary-main p-2"
              >
                <Box className="justify-start text-color-text-on-dark body-regular-sm">
                  {getLabel("new")}
                </Box>
              </Box>
            )}
            <Box className="flex h-full flex-col items-start justify-start gap-4 self-stretch">
              <Box className="inline-flex items-start justify-start gap-[5px] self-stretch">
                <Box className="inline-flex flex-row items-center justify-start gap-3">
                  {item?.picture && !isOGSearch && (
                    <Box className="relative flex h-[114px] w-[120px] items-center justify-center overflow-hidden">
                      {/* Clipping Path */}
                      <Box className="absolute inset-0 bg-color-background-none [clip-path:polygon(20%_0,_100%_0,_100%_60%,_50%_100%,_0_100%,_0_10%)]" />

                      {/* Image Container */}
                      <Box className="relative h-full w-full overflow-hidden [clip-path:polygon(20%_0,_100%_0,_100%_70%,_60%_100%,_0_100%,_0_10%)]">
                        <Image
                          src={item?.picture ? item?.picture : carouselImages.b}
                          width={100}
                          height={100}
                          alt="Car"
                          className="h-full w-full object-cover"
                        />
                      </Box>
                    </Box>
                  )}
                  <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
                    <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
                      <Typography
                        type="h3"
                        className={`justify-start overflow-hidden whitespace-normal ${
                          selectedCar?.id === item?.id
                            ? "text-color-text-on-dark"
                            : "text-color-text-body"
                        }`}
                      >
                        {item.name ?? (
                          <>
                            {item.brandName}&nbsp;{item.modelName}
                          </>
                        )}
                      </Typography>
                      {item.isFavorite && (
                        <Box className="flex-shrink: 0 flex items-center justify-center rounded bg-color-secondary-main p-1">
                          <Image src={garageBayIcons.star} height={18} width={18} alt="star" />
                        </Box>
                      )}
                    </Box>
                    <Box
                      className={`justify-start self-start body-regular-md ${
                        selectedCar?.id === item?.id
                          ? "text-color-text-on-dark"
                          : "text-color-text-body"
                      }`}
                    >
                      {item?.name ? (
                        <>
                          {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
                        </>
                      ) : (
                        item?.typeName
                      )}
                    </Box>
                    {item?.vin && (
                      <Box className="flex flex-row flex-wrap items-center space-y-2">
                        {/* <Box className="inline-flex flex-row items-center justify-start self-stretch">
                        <Box className="flex flex-row items-center">
                          <span
                            className={`body-regular-sm ${
                              selectedCar?.id === item?.id
                                ? "text-color-text-on-dark"
                                : "text-color-text-body"
                            }`}
                          >
                            {getLabel("model_year")}&nbsp;
                          </span>
                          <span
                            className={`uppercase body-bold-sm ${
                              selectedCar?.id === item?.id
                                ? "text-color-text-on-dark"
                                : "text-color-text-body"
                            }`}
                          >
                            {item?.year}
                          </span>
                        </Box>
                      </Box> */}
                        {item?.vin && (
                          <Box className="inline-flex flex-row items-center justify-start self-stretch">
                            <Box className="flex flex-row items-center">
                              <span
                                className={`body-regular-sm ${
                                  selectedCar?.id === item?.id
                                    ? "text-color-text-on-dark"
                                    : "text-color-text-body"
                                }`}
                              >
                                {getLabel("vin")}:&nbsp;
                              </span>
                              <span
                                className={`uppercase body-bold-sm ${
                                  selectedCar?.id === item?.id
                                    ? "text-color-text-on-dark"
                                    : "text-color-text-body"
                                }`}
                              >
                                {item?.vin || ""}
                              </span>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      {isOGSearch && (
        <Box className="flex h-full w-full flex-col gap-[24px] pt-3">
          {isOGSearch &&
            cars &&
            cars.length > 0 &&
            cars?.map((item: any, index: any) => (
              <OGSearchMobileSavedCar
                key={index}
                item={item}
                isOGSearch={isOGSearch}
                onQuickSearch={() => {}} // Add empty function to satisfy prop requirement
              />
            ))}
        </Box>
      )}
      {!isOGSearch && (
        <Box
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
            openMmeModal(1);
          }}
          data-icon="Left"
          data-size="Medium"
          data-state="Default"
          data-type="Primary"
          className="inline-flex h-[40px] cursor-pointer items-center justify-center gap-3 self-stretch rounded bg-color-primary-main p-3"
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
      )}

      {/* MME Search Modal */}
      <MMESearchModal refetch={refreshSavedCars} />
    </>
  );
};

export default SavedCarsListView;
