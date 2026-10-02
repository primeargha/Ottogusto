import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { mutationKeys } from "@/lib/query-keys";
import { checkPartVin, searchCarsByVin } from "@/services/vin";
import type { PartVinCheckPayload, PartVinCheckResponse, VinCarsSearchResponse } from "@/type";

/** Dedupe GET /Vin/{vin} across Find + sidebar live search (same VIN). */
export const VIN_CARS_SEARCH_STALE_MS = 60_000;

export const usePartVinCheckMutation = (
  options?: UseMutationOptions<{ data: PartVinCheckResponse }, Error, PartVinCheckPayload>,
) => {
  return useMutation({
    mutationKey: mutationKeys.vin.partCheck(),
    mutationFn: checkPartVin,
    ...options,
  });
};

/**
 * Shared GET /Vin/{vinNumber} — concurrent/recent callers for the same VIN share one network request.
 * Use from Find car parts + sidebar live search to avoid duplicate GETs.
 * `retry: false` — Case 2 / 409 must not be re-fired (RQ default retry is 3 → 4 network calls).
 * Errored queries are not refetched until the cache entry is removed (avoids Find + live double 409).
 */
export async function fetchVinCarsSearch(
  queryClient: QueryClient,
  vinNumber: string,
): Promise<{ data: VinCarsSearchResponse }> {
  const trimmed = vinNumber.trim().toUpperCase();
  const queryKey = mutationKeys.vin.searchCars(trimmed);
  const existing = queryClient.getQueryState<{ data: VinCarsSearchResponse }>(queryKey);
  // RQ `fetchQuery` refetches on error by default — rethrow cached failure instead.
  if (existing?.status === "error" && existing.error) {
    throw existing.error;
  }
  return queryClient.fetchQuery({
    queryKey,
    queryFn: () => searchCarsByVin(trimmed),
    staleTime: VIN_CARS_SEARCH_STALE_MS,
    retry: false,
  });
}

/** @deprecated Prefer `fetchVinCarsSearch` so Find + live search dedupe. Kept for any legacy callers. */
export const useVinCarsSearchMutation = (
  options?: UseMutationOptions<{ data: VinCarsSearchResponse }, Error, string>,
) => {
  return useMutation({
    mutationKey: mutationKeys.vin.searchCars(),
    mutationFn: searchCarsByVin,
    ...options,
  });
};
