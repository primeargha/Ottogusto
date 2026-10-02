import { profile } from "console";
import { QverdeIcon } from "./screens/landing/footer/assets/QverdeIcon";

export const bottomBarIcons = {
  pit_stop: "/assets/bottom-bar/vector-01.svg",
  garage_bay: "/assets/bottom-bar/car-parking-02.svg",
  og_search: "/assets/bottom-bar/search-area.svg",
  drive_assist: "/assets/bottom-bar/customer-service-01.svg",
};
export const bottomBarActiveIcons = {
  pit_stop: "/assets/bottom-bar/active/vector.svg",
  garage_bay: "/assets/bottom-bar/active/car-parking-02.svg",
  og_search: "/assets/bottom-bar/active/search-area.svg",
  drive_assist: "/assets/bottom-bar/active/customer-service-01.svg",
};

export const leftMenuIcons = {
  bg: "/assets/left-sidebar/hover_bg.svg",
  pit_stop: "/assets/icons/l-nav/pit_stop.svg",
  garage_bay: "/assets/icons/l-nav/garage_bay.svg",
  og_search: "/assets/icons/l-nav/og_search.svg",
  profile: "/assets/icons/l-nav/profile.svg",
  drive_assist: "/assets/icons/l-nav/drive_assist.svg",
};

export const hamburgerMenuIcons = {
  pit_stop: "/assets/hamburger-menu/icon.svg",
  QverdeIcon: "/assets/Qverde/Vectormobile.svg",
  garage_bay: "/assets/hamburger-menu/car-parking-02.svg",
  og_search: "/assets/hamburger-menu/search-area.svg",
  profile: "/assets/hamburger-menu/user.svg",
  drive_assist: "/assets/hamburger-menu/customer-service-01-stroke-standard 1.svg",
  cancel: "/assets/hamburger-menu/cancel-square.svg",
  category: "/assets/hamburger-menu/category.svg",
};

export const searchIcons = {
  cancel: "/assets/oe-reference/cancel-square.svg",
  information: "/assets/oe-reference/information-square.svg",
  cross: "/assets/oe-reference/vector.svg",
  alert: "/assets/oe-reference/alert.svg",
  aisearch: "/assets/search/ad-search-black.svg",
};

export const ogSearchIcons = {
  line: "/assets/og-search/line.svg",
  refresh: "/assets/og-search/refresh.svg",
  search: "/assets/og-search/search-area.svg",
};

export const categoryIcons = {
  engineIcon: "/assets/adv-search/categories/engine.svg",
  electicalSystemsIcon: "/assets/adv-search/categories/electrical_system.svg",
  chassisIcon: "/assets/adv-search/categories/chassis.svg",
  bodyworkIcon: "/assets/adv-search/categories/bodywork.svg",
  coolingIcon: "/assets/adv-search/categories/cooling.svg",
  brakeSytemsIcon: "/assets/adv-search/categories/brake_system.svg",
  miscellaneousIcon: "/assets/adv-search/categories/miscellaneous.svg",

  tag_close: "/assets/adv-search/close_tag.svg",
};

export const loggedInUserOGSearchIcons = {
  activeSavedCarIcon: "/assets/logged-in-user-og-search/active-saved-car.svg",
  inactiveSavedCarIcon: "/assets/logged-in-user-og-search/inactive-saved-car.svg",
  car: "/assets/logged-in-user-og-search/car.svg",
  noCar: "/assets/logged-in-user-og-search/no-car.png",
  star: "/assets/logged-in-user-og-search/star.svg",
  aiSearch: "/assets/logged-in-user-og-search/ai-search-02.svg",
  quickSearch: "/assets/logged-in-user-og-search/quick.svg",
  moreInfo: "/assets/logged-in-user-og-search/moreinfo-circle.svg",
  moreInfoWhite: "/assets/logged-in-user-og-search/more-vertical-circle-02.svg",
  addFavourite: "/assets/logged-in-user-og-search/star-empty.svg",
  edit: "/assets/logged-in-user-og-search/pencil-edit.svg",
};

export const heroSection = {
  car: "/assets/hero/frame.png",
  add: "/assets/hero/add.svg",
  addWhite: "/assets/hero/add-white.svg",
  aiEdit: "/assets/hero/ai-editing.svg",
  aiSearch: "/assets/hero/ai-search.svg",
  arrow: "/assets/hero/leftArrow.svg",
};

export const carouselImages = {
  a: "/assets/our-brands/1.png",
  b: "/assets/our-brands/2.png",
  c: "/assets/our-brands/3.png",
  d: "/assets/our-brands/4.png",
  e: "/assets/our-brands/5.png",
  f: "/assets/our-brands/6.png",
};

export const garageBayIcons = {
  star: "/assets/garage-bay/star.svg",
  car: "/assets/garage-bay/car.svg",
  upload: "/assets/garage-bay/upload-square.svg",
  advance: "/assets/garage-bay/ai-search.svg",
};

