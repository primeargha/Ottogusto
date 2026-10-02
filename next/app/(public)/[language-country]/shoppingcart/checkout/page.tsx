import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { Box } from "@/components/ui/box";
import Checkoutpage from "@/screens/shoppingcart/checkout/page";
import { getTranslations } from "@/services/authService";
import { getLabelUtility } from "@/helpers/UtilityHelper";

type Props = {
  params: {
    "language-country": string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  const lang = languagecountry.split("-")[0] || "en";
  const { data: translations = {} } = await getTranslations(lang);
  const storeName = process.env.NEXT_PUBLIC_STORE
    ? process.env.NEXT_PUBLIC_STORE.charAt(0).toUpperCase() + process.env.NEXT_PUBLIC_STORE.slice(1)
    : "";
  const seoTitle =
    getLabelUtility(translations, "seo_checkout_title", {}) || `Checkout | ${storeName}`;
  return {
    title: seoTitle,
    description: "Checkout page",
    keywords: "",
    alternates: {
      languages: buildAlternateLanguages(`/${languagecountry}/shoppingcart/checkout`),
    },
    robots: {
      follow: false,
      index: false,
    },
  };
}

const CheckoutPage = async () => {
  return (
    <main className="z-[10] bg-color-background-default">
      <Box className="min-h-screen w-full">
        <Checkoutpage />
      </Box>
    </main>
  );
};

export default CheckoutPage;
