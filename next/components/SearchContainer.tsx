"use client";

import React from "react";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { useSearchContainerStore } from "@/stores/useSearchContainerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import BaseSearchComponent from "./BaseSearchComponent";
import SavedCarDropdownComponent from "./SavedCarDropdownComponent";
import { useMmeStore } from "@/stores/useMmeStore";
import { getMMEId } from "@/utils/getMMEId";
import { detectPage } from "@/utils/detectPage";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { getLanguageCountryFromPathname } from "@/utils/feature-flag-env";

interface SearchContainerProps {
  isIncompatible?: boolean;
  onEnterClick?: () => void;
  onSelectCar?: () => void;
  tempData?: any;
}

export default function SearchContainer({
  isIncompatible = false,
  onEnterClick,
  onSelectCar,
  tempData,
}: SearchContainerProps) {
  const { currentView, switchToView2, userExplicitlyChoseView1, setCurrentView } =
    useSearchContainerStore();
  const { isAuthenticated } = useAuthStore();
  const { searchData } = useMmeStore();
  const searchParams = useSearchParams();
  const makeModelTypeIdFromUrl = searchParams?.get("makeModelTypeId");
  // ✅ Use SavedCarsContext instead of React Query (prevents unnecessary API calls)
  const { savedCars } = useSavedCars();
  const hasInitialized = React.useRef(false);
  const componentMounted = React.useRef(false);
  const pathname = usePathname();
  const params = useParams();
  const hasClearedMmeForPathRef = React.useRef<string | null>(null);

  const languageCountryParam =
    typeof params?.["language-country"] === "string" ? params["language-country"] : "";

  /** When false, do not render the bordered wrapper (avoids empty green band on category pages). */
  const isLegacyMmeSearchShown = React.useMemo(() => {
    const segment = languageCountryParam || getLanguageCountryFromPathname(pathname ?? "") || "";
    if (segment === "") {
      return true;
    }
    return getClientFeatureFlag("mme_feature_flag", segment);
  }, [languageCountryParam, pathname]);

  // Detect the current page type using the centralized detectPage function
  const currentPageType = React.useMemo(() => {
    if (!pathname) return "search-results";
    const pageType = detectPage(pathname);

    return pageType;
  }, [pathname]);

  // Derived boolean flags for backward compatibility
  const isCategoryCatalogPage =
    currentPageType === "category-catalog" ||
    currentPageType === "category-l1" ||
    currentPageType === "category-l2" ||
    currentPageType === "category-l3";

  // Determine if user has saved cars
  // Use context data instead of React Query (data is already fetched once on app mount)
  const hasSavedCars = isAuthenticated && savedCars && savedCars.length > 0;

  // Check if URL makeModelTypeId matches any saved car
  // If URL has makeModelTypeId but it doesn't match any saved car, force View 1
  const urlMakeModelTypeIdMatchesSavedCar = React.useMemo(() => {
    if (!makeModelTypeIdFromUrl || !savedCars || savedCars.length === 0) {
      // If no URL makeModelTypeId or no saved cars, return true (don't force View 1)
      return true;
    }
    // Check if URL makeModelTypeId exists in saved cars
    const matchingCar = savedCars.find((car) => car.makeModelTypeId === makeModelTypeIdFromUrl);
    return !!matchingCar;
  }, [makeModelTypeIdFromUrl, savedCars]);

  // Reset userExplicitlyChoseView1 flag on component mount (new page load)
  // This ensures auto-switch works on initial page load
  React.useEffect(() => {
    if (!componentMounted.current) {
      componentMounted.current = true;
      // Reset the flag on initial mount to allow auto-switch
      if (userExplicitlyChoseView1) {
        useSearchContainerStore.setState({ userExplicitlyChoseView1: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Reset initialization flag when authentication status changes (e.g., user logs in)
  // This allows auto-switch to view2 when user logs in and has saved cars
  React.useEffect(() => {
    if (!isAuthenticated) {
      // User logged out - reset initialization flag so view can switch back when they log in again
      hasInitialized.current = false;
    }
  }, [isAuthenticated]);

  // ✅ Reset initialization flag when route changes (pathname or makeModelTypeId changes)
  // This allows re-evaluation of view when navigating to a new route
  React.useEffect(() => {
    // Reset initialization when route changes to allow view switching logic to run again
    hasInitialized.current = false;
  }, [pathname, makeModelTypeIdFromUrl]);

  // Clear stale MME search data once per path when landing on category L1/L2/L3 pages without makeModelTypeId
  React.useEffect(() => {
    if (!pathname) return;

    const isCategoryWithoutMMEId =
      (currentPageType === "category-l1" ||
        currentPageType === "category-l2" ||
        currentPageType === "category-l3") &&
      !makeModelTypeIdFromUrl;

    if (!isCategoryWithoutMMEId) {
      return;
    }

    // Avoid re-running for the same path; only evaluate once per navigation
    if (hasClearedMmeForPathRef.current === pathname) {
      return;
    }

    const mmeState = useMmeStore.getState();
    const currentSearchData = mmeState.searchData;

    const hasStaleSearchData =
      !!currentSearchData?.make?.value ||
      !!currentSearchData?.model?.value ||
      !!currentSearchData?.engine?.value;

    if (!hasStaleSearchData) {
      return;
    }

    try {
      // Reset stored MME search context and clear any cached MME API data
      mmeState.resetSearch();
      mmeState.clearMmeApiCache();
      hasClearedMmeForPathRef.current = pathname;
    } catch (error) {
      console.error("[SearchContainer] Failed to reset MME search data on category page", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentPageType, makeModelTypeIdFromUrl]);

  // Auto-switch to view2 when user has saved cars (on initial load OR after login)
  // Don't auto-switch if user has explicitly chosen view1 (e.g., via "Add new car")
  // Don't auto-switch if URL makeModelTypeId doesn't match any saved car (force View 1)
  React.useEffect(() => {
    // Only auto-switch if:
    // 1. User has saved cars
    // 2. URL makeModelTypeId matches a saved car (or no URL makeModelTypeId)
    // 3. We haven't initialized yet (or just reset due to auth/route change)
    // 4. Current view is view1
    // 5. User hasn't explicitly chosen view1
    if (
      hasSavedCars &&
      urlMakeModelTypeIdMatchesSavedCar &&
      !hasInitialized.current &&
      currentView === "view1" &&
      !userExplicitlyChoseView1
    ) {
      // Switch to view2 when user has saved cars (on initial load or after login)
      switchToView2();
      hasInitialized.current = true;
    }
  }, [
    hasSavedCars,
    urlMakeModelTypeIdMatchesSavedCar,
    currentView,
    switchToView2,
    userExplicitlyChoseView1,
    isAuthenticated,
  ]);

  // Determine which view to show based on authentication and saved cars
  // If user is authenticated and has saved cars (length > 0), show view 2 (SavedCarDropdownComponent)
  // Otherwise, show view 1 (BaseSearchComponent)
  // Note: currentView can be "view1" if user explicitly switched (e.g., via "Add new car")
  // If URL has makeModelTypeId that doesn't match any saved car, force View 1
  const activeView = React.useMemo(() => {
    // If URL has makeModelTypeId that doesn't match any saved car, force View 1
    if (makeModelTypeIdFromUrl && !urlMakeModelTypeIdMatchesSavedCar) {
      return "view1";
    }
    // Otherwise, use the normal logic
    return hasSavedCars ? currentView : "view1";
  }, [hasSavedCars, currentView, makeModelTypeIdFromUrl, urlMakeModelTypeIdMatchesSavedCar]);

  // Determine styling based on view state and incompatible state
  let borderClasses = "";
  let backgroundClasses = "";

  if (isCategoryCatalogPage) {
    // Category catalog page - always positive border and background
    borderClasses = "border-t border-b border-color-border-positive";
    backgroundClasses = "bg-color-background-positive-muted";
  } else {
    // Not a category catalog page (detail page or search results)
    if (isIncompatible) {
      // Incompatible state - red border and background
      borderClasses = "border-t border-b border-color-border-danger";
      backgroundClasses = "bg-color-background-danger-muted";
    } else if (activeView === "view1") {
      if (
        makeModelTypeIdFromUrl &&
        searchData?.make?.value &&
        makeModelTypeIdFromUrl === getMMEId(searchData)
      ) {
        // has mme and is not isIncompatible
        borderClasses = "border-t border-b border-color-border-positive";
        backgroundClasses = "bg-color-background-positive-muted";
        // no data changes till now empty mme
        // View 1 default state - emphasis border and background
      } else {
        borderClasses = "border-t border-b border-color-border-emphasis";
        backgroundClasses = "bg-color-background-emphasis";
      }
    } else {
      // View 2 default state - positive border and background
      borderClasses = "border-t border-b border-color-border-positive";
      backgroundClasses = "bg-color-background-positive-muted";
    }
  }

  if (!isLegacyMmeSearchShown) {
    return null;
  }

  return (
    <div className={`w-full ${borderClasses} ${backgroundClasses}`}>
      <div className="section-base base:py-4 gtsm:py-6">
        {/* {activeView} */}
        {activeView === "view1" ? (
          <BaseSearchComponent
            isIncompatible={isIncompatible}
            onEnterClick={onEnterClick ?? (() => {})}
            tempData={tempData}
            //@ts-ignore
            currentPageType={
              currentPageType === "category-l2" || currentPageType === "category-l3"
                ? "category-l1"
                : currentPageType
            }
          />
        ) : (
          <SavedCarDropdownComponent
            onSelectCar={onSelectCar ?? onEnterClick ?? (() => {})}
            isIncompatible={isIncompatible}
          />
        )}
      </div>
    </div>
  );
}
