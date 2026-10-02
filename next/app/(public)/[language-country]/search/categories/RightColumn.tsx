"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { flattenTree, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useCategories } from "@/contexts/CategoriesContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import React, { useEffect, useRef } from "react";

import RCatBlock from "./RCatBlock";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {
  noScroll: boolean;
};

const RightColumn = (props: Props) => {
  const { noScroll = false } = props;

  const isInitialMount = useRef(true);
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const { data: nestedCategories, isPending: isLoading } = useCategories();
  const flatCategoriesList = flattenTree(nestedCategories as any, "children");
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();

  const handleCategorySelectionChange = (ifChecked: boolean, categoryId: any) => {
    //@ts-ignore
    const updatedCategoryList: any = flatCategoriesList.find((node) => node?.id === categoryId);
    appendToSelectedCategories(updatedCategoryList);
  };

  const FnestedCategories = {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SelectedCategories]);

  return (
    <Box
      className={`flex gtsm:flex gtsm:flex-1 gtsm:flex-col gtsm:rounded-lg ${noScroll ? "" : "gtsm:bg-white"} gtsm:pb-8 gtsm:pr-8 gtsm:pt-[40px] gtsm:shadow-sm`}
    >
      <RCatBlock
        //@ts-ignore
        title={getTitleOfCategory(FnestedCategories as any, "en")}
        noScroll={noScroll}
        data={FnestedCategories?.children}
        id={FnestedCategories.id}
        //@ts-ignore
        parentId={FnestedCategories?.parentId ?? ""}
        fullSelected={false}
        partialSelected={false}
        state={"expanded"}
        level={1}
        onCategorySelectionChange={handleCategorySelectionChange}
        isLoading={isLoading}
      />
      {/* <MainBlock noWrap showDescription={false} /> */}
    </Box>
  );
};

export default RightColumn;
