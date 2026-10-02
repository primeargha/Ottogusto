import { Metadata } from "next";
import { getTranslations } from "@/services/authService";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { SEO_CAR_PARTS_LOCALE_DEFAULTS } from "@/data/branding/seoCarPartsLocales";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";

type Props = {
  params: {
    "language-country": string;
  };
};

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { "language-country": languageCountry } = params;
  const lang = languageCountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
    /\/+$/,
    "",
  );

  const localeDefaults = SEO_CAR_PARTS_LOCALE_DEFAULTS[lang] ?? {};
  const mergedTranslations = { ...localeDefaults, ...translations };

  const seoTitle = getLabelUtility(mergedTranslations, "seo.car_parts.title", {});
  const seoDesc = getLabelUtility(mergedTranslations, "seo.car_parts.description", {});

  const canonical = `${baseUrl}/${languageCountry}/car-parts`;
  const ogImage = process.env.NEXT_PUBLIC_LOGO_URL || "";
  const indexable = isProd && !isTranslationKeysLang(lang);

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical,
      languages: buildAlternateLanguages(`/${languageCountry}/car-parts`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: canonical,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: seoTitle,
            },
          ]
        : [],
      locale: lang === "en" ? "en_US" : `${lang}_${lang.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: ogImage ? [ogImage] : [],
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
};
