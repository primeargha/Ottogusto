"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { MakeModelTypeBrandItem } from "@/type";
import { useBrandQuery } from "@/hooks/brands";

type BrandsContextType = {
  brands: MakeModelTypeBrandItem[] | null | any;
  isLoading: boolean;
  error: Error | null;
};

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

interface BrandsProviderProps {
  children: ReactNode;
}

/**
 * Brands Provider - Uses persisted React Query cache so brands are not refetched on normal refresh.
 * Must be rendered inside PersistQueryClientProvider (see OLDClientLayout).
 */
export const BrandsProvider = ({ children }: BrandsProviderProps) => {
  const { data, isPending, error } = useBrandQuery();
  const brandsRaw = data?.data ?? data;
  const brands = Array.isArray(brandsRaw) ? brandsRaw : brandsRaw ? [brandsRaw] : null;

  return (
    <BrandsContext.Provider
      value={{
        brands,
        isLoading: isPending,
        error: error instanceof Error ? error : error ? new Error(String(error)) : null,
      }}
    >
      {children}
    </BrandsContext.Provider>
  );
};

/**
 * Hook to access brands data
 * Returns the same data instance across all components (no duplicate API calls)
 */
export const useBrands = (): BrandsContextType => {
  const context = useContext(BrandsContext);
  if (!context) {
    throw new Error("useBrands must be used within a BrandsProvider");
  }
  return context;
};
