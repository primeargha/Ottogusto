import dynamic from "next/dynamic";
import NotFound from "@/app/not-found";
import { resolveL1CategoryPage } from "@/services/categoryPageService";
import { Routes } from "@/config/routes";
import CategoryL1ClientShell from "./CategoryL1ClientShell";
import CategoryDescription from "./CategoryDescription";
import CategoryL2Section from "./CategoryL2Section";
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
const CategoryL1BrandsSection = dynamic(() => import("./CategoryL1BrandsSection"), {
  loading: () => <CategoryBrandsSectionSkeleton />,
});
const CategoryLearnAndFAQ = dynamic(() => import("./CategoryLearnAndFAQ"), {
  loading: () => <CategoryLearnAndFAQSkeleton />,
});
const RecentlyViewedSection = dynamic(() => import("./RecentlyViewedSection"), {
  loading: () => <RecentlyViewedSkeleton />,
});

type Props = {
  params: {
    "language-country": string;
    l1: string;
  };
};

export default async function CategoryL1Page({ params }: Props) {
  try {
    const { "language-country": languageCountry, l1: l1Slug } = params;
    const lang = languageCountry.split("-")[0] || "en";

    const resolved = await resolveL1CategoryPage(l1Slug, lang);
    if (!resolved) return <NotFound />;

    const { l1 } = resolved;

    const l1Title = l1.titles?.[lang] || l1.name || "";
    const partsLabel =
      lang === "fr" ? "Pièces Auto" : lang === "nl" ? "Auto Onderdelen" : "Car Parts";
    const partsHref = Routes.parts(languageCountry);
    const enableNewMmeBanner = getServerFeatureFlag("new_mme_feature_flag");
    const showTopCarBrands = getServerFeatureFlag("top_car_brands_category_feature_flag");

    const serializedL1 = JSON.parse(JSON.stringify(l1));
    const categoryFaqs = collectCategoryFaqs(l1, lang);

    return (
      <>
        <LcpImagePreload href={getCategoryLcpImageUrl(l1.id)} />
        <CategoryFAQJsonLd faqs={categoryFaqs} />
        <CategoryL1ClientShell
          l1Title={l1Title}
          partsLabel={partsLabel}
          partsHref={partsHref}
          languageCountry={languageCountry}
          enableNewMmeBanner={enableNewMmeBanner}
        >
          <Box className="flex w-full flex-col gap-stack">
            <CategoryDescription category={l1} lang={lang} />
            <CategoryL2Section l1Category={serializedL1} />
            {showTopCarBrands && <CategoryL1BrandsSection l1Title={l1Title} l1CategoryId={l1.id} />}
            <CategoryLearnAndFAQ l1Category={serializedL1} faqLocale={lang} />
            <RecentlyViewedSection />
          </Box>
        </CategoryL1ClientShell>
      </>
    );
  } catch (error) {
    console.error("[CategoryL1Page] Error:", formatHttpClientError(error));
    return <NotFound />;
  }
}
