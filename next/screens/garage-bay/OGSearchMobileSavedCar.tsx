import { useEffect, useState } from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { OGButton } from "@/components/og-components/OGButton";
import Image from "next/image";
import QuickSearchIcon from "@/assets/search/quick-search-w.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search-black.svg";
import StarFavourite from "@/components/icons/StarFavourite";
import { useBranding } from "@/contexts/BrandingContext";
import { carouselImages } from "@/constants";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useUrlParams } from "@/hooks/useUrlParams";

interface SavedCarItem {
  isNew?: boolean;
  picture?: string;
  name?: string;
  isFavorite?: boolean;
  info?: string;
  type?: string;
  year?: string;
  vin?: string;
  brandName?: string;
  modelName?: string;
  typeName?: string;
}

interface OGSearchMobileSavedCarProps {
  item: SavedCarItem;
  isOGSearch?: boolean;
  onQuickSearch: () => void;
  //   onAdvancedSearch: () => void;
}

export const OGSearchMobileSavedCar = ({
  item,
  isOGSearch,
  //   onQuickSearch,
  //   onAdvancedSearch,
}: OGSearchMobileSavedCarProps) => {
  const { getLabel } = useBranding();
  const { openAdvSearch } = useAdvancedSearchStore();
  const { closeOgSearchModal, setSearchData, getMakeModelTypeId, searchData } =
    useSearchModalStore();
  const { updateFilters } = useUrlParams();

  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  const [localSearchData, setLocalSearchData] = useState({
    make: null,
    model: null,
    year: null,
    type: null,
  });

  const onQuickSearch = async () => {
    const value = await formatEditSearchData(item);
    setSearchData(value);

    const makeModelTypeId = await getMakeModelTypeId();
    if (!makeModelTypeId) {
      console.error("OGSearchMobileSavedCar: makeModelTypeId is null");
      return;
    }
    updateFilters(
      {
        makeModelTypeId,
        year: value?.year?.value || null,
      },
      "/products",
    );
    // closeOgSearchModal();
  };

  const onAdvancedSearch = async () => {
    const value = await formatEditSearchData(item);
    setSearchData(value);
    closeOgSearchModal();
    openAdvSearch("saved-cars");
  };

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text || "";
  };
  return (
    <Box className="flex min-h-[162px] w-full flex-col gap-[16px]">
      {item?.isNew && (
        <Box
          data-property-1="Default"
          className="absolute -top-3 right-3 inline-flex items-center justify-start gap-2.5 rounded-lg bg-emerald-900 p-2"
        >
          <Box className="justify-start font-Overpass text-base font-normal leading-none text-white">
            {getLabel("new")}
          </Box>
        </Box>
      )}
      <Box className="flex flex-col items-start justify-start gap-[12px] self-stretch">
        <Box className="inline-flex items-start justify-start gap-[5px] self-stretch">
          <Box className="inline-flex flex-row items-center justify-start gap-3">
            {item?.picture && !isOGSearch && (
              <Box className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden">
                {/* Clipping Path */}
                <Box className="absolute inset-0 bg-gray-200 [clip-path:polygon(20%_0,_100%_0,_100%_60%,_50%_100%,_0_100%,_0_10%)]" />

                {/* Image Container */}
                <Box className="relative h-full w-full overflow-hidden [clip-path:polygon(20%_0,_100%_0,_100%_70%,_60%_100%,_0_100%,_0_10%)]">
                  <Image
                    src={item?.picture ? item?.picture : carouselImages.b}
                    width={100}
                    height={100}
                    alt="Car"
                    className="h-full w-full object-cover"
                  />
                </Box>
              </Box>
            )}
            <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
              <Box className="inline-flex flex-row items-center justify-between gap-[20px]">
                <Box className="justify-start font-Anton text-[28px] font-normal leading-[40px] text-color-text-body">
                  {truncateText(
                    item?.name
                      ? (item?.name).toUpperCase()
                      : (item?.brandName + " " + item?.modelName).toUpperCase(),
                    30,
                  )}
                </Box>
                {item.isFavorite && (
                  <Box className="flex-shrink: 0 flex items-center justify-center rounded bg-[--Background-Favourite-Star] p-1">
                    <StarFavourite />
                  </Box>
                )}
              </Box>
              <Box className="font-Overpass text-[18px] font-normal leading-[20px] text-color-text-body">
                {item?.name ? (
                  <>
                    {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
                  </>
                ) : (
                  item.typeName
                )}
              </Box>
              <Box className="flex w-full flex-row items-center">
                {/* <Box className="flex flex-row items-center font-Overpass text-[16px] text-color-text-body">
                  <Text className="font-normal leading-[18px] text-color-text-body">
                    {getLabel("model_year")}
                  </Text>
                  <Text className="font-bold leading-[18px] tracking-[0.96px] text-color-text-body">
                    {item?.year}
                  </Text>
                </Box> */}
                {item?.vin && (
                  <Box className="ml-[12px] flex flex-row items-center font-Overpass text-[16px] leading-[18px] text-color-text-body">
                    <Text className="font-normal leading-[18px] text-color-text-body">
                      {getLabel("vin")}
                    </Text>
                    <Text className="font-bold leading-[18px] tracking-[0.96px] text-color-text-body">
                      {item?.vin || "DSS88133PL"}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="flex h-auto w-full flex-row gap-[16px]">
        <OGButton
          onClick={onQuickSearch}
          type="primary"
          size="medium"
          className="flex-1"
          leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" height={20} width={20} />}
        >
          {getLabel("quick_search")}
        </OGButton>
        <OGButton
          onClick={onAdvancedSearch}
          type="outlined"
          size="medium"
          className="flex-1"
          leftcomp={<Image src={AdvancedSearchIcon} alt="Advanced Search" height={20} width={20} />}
        >
          {getLabel("advanced_search")}
        </OGButton>
      </Box>
    </Box>
  );
};
