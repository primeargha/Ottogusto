import { useCallback, useRef, useEffect, useMemo } from "react";

import slugify from "slugify";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { convertObjToSearchParams, convertQueryParamsToObj } from "@/utils/queryParams";
import { appendAllowedTrackingParamsToQueryString } from "@/utils/searchResultsQueryAllowlist";
import {
  DEFAULT_AVAILABILITY_FILTER_KEYS,
  MAX_COUNT,
  URL_UPDATE_DEBOUNCE_DELAY,
  MANUFACTURER_TYPES,
} from "@/constants";
import { useAvailabilityUrlIntentStore } from "@/stores/useAvailabilityUrlIntentStore";
import { getLocale } from "@/helpers/getLocale";
import { useBranding } from "@/contexts/BrandingContext";
import { IManufacturer } from "@/stores/useFilter";
import { getCarDataFromMMYTId } from "@/services/products";
import { useMmeStore } from "@/stores/useMmeStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";

/** `/products` must not be used for listing; use `/search-results` or MMT `[searchdata]` slug instead. */
const isProductsListingPath = (path: string) => {
  const base = path.split("?")[0] ?? "";
  return base === "/products" || base.endsWith("/products");
};

/**
 * Listing/search results routes where we do NOT want `availability` to appear in the URL by default.
 * (Some parts of the app refer to it as `/search-result`; others use `/search-results`.)
 */
const isSearchResultsListingPath = (path: string) => {
  const base = path.split("?")[0] ?? "";
  return (
    base === "/search-results" ||
    base.endsWith("/search-results") ||
    base === "/search-result" ||
    base.endsWith("/search-result")
  );
};

/** Path segment used for listing URL rules (current page or explicit navigation target). */
function resolveUpdateFiltersTargetPath(
  callerRequestedBasePath: string | undefined,
  pathname: string,
): string {
  if (callerRequestedBasePath) {
    const segment = callerRequestedBasePath.startsWith("/")
      ? callerRequestedBasePath
      : `/${callerRequestedBasePath}`;
    return segment.split("?")[0] ?? "";
  }
  return pathname.split("?")[0] ?? "";
}

/** Omit default availability from URL when absent param means "all selected" on search-results. */
function stripDefaultAvailabilityForSearchResultsUrl(
  filters: ProductFilters,
  targetIsSearchResultsListing: boolean,
): void {
  if (!targetIsSearchResultsListing) return;
  if (
    Array.isArray(filters.availability) &&
    filters.availability.length === DEFAULT_AVAILABILITY_FILTER_KEYS.length &&
    DEFAULT_AVAILABILITY_FILTER_KEYS.every((k) => filters.availability?.includes(k))
  ) {
    filters.availability = null;
  }
}

export interface ProductFilters {
  vendorId: number | null;
  // language: string;
  search: string | null;
  name: string | null;
  oeReference: string | null;
  makeModelTypeId: string | null;
  categoryId: string | null;
  availability: string | null | string[];
  take: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  manufacturerIds: string[] | null | IManufacturer[];
  order?: "ASC" | "DESC" | "priority";
  year?: string | null;
  cc?: string | null;
  fuel?: string | null;
  hp?: string | null;
  body?: string | null;
  doors?: string | null;
  variant?: string | null;
  carIds?: string[] | null;
  /** E2E VIN search flow marker (`end_to_end_vin_flow_feature_flag`). Absent = search-by-car. */
  vin?: string | null;
  brandId?: string | null;
  manufacturerTypes?: string | null | string[];
}

// brand Id click -> useFilter store , useUrlParams(data whatever -> api call) -> show in pill - ${min}-${max} x

export type UpdateFiltersNavigateOptions = {
  /** When true, append allowed marketing/tracking query keys from the current URL (see searchResultsQueryAllowlist). */
  appendAllowedTrackingQueryParams?: boolean;
};

/** Partial filter update. */
export type ProductFiltersUpdate = Partial<ProductFilters>;

function resolveCategoryIdFromParams(
  params: Record<string, string | string[]>,
): ProductFilters["categoryId"] {
  if (params.categoryId != null && String(params.categoryId).trim() !== "") {
    return String(params.categoryId).trim();
  }
  return null;
}

