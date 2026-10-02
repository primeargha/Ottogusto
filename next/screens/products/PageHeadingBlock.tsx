"use client";

import { useBranding } from "@/contexts/BrandingContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useSearchedCarLabels } from "@/hooks/useSearchedCarLabels";
import Typography from "@/components/og-components/Typography";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCarIdsFromSearchParams,
  getCategoryIdFromSearchParams,
} from "@/utils/categorySearchUrl";
import { useMmeStore } from "@/stores/useMmeStore";
import {
  buildLegacyMmeCarLabel,
  buildSearchResultsDisplayTitle,
  resolveCategoryDisplayName,
} from "@/utils/searchResultsDisplayTitle";

type Props = {
  categoryDetails?: {
    l1?: string;
    l2?: string;
    l3?: string;
  };
};

const PageHeadingBlock = (_props: Props) => {
  const searchParams = useSearchParams();
  const { data: categoryTree } = useCategories();
  const { searchData } = useMmeStore();
  const { getLocale, getLabel } = useBranding();

  const oeReference = searchParams?.get("oeReference");
  const categoryId = getCategoryIdFromSearchParams(searchParams);
  const carIds = getCarIdsFromSearchParams(searchParams);
  const primaryCarId = carIds[0] ?? null;
  const makeModelTypeId = searchParams?.get("makeModelTypeId");

  const { data: carLabelOptions } = useSearchedCarLabels(
    primaryCarId ? [primaryCarId] : [],
    Boolean(primaryCarId),
  );

  const title = useMemo(() => {
    const categoryName = resolveCategoryDisplayName(categoryTree ?? [], categoryId, getLocale());

    let carLabel = "";
    if (primaryCarId) {
      carLabel = carLabelOptions[0]?.label ?? "";
    } else if (makeModelTypeId) {
      carLabel = buildLegacyMmeCarLabel(searchData?.make?.value, searchData?.model?.value);
    }

    return buildSearchResultsDisplayTitle({
      carLabel: carLabel || null,
      categoryName,
      oeReference: oeReference ?? null,
      getLabel,
    }).title;
  }, [
    carLabelOptions,
    categoryId,
    categoryTree,
    getLabel,
    getLocale,
    makeModelTypeId,
    oeReference,
    primaryCarId,
    searchData?.make?.value,
    searchData?.model?.value,
  ]);

  return (
    <Typography
      hasBack
      type="h1"
      className="!gap-18 line-clamp-2 min-h-[64px] text-start text-color-text-body typography-heading-01 gtsm:line-clamp-none gtsm:min-h-0"
    >
      {title}
    </Typography>
  );
};

export default PageHeadingBlock;
