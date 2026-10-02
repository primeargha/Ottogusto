import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { getBrands, getModels, getTypes, getYears, searchParts } from "../services/search";
import type { PostPartsSearchPayload, PostPartsSearchResponse } from "@/type";
import { shouldFetchMakeModelBrandsApi } from "@/utils/legacyCarCompatibility";

export const searchBrandsQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.search.brands(),
    queryFn: () => getBrands(),
    enabled: enabled && shouldFetchMakeModelBrandsApi(),
  });

export const useGetBrandsQuery = (step: number) => {
  return useQuery(searchBrandsQueryOptions(step === 1));
};

export const searchModelsQueryOptions = (brandId: number, enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.search.models(brandId),
    queryFn: () => getModels(brandId + ""),
    enabled,
  });

export const useGetModelsQuery = (step: number, brandId: number) => {
  return useQuery(searchModelsQueryOptions(brandId, step === 2));
};

export const searchYearsQueryOptions = (modelId: number | string, enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.search.years(modelId),
    queryFn: () => getYears(modelId),
    enabled,
  });

export const useGetYearsQuery = (step: number, modelId: number | string) => {
  return useQuery(searchYearsQueryOptions(modelId, step === 3));
};

export const searchTypesQueryOptions = (data: unknown, enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.search.types(data),
    queryFn: () => getTypes(data as any),
    enabled,
  });

// TODO: replace with types from api docs
export const useGetTypesQuery = (step: number, data: any) => {
  return useQuery(searchTypesQueryOptions(data, step === 4));
};
export const useSearchPartsMutation = (
  options?: UseMutationOptions<{ data: PostPartsSearchResponse }, Error, PostPartsSearchPayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.search.searchParts(),
    mutationFn: searchParts,
    ...options,
  });

  return mutation;
};
