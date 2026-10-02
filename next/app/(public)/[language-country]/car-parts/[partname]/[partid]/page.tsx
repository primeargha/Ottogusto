import { cache, Suspense } from "react";
import ProductMainImage from "@/screens/productdetails/ProductMainImage";

import { createApiClient } from "@/config/newApiClient";
import Products from "@/screens/productdetails/productdetails";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import NotFound from "@/app/not-found";
import dynamic from "next/dynamic";
import SearchContainerWrapper from "@/components/SearchContainerWrapper";
import { Box } from "@/components/ui/box";
import { formatHttpClientError, isExpectedPartApiNotFound } from "@/utils/formatHttpClientError";
import { getPartsRouteSegmentForLang } from "@/config/url-segments";
import { getCountryCodeFromLanguageCountrySegment } from "@/utils/feature-flag-env";
import { getFeatureFlag } from "@/utils/theme-utils";
import { applyProductSchemaServerPlaceholders } from "@/utils/product-schema-placeholders";
import { isValidPartIdForApi, logPartApiCall, logSkippedPartApiCall } from "@/utils/part-id";
import LcpImagePreload from "@/components/lcp/LcpImagePreload";
import { getProductLcpImageUrl } from "@/utils/lcp-utils";
import { getProductImagesForCarousel } from "@/utils/partImageUtils";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";
import { ProductDetailsCompatibilityLoading } from "@/screens/productdetails/ProductDetailsPageLoading";
import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";

// PERF: Removed next/script import — using plain <script> for JSON-LD (no client JS overhead)

const ProductMatchingCarsLazy = dynamic(
  () => import("@/screens/productdetails/productmatchingcars"),
  {
    ssr: false,
    loading: () => <ProductDetailsCompatibilityLoading />,
  },
);

const PdpE2ECarSelectionBanner = dynamic(() => import("@/components/PdpE2ECarSelectionBanner"), {
  ssr: false,
  loading: () => <CategoryCarSelectionBannerSkeleton />,
});

// Shared types
type Props = {
  params: {
    "language-country": string;
    partname: string;
    partid: string;
  };
};

const fetchProduct = cache(async (partid: string) => {
  if (!isValidPartIdForApi(partid)) {
    logSkippedPartApiCall("pdp.fetchProduct", partid);
    return null;
  }
  try {
    logPartApiCall("pdp.fetchProduct", partid, { method: "GET", path: `/parts/${partid}` });
    const api = createApiClient({ isServer: true });
    const res = await api.get(`/parts/${partid}`);
    return res.data;
  } catch (error) {
    if (!isExpectedPartApiNotFound(error)) {
      console.error(
        `[fetchProduct] Error fetching product ${partid}:`,
        formatHttpClientError(error),
      );
    }
    return null;
  }
});

// 🔁 Shared API cached call for Matching Cars
const fetchMatchingCars = cache(async (partid: string) => {
  if (!isValidPartIdForApi(partid)) {
    logSkippedPartApiCall("pdp.fetchMatchingCars", partid);
    return null;
  }
  try {
    logPartApiCall("pdp.fetchMatchingCars", partid, {
      method: "GET",
      path: `/MakeModelType/part/${partid}`,
    });
    const api = createApiClient({ isServer: true });
    const res = await api.get(`/MakeModelType/part/${partid}`);
    return Array.isArray(res.data) ? { data: res.data } : res.data;
  } catch (error) {
    if (!isExpectedPartApiNotFound(error)) {
      console.error(
        `[fetchMatchingCars] Error fetching matching cars for ${partid}:`,
        formatHttpClientError(error),
      );
    }
    return null;
  }
});

const isProd = process.env.NEXT_ALLOW_ROBOTS === "true";
const DEFAULT_KEYWORDS = "spare parts, replacement parts, automotive parts";
const DEFAULT_DESCRIPTION =
  "Find quality spare parts. Fast shipping and competitive prices on replacement parts.";
const STRIP_HTML_REGEX = /<[^>]*>/g;
const loggedSchemaParseErrors = new Set<string>();

function logSchemaParseErrorOnce(error: unknown) {
  const message = formatHttpClientError(error);
  if (loggedSchemaParseErrors.has(message)) return;
  loggedSchemaParseErrors.add(message);
  console.error("Failed to parse product schema from API:", message);
}

