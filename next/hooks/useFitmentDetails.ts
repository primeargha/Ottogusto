import { queryKeys } from "@/lib/query-keys";
import { fetchFitmentDetailsHtml } from "@/services/fitmentService";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const fitmentDetailsQueryOptions = (languageCode: string, store: string) =>
  queryOptions({
    queryKey: queryKeys.policy.fitmentDetails(store, languageCode),
    queryFn: () => fetchFitmentDetailsHtml(languageCode),
    staleTime: 0,
    retry: 2,
  });

export const useFitmentDetails = (languageCode: string, store: string) => {
  return useQuery(fitmentDetailsQueryOptions(languageCode, store));
};
