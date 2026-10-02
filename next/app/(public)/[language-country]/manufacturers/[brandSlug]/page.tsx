import { Suspense } from "react";
import { Box } from "@/components/ui/box";
import CarPartBrandLandingPage from "@/screens/car-part-brands/CarPartBrandLandingPage";
import CarPartBrandLandingSkeleton from "@/screens/car-part-brands/CarPartBrandLandingSkeleton";
import { SEO_LABELS } from "@/data/branding/seo";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import { getManufacturerBySlug } from "@/services/products";
import { fetchCategoryTreeForBrand } from "@/services/categoryPageService";
import { getManufacturersRouteSegmentForLang } from "@/config/url-segments";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { buildBrandEmptyCategoriesSrpHref } from "@/utils/categorySearchUrl";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";
import { getServerFeatureFlag } from "@/utils/server-feature";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    "language-country": string;
    brandSlug: string;
  };
}

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";
const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
  /\/+$/,
  "",
);

/** Locale map → string for the active language only (same helper as [l3Slug]/page.tsx). */
function resolveLocalizedText(
  value: Record<string, string> | string | null | undefined,
  lang: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const localized = value[lang];
  return typeof localized === "string" ? localized.trim() : "";
}

/**
 * Brand landing only when `GET /Category?brandId=` returns ≥1 L1.
 * Empty tree → temporary redirect to search-results (Other + manufacturerIds).
 */
async function loadBrandLandingCategories(brandId: string) {
  try {
    return await fetchCategoryTreeForBrand(brandId);
  } catch (error) {
    console.error("[car-part-brand] Failed to load brand category tree", error);
    return [];
  }
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { "language-country": languageCountry, brandSlug } = params;
  const lang = languageCountry.split("-")[0] || "en";
  const brand = await getManufacturerBySlug(brandSlug);

  // Translations can transiently fail (network/backend) — don't let that wipe
  // out the whole metadata block (title/canonical/openGraph); fall back to the
  // static SEO_LABELS only, same resilience pattern as [l3Slug]/page.tsx.
  let translations: Record<string, string> = {};
  try {
    ({ data: translations = {} } = await getTranslations(lang));
  } catch (error) {
    console.error("[car-part-brand] Failed to load translations for metadata", error);
  }
  const mergedTranslations = { ...SEO_LABELS, ...translations };
  const segment = getManufacturersRouteSegmentForLang(languageCountry);
  const canonicalPath = `/${languageCountry}/${segment}/${brandSlug}`;
  const canonical = `${BASE_URL}${canonicalPath}`;

  const brandName = brand?.name || brandSlug;
  const shortDescription = resolveLocalizedText(brand?.shortDescriptions, lang);
  const fullDescription = resolveLocalizedText(brand?.fullDescriptions, lang);
  // Pre-formatted so an empty fullDescription leaves no dangling separator in
  // the keywords template (see data/branding/seo.ts).
  const fullDescriptionForKeywords = fullDescription ? `, ${fullDescription}` : "";

  let l1Categories: Awaited<ReturnType<typeof fetchCategoryTreeForBrand>> = [];
  if (brand?.id) {
    l1Categories = await loadBrandLandingCategories(brand.id);
    if (l1Categories.length === 0) {
      redirect(buildBrandEmptyCategoriesSrpHref(languageCountry, brand.id));
    }
  }
  const categoryTitles = l1Categories
    .map((l1) => l1.titles?.[lang] || l1.name)
    .filter(Boolean)
    .join(", ");

  const seoTitle = getLabelUtility(mergedTranslations, "seo.car_part_brands_brand.title", {
    brand: brandName,
  });
  const seoDesc = getLabelUtility(mergedTranslations, "seo.car_part_brands_brand.description", {
    sdesc: shortDescription,
  });
  const seoKeywords = getLabelUtility(mergedTranslations, "seo.car_part_brands_brand.keyword", {
    brand: brandName,
    categories: categoryTitles,
  });

  const indexable = isProd && !isTranslationKeysLang(lang) && Boolean(brand);

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical,
      languages: buildAlternateLanguages(canonicalPath),
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

// Isolated so a slow brand/category SSR fetch only delays this subtree — the
// Suspense boundary in `page` below can stream `CarPartBrandLandingSkeleton`
// immediately instead of blocking the whole route on these awaits.
const CarPartBrandLandingContent = async ({ params }: PageProps) => {
  const { "language-country": languageCountry, brandSlug } = params;
  const brand = await getManufacturerBySlug(brandSlug);
  if (!brand) {
    notFound();
  }

  const initialCategories = await loadBrandLandingCategories(brand.id);
  if (initialCategories.length === 0) {
    redirect(buildBrandEmptyCategoriesSrpHref(languageCountry, brand.id));
  }

  const enableNewMmeBanner = getServerFeatureFlag("new_mme_feature_flag");
  const serializedCategories = JSON.parse(JSON.stringify(initialCategories));

  return (
    <CarPartBrandLandingPage
      brand={brand}
      languageCountry={languageCountry}
      brandSlug={brandSlug}
      initialCategories={serializedCategories}
      enableNewMmeBanner={enableNewMmeBanner}
    />
  );
};

const page = ({ params }: PageProps) => {
  return (
    <Box className="flex w-full flex-col">
      <Suspense fallback={<CarPartBrandLandingSkeleton />}>
        <CarPartBrandLandingContent params={params} />
      </Suspense>
    </Box>
  );
};

export default page;