export const useUrlParams = (defaultBasePath = "/search") => {
  const { getLocale } = useBranding();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const isNewMmeFeatureEnabled = getClientFeatureFlag("new_mme_feature_flag");

  const defaultFilters: ProductFilters = useMemo(
    () =>
      isNewMmeFeatureEnabled
        ? {
            vendorId: null,
            // language: "nl", // TODO: change to en later
            search: null,
            name: null,
            oeReference: null,
            makeModelTypeId: null,
            categoryId: null,
            take: MAX_COUNT,
            minPrice: null,
            maxPrice: null,
            manufacturerIds: [],
            order: "priority",
            year: null,
            availability: [...DEFAULT_AVAILABILITY_FILTER_KEYS],
            manufacturerTypes: [...MANUFACTURER_TYPES],
            carIds: null,
            vin: null,
            brandId: null,
          }
        : {
            vendorId: null,
            // language: "nl", // TODO: change to en later
            search: null,
            name: null,
            oeReference: null,
            makeModelTypeId: null,
            categoryId: null,
            take: MAX_COUNT,
            minPrice: null,
            maxPrice: null,
            manufacturerIds: [],
            order: "priority",
            year: null,
            availability: [...DEFAULT_AVAILABILITY_FILTER_KEYS],
            manufacturerTypes: [...MANUFACTURER_TYPES],
            // carIds: null, // client: omit from URL/navigation payload for now
            brandId: null,
          },
    [isNewMmeFeatureEnabled],
  );

  // Debounce timer ref for URL updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced navigation function
  const debouncedNavigate = useCallback(
    (url: string, immediate: boolean = false) => {
      if (immediate) {
        router.push(url);
        return;
      }

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      //@ts-ignore
      debounceTimerRef.current = setTimeout(() => {
        router.push(url);
        debounceTimerRef.current = null;
      }, URL_UPDATE_DEBOUNCE_DELAY);
    },
    [router],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // Clear store states when landing on products page
  const clearStoreStates = useCallback(async (source?: string) => {
    try {
      // 1. Clear searchData from useMmeStore only if NOT called from MMYT filter
      if (source !== "from-mmyt") {
        const { useMmeStore } = await import("@/stores/useMmeStore");
        const mmeStore = useMmeStore.getState();
        mmeStore.setSearchData({
          make: null,
          model: null,
          engine: null,
          oeReference: undefined,
        });
      } else {
      }

      // 2. Reset filter store but preserve prices (they will be set from API)
      const { useFilterStore } = await import("@/stores/useFilter");
      const filterStore = useFilterStore.getState();

      // Only reset order if NOT called from "Remove Filters" to prevent URL override
      if (source !== "from-remove-filters") {
        filterStore.setOrder("priority");
      } else {
      }

      // manufacturerIds are URL-driven (not stored in useFilterStore)
      // filterStore.setManufacturerIds(null);
      // Don't reset minPrice, maxPrice, or defaultPriceRange - let API set them

      // 3. Clear selected categories from category search store
      const { useCategorySearchStore } = await import("@/stores/useCategorySearchStore");
      const categoryStore = useCategorySearchStore.getState();
      categoryStore.clearSelectedCategories();
    } catch (error) {
      console.error("❌ Error clearing store states:", error);
    }
  }, []);

  // Get current filters from URL
  const getCurrentFilters = useCallback((): ProductFilters => {
    const params = convertQueryParamsToObj(searchParams?.toString() ?? "");
    const hasAvailabilityParam = searchParams?.has("availability") ?? false;
    const rawAvailability = searchParams?.get("availability");
    const absentMeansNull = useAvailabilityUrlIntentStore.getState().absentAvailabilityMeansNull;
    const omitAvailabilityByDefault = isSearchResultsListingPath(pathname ?? "");

    let availability: ProductFilters["availability"];
    if (!hasAvailabilityParam) {
      availability = omitAvailabilityByDefault
        ? null
        : absentMeansNull
          ? null
          : [...DEFAULT_AVAILABILITY_FILTER_KEYS];
    } else if (rawAvailability == null || rawAvailability.trim() === "") {
      availability = null;
    } else {
      availability = params.availability ? params.availability : null;
    }

    const rawType = searchParams?.get("manufacturerTypes");
    const manufacturerTypes = rawType ? rawType.split(",") : null;

    let type: ProductFilters["manufacturerTypes"];
    if (!manufacturerTypes || manufacturerTypes.length === 0) {
      type = null; // ✅ no type filter applied
    } else {
      type = manufacturerTypes;
    }

    const rawOrder = params?.order != null ? String(params.order) : "";
    const order: ProductFilters["order"] =
      rawOrder === "ASC" || rawOrder === "DESC" || rawOrder === "priority" ? rawOrder : "priority";

    // Do not spread `...params` — arbitrary keys (e.g. `from`, `gclid`) must not enter ProductFilters
    // or they get serialized into listing URLs and fail search-results validation (OD-1670).
    return isNewMmeFeatureEnabled
      ? {
          ...defaultFilters,
          vendorId: params.vendorId ? Number(params.vendorId) : null,
          search:
            params.search != null && String(params.search).trim() !== ""
              ? String(params.search)
              : null,
          name:
            params.name != null && String(params.name).trim() !== "" ? String(params.name) : null,
          oeReference:
            params?.oeReference != null && String(params.oeReference).trim() !== ""
              ? String(params.oeReference)
              : null,
          makeModelTypeId: (params.makeModelTypeId as string) || null,
          categoryId: resolveCategoryIdFromParams(params),
          manufacturerIds: params?.manufacturerIds
            ? (params.manufacturerIds as ProductFilters["manufacturerIds"])
            : null,
          take:
            params.take != null && params.take !== "" && !Number.isNaN(Number(params.take))
              ? Number(params.take)
              : defaultFilters.take,
          minPrice: params.minPrice ? Number(params.minPrice) : null,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
          order,
          year:
            params.year !== undefined &&
            params.year !== null &&
            String(params.year).trim() !== "" &&
            String(params.year) !== "undefined"
              ? String(params.year)
              : null,
          cc: params.cc != null && String(params.cc).trim() !== "" ? String(params.cc) : null,
          fuel:
            params.fuel != null && String(params.fuel).trim() !== "" ? String(params.fuel) : null,
          hp: params.hp != null && String(params.hp).trim() !== "" ? String(params.hp) : null,
          body:
            params.body != null && String(params.body).trim() !== "" ? String(params.body) : null,
          doors:
            params.doors != null && String(params.doors).trim() !== ""
              ? String(params.doors)
              : null,
          variant:
            params.variant != null && String(params.variant).trim() !== ""
              ? String(params.variant)
              : null,
          availability,
          manufacturerTypes,
          carIds: params?.carIds
            ? Array.isArray(params.carIds)
              ? (params.carIds as string[])
              : [String(params.carIds)]
            : null,
          vin:
            params?.vin != null && String(params.vin).trim() !== ""
              ? String(params.vin).trim().toUpperCase()
              : null,
          brandId: params?.brandId ? String(params.brandId) : null,
        }
      : {
          ...defaultFilters,
          vendorId: params.vendorId ? Number(params.vendorId) : null,
          search:
            params.search != null && String(params.search).trim() !== ""
              ? String(params.search)
              : null,
          name:
            params.name != null && String(params.name).trim() !== "" ? String(params.name) : null,
          oeReference:
            params?.oeReference != null && String(params.oeReference).trim() !== ""
              ? String(params.oeReference)
              : null,
          makeModelTypeId: (params.makeModelTypeId as string) || null,
          categoryId: resolveCategoryIdFromParams(params),
          manufacturerIds: params?.manufacturerIds
            ? (params.manufacturerIds as ProductFilters["manufacturerIds"])
            : null,
          take:
            params.take != null && params.take !== "" && !Number.isNaN(Number(params.take))
              ? Number(params.take)
              : defaultFilters.take,
          minPrice: params.minPrice ? Number(params.minPrice) : null,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
          order,
          year:
            params.year !== undefined &&
            params.year !== null &&
            String(params.year).trim() !== "" &&
            String(params.year) !== "undefined"
              ? String(params.year)
              : null,
          cc: params.cc != null && String(params.cc).trim() !== "" ? String(params.cc) : null,
          fuel:
            params.fuel != null && String(params.fuel).trim() !== "" ? String(params.fuel) : null,
          hp: params.hp != null && String(params.hp).trim() !== "" ? String(params.hp) : null,
          body:
            params.body != null && String(params.body).trim() !== "" ? String(params.body) : null,
          doors:
            params.doors != null && String(params.doors).trim() !== ""
              ? String(params.doors)
              : null,
          variant:
            params.variant != null && String(params.variant).trim() !== ""
              ? String(params.variant)
              : null,
          availability,
          manufacturerTypes,
          // carIds: params?.carIds
          //   ? Array.isArray(params.carIds)
          //     ? (params.carIds as string[])
          //     : [String(params.carIds)]
          //   : null,
          brandId: params?.brandId ? String(params.brandId) : null,
        };
  }, [defaultFilters, isNewMmeFeatureEnabled, pathname, searchParams]);

  // Get URL to Prefetch
  const getPrefetchURL = async (props: { makeModelTypeId: string | null }) => {
    const { makeModelTypeId } = props;

    const queryString = convertObjToSearchParams(props as any);
    // debugger;
    let localePrefix: string | boolean = false;
    if (params && typeof params["language-country"] === "string") {
      localePrefix = params["language-country"];
    }

    // const basePath = `/search-results`;
    const basePath = ``;
    const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${basePath}`;
    // debugger;
    if (makeModelTypeId) {
      const carInfo = await getCarDataFromMMYTId(makeModelTypeId);
      const { data } = carInfo;
      let seoUrl = `/${slugify(
        [
          // searchData.make?.value,
          // searchData.model?.value,
          // searchData.type?.value,
          // searchData.year?.value,
          data?.brandName,
          data?.modelName,
          data?.typeName,
        ]
          .filter(Boolean)
          .join("-"),
        {
          strict: true,
          trim: true,
        },
      )}`;
      // debugger
      return `${redirectPath}${seoUrl}${queryString}`;
    }
    // return redirectPath;
  };

  // Update filters in URL.
  const updateFilters = useCallback(
    (
      newFilters: ProductFiltersUpdate,
      basePath?: string,
      screen: string = "desktop",
      outRedirect: boolean = false,
      ifWithoutDebounce: boolean = false,
      navigateOptions?: UpdateFiltersNavigateOptions,
    ) => {
      const callerRequestedBasePath = basePath;
      const targetListingPath = resolveUpdateFiltersTargetPath(
        callerRequestedBasePath,
        pathname || "",
      );
      const targetIsSearchResultsListing = isSearchResultsListingPath(targetListingPath);
      const currentPageIsSearchResultsListing = isSearchResultsListingPath(pathname || "");
      const omitAvailabilityForListing =
        targetIsSearchResultsListing || currentPageIsSearchResultsListing;

      const currentFilters = getCurrentFilters();

      // debugger;
      if (searchParams?.get("oeReference")) {
        const MMEStore = useMmeStore.getState();
        MMEStore.setSearchData({
          ...MMEStore.searchData,
          oeReference: searchParams?.get("oeReference") ?? undefined,
        });
      }

      const updatedFilters: ProductFilters = {
        ...currentFilters,
        ...newFilters,
        makeModelTypeId:
          "makeModelTypeId" in newFilters
            ? (newFilters.makeModelTypeId ?? null)
            : currentFilters.makeModelTypeId,
      };

      if (
        "makeModelTypeId" in newFilters &&
        typeof window !== "undefined" &&
        window.location?.search
      ) {
        const liveParams = convertQueryParamsToObj(window.location.search.replace(/^\?/, ""));
        const omitAvailabilityByDefault = omitAvailabilityForListing;
        updatedFilters.categoryId =
          updatedFilters.categoryId ?? resolveCategoryIdFromParams(liveParams) ?? null;
        updatedFilters.order = updatedFilters.order ?? (liveParams.order as any) ?? "priority";
        updatedFilters.minPrice =
          updatedFilters.minPrice ??
          (liveParams.minPrice != null ? Number(liveParams.minPrice) : null);
        updatedFilters.maxPrice =
          updatedFilters.maxPrice ??
          (liveParams.maxPrice != null ? Number(liveParams.maxPrice) : null);
        updatedFilters.take =
          updatedFilters.take ?? (liveParams.take != null ? Number(liveParams.take) : null);
        updatedFilters.availability =
          updatedFilters.availability ??
          (liveParams.availability as any) ??
          (omitAvailabilityByDefault ? null : [...DEFAULT_AVAILABILITY_FILTER_KEYS]);
        updatedFilters.manufacturerTypes = updatedFilters.manufacturerTypes ??
          (liveParams.type as any) ?? [...MANUFACTURER_TYPES];
      }

      if (Array.isArray(updatedFilters.availability) && updatedFilters.availability.length === 0) {
        updatedFilters.availability = null;
      }

      // On search-results listings, don't serialize default availability into the URL.
      stripDefaultAvailabilityForSearchResultsUrl(updatedFilters, targetIsSearchResultsListing);

      // Navigating to search-results without an explicit availability change: omit param (all selected).
      if (
        targetIsSearchResultsListing &&
        !currentPageIsSearchResultsListing &&
        !("availability" in newFilters) &&
        !(searchParams?.has("availability") ?? false)
      ) {
        updatedFilters.availability = null;
      }

      const urlPayload: Record<string, unknown> = { ...updatedFilters };
      delete urlPayload.categoryIds;

      let redirectQueryString = convertObjToSearchParams(urlPayload as any);
      if (navigateOptions?.appendAllowedTrackingQueryParams) {
        redirectQueryString = appendAllowedTrackingParamsToQueryString(
          redirectQueryString,
          searchParams,
        );
      }

      let localePrefix: string | boolean = false;
      if (params && typeof params["language-country"] === "string") {
        localePrefix = params["language-country"];
      }

      /** New MME Phase 4b: `carIds` apply to catalog (or other non-SRP path) — avoid legacy `carInfoRedirection` forcing `/search-results`. */
      if ("carIds" in newFilters && newFilters.carIds != null && !targetIsSearchResultsListing) {
        const rawCarIds = newFilters.carIds;
        const carIdList = (Array.isArray(rawCarIds) ? rawCarIds : [String(rawCarIds)])
          .map((id) => String(id).trim())
          .filter(Boolean);

        if (carIdList.length > 0 && callerRequestedBasePath) {
          const segment = callerRequestedBasePath.startsWith("/")
            ? callerRequestedBasePath
            : `/${callerRequestedBasePath}`;
          const pathOnly = (segment.split("?")[0] ?? segment).replace(/\/$/, "") || segment;

          const catalogQuery: Record<string, string | string[]> = { carIds: carIdList };
          const vinFromUpdate = newFilters.vin;
          if (typeof vinFromUpdate === "string" && vinFromUpdate.trim()) {
            catalogQuery.vin = vinFromUpdate.trim().toUpperCase();
          }
          // Keep manufacturer brand context when swapping car / VIN on catalog (dropdown).
          const manufacturerIdsFromUrl = searchParams?.get("manufacturerIds")?.trim();
          if (manufacturerIdsFromUrl) {
            catalogQuery.manufacturerIds = manufacturerIdsFromUrl;
          }

          let carIdsQuery = convertObjToSearchParams(catalogQuery);
          if (navigateOptions?.appendAllowedTrackingQueryParams) {
            carIdsQuery = appendAllowedTrackingParamsToQueryString(carIdsQuery, searchParams);
          }

          const needsLocalePrefix =
            typeof localePrefix === "string" &&
            localePrefix.length > 0 &&
            !pathOnly.startsWith(`/${localePrefix}`);

          debouncedNavigate(
            `${needsLocalePrefix ? `/${localePrefix}` : ""}${pathOnly}${carIdsQuery}`,
            ifWithoutDebounce,
          );
          return;
        }
      }

      /**
       * E2E: vin-only update on an explicit non-SRP path (PDP / catalog / L1–L3).
       * Without this, carInfoRedirection can bounce to `/search-results` when adding VIN
       * on PDP before carIds are resolved (Add car VIN).
       */
      if ("vin" in newFilters && callerRequestedBasePath && !targetIsSearchResultsListing) {
        const segment = callerRequestedBasePath.startsWith("/")
          ? callerRequestedBasePath
          : `/${callerRequestedBasePath}`;
        const pathOnly = (segment.split("?")[0] ?? segment).replace(/\/$/, "") || segment;

        const catalogQuery: Record<string, string | string[]> = {};
        const existingCarIds = currentFilters.carIds;
        const carIdList = (
          Array.isArray(existingCarIds)
            ? existingCarIds
            : existingCarIds != null
              ? [String(existingCarIds)]
              : []
        )
          .map((id) => String(id).trim())
          .filter(Boolean);
        if (carIdList.length > 0) {
          catalogQuery.carIds = carIdList;
        }

        const vinFromUpdate = newFilters.vin;
        if (typeof vinFromUpdate === "string" && vinFromUpdate.trim()) {
          catalogQuery.vin = vinFromUpdate.trim().toUpperCase();
        }
        // vin: null → omit from query (clears VIN while keeping carIds / path)

        const manufacturerIdsFromUrl = searchParams?.get("manufacturerIds")?.trim();
        if (manufacturerIdsFromUrl) {
          catalogQuery.manufacturerIds = manufacturerIdsFromUrl;
        }

        let vinQuery = convertObjToSearchParams(catalogQuery);
        if (navigateOptions?.appendAllowedTrackingQueryParams) {
          vinQuery = appendAllowedTrackingParamsToQueryString(vinQuery, searchParams);
        }

        const needsLocalePrefix =
          typeof localePrefix === "string" &&
          localePrefix.length > 0 &&
          !pathOnly.startsWith(`/${localePrefix}`);

        debouncedNavigate(
          `${needsLocalePrefix ? `/${localePrefix}` : ""}${pathOnly}${vinQuery}`,
          ifWithoutDebounce,
        );
        return;
      }

      const navigateToMmtSearchdataSlug = async (mmtId: string) => {
        const carInfo = await getCarDataFromMMYTId(mmtId);
        const { data } = carInfo;
        const seoUrl = `/${slugify(
          [data?.brandName, data?.modelName, data?.typeName?.replaceAll("+", "plus")]
            .filter(Boolean)
            .join("-"),
          {
            strict: true,
            trim: true,
          },
        )}`;
        const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${seoUrl}${redirectQueryString}`;
        debouncedNavigate(redirectPath, ifWithoutDebounce);
      };

      const carInfoRedirection = async (newFilters: any, currentFilters: any) => {
        const hasCarIdsInUpdate =
          "carIds" in newFilters &&
          newFilters.carIds != null &&
          (Array.isArray(newFilters.carIds)
            ? newFilters.carIds.length > 0
            : String(newFilters.carIds).trim() !== "");

        // If no Car selected
        if (
          typeof newFilters.makeModelTypeId === "undefined" &&
          // typeof currentFilters.makeModelTypeId === "undefined" &&
          //@ts-ignore
          searchParams?.entries().toArray().length === 0 &&
          !hasCarIdsInUpdate
        ) {
          basePath = `/search-results`;
          const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${basePath || defaultBasePath}${redirectQueryString}`;
          // if (fullReload) {
          //   window.location.href = redirectPath;
          // } else {

          debouncedNavigate(redirectPath, ifWithoutDebounce);
          // }
          return false;
        } else if (newFilters.makeModelTypeId || currentFilters.makeModelTypeId) {
          // If Car selected
          // When makeModelTypeId did NOT change (only category/price/order changed), use pathname to avoid API call
          if (!("makeModelTypeId" in newFilters)) {
            if (callerRequestedBasePath) {
              const segment = callerRequestedBasePath.startsWith("/")
                ? callerRequestedBasePath
                : `/${callerRequestedBasePath}`;
              if (isProductsListingPath(segment)) {
                const mmtId = updatedFilters.makeModelTypeId || currentFilters.makeModelTypeId;
                if (mmtId) {
                  await navigateToMmtSearchdataSlug(mmtId);
                } else {
                  const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}/search-results${redirectQueryString}`;
                  debouncedNavigate(redirectPath, ifWithoutDebounce);
                }
              } else {
                const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${segment}${redirectQueryString}`;
                debouncedNavigate(redirectPath, ifWithoutDebounce);
              }
            } else {
              basePath = pathname || "";
              if (isProductsListingPath(basePath)) {
                const mmtId = updatedFilters.makeModelTypeId || currentFilters.makeModelTypeId;
                if (mmtId) {
                  await navigateToMmtSearchdataSlug(mmtId);
                } else {
                  const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}/search-results${redirectQueryString}`;
                  debouncedNavigate(redirectPath, ifWithoutDebounce);
                }
              } else {
                const redirectPath = `${basePath}${redirectQueryString}`;
                debouncedNavigate(redirectPath, ifWithoutDebounce);
              }
            }
          } else {
            // MME changed - need API to build new slug
            await navigateToMmtSearchdataSlug(
              newFilters.makeModelTypeId || currentFilters.makeModelTypeId,
            );
          }
        } else if (typeof currentFilters.makeModelTypeId !== "undefined") {
          // OD-867 ------------
          // basePath = `/search-results`;

          basePath = `/${params?.["searchdata"] || "search-results"}`;
          const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${basePath || defaultBasePath}${redirectQueryString}`;
          // if (fullReload) {
          //   window.location.href = redirectPath;
          // } else {
          debouncedNavigate(redirectPath, ifWithoutDebounce);
          // }
          return false;
        } else {
        }
      };
      carInfoRedirection(newFilters, currentFilters);

      // if (params?.searchdata) {
      //   basePath = Array.isArray(params.searchdata) ? `/${params.searchdata[0]}` : `/${params.searchdata}`;
      // }
      // const redirectPath = `/${localePrefix ? `${localePrefix}` : ""}${basePath || defaultBasePath}${queryString}`;
      // router.push(redirectPath);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCurrentFilters, debouncedNavigate, defaultBasePath, pathname],
  );

  // Reset filters
  const resetFilters = useCallback(
    (goTo: string = "products", fullReload: boolean = false) => {
      const currentFilters = getCurrentFilters();

      if (goTo === "products") {
        // This is the "Remove All Filters" scenario
        // Get the current URL parameters to preserve essential ones
        const currentUrl = new URLSearchParams(window.location.search);
        const makeModelTypeId = currentUrl.get("makeModelTypeId");
        const take = currentUrl.get("take");
        const year = currentUrl.get("year");

        // Clear all store states
        const clearStores = async () => {
          try {
            // Clear selected categories
            const { useCategorySearchStore } = await import("@/stores/useCategorySearchStore");
            const categoryStore = useCategorySearchStore.getState();
            categoryStore.clearSelectedCategories();

            // Clear manufacturer IDs and reset price values
            const { useFilterStore } = await import("@/stores/useFilter");
            const filterStore = useFilterStore.getState();
            // manufacturerIds are URL-driven (not stored in useFilterStore)
            // filterStore.setManufacturerIds(null);

            // Reset to default price range values
            const resetMinPrice = filterStore.defaultPriceRange?.min ?? 0;
            const resetMaxPrice = filterStore.defaultPriceRange?.max ?? 5000;
            filterStore.setMinPrice(resetMinPrice);
            filterStore.setMaxPrice(resetMaxPrice);
            // filterStore.setMinPrice(null);
            // filterStore.setMaxPrice(null);
            filterStore.setDefaultPriceRange(0, 5000);
          } catch (error) {
            console.error("❌ Error clearing stores:", error);
          }
        };
        // Wait for stores to clear before navigating, to avoid race conditions
        clearStores().then(() => {
          // Build clean URL with preserved parameters
          let cleanUrl = `${window.location.pathname}?`;
          const params = [];

          if (makeModelTypeId) {
            //@ts-ignore
            params.push(`makeModelTypeId=${makeModelTypeId}`);
          }
          //@ts-ignore
          params.push(`take=${take || MAX_COUNT}`);

          if (year) {
            //@ts-ignore
            params.push(`year=${year}`);
          }

          // Always reset order to priority when clearing all filters
          //@ts-ignore
          params.push("order=priority");

          cleanUrl += params.join("&");
          debouncedNavigate(cleanUrl, true);
        });
      } else {
        // Original resetFilters logic for other scenarios
        const resetedFilters = {
          ...defaultFilters,
          makeModelTypeId: currentFilters.makeModelTypeId,
          year: currentFilters.year,
          take: MAX_COUNT,
        };

        const queryString = convertObjToSearchParams(resetedFilters as any);
        // if (fullReload) {
        //   window.location.href = `${defaultBasePath}${queryString}`;
        // } else {
        debouncedNavigate(`${defaultBasePath}${queryString}`, true);
        // }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCurrentFilters, debouncedNavigate, defaultBasePath, pathname],
  );

  // Remove individual price filters
  const removePriceFilters = useCallback(() => {
    // Get current year from URL to preserve it
    const currentUrl = new URLSearchParams(window.location.search);
    const currentYear = currentUrl.get("year");

    // Reset price values in store to default
    const resetPrices = async () => {
      try {
        const { useFilterStore } = await import("@/stores/useFilter");
        const filterStore = useFilterStore.getState();

        const resetMinPrice = filterStore.defaultPriceRange?.min ?? 0;
        const resetMaxPrice = filterStore.defaultPriceRange?.max ?? 5000;

        filterStore.setMinPrice(resetMinPrice);
        filterStore.setMaxPrice(resetMaxPrice);
      } catch (error) {
        console.error("❌ Error resetting prices:", error);
      }
    };

    resetPrices();

    // Remove price parameters from URL but preserve year
    updateFilters({
      minPrice: null,
      maxPrice: null,
      year: currentYear, // Preserve current year from URL
    });
  }, [updateFilters]);

  return {
    filters: getCurrentFilters(),
    updateFilters,
    getPrefetchURL,
    resetFilters,
    clearStoreStates,
    removePriceFilters,
  };
};
