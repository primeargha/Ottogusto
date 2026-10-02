import { queryKeys } from "@/lib/query-keys";
import { fetchMigrationFAQHtml } from "@/services/migrationFAQService";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const migrationFAQQueryOptions = (languageCode: string, store: string) =>
  queryOptions({
    queryKey: queryKeys.policy.migrationFAQ(store, languageCode),
    queryFn: () => fetchMigrationFAQHtml(languageCode),
    staleTime: 0,
    retry: 2,
  });

export const useMigrationFAQ = (languageCode: string, store: string) => {
  return useQuery(migrationFAQQueryOptions(languageCode, store));
};
