import { Metadata } from "next";
import { resolveL2CategoryPage } from "@/services/categoryPageService";
import { buildCategoryL2AlternateLanguages } from "@/utils/hreflang";
import { Routes } from "@/config/routes";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";

type Props = {
  params: {
    "language-country": string;
    l1: string;
    l2: string;
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
    const { "language-country": languageCountry, l1: l1Slug, l2: l2Slug } = params;
    const lang = languageCountry.split("-")[0] || "en";

    const resolved = await resolveL2CategoryPage(l1Slug, l2Slug, lang);
    if (!resolved) {
      return {
        title: "Category Not Found",
        description: "The requested category could not be found.",
      };
    }

    const { l1, l2 } = resolved;
    const title = l2.titles?.[lang] || l2.name || "Category";
    const l1Title = l1.titles?.[lang] || l1.name || "";
    const description =
      l2.descriptions?.[lang] ||
      `Browse ${title} car parts${l1Title ? ` in ${l1Title}` : ""}. Fast shipping and competitive prices.`;

    const l3Titles = (l2.children || [])
      .slice(0, 5)
      .map((c) => c.titles?.[lang] || c.name)
      .filter(Boolean);
    const keywords = [title, l1Title, ...l3Titles, "car parts", "spare parts", SITE_NAME]
      .filter(Boolean)
      .join(", ");

    const canonical = `${BASE_URL}${Routes.categoryL2(languageCountry, l1Slug, l2Slug)}`;
    const ogImage = getCategoryImageUrl(l2.id);
    const indexable = isProd && !isTranslationKeysLang(lang);

    return {
      title: `${title}`,
      description,
      keywords,
      alternates: {
        canonical,
        languages: buildCategoryL2AlternateLanguages(l1, l2, languageCountry),
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
    console.error("[categoryL2Metadata] Error generating metadata:", formatHttpClientError(error));
    return {
      title: "Car Parts Category",
      description: "Browse car parts categories for quality spare parts.",
    };
  }
}
