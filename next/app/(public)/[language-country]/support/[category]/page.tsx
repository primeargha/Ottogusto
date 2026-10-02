import React from "react";

import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { Box } from "@/components/ui/box";
import SupportForm from "@/screens/support/SupportForm";
import SupportHeaderSection from "@/screens/support/SupportHeaderSection";
import SupportFaq from "@/screens/support/SupportFaq";
import { getConfig } from "@/services/config";
import { ConfigType } from "@/contexts/ConfigContext";
import { camelToKebab, getLabelUtility, slugToWords } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import NotFound from "@/app/not-found";

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
  const translatedTitle = getLabelUtility(translations, "support_title", {
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
      languages: buildAlternateLanguages(`/${languageCountry}/support/${category || ""}`),
    },
  };
}

const supportPage = async (props: any) => {
  const { params } = props;
  const { category } = params;

  const configApiResponse: any = await getConfig();
  const config: ConfigType | null = configApiResponse;

  if (!config?.supportCategories.map((c) => camelToKebab(c)).includes(category.toLowerCase())) {
    return <NotFound />;
  }

  return (
    <Box className="min-h-screen bg-color-background-default pb-[38px] base:px-3 base:pt-4 gtsm:pt-0 md:px-[38px] gtlg:pt-0">
      <Box className="h-full w-full">
        <SupportHeaderSection />
        <SupportForm category={category} supportCategories={config?.supportCategories} />
        <SupportFaq isSupportPage={true} />
      </Box>
    </Box>
  );
};

export default supportPage;
