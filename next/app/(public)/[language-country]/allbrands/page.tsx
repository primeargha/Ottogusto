import { OGFeatureMakes } from "@/components/og-components/OGFeatureMakes";
import { Box } from "@/components/ui/box";
import { SEO_ALL_BRANDS_LOCALE_DEFAULTS } from "@/data/branding/seoAllBrandsLocales";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { getServerFeatureFlag } from "@/utils/server-feature";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    "language-country": string;
  };
}

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";
export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  // export async function generateMetadata(): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  const lang = languagecountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com";

  const localeDefaults = SEO_ALL_BRANDS_LOCALE_DEFAULTS[lang] ?? {};
  const mergedTranslations = { ...localeDefaults, ...translations };

  const seoTitle = getLabelUtility(mergedTranslations, "seo.all_brands.title", {});
  const seoDesc = getLabelUtility(mergedTranslations, "seo.all_brands.description", {});
  const seoKeywords = getLabelUtility(mergedTranslations, "seo.all_brands.keywords", {});

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical: `${baseUrl}/${languagecountry}/allbrands`,
      languages: buildAlternateLanguages(`/${languagecountry}/allbrands`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: `${baseUrl}/${languagecountry}/allbrands`,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/assets/allbrands/pic1_cropped.jpg`,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      locale: lang === "en" ? "en_US" : `${lang}_${lang.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/assets/allbrands/pic1_cropped.jpg`],
      creator: "@ottogusto",
      site: "@ottogusto",
    },
    robots: {
      index: isProd ? true : false,
      follow: isProd ? true : false,
      googleBot: {
        index: isProd ? true : false,
        follow: isProd ? true : false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
};

export default function Brands() {
  if (!getServerFeatureFlag("featured_makes_feature_flag")) {
    notFound();
  }

  return (
    <Box className="flex h-[80vh] flex-col bg-color-background-default px-3 gap-header-to-title section-standard md:pt-0 lg:px-10">
      <Box className="section-standard">
        {/* <OGBreadcrumb links={breadcrumbLinks} active={getLabel("car_parts")} /> */}
      </Box>
      <OGFeatureMakes ifPage={true} limit={10000} brandLabelType="span" />
    </Box>
  );
}
