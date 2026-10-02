import { DEFAULT_LOCALE, LOCALEs_LIST } from "@/constants";

import type { MakeModelTypeBrandItem } from "@/type";
import { getBrandsWithCarImage } from "@/services/landingPageDataService";
import { getBrands } from "@/services/search";
import { getImageUrl } from "@/utils/imageUtils";
import { number } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface BrandInterface {
  id: string;
  brand: string;
  sortIdx: number;
  icon: string;
}

interface LandingPageDataStore {
  ShowLanguageSelector: boolean;
  openLanguageSelector: () => void;
  closeLanguageSelector: (local?: string) => void;
  getLanguageCountryString: () => string;
  getLanguageCountryStringHeader: () => string;
  getFlag: () => string;
  locale: string;
  setLocale: (localeString: string) => void;
  isValidLocale: () => boolean; // ✅ ADD THIS
  previousSearchActiveIndex: number;
  setPreviousSearchActiveIndex: (index: number) => void;
  getCountryLanguageLabel: () => string;
  brandsList: BrandInterface[] | null;
  fetchBrands: () => void;
  fetchBrandsData: () => void;
  refetchLocale?: () => void;

  isSearchDataNotFound: boolean;
  setIsSearchDataNotFound: (value: boolean) => void;
}

export const useLandingPageDataStore = create<LandingPageDataStore>()(
  persist(
    (set, get) => {
      return {
        ShowLanguageSelector: false,
        previousSearchActiveIndex: 0,

        openLanguageSelector: () => {
          set({ ShowLanguageSelector: true });
        },
        closeLanguageSelector: (localstring) => {
          if (localstring) {
            set({ ShowLanguageSelector: false, locale: localstring });
          } else {
            set({ ShowLanguageSelector: false });
          }
        },
        locale: DEFAULT_LOCALE,
        setLocale: (localeString) => set({ locale: localeString }),
        isValidLocale: () => {
          const { locale } = get();
          return LOCALEs_LIST.some((item) => item.locale.toLowerCase() === locale.toLowerCase());
        },
        getLanguageCountryString: () => {
          const { locale } = get();
          const currentLangSelection = LOCALEs_LIST.find((itm) => itm.locale == locale);
          return currentLangSelection?.title || `{Detected : ${locale}`;
        },
        getLanguageCountryStringHeader: () => {
          const { locale } = get();
          const currentLangSelection = LOCALEs_LIST.find((itm) => itm.locale == locale);
          return (currentLangSelection?.locale.split("-")[0] || ``).toUpperCase();
        },
        getCountryLanguageLabel: () => {
          const { locale } = get();

          const current = LOCALEs_LIST.find(
            (item) => item.locale.toLowerCase() === locale.toLowerCase(),
          );

          if (!current) return "";

          // Extract values
          const countryName = current.title.split(" - ")[1]?.split("(")[0]?.trim();
          const languageCode = current.locale.split("-")[0]?.toUpperCase();

          return `${countryName} (${languageCode}) `;
        },
        isSearchDataNotFound: false,
        setIsSearchDataNotFound: (value: boolean) => {
          set({ isSearchDataNotFound: value });
        },
        getFlag: () => {
          const { locale } = get();
          const currentLangSelection = LOCALEs_LIST.find((itm) => itm.locale == locale);
          const key = currentLangSelection?.country_code?.toLowerCase() || "";
          return `https://cdn.ottogusto.group/flags/${key}.svg`;
        },
        refetchLocale: () => {},
        brandsList: [],

        setPreviousSearchActiveIndex: (index: number) => {
          set({ previousSearchActiveIndex: index ?? number });
        },

        // ✅ Optimized: Uses cached getBrands() - won't make duplicate API calls
        fetchBrands: async () => {
          const { brandsList } = get();

          // ✅ Skip if brands are already loaded
          if (brandsList && brandsList.length > 0) {
            return;
          }

          const response = await getBrands(); // ✅ This is cached for 24 hours
          if (response && response.data && response.data.length > 0) {
            let results = response?.data?.map((brand: MakeModelTypeBrandItem) => ({
              id: brand.id,
              brand: brand.brand ?? "",
              sortIdx: brand.sortIdx,
              icon: getImageUrl(brand?.image),
            }));
            set({ brandsList: results });
          } else {
            set({ brandsList: [] });
          }
        },
        // ✅ Optimized: Uses cached getBrands() - won't make duplicate API calls
        fetchBrandsData: async () => {
          const { brandsList } = get();

          // ✅ Skip if brands are already loaded
          if (brandsList && brandsList.length > 0) {
            return;
          }

          const response = await getBrands(); // ✅ This is cached for 24 hours
          if (response && response.data && response.data.length > 0) {
            let results = response?.data?.map((brand: MakeModelTypeBrandItem) => ({
              id: brand.id,
              brand: brand.brand ?? "",
              sortIdx: brand.sortIdx,
              icon: getImageUrl(brand?.image),
            }));
            set({ brandsList: results });
          } else {
            set({ brandsList: [] });
          }
        },
      };
    },
    {
      name: "landing-page-data-storage",
      storage:
        typeof window !== "undefined" ? createSafeJSONStorage(() => localStorage) : undefined,
    },
  ),
);
