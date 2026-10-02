"use client";
import { Box } from "@/components/ui/box";
import BrowseByCategorySkeleton from "./BrowseByCategorySkeleton";
import { useBranding } from "@/contexts/BrandingContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import React, { useEffect, useRef, useState, useCallback } from "react";
import CategoryL1Card from "./CategoryL1Card";
import OGTabsGenric from "@/components/og-components/OGTabsGenric";
import CategoryL2Tab from "./CategoryL2Tab";
import { getRouteLocaleString, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { OGButton } from "@/components/og-components/OGButton";
import { Routes } from "@/config/routes";
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation";
import CategoryL2Modal from "./CategoryL2Modal";
import OGLayoutXL from "@/components/og-components/OGLayoutXL";
import { useMedia } from "@/hooks/useMedia";
import { useMmeStore } from "@/stores/useMmeStore";
import { detectPage } from "@/utils/detectPage";
import { pathnameIncludesPartsRouteSegment } from "@/config/url-segments";
import { appendCategorySearchQuery } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";

type Props = {
  /** Reserve the homepage top gap even for logged-in users (e.g. when previous search is hidden). */
  forceTopSpacer?: boolean;
};

const BrowseByCategory2 = ({ forceTopSpacer = false }: Props) => {
  const { getLocale, getLabel } = useBranding();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: CategoryNestedList = [], isPending, error } = useCategories();
  const [SelectedL1, setSelectedL1] = useState<PartsCategoryInterface | null>(null);
  const [SelectedL2, setSelectedL2] = useState<PartsCategoryInterface | null>(null);
  const isMobile = useMedia("(max-width: 639px)");
  // const searchMMEurl = searchParams?.get("car-parts");
  const onCarPartspage = pathnameIncludesPartsRouteSegment(pathname);
  const categoryL2TabRef = useRef<HTMLDivElement>(null);
  const measurementFrameRef = useRef<number | null>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const searchData = useMmeStore((state) => state.searchData);
  const selectedSavedCarInLandingPage = useMmeStore((state) => state.selectedSavedCarInLandingPage);
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();
  const { authUser, setAddresses, isAuthenticated } = useAuthStore();

  // Detect page type to determine if we're on a category catalog page
  const pageType = React.useMemo(() => {
    if (!pathname) return "search-results";
    return detectPage(pathname);
  }, [pathname]);

  const isCategoryCatalogPage = pageType === "category-catalog";

  useEffect(() => {
    if (CategoryNestedList.length > 0) {
      setSelectedL1(CategoryNestedList[0]);
    }
  }, [CategoryNestedList]);

  // Same carIds/VIN as header L1–L3 (URL, hero selection, E2E sibling expansion).
  // Includes /car-parts (category-catalog): previously skipped and dropped vehicle context.
  const createRoute = useCallback(
    (cat: PartsCategoryInterface) => {
      const manufacturerIds = searchParams?.get("manufacturerIds") ?? null;

      if (isNewMmeEnabled && navigationCarIds.length > 0 && params?.["language-country"]) {
        return appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
          categoryId: cat.id,
          carIds: navigationCarIds,
          ...(navigationVin ? { vin: navigationVin } : {}),
          ...(manufacturerIds ? { manufacturerIds } : {}),
        });
      }

      return params
        ? appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
            categoryId: cat.id,
            ...(manufacturerIds ? { manufacturerIds } : {}),
          })
        : "#";
    },
    [searchParams, navigationCarIds, isNewMmeEnabled, params, navigationVin],
  );

  const runSmoothScroll = useCallback((targetY: number) => {
    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }

    const startPosition = window.pageYOffset;
    const distance = targetY - startPosition;
    const duration = 600;
    let startTimestamp: number | null = null;

    const animate = (currentTime: number) => {
      if (startTimestamp === null) {
        startTimestamp = currentTime;
      }

      const progress = Math.min((currentTime - startTimestamp) / duration, 1);
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const currentPosition = startPosition + distance * easeInOutCubic(progress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        scrollAnimationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        scrollAnimationFrameRef.current = null;
      }
    };

    scrollAnimationFrameRef.current = window.requestAnimationFrame(animate);
  }, []);

  const scheduleScrollToTabs = useCallback(() => {
    if (measurementFrameRef.current !== null) {
      cancelAnimationFrame(measurementFrameRef.current);
    }

    measurementFrameRef.current = window.requestAnimationFrame(() => {
      measurementFrameRef.current = null;
      const element = categoryL2TabRef.current;
      if (!element) return;

      // Anchor the scroll to the actual sticky header height (ribbon + nav can vary
      // by breakpoint / dismissal state) plus a small gap, so the L1 tab bar is never
      // left hidden behind the header.
      const stickyHeader = document.getElementById("site-header-sticky");
      const headerHeight = stickyHeader?.getBoundingClientRect().height ?? 108;
      const scrollGap = 16;
      const yOffset = -(headerHeight + scrollGap);
      const targetY = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      runSmoothScroll(targetY);
    });
  }, [runSmoothScroll]);

  const handleL1Click = (category: PartsCategoryInterface) => {
    setSelectedL1(category || null);
    scheduleScrollToTabs();
  };
  // Switching the nav tabs inside CategoryL2Tab must update the sub-category
  // content in place without scrolling; only the parent category cards above
  // the tabs (handleL1Click) should trigger the scroll-into-view.
  const handleTabClick = (category: PartsCategoryInterface) => {
    setSelectedL1(category || null);
  };
  const handleL2Click = (category: PartsCategoryInterface) => {
    // debugger;
    setSelectedL2(category || null);
  };

  useEffect(() => {
    return () => {
      if (measurementFrameRef.current !== null) {
        cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
        scrollAnimationFrameRef.current = null;
      }
    };
  }, []);

  // Handle category click - clear searchData if needed (for Link onClick handler)
  const handleCategoryClick = useCallback(
    (cat: PartsCategoryInterface) => {
      // Check if we need to clear searchData
      // Only clear if on category catalog page and URL doesn't have makeModelTypeId
      if (
        isCategoryCatalogPage &&
        (!searchParams?.get("makeModelTypeId") || !searchParams?.get("brandId"))
      ) {
        // Clear searchData before redirect
        useMmeStore.getState().setSearchData({
          make: null,
          model: null,
          engine: null,
        });
      }
    },
    [isCategoryCatalogPage, searchParams],
  );

  const getViewAll = (selectedL1Category?: PartsCategoryInterface | null) => {
    if (!selectedL1Category) {
      return false;
    }
    const categoryText = getTitleOfCategory(selectedL1Category, getLocale()).toLocaleLowerCase(
      getLocale(),
    );

    return getLabel("CarParts_L1_viewall", {
      category: categoryText,
    });
  };

  if (isPending) {
    return (
      <Box className="flex w-full flex-col gap-stack">
        <Box className="section-standard" />
        <BrowseByCategorySkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex w-full flex-col gap-stack">
        <Box className="section-standard" />
        <BrowseByCategorySkeleton errorMessage={getLabel("categories_loading_failed_text")} />
      </Box>
    );
  }

  return (
    <Box className={`grid-gap flex flex-col bg-color-background-default base:pb-0`}>
      <OGLayoutXL className={`flex w-full flex-col gap-stack`}>
        {(forceTopSpacer || !isAuthenticated) && <Box className="section-standard"></Box>}
        <Box className="grid grid-gap-listing base:mb-4 base:grid-cols-3 gtsm:mb-0 gtsm:grid-cols-4 gtlg:mb-0 gtlg:grid-cols-6">
          {CategoryNestedList.map((category: any) => (
            <CategoryL1Card
              key={category.id}
              data={category}
              isActive={false}
              // isActive={SelectedL1?.id === category.id}
              onClick={handleL1Click}
            />
          ))}
        </Box>

        {getViewAll(SelectedL1) && SelectedL1 && (
          <Box className="flex w-full base:gap-3 gtsm:gap-8 gtlg:gap-8">
            <Box ref={categoryL2TabRef as any} className="pt-0 md:py-0">
              <CategoryL2Tab
                items={CategoryNestedList}
                // isActive={SelectedL2?.id === category.id}
                selectCategory={SelectedL1 ?? null}
                onClick={handleTabClick}
                onL2Click={handleL2Click}
              />
            </Box>
            <Box className="flex w-auto items-center">
              <OGButton
                type="ghost"
                className="self-center text-button-ghost-text"
                href={createRoute(SelectedL1)}
                onClick={() => handleCategoryClick(SelectedL1)}
              >
                {getViewAll(SelectedL1)}
              </OGButton>
            </Box>
            <CategoryL2Modal
              selectedL2Cat={SelectedL2}
              close={() => {
                setSelectedL2(null);
              }}
              createRoute={createRoute}
              onCategoryClick={handleCategoryClick}
            />
          </Box>
        )}
        {/* {!isMobile && (
        )} */}
        {/* <Box className="h-[1px] w-full bg-red-600" /> */}
        {!onCarPartspage && (
          <>
            <Box className="h-[1px] w-full bg-color-border-default" />
            <Box className=""></Box>
          </>
        )}
      </OGLayoutXL>
    </Box>
  );
};

export { BrowseByCategory2 };
