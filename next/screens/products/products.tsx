"use client";

import OGCategoriesSearcBlock from "@/components/og-components/OGCategoriesSearcBlock";
import { Box } from "@/components/ui/box";
import { ProductList } from "./ProductList";
import { useInfiniteParts } from "@/hooks/products";
import { useUrlParams } from "@/hooks/useUrlParams";
import React, { useEffect, useState, useRef, useCallback, useMemo, RefObject } from "react";
// import { BsGrid3X3GapFill, BsListUl } from "react-icons/bs";
import { Product, ViewMode } from "@/types/product";
import { useMedia } from "@/hooks/useMedia";
// import { Text } from "@/components/ui/text";
import { useMmeStore } from "@/stores/useMmeStore";
// import { OGButton } from "@/components/og-components/OGButton";
import { getMMEId } from "@/utils/getMMEId";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSearchParams, usePathname } from "next/navigation";
import ManufacturerDrop from "./ManufacturerDrop";
import { useFilterModalStore } from "@/stores/useFilterModal";
// import NoResultUI from "./NoResultUI";
// import DesktopPriceSorting from "./MobTabPriceSorting";
// import SmallPriceDropdown from "./SmallPriceDropdown";
// import MobTabPriceSorting from "./MobTabPriceSorting";
// import SearchResultsFilterTagsSection from "./SearchResultsFilterTagsSection";
import { useFilterStore } from "@/stores/useFilter";
import { useAvailabilityUrlIntentStore } from "@/stores/useAvailabilityUrlIntentStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import SearchContainer from "@/components/SearchContainer";
import SearchResultsCarSelectionBanner from "@/components/SearchResultsCarSelectionBanner";
import NewSearchResultsCarSelectionBanner from "@/components/NewSearchResultsCarSelectionBanner";
import { detectPage } from "@/utils/detectPage";
// import SearchResultsFilterTagsSectionMobile from "./SearchResultsFilterTagsSectionMobile";
// import leftarrow from "../../public/assets/icons/arrow-left-02.svg";
import { useRouter } from "next/navigation";
import PageHeadingBlock from "./PageHeadingBlock";
import { OGProductcardSkeleton } from "@/components/og-components/OGProductcardSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCategories } from "@/contexts/CategoriesContext";
import { useBranding } from "@/contexts/BrandingContext";
// import PriceMeterNew from "./PriceMeterNew";
import NotFoundclient from "../not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";
import { ALLOWED_SEARCHDATA_SLUGS } from "@/utils/searchdataSlug";
import { getCategoryIdFromSearchParams } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { consumePreservePartsCache } from "@/utils/listingScrollRestore";
import { useVatString } from "@/hooks/useVatString";
import { useAuthStore } from "@/stores/useAuthStore";
import ProductsPageLoading from "./ProductsPageLoading";
import ViewToggle from "./ViewToggle";
import FilterToggleMobile from "./MobileFilterToggle";
import SearchResultsBreadcrumb from "./SearchResultsBreadcrumb";
import {
  categoryPathToViewItemListCategoryFields,
  computeTaxonomyPrefixPath,
} from "./searchResultsTaxonomyPath";
// import { PostPartsSearchPayload, PostPartsSearchResponse } from "@/type";
// import { View } from "react-native";
import Typography from "@/components/og-components/Typography";
import NoResultRequestForm from "./NoResultRequestForm";
import NoResultMagniGlass from "../category/NoResultMagniGlass";
import { isKnownPartsRouteSegment } from "@/config/url-segments";
// import BrandsDropdown from "./BrandsDropdown";
// import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { useManufacturersQuery } from "@/hooks/manufacturers";
// import GreenCrossIcon from "@/assets/GreenCrossIcon";
// import { set } from "zod";
import { BrandsDropdownBlock } from "./BrandsDropdownBlock";
import { SortDropdownBlock } from "./SortByBlock";
import OGAvailabilityBlock from "./AvailabilityDropdownBlock2";
import { PriceMeterDropdownBlock } from "./PriceMeterDropdownBlock";
import TypeDropdown from "./TypeDropdown";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
type Manufacturer = {
  id: string;
  name: string;
  type: string;
  image?: string;
};
type ManufacturerWithCount = Manufacturer & {
  count?: number;
};

