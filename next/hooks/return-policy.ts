import { queryKeys } from "@/lib/query-keys";
import { fetchReturnPolicyHtml } from "@/services/returnService";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const returnPolicyQueryOptions = (languageCode: string, store: string) =>
  queryOptions({
    queryKey: queryKeys.policy.returnPolicy(store, languageCode),
    queryFn: () => fetchReturnPolicyHtml(languageCode),
    staleTime: 0,
    retry: 2,
  });

export const useReturnPolicy = (languageCode: string, store: string) => {
  return useQuery(returnPolicyQueryOptions(languageCode, store));
};
