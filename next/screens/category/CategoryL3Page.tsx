import { Suspense } from "react";
import dynamic from "next/dynamic";
import NotFound from "@/app/not-found";
import { resolveL3CategoryPage } from "@/services/categoryPageService";
import { getParts } from "@/services/products";
import { Routes } from "@/config/routes";
import CategoryL3ClientShell from "./CategoryL3ClientShell";
import CategoryDescription from "./CategoryDescription";
import CategoryL3TopPartsSection from "./CategoryL3TopPartsSection";
import CategoryL3TopPartsSectionServer from "./CategoryL3TopPartsSectionServer";
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
const CategoryL3BrandsSection = dynamic(() => import("./CategoryL3BrandsSection"), {
  loading: () => <CategoryBrandsSectionSkeleton />,
});
const CategoryL3LearnAndFAQ = dynamic(() => import("./CategoryL3LearnAndFAQ"), {
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
    l3: string;
  };
};

export default async function CategoryL3Page({ params }: Props) {
  try {
    const { "language-country": languageCountry, l1: l1Slug, l2: l2Slug, l3: l3Slug } = params;
    const lang = languageCountry.split("-")[0] || "en";

    const resolved = await resolveL3CategoryPage(l1Slug, l2Slug, l3Slug, lang);
    if (!resolved) return <NotFound />;

    const { l1, l2, l3 } = resolved;
    const l1Title = l1.titles?.[lang] || l1.name || "";
    const l2Title = l2.titles?.[lang] || l2.name || "";
    const l3Title = l3.titles?.[lang] || l3.name || "";
    const partsLabel =
      lang === "fr" ? "Pièces Auto" : lang === "nl" ? "Auto Onderdelen" : "Car Parts";
    const partsHref = Routes.parts(languageCountry);
    const enableNewMmeBanner = getServerFeatureFlag("new_mme_feature_flag");
    const showTopCarBrands = getServerFeatureFlag("top_car_brands_category_feature_flag");

    const serializedL3 = JSON.parse(JSON.stringify(l3));
    const categoryFaqs = collectCategoryFaqs(l3, lang);

    const langCode = lang as unknown as number;
    const initialTopParts = await getParts({
      categoryId: l3.id,
      take: 8,
      language: langCode,
      order: "priority",
      vendorId: null,
      search: null,
      name: null,
      makeModelTypeId: null,
      minPrice: null,
      maxPrice: null,
      manufacturerIds: null,
      continuationToken: null,
      country: null,
      oeReference: null,
      type: null,
    }).catch(() => null);

    const viewAllLabel =
      lang === "nl" ? "Bekijk alle " : lang === "fr" ? "Voir tous les " : "View all ";
    const selectManufacturerLabel =
      lang === "nl"
        ? "Selecteer hieronder uw fabrikant."
        : lang === "fr"
          ? "Sélectionnez votre fabricant ci-dessous."
          : "Select your manufacturer below to browse parts specifically designed for your vehicle.";

    return (
      <>
        <LcpImagePreload href={getCategoryLcpImageUrl(l3.id)} />
        <CategoryFAQJsonLd faqs={categoryFaqs} />
        <CategoryL3ClientShell
          l1Title={l1Title}
          l2Title={l2Title}
          l3Title={l3Title}
          l1Slug={l1Slug}
          l2Slug={l2Slug}
          l3Slug={l3Slug}
          partsLabel={partsLabel}
          partsHref={partsHref}
          languageCountry={languageCountry}
          enableNewMmeBanner={enableNewMmeBanner}
        >
          <Box className="flex w-full flex-col gap-stack">
            <CategoryDescription category={l3} lang={lang} />
            {/*
             * Suspense pattern for SEO:
             * - fallback = true RSC → products in server HTML immediately, Googlebot indexes them
             * - content = interactive client component → activates after hydration for vehicle filtering
             * The server fallback is what crawlers and first-paint visitors see.
             */}
            <Suspense
              fallback={
                initialTopParts ? (
                  <CategoryL3TopPartsSectionServer
                    products={initialTopParts.data.parts}
                    l3Category={serializedL3}
                    locale={lang}
                    languageCountry={languageCountry}
                    viewAllLabel={viewAllLabel}
                    selectManufacturerLabel={selectManufacturerLabel}
                  />
                ) : null
              }
            >
              <CategoryL3TopPartsSection
                l3Category={serializedL3}
                locale={lang}
                {...(initialTopParts ? { initialProducts: initialTopParts } : {})}
              />
            </Suspense>
            {showTopCarBrands && <CategoryL3BrandsSection l3Title={l3Title} l3CategoryId={l3.id} />}
            <CategoryL3LearnAndFAQ l3Category={serializedL3} faqLocale={lang} />
            <RecentlyViewedSection />
          </Box>
        </CategoryL3ClientShell>
      </>
    );
  } catch (error) {
    console.error("[CategoryL3Page] Error:", formatHttpClientError(error));
    return <NotFound />;
  }
}
