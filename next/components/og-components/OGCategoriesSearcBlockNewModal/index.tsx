"use client";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionHeader,
//   AccordionIcon,
//   AccordionItem,
//   AccordionTitleText,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
// import { Divider } from "@/components/ui/divider";
// import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
// import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "@/contexts/CategoriesContext";
import React, { Suspense, useEffect, useRef, useState } from "react";
import OGCat_Block from "./OGCat_Block";
import { flattenTree, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
// import { OGCheckbox } from "../OGCheckbox";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {};

const Index = (props: Props) => {
  // fetch categories data initially;
  const isInitialMount = useRef(true);
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const { data: nestedCategories, isPending: isLoading } = useCategories();
  const flatCategoriesList = flattenTree(nestedCategories || [], "children");
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();

  const handleCategorySelectionChange = (ifChecked: boolean, categoryId: any) => {
    const updatedCategoryList: any = flatCategoriesList.find((node) => node.id === categoryId);
    appendToSelectedCategories(updatedCategoryList);
  };

  const FnestedCategories: any = {
    titles: {
      en: getLabel("root_category_title"), //"Category",
    },
    name: "Category",
    id: "root",
    children: nestedCategories,
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const categoriesIdList = SelectedCategories?.map((node) => node?.id);

    const filterDataForURL = {
      categoryId: pickPrimaryCategoryId(categoriesIdList ?? []),
      year: searchData?.year?.value || null,
    };
    // updateFilters(
    //   filterDataForURL,
    //   "/products",
    //   // "",
    //   // true
    // );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SelectedCategories]);

  return (
    <Box className="min-h-400">
      <OGCat_Block
        title={getTitleOfCategory(FnestedCategories)}
        data={FnestedCategories?.children || []}
        id={FnestedCategories.id}
        fullSelected={false}
        partialSelected={false}
        state={"expanded"}
        level={1}
        onCategorySelectionChange={handleCategorySelectionChange}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Index;
