import { Suspense } from "react";
import { Box } from "@/components/ui/box";
import CarPartBrandL3Page from "@/screens/car-part-brands/CarPartBrandL3Page";
import CategoryL3TopPartsSection from "@/screens/category/CategoryL3TopPartsSection";
import CategoryL3TopPartsSectionServer from "@/screens/category/CategoryL3TopPartsSectionServer";
import CarPartBrandL3PageLoading from "@/screens/car-part-brands/CarPartBrandL3PageLoading";
import { CategoryTopPartsSkeleton } from "@/screens/category/CategorySkeletons";
import { SEO_LABELS } from "@/data/branding/seo";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import { getManufacturerBySlug, getParts } from "@/services/products";
import {
  fetchCategoryDetail,
  fetchCategoryTree,
  mergeCategoryWithDetail,
} from "@/services/categoryPageService";
import { getManufacturersRouteSegmentForLang } from "@/config/url-segments";
import { Routes } from "@/config/routes";
import { buildCarPartBrandL3AlternateLanguages } from "@/utils/hreflang";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";
import { getServerFeatureFlag } from "@/utils/server-feature";
import { findL3ByLocaleSlug, getCategoryLocaleSlug } from "@/utils/carPartBrandCategories";
import { getCarIdsFromSearchParams } from "@/utils/categorySearchUrl";
import {
  buildBrandL3HrefWithVehicleOnly,
  hasBrandManufacturerQuery,
} from "@/utils/brandManufacturerQuery";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    "language-country": string;
    brandSlug: string;
    l3Slug: string;
  };
  searchParams?:
    | {
        /** @deprecated Manufacturer id — stripped; use slug API `brand.id` instead */
        brandId?: string;
        /** @deprecated Legacy manufacturer id — stripped */
        carId?: string;
        carIds?: string | string[];
        vin?: string;
      }
    | undefined;
}

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";
const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
  /\/+$/,
  "",
);

function searchParamsToURLSearchParams(
  searchParams?: PageProps["searchParams"],
): URLSearchParams | null {
  if (!searchParams) return null;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) qs.append(key, item);
    } else {
      qs.set(key, String(value));
    }
  }
  return qs;
}

/** Locale-only description — empty when current lang missing (no en fallback). */
function resolveLocalizedText(
  value: Record<string, string> | string | null | undefined,
  lang: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const localized = value[lang];
  return typeof localized === "string" ? localized.trim() : "";
}

/** Clean Brand+L3 path (+ optional vehicle). Never includes manufacturer `brandId`. */
function buildCleanBrandL3Url(
  languageCountry: string,
  brandSlug: string,
  l3Slug: string,
  searchParams?: PageProps["searchParams"],
): string {
  return buildBrandL3HrefWithVehicleOnly(
    Routes.carPartBrandL3(languageCountry, brandSlug, l3Slug),
    searchParams,
  );
}

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const { "language-country": languageCountry, brandSlug, l3Slug } = params;
  const lang = languageCountry.split("-")[0] || "en";
  const brand = await getManufacturerBySlug(brandSlug);
  const segment = getManufacturersRouteSegmentForLang(languageCountry);
  const canonicalPath = `/${languageCountry}/${segment}/${brandSlug}/${l3Slug}`;
  const canonical = `${BASE_URL}${canonicalPath}`;

  let l3Title = l3Slug.replace(/-/g, " ");
  let l3BodyDescription = "";
  let languages = buildCarPartBrandL3AlternateLanguages(brandSlug, {
    id: "",
    parentId: "",
    name: l3Slug,
    displayOrder: 0,
    titles: {},
    slugs: { [lang]: l3Slug },
  });
  let hasProducts = false;

  try {
    const tree = await fetchCategoryTree();
    const match = findL3ByLocaleSlug(tree, l3Slug, lang);
    if (match) {
      const detail = await fetchCategoryDetail(match.l3.id);
      const l3 = mergeCategoryWithDetail(match.l3, detail);
      l3Title = l3.titles?.[lang] || l3.name || l3Title;
      // SEO copy only from GET /Category/{id} (merged detail) — never list/tree.
      l3BodyDescription =
        resolveLocalizedText(l3.descriptions, lang) ||
        resolveLocalizedText(l3.fullDescriptions, lang);
      languages = buildCarPartBrandL3AlternateLanguages(brandSlug, l3);
      const brandManufacturerId = brand?.id;
      if (brandManufacturerId) {
        const parts = await getParts({
          categoryId: l3.id,
          take: 8,
          language: lang as unknown as number,
          order: "priority",
          vendorId: null,
          search: null,
          name: null,
          makeModelTypeId: null,
          minPrice: null,
          maxPrice: null,
          manufacturerIds: [brandManufacturerId],
          continuationToken: null,
          country: null,
          oeReference: null,
          type: null,
          carIds: null,
        }).catch(() => null);
        hasProducts = (parts?.data?.parts?.length ?? 0) > 0;
      }
    }
  } catch {
    // Metadata still returns a basic title/canonical
  }

  const { data: translations = {} } = await getTranslations(lang);
  const mergedTranslations = { ...SEO_LABELS, ...translations };
  const brandName = brand?.name || brandSlug;
  const brandDescription = resolveLocalizedText(brand?.shortDescriptions, lang);
  const seoTitle = getLabelUtility(mergedTranslations, "seo.car_part_brands_brand_category.title", {
    brand: brandName,
    category: l3Title,
  });
  const seoDescTemplate = getLabelUtility(
    mergedTranslations,
    "seo.car_part_brands_brand_category.description",
  );
  const seoDesc = seoDescTemplate
    .replaceAll("$BRAND_DESCRIPTION$", brandDescription)
    .replaceAll("$L3_DESCRIPTION$", l3BodyDescription)
    .replace(/\s{2,}/g, " ")
    .trim();
  const seoKeywords = getLabelUtility(
    mergedTranslations,
    "seo.car_part_brands_brand_category.keyword",
    { brand: brandName, category: l3Title },
  );

  // Soft-404 / noindex when brand+L3 has zero products on a clean crawl (no vehicle).
  const vehicleCarIds = getCarIdsFromSearchParams(searchParamsToURLSearchParams(searchParams));
  const indexable =
    isProd &&
    !isTranslationKeysLang(lang) &&
    Boolean(brand) &&
    hasProducts &&
    vehicleCarIds.length === 0;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: canonical,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
  };
};

