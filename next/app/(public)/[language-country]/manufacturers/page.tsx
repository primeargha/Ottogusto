import { Suspense } from "react";
import { Box } from "@/components/ui/box";
import ManufacturerBlock from "@/screens/landing/ManufacturerBlock";
import { ManufacturerListPageSkeleton } from "@/components/og-components/OGManufacturerSkeleton";
import { SEO_LABELS } from "@/data/branding/seo";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import { getManufacturer, unwrapManufacturerList } from "@/services/products";
import { getManufacturersRouteSegmentForLang } from "@/config/url-segments";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { buildManufacturerBrandHrefById } from "@/utils/manufacturerBrandHrefById";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";
import { Metadata } from "next";
import React from "react";

interface PageProps {
  params: {
    "language-country": string;
  };
}

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";
const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
  /\/+$/,
  "",
);

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { "language-country": languageCountry } = params;
  const lang = languageCountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const mergedTranslations = { ...SEO_LABELS, ...translations };
  const segment = getManufacturersRouteSegmentForLang(languageCountry);
  const canonicalPath = `/${languageCountry}/${segment}`;
  const canonical = `${BASE_URL}${canonicalPath}`;

  const seoTitle = getLabelUtility(mergedTranslations, "seo.car_part_brands.title", {});
  const seoDesc = getLabelUtility(mergedTranslations, "seo.car_part_brands.description", {});
  const seoKeywords = getLabelUtility(mergedTranslations, "seo.car_part_brands.keyword", {});
  const indexable = isProd && !isTranslationKeysLang(lang);

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

// Isolated so a slow `GET /Manufacturer` only delays this subtree — the
// Suspense boundary in `page` below can render `ManufacturerListPageSkeleton`
// immediately instead of blocking the whole route on this await.
const ManufacturerListContent = async ({ languageCountry }: { languageCountry: string }) => {
  let initialManufacturers: ReturnType<typeof unwrapManufacturerList> | undefined;
  let brandHrefById: Record<string, string> | undefined;
  try {
    const response = await getManufacturer();
    initialManufacturers = unwrapManufacturerList(response);
    if (initialManufacturers.length === 0) {
      initialManufacturers = undefined;
    } else {
      brandHrefById = await buildManufacturerBrandHrefById(languageCountry, initialManufacturers);
    }
  } catch (error) {
    console.error("[car-parts-brands] Failed to SSR manufacturer list", error);
    // Leave undefined so the client query can retry.
  }

  return (
    <ManufacturerBlock initialManufacturers={initialManufacturers} brandHrefById={brandHrefById} />
  );
};

const page = ({ params }: PageProps) => {
  const languageCountry = params["language-country"];
  return (
    <Box className="flex w-full flex-col">
      <Suspense fallback={<ManufacturerListPageSkeleton />}>
        <ManufacturerListContent languageCountry={languageCountry} />
      </Suspense>
    </Box>
  );
};

export default page;
