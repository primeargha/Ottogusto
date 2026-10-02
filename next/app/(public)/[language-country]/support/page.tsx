import React from "react";

import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { Box } from "@/components/ui/box";
import SupportForm from "@/screens/support/SupportForm";
import SupportHeaderSection from "@/screens/support/SupportHeaderSection";
import SupportFaq from "@/screens/support/SupportFaq";
import { getConfig } from "@/services/config";
import { ConfigType } from "@/contexts/ConfigContext";
import { getLabelUtility, slugToWords } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";

interface GenerateMetadataParams {
  params: {
    category?: string;
    "language-country": string;
  };
}

export async function generateMetadata({ params }: GenerateMetadataParams): Promise<Metadata> {
  let { category, "language-country": languageCountry } = params;

  if (!!category) {
    category = slugToWords(category);
  }
  const { data: translations = {} } = await getTranslations(languageCountry.split("-")[0] ?? "en");
  const translatedTitle = getLabelUtility(translations, "support_title_no_category", {
    category: category ?? "",
  });
  const translatedDesc = getLabelUtility(translations, "get_support", {
    category: category ?? "",
  });
  const translatedKeywords = getLabelUtility(translations, "seo_support_page_keywords", {
    category: category ?? "",
  });
  const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
  return {
    title: translatedTitle,
    description: translatedDesc ?? "Facing problems with purchase or return, come here",
    keywords: translatedKeywords ?? `${siteName} Support`,
    alternates: {
      languages: buildAlternateLanguages(`/${languageCountry}/support`),
    },
  };
}
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   return {
//     title: "Support",
//     description: "Facing problems with purchase or return, come here",
//     keywords: "OttoGusto Support",
//   };
// }

export default async function page() {
  const configApiResponse: any = await getConfig();
  const config: ConfigType | null = configApiResponse;

  return (
    <Box className="min-h-screen bg-color-background-default pb-[38px] base:px-3">
      <Box className="h-full w-full bg-color-background-default">
        <SupportHeaderSection />
        {/* @ts-ignore */}
        <SupportForm supportCategories={config?.supportCategories} />
        <SupportFaq isSupportPage={true} />
      </Box>
    </Box>
  );
}
