import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { deleteAddress, saveAddress } from "@/services/address";
import { mutationKeys } from "@/lib/query-keys";
import type { SaveAddressPayload } from "@/type";

export const useSaveAddressMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof saveAddress>>, Error, SaveAddressPayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.address.saveAddress(),
    mutationFn: saveAddress,
    ...options,
  });

  return mutation;
};

export const useDeleteAddressMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteAddress>>, Error, string>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.address.deleteAddress(),
    mutationFn: deleteAddress,
    ...options,
  });

  return mutation;
};
