import { getManufacturer, getParts } from "@/services/products";
import type { PostPartsSearchPayload, PostPartsSearchResponse } from "@/type";
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useParams } from "next/navigation";
import { useUrlParams } from "./useUrlParams";
import type { ProductFilters } from "./useUrlParams";

function normalizeAvailabilityForApi(value: ProductFilters["availability"]): string[] | null {
  if (value == null || value === "") {
    return null;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return [...value];
  }
  return [value];
}

export const useInfiniteParts = () => {
  const { filters } = useUrlParams();
  const params = useParams();

  let localePrefix: string | false = false;
  if (params && typeof params["language-country"] === "string") {
    localePrefix = (params["language-country"] as string).split("-")[0] ?? false;
  }

  // `vin` is URL-only (E2E VIN flow marker → PDP later). Never send to POST /Parts.
  // `carIds` remains a real Parts filter field.
  const { vin: _vinUrlOnly, ...filtersWithoutVin } = filters;

  const processedFilters = {
    ...filtersWithoutVin,
    language: localePrefix,
    categoryId: filters.categoryId ?? null,
    manufacturerIds:
      typeof filters.manufacturerIds === "string"
        ? [filters.manufacturerIds]
        : filters.manufacturerIds,
    availability: normalizeAvailabilityForApi(filters.availability),
  } as unknown as PostPartsSearchPayload;

  return useInfiniteQuery(partsInfiniteQueryOptions(filtersWithoutVin, processedFilters));
};

export function partsInfiniteQueryOptions(
  filters: unknown,
  processedFilters: PostPartsSearchPayload,
) {
  return infiniteQueryOptions({
    queryKey: queryKeys.products.parts(filters),
    queryFn: async ({ pageParam = null }: { pageParam: unknown }) => {
      const response = await getParts({
        ...processedFilters,
        continuationToken: pageParam as string | null,
      });
      return response;
    },
    getNextPageParam: (lastPage: { data: PostPartsSearchResponse }) =>
      lastPage?.data?.continuationToken ?? undefined,
    initialPageParam: null as string | null,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const manufacturerQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.products.manufacturer(),
    queryFn: () => getManufacturer(),
  });

export const useGetManufacturerInformationQuery = () => {
  return useQuery(manufacturerQueryOptions());
};
