import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getConfig } from "@/services/config";

export const configQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.config(),
    queryFn: () => getConfig(),
  });

export const useGetConfigQuery = () => {
  return useQuery(configQueryOptions());
};
