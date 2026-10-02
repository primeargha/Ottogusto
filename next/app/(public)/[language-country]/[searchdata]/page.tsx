import { Box } from "@/components/ui/box";
import Products from "@/screens/products/products";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { notFound } from "next/navigation";
import { getTranslations } from "@/services/authService";
import { getSearchResultsPageTitle } from "@/helpers/PageTitleHelper";
import { ProductFilters } from "@/hooks/useUrlParams";
import { SEO_LABELS } from "@/data/branding/seo";
import { headers } from "next/headers";
import { getCarDataFromMMYTId } from "@/services/products";
import { ALLOWED_SEARCHDATA_SLUGS, buildSearchdataSlugFromCarData } from "@/utils/searchdataSlug";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import {
  getSearchResultsProductFilterKeys,
  isAllowedTrackingParam,
  type SearchResultsQueryParamKey,
} from "@/utils/searchResultsQueryAllowlist";

interface PageProps {
  params: {
    "language-country": string;
    searchdata: string;
  };
  searchParams: {
    carIds?: string | string[];
    makeModelTypeId?: string;
    take?: string;
    order?: string;
    year?: string;
    categoryId?: string;
    oeReference?: string;
  };
}

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  // ✅ Early exit for invalid language-country patterns (e.g., "qverde-favicon", static files)
  const langCountry = params["language-country"];
  const validLocalePattern = /^((?:key)|[a-z]{2})-[A-Z]{2}$/;
  if (!validLocalePattern.test(langCountry)) {
    return {
      robots: { index: false, follow: false },
    };
  }

  const headersList = headers();
  const pageUrl = headersList.get("x-current-path-with-search") || undefined;
  try {
    const lang: any = langCountry.split("-")[0];
    const translations: any = (await getTranslations(lang))?.data ?? [];

    // Get page title and description
    const result = await getSearchResultsPageTitle({ translations, params, searchParams });
    // if 404 products not found
    if (result.title === "") {
      return {
        robots: { index: false, follow: false },
        alternates: {
          canonical: null,
        },
        openGraph: {},
      };
    }

    // Set default values
    const defaultTitle =
      SEO_LABELS?.seo_home_title || "High-Quality Car Parts & Accessories | Your Store Name";
    const defaultDescription =
      SEO_LABELS?.seo_home_desc ||
      "Find the perfect car parts and accessories for your vehicle. Browse our extensive catalog of high-quality auto parts at competitive prices.";

    // Use the result from getSearchResultsPageTitle or fall back to defaults
    const title = result?.title?.trim() || defaultTitle;
    const description = result?.description?.trim() || defaultDescription || title;

    const response = {
      title,
      robots: { index: false, follow: false },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}${pageUrl}`,
        languages: buildAlternateLanguages(`/${langCountry}/${params.searchdata}`),
      },
      openGraph: {
        url: `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}${pageUrl}`,
        title,
        description,
        type: "website",
        locale: lang,
        siteName: `${process.env.NEXT_SITE_NAME}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
    return response;
  } catch (error) {
    console.error("Error generating metadata:", formatHttpClientError(error));
    return {
      title:
        SEO_LABELS?.seo_home_title ||
        `Premium Car Parts & Accessories | ${process.env.NEXT_SITE_NAME}`,
      description:
        SEO_LABELS?.seo_home_desc ||
        "Find high-quality car parts and accessories for your vehicle at competitive prices.",
      robots: { index: false, follow: false },
    };
  }
};

export default async function Page({ params, searchParams }: PageProps) {
  const { "language-country": langCountry, searchdata } = params;

  // ✅ Early exit for invalid language-country patterns (e.g., "qverde-favicon", static files)
  const validLocalePattern = /^((?:key)|[a-z]{2})-[A-Z]{2}$/;
  if (!validLocalePattern.test(langCountry)) {
    notFound();
  }
  // OD-1670: Invalid = keys not in allowed product keys and not in allowed tracking params; or known-param values failing regex
  const allowedProductKeys = getSearchResultsProductFilterKeys(langCountry);
  let notfound: boolean = false;
  const validRegex = /^[a-zA-Z0-9,]*$/;
  // OE refs often include hyphens (e.g. 55521-90A00); allow them only for oeReference
  const oeReferenceRegex = /^[a-zA-Z0-9,\-]*$/;
  const paramsRecord = searchParams as Record<string, string | string[] | undefined>;
  const invalidKeys = Object.keys(paramsRecord).filter(
    (key) =>
      !allowedProductKeys.includes(key as SearchResultsQueryParamKey) &&
      !isAllowedTrackingParam(key),
  );
  const hasInvalidKnownParam = allowedProductKeys.some((key) => {
    const val = paramsRecord[key];
    if (val === undefined) return false;
    const regex = key === "oeReference" ? oeReferenceRegex : validRegex;
    if (Array.isArray(val)) return val.some((v) => !regex.test(String(v)));
    return !regex.test(String(val));
  });

  if (hasInvalidKnownParam || invalidKeys.length > 0 || !langCountry || !searchdata) {
    notfound = true;
  }

  // Validate [searchdata] segment: must be allowed slug or match MME slug from makeModelTypeId
  if (!notfound) {
    const isAllowedSlug = ALLOWED_SEARCHDATA_SLUGS.includes(searchdata);
    if (isAllowedSlug) {
      // Valid: e.g. "search-results"
    } else {
      const makeModelTypeId = searchParams.makeModelTypeId;
      if (makeModelTypeId) {
        try {
          const carInfo = await getCarDataFromMMYTId(makeModelTypeId);
          const data = carInfo?.data;
          const expectedSlug = buildSearchdataSlugFromCarData({
            brandName: data?.brandName,
            modelName: data?.modelName,
            typeName: data?.typeName,
          });
          const normalizedSegment = searchdata.trim();
          if (expectedSlug !== normalizedSegment) {
            notFound();
          }
        } catch {
          notFound();
        }
      } else {
        notFound();
      }
    }
  }

  const lang: any = langCountry.split("-")[0];
  const translations: any = (await getTranslations(lang))?.data ?? [];
  const { title: getPageTitle } = await getSearchResultsPageTitle({
    translations,
    params,
    searchParams,
  });

  return <Products pageTitle={getPageTitle} searchdata={searchdata} notfound={notfound} />;
}
