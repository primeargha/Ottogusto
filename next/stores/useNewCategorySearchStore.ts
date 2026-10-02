import { BRANDS_SLIDER_ACTIVE_BRAND_ID } from "@/constants";
import { string } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { PartsCategoryInterface } from "./useAdvancedSearchStore";
import {
  extractLevelIDFromCategoryId,
  getTypeFromCategoryId,
  groupBy,
  updateCategoryList,
} from "@/helpers/UtilityHelper";
import { useFetchCategories } from "@/hooks/appHooks";
import { use } from "react";
import { getCategories, getCategoryByIdNested } from "@/services/advancedSearchService";

export interface NewCategorySearchInterface {
  L1CatExpanded?: string | null;
  setL1CatExpanded: (data: any) => void;
  setL1CatExpandedWithoutToggle: (data: any) => void;
  clearL1CatExpanded: () => void;

  L2CatExpanded?: string | null;
  setL2CatExpanded: (data: any) => void;
  clearL2CatExpanded: () => void;

  clearExpandedCategories: () => void;
}

export const useNewCategorySearchStore = create<NewCategorySearchInterface>()(
  persist(
    (set, get) => ({
      L1CatExpanded: null,
      setL1CatExpanded(data) {
        const { L1CatExpanded } = get();
        set({ L1CatExpanded: data == L1CatExpanded ? null : data });
      },
      setL1CatExpandedWithoutToggle(data) {
        const { L1CatExpanded } = get();
        set({ L1CatExpanded: data });
      },
      clearL1CatExpanded: () => {
        set({ L1CatExpanded: null });
      },

      L2CatExpanded: null,
      setL2CatExpanded(data) {
        const { L2CatExpanded } = get();
        set({ L2CatExpanded: data == L2CatExpanded ? null : data });
      },
      clearL2CatExpanded: () => {
        set({ L2CatExpanded: null });
      },
      clearExpandedCategories: () => {
        set({ L1CatExpanded: null, L2CatExpanded: null });
      },
    }),
    {
      name: "new-category-search-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
