import { Box } from "@/components/ui/box";
import BottomNavBar from "@/screens/landing/bottom-navbar";
// import BrowseByCategory from "@/screens/landing/browse-by-category";
import FaqSection from "@/screens/landing/faq";
// import FooterLanding from "@/screens/landing/footer";
// import { HeroSection } from "@/screens/landing/hero-section";
import KeyFeaturesSection from "@/screens/landing/key-features";
// import OurBrandsYourTrust from "@/screens/landing/our-brands-your-trust";
import PreviousSearchClientContainer from "@/screens/landing/previous-search-client-container";
import Reviews from "@/screens/landing/reviews";
import WhyUs_BrandValues from "@/screens/landing/why-us";
// import BrowseByCategoryNew from "@/screens/landing/browse-by-category-new";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { HeroSection2 } from "@/screens/landing/HeroSection2";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";
import Script from "next/script";
// import { useBranding } from "@/contexts/BrandingContext";
import ScrollToHash from "@/components/ScrollToHash";
// import dynamic from "next/dynamic";
// import RedirectManager from "../RedirectManager";
import { OGFeatureMakes } from "@/components/og-components/OGFeatureMakes";
import { BrowseByCategory2 } from "@/screens/landing/browse-by-category-2";
import { headers } from "next/headers";
import Typography from "@/components/og-components/Typography";
import ManufacturerBlock from "@/screens/landing/ManufacturerBlock";
import { getManufacturer, unwrapManufacturerList } from "@/services/products";
import { getCountryCodeFromLanguageCountrySegment } from "@/utils/feature-flag-env";
import { getFeatureFlag } from "@/utils/theme-utils";
import HomeLcpPreload from "@/screens/landing/HomeLcpPreload";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";
import { buildManufacturerBrandHrefById } from "@/utils/manufacturerBrandHrefById";

// Sprint 35: car search moved to global right sidebar — keep for QA if needed.
// const NewMmeSearch = dynamic(() => import("@/components/NewMmeSearch"), {
//   ssr: false,
// });

const isProd = !!process.env?.NEXT_ALLOW_ROBOTS && process.env?.NEXT_ALLOW_ROBOTS === "true";

type Props = {
  params: {
    "language-country": string;
  };
};

// Generate metadata for Home page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  const lang = languagecountry.split("-")[0] || "en";

  const { data: translations = {} } = await getTranslations(lang);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com";

  const headersList = headers();
  const pageUrl = headersList.get("x-current-path-with-search") || undefined;

  const seoTitle =
    getLabelUtility(translations, "seo_home_title") ||
    "Find & Order Genuine Spare Parts Online | OttoGusto";
  const seoDesc =
    getLabelUtility(translations, "seo_home_desc") ||
    "Find and order genuine spare parts for your appliances, electronics, and more. Fast shipping, easy returns, and expert support.";
  const seoKeywords =
    getLabelUtility(translations, "seo_home_keyword") ||
    "spare parts, appliance parts, genuine parts, order parts online, replacement parts";

  const canonicalUrl = `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}${pageUrl || "/"}`;
  const indexable = isProd && !isTranslationKeysLang(lang);

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical: canonicalUrl,
      languages: buildAlternateLanguages(`/${languagecountry}`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
      url: canonicalUrl,
      siteName: process.env.NEXT_SITE_NAME || "OttoGusto",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_CDN_BASE_URL || ""}/assets/og-image.jpg`,
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
      images: [`${process.env.NEXT_PUBLIC_CDN_BASE_URL || ""}/assets/og-image.jpg`],
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
}
// import HeaderRow from '@/screens/landing/header-row';

const landingPageSchemaMarkup = async (
  locale: string | undefined,
  translations: Record<string, string>,
) => {
  const markupDataTranslated = {
    org_schema_markup_landing_description: getLabelUtility(
      translations,
      "org_schema_markup_landing_description",
      {},
    ),
    footer_info_mail: getLabelUtility(translations, "footer_info_mail", {}),
    org_schema_markup_landing_street: getLabelUtility(
      translations,
      "org_schema_markup_landing_street",
      {},
    ),
    org_schema_markup_landing_locality: getLabelUtility(
      translations,
      "org_schema_markup_landing_locality",
      {},
    ),
    org_schema_markup_landing_country: getLabelUtility(
      translations,
      "org_schema_markup_landing_country",
      {},
    ),
    org_schema_markup_landing_region: getLabelUtility(
      translations,
      "org_schema_markup_landing_country",
      {},
    ),
    org_schema_markup_landing_postalcode: getLabelUtility(
      translations,
      "org_schema_markup_landing_postalcode",
      {},
    ),
    org_schema_markup_landing_vat_id: getLabelUtility(
      translations,
      "org_schema_markup_landing_vat_id",
      {},
    ),
    footer_youtube_url: getLabelUtility(translations, "footer_youtube_url", {}),
    footer_instagram_url: getLabelUtility(translations, "footer_instagram_url", {}),
    footer_linkedin_url: getLabelUtility(translations, "footer_linkedin_url", {}),
    org_schema_markup_landing_telephone: getLabelUtility(
      translations,
      "org_schema_markup_landing_telephone",
      {},
    ),
    org_schema_markup_landing_contact_type: getLabelUtility(
      translations,
      "org_schema_markup_landing_contact_type",
      {},
    ),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}/#organization`,
    name: `${process.env.NEXT_SITE_NAME}`,
    url: `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}`,
    logo: `${process.env.NEXT_PUBLIC_LOGO_URL}`,
    description:
      markupDataTranslated.org_schema_markup_landing_description ||
      "We have more than 20 million+ premium car parts available",
    email: markupDataTranslated.footer_info_mail || "info@ottogusto.com",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: markupDataTranslated.org_schema_markup_landing_telephone || "+32-3-889-20-95",
      contactType:
        markupDataTranslated.org_schema_markup_landing_contact_type || "Customer Service",
    },
    sameAs: [
      markupDataTranslated.footer_youtube_url,
      markupDataTranslated.footer_instagram_url,
      markupDataTranslated.footer_linkedin_url,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: markupDataTranslated.org_schema_markup_landing_street || "Lintsesteenweg 531B",
      addressLocality: markupDataTranslated.org_schema_markup_landing_locality || "Hove",
      addressCountry: markupDataTranslated.org_schema_markup_landing_country || "BE",
      addressRegion: markupDataTranslated.org_schema_markup_landing_region || "Flanders",
      postalCode: markupDataTranslated.org_schema_markup_landing_postalcode || "2540",
    },
    vatID: markupDataTranslated.org_schema_markup_landing_vat_id || "BE1006907015",
  };
};

