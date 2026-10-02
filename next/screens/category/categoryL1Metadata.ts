import { Metadata } from "next";
import { resolveL1CategoryPage } from "@/services/categoryPageService";
import { buildCategoryAlternateLanguages } from "@/utils/hreflang";
import { Routes } from "@/config/routes";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";

type Props = {
  params: {
    "language-country": string;
    l1: string;
  };
};

const isProd = process.env.NEXT_ALLOW_ROBOTS === "true";
const SITE_NAME = process.env.NEXT_SITE_NAME || "OttoGusto";
const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
  /\/+$/,
  "",
);
const DEFAULT_OG_IMAGE = `${process.env.NEXT_PUBLIC_LOGO_URL}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { "language-country": languageCountry, l1: l1Slug } = params;
    const lang = languageCountry.split("-")[0] || "en";

    const resolved = await resolveL1CategoryPage(l1Slug, lang);
    if (!resolved) {
      return {
        title: "Category Not Found",
        description: "The requested category could not be found.",
      };
    }

    const { l1 } = resolved;
    const title = l1.titles?.[lang] || l1.name || "Category";
    const description =
      l1.descriptions?.[lang] || `Browse ${title} car parts. Fast shipping and competitive prices.`;

    const l2Titles = (l1.children || [])
      .slice(0, 5)
      .map((c) => c.titles?.[lang] || c.name)
      .filter(Boolean);
    const keywords = [title, ...l2Titles, "car parts", "spare parts", SITE_NAME]
      .filter(Boolean)
      .join(", ");

    const canonical = `${BASE_URL}${Routes.categoryL1(languageCountry, l1Slug)}`;
    const ogImage = getCategoryImageUrl(l1.id);
    const indexable = isProd && !isTranslationKeysLang(lang);

    return {
      title: `${title}`,
      description,
      keywords,
      alternates: {
        canonical,
        languages: buildCategoryAlternateLanguages(l1, languageCountry),
      },
      openGraph: {
        title: `${title}`,
        description,
        type: "website",
        url: canonical,
        siteName: SITE_NAME,
        images: [
          {
            url: ogImage || DEFAULT_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: lang === "en" ? "en_US" : `${lang}_${lang.toUpperCase()}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title}`,
        description,
        images: [ogImage || DEFAULT_OG_IMAGE],
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
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("[categoryL1Metadata] Error generating metadata:", formatHttpClientError(error));
    return {
      title: "Car Parts Category",
      description: "Browse car parts categories for quality spare parts.",
    };
  }
}
