import { Box } from "@/components/ui/box";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import React from "react";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import MigrationFAQ from "@/screens/migration-faq/MigrationFAQ";

type Props = {
  params: {
    "language-country": string;
  };
};

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  const lang = languagecountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://qverde.com";

  const seoTitle =
    getLabelUtility(translations, "seo_migration_faq_title", {}) || "Return Policy | Ottogusto";
  const seoDesc =
    getLabelUtility(translations, "seo_migration_faq_desc", {}) || "Return Policy page";
  const seoKeywords = getLabelUtility(translations, "seo_migration_faq_keyword", {}) || "";

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical: `${baseUrl}/${languagecountry}/migration-faq`,
      languages: buildAlternateLanguages(`/${languagecountry}/migration-faq`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: `${baseUrl}/${languagecountry}/migration-faq`,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
      locale: lang === "en" ? "en_US" : `${lang}_${lang.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
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
}
//
export default function ReturnPolicyPage({ params }: Props) {
  const { "language-country": locale } = params;
  return <MigrationFAQ languageCode={locale.split("-")[0] || "en"} />;
}
