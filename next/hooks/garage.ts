import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DeleteGarageCarResponse,
  GetGarageCarResponse,
  GetGarageResponse,
  PostGaragePayload,
} from "@/type";
import {
  addUpdateCarToEB,
  deleteCarFromEB,
  getAllCars,
  getCarById,
  getMySavedCars,
  postGarageNewMmeCar,
} from "@/services/garageService";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { filterNewMmeGarageCars } from "@/utils/garageCarId";
import { useAuthStore } from "@/stores/useAuthStore"; // Import auth store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";

// Alias: same key and cache as savedCars so GET /Garage is only requested once
export const allCarsQueryOptions = (enabled: boolean, userId?: string | null) =>
  queryOptions({
    queryKey: queryKeys.garage.savedCars(userId),
    queryFn: () => getMySavedCars(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });

export const useGetAllCarsQuery = () => {
  const { isAuthenticated, authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;
  return useQuery(allCarsQueryOptions(isAuthenticated, userId));
};

export const savedCarsQueryOptions = (enabled: boolean, userId?: string | null) =>
  queryOptions({
    queryKey: queryKeys.garage.savedCars(userId),
    queryFn: () => getMySavedCars(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });

export const useGetMySavedCarsQuery = () => {
  const { isAuthenticated, authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;
  return useQuery(savedCarsQueryOptions(isAuthenticated, userId));
};

/** Logged-in new MME: GET /Garage, rows with `id` + `carId`. Guest: disabled. */
export const useNewMmeGarageCarsQuery = () => {
  const { isAuthenticated, authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;
  return useQuery({
    ...savedCarsQueryOptions(isAuthenticated, userId),
    select: (response) => filterNewMmeGarageCars(response?.data),
  });
};

export type PersistNewMmeGarageCarPayload = {
  /** Garage record id (my car id) for edit. */
  id?: string;
  /** Cars API id. */
  carId: string;
};

/** POST /Garage — add `{ carId }` or edit `{ id, carId }`. */
export function usePersistNewMmeGarageCarMutation() {
  const queryClient = useQueryClient();
  const { authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;

  return useMutation({
    mutationKey: mutationKeys.garage.addUpdate(),
    mutationFn: ({ id, carId }: PersistNewMmeGarageCarPayload) =>
      postGarageNewMmeCar({
        carId,
        ...(id?.trim() ? { id: id.trim() } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.garage.savedCars(userId),
        refetchType: "all",
      });
    },
  });
}

export const savedCarsLandingQueryOptions = (enabled: boolean, userId?: string | null) =>
  queryOptions({
    queryKey: queryKeys.garage.savedCars(userId),
    queryFn: () => getMySavedCars(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });

export const useGetMySavedCarsQueryLandingPage = (isAuthenticated: boolean) => {
  const { authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;
  return useQuery(savedCarsLandingQueryOptions(isAuthenticated, userId));
};

export const savedCarsProdetailsQueryOptions = (
  authenticated: boolean,
  partid: string,
  enabled: boolean,
  userId?: string | null,
) =>
  queryOptions({
    queryKey: queryKeys.garage.savedCarsProdetails(authenticated, partid, userId),
    queryFn: () => getMySavedCars(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });

export const useGetMySavedCarsQueryprodetails = (authenticated: boolean, partid: string) => {
  const { authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? null;
  return useQuery(savedCarsProdetailsQueryOptions(authenticated, partid, !!authenticated, userId));
};

export const carByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.garage.carById(id),
    queryFn: (): Promise<GetGarageCarResponse> => getCarById(id),
    enabled: !!id,
    retry: 1,
  });

export const useGetCarByIdQuery = (id: string) => {
  return useQuery(carByIdQueryOptions(id));
};

export const useAddUpdateMyCarsToEB = (
  options?: UseMutationOptions<GetGarageResponse, Error, PostGaragePayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.garage.addUpdate(),
    mutationFn: (body: PostGaragePayload) => addUpdateCarToEB(body),
    ...options,
  });

  return mutation;
};

export const useDeleteCarFromEB = (
  options?: UseMutationOptions<DeleteGarageCarResponse, Error, string>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.garage.deleteCar(),
    mutationFn: deleteCarFromEB,
    ...options,
  });

  return mutation;
};

export const useHasSavedCars = () => {
  // const { data: carsData, isLoading } = useGetMyCarsQuery();

  // Check if there are cars in the response
  // const hasSavedCars = !isLoading && carsData &&
  //   Array.isArray(carsData?.data) && carsData?.data?.length > 0;

  // return {
  //   hasSavedCars,
  //   isLoading
  // };
  return {
    hasSavedCars: true,
    isLoading: false,
  };
};
