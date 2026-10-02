import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPartCompatibleCars } from "@/services/cars";
import { queryKeys } from "@/lib/query-keys";
import {
  isCompatibleCarSectionEnabled,
  isNewMmeFeatureEnabledForCountry,
} from "@/utils/legacyCarCompatibility";
import { isValidPartIdForApi, normalizePartId } from "@/utils/part-id";

export const partCompatibleCarsQueryOptions = (partId: string | null) =>
  queryOptions({
    queryKey: queryKeys.cars.partCompatible(partId ?? ""),
    queryFn: async () => {
      const id = normalizePartId(partId);
      if (!id) return { data: [] as const };
      return getPartCompatibleCars(id);
    },
    enabled:
      !!partId &&
      isValidPartIdForApi(partId) &&
      isCompatibleCarSectionEnabled() &&
      isNewMmeFeatureEnabledForCountry(),
    staleTime: 10 * 60 * 1000,
  });

export const usePartCompatibleCarsQuery = (partId: string | null) => {
  return useQuery(partCompatibleCarsQueryOptions(partId));
};
