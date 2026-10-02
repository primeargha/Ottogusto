import React, { useState } from "react";

import { Box } from "@/components/ui/box";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
// import Image from "next/image";
import { useCategories } from "@/contexts/CategoriesContext";
import { Spinner } from "@/components/ui/spinner";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { usePathname } from "next/navigation";
import { useBranding } from "@/contexts/BrandingContext";
import CategoryTile from "./category-tile";
import Typography from "@/components/og-components/Typography";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { getClientFeatureFlag } from "@/utils/theme-utils";
type Props = {
  noWrap?: boolean;
  showDescription?: boolean;
  columnCount?: number;
  phoneColumnCount?: number;
};

const MainBlock = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const { noWrap = false, columnCount = 2, phoneColumnCount = 1, showDescription = true } = props;
  let { data: CategoryNestedList, isPending } = useCategories();
  const { L1CatExpanded, setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const pathname = usePathname();
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
  };

  const DEFAULT_DESCRIPTION = `Sagittis, eu pretium massa quisque cursus augue massa cursus. Sed quisque velit, auctor
            at lobortis hac tincidunt sodales id.`;

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
            {CategoryNestedList?.map((node: PartsCategoryInterface, index: number) => {
              return (
                <CategoryTile
                  id={node.id}
                  parentId={node.parentId}
                  handleExpand={handleExpand as any}
                  expanded={L1CatExpanded?.startsWith(node.id) || false}
                  key={node.id}
                  title={getTitleOfCategory(node, getLocale())}
                  subcategories={node?.children || []}
                  showDescription={showDescription}
                  description={node?.descriptions?.[getLocale()] ?? DEFAULT_DESCRIPTION}
                  ref={(el) => {
                    if (
                      el &&
                      L1CatExpanded?.startsWith(node.id) &&
                      pathname &&
                      !(pathname.replaceAll(/\/..-..\//gi, "") === "" || pathname === "/")
                    ) {
                      // debugger;
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                />
              );
            })}
            {/* </Box> */}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </>
  );

  if (noWrap) {
    return <>{MainContent}</>;
  }

  return (
    <Box
      className={`min-h-[848px] bg-color-background-default px-[12px] pt-[39px] gtsm:pr-[38px] md:pb-[58px] ${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[220px]" : ""}`}
    >
      <Box className="items-center gap-2 pb-[37px]">
        <Typography
          type="h2"
          className="justify-center text-center text-color-text-emphasis typography-heading-02"
        >
          {getLabel("categorysection_btf_title1")}
        </Typography>
        <Box className="justify-center text-color-text-muted body-regular-md">
          {getLabel("categorysection_btf_title2")}
        </Box>
      </Box>
      {MainContent}
    </Box>
  );
};

export default MainBlock;
