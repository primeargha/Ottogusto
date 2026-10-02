"use client";

import React, { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { OGButton } from "@/components/og-components/OGButton";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import SearchByCarHeader from "@/screens/search-by-car/search-header";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useMedia } from "@/hooks/useMedia";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export default function SearchPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const resetSearch = useNewSearchModalStore((s) => s.resetSearch);
  const resetSavedCar = useNewSearchModalStore((s) => s.resetSavedCar);
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();

  useEffect(() => {
    resetSearch();
    resetSavedCar();
  }, [resetSearch, resetSavedCar]);

  const handleClose = () => {
    resetSearch();

    router.push(getRouteLocaleString((locale: string) => `/${locale}`, params));
  };

  return (
    <>
      {isMobile ? (
        <Box className="flex min-h-screen w-full items-start justify-start">
          <SearchByCarHeader handleClose={handleClose} showBackArrow={false} />
          <Box className="mt-[80px] flex w-full flex-col items-center justify-center gap-[60px]">
            {/* Text block */}
            <Text className="typography-h1 flex w-full flex-col justify-center text-center">
              <span className="typography-h2 block text-[--color-black] [font-feature-settings:'liga_off','clig_off']">
                {getLabel("how_would")} {getLabel("like")}
              </span>
              <span className="typography-h2 block text-[--color-black] [font-feature-settings:'liga_off','clig_off']">
                {getLabel("to_begin")}
              </span>
            </Text>

            {/* Button Group */}
            <Box className="flex h-auto min-w-[152.07px] cursor-pointer flex-col justify-center gap-[30px]">
              {getClientFeatureFlag("vin_feature_flag") && (
                <Box
                  className="flex h-[80px] w-full justify-end rounded-lg border-2 border-[--color-black] pl-[6.04px] text-[16px] font-semibold tracking-wide shadow-none"
                  onClick={() =>
                    router.push(
                      getRouteLocaleString(
                        (locale: string) => `/${locale}/search/vin-number`,
                        params,
                      ),
                    )
                  }
                >
                  {getLabel("vin_number")}
                </Box>
              )}
              <Box
                className="flex h-[80px] w-full cursor-pointer justify-end rounded-lg border-2 border-[--color-black] pl-[6.04px] text-[16px] font-semibold tracking-wide shadow-none"
                onClick={() =>
                  router.push(
                    getRouteLocaleString((locale: string) => `/${locale}/search/manually`, params),
                  )
                }
              >
                {getLabel("manually")}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="flex min-h-screen w-full items-start justify-center md:px-[56px]">
          {/* Desktop/Tablet Header */}
          <SearchByCarHeader handleClose={handleClose} showBackArrow={false} />
          <Box className="flex w-full flex-row items-center justify-center gtlg:gap-[180px]">
            {/* Text block */}
            <Text className="typography-h1 flex flex-col justify-center md:h-[190px] md:w-[486px]">
              <span className="typography-h1 block text-[--color-black] [font-feature-settings:'liga_off','clig_off']">
                {getLabel("how_would")}
              </span>
              <span className="typography-h1 block text-[--color-black] [font-feature-settings:'liga_off','clig_off']">
                {getLabel("like")} {getLabel("to_begin")}
              </span>
            </Text>

            {/* Button Group */}
            <Box className="flex flex-col gap-[30px] sm:flex-row sm:gap-8 md:w-[600px]">
              {getClientFeatureFlag("vin_feature_flag") && (
                <Box
                  className="typography-body-bold-lg h-[128.3px] flex-1 cursor-pointer justify-end rounded-lg border-2 border-[--color-black] pb-[5px] pl-[10.6px] tracking-wide text-[--Grey-Colors-Grey-900] shadow-none transition hover:bg-gray-100"
                  onClick={() =>
                    router.push(
                      getRouteLocaleString(
                        (locale: string) => `/${locale}/search/vin-number`,
                        params,
                      ),
                    )
                  }
                >
                  {getLabel("vin_number")}
                </Box>
              )}
              <Box
                className="typography-body-bold-lg h-[128.3px] flex-1 cursor-pointer justify-end rounded-lg border-2 border-[--color-black] pb-[5px] pl-[10.6px] tracking-wide text-[--color-blue-900] shadow-none transition hover:bg-gray-100"
                onClick={() =>
                  router.push(
                    getRouteLocaleString((locale: string) => `/${locale}/search/manually`, params),
                  )
                }
              >
                {getLabel("manually")}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
