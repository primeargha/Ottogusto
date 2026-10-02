"use client";

import React, { useEffect, useRef } from "react";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { useTopPartsForCategory } from "@/hooks/topParts";
import { useBranding } from "@/contexts/BrandingContext";
import { useVatString } from "@/hooks/useVatString";
import { OGProductcard } from "@/components/og-components/OGProductcard";
import { isProductCardNavigationSuppressed } from "@/components/og-components/OGDiscountButton";
import { useMedia } from "@/hooks/useMedia";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { formatTitle, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import type { CategoryNode } from "@/types/categories";
import { OGButton } from "@/components/og-components/OGButton";
import NoResultMagniGlass from "./NoResultMagniGlass";
import { NoResultsSkeleton } from "./CategorySkeletons";
import { resolvePartImageDisplay } from "@/utils/partImageUtils";
import {
  appendCategorySearchQuery,
  appendVehicleContextToHref,
  getCarIdsFromSearchParams,
  getVehicleContextFromSearchParams,
  getVinFromSearchParams,
} from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { buildPartPdpHrefFromPathname } from "@/utils/build-part-pdp-url";
import { getBrandManufacturerIdFromSearchParams } from "@/utils/brandManufacturerQuery";
import type { GetPartByIdResponse, PostPartsSearchResponse } from "@/type";

interface CategoryL3TopPartsSectionProps {
  l3Category: CategoryNode;
  locale: string;
  initialProducts?: { data: PostPartsSearchResponse };
  /** Part-brand manufacturer id(s) for brand+L3 — from SSR slug API, mapped to Parts / SRP `manufacturerIds`. */
  manufacturerIds?: string[] | null;
  /** When set (brand+L3), View all button label uses brand name; hide “select manufacturer”. */
  brandName?: string;
}

export default function CategoryL3TopPartsSection({
  l3Category,
  locale,
  initialProducts,
  manufacturerIds,
  brandName,
}: CategoryL3TopPartsSectionProps) {
  const { getLabel, getLocale } = useBranding();
  const vatString = useVatString();
  const isMobile = useMedia("(max-width: 639px)");
  const { data, isLoading, isError } = useTopPartsForCategory(l3Category.id, initialProducts, {
    manufacturerIds: manufacturerIds ?? null,
  });
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const makeModelTypeId = searchParams?.get("makeModelTypeId");
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const partsResponse = data?.data;
  const items = partsResponse?.parts?.slice(0, 8) || [];
  const catalogBaseHref = getRouteLocaleString(Routes.parts, params);
  const catalogHref = appendVehicleContextToHref(
    catalogBaseHref,
    getVehicleContextFromSearchParams(searchParams, { includeCarIds: isNewMmeEnabled }),
  );

  const l3Title = l3Category.titles?.[locale] || l3Category.name || "";
  const resolvedManufacturerIds =
    manufacturerIds && manufacturerIds.length > 0
      ? manufacturerIds
      : searchParams?.get("manufacturerIds")
        ? [searchParams.get("manufacturerIds") as string]
        : (() => {
            const fromBrandQuery = getBrandManufacturerIdFromSearchParams(searchParams);
            return fromBrandQuery ? [fromBrandQuery] : null;
          })();

  const getView = () => {
    if (isMobile) return "Mobile" as const;
    return "Card" as const;
  };

  const urlCarIds = getCarIdsFromSearchParams(searchParams);
  const urlVin = getVinFromSearchParams(searchParams);

  const handleProductClick = (product: GetPartByIdResponse) =>
    buildPartPdpHrefFromPathname(pathname, product?.id, {
      seoName: product?.seo?.name ?? product?.name ?? undefined,
      makeModelTypeId,
      carIds: isNewMmeEnabled && urlCarIds.length > 0 ? urlCarIds : undefined,
      vin: urlVin || undefined,
    });

  // Remembers whether the last *settled* fetch (e.g. before the current vehicle
  // change) had results, so a refetch (isLoading again, e.g. after picking a new
  // vehicle) can show a skeleton matching the likely outcome shape instead of
  // always defaulting to the product-grid skeleton — avoids a CLS jump when a
  // brand+L3 combo that was already empty stays empty across the refetch.
  const hadItemsRef = useRef(true);
  useEffect(() => {
    if (!isLoading) {
      hadItemsRef.current = !isError && items.length > 0;
    }
  }, [isLoading, isError, items.length]);

  if (isLoading && !hadItemsRef.current) {
    return <NoResultsSkeleton />;
  }

  if (isError || (!isLoading && items.length === 0)) {
    return (
      <Box className="flex flex-col gap-space-sm section-standard">
        <Box className="bg-color-background-subtle flex flex-col items-center justify-center gap-space-sm">
          <NoResultMagniGlass className="text-color-text-muted" />
          <Typography className="text-color-text-default typography-heading-03">
            {getLabel("no_results_l3_title")}
          </Typography>
          <Typography className="text-center text-color-text-muted typography-subtitle-01">
            {getLabel("no_results_l3_description")}
          </Typography>
          {/* <a
            href={catalogHref}
            className="rounded-[6px] bg-color-primary-main px-6 py-3 text-center font-semibold text-color-text-inverse typography-body-02 hover:bg-color-primary-hover"
          >
            View all categories
          </a> */}
          <OGButton
            type="primary"
            className="text-color-text-inverse typography-body-02 between-0-640:w-full"
            onClick={() => {
              window.location.href = catalogHref;
            }}
          >
            {getLabel("no_results_l3_cta")}
          </OGButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-space-md section-standard">
      {!brandName ? (
        <Box className="flex flex-col gap-space-xs">
          <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
            {`Top ${formatTitle(l3Title, getLocale() as any)}`}
          </Typography>
          <Typography className="text-color-text-muted typography-body-02">
            {getLabel("select_your_manufacturer")}
          </Typography>
        </Box>
      ) : null}
      {isLoading ? (
        // Same card + view-all pulses as `CategoryTopPartsSkeleton` (category L3 loading).
        <>
          <Box className="grid grid-cols-2 gap-3 gtsm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="animate-pulse h-64 w-full rounded-[6px] bg-color-background-emphasis"
              />
            ))}
          </Box>
          <Box className="animate-pulse bg-color-background-muted mt-4 h-11 w-full rounded" />
        </>
      ) : (
        <>
          <Box className="grid grid-cols-1 grid-gap-listing gtsm:grid-cols-2 gtlg:grid-cols-4">
            {items?.map((product) => {
              const categoryId = product?.categories?.[0]?.slice(0, 9) ?? l3Category.id;
              const { src: productImage } = resolvePartImageDisplay(product?.images, {
                categoryId,
                categoryImageOptions: { width: 180, quality: 80 },
              });

              const isOEM =
                typeof product?.description === "string"
                  ? product.description.toLowerCase().includes("(oem)")
                  : typeof product?.fullDescription === "string"
                    ? product.fullDescription.toLowerCase().includes("(oem)")
                    : false;

              const url = handleProductClick(product);

              return (
                <a
                  key={product.id}
                  href={url || undefined}
                  className="block no-underline"
                  onClick={(e) => {
                    if (isProductCardNavigationSuppressed()) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    const target = e.target;
                    if (
                      target instanceof Element &&
                      (target.closest("[data-og-discount-button] button") ||
                        target.closest("[data-og-add-to-cart]"))
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <OGProductcard
                    product={product as any}
                    view={getView()}
                    id={product.id || 0}
                    description={product.fullDescription ?? ""}
                    onClick={() => {}}
                    {...(productImage ? { imgcomp: productImage } : {})}
                    partname={product.title ?? ""}
                    pricecomp={product.priceInclVat}
                    className="justify-between"
                    vatData={vatString}
                    availability={product.availability ?? "InStock"}
                    oeReference={product.oeReference ?? ""}
                    isOEM={isOEM}
                    manufacturer={product?.manufacturer ?? ""}
                  />
                </a>
              );
            })}
          </Box>

          <Box className="flex w-full justify-center">
            <a
              href={
                params
                  ? buildSearchUrl(
                      l3Category.id,
                      params,
                      searchParams,
                      resolvedManufacturerIds?.[0] ?? null,
                    )
                  : ""
              }
              className="w-full rounded-[6px] bg-button-primary-bg-default py-3 text-center font-semibold text-color-text-inverse typography-body-02 hover:bg-color-primary-hover"
            >
              {brandName
                ? `${getLabel("CarParts_L2_viewall", { category: "" }).replace(/\s+$/, "")} ${brandName}`.trim() ||
                  `View all ${brandName}`
                : getLabel("CarParts_L2_viewall", {
                    category: formatTitle(l3Title, getLocale() as any).toLocaleLowerCase(),
                  })}
            </a>
          </Box>
        </>
      )}
    </Box>
  );
}

function buildSearchUrl(
  categoryId: string,
  params: Record<string, string | string[]>,
  searchParams: ReturnType<typeof useSearchParams>,
  manufacturerId: string | null,
): string {
  // Active car = URL `carIds` only. Guest session history must not re-attach after deselect.
  const urlCarIds = getCarIdsFromSearchParams(searchParams);
  const urlVin = getVinFromSearchParams(searchParams);
  const manufacturerIds =
    manufacturerId ||
    searchParams?.get("manufacturerIds") ||
    getBrandManufacturerIdFromSearchParams(searchParams) ||
    null;

  if (
    getClientFeatureFlag("new_mme_feature_flag") &&
    urlCarIds.length > 0 &&
    params?.["language-country"]
  ) {
    return appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
      categoryId,
      carIds: urlCarIds,
      ...(urlVin ? { vin: urlVin } : {}),
      ...(manufacturerIds ? { manufacturerIds } : {}),
    });
  }

  return appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
    categoryId,
    ...(manufacturerIds ? { manufacturerIds } : {}),
  });
}
