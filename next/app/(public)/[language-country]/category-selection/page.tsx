"use client";
import { Box } from "@/components/ui/box";
// import BrowseByCategoryNew from "@/screens/landing/browse-by-category-new";
import React from "react";
import RightColumn from "../search/categories/RightColumn";
import LeftNavBar from "@/screens/landing/left-navbar";
import BottomBar from "./BottomBar";
import { useBranding } from "@/contexts/BrandingContext";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
// import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import Typography from "@/components/og-components/Typography";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { pickPrimaryCategoryId, getCarIdsFromSearchParams } from "@/utils/categorySearchUrl";
import { useNavigationVin } from "@/hooks/useNavigationCarIds";
import { getE2ESavedCarVin } from "@/utils/e2eSavedCarMeta";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type Props = {};

const CategorySelection = (props: Props) => {
  const { getLabel } = useBranding();
  // const { updateFilters } = useUrlParams();
  const { SelectedCategoriesId } = useCategorySearchStore();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { selectedSavedCarInLandingPage } = useMmeStore();
  const navigationVin = useNavigationVin();

  const handleViewParts = (categories: any) => {
    const urlCarIds = getCarIdsFromSearchParams(searchParams);
    const savedCarId =
      selectedSavedCarInLandingPage?.carId?.trim() ||
      selectedSavedCarInLandingPage?.data?.carId?.trim() ||
      "";
    const carIds = urlCarIds.length > 0 ? urlCarIds : savedCarId ? [savedCarId] : [];

    const catalogUrl = getRouteLocaleString(Routes.categorySelection, params);
    const queryParams = new URLSearchParams();

    if (carIds.length > 0) {
      queryParams.set("carIds", carIds.join(","));
    }

    const vin =
      navigationVin ||
      (getClientFeatureFlag("end_to_end_vin_flow_feature_flag") && carIds[0]
        ? getE2ESavedCarVin(carIds[0])
        : null);
    if (vin) {
      queryParams.set("vin", vin);
    }

    if (SelectedCategoriesId && SelectedCategoriesId.length > 0) {
      const primaryCategoryId = pickPrimaryCategoryId(SelectedCategoriesId);
      if (primaryCategoryId) {
        queryParams.set("categoryId", primaryCategoryId);
      }
    }

    const finalUrl = queryParams.toString()
      ? `${catalogUrl}?${queryParams.toString()}`
      : catalogUrl;

    router.push(finalUrl);
  };

  return (
    <Box className="pt-[100px]">
      <Box className="gtsm:ml-[180px]">
        <Typography
          type="h2"
          className="text-color-text-body base:pl-2 gtsm:pl-[32px] gtlg:pl-[32px]"
        >
          {getLabel("what_kind_of_parts")}
        </Typography>
        <RightColumn noScroll={true} />
      </Box>
      <LeftNavBar />
      {/* <BrowseByCategoryNew 
            forceVisible
        /> */}
      <BottomBar viewParts={handleViewParts} />
    </Box>
  );
};

export default CategorySelection;
