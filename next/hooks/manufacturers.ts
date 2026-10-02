import { queryOptions, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getManufacturer } from "@/services/products";

export type ManufacturersListResponse = Awaited<ReturnType<typeof getManufacturer>>;

export const manufacturersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.manufacturers.list(),
    queryFn: async () => {
      const response = await getManufacturer();
      return response;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    // Homepage must refetch when cache is empty; global PersistQueryClient defaults
    // use refetchOnMount:false which can leave the block on a permanent skeleton.
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useManufacturersQuery = (
  options?: Omit<UseQueryOptions<ManufacturersListResponse, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: queryKeys.manufacturers.list(),
    queryFn: () => getManufacturer(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    ...options,
  });
};
