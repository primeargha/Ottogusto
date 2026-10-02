import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { getAvailableBrands, getBrandsWithCarImage } from "@/services/landingPageDataService";
import React, { useEffect, useState } from "react";
import PreviousSearchCarousel from "../previous-search-carousel";
import { Text } from "@/components/ui/text";
import { BrandInterface, useBrandsAndPartsStore } from "@/stores/useBrandsAndPartsStore";
import { Pressable } from "@/components/ui/pressable";
import { BRANDS_SLIDER_ACTIVE_BRAND_ID, MAX_COUNT } from "@/constants";
import { getModalTypes } from "@/services/search";
import { useBrands } from "@/contexts/BrandsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import Link from "next/link";
import { shouldNofollowBreadcrumbHref } from "@/utils/seoUrlParams";
import { getRouteLocaleString, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { redirect, RedirectType, useParams } from "next/navigation";

type Props = {};
interface BrandsSliderInterface {
  onItemsClick: (fn: any) => void;
  onceDataLoaded: (selectedBrand: any) => void;
}

const BrandsSlider = ({ onItemsClick, onceDataLoaded }: BrandsSliderInterface) => {
  const { activeBrandId, setActiveBrandId, brandsList, updateBrandsList } =
    useBrandsAndPartsStore();
  // ✅ Use BrandsContext instead of React Query (no duplicate API calls)
  const { brands: brandsData } = useBrands();

  const handleBrandSelection = (brand: any) => {
    onItemsClick(brand);
  };

  useEffect(() => {
    if (brandsData && brandsData.length > 0) {
      updateBrandsList(brandsData);

      // First brand will be selected
      if (!!brandsData[0]?.id) {
        setActiveBrandId(brandsData[0].id);
        handleBrandSelection(brandsData[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandsData, updateBrandsList, setActiveBrandId, onItemsClick]);

  // Sets first brand as selected default
  useEffect(() => {
    if (brandsList.length > 0) {
      onceDataLoaded(brandsList[0]);
    }
  }, [brandsList, onceDataLoaded]);

  function formatBrand(brand?: string): string {
    if (!brand) return "";
    if (brand.toUpperCase() === "BMW") return "BMW"; // special case

    // Title case the rest
    return brand.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <Box className="flex h-[72px] flex-row items-center justify-start gap-12 gap-2 overflow-visible">
      {/* <pre>{JSON.stringify(brandsList, null, 2)}</pre> */}

      <PreviousSearchCarousel
        items={brandsList}
        config={{
          itemsPerView: {
            desktop: 3,
            mobile: 2,
          },
          isPlain: true,
          isSavedCar: false,
          containerClassName: `w-full ml-[-15px] pr-[10px]`,
          cardClassName: `h-[42px] text-white flex-none pr-[45px]`,
          renderCard: (props: {
            model: string;
            brand: string;
            image: string;
            id: string;
            sortIdx: number;
          }) => {
            const { brand, image, id, sortIdx } = props;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setActiveBrandId(id);
                  handleBrandSelection(props);
                }}
              >
                <Box className="h-[42px] items-start justify-start pr-4">
                  <Box className="text-nowrap body-bold-md">
                    {formatBrand(brand)}
                    {activeBrandId == id && <Box className="h-0.5 bg-white" />}
                  </Box>
                </Box>
              </Pressable>
            );
          },
        }}
      />
    </Box>
  );
};

const BrandsAndPartsSection = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  const params = useParams();
  const [ShowMoreEnabled, setShowMoreEnabled] = useState(false);
  const [Limit, setLimit] = useState(6);
  const [ModelsList, setModelsList] = useState<any>();
  const { activeBrand, setActiveBrand } = useBrandsAndPartsStore();
  const { data: nestedCategories } = useCategories();
  // const l2Categories = nestedCategories?.flatMap((node:BrandInterface) => node?.children || []);
  const l2Categories = nestedCategories;

  const getLink = (categoryId: string, makeModelTypeId: string) => {
    return `${getRouteLocaleString(Routes.searchresults, params)}?makeModelTypeId=${makeModelTypeId}&categoryId=${categoryId}&take=${MAX_COUNT}&order=priority`;
  };
  return (
    <Box>
      <Box className="mb-[48px] font-Anton text-[38px] font-normal leading-[50px] text-white">
        {getLabel("footer_seo_links_section_title")}
      </Box>
      <Box className="justify-center text-center align-middle text-slate-400">
        <BrandsSlider
          onceDataLoaded={(selectedBrand: any) => {
            setActiveBrand(selectedBrand);
          }}
          onItemsClick={async (item) => {
            // debugger;
            setShowMoreEnabled(false);
            setLimit(6);
            const modelsResponse = await getModalTypes(item.id);
            // debugger;
            setModelsList(modelsResponse.data);
            setActiveBrand(item);
          }}
        />

        {/* Selected brand parts section */}
        <Box className="grid cursor-pointer grid-cols-3 text-left md:grid-cols-6">
          {/* <pre>{JSON.stringify(Limit, null, 2)}</pre> */}
          {ModelsList &&
            ModelsList &&
            ModelsList?.slice(0, Limit)?.map((node: BrandInterface, indx: number) => {
              return (
                <Pressable
                  key={indx}
                  onPress={() => {
                    // Navigate
                  }}
                >
                  <Box className="py-[24px] pr-[43px]">
                    <Box
                      title={node.model + " " + node.type}
                      className="self-stretch truncate text-white body-bold-sm"
                    >
                      {/* {JSON.stringify(node, null, 2)} */}
                      {`${node.model} ${node.type}`}
                    </Box>
                    <Box className="line-clamp-1 self-stretch overflow-ellipsis py-[3px] text-color-background-l3 text-single-100-regular">
                      {/* {node.Model} */}
                      {/* <pre>
                        {JSON.stringify(node,null,2)}
                      </pre> */}
                      {l2Categories &&
                        l2Categories.map((cat) => {
                          return (
                            <Link
                              key={cat.id}
                              prefetch
                              aria-details={cat.name}
                              title={cat.name}
                              rel={
                                shouldNofollowBreadcrumbHref(getLink(cat.id, node.id))
                                  ? "nofollow"
                                  : undefined
                              }
                              onClick={() => {
                                const url = getLink(cat.id, node.id);
                                // redirect(url, RedirectType.push);
                                if (typeof window !== "undefined") {
                                  window.location.href = url;
                                }
                              }}
                              href={getLink(cat.id, node.id)}
                            >
                              {/* {JSON.stringify(cat)} */}
                              {getTitleOfCategory(cat, getLocale())}
                            </Link>
                          );
                        })}
                    </Box>
                  </Box>
                </Pressable>
              );
            })}
          {/* <pre>
              {ModelsList?.length || ""}-
              {Limit}
            </pre> */}
          {Limit === 6 && (
            <Box className="min-h-[41px] justify-center py-[24px]">
              <Pressable
                onPress={() => {
                  setShowMoreEnabled(true);
                  setLimit(1000);
                }}
              >
                <Box className="text-color-accent-main underline body-regular-sm">
                  {getLabel("show_more")}
                </Box>
              </Pressable>
            </Box>
          )}
          {Limit === 1000 && ShowMoreEnabled && (
            <Box className="min-h-[41px] justify-center py-[24px]">
              <Pressable
                onPress={() => {
                  setShowMoreEnabled(false);
                  setLimit(6);
                }}
              >
                <Box className="text-color-accent-main underline body-regular-sm">
                  {getLabel("view_less")}
                </Box>
              </Pressable>
            </Box>
          )}
        </Box>
        {/* {getLabel("under_progress")} */}
      </Box>
    </Box>
  );
};

export default BrandsAndPartsSection;
