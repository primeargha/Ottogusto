import { BRANDS_SLIDER_ACTIVE_BRAND_ID } from "@/constants";
import { string } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import type { PartsCategoryInterface } from "@/types/categories";
// Lazy import to avoid circular dependency: useCategorySearchStore → UtilityHelper → advancedSearchService → config/api → stores → useCategorySearchStore
const getLevelIDFromCategoryId = (id: string, level: number) =>
  require("@/helpers/UtilityHelper").extractLevelIDFromCategoryId(id, level);
const getTypefromCategoryId = (id: string) =>
  require("@/helpers/UtilityHelper").getTypeFromCategoryId(id);
const groupByHelper = (items: any[], key: string | number) =>
  require("@/helpers/UtilityHelper").groupBy(items, key);
const updateCategoryListLazy = (
  ...args: Parameters<(typeof import("@/helpers/UtilityHelper"))["updateCategoryList"]>
) =>
  (
    require("@/helpers/UtilityHelper")
      .updateCategoryList as (typeof import("@/helpers/UtilityHelper"))["updateCategoryList"]
  )(...args);

export interface CategorySearchInterface {
  nestedMasterCategoryList: PartsCategoryInterface[];
  setNestedCategoryData: (data: PartsCategoryInterface[]) => void;
  getTitleStringCategoryID: () => string | undefined;
  SelectedCategories: PartsCategoryInterface[];
  SelectedCategoriesId: string[];
  setSelectedCategories: (data: PartsCategoryInterface[]) => void;
  clearSelectedCategories: () => void;
  inSelectedCategories: (id: string) => boolean;
  appendToSelectedCategories: (data: PartsCategoryInterface) => void;
  removeFromSelectedCategories: (id: string) => void;
  inFilteredList: (id: string) => boolean;
  ifPartialSelected: (id: string) => boolean;
  // isFetchingData: boolean;
  // setIsFetchingData: (data: boolean) => void;
}

export const useCategorySearchStore = create<CategorySearchInterface>()(
  persist(
    (set, get) => ({
      nestedMasterCategoryList: [],
      setNestedCategoryData: (data: PartsCategoryInterface[]) => {
        set({ nestedMasterCategoryList: data });
      },
      SelectedCategories: [],
      SelectedCategoriesId: [],
      setSelectedCategories: (data: PartsCategoryInterface[]) => {
        set({ SelectedCategories: data, SelectedCategoriesId: data?.map((n) => n.id) });
      },
      clearSelectedCategories: () => {
        set({ SelectedCategories: [], SelectedCategoriesId: [] });
      },
      inSelectedCategories: (id: string) => {
        const selected = get().SelectedCategories;
        const isInSelected = selected.find((item) => item.id === id);
        return !!isInSelected;
      },
      appendToSelectedCategories: async (data: PartsCategoryInterface) => {
        const { SelectedCategories, nestedMasterCategoryList } = get();
        const currentID: string = data?.id;
        const currentParentID: string = data?.parentId;

        const ls = await updateCategoryListLazy(
          SelectedCategories,
          currentID,
          currentParentID,
          data,
          nestedMasterCategoryList,
        );
        // debugger;
        set({
          SelectedCategories: ls,
          SelectedCategoriesId: ls?.map((node) => node.id),
        });
        return;
      },
      removeFromSelectedCategories: (id: string) => {
        const { SelectedCategories } = get();
        const listAfterRemoval = SelectedCategories.filter((node, index) => {
          return node.id !== id;
        });
        set({
          SelectedCategories: listAfterRemoval,
          SelectedCategoriesId: listAfterRemoval?.map((node) => node.id),
        });
      },
      inFilteredList: (id: string) => {
        const { SelectedCategories } = get();
        return SelectedCategories.some((node) => node.id === id);
      },
      ifPartialSelected: (id: string) => {
        const { SelectedCategories } = get();
        let result = SelectedCategories.some(
          (itm: { id: string; name: string; parentId: string }) => {
            let isL3 = false;
            let isL2 = false;
            let isL1 = false;

            const L1Id = itm.id.slice(0, 3);
            const L2Id = itm.id.slice(3, 6);
            const L3Id = itm.id.slice(6, 9);

            if (id.length === 9) {
              isL3 = true;
              return L1Id + L2Id + L3Id === id;
            }
            if (id.length === 6) {
              isL2 = true;
              return L1Id + L2Id === id;
            }
            if (id.length === 3) {
              isL1 = true;
              return L1Id === id;
            }
            // return id === L1Id || id === L2Id || id === L3Id;
          },
        );
        return result;
        // return SelectedCategories.some((node: any) => node.parentId === id);
      },
      getTitleStringCategoryID: () => {
        const { SelectedCategories } = get();
        let L1Ids: string[] = [];
        let L2Ids: string[] = [];
        let L3Ids: string[] = [];
        SelectedCategories?.map((item) => {
          const L1Id = item.id.slice(0, 3);
          const L2Id = item.id.slice(3, 6);
          const L3Id = item.id.slice(6, 9);

          if (L1Ids.indexOf(L1Id) === -1) {
            L1Ids.push(L1Id);
          }
          if (L2Ids.indexOf(L2Id) === -1) {
            L2Ids.push(L2Id);
          }
          if (L3Ids.indexOf(L3Id) === -1) {
            L3Ids.push(L3Id);
          }
        });

        if (L3Ids.length === 1) {
          return `${L1Ids[0]}${L2Ids[0]}${L3Ids[0]}`;
          // return useFetchCategories(L3Ids[0]).data;
        }

        if (L2Ids.length === 1) {
          return `${L1Ids[0]}${L2Ids[0]}`;
          // return useFetchCategories(L2Ids[0]).data;
        }

        if (L1Ids.length === 1) {
          return `${L1Ids[0]}`;
          // return useFetchCategories(L1Ids[0]).data;
        }
      },
    }),
    {
      name: "category-search-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