export const DEFAULT_LOCALE = "en-BE";
type EnvLocaleRecord = Record<string, string>;

const parseEnvLocaleRecord = (
  raw: string | undefined,
  fallback: EnvLocaleRecord,
): EnvLocaleRecord => {
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;

    const out: EnvLocaleRecord = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k !== "string") continue;
      if (typeof v !== "string") continue;
      out[k.toLowerCase()] = v;
    }

    return Object.keys(out).length > 0 ? out : fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_ENV_COUNTRIES: EnvLocaleRecord = {
  nl: "Netherlands",
  be: "Belgium",
  fr: "France",
  lu: "Luxembourg",
};

const DEFAULT_ENV_LANGUAGES: EnvLocaleRecord = {
  nl: "Nederlands",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  key: "Key",
};

// IMPORTANT:
// Use static env reads so Next can inline `NEXT_PUBLIC_*` into the client bundle.
// Avoid `process.env[someDynamicKey]`.
const rawEnvCountries =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_COUNTRIES : undefined;
const rawEnvLanguages =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LANGUAGES : undefined;

const envCountries = parseEnvLocaleRecord(rawEnvCountries, DEFAULT_ENV_COUNTRIES);
const envLanguages = parseEnvLocaleRecord(rawEnvLanguages, DEFAULT_ENV_LANGUAGES);

export const CountryList = Object.entries(envCountries).map(([code, title]) => ({
  title: `${title} (${code.toUpperCase()})`,
  flag: `/assets/flags/${code}.svg`,
  code: code.toUpperCase(),
}));

export const LanguageList = Object.entries(envLanguages).map(([code, title]) => ({
  title,
  code,
}));

export const LOCALEs_LIST: {
  locale: string;
  language: string;
  country_code: string;
  title: string;
}[] = [];

for (const lng of LanguageList) {
  for (const c of CountryList) {
    LOCALEs_LIST.push({
      title: `${lng.code.toUpperCase()} - ${c.title}`,
      locale: `${lng.code}-${c.code}`,
      language: lng.title,
      country_code: c.code,
    });
  }
}

export const ROTATION_INTERVAL = 14000; // 16 seconds - shared constant
export const SEARCH_CHARACTORS = 5;
export const HEADER_SEARCH_CHARACTORS = 3;
export const DISPLAY_LIST_NO = 5;
export const DEBOUNCE_DELAY = 50; // Wait 300ms before processing
export const URL_UPDATE_DEBOUNCE_DELAY = 500; // Wait 300ms before updating URL after filter changes
// export const URL_UPDATE_DEBOUNCE_DELAY = 1500; // Wait 1.5 seconds before updating URL after filter changes
export const BRANDS_SLIDER_ACTIVE_BRAND_ID = "00a00000000000";

/** L1 "Other" bucket — pinned at bottom of search-results category sidebar. */
export const OTHER_CATEGORY_ID = "000000000";
export const DISPLAY_OE_SEARCH_LIST_NO = 4;
export const MAX_COUNT = 12;

/** Default Parts search availability when the URL has no `availability` query (all options selected). */
export const DEFAULT_AVAILABILITY_FILTER_KEYS = [
  "InStock",
  "BackOrder",
  "OnRequest",
  "EndofLife",
] as const;

export const MANUFACTURER_TYPES = ["OEM", "OES", "AMS"] as const;

export const ConfigFallback = {
  countries: {
    BE: "Belgium",
    NL: "Netherlands",
    FR: "France",
    DE: "Germany",
    AT: "Austria",
    IT: "Italy",
    PL: "Poland",
    ES: "Spain",
    PT: "Portugal",
    CZ: "Czechia",
    HU: "Hungary",
    SK: "Slovakia",
    SI: "Slovenia",
    HR: "Croatia",
    SE: "Sweden",
    DK: "Denmark",
    FI: "Finland",
    //"eu": "Anywhere in the EU"
  },
  languages: {
    nl: "Nederlands",
    en: "English",
    fr: "Français",
  },
  defaults: {
    be: "en",
    nl: "nl",
    fr: "fr",
    lu: "fr",
    // "eu": "en"
  },
  numberOfFaq: 5,
};

export {
  LANG_COUNTRY_COMBINATIONS,
  PUBLIC_LANG_COUNTRY_COMBINATIONS,
} from "./config/lang-country-combinations-env";
export {
  ROBOTS_DISALLOW,
  ROBOTS_DISALLOW_INTERNAL_PATHS,
  ROBOTS_DISALLOW_QUERY_PATTERNS,
} from "./config/robots";

export const countriesList = envCountries;

/**
 * Category cache TTL shared across server + browser category caches.
 * Production value: 1 day. Change here only.
 */
export const CATEGORY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
