import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { Box } from "@/components/ui/box";
import Shoppingcartpage from "@/screens/shoppingcart/shoppingcartpage";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getTranslations } from "@/services/authService";

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
    getLabelUtility(translations, "seo_shopping_cart_title", {}) || `Shopping cart | ${storeName}`;
  return {
    title: seoTitle,
    description: "Shopping cart page",
    keywords: "",
    alternates: {
      languages: buildAlternateLanguages(`/${languagecountry}/shoppingcart`),
    },
    robots: {
      follow: false,
      index: false,
    },
  };
}

const ShoppingcartPage = () => {
  return (
    <main className="z-[10] bg-color-background-default">
      <Box className="w-full">
        <Shoppingcartpage />
      </Box>
    </main>
  );
};

export default ShoppingcartPage;
