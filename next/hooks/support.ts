import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { submitSupport, submitSupportForReturn } from "@/services/support";
import { mutationKeys } from "@/lib/query-keys";
import type {
  GetReturnResponse,
  PostReturnPayload,
  PostSupportPayload,
  PostSupportResponse,
} from "@/type";

export const useSubmitSupportMutation = (
  options?: UseMutationOptions<{ data: PostSupportResponse }, Error, PostSupportPayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.support.submit(),
    mutationFn: submitSupport,
    ...options,
  });

  return mutation;
};

export const useSubmitSupportForReturnMutation = (
  options?: UseMutationOptions<{ data: GetReturnResponse }, Error, PostReturnPayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.support.submitForReturn(),
    mutationFn: submitSupportForReturn,
    ...options,
  });

  return mutation;
};
