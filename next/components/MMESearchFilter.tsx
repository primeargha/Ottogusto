"use client";

import React, { useEffect, useState } from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { useMmeStore } from "@/stores/useMmeStore";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { useBrands } from "@/contexts/BrandsContext";
import { getClientOS } from "@/helpers/UtilityHelper";

export default function MMESearchFilter() {
  const { getLabel } = useBranding();
  const { currentStep, searchData, searchResults, isSearching, updateSearchData, setStep } =
    useMmeStore();
  const isMobile = useMedia("(max-width: 639px)");

  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null);

  const [searchText, setSearchText] = React.useState<{ [key: number]: string }>({});

  const dropdownRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const info = getClientOS();
    if (info?.isIOS) setIsIOS(true);
  }, []);

  const { brands: brandsData } = useBrands();

  React.useEffect(() => {
    if (currentStep === 1 && searchResults.length === 0 && brandsData && brandsData.length > 0) {
      const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
        key: brand.id,
        value: brand.brand ?? "",
      }));
      useMmeStore.getState().setSearchResults(results);
    }
  }, [currentStep, searchResults.length, brandsData]);

  const getFilteredResults = (step: number) => {
    const text = searchText[step] || "";
    if (!text.trim()) return searchResults;

    return searchResults
      ?.map((result) => {
        const mainMatches = result.value.toLowerCase().includes(text.toLowerCase());

        let filteredChildren: any = null;
        if (result.children) {
          filteredChildren = result.children.filter((child: any) =>
            child.value.toLowerCase().includes(text.toLowerCase()),
          );
        }

        if (mainMatches) {
          return result;
        }

        if (filteredChildren && filteredChildren?.length > 0) {
          return {
            ...result,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const scrollToSelected = (step: number) => {
    const dropdownRef = dropdownRefs.current[step];
    if (!dropdownRef) {
      return;
    }

    if (step === 2) {
      requestAnimationFrame(() => {
        let selectedElement: Element | null = null;

        selectedElement = dropdownRef.querySelector('[data-selected="true"]');

        if (!selectedElement && searchData.model?.key) {
          const allElements = dropdownRef.querySelectorAll("[data-selected]");
          selectedElement =
            Array.from(allElements).find((el) => el.getAttribute("data-selected") === "true") ||
            null;
        }

        if (selectedElement) {
          const dropdownHeight = dropdownRef.clientHeight;
          const elementTop = (selectedElement as HTMLElement).offsetTop;
          const elementHeight = (selectedElement as HTMLElement).clientHeight;

          const targetScrollTop = elementTop - dropdownHeight / 2 + elementHeight / 2;

          dropdownRef.scrollTop = Math.max(0, targetScrollTop);
        } else {
          dropdownRef.scrollTop = 0;
        }
      });
    } else {
      requestAnimationFrame(() => {
        const selectedElement = dropdownRef.querySelector('[data-selected="true"]');

        if (selectedElement) {
          const dropdownRect = dropdownRef.getBoundingClientRect();
          const selectedRect = selectedElement.getBoundingClientRect();

          const isVisible =
            selectedRect.top >= dropdownRect.top && selectedRect.bottom <= dropdownRect.bottom;

          if (!isVisible) {
            const scrollTop =
              (selectedElement as HTMLElement).offsetTop -
              dropdownRef.clientHeight / 2 +
              selectedElement.clientHeight / 2;

            dropdownRef.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: "smooth",
            });
          }
        } else {
          // Fallback: scroll to top if no selected element found
          dropdownRef.scrollTop = 0;
        }
      });
    }
  };

  const clearField = (step: number) => {
    const currentSearchData = useMmeStore.getState().searchData;
    const newSearchData = { ...currentSearchData };

    switch (step) {
      case 1: // Make
        newSearchData.make = null;
        newSearchData.model = null;
        newSearchData.engine = null;
        break;
      case 2: // Model
        newSearchData.model = null;
        newSearchData.engine = null;
        break;
      case 3: // Engine
        newSearchData.engine = null;
        break;
    }

    useMmeStore.getState().setSearchData(newSearchData);
    setSearchText({ ...searchText, [step]: "" });
  };

  const handleDropdownToggle = async (step: number) => {
    if (openDropdown === step) {
      const dropdownRef = dropdownRefs.current[step];
      if (dropdownRef) {
        dropdownRef.scrollTop = 0;
      }
      setOpenDropdown(null); // Close if already open
    } else {
      setSearchText((prev) => ({
        ...prev,
        [step]: "",
      }));

      setOpenDropdown(step); // Open this dropdown

      // setStep will handle fetching models and engines (don't call fetchModels/fetchEngines here to avoid duplicate calls)
      await setStep(step); // Set the current step (this will fetch models/engines if needed)

      // Handle brands separately (AFTER setStep) to use context data
      // setStep clears searchResults when switching steps, so we set brands after
      if (step === 1 && brandsData && brandsData.length > 0) {
        // ✅ Use brands from context instead of fetching
        const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
          key: brand.id,
          value: brand.brand ?? "",
        }));
        useMmeStore.getState().setSearchResults(results);
      }

      if (step === 2) {
        setTimeout(() => {
          scrollToSelected(step);
        }, 100);
      } else {
        [600, 1200].forEach((delay) => {
          setTimeout(() => {
            scrollToSelected(step);
          }, delay);
        });
      }
    }
  };

  const handleSelectWithClearing = (
    option: { key: string; value: string; originalData?: any },
    step: number,
  ) => {
    const currentSearchData = useMmeStore.getState().searchData;
    let shouldClearSubsequent = false;

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
        break;
    }

    // If we need to clear subsequent data, do it manually
    if (shouldClearSubsequent) {
      const newSearchData = { ...currentSearchData };

      if (step === 1) {
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
  };

  // Handle click outside to close dropdown
  const handleClickOutside = (event: React.MouseEvent) => {
    if (openDropdown !== null) {
      setOpenDropdown(null);
    }
  };
  const isLandingRoute = false; //useCheckForLandingPage();

  return (
    <div className={`relative ${isLandingRoute ? "h-full" : ""}`}>
      <div
        className="relative mb-3 cursor-pointer border-l border-button-outline-border bg-color-background-default p-3"
        onClick={() => handleDropdownToggle(1)}
      >
        <div className="flex cursor-pointer items-center justify-between">
          <div className="flex-1">
            <div className="color-text-placeholder text-sm">
              {searchData.make?.value || `${getLabel("select_make")}`}
            </div>
          </div>
          <button className="ml-4 text-button-outline-text">
            <svg
              className={`h-5 w-5 text-button-outline-text transition-transform duration-200 ${openDropdown === 1 ? "rotate-180" : ""}`}
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
          </button>
        </div>

        {openDropdown === 1 && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
            {/* Dropdown */}
            <div
              ref={(el) => (dropdownRefs.current[1] = el) as any}
              className="custom-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
            >
              {/* Search Input */}
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

      {/* Model Selection */}
      <div
        className="relative mb-3 cursor-pointer border-l border-button-outline-border bg-color-background-default p-3"
        onClick={() => searchData.make?.value && handleDropdownToggle(2)}
      >
        <div
          className={`flex items-center justify-between ${
            searchData.make?.value ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          <div className="flex-1">
            <div className="color-text-placeholder text-sm">
              {searchData.model?.value || `${getLabel("select_model")}`}
            </div>
          </div>
          <div
            className={`ml-4 ${
              searchData.make?.value ? "text-button-outline-text" : "text-gray-400"
            }`}
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 2 ? "rotate-180" : ""}`}
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
        </div>

        {/* Model Dropdown Overlay */}
        {openDropdown === 2 && searchData.make && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
            {/* Dropdown */}
            <div
              ref={(el) => (dropdownRefs.current[2] = el) as any}
              className="custom-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
            >
              {/* Search Input */}
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
                  {/* Model Name Header */}
                  <div className="bg-gray-50 p-2 font-semibold text-gray-700">{result?.value}</div>
                  {/* Model Variants */}
                  {result?.children &&
                    result?.children?.map((child: any) => (
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

      {/* Engine Selection */}
      <div
        className={`relative ${isMobile ? "" : "mb-3"} cursor-pointer border-l border-button-outline-border bg-color-background-default p-3`}
        onClick={() => searchData.model?.value && handleDropdownToggle(3)}
      >
        {/* Left Border for Engine */}
        <div
          className={`flex items-center justify-between ${
            searchData.model?.value ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          <div className="flex-1">
            <div className="color-text-placeholder text-sm">
              {searchData.engine?.value || `${getLabel("select_engine")}`}
            </div>
          </div>
          <div
            className={`ml-4 ${
              searchData.model?.value ? "text-button-outline-text" : "text-gray-400"
            }`}
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 3 ? "rotate-180" : ""}`}
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
        </div>

        {/* Engine Dropdown Overlay */}
        {openDropdown === 3 && searchData.model && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
            {/* Dropdown */}
            <div
              ref={(el) => (dropdownRefs.current[3] = el) as any}
              className="custom-scrollbar absolute left-0 right-0 top-full z-[900] mt-1 max-h-60 overflow-visible overflow-y-auto rounded border bg-[#dee4e2]"
            >
              {/* Search Input */}
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
                  {/* Fuel Type Header */}
                  <div className="bg-gray-50 p-2 font-semibold text-gray-700">{result?.value}</div>
                  {/* Engine Options */}
                  {result?.children &&
                    result?.children?.map((child: any) => (
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
  );
}
