"use client";

import React, { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import OGBreadcrumb, { BreadcrumbLink } from "@/components/og-components/OGBreadcrumb";
import { useCategories } from "@/contexts/CategoriesContext";
import type { CategoryNode } from "@/types/categories";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { formatTitleObject, toSentenceCase } from "@/utils/languageFormating";
import { Box } from "@/components/ui/box";
import { computeTaxonomyPrefixPath } from "./searchResultsTaxonomyPath";
import {
  appendVehicleContextToHref,
  getCategoryIdFromSearchParams,
  getVehicleContextFromSearchParams,
  pickPrimaryCategoryId,
  type VehicleContextQuery,
} from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { isOtherCategoryId } from "@/utils/singleCategoryFilter";

interface SearchResultsBreadcrumbProps {
  isCategoryCatalogPage: boolean;
  isProductDetailsPage: boolean;
  /** From `useUrlParams().filters.categoryId` — reliable when `useSearchParams` lags. */
  categoryId?: string | null;
}

export default function SearchResultsBreadcrumb({
  isCategoryCatalogPage,
  isProductDetailsPage,
  categoryId: categoryIdFromFilters,
}: SearchResultsBreadcrumbProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";
  const searchParams = useSearchParams()!;
  const { data: categoriesData, isPending: categoriesPending } = useCategories();
  const { getLabel } = useBranding();

  const { languageCountry, lang } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const lc = (segments[0] as string) || "";
    const l = lc.split("-")[0] || "en";
    return { languageCountry: lc, lang: l };
  }, [pathname]);

  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const vehicleContext = useMemo(
    () =>
      getVehicleContextFromSearchParams(searchParams, {
        includeCarIds: isNewMmeEnabled,
      }),
    [searchParams, isNewMmeEnabled],
  );

  const categoryIdParam =
    pickPrimaryCategoryId([categoryIdFromFilters, getCategoryIdFromSearchParams(searchParams)]) ??
    "";

  const taxonomyPath: CategoryNode[] = useMemo(
    () => computeTaxonomyPrefixPath(categoriesData as CategoryNode[] | undefined, categoryIdParam),
    [categoriesData, categoryIdParam],
  );

  const partsHref = useMemo(
    () => appendVehicleContextToHref(Routes.parts(languageCountry), vehicleContext),
    [languageCountry, vehicleContext],
  );

  const { links, activeLabel } = useMemo(() => {
    let breadcrumbLinks: BreadcrumbLink[];
    let active = getLabel("car_parts");

    if (isOtherCategoryId(categoryIdParam)) {
      breadcrumbLinks = [
        { label: getLabel("home"), href: `/${languageCountry}` },
        { label: getLabel("car_parts"), href: partsHref },
      ];
      active = getLabel("other_category");
    } else if (taxonomyPath.length === 0) {
      breadcrumbLinks = [{ label: getLabel("home"), href: `/${languageCountry}` }];
    } else {
      breadcrumbLinks = [
        { label: getLabel("home"), href: `/${languageCountry}` },
        { label: getLabel("car_parts"), href: partsHref },
      ];

      const lastNode = taxonomyPath[taxonomyPath.length - 1]!;
      active = formatTitleObject(lastNode.titles)?.[lang] || lastNode.name || active;

      taxonomyPath.forEach((_, index) => {
        if (index === taxonomyPath.length - 1) return;
        const slice = taxonomyPath.slice(0, index + 1);
        const href = buildCategoryHref(slice, languageCountry, lang, vehicleContext);
        if (href) {
          const lastInSlice = slice[slice.length - 1]!;
          const label = lastInSlice.titles?.[lang] || lastInSlice.name || "";
          breadcrumbLinks.push({ label, href });
        }
      });
    }

    return { links: breadcrumbLinks, activeLabel: active };
  }, [categoryIdParam, getLabel, lang, languageCountry, partsHref, taxonomyPath, vehicleContext]);

  // Only show on SRP – not on category catalog or PDP
  if (isCategoryCatalogPage || isProductDetailsPage) {
    return null;
  }

  if (categoriesPending) {
    // Matches the PDP breadcrumb's own loading reserve
    // (ProductDetailsPageLoading.tsx) so swapping in the real, possibly
    // multi-crumb breadcrumb doesn't pop in from a "Home"-only fallback.
    return (
      <Box className="section-standard">
        <Box className="flex items-center py-space-sm">
          <Box className="animate-pulse h-4 w-2/3 rounded bg-color-background-emphasis" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="section-standard">
      <OGBreadcrumb links={links} active={toSentenceCase(activeLabel)} />
    </Box>
  );
}

function buildCategoryHref(
  nodes: CategoryNode[],
  languageCountry: string,
  lang: string,
  vehicleContext: VehicleContextQuery,
): string | null {
  if (nodes.length === 0) return null;

  const l1 = nodes[0]!;
  const l1Slug = l1.slugs?.[lang] || "";

  if (!l1Slug) return null;

  if (nodes.length === 1) {
    return appendVehicleContextToHref(Routes.categoryL1(languageCountry, l1Slug), vehicleContext);
  }

  const l2 = nodes[1]!;
  const l2Slug = l2.slugs?.[lang] || "";
  if (!l2Slug) return null;

  if (nodes.length === 2) {
    return appendVehicleContextToHref(
      Routes.categoryL2(languageCountry, l1Slug, l2Slug),
      vehicleContext,
    );
  }

  const l3 = nodes[2]!;
  const l3Slug = l3.slugs?.[lang] || "";
  if (!l3Slug) return null;

  return appendVehicleContextToHref(
    Routes.categoryL3(languageCountry, l1Slug, l2Slug, l3Slug),
    vehicleContext,
  );
}
