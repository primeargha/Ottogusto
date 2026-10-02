"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import OGBreadcrumb from "@/components/og-components/OGBreadcrumb";
import { Box } from "@/components/ui/box";
import SearchContainer from "@/components/SearchContainer";
import CategoryCarSelectionBannerShellPlaceholder from "@/components/CategoryCarSelectionBannerShellPlaceholder";
import CategoryL1Card from "@/screens/landing/browse-by-category-2/CategoryL1Card";
import { RecentlyViewedSkeleton } from "@/screens/category/CategorySkeletons";
import { useBranding } from "@/contexts/BrandingContext";
import { Routes } from "@/config/routes";
import { formatTitle, getTitleOfCategory } from "@/helpers/UtilityHelper";
import type { ManufacturerBySlug } from "@/services/products";
import type { CategoryNode, PartsCategoryInterface } from "@/types/categories";
import {
  appendVehicleContextToHref,
  getVehicleContextFromSearchParams,
} from "@/utils/categorySearchUrl";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { shouldNofollowBreadcrumbHref } from "@/utils/seoUrlParams";
import {
  collectL3UnderL1,
  getCategoryLocaleSlug,
  sortCategoriesByDisplayOrder,
} from "@/utils/carPartBrandCategories";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { toSentenceCase } from "@/utils/languageFormating";

const RecentlyViewedSection = dynamic(() => import("@/screens/category/RecentlyViewedSection"), {
  loading: () => <RecentlyViewedSkeleton />,
});

type Props = {
  brand: ManufacturerBySlug;
  languageCountry: string;
  brandSlug: string;
  initialCategories: CategoryNode[];
  enableNewMmeBanner: boolean;
};

/**
 * Locale map → string for the active language only.
 * If `lang` is missing (e.g. only `nl` present on an `en` page), return empty — no en/other fallback.
 */
export function resolveLocalizedText(
  value: Record<string, string> | string | null | undefined,
  lang: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const localized = value[lang];
  return typeof localized === "string" ? localized.trim() : "";
}

