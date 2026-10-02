import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import {
  getCarById,
  postCarsFilters,
  type CarByIdResponse,
  type CarsFiltersPayload,
  type CarsFiltersResponse,
} from "@/services/cars";

export type CarsFiltersPostResult = { data: CarsFiltersResponse };

export const useCarsFiltersMutation = (
  options?: UseMutationOptions<CarsFiltersPostResult, Error, CarsFiltersPayload>,
) => {
  return useMutation({
    mutationKey: mutationKeys.cars.filters(),
    mutationFn: postCarsFilters,
    ...options,
  });
};

export const useCarByIdQuery = (
  carId: string,
  options?: Omit<UseQueryOptions<{ data: CarByIdResponse }, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: queryKeys.cars.byId(carId),
    queryFn: () => getCarById(carId),
    enabled: Boolean(carId) && (options?.enabled ?? true),
    ...options,
  });
};