const CarPartBrandL3Content = async ({ params, searchParams }: PageProps) => {
  const { "language-country": languageCountry, brandSlug, l3Slug } = params;
  const lang = languageCountry.split("-")[0] || "en";

  const brand = await getManufacturerBySlug(brandSlug);
  if (!brand) {
    notFound();
  }

  // Manufacturer id comes from slug API (`brand.id`), not the query string.
  // Strip legacy `?brandId=` / `?carId=` so the address bar stays clean.
  const urlSearchParams = searchParamsToURLSearchParams(searchParams);
  if (hasBrandManufacturerQuery(urlSearchParams)) {
    redirect(buildCleanBrandL3Url(languageCountry, brandSlug, l3Slug, searchParams));
  }

  const brandManufacturerId = brand.id;

  let tree: Awaited<ReturnType<typeof fetchCategoryTree>> = [];
  try {
    tree = await fetchCategoryTree();
  } catch (error) {
    console.error("[car-part-brand-l3] Failed to SSR category tree", formatHttpClientError(error));
  }

  const match = findL3ByLocaleSlug(tree, l3Slug, lang);
  if (!match) {
    notFound();
  }

  const detail = await fetchCategoryDetail(match.l3.id);
  const l3 = mergeCategoryWithDetail(match.l3, detail);
  const l3Title = l3.titles?.[lang] || l3.name || "";
  // SEO copy only from GET /Category/{id} — list/tree has descriptions stripped.
  const l3Description =
    resolveLocalizedText(l3.descriptions, lang) || resolveLocalizedText(l3.fullDescriptions, lang);

  // Prefer backend localized slug in path when crawler hit a near-miss fallback slug.
  const canonicalL3Slug = getCategoryLocaleSlug(l3, lang);
  if (canonicalL3Slug && canonicalL3Slug !== l3Slug) {
    redirect(buildCleanBrandL3Url(languageCountry, brandSlug, canonicalL3Slug, searchParams));
  }

  const vehicleCarIds = getCarIdsFromSearchParams(searchParamsToURLSearchParams(searchParams));
  const hasVehicle = vehicleCarIds.length > 0;

  const langCode = lang as unknown as number;
  const initialTopParts = await getParts({
    categoryId: l3.id,
    take: 8,
    language: langCode,
    order: "priority",
    vendorId: null,
    search: null,
    name: null,
    makeModelTypeId: null,
    minPrice: null,
    maxPrice: null,
    manufacturerIds: [brandManufacturerId],
    continuationToken: null,
    country: null,
    oeReference: null,
    type: null,
    carIds: hasVehicle ? vehicleCarIds : null,
  }).catch((error) => {
    console.error("[car-part-brand-l3] Parts SSR failed", formatHttpClientError(error));
    return null;
  });

  const enableNewMmeBanner = getServerFeatureFlag("new_mme_feature_flag");
  const serializedL3 = JSON.parse(JSON.stringify(l3));
  const viewAllLabel =
    lang === "nl" ? "Bekijk alle " : lang === "fr" ? "Voir tous les " : "View all ";

  return (
    <CarPartBrandL3Page
      brand={brand}
      languageCountry={languageCountry}
      brandSlug={brandSlug}
      l3Title={l3Title}
      l3Description={l3Description}
      enableNewMmeBanner={enableNewMmeBanner}
    >
      {/*
       * Same Suspense pattern as category L3:
       * - fallback = RSC products HTML (or CategoryTopPartsSkeleton) for first paint / crawlers
       * - client section hydrates for vehicle filtering
       */}
      <Suspense
        fallback={
          initialTopParts ? (
            <CategoryL3TopPartsSectionServer
              products={initialTopParts.data.parts}
              l3Category={serializedL3}
              locale={lang}
              languageCountry={languageCountry}
              viewAllLabel={viewAllLabel}
              manufacturerIds={[brandManufacturerId]}
              brandName={brand.name}
            />
          ) : (
            <CategoryTopPartsSkeleton hideHeading />
          )
        }
      >
        <CategoryL3TopPartsSection
          l3Category={serializedL3}
          locale={lang}
          manufacturerIds={[brandManufacturerId]}
          brandName={brand.name}
          {...(initialTopParts ? { initialProducts: initialTopParts } : {})}
        />
      </Suspense>
    </CarPartBrandL3Page>
  );
};

export default function Page({ params, searchParams }: PageProps) {
  return (
    <Box className="flex w-full flex-col">
      <Suspense
        key={`${params["language-country"]}:${params.brandSlug}:${params.l3Slug}`}
        fallback={<CarPartBrandL3PageLoading />}
      >
        <CarPartBrandL3Content params={params} searchParams={searchParams} />
      </Suspense>
    </Box>
  );
}
