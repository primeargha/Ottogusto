import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { formatTitle, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import Image from "next/image";
import React from "react";

type Props = {
  data: PartsCategoryInterface;
  imgSrcOveride?: string;
  onClick?: (category: PartsCategoryInterface) => void;
};

const CategoryL3Card = (props: Props) => {
  const { data, imgSrcOveride, onClick } = props;
  const { getLocale } = useBranding();

  const categoryImageUrl = getCategoryImageUrl(data.id, { width: 64, quality: 80 });

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <Box
      //@ts-ignore
      onClick={handleClick}
      className={`active:border-1 group flex min-h-[64px] w-full cursor-pointer flex-row items-center justify-start gap-2 rounded-[6px] border border-color-border-default bg-color-background-default py-1 pl-2 pr-3 transition-all hover:border-color-border-focus active:border-color-border-focus`}
    >
      <Image
        className="h-14 w-14 lg:h-16 lg:w-16"
        width={64}
        height={64}
        alt={getTitleOfCategory(data, getLocale())}
        title={getTitleOfCategory(data, getLocale())}
        src={imgSrcOveride ? imgSrcOveride : categoryImageUrl}
        unoptimized
      />
      <Box className="line-clamp-2 flex-1 justify-start font-Overpass text-sm font-semibold leading-[22px] text-color-text-default">
        {formatTitle(getTitleOfCategory(data, getLocale()), getLocale() as any)}
      </Box>
    </Box>
  );
};

export default CategoryL3Card;
