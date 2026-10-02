import { Box } from "@/components/ui/box";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCategories } from "@/contexts/CategoriesContext";
import { Spinner } from "@/components/ui/spinner";
import CategoryTile from "./category-tile";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { flattenTree } from "@/helpers/UtilityHelper";
type Props = {
  noWrap?: boolean;
  showDescription?: boolean;
  columnCount?: number;
  phoneColumnCount?: number;
};

const MainBlock = (props: Props) => {
  const { noWrap = false, columnCount = 2, phoneColumnCount = 1, showDescription = true } = props;
  let { data: CategoryNestedList, isPending } = useCategories();
  const flatCategoriesList = flattenTree(CategoryNestedList as any, "children");
  const { L1CatExpanded, setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const { appendToSelectedCategories, SelectedCategoriesId } = useCategorySearchStore();
  const handleExpand = ({
    id,
    parentId,
    expanded,
  }: {
    id: string;
    parentId: string;
    expanded: boolean;
  }) => {
    setL1CatExpanded(id);
    setL2CatExpanded(null);
    // setExpandedL1CatId(id);
  };
  // if (isPending) {
  //   return <Spinner />;
  // }

  const handleCategorySelectionChange = (ifChecked: boolean, categoryId: any) => {
    const updatedCategoryList = flatCategoriesList.find((node: any) => node.id === categoryId);
    appendToSelectedCategories(updatedCategoryList as PartsCategoryInterface);
  };
  const expandedCategoryRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (expandedCategoryRef.current && !hasScrolledRef.current) {
      expandedCategoryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolledRef.current = true;
    }
  }, []); // Only on mount

  const MainContent = (
    <>
      {isPending && <Spinner />}

      {!isPending && (
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: phoneColumnCount, 750: columnCount, 900: columnCount }}
          gutterBreakPoints={
            { 350: "24px", 750: "124px", 900: "24px" } as unknown as {
              [breakpoint: number]: number;
            }
          }
        >
          <Masonry columnsCount={columnCount}>
            {CategoryNestedList?.map((categoryNode: PartsCategoryInterface, index: number) => {
              const fullSelected = false;
              const categoryFullSelected =
                fullSelected || !!SelectedCategoriesId.find((node) => node === categoryNode.id);
              const categoryPartialSelected = !!SelectedCategoriesId.find((node) =>
                node?.startsWith(categoryNode.id),
              );
              const isExpanded = L1CatExpanded?.startsWith(categoryNode.id);
              return (
                //@ts-ignore
                <CategoryTile
                  id={categoryNode.id ?? ""}
                  category={categoryNode}
                  parentId={categoryNode.parentId ?? ""}
                  handleExpand={handleExpand}
                  expanded={isExpanded}
                  key={categoryNode.id}
                  title={categoryNode?.titles?.en ?? ""}
                  subcategories={categoryNode?.children}
                  showDescription={showDescription ?? false}
                  fullSelected={categoryFullSelected}
                  partialSelected={categoryPartialSelected}
                  onCategorySelectionChange={handleCategorySelectionChange}
                  ref={isExpanded ? expandedCategoryRef : undefined}
                />
              );
            })}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </>
  );

  if (noWrap) {
    return <>{MainContent}</>;
  }

  return (
    <Box className="min-h-[848px] bg-[--background-neutral-chrome-200] px-[12px] pt-[39px] md:px-[76px] md:pb-[58px]">
      <Box className="items-center gap-2 pb-[37px]">
        <Box className="justify-center text-center font-Anton text-3xl font-normal text-black">
          Discover by Category. Find Your Fit.
        </Box>
        <Box className="justify-center font-Overpass text-base font-normal text-black">
          Your next favourite find is just a few click away
        </Box>
      </Box>
      {MainContent}
    </Box>
  );
};

export default MainBlock;
