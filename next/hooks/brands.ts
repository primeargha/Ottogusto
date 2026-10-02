import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { queryOptions, useIsRestoring, useQuery } from "@tanstack/react-query";
import { isPostLogoutRedirectPending } from "@/utils/localeCookie";
import { queryKeys } from "@/lib/query-keys";
import { getBrands } from "@/services/search";
import {
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
} from "@/utils/feature-flag-env";
import { shouldFetchMakeModelBrandsApi } from "@/utils/legacyCarCompatibility";

export const brandsQueryOptions = (enabled = true) =>
  queryOptions({
    queryKey: queryKeys.brands(),
    queryFn: () => getBrands(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
  });

export const useBrandQuery = () => {
  const pathname = usePathname();
  const isRestoring = useIsRestoring();
  const countryCode = useMemo(() => {
    const locale = getLanguageCountryFromPathname(pathname ?? "");
    return locale ? getCountryCodeFromLanguageCountrySegment(locale) : null;
  }, [pathname]);
  const enabled =
    shouldFetchMakeModelBrandsApi(countryCode) &&
    !isRestoring &&
    !isPostLogoutRedirectPending(pathname);
  return useQuery(brandsQueryOptions(enabled));
};