// ✅ Generate metadata using same data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { partid, "language-country": languagecountry } = params;
    const lang = languagecountry.split("-")[0];

    const product = await fetchProduct(partid);
    if (!product) {
      return {
        title: "Product Detail",
        description: DEFAULT_DESCRIPTION,
        keywords: DEFAULT_KEYWORDS,
      };
    }

    // Generate description and keywords with fallbacks
    const description = (
      product?.seo?.description ||
      product?.fullDescription ||
      product?.description ||
      `Find ${product?.title || product?.name || "Part"} and other quality spare parts.`
    ).replace(STRIP_HTML_REGEX, "");

    const keywords = [
      product?.title,
      product?.name,
      product?.brand,
      product?.category,
      product?.partNumber,
      product?.model,
      DEFAULT_KEYWORDS,
    ]
      .filter(Boolean)
      .join(", ");
    const title = product?.seo?.title || product?.title || product?.name || "Product Detail";
    const imageUrl = product?.images?.[0]?.url || `${process.env.NEXT_PUBLIC_LOGO_URL}`;
    const imageAlt =
      product?.images?.[0]?.label || product?.title || product?.name || "Product Image";
    const partsSeg = getPartsRouteSegmentForLang(languagecountry);
    const pdpPath = `/${languagecountry}/${partsSeg}/${product?.seo?.name || product?.name || "part"}/${partid}`;
    const indexable = isProd && !isTranslationKeysLang(lang);

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}${pdpPath}`,
        languages: buildAlternateLanguages(pdpPath),
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}${pdpPath}`,
        siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: imageAlt,
          },
        ],
        locale: lang === "en" ? "en_US" : `${lang}_${lang?.toUpperCase()}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: "@ottogusto",
        site: "@ottogusto",
      },
      robots: {
        index: indexable,
        follow: indexable,
        googleBot: {
          index: indexable,
          follow: indexable,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", formatHttpClientError(error));

    return {
      title: "Product Detail",
      description:
        "Find quality spare parts. Fast shipping and competitive prices on replacement parts.",
      keywords: "spare parts, replacement parts, automotive parts",
    };
  }
}

// Generate JSON-LD structured data for product
function generateProductSchema(product: any, partid: string, languagecountry: string) {
  const partsSeg = getPartsRouteSegmentForLang(languagecountry);
  const pdpPathTail = `${partsSeg}/${product?.seo?.name || product?.name || "part"}/${partid}`;
  try {
    // if no SEO schema is coming from BE then remove the script tag
    const schemaRaw = product?.seo?.schema;
    if (typeof schemaRaw !== "string" || !schemaRaw.trim()) {
      console.warn("Product data is missing, cannot generate schema");
      return false;
    }

    const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
      /\/$/,
      "",
    );
    const fullUrl = `${baseUrl}/${languagecountry}/${pdpPathTail}`;
    const countryCode = getCountryCodeFromLanguageCountrySegment(languagecountry);

    const schemaAfterPlaceholders = applyProductSchemaServerPlaceholders(
      schemaRaw,
      fullUrl,
      countryCode,
    );
    try {
      return JSON.parse(schemaAfterPlaceholders);
    } catch (parseError) {
      logSchemaParseErrorOnce(parseError);
      return false;
    }
  } catch (error) {
    console.error("Error generating product schema:", formatHttpClientError(error));
    return false;
  }
}

export default function PartDetailPage({ params }: Props) {
  return <PartDetailPageContent params={params} />;
}

// ✅ Actual page content.
async function PartDetailPageContent({ params }: Props) {
  try {
    const { partid, "language-country": languagecountry } = params;
    const lang = languagecountry.split("-")[0];
    const countryCode = getCountryCodeFromLanguageCountrySegment(languagecountry);
    const isMmeFeatureEnabled = getFeatureFlag("mme_feature_flag", countryCode);
    const isNewMmeEnabled = getFeatureFlag("new_mme_feature_flag", countryCode);
    const isE2EVinFlowEnabled = getFeatureFlag("end_to_end_vin_flow_feature_flag", countryCode);
    const isCompatibleCarSection = getFeatureFlag("compatible_car_section_flag", countryCode);

    const shouldFetchLegacyMatchingCars = isCompatibleCarSection && !isNewMmeEnabled;

    // 🚀 Parallel data fetching
    const [product, matchingcars] = await Promise.all([
      fetchProduct(partid),
      shouldFetchLegacyMatchingCars ? fetchMatchingCars(partid) : Promise.resolve(null),
    ]);

    if (!product) return <NotFound />;

    const carouselImages = getProductImagesForCarousel(product?.images);
    const firstCarouselImage = carouselImages[0];

    const lcpImageHref = getProductLcpImageUrl(firstCarouselImage?.url);

    const productSchema = generateProductSchema(product, partid, languagecountry);
    const serverMainImage = firstCarouselImage?.url ? (
      <ProductMainImage
        imageUrl={firstCarouselImage.url}
        productTitle={product.title}
        imageLabel={firstCarouselImage.label ?? null}
      />
    ) : undefined;

    return (
      <>
        <LcpImagePreload href={lcpImageHref} />
        {/* {productSchema && hasImages && ( */}
        {productSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(productSchema),
            }}
          />
        )}

        {/* Legacy MME vehicle bar — hidden when new Cars API flow is active */}
        {isMmeFeatureEnabled && !isNewMmeEnabled && (
          <Suspense
            fallback={
              <Box className="w-full border-b border-t border-color-border-positive bg-color-background-positive-muted">
                <Box className="section-base base:py-4 gtsm:py-6">
                  <Box
                    className="animate-pulse h-12 w-full rounded bg-color-background-emphasis"
                    aria-busy={true}
                    aria-label="Loading vehicle compatibility bar"
                  />
                </Box>
              </Box>
            }
          >
            <SearchContainerWrapper matchingcars={matchingcars} partId={partid} />
          </Suspense>
        )}

        {/* E2E VIN flow: New search banner on PDP (dropdown + VIN / auto part check). */}
        {isNewMmeEnabled && isE2EVinFlowEnabled && (
          <Suspense fallback={<CategoryCarSelectionBannerSkeleton />}>
            <PdpE2ECarSelectionBanner
              partId={partid}
              productName={product?.name}
              productTitle={product?.title}
              oeReference={product?.oeReference}
              price={product?.priceInclVat ?? product?.price ?? null}
            />
          </Suspense>
        )}

        <Products
          data={product}
          language={lang}
          serverMainImage={serverMainImage}
          matchingCarsSection={
            <Suspense fallback={<ProductDetailsCompatibilityLoading />}>
              <ProductMatchingCarsLazy
                partId={partid}
                product={product}
                language={lang ?? "en"}
                matchingcars={matchingcars}
              />
            </Suspense>
          }
        />
      </>
    );
  } catch (error) {
    console.error("Error rendering product page:", formatHttpClientError(error));
    return <NotFound />;
    // throw error;
  }
}
