"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useIsRestoring, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { isPostLogoutRedirectPending } from "@/utils/localeCookie";
import { categoriesNestedQueryOptions } from "@/hooks/appHooks";
import { getCategoryCacheLocaleKey } from "@/lib/nested-categories-browser-cache";
import { isNestedCategoryTreeUsable } from "@/lib/nested-categories-tree";
import { queryKeys } from "@/lib/query-keys";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";

type CategoriesContextType = {
  data: any[] | undefined;
  isPending: boolean;
  error: Error | null;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

/**
 * Categories Provider - Uses persisted React Query cache so Category API is not refetched on normal refresh.
 * Must be rendered inside PersistQueryClientProvider (see OLDClientLayout).
 * Syncs nested categories to useCategorySearchStore for consumers that read from the store.
 */
export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const params = useParams();
  const pathname = usePathname();
  const isRestoring = useIsRestoring();
  const queryClient = useQueryClient();
  const lc = params?.["language-country"];
  const localeKey = getCategoryCacheLocaleKey(typeof lc === "string" ? lc : null);
  const baseOptions = categoriesNestedQueryOptions(localeKey);
  const enabled = !!baseOptions.enabled && !isRestoring && !isPostLogoutRedirectPending(pathname);
  const { data, isPending, error } = useQuery({ ...baseOptions, enabled });

  // Drop RQ-hydrated poison trees (L1 present, all L2 empty) so queryFn rebuilds.
  useEffect(() => {
    if (isRestoring || !data || !Array.isArray(data)) return;
    if (isNestedCategoryTreeUsable(data)) return;
    queryClient.removeQueries({ queryKey: queryKeys.categories.nested(localeKey) });
  }, [data, isRestoring, localeKey, queryClient]);

  useEffect(() => {
    if (data != null && Array.isArray(data) && isNestedCategoryTreeUsable(data)) {
      useCategorySearchStore.getState().setNestedCategoryData(data as any[]);
    }
  }, [data]);

  const usableData =
    data != null && Array.isArray(data) && isNestedCategoryTreeUsable(data) ? data : undefined;

  return (
    <CategoriesContext.Provider
      value={{
        data: usableData,
        isPending: isPending || (Boolean(data?.length) && !usableData && !error),
        error: error instanceof Error ? error : error ? new Error(String(error)) : null,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

/**
 * Hook to access nested categories data (same shape as useFetchCategoriesNested).
 */
export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};
