interface HERO_BANNER_LABELS_Interface {
  [key: string]: string | boolean;
}

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "https://cdn.ottogusto.group";
const storeFolder = process.env.NEXT_PUBLIC_STORE || "ottogusto";
//
export const HERO_BANNER_LABELS: HERO_BANNER_LABELS_Interface = {
  hero_title_1: siteName,
  hero_body_1: "Get support related to [category]",
  landing_page_hero_image_1: `${cdnBase}/${storeFolder}/hero_001.jpg`,
  hero_url_1: "",

  hero_title_2: siteName,
  hero_body_2: "Get support related to [category]",
  landing_page_hero_image_2: `${cdnBase}/${storeFolder}/hero_002.jpg`,
  hero_url_2: "",

  hero_title_3: siteName,
  hero_body_3: "Get support related to [category]",
  landing_page_hero_image_3: `${cdnBase}/${storeFolder}/hero_003.jpg`,
  hero_url_3: "",

  hero_title_4: siteName,
  hero_body_4: "Get support related to [category]",
  landing_page_hero_image_4: `${cdnBase}/${storeFolder}/hero_004.jpg`,
  hero_url_4: "",

  hero_title_5: "Take Back The Tools. Find Your Parts.",
  hero_body_5: "The platform built by people who wrench on their own cars for people who care.",
  landing_page_hero_image_5: `${cdnBase}/${storeFolder}/hero_005.jpg`,
  hero_url_5: "",
};
