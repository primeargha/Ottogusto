"use client";

import React, { useRef } from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { useMmeStore } from "@/stores/useMmeStore";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { useBrands } from "@/contexts/BrandsContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAddUpdateMyCarsToEB } from "@/hooks/garage";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { getMMEId } from "@/utils/getMMEId";
import { useSearchContainerStore } from "@/stores/useSearchContainerStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import emptycarLogo from "@/assets/empty_car.svg";
import { useUrlParams } from "@/hooks/useUrlParams";
import carNoResult from "@/assets/car_crash.svg";
import carLogogreen from "@/assets/car_check.svg";
import Image from "next/image";
import { OGButton } from "./og-components/OGButton";
import { detectPage } from "@/utils/detectPage";
import Typography from "./og-components/Typography";

interface MMEBaseSearchProps {
  onEnterClick?: () => void;
  isIncompatible?: boolean;
  tempData?: any;
  currentPageType?:
    | "category-catalog"
    | "category-l1"
    | "category-l2"
    | "category-l3"
    | "search-results"
    | "product-details";
}

export default function MMEBaseSearch({
  onEnterClick,
  isIncompatible,
  tempData,
  currentPageType,
}: MMEBaseSearchProps) {
  const { getLabel } = useBranding();
  const {
    currentStep,
    searchData,
    searchResults,
    isSearching,
    updateSearchData,
    setStep,
    oeReference,
    setOeReference,
  } = useMmeStore();

  const isMobile = useMedia("(max-width: 639px)");
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  //
  const searchParams = useSearchParams();
  const searchMMEurl = searchParams?.get("makeModelTypeId");
  const isSearchResultURL = !searchMMEurl && pathname?.includes("search-results");
  const { isAuthenticated } = useAuthStore();
  const { refreshSavedCars } = useSavedCars();
  const { switchToView2 } = useSearchContainerStore();
  const { updateFilters } = useUrlParams();

  // Use the page type passed from SearchContainer, or fallback to local detection
  const pageType = React.useMemo(() => {
    if (currentPageType) return currentPageType;
    // Fallback: detect locally if not provided
    if (!pathname) return "search-results" as const;
    return detectPage(pathname);
  }, [currentPageType, pathname]);

  // Derived boolean flags for backward compatibility
  const isCategoryCatalogPage =
    pageType === "category-catalog" ||
    pageType === "category-l1" ||
    pageType === "category-l2" ||
    pageType === "category-l3";
  const isProductDetailsPage = pageType === "product-details";

  // State to manage which dropdown is open
  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null);
  // State to manage search text for each dropdown
  const [searchText, setSearchText] = React.useState<{ [key: number]: string }>({});
  // Refs for dropdown containers to enable scrolling
  const dropdownRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});
  const firstEnterClickedRef = useRef(false);
  // Track last submitted MME state for button disable/enable logic
  const lastSubmittedMMERef = React.useRef<{
    makeKey: string | null;
    modelKey: string | null;
    engineKey: string | null;
  } | null>(null);

  // Track if button was just clicked (to disable immediately)
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  // Track if we've initialized lastSubmittedMMERef from URL (to avoid resetting on user changes)
  const hasInitializedFromUrlRef = React.useRef(false);

  // Reset button state when searchData is cleared (e.g., when switching to view 1)
  React.useEffect(() => {
    // If searchData is completely empty (all null), reset button state
    if (!searchData.make?.key && !searchData.model?.key && !searchData.engine?.key) {
      // Reset last submitted state
      lastSubmittedMMERef.current = null;
      // Reset button disabled state
      setIsButtonDisabled(false);
      // Reset initialization flag so it can re-initialize from URL if needed
      hasInitializedFromUrlRef.current = false;
    }
  }, [searchData.make?.key, searchData.model?.key, searchData.engine?.key]);

  // Initialize lastSubmittedMMERef from URL makeModelTypeId when component mounts
  React.useEffect(() => {
    const urlMakeModelTypeId = searchParams?.get("makeModelTypeId");

    // Only initialize once when URL has makeModelTypeId and searchData is populated
    if (
      urlMakeModelTypeId &&
      !hasInitializedFromUrlRef.current &&
      (searchData.make?.key || searchData.model?.key || searchData.engine?.key)
    ) {
      // Only initialize if the current searchData actually matches the URL makeModelTypeId
      // This prevents initialization when user manually selects a MAKE (which won't match URL)
      const currentMakeModelTypeId = getMMEId(searchData);
      if (currentMakeModelTypeId === urlMakeModelTypeId) {
        // Set current searchData as last submitted state (since it came from URL)
        lastSubmittedMMERef.current = {
          makeKey: searchData.make?.key || null,
          modelKey: searchData.model?.key || null,
          engineKey: searchData.engine?.key || null,
        };
        setIsButtonDisabled(true); // Disable button since state matches URL
        hasInitializedFromUrlRef.current = true;
      }
    }
  }, [searchParams, searchData]);

  // ✅ Use brands from BrandsContext instead of fetching
  const { brands: brandsData } = useBrands();

  // ✅ Load brands from context into store when component mounts or brands data changes
  React.useEffect(() => {
    if (currentStep === 1 && searchResults.length === 0 && brandsData && brandsData.length > 0) {
      // Transform brands from context to store format
      const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
        key: brand.id,
        value: brand.brand ?? "",
      }));
      useMmeStore.getState().setSearchResults(results);
    }
  }, [currentStep, searchResults.length, brandsData]);

  // Filter search results based on search text
  const getFilteredResults = (step: number) => {
    const text = searchText[step] || "";
    if (!text.trim()) return searchResults;

    return searchResults
      ?.map((result) => {
        // Check if main result matches
        const mainMatches = result.value.toLowerCase().includes(text.toLowerCase());

        // Check if any children match
        let filteredChildren: any = null;
        if (result.children) {
          filteredChildren = result.children.filter((child: any) =>
            child.value.toLowerCase().includes(text.toLowerCase()),
          );
        }

        // If main result matches, return the whole result
        if (mainMatches) {
          return result;
        }

        // If children match, return result with filtered children
        if (filteredChildren && filteredChildren.length > 0) {
          return {
            ...result,
            children: filteredChildren,
          };
        }

        // Return null for items that don't match (will be filtered out)
        return null;
      })
      .filter(Boolean); // Remove null values
  };

  // Scroll to selected element when dropdown opens
  const scrollToSelected = (step: number) => {
    const dropdown = dropdownRefs.current[step];
    if (!dropdown) return;

    const selectedElement = dropdown.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = async (step: number) => {
    if (openDropdown === step) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(step);
      await setStep(step);

      // Scroll to selected element when dropdown opens
      if (step === 2) {
        // For step 2 (Model), use optimized timing
        setTimeout(() => {
          scrollToSelected(step);
        }, 100);
      } else {
        // For steps 1 and 3, use the original working approach
        setTimeout(() => {
          scrollToSelected(step);
        }, 600);

        // Retry scroll after a longer delay in case the first attempt fails
        setTimeout(() => {
          scrollToSelected(step);
        }, 1000);

        // Final retry for stubborn cases
        setTimeout(() => {
          scrollToSelected(step);
        }, 1500);
      }
    }
  };

  // Handle selection with clearing logic
  const handleSelectWithClearing = (
    option: { key: string; value: string; originalData?: any },
    step: number,
  ) => {
    const currentSearchData = useMmeStore.getState().searchData;
    let shouldClearSubsequent = false;

    // Check if we're changing a previous step
    switch (step) {
      case 1: // Make selection
        if (currentSearchData.make?.value !== option.value) {
          shouldClearSubsequent = true;
        }
        break;
      case 2: // Model selection
        if (currentSearchData.model?.value !== option.value) {
          shouldClearSubsequent = true;
        }
        break;
      case 3: // Engine selection
        // No clearing needed for engine
        break;
    }

    // If we need to clear subsequent data, do it manually
    if (shouldClearSubsequent) {
      const newSearchData = { ...currentSearchData };

      if (step === 1) {
        // Clear model and engine when make changes
        newSearchData.model = null;
        newSearchData.engine = null;
      } else if (step === 2) {
        // Clear engine when model changes
        newSearchData.engine = null;
      }

      // Update the store with cleared data
      useMmeStore.getState().setSearchData(newSearchData);
    }

    // Call the original updateSearchData
    updateSearchData(option, option.originalData);
    setOpenDropdown(null); // Close dropdown after selection

    // Enable button when MME selection changes
    setIsButtonDisabled(false);
  };

  // Handle click outside to close dropdown
  const handleClickOutside = (event: React.MouseEvent) => {
    if (openDropdown !== null) {
      setOpenDropdown(null);
    }
  };

  // Determine active step for styling
  const getActiveStep = () => {
    if (!searchData.make?.value) return 1;
    if (!searchData.model?.value) return 2;
    if (!searchData.engine?.value) return 3;
    return 4; // All selected - no active step highlighting (removes green border from all fields)
  };

  const activeStep = getActiveStep();

  // Save car mutation for authenticated users
  const { mutate: addUpdateMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: any) => {
      // ✅ Refresh saved cars from context (single API call instead of multiple invalidations)
      refreshSavedCars();

      // Get makeModelTypeId from response or use the one we sent
      const makeModelTypeId = data?.data?.makeModelTypeId || getMMEId(searchData);

      if (makeModelTypeId) {
        // handle product details page
        if (isProductDetailsPage) {
          // Update URL with makeModelTypeId
          const currentParams = new URLSearchParams(searchParams?.toString() || "");
          currentParams.set("makeModelTypeId", makeModelTypeId);
          const newUrl = `${pathname}?${currentParams.toString()}`;
          switchToView2();
          router.push(newUrl);
          return;
        }

        // handle category page: on L1/L2 stay on same page (pathname + query); on catalog root go to categorySelection
        if (isCategoryCatalogPage) {
          const isCategorySubPage =
            pathname?.includes("/category/") || pathname?.includes("/categorie/");
          if (isCategorySubPage) {
            const currentParams = new URLSearchParams(searchParams?.toString() || "");
            currentParams.set("makeModelTypeId", makeModelTypeId);
            router.push(`${pathname}?${currentParams.toString()}`);
          } else {
            const categoryUrl = getRouteLocaleString(Routes.categorySelection, params);
            router.push(`${categoryUrl}?makeModelTypeId=${makeModelTypeId}`);
          }
          switchToView2();
        } else {
          // handle search results page
          // For non-category pages, use updateFilters to redirect to products page
          updateFilters(
            {
              makeModelTypeId: makeModelTypeId,
            },
            "/products",
          );
          // Switch to view 2 (SavedCarDropdownComponent)
          switchToView2();
        }
      }
    },
    onError: (error: any) => {
      console.error("Error saving car to garage:", error);
      // Handle duplicate car error (409)
      if (
        error?.response?.data?.status === 409 &&
        error?.response?.data?.title === "Duplicate Car"
      ) {
        // For duplicate car, still redirect and switch to view 2
        const makeModelTypeId = getMMEId(searchData);
        if (makeModelTypeId) {
          if (isProductDetailsPage) {
            switchToView2();
            return;
          }
          if (isCategoryCatalogPage) {
            const isCategorySubPage =
              pathname?.includes("/category/") || pathname?.includes("/categorie/");
            if (isCategorySubPage) {
              const currentParams = new URLSearchParams(searchParams?.toString() || "");
              currentParams.set("makeModelTypeId", makeModelTypeId);
              router.push(`${pathname}?${currentParams.toString()}`);
            } else {
              const categoryUrl = getRouteLocaleString(Routes.categorySelection, params);
              router.push(`${categoryUrl}?makeModelTypeId=${makeModelTypeId}`);
            }
            switchToView2();
          } else {
            // For non-category pages, use updateFilters to redirect to products page
            updateFilters(
              {
                makeModelTypeId: makeModelTypeId,
              },
              "/products",
            );
            switchToView2();
          }
        }
      }
    },
  });

  // Check if Enter button should be disabled
  const shouldDisableEnterButton = React.useMemo(() => {
    // If button was just clicked, keep it disabled
    if (isButtonDisabled) {
      return true;
    }

    // If no make value, disable button
    if (!searchData.make?.key) {
      return true;
    }

    // If no last submitted state, check if we have any MME data
    if (!lastSubmittedMMERef.current) {
      // If we have make value, enable button
      return false;
    }

    // Compare current state with last submitted state
    const currentMakeKey = searchData.make?.key || null;
    const currentModelKey = searchData.model?.key || null;
    const currentEngineKey = searchData.engine?.key || null;

    const lastSubmitted = lastSubmittedMMERef.current;

    // If current state matches last submitted state, disable button
    if (
      currentMakeKey === lastSubmitted.makeKey &&
      currentModelKey === lastSubmitted.modelKey &&
      currentEngineKey === lastSubmitted.engineKey
    ) {
      return true;
    }

    // State has changed, enable button
    return false;
  }, [searchData?.make?.key, searchData?.model?.key, searchData?.engine?.key, isButtonDisabled]);

  // Handle Enter button click
  const handleEnterClick = () => {
    const OD1733_MME_ENTER = "[OD1733_MME_ENTER]";
    // debugger; // OD1733_MME_ENTER

    // Clear MME API cache so we fetch fresh data for the new search
    useMmeStore.getState().clearMmeApiCache();

    // Use latest searchData from store so engine key is used for URL (avoids stale closure)
    const currentSearchData = useMmeStore.getState().searchData;

    firstEnterClickedRef.current = true;
    // Disable button immediately when clicked
    setIsButtonDisabled(true);

    // Store current MME state as last submitted state
    lastSubmittedMMERef.current = {
      makeKey: currentSearchData.make?.key || null,
      modelKey: currentSearchData.model?.key || null,
      engineKey: currentSearchData.engine?.key || null,
    };

    const hasMake = !!currentSearchData.make?.value;
    const hasModel = !!currentSearchData.model?.value;
    const hasEngine = !!currentSearchData.engine?.value;

    // if oeReference then remove it
    if (oeReference && oeReference?.length > 1) {
      setOeReference(null);
    }

    // Check if we have complete MME data (Make + Model + Engine)
    const isCompleteMME = hasMake && hasModel && hasEngine;

    // Check if we have partial MME data (Make only, or Make + Model, but no Engine)
    const isPartialMME = hasMake && !hasEngine;

    // For partial MME data on [product details page]: Update URL with makeModelTypeId
    if (isPartialMME && isProductDetailsPage) {
      const makeModelTypeId = getMMEId(currentSearchData);
      if (makeModelTypeId) {
        // Update URL with makeModelTypeId
        // Example: /car-parts/volvo/mf88rz4rfnbqn?makeModelTypeId=00w0020075j001000
        const currentParams = new URLSearchParams(searchParams?.toString() || "");
        currentParams.set("makeModelTypeId", makeModelTypeId);
        const newUrl = `${pathname}?${currentParams.toString()}`;
        router.push(newUrl);
      }
    }

    // For partial MME data on [category page]: Update heading and URL with makeModelTypeId
    if (isPartialMME && isCategoryCatalogPage) {
      const makeModelTypeId = getMMEId(currentSearchData);

      if (makeModelTypeId) {
        // Update URL with makeModelTypeId
        const currentParams = new URLSearchParams(searchParams?.toString() || "");
        currentParams.set("makeModelTypeId", makeModelTypeId);
        const newUrl = `${pathname}?${currentParams.toString()}`;
        router.push(newUrl);
      }
      // Update heading
      if (onEnterClick) {
        onEnterClick();
      }
      return;
    }

    // For partial MME(Search Results Page) data on non-category page (excluding product details): Redirect with makeModelTypeId (no save car API)
    if (isPartialMME && !isCategoryCatalogPage && !isProductDetailsPage) {
      const makeModelTypeId = getMMEId(currentSearchData);
      if (makeModelTypeId) {
        updateFilters(
          {
            makeModelTypeId: makeModelTypeId,
          },
          "/products",
        );
      }
      return;
    }

    // For complete MME on category page: always update URL and heading; if authenticated + feature flag, also save car
    if (isCompleteMME && isCategoryCatalogPage) {
      const makeModelTypeId = getMMEId(currentSearchData);

      if (makeModelTypeId) {
        // Update store with makeModelTypeId (engine key)
        const updatedSearchData = {
          ...currentSearchData,
          makeModelTypeId: makeModelTypeId,
        };
        useMmeStore.getState().setSearchData(updatedSearchData);

        // Always update URL with makeModelTypeId (guest and authenticated)
        const currentParams = new URLSearchParams(searchParams?.toString() || "");
        currentParams.set("makeModelTypeId", makeModelTypeId);
        const newUrl = `${pathname}?${currentParams.toString()}`;
        router.push(newUrl);
      }
      // Update heading
      if (onEnterClick) {
        onEnterClick();
      }
      // If authenticated and saved_car feature is on, also save car (redirect happens in mutation onSuccess)
      if (isAuthenticated && getClientFeatureFlag("saved_car_feature_flag") && makeModelTypeId) {
        const carName =
          `${currentSearchData.make?.value} ${currentSearchData.model?.value} ${currentSearchData.engine?.value}`.trim();
        const requestBody = {
          makeModelTypeId: makeModelTypeId,
          name: carName,
          year: currentSearchData.engine?.originalData?.yearFrom || null,
          isNew: true,
        };
        addUpdateMyCarsToEB(requestBody as any);
      }
      return;
    }

    // For complete MME data on non-category page(Search Results Page and detail page) with authenticated user: Save car and redirect
    if (
      isCompleteMME &&
      !isCategoryCatalogPage &&
      isAuthenticated &&
      getClientFeatureFlag("saved_car_feature_flag")
    ) {
      const makeModelTypeId = getMMEId(currentSearchData);
      if (makeModelTypeId) {
        // Format car name for saving
        const carName =
          `${currentSearchData.make?.value} ${currentSearchData.model?.value} ${currentSearchData.engine?.value}`.trim();

        // Prepare request body for garage API
        const requestBody = {
          makeModelTypeId: makeModelTypeId,
          name: carName,
          year: currentSearchData.engine?.originalData?.yearFrom || null,
          isNew: true,
        };

        // Call save car API
        addUpdateMyCarsToEB(requestBody as any);
      }
      return;
    }

    // For guest users(Search Results Page) with complete MME on non-category page: Redirect to products page
    if (isCompleteMME && !isCategoryCatalogPage && !isAuthenticated && !isProductDetailsPage) {
      const makeModelTypeId = getMMEId(currentSearchData);
      if (makeModelTypeId) {
        updateFilters(
          {
            makeModelTypeId: makeModelTypeId,
          },
          "/products",
        );
      }
      return;
    }

    // isCompleteMME and isProductDetailsPage and !isAuthenticated: Redirect to products page and update the makeModelTypeId in the url
    if (isCompleteMME && isProductDetailsPage && !isAuthenticated) {
      const makeModelTypeId = getMMEId(currentSearchData);
      if (makeModelTypeId) {
        // Update URL with makeModelTypeId
        const currentParams = new URLSearchParams(searchParams?.toString() || "");
        currentParams.set("makeModelTypeId", makeModelTypeId);
        const newUrl = `${pathname}?${currentParams.toString()}`;
        router.push(newUrl);
      }
      return;
    }

    // For other cases (partial MME on non-category pages), use the passed callback

    if (onEnterClick) {
      onEnterClick();
    }
  };

  // Desktop Layout - Horizontal
  if (!isMobile) {
    return (
      <div
        className={`flex w-full flex-row items-center gtsm:gap-space-md gtlg:gap-space-xl ${isTablet ? "" : "section-standard"} `}
      >
        {/* Header Section (Car Icon + Text) - flex-row */}

        {!isCategoryCatalogPage ? (
          isIncompatible ? (
            <Image src={carNoResult} alt="carLogo" />
          ) : (
              isSearchResultURL
                ? (tempData?.make?.value || tempData?.model?.value || tempData?.engine?.value) &&
                  searchMMEurl &&
                  searchMMEurl === getMMEId(searchData)
                : (searchData?.make?.value ||
                    searchData?.model?.value ||
                    searchData?.engine?.value) &&
                  searchMMEurl &&
                  searchMMEurl === getMMEId(searchData)
            ) ? (
            <Image src={carLogogreen} alt="car logo" />
          ) : (
            <Image src={emptycarLogo} alt="car logo" />
          )
        ) : (
          <Image src={carLogogreen} alt="car logo" />
        )}

        {/* MME Section - flex-col (contains: MME fields row + Enter button) */}
        <div className="flex w-full flex-col gap-2">
          {/* Text */}
          <span className="text-color-text-emphasis typography-heading-04">
            {/* if firstEnterClickedRef.current === false ? use 'tempData' : 'searchData'  */}
            {!isCategoryCatalogPage
              ? isIncompatible
                ? // Use PDP-specific label for product-details page, otherwise use global label
                  pageType === "product-details"
                  ? getLabel("pdp_vehicle_no_match_found")
                  : getLabel("vehicle_no_match_found")
                : (
                      isSearchResultURL
                        ? (tempData?.make?.value ||
                            tempData?.model?.value ||
                            tempData?.engine?.value) &&
                          searchMMEurl &&
                          searchMMEurl === getMMEId(searchData)
                        : (searchData?.make?.value ||
                            searchData?.model?.value ||
                            searchData?.engine?.value) &&
                          searchMMEurl &&
                          searchMMEurl === getMMEId(searchData)
                    )
                  ? // Use PDP-specific label for product-details page, otherwise use global label
                    pageType === "product-details"
                    ? getLabel("pdp_vehicle_compatible_label")
                    : getLabel("vehicle_compatible_label")
                  : // Use PDP-specific label for product-details page, otherwise use global label
                    pageType === "product-details"
                    ? getLabel("pdp_identify_your_vehicle")
                    : getLabel("identify_your_vehicle")
              : getLabel("vehicle_compatible_label")}
          </span>
          {/* MME Fields Row - flex-row */}
          <div className="flex min-w-0 flex-row items-center gap-2">
            {/* Make Dropdown */}
            <div className="relative flex min-w-0 flex-1">
              <div
                className="relative w-full cursor-pointer"
                onClick={() => handleDropdownToggle(1)}
              >
                <div
                  className={`flex flex-row items-center justify-between rounded border p-3 ${
                    activeStep === 1 || openDropdown === 1
                      ? "border-color-border-focus"
                      : "border-gray-300"
                  } bg-white`}
                >
                  {/* Number badge inside the field */}
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className={`flex min-h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium ${
                        activeStep >= 1
                          ? "bg-color-border-focus text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      1
                    </div>
                    <Typography className="min-w-0 truncate text-color-text-default typography-body-strong-01 gtsm:max-w-[100px] gtlg:max-w-full">
                      {searchData.make?.value || getLabel("Car_select_make")}
                    </Typography>
                  </div>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openDropdown === 1 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Make Dropdown Menu */}
                {openDropdown === 1 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
                    <div
                      ref={(el) => (dropdownRefs.current[1] = el) as any}
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
                    >
                      <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                        <input
                          type="text"
                          placeholder={getLabel("search_make")}
                          value={searchText[1] || ""}
                          onChange={(e) => setSearchText({ ...searchText, [1]: e.target.value })}
                          className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {isSearching && (
                        <div className="color-text-placeholder p-2 text-sm">
                          {getLabel("loading")}
                        </div>
                      )}
                      {getFilteredResults(1)?.map((result) => (
                        <div
                          key={result?.key}
                          onClick={() => handleSelectWithClearing(result as any, 1)}
                          className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-[#e3e9e7]"
                          data-selected={searchData.make?.key === result?.key ? "true" : "false"}
                        >
                          <div className="flex items-center">
                            {searchData.make?.key === result?.key && (
                              <span className="mr-2 text-green-600">✓</span>
                            )}
                            <span className="text-sm">{result?.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Model Dropdown */}
            <div className="relative flex min-w-0 flex-1">
              <div
                className={`relative w-full ${
                  searchData.make?.value ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => searchData.make?.value && handleDropdownToggle(2)}
              >
                <div
                  className={`flex flex-row items-center justify-between rounded border p-3 ${
                    activeStep === 2 || openDropdown === 2
                      ? "border-color-border-focus"
                      : "border-gray-300"
                  } bg-white`}
                >
                  {/* Number badge inside the field */}
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className={`flex min-h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium ${
                        activeStep >= 2
                          ? "bg-color-border-focus text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      2
                    </div>
                    <Typography className="min-w-0 overflow-hidden truncate text-ellipsis text-color-text-default typography-body-strong-01 gtsm:max-w-[90px] gtlg:max-w-full">
                      {searchData.model?.value
                        ? searchData.model.value.length > 25
                          ? `${searchData.model.value.substring(0, 25)}...`
                          : searchData.model.value
                        : getLabel("Car_select_model")}
                    </Typography>
                  </div>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openDropdown === 2 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Model Dropdown Menu */}
                {openDropdown === 2 && searchData.make && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
                    <div
                      ref={(el) => (dropdownRefs.current[2] = el) as any}
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
                    >
                      <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                        <input
                          type="text"
                          placeholder={getLabel("search_model")}
                          value={searchText[2] || ""}
                          onChange={(e) => setSearchText({ ...searchText, [2]: e.target.value })}
                          className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {isSearching && (
                        <div className="color-text-placeholder p-2 text-sm">
                          {getLabel("loading")}
                        </div>
                      )}
                      {getFilteredResults(2)?.map((result) => (
                        <div key={result?.key} className="border-b last:border-b-0">
                          <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                            {result?.value}
                          </div>
                          {result?.children &&
                            result?.children?.map((child: any) => (
                              <div
                                key={child.key}
                                onClick={() => handleSelectWithClearing(child, 2)}
                                className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                                data-selected={
                                  searchData.model?.key === child.key ? "true" : "false"
                                }
                              >
                                <div className="flex items-center">
                                  {searchData.model?.key === child.key && (
                                    <span className="mr-2 text-green-600">✓</span>
                                  )}
                                  <span className="text-sm">{child.value}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Engine Dropdown */}
            <div className="relative flex min-w-0 flex-1">
              <div
                className={`relative w-full ${
                  searchData.model?.value ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => searchData.model?.value && handleDropdownToggle(3)}
              >
                <div
                  className={`flex flex-row items-center justify-between rounded border bg-white p-3 ${
                    searchData.engine?.value
                      ? "border-gray-300"
                      : activeStep === 3 || openDropdown === 3
                        ? "border-color-border-focus"
                        : "border-gray-300"
                  }`}
                >
                  {/* Number badge inside the field */}
                  <div className="flex min-w-0 flex-row items-center gap-2">
                    <div
                      className={`flex min-h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium ${
                        activeStep >= 3
                          ? "bg-color-border-focus text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      3
                    </div>
                    <Typography className="min-w-0 truncate text-color-text-default typography-body-strong-01 gtsm:max-w-[110px] gtlg:max-w-full">
                      {searchData.engine?.value || getLabel("Car_select_engine")}
                    </Typography>
                  </div>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openDropdown === 3 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Engine Dropdown Menu */}
                {openDropdown === 3 && searchData.model && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
                    <div
                      ref={(el) => (dropdownRefs.current[3] = el) as any}
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
                    >
                      <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                        <input
                          type="text"
                          placeholder={getLabel("search_engine")}
                          value={searchText[3] || ""}
                          onChange={(e) => setSearchText({ ...searchText, [3]: e.target.value })}
                          className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {isSearching && (
                        <div className="color-text-placeholder p-2 text-sm">
                          {getLabel("loading")}
                        </div>
                      )}
                      {getFilteredResults(3)?.map((result) => (
                        <div key={result?.key} className="border-b last:border-b-0">
                          <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                            {result?.value}
                          </div>
                          {result?.children &&
                            result?.children?.map((child: any) => (
                              <div
                                key={child.key}
                                onClick={() => handleSelectWithClearing(child, 3)}
                                className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                                data-selected={
                                  searchData.engine?.key === child.key ? "true" : "false"
                                }
                              >
                                <div className="flex items-center">
                                  {searchData.engine?.key === child.key && (
                                    <span className="mr-2 text-green-600">✓</span>
                                  )}
                                  <span className="text-sm">{child.value}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Enter Button - inside MME Fields Row, positioned to the right */}
            <OGButton
              type="primary"
              onClick={handleEnterClick}
              className="flex-shrink-0"
              disabled={shouldDisableEnterButton}
            >
              {getLabel("Car_basecomponent_Enter") || "Enter"}
            </OGButton>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout - Vertical
  return (
    <div className="flex w-full flex-col gap-2">
      {/* heading text */}
      <span className="text-color-text-emphasis typography-heading-04">
        {/* {getLabel("identify_your_vehicle") || "Identify your vehicle to view compatible products"} */}
        {!isCategoryCatalogPage
          ? isIncompatible
            ? // Use PDP-specific label for product-details page, otherwise use global label
              pageType === "product-details"
              ? getLabel("pdp_vehicle_no_match_found")
              : getLabel("vehicle_no_match_found")
            : (
                  isSearchResultURL
                    ? (tempData?.make?.value ||
                        tempData?.model?.value ||
                        tempData?.engine?.value) &&
                      searchMMEurl &&
                      searchMMEurl === getMMEId(searchData)
                    : (searchData?.make?.value ||
                        searchData?.model?.value ||
                        searchData?.engine?.value) &&
                      searchMMEurl &&
                      searchMMEurl === getMMEId(searchData)
                )
              ? // Use PDP-specific label for product-details page, otherwise use global label
                pageType === "product-details"
                ? getLabel("pdp_vehicle_compatible_label")
                : getLabel("vehicle_compatible_label")
              : // Use PDP-specific label for product-details page, otherwise use global label
                pageType === "product-details"
                ? getLabel("pdp_identify_your_vehicle")
                : getLabel("identify_your_vehicle")
          : getLabel("vehicle_compatible_label")}
      </span>

      {/* Make Dropdown */}
      <div className="relative">
        <div className="relative flex-1 cursor-pointer" onClick={() => handleDropdownToggle(1)}>
          {/* Input wrapper */}
          <div
            className={`relative flex items-center gap-3 rounded border bg-white px-4 py-2 ${activeStep === 1 || openDropdown === 1 ? "border-color-border-focus" : "border-gray-300"} `}
          >
            {/* Number circle *inside* input */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${activeStep >= 1 ? "bg-color-border-focus text-white" : "bg-gray-200 text-gray-500"} `}
            >
              1
            </div>

            {/* Text */}
            <span className="text-sm text-color-text-default">
              {searchData.make?.value || getLabel("select_make")}
            </span>

            {/* Dropdown Arrow */}
            <svg
              className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                openDropdown === 1 ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Dropdown menu stays the same */}
          {openDropdown === 1 && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleClickOutside} />

              <div
                ref={(el) => (dropdownRefs.current[1] = el) as any}
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
              >
                <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                  <input
                    type="text"
                    placeholder={getLabel("search_make")}
                    value={searchText[1] || ""}
                    onChange={(e) => setSearchText({ ...searchText, [1]: e.target.value })}
                    className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {isSearching && (
                  <div className="color-text-placeholder p-2 text-sm">{getLabel("loading")}</div>
                )}

                {getFilteredResults(1)?.map((result) => (
                  <div
                    key={result?.key}
                    onClick={() => handleSelectWithClearing(result as any, 1)}
                    className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-[#e3e9e7]"
                    data-selected={searchData.make?.key === result?.key ? "true" : "false"}
                  >
                    <div className="flex items-center">
                      {searchData.make?.key === result?.key && (
                        <span className="mr-2 text-green-600">✓</span>
                      )}
                      <span className="text-sm">{result?.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Model Dropdown */}
      <div className="relative">
        <div
          className={`relative flex-1 ${
            searchData.make?.value ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
          onClick={() => searchData.make?.value && handleDropdownToggle(2)}
        >
          {/* Input wrapper containing step circle */}
          <div
            className={`relative flex items-center gap-3 rounded border bg-white px-4 py-2 ${
              activeStep === 2 || openDropdown === 2
                ? "border-color-border-focus"
                : "border-gray-300"
            } `}
          >
            {/* Number Circle INSIDE the input container */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${activeStep >= 2 ? "bg-color-border-focus text-white" : "bg-gray-200 text-gray-500"} `}
            >
              2
            </div>

            {/* Label */}
            <span className="text-sm text-color-text-default">
              {searchData.model?.value || getLabel("select_model")}
            </span>

            {/* Arrow */}
            <svg
              className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                openDropdown === 2 ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Dropdown Menu - unchanged logic */}
          {openDropdown === 2 && searchData.make && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleClickOutside} />

              <div
                ref={(el) => (dropdownRefs.current[2] = el as any)}
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
              >
                <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                  <input
                    type="text"
                    placeholder={getLabel("search_model")}
                    value={searchText[2] || ""}
                    onChange={(e) => setSearchText({ ...searchText, [2]: e.target.value })}
                    className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {isSearching && (
                  <div className="color-text-placeholder p-2 text-sm">{getLabel("loading")}</div>
                )}

                {getFilteredResults(2)?.map((result) => (
                  <div key={result?.key} className="border-b last:border-b-0">
                    <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                      {result?.value}
                    </div>

                    {result?.children?.map((child: any) => (
                      <div
                        key={child.key}
                        onClick={() => handleSelectWithClearing(child, 2)}
                        className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                        data-selected={searchData.model?.key === child.key ? "true" : "false"}
                      >
                        <div className="flex items-center">
                          {searchData.model?.key === child.key && (
                            <span className="mr-2 text-green-600">✓</span>
                          )}
                          <span className="text-sm">{child.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Engine Dropdown */}
      <div className="relative">
        <div
          className={`relative flex-1 ${
            searchData.model?.value ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
          onClick={() => searchData.model?.value && handleDropdownToggle(3)}
        >
          {/* Input wrapper containing step circle */}
          <div
            className={`relative flex items-center gap-3 rounded border bg-white px-4 py-2 ${
              activeStep === 3 || openDropdown === 3
                ? "border-color-border-focus"
                : "border-gray-300"
            } `}
          >
            {/* Number Circle inside input */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${activeStep >= 3 ? "bg-color-border-focus text-white" : "bg-gray-200 text-gray-500"} `}
            >
              3
            </div>

            {/* Label */}
            <span className="truncate text-sm text-color-text-default">
              {searchData.engine?.value || getLabel("select_engine")}
            </span>

            {/* Arrow Icon */}
            <svg
              className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                openDropdown === 3 ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Engine Dropdown Menu - logic unchanged */}
          {openDropdown === 3 && searchData.model && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
              <div
                //@ts-ignore
                ref={(el) => (dropdownRefs.current[3] = el)}
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
              >
                <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                  <input
                    type="text"
                    placeholder={getLabel("search_engine")}
                    value={searchText[3] || ""}
                    onChange={(e) => setSearchText({ ...searchText, [3]: e.target.value })}
                    className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {isSearching && (
                  <div className="color-text-placeholder p-2 text-sm">{getLabel("loading")}</div>
                )}

                {getFilteredResults(3)?.map((result) => (
                  <div key={result?.key} className="border-b last:border-b-0">
                    <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                      {result?.value}
                    </div>

                    {result?.children?.map((child: any) => (
                      <div
                        key={child.key}
                        onClick={() => handleSelectWithClearing(child, 3)}
                        className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                        data-selected={searchData.engine?.key === child.key ? "true" : "false"}
                      >
                        <div className="flex items-center">
                          {searchData.engine?.key === child.key && (
                            <span className="mr-2 text-green-600">✓</span>
                          )}
                          <span className="text-sm">{child.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enter Button */}
      <OGButton
        type="primary"
        onClick={handleEnterClick}
        className="w-full"
        disabled={shouldDisableEnterButton}
      >
        {getLabel("Car_basecomponent_Enter") || "Enter"}
      </OGButton>
    </div>
  );
}
