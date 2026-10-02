import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import React, { useCallback, useState } from "react";
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
  categories?: PartsCategoryInterface[] | undefined;
  level: number;
  data: PartsCategoryInterface | null;
};
// type Props = {
//   categories?: PartsCategoryInterface[];
// };
const L3Category = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { data, id, parentId, title, categories, level } = props;
  const [Expanded, setExpanded] = useState(false);
  // const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
  //     useNewCategorySearchStore();
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();
  const { updateFilters } = useUrlParams();
  const { setSelectedCategories, appendToFilteredList } = useAdvancedSearchStore();
  const clickToNavigate = (category: PartsCategoryInterface) => {
    appendToSelectedCategories(category);

    const categoriesIdList = SelectedCategories?.map((node) => node?.id);

    updateFilters(
      {
        categoryId: pickPrimaryCategoryId(categoriesIdList ?? []),
      },
      "/products",
      // "",
      // true
    );
  };
  // return <></>;

  const fullSelected = false;
  const categoryFullSelected = fullSelected || !!SelectedCategoriesId.find((node) => node === id);
  const categoryPartialSelected = !!SelectedCategoriesId.find((node) => node.startsWith(id));

  return (
    <Box>
      {categories &&
        categories?.map((category, index) => {
          return (
            <>
              <Box
                onClick={() => {
                  // clickToNavigate(category);
                }}
                className="flex flex-row content-center justify-between border-b border-slate-100 bg-[--secondary-colors-disabled] px-[16px] py-[8px]"
              >
                <Box className="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
                  <OGCheckbox
                    value={category}
                    onChange={(val) => {
                      const { children, ...dataWithoutChildren } = category;
                      appendToSelectedCategories(dataWithoutChildren);
                    }}
                    selected={
                      SelectedCategoriesId.includes(category.id) ||
                      SelectedCategoriesId.includes(category.parentId)
                    }
                    label={getTitleOfCategory(category, locale)}
                    labelClass="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]"
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
  const { data, title, id, parentId, categories, level } = props;
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();
  const { getLabel, getLocale } = useBranding();
  const locale = getLocale();
  const { setSelectedCategories } = useAdvancedSearchStore();
  const { L2CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();

  const handleClick = (state?: { id: string; parentId: string }) => {
    setL2CatExpanded(state?.id);
  };
  const fullSelected = false;
  const categoryFullSelected = fullSelected || !!SelectedCategoriesId.find((node) => node === id);
  const categoryPartialSelected = !!SelectedCategoriesId.find((node) => node.startsWith(id));
  return (
    <>
      <Box
        onClick={() => handleClick({ id, parentId })}
        className="flex cursor-pointer flex-row content-center justify-between border-b border-slate-100 bg-[--hover-text-color] bg-white px-[16px] py-[8px]"
      >
        <Box className="font-Overpass text-xs font-bold uppercase text-[--l2-l3-categories-title]">
          <OGCheckbox
            value={data}
            label={title}
            labelClass="justify-start text-zinc-800 text-xs font-bold font-Overpass uppercase"
            // selected={SelectedCategoriesId.includes(id)}
            selected={categoryFullSelected}
            partial={categoryPartialSelected}
            onChange={(val) => {
              // setSelectedCategories(data);
              // const { children, ...dataWithoutChildren } = data;
              // appendToSelectedCategories(dataWithoutChildren);
              // handleClick(id);
              if (data !== null) {
                const { children, ...dataWithoutChildren } = data;
                appendToSelectedCategories(dataWithoutChildren);
              }
            }}
          />{" "}
          {/* {title} */}
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
        <Box className="ml-4">
          <L3Category
            id={id}
            parentId={parentId}
            data={data}
            title={title}
            key={id}
            categories={categories}
            level={3}
          />
        </Box>
      )}
    </>
  );
};

const L2CategorySectionAdvSearchModal = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const { appendToSelectedCategories, SelectedCategories, SelectedCategoriesId } =
    useCategorySearchStore();
  const locale = getLocale();
  const { categories } = props;

  // const getTitle = (category:PartsCategoryInterface) : string =>{
  //     return categories?.titles?[getLocale()] ?? category.name;
  // }
  return (
    <Box className="mt-[8px] rounded-b-lg bg-white p-[10px] transition delay-150 duration-300 ease-in-out">
      <Box>
        {}
        {categories &&
          categories?.map((category, index) => {
            return (
              <L2Category
                data={category}
                id={category.id}
                parentId={category.parentId}
                title={getTitleOfCategory(category, locale)}
                categories={category.children}
                level={2}
                key={category.id}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default L2CategorySectionAdvSearchModal;
