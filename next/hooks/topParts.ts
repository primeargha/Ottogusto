import { useParams, useSearchParams } from "next/navigation";
import { useQuery, queryOptions } from "@tanstack/react-query";
import type { PostPartsSearchPayload, PostPartsSearchResponse } from "@/type";
import { getParts } from "@/services/products";
import { queryKeys } from "@/lib/query-keys";
import { getCarIdsFromSearchParams } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type TopPartsData = { data: PostPartsSearchResponse };

export function topPartsQueryOptions(payload: PostPartsSearchPayload) {
  return queryOptions({
    queryKey: queryKeys.products.parts({
      ...payload,
      continuationToken: null,
    }),
    queryFn: async () => {
      const response = await getParts(payload);
      return response;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export const useTopPartsForCategory = (
  categoryId: string,
  initialProducts?: TopPartsData,
  options?: { manufacturerIds?: string[] | null },
) => {
  const params = useParams();
  const searchParams = useSearchParams();

  const lang = (params?.["language-country"] as string | undefined)?.split("-")[0] ?? "en";
  const makeModelTypeId = searchParams?.get("makeModelTypeId") || null;
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const urlCarIds = getCarIdsFromSearchParams(searchParams);
  const carIds = isNewMmeEnabled && urlCarIds.length > 0 ? urlCarIds : null;
  const manufacturerIds =
    options?.manufacturerIds && options.manufacturerIds.length > 0 ? options.manufacturerIds : null;

  const payload: PostPartsSearchPayload = {
    vendorId: null,
    search: null,
    name: null,
    makeModelTypeId,
    carIds,
    categoryId,
    take: 8,
    minPrice: null,
    maxPrice: null,
    manufacturerIds,
    order: "priority",
    language: lang as unknown as number,
    continuationToken: null,
    country: null,
    oeReference: null,
    type: null,
  };

  const baseOptions = topPartsQueryOptions(payload);
  // Pre-hydrate from SSR data when no vehicle filter is active.
  // initialDataUpdatedAt = Date.now() tells React Query the data was just fetched,
  // so it respects the 60s staleTime and does NOT refetch immediately on mount.
  const queryResult = useQuery(
    !makeModelTypeId && !carIds && initialProducts
      ? { ...baseOptions, initialData: initialProducts, initialDataUpdatedAt: Date.now() }
      : baseOptions,
  );

  return {
    data: queryResult.data as TopPartsData | undefined,
    // React Query v5 exposes `isPending` – map it to `isLoading` for callers.
    isLoading: queryResult.isPending,
    isError: queryResult.isError,
  };
};
