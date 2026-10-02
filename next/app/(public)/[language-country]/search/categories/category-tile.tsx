import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import Image from "next/image";
import Dropdownicon from "@/assets/adv-search/categories/black-arrow-down.svg";
import DropUpicon from "@/assets/adv-search/categories/black-arrow-up.svg";
import carImg from "@/assets/adv-search/categories/carImg.png";
import engineImg from "@/assets/adv-search/categories/engine-image.png";
import { Icon } from "@/components/ui/icon";

import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import L2CategorySection from "./l2-l3-category-block";
import { OGCheckbox } from "@/components/og-components/OGCheckbox";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import React, { memo, useCallback, useEffect, useRef, useState, forwardRef } from "react";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { OGCat_NodeProps } from "@/components/og-components/OGCategoriesSearcBlock/types";
import { useParams, usePathname } from "next/navigation";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import type { PartsCategoryInterface } from "@/types/categories";

interface CategoryTileProps {
  expanded?: boolean;
  handleExpand: any;
  category: any;
  setSelectedCategories: (category: any) => void;
  gotoStep: (step: number) => void;
  id: string;
  parentId: string;
  title: string;
  description?: string;
  subcategories?: PartsCategoryInterface[];
  forOGSearch?: boolean;
  forLandingPage?: boolean;
  isLast?: boolean;
  showDescription?: boolean;
  level?: number;
  fullSelected: boolean;
  partialSelected: boolean;
  state: "expanded" | "collapsed";
  onCategorySelectionChange?: (ifChecked: boolean, categoryId: string) => void;
}

const SUBTITLE_KEYS_BY_ID: { [index: string]: any } = {
  "001": "category_sub_title_chassis",
  "003": "category_sub_title_engine",
  "005": "category_sub_title_cooling",
  "007": "category_sub_title_braking",
  "002": "category_sub_title_others",
  "004": "category_sub_title_body",
  "006": "category_sub_title_electrics",
};

const CategoryTitle = memo(({ title, isExpanded }: { title: string; isExpanded: boolean }) => (
  <>
    <Box className="justify-start font-Overpass text-lg font-bold leading-tight text-black">
      {title}
    </Box>
  </>
));
CategoryTitle.displayName = "CategoryTitle";

const CategoryCheckbox = memo(
  ({
    title,
    id,
    partialSelected,
    fullSelected,
    handleChange,
    labelClass,
  }: {
    title: string;
    id: string;
    partialSelected: boolean;
    fullSelected: boolean;
    handleChange: (ifChecked: boolean, categoryId: string) => void;
    labelClass?: string;
  }) => (
    <OGCheckbox
      label={title}
      value={id}
      onChange={handleChange}
      partial={partialSelected}
      selected={fullSelected}
    />
  ),
);
CategoryCheckbox.displayName = "CategoryCheckbox";