function smoothScrollToY(targetY: number) {
  const startPosition = window.pageYOffset;
  const distance = targetY - startPosition;
  const duration = 600;
  let startTimestamp: number | null = null;

  const step = (currentTime: number) => {
    if (startTimestamp === null) startTimestamp = currentTime;
    const progress = Math.min((currentTime - startTimestamp) / duration, 1);
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
    if (progress < 1) window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

/**
 * Car Part Brand landing (OD-2340).
 * Brand id from SSR slug API (`brand.id`) — used server-side for Category/Parts;
 * L3 links use a clean path (no `?brandId=`). Brand+L3 resolves manufacturer id from slug.
 */
const CarPartBrandLandingPage = ({
  brand,
  languageCountry,
  brandSlug,
  initialCategories,
  enableNewMmeBanner,
}: Props) => {
  const { getLabel, getLocale } = useBranding();
  const lang = languageCountry.split("-")[0] || "en";
  const locale = (getLocale() as string) || lang;
  const shortDescription = resolveLocalizedText(brand.shortDescriptions, lang);
  const listHref = Routes.manufacturers(languageCountry).replace(/\/$/, "");
  const searchParams = useSearchParams();
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();

  const [isMounted, setIsMounted] = useState(false);
  const isMmeFeatureEnabled = isMounted
    ? getClientFeatureFlag("mme_feature_flag")
    : !enableNewMmeBanner;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Brand-scoped tree from SSR only (`fetchCategoryTreeForBrand`) — never replace with
  // global `useCategories()` or empty L3s for this manufacturer reappear.
  const l1Categories = sortCategoriesByDisplayOrder(initialCategories);
  const firstL1Id = l1Categories[0]?.id ?? null;

  const [activeL1Id, setActiveL1Id] = useState<string | null>(firstL1Id);

  useEffect(() => {
    setActiveL1Id(firstL1Id);
  }, [brand.id, firstL1Id]);
  const [stickyTop, setStickyTop] = useState(108);
  const isProgrammaticScroll = useRef(false);
  const programmaticTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateStickyTop = () => {
      const header = document.getElementById("site-header-sticky");
      setStickyTop(header?.getBoundingClientRect().height ?? 108);
    };
    updateStickyTop();
    window.addEventListener("resize", updateStickyTop);
    return () => window.removeEventListener("resize", updateStickyTop);
  }, []);

  useEffect(() => {
    if (l1Categories.length === 0) return;

    const header = document.getElementById("site-header-sticky");
    const tabs = document.getElementById("brand-l1-sticky-tabs");
    const headerH = header?.getBoundingClientRect().height ?? stickyTop;
    const tabsH = tabs?.getBoundingClientRect().height ?? 48;
    const topOffset = headerH + tabsH + 8;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target?.id) {
          const id = top.target.id.replace(/^brand-l1-/, "");
          if (id) setActiveL1Id(id);
        }
      },
      {
        root: null,
        rootMargin: `-${topOffset}px 0px -45% 0px`,
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    for (const l1 of l1Categories) {
      const el = document.getElementById(`brand-l1-${l1.id}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [l1Categories, stickyTop]);

  useEffect(() => {
    const container = tabsScrollRef.current;
    const selectedTab = selectedTabRef.current;
    if (!container || !selectedTab) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const tabLeft = tabRect.left - containerRect.left + scrollLeft;
    const tabRight = tabRect.right - containerRect.left + scrollLeft;

    if (tabLeft < scrollLeft) {
      container.scrollTo({ left: Math.max(0, tabLeft - 16), behavior: "smooth" });
    } else if (tabRight > scrollLeft + containerRect.width) {
      container.scrollTo({
        left: tabRight - containerRect.width + 16,
        behavior: "smooth",
      });
    }
  }, [activeL1Id]);

  const scrollToL1 = (l1Id: string) => {
    const element = document.getElementById(`brand-l1-${l1Id}`);
    if (!element) return;

    setActiveL1Id(l1Id);
    isProgrammaticScroll.current = true;
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current);

    const stickyHeader = document.getElementById("site-header-sticky");
    const tabBar = document.getElementById("brand-l1-sticky-tabs");
    const headerHeight = stickyHeader?.getBoundingClientRect().height ?? stickyTop;
    const tabHeight = tabBar?.getBoundingClientRect().height ?? 48;
    const yOffset = -(headerHeight + tabHeight + 8);
    const targetY = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    smoothScrollToY(targetY);

    programmaticTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  };

  const vehicleContext = getVehicleContextFromSearchParams(searchParams, {
    includeCarIds: enableNewMmeBanner,
  });
  const navigationVehicle =
    navigationCarIds.length > 0 ? { carIds: navigationCarIds, vin: navigationVin } : vehicleContext;

  const buildL3Href = (l3: CategoryNode) => {
    const l3Slug = getCategoryLocaleSlug(l3, lang);
    const path = Routes.carPartBrandL3(languageCountry, brandSlug, l3Slug);
    return appendVehicleContextToHref(path, navigationVehicle);
  };

  const breadcrumbLinks = [
    { label: getLabel("home"), href: `/${languageCountry}` },
    {
      label: getLabel("car_part_brands"),
      href: appendVehicleContextToHref(listHref, navigationVehicle),
    },
  ];

  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }

  return (
    <Box className="flex w-full flex-col bg-color-background-default">
      {enableNewMmeBanner ? (
        <CategoryCarSelectionBannerShellPlaceholder enableNewMmeBanner />
      ) : (
        isMmeFeatureEnabled && <SearchContainer />
      )}

      <Box className="flex w-full flex-col gap-content-to-footer base:gap-stack">
        <Box className="section-standard">
          <OGBreadcrumb
            links={breadcrumbLinks}
            active={toSentenceCase(brand.name, locale as string)}
          />
        </Box>

        {/* H1 then logo + description (Figma) */}
        <Box className="flex flex-col gap-8 section-standard">
          <Typography className="text-color-text-emphasis typography-heading-01" type="h1" hasBack>
            {brand.name}
          </Typography>
          <Box className="gap-section-to-image flex flex-col gtsm:flex-row gtsm:items-start gtsm:gap-8">
            <Box className="relative h-24 w-24 shrink-0 gtsm:h-24 gtsm:w-24">
              {brand.image ? (
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain p-3"
                  unoptimized
                  priority
                />
              ) : null}
            </Box>
            {shortDescription ? (
              <Typography
                className="min-w-0 flex-1 text-center text-color-text-muted typography-body-01 gtsm:text-left"
                type="p"
              >
                {shortDescription}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* <Box className="section-standard">
          <Box className="h-[1px] w-full bg-color-border-default" />
        </Box> */}

        {l1Categories.length > 0 ? (
          <>
            {/* L1 image cards — click scrolls to section */}
            <Box className="grid grid-cols-2 gap-3 section-standard gtsm:grid-cols-3 gtlg:grid-cols-6">
              {l1Categories.map((l1) => (
                <CategoryL1Card
                  key={l1.id}
                  data={l1 as unknown as PartsCategoryInterface}
                  isActive={activeL1Id === l1.id}
                  onClick={() => scrollToL1(l1.id)}
                />
              ))}
            </Box>

            {/* <Box className="section-standard">
              <Box className="h-[1px] w-full bg-color-border-default" />
            </Box> */}

            {/* Sticky L1 tabs */}
            <Box
              id="brand-l1-sticky-tabs"
              className="sticky z-[15] border-b border-color-border-default bg-color-background-default"
              style={{ top: stickyTop }}
            >
              <Box className="section-standard">
                <div ref={tabsScrollRef} className="overflow-x-auto scrollbar-hide">
                  <div className="flex w-max min-w-full flex-row">
                    {l1Categories.map((l1) => {
                      const selected = activeL1Id === l1.id;
                      const title = formatTitle(
                        getTitleOfCategory(l1 as unknown as PartsCategoryInterface, locale),
                        locale as "en" | "fr" | "nl",
                      );
                      return (
                        <button
                          key={l1.id}
                          type="button"
                          ref={selected ? selectedTabRef : null}
                          onClick={() => scrollToL1(l1.id)}
                          className={`inline-flex min-w-28 cursor-pointer items-center justify-center border-b bg-transparent px-4 py-1 ${
                            selected
                              ? "border-b-2 border-color-border-focus"
                              : "border-color-border-default hover:border-b-2 hover:border-color-border-focus"
                          }`}
                        >
                          <span
                            className={`px-3 py-3 text-center typography-body-strong-01 ${
                              selected
                                ? "text-color-text-brand"
                                : "text-color-text-default hover:text-color-text-brand"
                            }`}
                          >
                            {title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Box>
            </Box>
            {/* 
            <Box className="section-standard">
              <Box className="h-[1px] w-full bg-color-border-default" />
            </Box> */}

            {/* Per-L1 sections with L3 text links */}
            <Box className="flex flex-col gap-stack section-standard">
              {l1Categories.map((l1, index) => {
                const l3s = collectL3UnderL1(l1);
                const l1Title = formatTitle(
                  getTitleOfCategory(l1 as unknown as PartsCategoryInterface, locale),
                  locale as "en" | "fr" | "nl",
                );
                // Category list/tree no longer carries descriptions — brand landing
                // does not N× call GET /Category/{id} per L1. Section = title + L3 links.

                return (
                  <React.Fragment key={l1.id}>
                    {index > 0 ? <Box className="h-[1px] w-full bg-color-border-default" /> : null}
                    <Box
                      id={`brand-l1-${l1.id}`}
                      className="flex scroll-mt-32 flex-col gap-space-md"
                    >
                      <Typography
                        type="h2"
                        className="text-color-text-emphasis typography-heading-03"
                      >
                        {l1Title}
                      </Typography>
                      {l3s.length > 0 ? (
                        <Box className="grid grid-cols-1 gap-x-6 gap-y-2 gtsm:grid-cols-2 gtlg:grid-cols-5">
                          {l3s.map((l3) => {
                            const href = buildL3Href(l3);
                            const label = formatTitle(
                              getTitleOfCategory(l3 as unknown as PartsCategoryInterface, locale),
                              locale as "en" | "fr" | "nl",
                            );
                            return (
                              <Link
                                key={l3.id}
                                href={href}
                                rel={shouldNofollowBreadcrumbHref(href) ? "nofollow" : undefined}
                                className="text-color-text-link typography-button-01 hover:underline"
                                style={{ color: "var(--color-text-link, #006341)" }}
                              >
                                {label}
                              </Link>
                            );
                          })}
                        </Box>
                      ) : null}
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          </>
        ) : null}

        <Box className="section-standard">
          <Box className="h-[1px] w-full bg-color-border-default" />
        </Box>

        <RecentlyViewedSection />
      </Box>
    </Box>
  );
};

export default CarPartBrandLandingPage;
