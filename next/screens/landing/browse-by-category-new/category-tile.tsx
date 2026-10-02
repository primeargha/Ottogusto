import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import im1 from "./assets/carengine.png";
import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import L2CategorySection from "./l2-l3-category-block";
import L2CategorySectionAdvSearchModal from "@/screens/advanced-search/l2-l3-category-block";
import React, { forwardRef } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { getCategoryImageUrl } from "@/utils/imageUtils";

type CategoryTileProps = {
  expanded?: boolean;
  handleExpand?: (args: { id: string; parentId: string }) => void;
  id: string;
  parentId: string;
  title: string;
  description?: string;
  subcategories?: object[];
  showDescription?: boolean;
};

const DEFAULT_DESCRIPTION = `Sagittis, eu pretium massa quisque cursus augue massa cursus. Sed quisque velit, auctor
            at lobortis hac tincidunt sodales id.`;

const CategoryTile = forwardRef<HTMLDivElement, CategoryTileProps>(
  (
    {
      handleExpand, // This prop will be ignored
      ...restProps
    },
    ref,
  ) => {
    const {
      id,
      parentId,
      expanded = false,
      title,
      description = DEFAULT_DESCRIPTION,
      subcategories,
      showDescription = true,
    } = restProps;
    const { getLabel } = useBranding();

    const categoryImageUrl = getCategoryImageUrl(id);

    const handleClick = () => {
      handleExpand?.({ id, parentId });
    };

    return (
      <Box ref={ref as any} className="min-h-6 flex-1 break-inside-avoid">
        <Box
          className={`cursor-pointer flex-row items-start justify-start overflow-hidden ${
            expanded ? "rounded-t-lg" : "rounded-lg"
          } bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.22)]`}
          onClick={handleClick}
        >
          <Box className="min-w-[150px] flex-col items-center justify-center overflow-hidden bg-red-400 base:h-full md:min-w-[188px]">
            <Box
              className={`relative ${
                showDescription ? "base:h-full md:h-[187px]" : "h-[107px] base:h-full"
              } h-full w-full flex-1 flex-row overflow-hidden bg-gradient-to-bl from-green-700 to-emerald-900 base:justify-start md:justify-center`}
            >
              <Image
                height={showDescription ? 173 : 73}
                width={138}
                alt={title}
                className={showDescription ? "w-full self-center" : "self-center"}
                src={categoryImageUrl}
                priority
                unoptimized
              />
            </Box>
          </Box>

          <Box className="h-full w-full p-6">
            <Box className="content-between gap-2">
              <Box className="justify-center font-Overpass text-xs font-bold uppercase text-gray-700">
                {getLabel("category")}
              </Box>
              <Box className="justify-center pb-[4px] text-color-text-body body-bold-lg">
                {title}
              </Box>
              {showDescription && (
                <Box
                  title={description}
                  className="w-auto justify-start text-color-text-body body-regular-sm"
                >
                  {description}
                </Box>
              )}
            </Box>
            <Box className="absolute right-[24px] top-[22px] h-6 w-6">
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
        </Box>

        {expanded && (
          <>
            {showDescription ? (
              //@ts-ignore
              <L2CategorySection id={id} parentId={parentId} categories={subcategories} level={2} />
            ) : (
              <L2CategorySectionAdvSearchModal
                id={id}
                parentId={parentId}
                //@ts-ignore
                categories={subcategories}
                level={2}
              />
            )}
          </>
        )}
      </Box>
    );
  },
);

CategoryTile.displayName = "CategoryTile";

export default CategoryTile;
