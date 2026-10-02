"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { Box } from "@/components/ui/box";
import { carouselImages } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { useRouter } from "next/navigation";
import { Pressable } from "@/components/ui/pressable";
import Image from "next/image";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { Text } from "@/components/ui/text";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useMmeStore } from "@/stores/useMmeStore";
import { getImageUrl } from "@/utils/imageUtils";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";
import { useBrands } from "@/contexts/BrandsContext";

type Props = {
  isForceVisible: boolean;
};

const OurBrandsYourTrust = ({ isForceVisible }: Props) => {
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const { setSearchData } = useMmeStore();
  const { updateFilters } = useUrlParams();
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  const { savedCarsData } = useSavedCarsStore();

  const { brands: brandsData } = useBrands();
  const [invalidImages, setInvalidImages] = useState<Set<string>>(new Set());
  const ifLandingPage = useCheckForLandingPage();
  const params = useParams();
  const handleImageError = (id: string) => {
    setInvalidImages((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(id);
      return updatedSet;
    });
  };

  // Function to merge saved cars with brands
  const mergeBrands = useCallback(() => {
    if (!savedCarsData || !brands) return;

    const savedCarIds = new Set(savedCarsData?.map((car) => car.id));

    // Filter out brands that are already in saved cars
    const filteredBrands = brands.filter((brand) => !savedCarIds.has(brand.id));

    // Format saved cars to include brand names
    const formattedSavedCars = savedCarsData?.map((car) => {
      const matchingBrand = brands.find((brand) => brand.id === car.id);
      return {
        ...car,
        brand: matchingBrand ? matchingBrand.brand : car.name, // Assign brand name if found
        icon: car.picture || (matchingBrand ? matchingBrand.icon : ""), // Use car's picture, fallback to brand icon
      };
    });

    const updatedMergedData = [...formattedSavedCars, ...filteredBrands];
    setMergedData(updatedMergedData);
  }, [savedCarsData, brands]); // Re-run if savedCarsData or brands change

  useEffect(() => {
    if (brandsData && brandsData?.length > 0) {
      const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
        id: brand.id,
        brand: brand.brand ?? "",
        sortIdx: brand.sortIdx,
        icon: getImageUrl(brand?.image),
      }));
      setBrands(results);
    } else {
      setBrands([]);
    }
  }, [brandsData]);

  // Re-run merging whenever brands or savedCarsData update
  useEffect(() => {
    mergeBrands();
  }, [mergeBrands]);

  const brandsnavigation = (id?: number, item?: any) => {
    router.push(getRouteLocaleString(Routes.allbrands, params));
  };

  const handleBrandClick = (brand: any) => {
    const categoryCatalogUrl = getRouteLocaleString(Routes.categorySelection, params);
    const url = `${categoryCatalogUrl}?makeModelTypeId=${brand?.id}`;
    router.push(url);
  };

  if (!ifLandingPage && !isForceVisible) {
    return null;
  }

  return (
    <Box className="overflow-x-hidden bg-color-background-default">
      <Box
        className={`${isIpad ? "" : `${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[200px]" : "lg:ml-[36px]"}`} mx-[38px] lg:pl-0`}
      >
        <Box className="inline-flex h-[650px] w-full flex-col items-start justify-start gap-2.5 bg-transparent py-[55px]">
          <Box className="relative flex h-auto w-full items-center gap-12">
            <Box className="inline-flex h-auto w-full flex-col items-center justify-start gap-3">
              <Typography
                type="h2"
                className="relative justify-start text-color-text-body typography-heading-02"
              >
                {getLabel("our_brands_your_trust")}
              </Typography>
              {/*  */}
              <Box className="relative justify-center text-color-primary-main body-regular-md">
                {getLabel("our_brands_your_trust_desc")}
              </Box>
            </Box>

            {/* Brands Container - Ensures Inline Display */}
            <Box className="flex max-h-[390px] min-h-[385px] w-full flex-wrap gap-5 base:overflow-x-scroll gtsm:overflow-x-scroll gtlg:overflow-x-hidden">
              {brands.slice(0, 6)?.map((item, index) => {
                if ((item?.icon || "") === "") {
                  return <React.Fragment key={index}></React.Fragment>;
                }
                return (
                  <Box
                    key={index}
                    className="relative flex h-[385px] w-[252px] flex-col overflow-hidden"
                  >
                    <Pressable onPress={() => handleBrandClick(item)} className="h-full w-full">
                      <Box className="h-full w-full overflow-hidden">
                        <Image
                          className={`duration-400 bg-rgb(247 247 243 / var(--tw-bg-opacity)) h-[348px] w-[252px] cursor-pointer object-cover transition-transform hover:scale-110 ${index === 0 ? "[clip-path:polygon(15%_0,_100%_0,_100%_100%,_0_100%,_0_10%)]" : ""} ${index === mergedData.filter((item) => !invalidImages.has(item.id)).slice(0, 6).length - 1 || mergedData.filter((item) => !invalidImages.has(item.id)).slice(0, 6).length > 6 ? "[clip-path:polygon(0%_0,_100%_0,_100%_80%,70%_100%,0%_100%)]" : ""}`}
                          src={item?.icon || ""}
                          alt={item?.brand || ""}
                          height={348}
                          width={252}
                          quality={90}
                          priority
                        />
                      </Box>
                      <Box className="items-start justify-start capitalize text-color-primary-main body-bold-lg">
                        {item?.brand?.toLowerCase() || ""}
                      </Box>
                    </Pressable>
                  </Box>
                );
              })}
            </Box>

            {/* Visible ONLY on `md` (medium) and above */}
            {getClientFeatureFlag("view_all_brands_page_flag") && (
              <Box className="absolute right-0 top-[19px] hidden h-[18px] w-[174px] flex-col items-end justify-center gap-3 pr-[29px] md:block">
                <Pressable
                  onPress={() => brandsnavigation()}
                  className="relative cursor-pointer justify-start text-right text-color-primary-main underline body-regular-sm"
                >
                  <Text className="text-color-primary-main body-regular-sm">
                    {getLabel("view_all_brands")}
                  </Text>
                </Pressable>
              </Box>
            )}
          </Box>
        </Box>
        {/* Visible ONLY on `sm` and below (Bottom-Centered) */}
        {getClientFeatureFlag("view_all_brands_page_flag") && (
          <Box className="flex w-full justify-center pb-[36px] md:hidden">
            <Pressable
              onPress={() => brandsnavigation()}
              className="relative cursor-pointer text-center text-color-primary-main underline body-regular-sm"
            >
              <Text className="font-Overpass text-color-primary-main">
                {getLabel("view_all_brands")}
              </Text>
            </Pressable>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OurBrandsYourTrust;
