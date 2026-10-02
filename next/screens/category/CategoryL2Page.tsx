import dynamic from "next/dynamic";
import NotFound from "@/app/not-found";
import { resolveL2CategoryPage } from "@/services/categoryPageService";
import { Routes } from "@/config/routes";
import CategoryL2ClientShell from "./CategoryL2ClientShell";
import CategoryDescription from "./CategoryDescription";
import CategoryL3Grid from "./CategoryL3Grid";
import CategoryFAQJsonLd from "./CategoryFAQJsonLd";
import { collectCategoryFaqs } from "./categoryFaqCollect";
import {
  CategoryBrandsSectionSkeleton,
  CategoryLearnAndFAQSkeleton,
  RecentlyViewedSkeleton,
} from "./CategorySkeletons";
import { Box } from "@/components/ui/box";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import LcpImagePreload from "@/components/lcp/LcpImagePreload";
import { getCategoryLcpImageUrl } from "@/utils/lcp-utils";
import { getServerFeatureFlag } from "@/utils/server-feature";

// PERF: Lazy-load below-the-fold sections — smaller initial JS on mobile
const CategoryL2BrandsSection = dynamic(() => import("./CategoryL2BrandsSection"), {
  loading: () => <CategoryBrandsSectionSkeleton />,
});
const CategoryL2LearnAndFAQ = dynamic(() => import("./CategoryL2LearnAndFAQ"), {
  loading: () => <CategoryLearnAndFAQSkeleton />,
});
const RecentlyViewedSection = dynamic(() => import("./RecentlyViewedSection"), {
  loading: () => <RecentlyViewedSkeleton />,
});

type Props = {
  params: {
    "language-country": string;
    l1: string;
    l2: string;
  };
};

export default async function CategoryL2Page({ params }: Props) {
  try {
    const { "language-country": languageCountry, l1: l1Slug, l2: l2Slug } = params;
    const lang = languageCountry.split("-")[0] || "en";

    const resolved = await resolveL2CategoryPage(l1Slug, l2Slug, lang);
    if (!resolved) return <NotFound />;

    const { l1, l2 } = resolved;
    const l1Title = l1.titles?.[lang] || l1.name || "";
    const l2Title = l2.titles?.[lang] || l2.name || "";
    const partsLabel =
      lang === "fr" ? "Pièces Auto" : lang === "nl" ? "Auto Onderdelen" : "Car Parts";
    const partsHref = Routes.parts(languageCountry);
    const enableNewMmeBanner = getServerFeatureFlag("new_mme_feature_flag");
    const showTopCarBrands = getServerFeatureFlag("top_car_brands_category_feature_flag");

    const serializedL2 = JSON.parse(JSON.stringify(l2));
    const categoryFaqs = collectCategoryFaqs(l2, lang);

    return (
      <>
        <LcpImagePreload href={getCategoryLcpImageUrl(l2.id)} />
        <CategoryFAQJsonLd faqs={categoryFaqs} />
        <CategoryL2ClientShell
          l1Title={l1Title}
          l2Title={l2Title}
          l1Slug={l1Slug}
          l2Slug={l2Slug}
          partsLabel={partsLabel}
          partsHref={partsHref}
          languageCountry={languageCountry}
          enableNewMmeBanner={enableNewMmeBanner}
        >
          <Box className="flex w-full flex-col gap-stack">
            <CategoryDescription category={l2} lang={lang} />
            <CategoryL3Grid l2Category={serializedL2} locale={lang} />
            {showTopCarBrands && <CategoryL2BrandsSection l2Title={l2Title} l2CategoryId={l2.id} />}
            <CategoryL2LearnAndFAQ l2Category={serializedL2} faqLocale={lang} />
            <RecentlyViewedSection />
          </Box>
        </CategoryL2ClientShell>
      </>
    );
  } catch (error) {
    console.error("[CategoryL2Page] Error:", formatHttpClientError(error));
    return <NotFound />;
  }
}
