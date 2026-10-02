"use client";

import { createContext, useContext } from "react";
import { useBranding } from "./BrandingContext";
import { useParams } from "next/navigation";

export type ConfigType = {
  baseUrl: string;
  appName: string;

  // Current DataStructure coming from config API
  countries: { [key: string]: string };
  languages: { [key: string]: string };
  defaults: { [key: string]: string };
  supportCategories: string[];
  numberOfFaq: number;
  vat: number;
  vats: {
    [key: string]: number; // key is country code in uppercase (e.g., 'BE', 'NL')
  };
} | null;

const defaultConfig: ConfigType = {
  baseUrl: "https://ottogusto.com",
  appName: "Otto Gusto",
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
    //eu: "Anywhere in the EU",
  },
  languages: {
    nl: "Nederlands",
    en: "English",
    fr: "Français",
  },
  defaults: {
    be: "nl",
    nl: "nl",
    fr: "fr",
    //  eu: "en",
  },
  supportCategories: [
    "Billing",
    "PartQuery",
    "OrderIssue",
    "Account",
    "Shipping",
    "Returns",
    "Complaints",
    "Other",
  ],
  numberOfFaq: 5,
  vat: 0,
  vats: {
    BE: 1.21,
    NL: 1.21,
    FR: 1.19,
    LU: 1.17,
  },
};

const ConfigContext = createContext<ConfigType>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ConfigType | null;
}) => {
  const params = useParams();
  //@ts-ignore
  const locale = params?.["language-country"]?.split("-")[1] || "NL";
  // Merge default vats with any vats provided in value
  const mergedValue: ConfigType = value
    ? {
        ...defaultConfig,
        ...value,
        vat: value?.vats?.[locale] || 0,
        // vats: {
        //   ...defaultConfig?.vats || {},
        //   ...(value?.vats || {}),
        // }
      }
    : defaultConfig;

  return <ConfigContext.Provider value={mergedValue}>{children}</ConfigContext.Provider>;
};
