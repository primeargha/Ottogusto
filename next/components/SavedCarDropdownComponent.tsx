"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSearchContainerStore } from "@/stores/useSearchContainerStore";
import { useBranding } from "@/contexts/BrandingContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useMmeStore } from "@/stores/useMmeStore";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useUrlParams } from "@/hooks/useUrlParams";
import { detectPage } from "@/utils/detectPage";
import { Box } from "./ui/box";
import carLogogreen from "@/assets/car_check.svg";
import carNoResult from "@/assets/car_crash.svg";
import { OGButton } from "./og-components/OGButton";
import { ALL_PARTS_ROUTE_SEGMENTS, isKnownPartsRouteSegment } from "@/config/url-segments";

interface SavedCar {
  id: string;
  brandName: string;
  modelName: string;
  engineName?: string;
  makeModelTypeId: string;
  isFavorite: boolean;
  name?: string;
}

interface SavedCarDropdownComponentProps {
  onSelectCar?: () => void;
  isIncompatible?: boolean;
}

export default function SavedCarDropdownComponent({
  onSelectCar,
  isIncompatible,
}: SavedCarDropdownComponentProps) {
  // ✅ Use SavedCarsContext directly instead of props (always gets latest data)
  const { savedCars: savedCarsFromContext } = useSavedCars();
  const savedCarsData = React.useMemo(() => savedCarsFromContext || [], [savedCarsFromContext]);
  const { switchToView1 } = useSearchContainerStore();
  const { getLabel } = useBranding();
  const { searchData, generateMmeSearchData } = useMmeStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { updateFilters } = useUrlParams();

  const isCarPartsPage = React.useMemo(() => {
    if (!pathname) return false;
    return ALL_PARTS_ROUTE_SEGMENTS.some((slug) => pathname.includes(slug));
  }, [pathname]);

  const isCategoryCatalogPage = React.useMemo(() => {
    if (!pathname) return false;

    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty strings

    // Check if any category slug exists in the pathname
    const categoryIndex = pathSegments.findIndex((segment) => isKnownPartsRouteSegment(segment));

    if (categoryIndex === -1) {
      return false;
    }

    const isLastSegment = categoryIndex === pathSegments.length - 1;

    return isLastSegment;
  }, [pathname]);

  // Detect the current page type using the centralized detectPage function
  const currentPageType = React.useMemo(() => {
    if (!pathname) return "search-results";
    const pageType = detectPage(pathname);
    return pageType;
  }, [pathname]);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedCar, setSelectedCar] = useState<SavedCar | null>(null);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasInitializedSelection = useRef(false);

  // Track temporary makeModelTypeId (selected in dropdown but not yet submitted to URL)
  const [tempMakeModelTypeId, setTempMakeModelTypeId] = useState<string | null>(null);
  // Track URL makeModelTypeId on initial load
  const urlMakeModelTypeIdOnLoadRef = useRef<string | null>(null);
  // Track last processed savedCarsData length to detect when new car is added
  const lastSavedCarsLengthRef = useRef<number>(0);

  useClickOutside(menuRef, () => {
    setOpenDropdown(false);
  });

  // Preselect car based on URL makeModelTypeId or searchData match (ONLY ON INITIAL LOAD)
  useEffect(() => {
    // For category pages: Reset initialization if savedCarsData changed (new car added)
    if (isCategoryCatalogPage && savedCarsData.length !== lastSavedCarsLengthRef.current) {
      // New car was added - reset initialization to allow reselection
      if (savedCarsData.length > lastSavedCarsLengthRef.current) {
        hasInitializedSelection.current = false;
        lastSavedCarsLengthRef.current = savedCarsData.length;
      }
    }

    // Only run on initial load - don't overwrite user's manual selections
    if (hasInitializedSelection.current) {
      return;
    }

    if (savedCarsData.length === 0) {
      // If no saved cars, clear selection
      setSelectedCar(null);
      setTempMakeModelTypeId(null);
      hasInitializedSelection.current = true;
      lastSavedCarsLengthRef.current = 0;
      return;
    }

    const urlMakeModelTypeId = searchParams?.get("makeModelTypeId");

    // Store URL makeModelTypeId on initial load (only once)
    if (urlMakeModelTypeId) {
      urlMakeModelTypeIdOnLoadRef.current = urlMakeModelTypeId;
    }

    // First, try to match by URL parameter
    if (urlMakeModelTypeId) {
      const matchingCar = savedCarsData.find((car) => car.makeModelTypeId === urlMakeModelTypeId);

      if (matchingCar) {
        // Found matching car - select it
        setSelectedCar(matchingCar);
        // Set temporary makeModelTypeId to match URL (no change detected on initial load)
        setTempMakeModelTypeId(matchingCar.makeModelTypeId);
        hasInitializedSelection.current = true;
        lastSavedCarsLengthRef.current = savedCarsData.length;

        // For category pages: Update heading when car is preselected
        if (isCategoryCatalogPage && onSelectCar) {
          onSelectCar();
        }
        return;
      } else {
        // URL has makeModelTypeId but no matching car found in saved cars list
        // Clear selection to show "Select car" default text
        setSelectedCar(null);
        setTempMakeModelTypeId(null);
        hasInitializedSelection.current = true;
        lastSavedCarsLengthRef.current = savedCarsData.length;
        return;
      }
    }

    // If no URL makeModelTypeId and not yet initialized, try to match by searchData
    if (searchData?.make?.value && searchData?.model?.value) {
      const matchingCar = savedCarsData.find(
        (car) =>
          car.brandName === searchData.make?.value && car.modelName === searchData.model?.value,
      );
      if (matchingCar) {
        setSelectedCar(matchingCar);
        setTempMakeModelTypeId(matchingCar.makeModelTypeId);
        hasInitializedSelection.current = true;
        lastSavedCarsLengthRef.current = savedCarsData.length;
      } else {
        hasInitializedSelection.current = true;
        lastSavedCarsLengthRef.current = savedCarsData.length;
      }
    } else {
      hasInitializedSelection.current = true;
      lastSavedCarsLengthRef.current = savedCarsData.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCarsData, searchParams, isCategoryCatalogPage, onSelectCar]);

  // Sync tempMakeModelTypeId when URL makeModelTypeId changes externally (not from user dropdown selection)
  useEffect(() => {
    // Only sync if already initialized (to avoid interfering with initial load)
    if (!hasInitializedSelection.current) {
      return;
    }

    const urlMakeModelTypeId = searchParams?.get("makeModelTypeId");
    const previousUrlMakeModelTypeId = urlMakeModelTypeIdOnLoadRef.current;

    // Only sync if URL actually changed externally (different from what we stored)
    // This prevents syncing when user manually changes dropdown (which doesn't update URL)
    if (urlMakeModelTypeId && urlMakeModelTypeId !== previousUrlMakeModelTypeId) {
      // URL changed externally - update tempMakeModelTypeId to match
      setTempMakeModelTypeId(urlMakeModelTypeId);
      // Also update selectedCar if it exists
      const matchingCar = savedCarsData.find((car) => car.makeModelTypeId === urlMakeModelTypeId);
      if (matchingCar) {
        setSelectedCar(matchingCar);
        // For category pages: Update heading when car is synced from URL
        if (isCategoryCatalogPage && onSelectCar) {
          onSelectCar();
        }
      }
      // Update the reference to track the new URL
      urlMakeModelTypeIdOnLoadRef.current = urlMakeModelTypeId;
    }
  }, [searchParams, savedCarsData, isCategoryCatalogPage, onSelectCar]);

  // Clear the selected car if it was removed from the saved cars list (e.g. deleted via
  // the "Remove Car" sidebar action) — savedCarsData already updates reactively from the
  // same React Query cache the delete invalidates, but selectedCar otherwise never re-syncs.
  useEffect(() => {
    if (!selectedCar) return;
    const stillExists = savedCarsData.some((car) => car.id === selectedCar.id);
    if (!stillExists) {
      setSelectedCar(null);
      setTempMakeModelTypeId(null);
    }
  }, [savedCarsData, selectedCar]);

  // Separate cars into Favorite and Most Recent
  const favoriteCars = savedCarsData.filter((car) => car.isFavorite);
  const mostRecentCars = savedCarsData.filter((car) => !car.isFavorite);

  // Filter cars based on search text
  const filterCars = (cars: SavedCar[]) => {
    if (!searchText.trim()) return cars;
    const searchLower = searchText.toLowerCase();
    return cars.filter(
      (car) =>
        `${car.brandName} ${car.modelName}`.toLowerCase().includes(searchLower) ||
        car.name?.toLowerCase().includes(searchLower),
    );
  };

  const filteredFavoriteCars = filterCars(favoriteCars);
  const filteredMostRecentCars = filterCars(mostRecentCars);

  // Get currently selected car display text
  const getSelectedCarText = () => {
    if (selectedCar) {
      return `${selectedCar.brandName} ${selectedCar.modelName}`.trim();
    }
    // If URL has makeModelTypeId but no matching car found, show "Select car" (don't use searchData)
    const urlMakeModelTypeId = searchParams?.get("makeModelTypeId");
    if (urlMakeModelTypeId && savedCarsData.length > 0) {
      const matchingCar = savedCarsData.find((car) => car.makeModelTypeId === urlMakeModelTypeId);
      if (!matchingCar) {
        // URL has makeModelTypeId but no matching saved car - show "Select car"
        return getLabel("pick_select_car") || "Select car";
      }
    }
    // Fallback to searchData only if no URL makeModelTypeId or if URL makeModelTypeId matches a saved car
    // if (searchData.make && searchData.model) {
    //   // debugger;
    //   return `${searchData.make.value} ${searchData.model.value}`.trim();
    // }
    return getLabel("pick_select_car") || "Select car";
  };

  // Handle car selection from dropdown
  const handleCarSelect = async (car: SavedCar) => {
    setSelectedCar(car);
    setOpenDropdown(false);
    // Store temporary makeModelTypeId (don't update URL yet)
    setTempMakeModelTypeId(car.makeModelTypeId);
    // Populate MME store with selected car data (for display purposes)
    if (car.makeModelTypeId) {
      await generateMmeSearchData(car.makeModelTypeId);
    }
    // DO NOT update URL here - only update when "Select car" button is clicked
  };

  // Handle "Add new car" click
  const handleAddNewCar = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenDropdown(false);
    switchToView1();
  };

  // Check if "Select car" button should be disabled
  const shouldDisableSelectButton = React.useMemo(() => {
    const urlMakeModelTypeId = searchParams?.get("makeModelTypeId");
    // Disable if no car selected or if temporary makeModelTypeId matches URL makeModelTypeId
    if (!tempMakeModelTypeId) {
      return true;
    }
    // Disable if temporary makeModelTypeId matches URL makeModelTypeId (no change detected)
    if (tempMakeModelTypeId === urlMakeModelTypeId) {
      return true;
    }
    // Enable if temporary makeModelTypeId differs from URL makeModelTypeId
    return false;
  }, [tempMakeModelTypeId, searchParams]);

  // Handle "Select car" button click - update URL with makeModelTypeId and title
  const handleSelectCar = () => {
    if (tempMakeModelTypeId) {
      // Update the URL reference BEFORE updating URL (to prevent sync effect from interfering)
      urlMakeModelTypeIdOnLoadRef.current = tempMakeModelTypeId;

      // Update URL with temporary makeModelTypeId
      if (isCarPartsPage) {
        // For car parts pages (catalog OR detail): Update current URL with makeModelTypeId
        const currentParams = new URLSearchParams(searchParams?.toString() || "");
        currentParams.set("makeModelTypeId", tempMakeModelTypeId);
        const newUrl = `${pathname}?${currentParams.toString()}`;
        router.push(newUrl);

        // For catalog pages: also update the heading
        if (isCategoryCatalogPage && onSelectCar) {
          onSelectCar();
        }
      } else {
        // For other pages: redirect to products page
        updateFilters(
          {
            makeModelTypeId: tempMakeModelTypeId,
          },
          "/products",
        );
      }
    }
  };

  // Unified layout for desktop and mobile (responsive purely via CSS)
  return (
    <div className="relative flex w-full flex-col gap-4 section-standard gtsm:flex-row gtsm:items-start gtsm:gap-8">
      {/* Icon is hidden on small mobile, visible from gtsm upwards */}
      <div className="hidden gtsm:block">
        {isIncompatible ? (
          <Image src={carNoResult} alt="carLogo" className="" />
        ) : (
          <Image src={carLogogreen} alt="carLogo" className="" />
        )}
      </div>

      {/* Text and controls */}
      <div className="flex flex-1 flex-col gap-2">
        <span className="text-color-text-emphasis typography-heading-04">
          {isIncompatible
            ? currentPageType === "product-details"
              ? getLabel("pdp_vehicle_no_match_found") ||
                "Product not compatible with selected vehicle"
              : getLabel("vehicle_no_match_found") || "No matches found"
            : currentPageType === "product-details"
              ? getLabel("pdp_vehicle_compatible_label") ||
                "Product compatible with selected vehicle"
              : getLabel("vehicle_compatible_label") || "Showing products compatible with"}
        </span>

        <Box className="flex w-full flex-col items-start justify-start gap-2 gtsm:flex-row">
          {/* Dropdown Field */}
          <Box className="relative h-full w-full max-w-[360px]" ref={dropdownRef as any}>
            <div
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex max-w-[360px] cursor-pointer items-center justify-between rounded border border-gray-300 bg-white p-3"
            >
              <span className="text-sm text-color-text-default">{getSelectedCarText()}</span>
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${
                  openDropdown ? "rotate-180" : ""
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

            {/* Dropdown Menu */}
            {openDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(false)} />
                <div
                  ref={menuRef}
                  className="custom-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search Input */}
                  <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
                    <input
                      type="text"
                      placeholder={getLabel("search") || "Search..."}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Add new car OD-1459 need to change the key */}
                  <button
                    type="button"
                    onClick={(e) => handleAddNewCar(e)}
                    className="w-full cursor-pointer border-b border-l-0 border-r-0 border-t-0 p-2 text-left hover:bg-[#e3e9e7]"
                  >
                    <span className="text-sm font-medium">
                      {getLabel("add_new_car_to_eb_btn") || "Add new car"}
                    </span>
                  </button>

                  {/* Favorite Section */}
                  {filteredFavoriteCars.length > 0 && (
                    <div className="border-b">
                      <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                        {getLabel("favorite") || "Favorite"}
                      </div>
                      {filteredFavoriteCars.map((car) => (
                        <div
                          key={car.id}
                          onClick={() => handleCarSelect(car)}
                          className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                        >
                          <div className="flex items-center">
                            {selectedCar?.id === car.id && (
                              <span className="mr-2 text-green-600">✓</span>
                            )}
                            <span className="text-sm">
                              {car.brandName} {car.modelName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Most Recent Section */}
                  {filteredMostRecentCars.length > 0 && (
                    <div className="border-b last:border-b-0">
                      <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                        {getLabel("most_recent") || "Most Recent"}
                      </div>
                      {filteredMostRecentCars.map((car) => (
                        <div
                          key={car.id}
                          onClick={() => handleCarSelect(car)}
                          className="cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                        >
                          <div className="flex items-center">
                            {selectedCar?.id === car.id && (
                              <span className="mr-2 text-green-600">✓</span>
                            )}
                            <span className="text-sm">
                              {car.brandName} {car.modelName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </Box>
          <OGButton
            type="primary"
            onClick={handleSelectCar}
            className="flex-shrink-0"
            disabled={shouldDisableSelectButton}
          >
            {getLabel("pick_select_car") || "Select car"}
          </OGButton>
        </Box>
      </div>
    </div>
  );
}