const Page = async ({ params }) => {
  const { "language-country": locale } = params;
  const lang = locale.split("-")[0] || "en";
  const translationsResponse = await getTranslations(lang);
  const translations = (translationsResponse?.data ?? {}) as Record<string, string>;
  const pageSchema = JSON.stringify(await landingPageSchemaMarkup(locale, translations));
  const storeName = process.env.NEXT_PUBLIC_STORE || "ottogusto";
  const countryCode = getCountryCodeFromLanguageCountrySegment(locale);
  const isMmeFeatureEnabled = getFeatureFlag("mme_feature_flag", countryCode);
  const featuredMakesEnabled = getFeatureFlag("featured_makes_feature_flag", countryCode);
  const homePreviousSearchEnabled = getFeatureFlag(
    "home_previous_search_feature_flag",
    countryCode,
  );

  let initialManufacturers: ReturnType<typeof unwrapManufacturerList> | undefined;
  let brandHrefById: Record<string, string> | undefined;
  try {
    initialManufacturers = unwrapManufacturerList(await getManufacturer());
    if (initialManufacturers.length === 0) {
      initialManufacturers = undefined;
    } else {
      brandHrefById = await buildManufacturerBrandHrefById(locale, initialManufacturers);
    }
  } catch (error) {
    console.error("[home] Failed to SSR manufacturer list", error);
  }

  // const { previousSearches } = useMmeStore();
  return (
    <>
      <HomeLcpPreload />
      <ScrollToHash />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: pageSchema,
        }}
      />
      {storeName === "ottogusto" && (
        <Typography type="h1" className="sr-only">
          Ottogusto: OEM & Premium Car Parts & Accessories Online
        </Typography>
      )}
      {storeName === "qverde" && (
        <Typography type="h1" className="sr-only">
          QVerde | OEM & Premium Italian Car Parts & Accessories
        </Typography>
      )}
      <HeroSection2 isMmeFeatureEnabled={isMmeFeatureEnabled} />

      {homePreviousSearchEnabled ? (
        <Box className="gap-stack">
          <PreviousSearchClientContainer />
          <BrowseByCategory2 />
        </Box>
      ) : (
        <BrowseByCategory2 forceTopSpacer />
      )}

      <KeyFeaturesSection />
      <Box className="gap-stack section-standard">
        {featuredMakesEnabled && (
          <>
            <OGFeatureMakes showAll={true} viewAllBrands={true} limit={8} />
            <Box className="h-[1px] w-full bg-color-border-default" />
          </>
        )}
        <ManufacturerBlock
          initialManufacturers={initialManufacturers}
          brandHrefById={brandHrefById}
        />
      </Box>
      <WhyUs_BrandValues />

      <Reviews />
      <FaqSection />
      {/* <NewMmeSearch /> */}

      <BottomNavBar />
    </>
  );
};

export default Page;
