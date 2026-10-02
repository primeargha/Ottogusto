"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { queryKeys } from "@/lib/query-keys";
import { getCarById } from "@/services/cars";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { isUsableCarByIdResponse } from "@/utils/isUsableCarByIdResponse";

/**
 * Validates manually edited / shared `?carIds=` on public pages (same surfaces as
 * `useUrlVinValidation`). Uses `GET /Cars/{id}` per id with the shared React Query
 * cache (`queryKeys.cars.byId`) so Apply / banner label fetches are not duplicated.
 *
 * Any id that errors or returns unusable car data → `invalid: true` → page shows 404.
 */
export function useUrlCarIdsValidation(): { invalid: boolean; isValidating: boolean } {
  const searchParams = useSearchParams();
  const carIdsKey = searchParams?.get("carIds") ?? null;
  const carIds = useMemo(() => parseCarIdsParam(carIdsKey), [carIdsKey]);

  const queries = useQueries({
    queries: carIds.map((id) => ({
      queryKey: queryKeys.cars.byId(id),
      queryFn: async () => {
        try {
          const response = await getCarById(id);
          return response.data ?? null;
        } catch {
          return null;
        }
      },
      enabled: carIds.length > 0,
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  const isValidating =
    carIds.length > 0 && queries.some((q) => q.isPending || q.isLoading || q.isFetching);

  const invalid = useMemo(() => {
    if (carIds.length === 0) return false;
    // Wait until every id has settled so we don't 404 during the first paint.
    if (queries.some((q) => q.isPending || q.isLoading)) return false;
    return queries.some((q) => !isUsableCarByIdResponse(q.data ?? null));
  }, [carIds.length, queries]);

  return { invalid, isValidating };
}
