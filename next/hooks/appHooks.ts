"use client";

import { getCategories } from "@/services/advancedSearchService";
import {
  NESTED_CATEGORIES_BROWSER_CACHE_MAX_AGE_MS,
  getCategoryCacheLocaleKey,
  readNestedCategoriesBrowserCache,
  writeNestedCategoriesBrowserCache,
} from "@/lib/nested-categories-browser-cache";
import {
  readNestedCategoriesIdbCache,
  writeNestedCategoriesIdbCache,
} from "@/lib/nested-categories-idb-cache";
import { buildNestedCategoryTree } from "@/lib/build-nested-category-tree";
import { queryKeys } from "@/lib/query-keys";
import type { Category } from "@/type";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";

export const useCheckForRootLandingPage = () => {
  const pathname = usePathname();
  const params = useParams();

  if (pathname === "/" && localStorage.getItem("locale")) {
    return true;
  }
  return false;
};

export const useCheckForLandingPage = () => {
  const pathname = usePathname();
  const params = useParams();

  if (pathname === "/" || pathname?.includes("/support")) {
    return true;
  }

  const isLandingPage = params && pathname === `/${params["language-country"]}`;
  // debugger;
  return isLandingPage;

  // const pathname = usePathname();
  // // Check if the current pathname is the root (i.e., '/')
  // if (pathname === "/") {
  //   return true;
  // }

  // return false;
};

export const useCheckAllBrandsPage = () => {
  const pathname = usePathname();
  // Check if the current pathname is the root (i.e., '/')
  if (pathname?.includes("/allbrands")) {
    return true;
  }

  return false;
};

export const useCheckForMysavedCarsPage = () => {
  const pathname = usePathname();
  // Check if the current pathname is the root (i.e., '/')
  if (pathname?.includes("/my-saved-cars")) {
    return true;
  }

  return false;
};

const fetchCategoriesQueryFn = async (id: string): Promise<Category[]> => {
  try {
    if (id.length > 6) return [];
    const response = await getCategories(id);
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const categoriesByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.categories.byId(id),
    queryFn: () => fetchCategoriesQueryFn(id),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: false,
  });

export const useFetchCategories = (id: string) => {
  return useQuery(categoriesByIdQueryOptions(id));
};

const fetchCategoriesNestedQueryFn = async (localeKey: string): Promise<Category[]> => {
  const fromLs = readNestedCategoriesBrowserCache(localeKey);
  if (fromLs) {
    return fromLs;
  }
  const fromIdb = await readNestedCategoriesIdbCache(localeKey);
  if (fromIdb) {
    return fromIdb;
  }

  try {
    const response = await getCategories();
    const l1List: Category[] = response.data || [];
    const tree = await buildNestedCategoryTree(l1List);

    writeNestedCategoriesBrowserCache(tree, localeKey);
    await writeNestedCategoriesIdbCache(tree, localeKey);
    return tree;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const categoriesNestedQueryOptions = (localeKey: string) =>
  queryOptions({
    queryKey: queryKeys.categories.nested(localeKey),
    queryFn: () => fetchCategoriesNestedQueryFn(localeKey),
    enabled: !!localeKey && localeKey !== "ssr",
    staleTime: NESTED_CATEGORIES_BROWSER_CACHE_MAX_AGE_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Per-L2 retries already run inside buildNestedCategoryTree; one query-level retry helps cold misses.
    retry: 1,
  });

export const useFetchCategoriesNested = () => {
  const params = useParams();
  const lc = params?.["language-country"];
  const localeKey = getCategoryCacheLocaleKey(typeof lc === "string" ? lc : null);
  return useQuery(categoriesNestedQueryOptions(localeKey));
};

export const singleCategoryByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.categories.singleById(id),
    queryFn: () => fetchCategoriesQueryFn(id),
    enabled: !!id,
  });

export const useFetchSingleCategory = (id: string) => {
  return useQuery(singleCategoryByIdQueryOptions(id));
};
