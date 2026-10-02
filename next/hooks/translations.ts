import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getTranslations } from "@/services/authService";

export const translationsQueryOptions = (lang: string) =>
  queryOptions({
    queryKey: queryKeys.translations(lang),
    queryFn: () => getTranslations(lang),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!lang,
  });

export const useTranslationsQuery = (lang: string) => {
  return useQuery(translationsQueryOptions(lang));
};
