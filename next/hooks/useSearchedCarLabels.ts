"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getCarById, type CarByIdResponse } from "@/services/cars";
import { formatCarDisplayLabel } from "@/utils/formatCarDisplayLabel";

export type SearchedCarLabelOption = {
  id: string;
  label: string;
  isLoading?: boolean;
};

function labelFromCar(
  id: string,
  car: CarByIdResponse | null | undefined,
  pending: boolean,
): SearchedCarLabelOption {
  if (pending) {
    return { id, label: "", isLoading: true };
  }
  return {
    id,
    label: car ? formatCarDisplayLabel(car) : "",
    isLoading: false,
  };
}

/**
 * Fetches display labels for the given car ids (one GET /Cars/{id} per id).
 * Uses per-id query keys so selection changes only refetch the active id when others are cached.
 */
export function useSearchedCarLabels(carIds: string[], enabled = true) {
  const uniqueIds = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const raw of carIds) {
      const id = String(raw).trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push(id);
    }
    return list;
  }, [carIds]);

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: queryKeys.cars.byId(id),
      queryFn: async () => {
        try {
          const response = await getCarById(id);
          return response.data;
        } catch {
          return null;
        }
      },
      enabled: enabled && uniqueIds.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const data = useMemo((): SearchedCarLabelOption[] => {
    return uniqueIds.map((id, index) => {
      const q = queries[index];
      const pending = Boolean(q?.isPending || q?.isLoading);
      return labelFromCar(id, q?.data ?? null, pending);
    });
  }, [queries, uniqueIds]);

  const isPending =
    enabled && uniqueIds.length > 0 && queries.some((q) => q.isPending || q.isLoading);
  const isLoading = isPending;
  const isError = queries.some((q) => q.isError);

  return { data, isLoading, isPending, isError };
}
