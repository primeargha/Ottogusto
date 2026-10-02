"use client";
import React, { useCallback, useEffect, useState } from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { Box } from "@/components/ui/box";
import { OGCard, OGCardProps } from "./OGCard";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { getImageUrl } from "@/utils/imageUtils";
import Typography, { type TypographyType } from "../Typography";
import { OGLinkButton } from "../OGLinkButton";
import { useBranding } from "@/contexts/BrandingContext";
import { useMmeStore } from "@/stores/useMmeStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { Pressable } from "@/components/ui/pressable";
import { useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import useRouter from "@unitools/router";
import OGPageHeader from "../OGPageHeader";
import OGLayoutXL from "../OGLayoutXL";
import { useMedia } from "@/hooks/useMedia";
import { useBrands } from "@/contexts/BrandsContext";
import slugify from "slugify";
import { appendCategorySearchQuery } from "@/utils/categorySearchUrl";
import OGCarBrandsSectionLayout from "../OGCarBrandsSectionLayout";

export interface OGCardGridProps {
  items: OGCardProps[];
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  onCardClick?: (item: OGCardProps) => void;
  className?: string;
  emptyState?: React.ReactNode;
  categoryId?: string | undefined;
}

/**
 * OGCardGrid - A container component that renders multiple OGCard components
 * @param props - Grid configuration and items to display
 * @returns Grid of cards
 */
export const OGCardGrid: React.FC<OGCardGridProps> = ({
  items,
  columns = 4,
  gap = "md",
  onCardClick,
  className = "",
  emptyState,
  categoryId,
}) => {
  const param = useParams();
  // Map gap values to Tailwind classes
  const gapClasses = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-6",
  };

  // Map column values to Tailwind grid classes
  const columnClasses = {
    1: "grid-cols-2",
    2: "grid-cols-2 md:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
    4: "grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
  };

  const gridClass = `
    grid ${columnClasses[columns]} ${gapClasses[gap]}
    grid-gap-listing
    w-full
    ${className}
  `;

  // Handle empty state
  if (!items || items.length === 0) {
    return (
      <Box className="flex w-full items-center justify-center py-12">
        {emptyState || (
          <p className="text-color-text-placeholder body-regular-md">No items to display</p>
        )}
      </Box>
    );
  }

  return (
    <Box className={`${gridClass}`}>
      {items.map((item) => {
        if (!!param) {
          if (categoryId) {
            const brandSlug = slugify(item.brand || "", { strict: true, trim: true });
            const lang = param["language-country"] as string;
            item.href = appendCategorySearchQuery(Routes.viewMMECategory(lang, brandSlug), {
              categoryId,
            });
          } else {
            item.href = getRouteLocaleString(Routes.categorySelection, param);
          }
        }
        return (
          <OGCard
            key={item.id || Math.random()}
            {...item}
            onClick={() => {
              if (onCardClick) {
                onCardClick(item);
              }
              if (item.onClick) {
                item.onClick();
              }
            }}
          />
        );
      })}
    </Box>
  );
};

interface OGFeatureMakesProps {
  className?: string;
  viewAllBrands?: boolean;
  limit?: number;
  showAll?: boolean;
  ifPage?: boolean;
  hideHeader?: boolean;
  hideTopDivider?: boolean;
  categoryId?: string;
  brandLabelType?: TypographyType;
  items?: OGCardProps[];
}

