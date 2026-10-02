interface FOOTER_LINKS_LABELS_Interface {
  [key: string]: string | boolean;
}

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "https://cdn.ottogusto.group";
const storeFolder = process.env.NEXT_PUBLIC_STORE || "ottogusto";

export const FOOTER_LINKS_LABELS: FOOTER_LINKS_LABELS_Interface = {
  footer_link_1: "Shop by Car Brands",
  footer_link_1_url: "/[locale]/support",

  footer_link_2: "Shop by Categories",
  footer_link_2_url: "/[locale]/about-us",
};
