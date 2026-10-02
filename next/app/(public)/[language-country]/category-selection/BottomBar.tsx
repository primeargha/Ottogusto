import React, { useEffect, useState } from "react";

import { OGButton } from "@/components/og-components/OGButton";
import { OGLinkButton } from "@/components/og-components/OGLinkButton";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { getMMEId } from "@/utils/getMMEId";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMmeStore } from "@/stores/useMmeStore";
import { useFilterStore } from "@/stores/useFilter";

type Props = {
  viewParts?: (cat: any) => void;
};

const BottomBar = (props: Props) => {
  const { viewParts } = props;
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { updateFilters, getPrefetchURL } = useUrlParams();
  const { SelectedCategoriesId, SelectedCategories, clearSelectedCategories } =
    useCategorySearchStore();
  const { reset: resetBrandAndPriceFilters } = useFilterStore();
  const [ViewAll, setViewAll] = useState("");
  const [ViewPartsUrl, setViewPartsUrl] = useState("");
  const { generateMmeSearchData, selectedSavedCarInLandingPage } = useMmeStore();

  const handleBackClick = () => {
    resetBrandAndPriceFilters();
    clearSelectedCategories();
    router.back();
  };
  const handleViewAllParts = () => {
    resetBrandAndPriceFilters();
    clearSelectedCategories();
    // router.navigate(getRouteLocaleString(Routes.searchresults, params));
    updateFilters(
      {
        makeModelTypeId: getMMEId() || selectedSavedCarInLandingPage?.makeModelTypeId || null,
      },
      undefined,
      "desktop",
      false,
      true,
    );
  };

  const handleViewParts = () => {
    if (viewParts) {
      viewParts(SelectedCategories);
    }
  };

  return (
    <>
      {/* For Mobile View */}
      <Box className="sticky bottom-0 hidden content-center items-center justify-between border-color-background-l7 bg-color-background-l3 gtsm:flex-row gtsm:p-[24px] between-0-640:flex between-0-640:justify-center between-0-640:gap-2 between-0-640:px-[16px] between-0-640:py-3">
        <Box className="flex items-center gap-3 gtsm:flex-row gtsm:gap-4 between-0-640:w-full">
          <Link className="between-0-640:w-full" prefetch href={ViewPartsUrl}>
            <OGButton
              type="primary"
              className="w-[200px] between-0-640:w-full"
              disabled={SelectedCategoriesId.length <= 0}
              onClick={handleViewParts}
            >
              {/* View parts */}
              {getLabel("view_parts")}
            </OGButton>
          </Link>
        </Box>
        <Box>
          <Link href={ViewAll}>
            <OGLinkButton onClick={handleViewAllParts}>{getLabel("view_all_part")}</OGLinkButton>
          </Link>
        </Box>
      </Box>

      {/* For Desktop View */}
      <Box className="sticky bottom-0 hidden content-center items-center justify-between border-color-background-l7 bg-color-background-l3 gtsm:flex gtsm:flex-row gtsm:p-[24px] between-0-640:justify-center between-0-640:p-[8px]">
        <Box>
          <Link href={ViewAll}>
            <OGLinkButton onClick={handleViewAllParts}>{getLabel("view_all_part")}</OGLinkButton>
          </Link>
        </Box>
        <Box className="flex items-center gap-2 gtsm:flex-row gtsm:gap-4 between-0-640:w-full">
          <OGButton type="outlined" className="w-full" size="medium" onClick={handleBackClick}>
            {getLabel("back")}
          </OGButton>
          <Link className="between-0-640:w-full" href={ViewPartsUrl}>
            <OGButton
              type="primary"
              className="w-[200px] between-0-640:w-full"
              disabled={SelectedCategoriesId.length <= 0}
              onClick={handleViewParts}
            >
              {/* View parts */}
              {getLabel("view_parts")}
            </OGButton>
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default BottomBar;
