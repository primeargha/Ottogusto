import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ProductFilters, UpdateFiltersNavigateOptions } from "@/hooks/useUrlParams";
import { pickSearchResultsAllowedProductFiltersFromSearchParams } from "@/utils/searchResultsQueryAllowlist";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";

/**
 * Filter payload for navigating to search-results via OE reference.
 * Preserves pagination/sort from the current URL when present.
 * Clears `categoryId` (sidebar → L1-only per new-single-category-filter) and `carIds`
 * by default — pass `extra.carIds` to carry the currently-selected car(s) forward instead.
 * Do not pass `makeModelTypeId` here — that triggers updateFilters MME merge logic
 * and injects default `manufacturerTypes` into the URL.
 */
export function buildOeSearchResultsFilters(
  sp: ReadonlyURLSearchParams | null,
  oeReference: string,
  languageCountrySegment: string | null | undefined,
  extra?: Partial<ProductFilters>,
): Partial<ProductFilters> {
  return {
    ...pickSearchResultsAllowedProductFiltersFromSearchParams(sp, languageCountrySegment),
    oeReference,
    categoryId: null,
    carIds: null,
    ...extra,
  };
}

/** Clears category store so pills/tags match URL before navigation (URL remains source of truth). */
export function clearOeSearchCategoryClientState(): void {
  useCategorySearchStore.getState().clearSelectedCategories();
}

export type ApplyOeSearchResultsNavigationOptions = {
  sp?: ReadonlyURLSearchParams | null;
  languageCountrySegment?: string | null | undefined;
  extra?: Partial<ProductFilters>;
  basePath?: string;
  screen?: string;
  outRedirect?: boolean;
  ifWithoutDebounce?: boolean;
  navigateOptions?: UpdateFiltersNavigateOptions;
};

/** Clears listing client state and navigates to search-results with OE ref filters. */
export function applyOeSearchResultsNavigation(
  updateFilters: (
    newFilters: Partial<ProductFilters>,
    basePath?: string,
    screen?: string,
    outRedirect?: boolean,
    ifWithoutDebounce?: boolean,
    navigateOptions?: UpdateFiltersNavigateOptions,
  ) => void,
  oeReference: string,
  options: ApplyOeSearchResultsNavigationOptions = {},
): void {
  const {
    sp = null,
    languageCountrySegment,
    extra,
    basePath = "/search-results",
    screen = "desktop",
    outRedirect = false,
    ifWithoutDebounce = true,
    navigateOptions,
  } = options;

  clearOeSearchCategoryClientState();
  void require("@/stores/useMmeStore")
    .useMmeStore.getState()
    .addToPreviousSearches({ oeReference });
  updateFilters(
    buildOeSearchResultsFilters(sp, oeReference, languageCountrySegment, extra),
    basePath,
    screen,
    outRedirect,
    ifWithoutDebounce,
    navigateOptions,
  );
}
