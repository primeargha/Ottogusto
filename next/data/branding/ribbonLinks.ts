interface RIBBON_LINKS_LABELS_Interface {
  [key: string]: string | boolean;
}

interface HEADER_LINKS_Interface {
  [key: string]: string | boolean;
}

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "https://cdn.ottogusto.group";
const storeFolder = process.env.NEXT_PUBLIC_STORE || "ottogusto";

export const RIBBON_LINKS_LABELS: RIBBON_LINKS_LABELS_Interface = {
  ribbon_url_01: "",
  ribbon_url_redirect_01: "/support",
  ribbon_url_02: "",
  ribbon_url_redirect_02: "/car-parts",

  // ribbon_url_03: "",
  // ribbon_url_redirect_03: "/[locale]/migration-faq",
};

export const HEADER_LINKS: HEADER_LINKS_Interface = {
  header_link_1_text: "",
  header_link_1_url: "",

  header_link_2_text: "",
  header_link_2_url: "",

  header_link_3_text: "",
  header_link_3_url: "",

  header_link_4_text: "",
  header_link_4_url: "",

  header_link_5_text: "",
  header_link_5_url: "",

  header_link_6_text: "",
  header_link_6_url: "",
};