const CatagoryTile = forwardRef<any, CategoryTileProps>(
  (
    {
      category,

      gotoStep,
      forOGSearch,
      forLandingPage,
      expanded,
      handleExpand,
      id,
      parentId,
      title,
      description,
      subcategories,
      isLast,
      level = 1,
      fullSelected,
      partialSelected,
      state,
      onCategorySelectionChange,
      setSelectedCategories,
    },
    ref,
  ) => {
    const { getLocale, getLabel } = useBranding();
    const pathname = usePathname();
    const {
      openAdvSearch,
      appendToFilteredList,
      setSelectedCategories: setSelectedCategoriesFromStore,
    } = useAdvancedSearchStore();
    const { appendToSelectedCategories } = useCategorySearchStore();

    const { closeOgSearchModal } = useSearchModalStore();

    const [isExpanded, setIsExpanded] = useState(
      state === "expanded" && !fullSelected && !partialSelected,
    );

    const RightIconRef = useRef<any>(null);
    const { SelectedCategoriesId } = useCategorySearchStore();
    const { setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();

    const handleChange = useCallback(
      (ifChecked: boolean, categoryId: string) => {
        onCategorySelectionChange?.(ifChecked, categoryId);
      },
      [onCategorySelectionChange],
    );

    const toggleExpand = useCallback(() => {
      setIsExpanded((prev) => {
        const newState = !prev;
        if (RightIconRef.current) {
          RightIconRef.current.setExpandedState(newState);
        }
        return newState;
      });
    }, []);
    const data = category.children;
    const hasChildren = data.length > 0;

    // Updated filter to handle visibility rules for all levels
    const categoriesToShow = data.filter((category: OGCat_NodeProps) => {
      const isSelected = SelectedCategoriesId.some(
        (id) => id === category.id || id?.startsWith(category.id),
      );

      if (level === 1) {
        // Level 1: Show if expanded or selected (existing behavior)
        return (isExpanded && !fullSelected) || (isSelected && !fullSelected);
      } else {
        // Level 2+: Only show if category is selected/partial or parent is expanded
        return isSelected || isExpanded;
      }
    });

    // Only check for partially selected children
    const hasSelectedChildren = data.some((category: OGCat_NodeProps) =>
      SelectedCategoriesId.some((id) => id?.startsWith(category.id) && id !== category.id),
    );

    const getTitle = () => {
      const { titles = [], name } = category;
      return titles[getLocale()] !== undefined ? category?.titles[getLocale()] : category.name;
    };
    const getTitleOf = (category: any) => {
      if (!category) {
        return "";
      }

      const { titles = [], name } = category;
      return titles[getLocale()] !== undefined ? titles[getLocale()] : name;
    };

    const handleClick = () => {
      handleExpand?.({ id, parentId });
    };

    return (
      <>
        {/* =====================For tablet/desktop viewmobile view==============================           */}
        <Box className="flex w-full" ref={ref}>
          <Pressable
            onPress={() => {}}
            className={`visible flex max-h-[107px] w-full cursor-pointer break-inside-avoid flex-row items-center justify-start overflow-hidden rounded-lg bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.22)]`}
          >
            <Image
              // src={engineImg}
              unoptimized
              src={getCategoryImageUrl(id, { height: 107, width: 170, quality: 80 })}
              height={107}
              width={170}
              quality={100}
              alt="Engine Category"
              className="h-full max-w-[170px] rounded-l-md bg-gradient-to-bl from-green-700 to-emerald-900 object-contain gtsm:w-[160px]"
            />
            <Box className="flex h-full w-full flex-row items-center justify-between rounded-b-md bg-white p-3">
              {" "}
              <Box className="flex h-full w-full flex-col justify-center gap-[5px]">
                <CategoryCheckbox
                  title={getTitleOf(category)}
                  id={id}
                  labelClass="text-start font-Overpass text-base font-bold leading-[18px] text-[--Neutral-Black]"
                  partialSelected={partialSelected}
                  fullSelected={fullSelected}
                  handleChange={handleChange}
                />
              </Box>
              <Box className="absolute right-[24px] top-[22px] h-6 w-6" onClick={handleClick}>
                <Icon
                  as={() =>
                    expanded ? (
                      <Image src={ArrowUpActiveIMG} alt="Arrow Up" />
                    ) : (
                      <Image src={ArrowDownActiveIMG} alt="Arrow Down" />
                    )
                  }
                  className="ml-2"
                />
              </Box>
            </Box>
          </Pressable>

          {/* =====================For mobile view==============================           */}
          <Pressable
            onPress={() => {
              setSelectedCategories(category);
              gotoStep(2);
            }}
            className="hidden min-h-[160px] rounded-b-md rounded-t-md shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] gtsm:hidden"
          >
            <Image
              src={engineImg}
              alt="Engine Category"
              className="max-h-[100px] rounded-t-md bg-gradient-to-bl from-green-700 to-emerald-900 object-contain"
            />
            <Box className="flex h-full flex-col rounded-b-md bg-white p-3">
              {" "}
              <Text className="font-Overpass text-[10px] font-bold text-gray-400">CATEGORY</Text>
              <Text className="text-start font-Overpass text-base font-bold leading-[18px] text-[--Neutral-Black]">
                {getTitleOf(category)}
              </Text>
            </Box>
          </Pressable>
          {expanded && (
            <Box className="w-full">
              <L2CategorySection
                id={id}
                onCategorySelectionChange={handleChange}
                parentId={parentId}
                title={title}
                categories={subcategories ?? []}
                level={2}
                fullSelected={fullSelected}
                partialSelected={partialSelected}
                state={state}
              />
              {/* )} */}
            </Box>
          )}
        </Box>
      </>
    );
  },
);

CatagoryTile.displayName = "CatagoryTile";

export default CatagoryTile;
