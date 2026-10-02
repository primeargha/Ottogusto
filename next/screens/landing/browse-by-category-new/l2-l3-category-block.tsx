import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { PartsCategoryInterface, useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { getRouteLocaleString, getTitleOfCategory } from "@/helpers/UtilityHelper";

// import WArrowDownActiveIMG from "./assets/icons/warrow_up.png";
import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import ArrowNavigateIMG from "./assets/icons/arrow_forward.png";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MAX_COUNT } from "@/constants";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {
  id: string;
  parentId: string;
  title: string;
  categories?: PartsCategoryInterface[];
  level: number;
};
// type Props = {
//   categories?: PartsCategoryInterface[];
// };
const L3Category = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const params = useParams();
  const { id, parentId, title, categories, level } = props;
  const [Expanded, setExpanded] = useState(false);
  // const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
  //     useNewCategorySearchStore();
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();
  const { updateFilters } = useUrlParams();
  const { setSelectedCategories, appendToFilteredList } = useAdvancedSearchStore();
  const clickToNavigate = (category: PartsCategoryInterface) => {
    // appendToFilteredList(category, true);
    setSelectedCategories(category);
    appendToSelectedCategories(category);

    const categoriesIdList =
      SelectedCategories?.map((node) => node?.id).length > 0
        ? SelectedCategories?.map((node) => node?.id)
        : [category.id];

    updateFilters(
      {
        categoryId: pickPrimaryCategoryId(categoriesIdList),
      },
      "/products",
      // "",
      // true
    );
  };

  // http://localhost:3000/en-BE/search-results/?categoryIds=001001002&take=10&order=ASC
  return (
    <Box>
      {categories &&
        categories?.map((category, index) => {
          return (
            <React.Fragment key={category.id}>
              <Box
                onClick={() => {
                  // clickToNavigate(category);
                }}
                // className="flex flex-row content-center justify-between border-b border-slate-100 bg-[--secondary-colors-disabled] px-[16px] py-[8px]"
              >
                <Link
                  prefetch
                  className="flex cursor-pointer flex-row content-center justify-between border-b border-slate-100 bg-[--secondary-colors-disabled] px-[16px] py-[8px]"
                  href={`${getRouteLocaleString(Routes.searchresults, params)}?categoryId=${category.id}&take=${MAX_COUNT}&order=priority`}
                >
                  <Box className="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
                    {getTitleOfCategory(category, locale)}
                  </Box>
                  <Box>
                    <Icon
                      as={() => <Image src={ArrowNavigateIMG} width={24} alt="Arrow Down" />}
                      className="ml-2"
                    />
                  </Box>
                </Link>
              </Box>
              {/* <L2L3Category categories={category.children} level={3} /> */}
            </React.Fragment>
          );
        })}
    </Box>
  );
};

const L2Category = (props: Props) => {
  const { title, id, parentId, categories, level } = props;
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { L2CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const handleClick = (state?: string) => {
    // if (typeof state !== "undefined") {
    //   setExpanded(state);
    // } else {
    setL2CatExpanded(state);
    // }
  };

  return (
    <>
      <Box
        onClick={() => handleClick(id)}
        className="flex flex-row content-center justify-between border-b border-slate-100 bg-[--hover-text-color] bg-white px-[16px] py-[8px]"
      >
        <Box className="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
          {title}
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
        <L3Category
          id={id}
          parentId={parentId}
          title={title}
          key={id}
          categories={categories || []}
          level={3}
        />
      )}
    </>
  );
};

const L2CategorySection = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { categories } = props;

  // const getTitle = (category:PartsCategoryInterface) : string =>{
  //     return categories?.titles?[getLocale()] ?? category.name;
  // }
  return (
    <Box className="mt-[8px] cursor-pointer rounded-b-lg bg-white p-[10px] transition delay-150 duration-300 ease-in-out">
      <Box>
        {}
        {categories &&
          categories?.map((category, index) => {
            return (
              <L2Category
                id={category.id}
                parentId={category.parentId}
                title={getTitleOfCategory(category, locale)}
                categories={category.children || []}
                level={2}
                key={category.id}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default L2CategorySection;
