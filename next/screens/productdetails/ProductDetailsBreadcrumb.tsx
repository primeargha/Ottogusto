"use client";

import React, { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import OGBreadcrumb, { BreadcrumbLink } from "@/components/og-components/OGBreadcrumb";
import { useCategories } from "@/contexts/CategoriesContext";
import type { CategoryNode } from "@/types/categories";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { Box } from "@/components/ui/box";
import { computeProductDetailsTaxonomyPath } from "./productDetailsTaxonomyPath";
import { isOtherCategoryId } from "@/utils/singleCategoryFilter";
import {
  appendVehicleContextToHref,
  getVehicleContextFromSearchParams,
} from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";

interface ProductDetailsBreadcrumbProps {
  categories?: string[];
  activeFallback: string;
}

export default function ProductDetailsBreadcrumb({
  categories,
  activeFallback,
}: ProductDetailsBreadcrumbProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const { data: categoriesData } = useCategories();
  const { getLabel } = useBranding();

  const { languageCountry, lang } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const lc = (segments[0] as string) || "";
    const l = lc.split("-")[0] || "en";
    return { languageCountry: lc, lang: l };
  }, [pathname]);

  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const vehicleContext = getVehicleContextFromSearchParams(searchParams, {
    includeCarIds: isNewMmeEnabled,
  });

  // const basePartsLabel =
  //   lang === "fr" ? "Pièces Auto" : lang === "nl" ? "Auto Onderdelen" : "Car Parts";

  const taxonomyPath = useMemo(
    () =>
      computeProductDetailsTaxonomyPath(categoriesData as CategoryNode[] | undefined, categories),
    [categoriesData, categories],
  );

  const partsHref = useMemo(() => {
    if (!languageCountry) return "";
    return Routes.parts(languageCountry);
  }, [languageCountry]);

  const { links, activeLabel }: { links: BreadcrumbLink[]; activeLabel: string } = useMemo(() => {
    const baseLinks: BreadcrumbLink[] = [
      {
        // label: "Home",
        label: getLabel("home"),
        href: languageCountry ? `/${languageCountry}` : "/",
      },
      {
        label: getLabel("car_parts"),
        href: appendVehicleContextToHref(partsHref, vehicleContext),
      },
    ];

    if (isOtherCategoryId(categories?.[0])) {
      return {
        links: [...baseLinks, { label: getLabel("other_category") }],
        activeLabel: activeFallback,
      };
    }

    if (!taxonomyPath.length) {
      return {
        links: baseLinks,
        activeLabel: activeFallback,
      };
    }

    const [l1, l2, l3] = taxonomyPath;

    const l1Slug = l1?.slugs?.[lang] || "";
    const l2Slug = l2?.slugs?.[lang] || "";
    const l3Slug = l3?.slugs?.[lang] || "";

    let l1Href: string | null = null;
    let l2Href: string | null = null;
    let l3Href: string | null = null;

    if (l1 && l1Slug) {
      l1Href = appendVehicleContextToHref(
        Routes.categoryL1(languageCountry, l1Slug),
        vehicleContext,
      );
    }

    if (l2 && l1Slug && l2Slug) {
      l2Href = appendVehicleContextToHref(
        Routes.categoryL2(languageCountry, l1Slug, l2Slug),
        vehicleContext,
      );
    }

    if (l3 && l1Slug && l2Slug && l3Slug) {
      l3Href = appendVehicleContextToHref(
        Routes.categoryL3(languageCountry, l1Slug, l2Slug, l3Slug),
        vehicleContext,
      );
    }

    const linksWithCategories: BreadcrumbLink[] = [...baseLinks];

    if (taxonomyPath.length === 1 && l1 && l1Href) {
      linksWithCategories.push({
        label: l1.titles?.[lang] || l1.name || "",
        href: l1Href,
      });
    } else if (taxonomyPath.length === 2 && l1 && l1Href && l2 && l2Href) {
      linksWithCategories.push({
        label: l1.titles?.[lang] || l1.name || "",
        href: l1Href,
      });
      linksWithCategories.push({
        label: l2.titles?.[lang] || l2.name || "",
        href: l2Href,
      });
    } else if (taxonomyPath.length >= 3 && l1 && l1Href && l2 && l2Href && l3 && l3Href) {
      linksWithCategories.push({
        label: l1.titles?.[lang] || l1.name || "",
        href: l1Href,
      });
      linksWithCategories.push({
        label: l2.titles?.[lang] || l2.name || "",
        href: l2Href,
      });
      linksWithCategories.push({
        label: l3.titles?.[lang] || l3.name || "",
        href: l3Href,
      });
    }

    return {
      links: linksWithCategories,
      activeLabel: activeFallback,
    };
  }, [
    activeFallback,
    categories,
    getLabel,
    languageCountry,
    lang,
    partsHref,
    taxonomyPath,
    vehicleContext,
  ]);

  return (
    <Box className="">
      <OGBreadcrumb links={links} active={activeLabel} />
    </Box>
  );
}
