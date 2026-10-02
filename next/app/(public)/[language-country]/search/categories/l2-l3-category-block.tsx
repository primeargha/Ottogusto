import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import React, { useState } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { PartsCategoryInterface, useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";

import WArrowDownActiveIMG from "./assets/icons/warrow_up.png";
import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import ArrowNavigateIMG from "./assets/icons/arrow_forward.png";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { OGCheckbox } from "@/components/og-components/OGCheckbox";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {
  id: string;
  parentId: string;
  title: string;
  categories?: PartsCategoryInterface[];

  level?: number;
  fullSelected: boolean;
  partialSelected: boolean;
  state: "expanded" | "collapsed";
  onCategorySelectionChange?: (ifChecked: boolean, categoryId: string) => void;
};

const L3Category = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { id, parentId, title, categories, level, onCategorySelectionChange } = props;
  const [Expanded, setExpanded] = useState(false);

  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();
  const { updateFilters } = useUrlParams();
  const { setSelectedCategories, appendToFilteredList } = useAdvancedSearchStore();
  const clickToNavigate = (category: PartsCategoryInterface) => {
    setSelectedCategories(category);
    appendToSelectedCategories(category);

    const categoriesIdList =
      SelectedCategories?.map((node) => node?.id).length > 0
        ? SelectedCategories?.map((node) => node?.id)
        : [category.id];
    updateFilters(
      {
        categoryId: pickPrimaryCategoryId(categoriesIdList ?? []),
      },
      "/products",
    );
  };
  return (
    <Box>
      {categories &&
        categories?.map((category, index) => {
          const fullSelected = false;
          const categoryFullSelected =
            fullSelected || !!SelectedCategoriesId.find((node) => category.id.startsWith(node));
          const categoryPartialSelected = !!SelectedCategoriesId.find((node) =>
            node.startsWith(category.id),
          );
          return (
            <>
              <Box
                onClick={() => {}}
                className="flex flex-row content-center justify-between border-b border-slate-100 bg-[--secondary-colors-disabled] px-[16px] py-[8px]"
              >
                <Box className="pl-4 font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
                  <OGCheckbox
                    label={getTitleOfCategory(category, locale)}
                    labelClass="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]"
                    partial={categoryPartialSelected}
                    selected={categoryFullSelected}
                    onChange={(val) => {
                      if (onCategorySelectionChange) {
                        onCategorySelectionChange(val, category.id);
                      }
                    }}
                  />
                </Box>
              </Box>
            </>
          );
        })}
    </Box>
  );
};

const L2Category = (props: Props) => {
  const {
    title,
    id,
    parentId,
    categories,
    level,
    onCategorySelectionChange,
    fullSelected,
    partialSelected,
  } = props;
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { L2CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const handleClick = (state?: string) => {
    setL2CatExpanded(state);
  };

  return (
    <>
      <Box
        onClick={() => handleClick(id)}
        className="flex flex-row content-center justify-between border-b border-slate-100 bg-[--l2-categories-bg] px-[16px] py-[8px]"
      >
        <Box className="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
          {/* {title} */}
          <OGCheckbox
            label={title}
            labelClass="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]"
            partial={partialSelected}
            selected={fullSelected}
            onChange={(val, catId) => {
              if (onCategorySelectionChange) {
                onCategorySelectionChange(val, catId ?? id);
              }
            }}
          />
        </Box>
        <Box>
          <Icon
            as={() => (
              <Image
                src={L2CatExpanded === id ? ArrowUpActiveIMG : ArrowDownActiveIMG}
                width={24}
                alt="Arrow Down"
              />
            )}
            className="ml-2"
          />
        </Box>
      </Box>
      {L2CatExpanded == id && (
        //@ts-ignore
        <L3Category
          id={id}
          parentId={parentId}
          title={title}
          key={id}
          categories={categories || []}
          level={3}
          onCategorySelectionChange={onCategorySelectionChange}
        />
      )}
    </>
  );
};

const L2CategorySection = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { categories, onCategorySelectionChange } = props;
  const { SelectedCategoriesId } = useCategorySearchStore();

  return (
    <Box className="mt-[8px] rounded-b-lg bg-[--l2-categories-bg] p-[10px] transition delay-150 duration-300 ease-in-out">
      <Box>
        {}
        {categories &&
          categories?.map((category, index) => {
            const fullSelected = false;
            const categoryFullSelected =
              fullSelected || !!SelectedCategoriesId.find((node) => category.id.startsWith(node));
            const categoryPartialSelected = !!SelectedCategoriesId.find((node) =>
              node.startsWith(category.id),
            );

            return (
              <L2Category
                id={category.id}
                parentId={category.parentId}
                title={getTitleOfCategory(category, locale)}
                categories={category.children || []}
                level={2}
                key={category.id}
                fullSelected={categoryFullSelected}
                partialSelected={categoryPartialSelected}
                onCategorySelectionChange={onCategorySelectionChange ?? (() => {})}
                state="expanded"
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default L2CategorySection;
