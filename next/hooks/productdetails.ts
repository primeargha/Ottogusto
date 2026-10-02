import {
  getInstockInformation,
  getManufacturingformation,
  getmatchingcarsInformation,
  getProductInformation,
} from "@/services/productdetailsservice";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  isCompatibleCarSectionEnabled,
  isNewMmeFeatureEnabledForCountry,
} from "@/utils/legacyCarCompatibility";
import { IManufacturer } from "@/stores/useFilter";

export const instockInformationQueryOptions = (productId: string | number) =>
  queryOptions({
    queryKey: queryKeys.productdetails.instock(productId),
    queryFn: () => getInstockInformation(productId),
    enabled: !!productId,
    gcTime: 0,
    staleTime: 0,
  });

export const useGetInstockInformationQuery = (productId: string | number) => {
  return useQuery(instockInformationQueryOptions(productId));
};

export const productFormationQueryOptions = (productId: string | number) =>
  queryOptions({
    queryKey: queryKeys.productdetails.productFormation(),
    queryFn: () => getProductInformation(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

export const useGetProductInformationQuery = (productId: string | number) => {
  return useQuery(productFormationQueryOptions(productId));
};

export const manufacturerFormationQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.productdetails.manufacturerFormation(),
    queryFn: () => getManufacturingformation(),
    enabled,
  });

export const useGetManufacturerQuery = (manufacturerdata: IManufacturer[] | null) => {
  return useQuery(manufacturerFormationQueryOptions(manufacturerdata === null));
};

export const matchingCarsQueryOptions = (partId: string | null) =>
  queryOptions({
    queryKey: queryKeys.productdetails.matchingCars(partId),
    queryFn: () => getmatchingcarsInformation(partId),
    enabled: !!partId && isCompatibleCarSectionEnabled() && !isNewMmeFeatureEnabledForCountry(),
  });

export const useGetMatchingCarsQuery = (partId: string | null) => {
  return useQuery(matchingCarsQueryOptions(partId));
};
