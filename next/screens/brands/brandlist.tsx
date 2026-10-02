"use client";
import { Box } from "@/components/ui/box";
import useRouter from "@unitools/router";
import type { MakeModelTypeBrandItem } from "@/type";
import { useBranding } from "@/contexts/BrandingContext";
import Productnavigation from "@/screens/productdetails/productnavigation";

import { useBrands } from "@/contexts/BrandsContext";
import ImageCardPopularBrands from "./ImageCardPopularBrands";
import ImageCardAllBrands from "./ImageCardAllBrands";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { useMmeStore } from "@/stores/useMmeStore";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";

export default function AllBrands() {
  const router = useRouter();
  const params = useParams();
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const { brands, isLoading } = useBrands();
  const { setSearchData } = useMmeStore();

  // ✅ Transform brands data to match the expected format
  const brandsList =
    brands?.map((brand: MakeModelTypeBrandItem) => ({
      id: brand.id,
      brand: brand.brand ?? "",
      sortIdx: brand.sortIdx,
      icon: brand.image ?? "",
    })) || [];

  if (isLoading || brandsList?.length === 0) {
    return <div>Loading...</div>;
  }

  const handleBrandClick = (brand: any) => {
    const categoryCatalogUrl = getRouteLocaleString(Routes.categorySelection, params);
    const url = `${categoryCatalogUrl}?makeModelTypeId=${brand?.id}`;
    router.push(url);
  };
  return (
    <Box className="flex h-full w-full flex-col gap-6 bg-color-background-default pb-[10px] pt-[110px] gtlg:px-[38px] gtlg:pt-[110px]">
      <Box className="flex w-full flex-row items-center base:gap-3 base:px-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
        <Productnavigation />
        <Box className="font-Anton font-normal leading-[40px] tracking-[0px] text-color-text-body base:text-[16px] gtsm:text-[16px] gtlg:text-[28px]">
          {getLabel("find_make_fuel_your_drive")}
        </Box>
      </Box>

      {/* Popular brands block */}
      <Box className="flex h-auto w-full flex-col gap-6 bg-[var(--color-beige-800)] px-[38px] py-6">
        <Box className="flex w-full flex-col gap-3">
          <Box className="font-Overpass text-[24px] font-bold not-italic leading-[26px] text-color-text-body">
            {getLabel("popular_brands")}
          </Box>

          <Box className="font-Overpass text-[16px] font-normal leading-[18px]">
            {getLabel("popular_brands_parah")}
          </Box>
        </Box>

        <div className="popular-brand-container">
          {/* apply grid here, below is the single  */}
          {brandsList.slice(0, 5)?.map((data) => (
            <ImageCardPopularBrands key={data.id} data={data} handleBrandClick={handleBrandClick} />
          ))}
        </div>
      </Box>

      {/* all brands block */}
      <Box className="flex h-auto w-full flex-col gap-6 bg-[var(--color-beige-800)] py-6 base:px-[36px] gtlg:px-[38px]">
        <Box className="flex w-full flex-col gap-3">
          <Box className="font-Overpass text-[24px] font-bold not-italic leading-[26px] text-color-text-body">
            {getLabel("all_brands")}
          </Box>

          <Box className="font-Overpass text-[16px] font-normal leading-[18px]">
            {getLabel("all_brands_parah")}
          </Box>
        </Box>

        <div className="popular-brand-container">
          {/* apply grid here, below is the single  */}
          {brandsList?.map((data) => (
            <ImageCardAllBrands key={data.id} data={data} handleBrandClick={handleBrandClick} />
          ))}
        </div>
      </Box>
    </Box>
  );
}