export const OGFeatureMakes: React.FC<OGFeatureMakesProps> = ({
  className = "",
  viewAllBrands = false,
  limit = 8,
  showAll = false,
  ifPage = false,
  hideHeader = false,
  hideTopDivider = false,
  categoryId,
  brandLabelType,
}) => {
  const [brands, setBrands] = useState<any[]>([]); // Store brands data
  const [mergedData, setMergedData] = useState<OGCardProps[]>([]); // Store merged result
  const [showMore, setShowMore] = useState(false);
  const LIMIT = limit;
  const { savedCarsData } = useSavedCarsStore();
  const { getLabel } = useBranding();
  const isMobile = useMedia("(max-width: 639px)");
  const { setSearchData, resetSearch } = useMmeStore();
  const { updateFilters } = useUrlParams();
  const router = useRouter();
  const params = useParams();

  // ✅ Use BrandsContext instead of React Query (no duplicate API calls)
  const { brands: brandsData, isLoading: isLoadingBrands } = useBrands();
  // Function to merge saved cars with brands
  const mergeBrands = useCallback(() => {
    if (!savedCarsData || !brands) return;

    const savedCarIds = new Set(savedCarsData?.map((car) => car.id));

    // Filter out brands that are already in saved cars
    const filteredBrands: OGCardProps[] = brands
      .filter((brand) => !savedCarIds.has(brand.id))
      .map((brand) => ({
        id: brand.id,
        brand: brand.brand,
        ...(brandLabelType ? { brandLabelType } : {}),
        image: brand.icon,
      }));

    // Format saved cars to include brand names
    const formattedSavedCars = savedCarsData?.map((car): OGCardProps => {
      const matchingBrand = brands.find((brand) => brand.id === car.id);
      return {
        id: car.id,
        brand: matchingBrand ? matchingBrand.brand : car.name, // Assign brand name if found
        ...(brandLabelType ? { brandLabelType } : {}),
        image: car.picture || (matchingBrand ? matchingBrand.icon : ""), // Use car's picture, fallback to brand icon
      };
    });

    // Merge saved cars first, then remaining brands
    const updatedMergedData = [...formattedSavedCars, ...filteredBrands];
    setMergedData(updatedMergedData);
  }, [savedCarsData, brands, brandLabelType]);

  // ✅ Update useEffect to use BrandsContext data
  useEffect(() => {
    if ((brandsData?.length ?? 0) > 0) {
      const results = (brandsData ?? []).map((brand: MakeModelTypeBrandItem) => ({
        id: brand.id,
        brand: brand.brand ?? "",
        sortIdx: brand.sortIdx,
        icon: getImageUrl(brand?.image),
      }));
      setBrands(results);
    } else {
      setBrands([]);
    }
  }, [brandsData]);

  useEffect(() => {
    mergeBrands();
  }, [mergeBrands]);

  const handleBrandClick = (brand: any) => {
    resetSearch();

    let url: string;
    if (categoryId && params) {
      const brandSlug = slugify(brand?.brand || "", { strict: true, trim: true });
      const lang = params["language-country"] as string;
      url = appendCategorySearchQuery(Routes.viewMMECategory(lang, brandSlug), {
        categoryId,
      });
    } else {
      url = getRouteLocaleString(Routes.categorySelection, params);
    }

    router.push(url);
  };
  const brandsnavigation = (id?: number, item?: any) => {
    // router.push(``);
    router.push(getRouteLocaleString(Routes.allbrands, params));
  };

  if (!getClientFeatureFlag("featured_makes_feature_flag")) {
    return null;
  }

  return (
    <Box className="flex w-full flex-col bg-color-background-default gap-stack">
      {/* {!isMobile && <Box className="w-full" />} */}

      <Box className="w-full" />

      <Box className="">
        <Box className="h-[1px] w-full bg-color-border-default" />
      </Box>

      {/* bg-color-border-default */}
      <OGCarBrandsSectionLayout className="flex flex-col gap-8">
        {ifPage && (
          <OGPageHeader
            title={getLabel("our_brands_your_trust")}
            onIconClick={() => {
              router.back();
            }}
          />
        )}
        {!ifPage && !hideHeader && (
          <Typography type="h2" className="typography-heading-02">
            {getLabel("our_brands_your_trust")}
          </Typography>
        )}
        {/* Visible ONLY on `md` (medium) and above */}
        {/* {getClientFeatureFlag("view_all_brands_page_flag") && viewAllBrands && ( */}
        {false && (
          <Box className="absolute right-4 top-[19px] hidden h-[18px] w-[174px] flex-col items-end justify-center gap-3 pr-[29px] md:block">
            <Pressable
              onPress={() => brandsnavigation()}
              className="relative cursor-pointer justify-start text-right text-color-primary-main underline body-regular-sm"
            >
              <Typography onlyTypo className="text-color-primary-main body-regular-sm">
                {getLabel("view_all_brands")}
              </Typography>
            </Pressable>
          </Box>
        )}
        {isLoadingBrands && mergedData.length === 0 ? (
          <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
            {Array.from({ length: LIMIT }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box
                key={index}
                className="animate-pulse flex h-32 w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis p-4"
              >
                <Box className="bg-color-background-muted h-10 w-full rounded" />
                <Box className="bg-color-background-muted h-4 w-2/3 rounded" />
              </Box>
            ))}
          </Box>
        ) : (
          <OGCardGrid
            onCardClick={handleBrandClick}
            categoryId={categoryId}
            items={mergedData
              .filter((item) => item?.image !== "")
              .slice(0, showMore ? mergedData.length : LIMIT)}
          />
        )}

        {showAll && (
          <Box className="flex items-center justify-center">
            <OGLinkButton
              onClick={() => {
                setShowMore(!showMore);
              }}
              textClass="typography-body-01 text-button-ghost-text"
            >
              {getLabel(showMore ? "show_less_brands" : "show_more_brands")}
            </OGLinkButton>
          </Box>
        )}
      </OGCarBrandsSectionLayout>

      {/* {!isMobile && (
      )} */}
      {/* <Box className="">
        <Box className="h-[1px] w-full bg-red-600" />
      </Box> */}

      {/* {!isMobile && <Box className="w-full"></Box>} */}
    </Box>
  );
};

export { OGCard };
export type { OGCardProps };
