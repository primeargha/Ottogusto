import { Box } from "@/components/ui/box";
import Image from "next/image";
import React from "react";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import WhyUs_BrandValues from "@/screens/landing/why-us";
import Reviews from "@/screens/landing/reviews";
import { OGButton } from "@/components/og-components/OGButton";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import TitleBar from "./TitleBar";
import OurStory from "./OurStory";
import MissionNVision from "./MissionNVision";
import JoinTheCrew from "./JoinTheCrew";
import { getTranslations } from "@/services/authService";

type Props = {
  params: {
    "language-country": string;
  };
};

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";
// Generate metadata for About Us page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  const lang = languagecountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com";

  const seoTitle = getLabelUtility(translations, "seo_about_us_title", {});
  const seoDesc = getLabelUtility(translations, "seo_about_us_desc", {});
  const seoKeywords = getLabelUtility(translations, "seo_about_us_keyword", {});

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical: `${baseUrl}/${languagecountry}/about-us`,
      languages: buildAlternateLanguages(`/${languagecountry}/about-us`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: `${baseUrl}/${languagecountry}/about-us`,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/assets/about-us/pic1_cropped.jpg"}`,
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
      images: [`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/assets/about-us/pic1_cropped.jpg"}`],
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

const page = (props: Props) => {
  return (
    <Box className="bg-color-background-default p-0">
      <TitleBar />

      <OurStory />

      <MissionNVision />
      {/* <WhyUs_BrandValues forceVisible noLeftNavSpace containerClassName="mt-[40px] pb-0" /> */}
      <Reviews forceVisible noLeftNavSpace containerClassName="pt-0 mt-[40px] mb-[40px] pb-0" />
      <JoinTheCrew />
    </Box>
  );
};

export default page;