export default function Products({
  pageTitle,
  searchdata = "",
  notfound = false,
}: {
  pageTitle?: string | (() => string);
  searchdata?: string;
  notfound?: boolean;
} = {}) {
  const isDesktop = useMedia("(min-width: 1025px)");
  // const isMobile = useMedia("(max-width: 639px)");
  const [isMounted, setIsMounted] = useState(false);
  const isMmeFeatureEnabled = isMounted ? getClientFeatureFlag("mme_feature_flag") : true;

  const queryParams = useSearchParams();
  const pathname = usePathname();
  const isNewMmeFeatureEnabled = isMounted ? getClientFeatureFlag("new_mme_feature_flag") : false;
  const isSearchResultsListing = isMounted && detectPage(pathname ?? "") === "search-results";
  const showLegacySearchContainer =
    isMmeFeatureEnabled && !(isNewMmeFeatureEnabled && isSearchResultsListing);
  const showNewMmeSearchBar = isNewMmeFeatureEnabled && isSearchResultsListing;
  const isE2EVinFlowEnabled = isMounted
    ? getClientFeatureFlag("end_to_end_vin_flow_feature_flag")
    : false;
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const { getLabel } = useBranding();
  const router = useRouter();
  const vatString = useVatString();
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const {
    closeOgSearchModal,
    setSearchData,
    searchData,
    resetSearch,
    carByVinResults,
    prefillFromUrl,
  } = useSearchModalStore();
  const { clearSelectedCategories, SelectedCategories } = useCategorySearchStore();
  const [heading, setHeading] = useState("");
  const [categoryDetails, setCategoryDetails] = useState({
    l1: "",
    l2: "",
    l3: "",
  });
  const { openModal, closeModal } = useFilterModalStore();
  const { filters, updateFilters, resetFilters, clearStoreStates } = useUrlParams();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, error } =
    useInfiniteParts();

  const isCategoryCatalogPage = React.useMemo(() => {
    if (!pathname) return false;

    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty strings

    // Check if any category slug exists in the pathname
    // Note: Both catalog AND detail pages contain category slugs
    const categoryIndex = pathSegments.findIndex((segment) => isKnownPartsRouteSegment(segment));

    if (categoryIndex === -1) {
      // No category slug found - not a category catalog page (could be search results)
      return false;
    }

    // Key distinction: Category catalog pages have the category slug as the LAST segment
    // Detail pages have additional segments (manufacturer, part-id) after the category slug
    //
    // Category catalog: [language-country, category-slug] → categoryIndex = 1, length = 2 → true
    // Detail page: [language-country, category-slug, manufacturer, part-id] → categoryIndex = 1, length = 4 → false
    const isLastSegment = categoryIndex === pathSegments.length - 1;

    return isLastSegment;
  }, [pathname]);

  const isProductDetailsPage = React.useMemo(() => {
    if (!pathname) return false;

    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty strings

    // Check if any category slug exists in the pathname
    const categoryIndex = pathSegments.findIndex((segment) => isKnownPartsRouteSegment(segment));

    if (categoryIndex === -1) {
      // No category slug found - not a product details page
      return false;
    }

    // Product details page: category slug is NOT the last segment
    // There should be at least 2 more segments after the category slug (partname + partid)
    // Expected structure: [language-country, category-slug, partname, part-id] → categoryIndex = 1, length = 4
    const hasSegmentsAfterCategory = categoryIndex < pathSegments.length - 1;
    const hasEnoughSegments = pathSegments.length >= 4; // At least 4 segments total

    return hasSegmentsAfterCategory && hasEnoughSegments;
  }, [pathname]);

  // Ticket #2078: Car selector on search results no longer uses the incompatible (red)
  // variant when totalCount is 0; empty results are only in the listing.
  //
  // #2078 — previous logic (kept for reference; do not use):
  // // Determine if parts are incompatible based on totalCount
  // const isIncompatible = isPending
  //   ? false
  //   : !isCategoryCatalogPage &&
  //     !isProductDetailsPage &&
  //     (!data?.pages?.[0]?.data ||
  //       !data.pages[0].data.totalCount ||
  //       data.pages[0].data.totalCount <= 0);
  // Then: <SearchContainer isIncompatible={isIncompatible} tempData={tempData} />

  // Log totalCount for debugging
  useEffect(() => {
    if (data?.pages?.[0]?.data) {
    }
  }, [data]);
  const [tempData, setTempData] = useState<{
    make: { key: string; value: string; originalData?: any } | null;
    model: { key: string; value: string; originalData?: any } | null;
    engine: { key: string; value: string; originalData?: any } | null;
  }>({
    make: null,
    model: null,
    engine: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const isActive = "active";
  const isVisible = isActive || isOpen;

  const isBrandsActive = "active";
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const isBrandsVisible = isBrandsActive || isBrandsOpen;
  const [pendingManufacturerIds, setPendingManufacturerIds] = useState<string[]>([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allItems = data?.pages?.flatMap((page) => page?.data?.parts) ?? [];
  // Get current year from URL to preserve it
  const currentYear = queryParams?.get("year");
  // const [selectedValue, setSelectedValue] = useState("High-Low");
  const {
    order,
    setOrder,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    defaultPriceRange,
    setDefaultPriceRange,
    reset,
    setType,
    type,
  } = useFilterStore();
  const queryClient = useQueryClient();
  const { data: categoriesData } = useCategories();
  const { isAuthenticated } = useAuthStore();

  const searchLang = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    const lc = segments[0] || "";
    return lc.split("-")[0] || "en";
  }, [pathname]);

  const searchCategoryIdsParam = getCategoryIdFromSearchParams(queryParams) || "";

  const searchResultsTaxonomyPath = useMemo(
    () => computeTaxonomyPrefixPath(categoriesData as any, searchCategoryIdsParam),
    [categoriesData, searchCategoryIdsParam],
  );

  const viewItemListCategoryContext = useMemo(
    () => categoryPathToViewItemListCategoryFields(searchResultsTaxonomyPath, searchLang),
    [searchResultsTaxonomyPath, searchLang],
  );

  // Add prefill tracking logic similar to FilterModal.tsx
  const prefillDoneRef = useRef(false);
  const lastProcessedMakeModelTypeIdRef = useRef<string | null>(null);
  const [brandSearchText, setBrandSearchText] = useState("");
  // New MME store state for Products page search
  const mmeSearchData = useMmeStore((s) => s.searchData);
  const { generateMmeSearchData, returnMmeSearchData } = useMmeStore();
  // Change detection for MME search button (similar to MMYTETFilter)
  const initialMmeSearchDataRef = useRef(mmeSearchData);
  const hasSetInitialMmeRef = useRef(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const brandsDropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (prefillDoneRef.current && !hasSetInitialMmeRef.current) {
      initialMmeSearchDataRef.current = mmeSearchData;
      hasSetInitialMmeRef.current = true;
    }
    if (!prefillDoneRef.current) {
      hasSetInitialMmeRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillDoneRef.current, mmeSearchData]);

  const isMmeChanged =
    JSON.stringify(mmeSearchData) !== JSON.stringify(initialMmeSearchDataRef.current);
  const isMmeTrulyChanged = prefillDoneRef.current && hasSetInitialMmeRef.current && isMmeChanged;

  // Handler for MME search button
  const handleMmeSearch = async () => {
    // First get MME ID
    const makeModelTypeId = getMMEId();

    // Clear MME API cache so we fetch fresh data for the new search
    useMmeStore.getState().clearMmeApiCache();

    // Then clear search data
    useMmeStore.getState().resetSearch();

    // Finally redirect with the ID
    updateFilters(
      {
        makeModelTypeId: makeModelTypeId || null,
      },
      "/products",
    );
  };

  // Reset change detection for MMYTFilter (called after MMYT save)
  const resetChangeDetection = useCallback(() => {}, []);

  const handleFilterChange = (makeModelTypeId: string) => {
    updateFilters({
      makeModelTypeId: makeModelTypeId || null,
      year: searchData?.year?.value || null,
    });
  };

  const handleCategoryChange = (categoryId: number) => {
    updateFilters({
      categoryId: String(categoryId),
      year: searchData?.year?.value || null,
    });
  };

  const handleReset = async () => {
    resetFilters("notProduct");
    reset();
    resetSearch();
    clearSelectedCategories(); // Breaks after coming from advance search (Solution: reactStrictMode: false in next,config.js)

    // Also clear store states for complete reset
    await clearStoreStates();
  };

  const getMMYT = () => {
    if (
      !searchData?.make?.value &&
      !searchData?.model?.value &&
      !searchData?.type?.value &&
      !searchData?.year?.value
    ) {
      if (carByVinResults?.length > 0) {
        const title = `${carByVinResults[0]?.brand || ""} ${carByVinResults[0]?.model || ""} ${carByVinResults[0]?.type || ""} ${carByVinResults[0]?.year || carByVinResults[0]?.yearFrom || ""}`;
        setHeading(title);
        return;
      }
    }
    const title = `${searchData?.make?.value || ""} ${searchData?.model?.value || ""} ${searchData?.type?.value || ""} ${searchData?.year?.value || ""}`;
    setHeading(title);
  };

  useEffect(() => {
    return () => {
      // Clear stores synchronously on unmount using already-imported stores
      // (avoids race condition where async dynamic imports resolve after the
      // new mount has already re-filled these stores from URL params)
      useSearchModalStore.getState().setSearchData({
        make: null,
        model: null,
        year: null,
        type: null,
      });

      const filterStore = useFilterStore.getState();
      filterStore.setOrder("priority");
      // manufacturerIds are URL-driven (not stored in useFilterStore)
      // filterStore.setManufacturerIds(null);
      filterStore.setMinPrice(null);
      filterStore.setMaxPrice(null);
      filterStore.setDefaultPriceRange(0, 50000);

      useCategorySearchStore.getState().clearSelectedCategories();

      useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(false);

      // Keep parts cache when navigating listing → PDP so Back can restore scroll.
      if (!consumePreservePartsCache()) {
        queryClient.removeQueries({ queryKey: queryKeys.products.partsPrefix() });
      }
      localStorage.removeItem("copyOfSearchData");
    };
  }, [queryClient]);

  useEffect(() => {
    getMMYT();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, carByVinResults]);

  useEffect(() => {
    // Check if URL already has price parameters
    const urlMinPrice = queryParams?.get("minPrice");
    const urlMaxPrice = queryParams?.get("maxPrice");
    const hasUrlPrices = urlMinPrice || urlMaxPrice;

    if (data?.pages[0]?.data) {
      const apiMinPrice = data.pages[0].data.minPrice;
      const apiMaxPrice = data.pages[0].data.maxPrice;

      if (
        apiMinPrice != null &&
        apiMaxPrice != null &&
        typeof apiMinPrice === "number" &&
        typeof apiMaxPrice === "number"
      ) {
        // Set defaultPriceRange from API
        setDefaultPriceRange(apiMinPrice, apiMaxPrice);

        // Only set minPrice/maxPrice if URL doesn't have them
        if (!hasUrlPrices) {
          // debugger;
          if (minPrice !== null) {
            setMinPrice(apiMinPrice);
          }
          if (maxPrice !== null) {
            setMaxPrice(apiMaxPrice);
          }
        }
      } else {
        // API has invalid prices - use fallback
        setDefaultPriceRange(0, 50000);

        if (!hasUrlPrices) {
          setMinPrice(0);
          setMaxPrice(50000);
        }
      }
    } else {
      // Even without API data, ensure we have a default range for the slider
      if (!defaultPriceRange.min && !defaultPriceRange.max) {
        setDefaultPriceRange(0, 5000);

        // Only set min/max prices if URL doesn't have them and store doesn't have them
        if (!hasUrlPrices && minPrice === null && maxPrice === null) {
          setMinPrice(0);
          setMaxPrice(50000);
        }
      }
    }

    // Handle URL price parameters if they exist
    if (hasUrlPrices) {
      // Set prices from URL, using defaults for missing values
      const finalMinPrice = urlMinPrice ? Number(urlMinPrice) : (defaultPriceRange.min ?? 0);
      const finalMaxPrice = urlMaxPrice ? Number(urlMaxPrice) : (defaultPriceRange.max ?? 50000);

      if (minPrice) {
        setMinPrice(finalMinPrice);
      }
      if (maxPrice) {
        setMaxPrice(finalMaxPrice);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, queryParams, setMinPrice, setMaxPrice, setDefaultPriceRange, defaultPriceRange]);
  const seoUrl = useRef<string | null>(null);
  const [Loading, setLoading] = useState(true);

  const { data: manufacturerData } = useManufacturersQuery();

  const selectedManufacturerIds = useMemo(() => {
    const raw = (filters as any)?.manufacturerIds;
    if (!raw) return [] as string[];
    if (Array.isArray(raw)) {
      return raw
        .map((x) => (typeof x === "string" ? x : (x as any)?.id))
        .filter((x): x is string => typeof x === "string" && x.length > 0);
    }
    if (typeof raw === "string" && raw.length > 0) return [raw];
    return [] as string[];
  }, [filters]);

  const partApiBrandCountMap = useMemo(() => {
    const firstPageData = (data as any)?.pages?.[0]?.data;
    const candidateMaps = [
      firstPageData?.brands,
      firstPageData?.manufacturerBrands,
      firstPageData?.manufacturerCounts,
      firstPageData?.brandCounts,
    ];
    const detected =
      candidateMaps.find(
        (obj) =>
          obj && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length > 0,
      ) || null;
    return detected as Record<string, number> | null;
  }, [data]);

  const dropdownBrands = useMemo<ManufacturerWithCount[]>(() => {
    const allManufacturers = (manufacturerData?.data || []) as Manufacturer[];
    if (!partApiBrandCountMap) return allManufacturers;

    const withCounts: ManufacturerWithCount[] = allManufacturers.map((m) => ({
      ...m,
      count: Object.prototype.hasOwnProperty.call(partApiBrandCountMap, m.id)
        ? Number(partApiBrandCountMap[m.id])
        : 0,
    }));

    return withCounts.sort((a, b) => {
      const ac = a.count ?? 0;
      const bc = b.count ?? 0;
      if (bc !== ac) return bc - ac;
      const an = String(a.name ?? "");
      const bn = String(b.name ?? "");
      if (an !== bn) return an.localeCompare(bn);
      return String(a.id).localeCompare(String(b.id));
    });
  }, [manufacturerData, partApiBrandCountMap]);

  const brandsCountLabel = useMemo(() => {
    const count = selectedManufacturerIds?.length ?? 0;
    return count > 0 ? `${getLabel("Brands")} (${count})` : getLabel("Brands");
  }, [getLabel, selectedManufacturerIds?.length]);

  // Disable right click and inspect element (Security measure)
  useEffect(() => {
    if (!DEBUG) return;
    // return;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === "f12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (key === "i" || key === "j" || key === "c" || key === "k")) ||
        ((e.ctrlKey || e.metaKey) && key === "u") ||
        (e.metaKey && e.altKey && (key === "i" || key === "j" || key === "c" || key === "u"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    // document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      // document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (isBrandsOpen) {
        setIsBrandsOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isBrandsOpen]);

  const selectedManufacturerIdsRef = useRef(selectedManufacturerIds);
  useEffect(() => {
    selectedManufacturerIdsRef.current = selectedManufacturerIds;
  }, [selectedManufacturerIds]);

  useEffect(() => {
    if (isBrandsOpen) {
      setPendingManufacturerIds(selectedManufacturerIdsRef.current);
    }
    // Only react to dropdown open/close, not URL filter re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrandsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isOpen) {
        if (!sortDropdownRef.current?.contains(target)) {
          setIsOpen(false);
        }
      }
      if (isBrandsOpen) {
        if (!brandsDropdownRef.current?.contains(target)) {
          setIsBrandsOpen(false);
        }
      }
    };

    if (isOpen || isBrandsOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, isBrandsOpen]);

  // Handle search data initialization
  useEffect(() => {
    const initializeSearchData = async () => {
      // Reset prefill flag when starting initialization
      prefillDoneRef.current = false;

      // Handle price parameters from URL
      const urlMinPrice = queryParams?.get("minPrice");
      const urlMaxPrice = queryParams?.get("maxPrice");

      if (urlMinPrice || urlMaxPrice) {
        // Set prices from URL, using defaults for missing values
        const finalMinPrice = urlMinPrice ? Number(urlMinPrice) : 0; // Default minPrice to 0
        const finalMaxPrice = urlMaxPrice ? Number(urlMaxPrice) : 50000; // Default maxPrice to 5000

        setMinPrice(finalMinPrice);
        setMaxPrice(finalMaxPrice);
      } else {
        // No URL price parameters - will be set from API or defaultPriceRange later
      }

      // Handle order parameter from URL
      const urlOrder = queryParams?.get("order");
      if (urlOrder && ["ASC", "DESC", "priority"].includes(urlOrder)) {
        setOrder(urlOrder as "ASC" | "DESC" | "priority");
      }

      // Handle makeModelTypeId prefilling for MME - only skip when we already have valid seoUrl
      // (prevents race: effect re-run can skip and setLoading(false) before first run completes)
      if (queryParams?.get("makeModelTypeId")) {
        const makeModelTypeId = queryParams.get("makeModelTypeId");

        const normalizedSearchdata = searchdata?.replaceAll?.("+", "plus") ?? searchdata;
        const hasSlugAlready = seoUrl.current && seoUrl.current === normalizedSearchdata;
        const canSkip =
          makeModelTypeId === lastProcessedMakeModelTypeIdRef.current && hasSlugAlready;

        if (makeModelTypeId && !canSkip) {
          lastProcessedMakeModelTypeIdRef.current = makeModelTypeId;
          const result = await generateMmeSearchData(makeModelTypeId);
          seoUrl.current = typeof result === "string" ? result : "";
        }
        setLoading(false);
      } else {
        lastProcessedMakeModelTypeIdRef.current = null;
        setLoading(false);
        seoUrl.current = "";

        const savedData = localStorage.getItem("copyOfSearchData");
        if (savedData) {
          try {
            setSearchData(JSON.parse(savedData));
          } catch (error) {
            console.error("Error parsing saved search data:", error);
          }
        }

        // Also check if we have MME data in localStorage
        const savedMmeData = localStorage.getItem("mme-search-storage");
        if (savedMmeData) {
          try {
            const parsedMmeData = JSON.parse(savedMmeData);
            if (parsedMmeData.state?.searchData?.make) {
              // The MME store will automatically load this data
            }
          } catch (error) {
            console.error("Error parsing saved MME data:", error);
          }
        }
      }

      // Handle manufacturerIds prefilling (independent of makeModelTypeId)
      const manufacturerIdsParam = queryParams?.get("manufacturerIds");
      if (manufacturerIdsParam && manufacturerIdsParam.trim() !== "") {
        // manufacturerIds are URL-driven (do not prefill into useFilterStore)
        // await prefillManufacturerIdsFromUrl(manufacturerIdsParam);
      } else {
      }

      // Category store sync is handled by OGCategoriesSearcBlock (URL → store, one-way).

      // Set prefill as complete after all operations
      prefillDoneRef.current = true;
    };

    initializeSearchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, categoriesData, searchdata]);

  // Deferred sync: apply URL order after persist rehydration so dropdown matches URL
  useEffect(() => {
    const urlOrder = queryParams?.get("order");
    if (!urlOrder || !["ASC", "DESC", "priority"].includes(urlOrder)) return;
    const id = setTimeout(() => {
      setOrder(urlOrder as "ASC" | "DESC" | "priority");
    }, 50);
    return () => clearTimeout(id);
  }, [queryParams, setOrder]);

  // Cleanup and first time load
  useEffect(() => {
    closeOgSearchModal();
    return () => {
      localStorage.removeItem("copyOfSearchData");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDropdownClick = () => {
    if (!isVisible) return;
    setIsOpen(!isOpen);
  };
  const handleBrandsDropdownClick = () => {
    if (isBrandsOpen) {
      setBrandSearchText(""); // reset on close
    }
    setIsBrandsOpen((prev) => !prev);
  };
  const toggleManufacturerById = useCallback((manufacturerId: string) => {
    setPendingManufacturerIds((prev) => {
      const isSelected = prev.includes(manufacturerId);
      return isSelected ? prev.filter((id) => id !== manufacturerId) : [...prev, manufacturerId];
    });
  }, []);

  const resetManufacturers = useCallback(() => {
    setPendingManufacturerIds([]);
    updateFilters(
      {
        manufacturerIds: null,
        year: currentYear ?? "",
      },
      "/products",
      "desktop",
      false,
      true,
    );
  }, [currentYear, updateFilters]);

  const saveManufacturers = useCallback(() => {
    const currentSorted = [...selectedManufacturerIds].sort();
    const pendingSorted = [...pendingManufacturerIds].sort();
    const hasChanged =
      currentSorted.length !== pendingSorted.length ||
      currentSorted.some((id, idx) => id !== pendingSorted[idx]);

    if (!hasChanged) {
      setIsBrandsOpen(false);
      return;
    }

    updateFilters(
      {
        manufacturerIds: pendingManufacturerIds.length > 0 ? pendingManufacturerIds : null,
        year: currentYear ?? "",
      },
      "/products",
      "desktop",
      false,
      true,
    );

    setIsBrandsOpen(false);
  }, [currentYear, pendingManufacturerIds, selectedManufacturerIds, updateFilters]);

  const handleOptionSelect = (value: string): void => {
    setOrder(value as "ASC" | "DESC" | "priority");
    setIsOpen(false);

    if (value === "priority") {
      updateFilters(
        {
          order: "priority",
          year: currentYear ?? "", // Use year from URL instead of store
        },
        "/products",
        "desktop",
        false,
        true,
      );
    } else if (value === "DESC") {
      updateFilters(
        {
          order: "DESC",
          year: currentYear ?? "", // Use year from URL instead of store
        },
        "/products",
        "desktop",
        false,
        true,
      );
    } else {
      updateFilters(
        {
          order: "ASC",
          year: currentYear ?? "", // Use year from URL instead of store
        },
        "/products",
        "desktop",
        false,
        true,
      );
    }
  };

  // get min and max price from last api call
  const priceFromLastAPICall = (type: "min" | "max") => {
    if (!data) return null;
    const { minPrice, maxPrice } = (data as any)?.pages.slice().reverse()[0]?.data; // ← slice() before reverse()
    if (type === "min") return minPrice;
    if (type === "max") return maxPrice;
  };

  // Use getPageTitle if provided, otherwise fallback to heading
  // const displayHeading = typeof getPageTitle === "function" ? getPageTitle() : getPageTitle || heading;
  // const displayHeading = pageTitle;

  // Valid [searchdata] = allowed slug (e.g. search-results) OR matching MME slug from seoUrl
  const allowedSlug = ALLOWED_SEARCHDATA_SLUGS.includes(searchdata);
  const normalizedSeoUrl = seoUrl.current?.replaceAll("+", "plus") ?? "";
  const hasMatchingMmeSlug = normalizedSeoUrl.length > 0 && normalizedSeoUrl === searchdata;
  const ifUnknowUrl = !allowedSlug && !hasMatchingMmeSlug;

  // Loading until seoUrl not set — page-shell skeleton (not a spinner) so the
  // reserved layout matches the real content below and swapping in causes
  // minimal layout shift.
  if (Loading) {
    return <ProductsPageLoading />;
  }
  if (notfound || ifUnknowUrl || vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }

  const filteredBrands = dropdownBrands?.filter((item: ManufacturerWithCount) =>
    item.name.toLowerCase().startsWith(brandSearchText.toLowerCase()),
  );

  return (
    <main className="min-min-h-screen relative w-full bg-color-background-default">
      {/* <Box className="h-full w-full gtlg:pt-[75px] ml:pl-[200px]"> */}
      <Box className={`min-h-[calc(100vh-200px)] w-full gap-content-to-footer`}>
        <Box className={`flex w-full flex-col base:mt-0 gtlg:mt-0`}>
          <>
            {/* #2078: was isIncompatible={isIncompatible} from totalCount logic above */}
            {showLegacySearchContainer && (
              <SearchContainer isIncompatible={false} tempData={tempData} />
            )}
            {showNewMmeSearchBar &&
              (isE2EVinFlowEnabled ? (
                <NewSearchResultsCarSelectionBanner surface="listing" />
              ) : (
                <SearchResultsCarSelectionBanner />
              ))}
            {/* Taxonomy breadcrumb for Search Results Page */}
            <SearchResultsBreadcrumb
              isCategoryCatalogPage={isCategoryCatalogPage}
              isProductDetailsPage={isProductDetailsPage}
              categoryId={filters.categoryId}
            />
            {/* FIXED HEADER SECTION */}
            <Box className={`flex flex-col gap-header-to-title section-standard base:pt-0`}>
              <Box className="flex w-full items-start gap-title-to-content base:mr-0 base:w-full gtlg:mr-[38px] gtlg:w-auto">
                <Box className="flex w-full flex-row items-center">
                  <PageHeadingBlock categoryDetails={categoryDetails} />
                </Box>
                {/* View Toggle - Hidden on mobile */}
              </Box>

              <Box className="flex w-full flex-col base:block gtsm:hidden">
                {/*  */}
                {/* {SelectedCategories?.length > 0 && (
                    <Box className="flex min-h-[40px] w-full flex-row items-start justify-between bg-transparent gap-title-to-content">
                      <Box className="flex flex-row items-center gap-[12px]">
                        <SearchResultsFilterTagsSectionMobile />
                      </Box>
                    </Box>
                  )} */}

                <Box className="flex w-full snap-x snap-mandatory flex-row gap-space-xs overflow-x-auto whitespace-nowrap scrollbar-hide gap-title-to-content">
                  {/* Sorting block for mobile */}
                  <Box className="shrink-0">
                    <SortDropdownBlock
                      isActive={isActive}
                      order={order}
                      currentYear={currentYear}
                      updateFilters={updateFilters}
                      setOrder={setOrder}
                    />
                  </Box>

                  <Box className="shrink-0">
                    <BrandsDropdownBlock
                      dropdownBrands={dropdownBrands}
                      selectedManufacturerIds={selectedManufacturerIds}
                      selectedManufacturerIdsRef={selectedManufacturerIdsRef}
                      brandsCountLabel={brandsCountLabel}
                      isBrandsActive={isBrandsActive}
                      currentYear={currentYear}
                      updateFilters={updateFilters}
                    />
                  </Box>

                  <Box className="shrink-0">
                    <OGAvailabilityBlock
                      state={"expanded"}
                      title={getLabel("filter_availability_label")}
                    />
                  </Box>
                  <Box className="shrink-0">
                    <TypeDropdown
                      isActive={isActive}
                      currentYear={currentYear}
                      updateFilters={updateFilters}
                      type={type}
                      setType={setType}
                    />
                  </Box>

                  <Box className="shrink-0">
                    <PriceMeterDropdownBlock
                      isActive={isActive}
                      currentYear={currentYear}
                      priceFromLastAPICall={priceFromLastAPICall}
                      updateFilters={updateFilters}
                      setMinPrice={setMinPrice}
                      setMaxPrice={setMaxPrice}
                    />
                  </Box>

                  <Box className="shrink-0">
                    <FilterToggleMobile view={viewMode} onClick={() => openModal()} />
                  </Box>
                </Box>

                <Typography className="text-color-text-muted typography-body-02 base:hidden">
                  {data?.pages[0]?.data?.totalCount}{" "}
                  {data?.pages[0]?.data?.totalCount === 1
                    ? getLabel("count_one_item")
                    : getLabel("count_items")}
                </Typography>
              </Box>
            </Box>
          </>

          {/* products pannel section for mobile starts here */}
          <Box
            className="overflow-visible section-split-primary-left base:mb-0 base:w-full"
            style={{ minHeight: "calc(100vh - 300px)" } as any}
          >
            {/* Left Filter Block starts here */}
            <Box className="h-fit w-full bg-color-background-default base:hidden gtsm:hidden gtlg:flex">
              <Box className="relative h-auto rounded-[8px] p-4 base:hidden gtsm:hidden gtlg:flex">
                <Box className="h-auto w-full rounded-[8px] bg-white pr-[6px]">
                  <OGCategoriesSearcBlock />
                  {/* Manufacturer Brand Filter */}
                  {getClientFeatureFlag("brands_filter_feature_flag") && <ManufacturerDrop />}
                  {/* pick price meter from here */}
                  {/* <PriceMeterNew
                    min={priceFromLastAPICall("min")}
                    max={priceFromLastAPICall("max")}
                    onChange={async (a) => {
                      if (a) {
                        setMinPrice(a[0] ?? null);
                        setMaxPrice(a[1] ?? null);

                        updateFilters(
                          {
                            minPrice: a[0],
                            maxPrice: a[1],
                            year: currentYear ?? "", // Preserve year from URL
                          },
                          "/products",
                        );
                      }
                      // debugger;
                    }}
                  /> */}
                  {/* <PriceMeter data={data} /> */}
                  {/* {!isDesktop && <MobTabPriceSorting />} */}
                </Box>
              </Box>
            </Box>

            {/* Left Filter Block ends here */}

            {/* RIGHT SECTION STARTS HERE */}
            <Box className="base:w-full [&_img]:pointer-events-none [&_img]:select-none [&_img]:[-webkit-touch-callout:none] [&_img]:[-webkit-user-drag:none] [&_img]:[user-drag:none]">
              <Box className="relative grid w-full flex-col gap-space-md rounded-[8px] base:bg-transparent base:px-0">
                <Box className="gtlg:max-h-auto flex items-center justify-start base:hidden gtsm:flex gtsm:h-auto gtsm:flex-col gtsm:grid-gap-listing gtlg:flex-row">
                  {/* Update and Reset Button dummy (pills section) */}
                  {/* {!isDesktop && <SearchResultsFilterTagsSection />} */}

                  {/* price low-high block */}

                  <Box className="flex-row items-start justify-between base:hidden base:w-full gtsm:flex gtlg:max-h-[40px] gtlg:min-h-[40px]">
                    {/* sorting drpdown */}
                    <Box className="flex flex-row items-center justify-start gap-space-xs overflow-visible gtsm:w-[33rem] gtsm:max-w-[33rem]">
                      {/* Brands filter for Desktop */}
                      <BrandsDropdownBlock
                        dropdownBrands={dropdownBrands}
                        selectedManufacturerIds={selectedManufacturerIds}
                        selectedManufacturerIdsRef={selectedManufacturerIdsRef}
                        brandsCountLabel={brandsCountLabel}
                        isBrandsActive={isBrandsActive}
                        currentYear={currentYear}
                        updateFilters={updateFilters}
                      />

                      {/* Availability dropdown for desktop */}
                      <OGAvailabilityBlock
                        state={"expanded"}
                        title={getLabel("filter_availability_label")}
                      />

                      <TypeDropdown
                        isActive={isActive}
                        currentYear={currentYear}
                        updateFilters={updateFilters}
                        type={type}
                        setType={setType}
                      />

                      {/* <Typography>Type</Typography> */}
                      <PriceMeterDropdownBlock
                        isActive={isActive}
                        currentYear={currentYear}
                        priceFromLastAPICall={priceFromLastAPICall}
                        updateFilters={updateFilters}
                        setMinPrice={setMinPrice}
                        setMaxPrice={setMaxPrice}
                      />
                    </Box>
                    <Box className="flex flex-row items-center justify-end gap-space-xs gtsm:w-[230px] gtsm:max-w-[230px] gtlg:w-[260px] gtlg:max-w-[260px] between-640-767:w-[200px] between-640-767:min-w-[200px]">
                      <SortDropdownBlock
                        isActive={isActive}
                        order={order}
                        currentYear={currentYear}
                        updateFilters={updateFilters}
                        setOrder={setOrder}
                      />
                      {isDesktop ? (
                        <ViewToggle
                          view={viewMode}
                          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                        />
                      ) : (
                        <FilterToggleMobile view={viewMode} onClick={() => openModal()} />
                        // <ViewToggle view={viewMode} onClick={() => openModal()} />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Typography className="min-h-[1.4rem] text-color-text-muted typography-body-02">
                  {data?.pages[0]?.data?.totalCount}{" "}
                  {data?.pages[0]?.data?.totalCount === 1
                    ? getLabel("count_one_item")
                    : getLabel("count_items")}
                </Typography>

                {/* //  */}
                <Box id="scrollableDiv" className="h-auto min-h-0 flex-1">
                  {isPending ? (
                    <Box
                      className={`${
                        viewMode === "grid"
                          ? "base:flex base:flex-col gtsm:flex gtsm:flex-col gtsm:grid-gap-listing gtlg:grid gtlg:grid-cols-3 gtlg:gap-6 2xl:grid-cols-3"
                          : "flex flex-col grid-gap-listing"
                      }`}
                    >
                      {Array.from({ length: 8 })?.map((_, index) => (
                        <OGProductcardSkeleton key={index} view={viewMode} />
                      ))}
                    </Box>
                  ) : allItems.length === 0 && !isPending ? (
                    <Box className="flex w-full flex-col items-center justify-center gap-space-lg">
                      <Box className="flex flex-col items-center justify-center gap-space-sm base:w-full gtsm:max-w-[560px]">
                        <NoResultMagniGlass className="text-color-text-muted" />
                        <Typography className="text-color-text-default typography-heading-03">
                          {getLabel("no_results_l3_title")}
                        </Typography>
                        <Typography className="text-center text-color-text-muted typography-subtitle-01">
                          {getLabel("no_results_l3_description")}
                        </Typography>
                      </Box>
                      <NoResultRequestForm />
                    </Box>
                  ) : (
                    // <Typography>No data</Typography>
                    <ProductList
                      items={allItems as Product[]}
                      hasMore={!!hasNextPage}
                      onLoadMore={fetchNextPage}
                      isLoading={isFetchingNextPage}
                      viewMode={viewMode}
                      vatString={vatString}
                      viewItemListCategoryContext={viewItemListCategoryContext}
                    />
                  )}
                </Box>
                {/* {!isPending && allItems.length === 0 && <NoResultUI />} */}
              </Box>
            </Box>

            {/* RIGHT SECTION ENDS HERE */}
          </Box>
        </Box>
      </Box>
    </main>
  );
}
