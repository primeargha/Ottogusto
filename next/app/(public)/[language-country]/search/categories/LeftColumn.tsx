import React from "react";

import { OGButton } from "@/components/og-components/OGButton";
import OGPill from "@/components/og-components/OGPill";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useUrlParams } from "@/hooks/useUrlParams";
import { SelectedFiltersBlock } from "@/screens/advanced-search/adv-search-modal";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import useRouter from "@unitools/router";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import { getMMEId } from "@/utils/getMMEId";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {
  selectedCategoriesCount?: number;
};

const LeftColumn = (props: Props) => {
  const { selectedCategoriesCount } = props;
  const router = useRouter();
  const params = useParams();
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { updateFilters } = useUrlParams();
  const { searchData, carByVinResults, addToPreviousSearches } = useMmeStore();

  const { SelectedCategoriesId, SelectedCategories, appendToSelectedCategories } =
    useCategorySearchStore();
  const removeCategoryHandler = (val: any, event: Event) => {
    appendToSelectedCategories(val);
  };
  const handleSkipToResults = () => {
    const makeModelTypeIdFromUrl = searchParams?.get("makeModelTypeId");
    const makeModelTypeId = makeModelTypeIdFromUrl || getMMEId();

    updateFilters({
      makeModelTypeId,
    });
  };
  const handleConfirm = () => {
    navigateToSearchNew();
  };
  const navigateToSearchNew = () => {
    const makeModelTypeIdFromUrl = searchParams?.get("makeModelTypeId");
    const makeModelTypeId = makeModelTypeIdFromUrl || getMMEId();

    updateFilters({
      makeModelTypeId,

      categoryId: pickPrimaryCategoryId(SelectedCategoriesId),
    });
  };

  return (
    <Box className="hidden gtsm:mr-8 gtsm:flex gtsm:min-h-[600px] gtsm:w-[450px] gtsm:flex-col gtsm:rounded-lg gtsm:bg-white gtsm:pb-8 gtsm:pl-14 gtsm:pt-[40px] gtsm:shadow-sm">
      <Box className="relative gap-10 pt-10">
        <Box className="h-28 w-[700px] justify-center font-Overpass text-6xl font-bold leading-[60px] text-black">
          {getLabel("select")} <br />
          {getLabel("category")}
        </Box>
        {SelectedCategories.length > 0 ? (
          <Box className="flex flex-row flex-wrap gap-3 overflow-auto">
            {SelectedCategories?.map((cat) => {
              return (
                <OGPill
                  key={cat.id}
                  label={cat.name}
                  onRemove={(e) => removeCategoryHandler(cat, e)}
                />
              );
            })}
          </Box>
        ) : (
          <Box className="h-12 w-80 justify-center font-Overpass text-sm font-normal text-gray-700">
            {getLabel("category_looking_for")}.
          </Box>
        )}
        <Box className="">
          {SelectedCategories.length > 0 ? (
            <OGButton type="outlined" size="medium" onClick={handleConfirm}>
              {getLabel("confirm")}
            </OGButton>
          ) : (
            <OGButton type="outlined" size="medium" onClick={handleSkipToResults}>
              {getLabel("skip_to_results")}
            </OGButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LeftColumn;
