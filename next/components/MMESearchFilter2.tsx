"use client";

import React from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { useMmeStore } from "@/stores/useMmeStore";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { useBrands } from "@/contexts/BrandsContext";

// THIS COMPONENT WILL BE USED FOR MME SEARCH FILTER
export default function MMESearchFilter2() {
  const { getLabel } = useBranding();
  const { currentStep, searchData, searchResults, isSearching, updateSearchData, setStep } =
    useMmeStore();
  const isMobile = useMedia("(max-width: 639px)");
  // State to manage which dropdown is open
  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null);
  // State to manage search text for each dropdown
  const [searchText, setSearchText] = React.useState<{ [key: number]: string }>({});
  // Refs for dropdown containers to enable scrolling
  const dropdownRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});

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
    const dropdownRef = dropdownRefs.current[step];
    if (!dropdownRef) {
      return;
    }

    // For step 2 (Model), use optimized approach for nested grouping
    if (step === 2) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        let selectedElement: Element | null = null;

        // Look for selected child elements first (more specific for nested structure)
        selectedElement = dropdownRef.querySelector('[data-selected="true"]');

        // If not found, look for any element with the selected model key
        if (!selectedElement && searchData.model?.key) {
          const allElements = dropdownRef.querySelectorAll("[data-selected]");
          selectedElement =
            Array.from(allElements).find((el) => el.getAttribute("data-selected") === "true") ||
            null;
        }

        if (selectedElement) {
          // Calculate scroll position more efficiently
          const dropdownHeight = dropdownRef.clientHeight;
          const elementTop = (selectedElement as HTMLElement).offsetTop;
          const elementHeight = (selectedElement as HTMLElement).clientHeight;

          // Calculate optimal scroll position (center the element)
          const targetScrollTop = elementTop - dropdownHeight / 2 + elementHeight / 2;

          // Use immediate scroll for better performance
          dropdownRef.scrollTop = Math.max(0, targetScrollTop);
        } else {
          // Fallback: scroll to top
          dropdownRef.scrollTop = 0;
        }
      });
    } else {
      // For steps 1 and 3, use the original working approach
      requestAnimationFrame(() => {
        const selectedElement = dropdownRef.querySelector('[data-selected="true"]');

        if (selectedElement) {
          // Check if the selected element is already visible
          const dropdownRect = dropdownRef.getBoundingClientRect();
          const selectedRect = selectedElement.getBoundingClientRect();

          const isVisible =
            selectedRect.top >= dropdownRect.top && selectedRect.bottom <= dropdownRect.bottom;

          if (!isVisible) {
            // Calculate the scroll position to center the selected element
            const scrollTop =
              // @ts-ignore
              selectedElement?.offsetTop -
              dropdownRef.clientHeight / 2 +
              selectedElement.clientHeight / 2;

            // Scroll within the dropdown container only
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

  // Clear field function
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

  // Handle dropdown toggle
  const handleDropdownToggle = async (step: number) => {
    if (openDropdown === step) {
      // Reset scroll position when closing dropdown
      const dropdownRef = dropdownRefs.current[step];
      if (dropdownRef) {
        dropdownRef.scrollTop = 0;
      }
      setOpenDropdown(null); // Close if already open
    } else {
      // Clear search text for this step when opening dropdown
      setSearchText((prev) => ({
        ...prev,
        [step]: "",
      }));

      setOpenDropdown(step); // Open this dropdown

      // ✅ setStep will handle fetching models and engines (don't call fetchModels/fetchEngines here to avoid duplicate calls)
      await setStep(step); // Set the current step (this will fetch models/engines if needed)

      // ✅ Handle brands separately (AFTER setStep) to use context data
      // setStep clears searchResults when switching steps, so we set brands after
      if (step === 1 && brandsData && brandsData.length > 0) {
        // ✅ Use brands from context instead of fetching
        const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
          key: brand.id,
          value: brand.brand ?? "",
        }));
        useMmeStore.getState().setSearchResults(results);
      }

      // Scroll to selected element when dropdown opens
      if (step === 2) {
        // For step 2 (Model), use optimized timing
        setTimeout(() => {
          scrollToSelected(step);
        }, 100);
      } else {
        // For steps 1 and 3, add a slight delay to ensure DOM updates
        [600, 1200].forEach((delay) => {
          setTimeout(() => {
            scrollToSelected(step);
          }, delay);
        });
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
      {/* Make Selection */}
      <div className="relative mb-3 cursor-pointer border-l border-color-primary-main bg-color-background-default p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <select
              value={searchData.make?.key || ""}
              onFocus={async () => {
                setStep(1);
                if (searchResults.length === 0 && brandsData && brandsData.length > 0) {
                  // ✅ Use brands from context instead of fetching
                  const results = brandsData.map((brand: MakeModelTypeBrandItem) => ({
                    key: brand.id,
                    value: brand.brand ?? "",
                  }));
                  useMmeStore.getState().setSearchResults(results);
                }
              }}
              onChange={(e) => {
                const selectedMake = searchResults?.find((r) => r?.key === e.target.value);
                if (selectedMake) {
                  handleSelectWithClearing(selectedMake, 1);
                }
              }}
              className="w-full cursor-pointer rounded border border-gray-300 bg-white p-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="" disabled>
                {searchData.make?.value || `${getLabel("select_make")}`}
              </option>
              {currentStep === 1 &&
                searchResults?.map((result) => (
                  <option key={result?.key} value={result?.key}>
                    {result?.value}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="relative mb-3 cursor-pointer border-l border-color-primary-main bg-color-background-default p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <select
              value={searchData.model?.key || ""}
              onFocus={async () => {
                if (searchData.make?.key) {
                  // ✅ setStep already calls fetchModels internally, no need to call it again
                  setStep(2);
                }
              }}
              onChange={(e) => {
                let selectedModel: any = null;
                searchResults?.forEach((parent) => {
                  if (parent.children) {
                    const found = parent.children.find(
                      (child: any) => child.key === e.target.value,
                    );
                    if (found) selectedModel = found;
                  }
                });
                if (selectedModel) {
                  handleSelectWithClearing(selectedModel, 2);
                }
              }}
              disabled={!searchData.make?.value}
              className={`w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 ${
                searchData.make?.value ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <option value="" disabled>
                {getLabel("select_model")}
              </option>
              {currentStep === 2 &&
                searchResults?.map((result) => (
                  <optgroup key={result.key} label={result.value}>
                    {result.children?.map((child: any) => (
                      <option key={child.key} value={child.key}>
                        {child.value}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Engine Selection */}
      <div
        className={`relative ${isMobile ? "" : "mb-3"} cursor-pointer border-l border-color-primary-main bg-color-background-default p-3`}
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
              searchData.model?.value ? "text-color-primary-main" : "text-gray-400"
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
              ref={(el: any) => (dropdownRefs.current[3] = el)}
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
              {getFilteredResults(3)?.map((result: any) => (
                <div key={result.key} className="border-b last:border-b-0">
                  {/* Fuel Type Header */}
                  <div className="bg-gray-50 p-2 font-semibold text-gray-700">{result.value}</div>
                  {/* Engine Options */}
                  {result.children &&
                    result.children?.map((child: any) => (
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
