import { useEffect } from "react";
import {
  type UseMutationOptions,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { deleteAccount, getProfileInformation, updateProfileInformation } from "@/services/profile";
import { getProfile } from "@/services/authService";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/useAuthStore";
import type { GetProfileResponse } from "@/type";
import type { ProfileUpdatePayload } from "@/types/profile";

/** Profile GET API – queryFn return type (GetProfileResponse) is inferred from getProfileInformation. */
export const profileFormationQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.profile.formation(),
    queryFn: () => getProfileInformation(),
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetProfileInformationQuery = () => {
  const setAddresses = useAuthStore((s) => s.setAddresses);
  const query = useQuery(profileFormationQueryOptions());

  useEffect(() => {
    const data: GetProfileResponse | undefined = query.data;
    const addresses = data?.data?.addresses;
    if (Array.isArray(addresses)) {
      setAddresses(addresses as Parameters<typeof setAddresses>[0]);
    }
  }, [query.data, setAddresses]);

  return query;
};

export const userProfileDataQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.profile.userData(),
    queryFn: () => getProfile({}),
    staleTime: 0,
  });

export const useGetProfileQuery = () => {
  return useQuery(userProfileDataQueryOptions());
};

export const useUpdateProfileInformationMutation = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateProfileInformation>>,
    Error,
    ProfileUpdatePayload
  >,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.profile.updateProfile(),
    mutationFn: updateProfileInformation,
    ...options,
  });

  return mutation;
};

export const useUpdateHasLoggedInInformationMutation = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateProfileInformation>>,
    Error,
    ProfileUpdatePayload
  >,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.profile.updateHasLoggedIn(),
    mutationFn: updateProfileInformation,
    ...options,
  });

  return mutation;
};

export const useDeleteAccountMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteAccount>>, Error, void>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.profile.deleteAccount(),
    mutationFn: deleteAccount,
    ...options,
  });

  return mutation;
};
