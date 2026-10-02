"use client";

import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { useGetMySavedCarsQuery } from "@/hooks/garage";

/** Result of refreshSavedCars(); callers can use result?.data?.data for the cars array */
export type RefreshSavedCarsResult = { data?: { data?: any[] } };

type SavedCarsContextType = {
  savedCars: any[] | null;
  isLoading: boolean;
  error: Error | null;
  refreshSavedCars: () => Promise<RefreshSavedCarsResult>;
};

const SavedCarsContext = createContext<SavedCarsContextType | undefined>(undefined);

interface SavedCarsProviderProps {
  children: ReactNode;
}

/**
 * Saved Cars Provider - Uses React Query (same cache as useGetMySavedCarsQuery) so GET /Garage runs once.
 * Follows the same pattern as BrandsContext.
 */
export const SavedCarsProvider = ({ children }: SavedCarsProviderProps) => {
  const { data, isPending, error, refetch } = useGetMySavedCarsQuery();
  const carsRaw = data?.data;
  const savedCars = Array.isArray(carsRaw) ? carsRaw : carsRaw ? [carsRaw] : null;

  const refreshSavedCars = useCallback(async () => {
    const result = await refetch();
    return result as RefreshSavedCarsResult;
  }, [refetch]);

  return (
    <SavedCarsContext.Provider
      value={{
        savedCars,
        isLoading: isPending,
        error: error instanceof Error ? error : error ? new Error(String(error)) : null,
        refreshSavedCars,
      }}
    >
      {children}
    </SavedCarsContext.Provider>
  );
};

/**
 * Hook to access saved cars data
 * Returns the same data instance across all components (no duplicate API calls)
 */
export const useSavedCars = (): SavedCarsContextType => {
  const context = useContext(SavedCarsContext);
  if (!context) {
    throw new Error("useSavedCars must be used within a SavedCarsProvider");
  }
  return context;
};
