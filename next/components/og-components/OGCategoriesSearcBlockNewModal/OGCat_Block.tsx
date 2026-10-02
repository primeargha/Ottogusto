import React, { useRef, useState, useCallback, memo, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { OGCheckbox } from "../OGCheckbox";
import { OGCat_NodeProps } from "./types";
import RightIconCategoryAccordion from "./RightIconCategoryAccordion";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import Image from "next/image";

import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import im1 from "./assets/carengine.png";
import { Icon } from "@/components/ui/icon";
import { useBranding } from "@/contexts/BrandingContext";

interface Props {
  id: string;
  title: string;
  state?: "expanded" | "collapsed";
  partialSelected: boolean;
  fullSelected: boolean;
  data: OGCat_NodeProps[];
  level?: number;
  onCategorySelectionChange?: (ifChecked: boolean, categoryId: string) => void;
  isLoading?: boolean;
}

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
  }: {
    title: string;
    id: string;
    partialSelected: boolean;
    fullSelected: boolean;
    handleChange: (ifChecked: boolean, categoryId: string) => void;
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

const OGCat_Block = memo((props: Props) => {
  const {
    id,
    title,
    onCategorySelectionChange,
    state = "collapsed",
    partialSelected = false,
    fullSelected = false,
    data = [],
    level = 1,
    isLoading = false,
  } = props;

  const { getLocale } = useBranding();

  // Initialize expansion state based on selection status
  const [isExpanded, setIsExpanded] = useState(
    state === "expanded" && !fullSelected && !partialSelected,
    // state === "expanded",
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

  useEffect(() => {
    setL1CatExpanded(null);
    setL2CatExpanded(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update expansion state when full selection changes
  useEffect(() => {
    if (fullSelected && level === 2) {
      setIsExpanded(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullSelected, partialSelected]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const newState = !prev;
      if (RightIconRef.current) {
        RightIconRef.current.setExpandedState(newState);
      }
      return newState;
    });
  }, []);

  const hasChildren = data.length > 0;

  // Updated filter to handle visibility rules for all levels
  const categoriesToShow = data.filter((category: OGCat_NodeProps) => {
    const isSelected = SelectedCategoriesId.some(
      (id) => id === category.id || id.startsWith(category.id),
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
    SelectedCategoriesId.some((id) => id.startsWith(category.id) && id !== category.id),
  );

  // Only auto-expand for partial selections
  useEffect(() => {
    // if (hasSelectedChildren && !isExpanded && !fullSelected) {
    //   setIsExpanded(false);
    //   if (RightIconRef.current) {
    //     RightIconRef.current.setExpandedState(false);
    //   }
    // }
  }, [hasSelectedChildren, fullSelected]);
  // debugger;
  if (isLoading) {
    // http://localhost:3000/en-EU/products/?makeModelTypeId=00a00600000000&categoryIds=001001002%2C001001004%2C001002001%2C001002003%2C001003%2C006&take=10&minPrice=1&maxPrice=77&order=ASC
    return (
      <Box className="h-[10dvh] w-full content-center items-center justify-center">
        <Spinner size="large" color="#0a4932" />
        <></>
      </Box>
    );
  }

  const showDescription = false;

  return (
    <Box className="my-1 flex">
      <Box className="flex w-full flex-row items-center bg-[blue]/30">
        <Box className="flex-1 cursor-pointer overflow-hidden text-ellipsis" title={title}>
          {level === 1 && (
            // <CategoryTitle title={title} isExpanded={isExpanded} />
            <></>
          )}
          {level === 2 && (
            <Box
              className={`cursor-pointer flex-row items-start justify-start overflow-hidden ${
                true ? "rounded-t-lg" : "rounded-lg"
              } bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.22)]`}
            >
              <Box className="flex min-w-[150px] items-center justify-start overflow-hidden md:min-w-[188px]">
                <Box
                  className={`relative ${
                    showDescription ? "h-[150px] md:h-[187px]" : "h-[107px]"
                  } w-full justify-center overflow-hidden bg-gradient-to-bl from-green-700 to-emerald-900`}
                >
                  <Image
                    height={showDescription ? 173 : 73}
                    width={138}
                    alt={title}
                    className={showDescription ? "w-full self-center" : "self-center"}
                    src={im1}
                    priority
                  />
                </Box>
              </Box>

              <Box className="h-full w-full px-[24px] pt-[24px]">
                <Box>
                  <Box className="justify-center font-Overpass text-xs font-bold uppercase text-gray-700">
                    CATEGORY
                  </Box>
                  <Box className="justify-center pb-[4px] font-Overpass text-lg font-bold leading-relaxed text-slate-950 md:pb-[20px] md:text-2xl">
                    {title}
                  </Box>
                  {showDescription && (
                    <Box className="h-11 w-auto justify-center overflow-hidden text-clip font-Overpass text-sm font-normal text-gray-700">
                      {/* {description} */}
                    </Box>
                  )}
                </Box>
                <Box className="absolute right-[24px] top-[22px] h-6 w-6">
                  <Icon
                    as={() =>
                      isExpanded ? (
                        <Image src={ArrowUpActiveIMG} alt="Arrow Up" />
                      ) : (
                        <Image src={ArrowDownActiveIMG} alt="Arrow Down" />
                      )
                    }
                    className="ml-2"
                  />
                </Box>
              </Box>
            </Box>
          )}
          {level === 332 && (
            <Box className="inline-flex h-28 items-start justify-start self-stretch overflow-hidden rounded-lg bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.22)]">
              <Box className="flex items-center justify-start self-stretch overflow-hidden">
                <Box className="relative w-0 self-stretch" />
                <Box className="relative w-0 self-stretch" />
                <Box className="relative h-48 w-40 overflow-hidden bg-gradient-to-bl from-green-700 to-emerald-900">
                  <Box className="absolute left-0 top-0 h-0 w-80" />
                  <Box className="absolute left-0 top-[14px] h-0 w-40" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="absolute left-[8px] top-[41.50px] h-32 w-40"
                    src="https://placehold.co/153x127"
                    alt="Category placeholder"
                  />
                </Box>
              </Box>
              <Box className="relative h-24 flex-1">
                <Box className="absolute left-[43px] top-[24px] h-36 w-96">
                  <Box className="absolute left-0 top-0 h-12 w-96">
                    <Box className="absolute left-0 top-[3px] w-96 justify-center font-Overpass text-xs font-bold uppercase text-gray-700">
                      CATEGORY
                    </Box>
                    <Box className="absolute left-0 top-[23px] w-96 justify-center font-Overpass text-2xl font-bold leading-relaxed text-slate-950">
                      ENGINE
                    </Box>
                  </Box>
                </Box>
                <Box className="absolute left-[13px] top-[48px] inline-flex items-center justify-start gap-2.5 p-0.5">
                  <Box className="h-4 w-4 rounded-sm border border-stone-300 bg-white" />
                </Box>
                <Box className="absolute left-[517px] top-[42px] h-6 w-6">
                  <Box className="absolute left-[6px] top-[9px] h-1.5 w-3 outline outline-[1.50px] outline-offset-[-0.75px] outline-green-950" />
                </Box>
              </Box>
            </Box>
          )}
          {level > 2 && (
            <CategoryCheckbox
              title={title}
              id={id}
              partialSelected={partialSelected}
              fullSelected={fullSelected}
              handleChange={handleChange}
            />
          )}
        </Box>
        {hasChildren && level > 1 && (
          <Box>
            <RightIconCategoryAccordion
              ref={RightIconRef}
              defaultExpanded={isExpanded}
              onPress={toggleExpand}
            />
          </Box>
        )}
      </Box>

      {hasChildren && (level === 1 || categoriesToShow.length > 0) && (
        <Box className={`flex ${isExpanded ? "pt-[12px]" : ""}`}>
          <Box className={`h-full w-full ${level === 1 ? "" : "pl-[16px]"}`}>
            {categoriesToShow?.map((category: OGCat_NodeProps) => {
              const categoryFullSelected =
                fullSelected || !!SelectedCategoriesId.find((node) => node === category.id);
              const categoryPartialSelected = !!SelectedCategoriesId.find((node) =>
                node.startsWith(category.id),
              );

              return (
                <OGCat_Block
                  key={category.id}
                  title={getTitleOfCategory(category as any, getLocale())}
                  data={Array.isArray(category?.children) ? category.children : []}
                  id={category.id}
                  fullSelected={categoryFullSelected}
                  partialSelected={categoryPartialSelected}
                  state="collapsed"
                  level={level + 1}
                  onCategorySelectionChange={handleChange}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
});

OGCat_Block.displayName = "OGCat_Block";

export default OGCat_Block;
