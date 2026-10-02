import { categoryIcons } from "@/constants";
import { getCategories } from "@/services/advancedSearchService";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { number } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
// Lazy accessor to avoid circular dependency: useAdvancedSearchStore ↔ useSearchModalStore
const getSearchModalStore = () => require("./useSearchModalStore").useSearchModalStore;

import type { PartsCategoryInterface } from "@/types/categories";
export type { PartsCategoryInterface } from "@/types/categories";
interface FilteredItemsInterface {
  id: string;
  name: string;
  parentId: string;
  titles: [];
}

interface AdvancedSearchStore {
  isFetchingData: boolean;
  isAdvSearchOpen: boolean;
  openVia: string | null;
  step: number;
  selectedCategories: any;

  L1Categories: PartsCategoryInterface[];
  L2Categories: PartsCategoryInterface[];
  L3Categories: PartsCategoryInterface[];

  categories: PartsCategoryInterface[];
  subcategories: PartsCategoryInterface[];
  selectedSubCategories: PartsCategoryInterface[] | [];
  subCatgoriesOfSelectedCategory: PartsCategoryInterface[] | [];

  filteredList: FilteredItemsInterface[] | [];
  inFilteredList: (id: string) => boolean;
  ifPartialSelected: (id: string) => boolean;
  clearFilteredList: () => void;
  appendToFilteredList: (data: any, ifAdd: boolean) => void;
  addToPreviousSearchesFromAdvSearch: (
    data: PartsCategoryInterface[] | FilteredItemsInterface[] | [],
  ) => void;

  setSubCatgoriesOfSelectedCategory: (data: any) => void;
  setSelectedCategories: (data: any) => void;
  cleanSelectededCategories: () => void;
  setSubCategory: (data: any) => void;

  gotoStep: (step: number) => void;
  openAdvSearch: (via?: string) => void;
  closeAdvSearch: (callback?: any) => void;
  fetchL1Categories: () => void;
  fetchCategoriesOf: (parentCategoryId: string) => void;
  setL1CategoriesFromNested: (nestedData: PartsCategoryInterface[]) => void;
  setOpenVia: (via?: string) => void;
}

export const useAdvancedSearchStore = create<AdvancedSearchStore>()(
  persist(
    (set, get) => ({
      isFetchingData: false,
      isAdvSearchOpen: false,
      openVia: null,
      step: 0,

      L1Categories: [],
      L2Categories: [],
      L3Categories: [],

      categories: [],
      selectedCategories: [],
      subcategories: [],
      selectedSubCategories: [],
      subCatgoriesOfSelectedCategory: [],

      filteredList: [],
      setOpenVia: (via?: string) => {
        set({ openVia: (via as string) || null });
      },
      inFilteredList: (id: string) => {
        const { filteredList } = get();
        return filteredList.some((node: any) => node.id === id);
      },
      ifPartialSelected: (id: string) => {
        const { filteredList } = get();
        let result = filteredList.some((itm: { id: string; name: string; parentId: string }) => {
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
        });
        return result;
        // return SelectedCategories.some((node: any) => node.parentId === id);
      },

      clearFilteredList: () => {
        set({ filteredList: [] });
      },
      appendToFilteredList: (data: FilteredItemsInterface, ifAdd: boolean) => {
        const { filteredList } = get();

        // If adding the item, remove its children first
        const afterChildRemoval = filteredList.filter((itm) => itm.parentId !== data.id);

        if (ifAdd) {
          // If the item already exists in the list, we don't need to add it again
          const exists = filteredList.some((itm) => itm.id === data.id);
          if (!exists) {
            set({ filteredList: [...afterChildRemoval, data] });
          }
        } else {
          // Remove the item if it exists
          const filteredListWithoutItem = afterChildRemoval.filter((itm) => itm.id !== data.id);
          set({ filteredList: filteredListWithoutItem });
        }
      },
      addToPreviousSearchesFromAdvSearch: (data) => {
        const searchModalStore = getSearchModalStore().getState();

        const { selectedCategories } = get();
        // data is advance search data.
        if (searchModalStore.searchData?.make?.value && data?.length === 0) {
          searchModalStore.addToPreviousSearchesFromAdvSearchStore([]);
          return;
        }
        if (data.length === 0 && selectedCategories.length === 0) {
          return;
        }

        searchModalStore.addToPreviousSearchesFromAdvSearchStore([...data]);
      },

      setSubCatgoriesOfSelectedCategory: (data: any) => {
        // set({ subCatgoriesOfSelectedCategory: data });
      },
      cleanSelectededCategories: () => {
        set({ selectedCategories: [] });
      },
      setSelectedCategories: (data: any) => {
        const { fetchCategoriesOf } = get();
        set({ selectedCategories: [data] });
        fetchCategoriesOf(data?.id);
      },
      setSubCategory: (data: any) => {
        set({ selectedSubCategories: data });
      },
      openAdvSearch: (via) => {
        if (via) {
          set({ openVia: via, step: 1, isAdvSearchOpen: true, selectedCategories: [] });
        } else {
          set({ openVia: null, step: 1, isAdvSearchOpen: true, selectedCategories: [] });
        }
      },
      gotoStep: (stepCount: number) => {
        set({ step: stepCount });
        if (stepCount == 1) {
          set({ filteredList: [], subCatgoriesOfSelectedCategory: [] });
        }
      },
      closeAdvSearch: (callback) => {
        set({ isAdvSearchOpen: false, filteredList: [] });
        if (typeof callback === "function") {
          callback();
        }
      },
      setL1CategoriesFromNested: (nestedData: PartsCategoryInterface[]) => {
        if (!nestedData?.length) {
          set({ L1Categories: [] });
          return;
        }
        const results = nestedData.map((category) => ({
          id: category.id,
          parentId: category.parentId,
          name: category.name,
          displayOrder: (category as PartsCategoryInterface).displayOrder ?? 0,
          titles: category.titles,
          icon: getCategoryImageUrl(category.id),
        }));
        set({ L1Categories: results });
      },

      fetchL1Categories: async () => {
        const { step } = get();
        if (step > 1) return; // Early return if step is greater than 1

        set({ isFetchingData: true });

        try {
          const response = await getCategories();

          if (response && response.data?.length > 0) {
            const results = response.data?.map((category: any) => ({
              id: category.id,
              parentId: category.parentId,
              name: category.name,
              titles: category?.titles,
              icon: getCategoryImageUrl(category.id),
            }));

            set({
              L1Categories: results,
              isFetchingData: false,
            });
          } else {
            set({
              L1Categories: [],
              L2Categories: [],
              L3Categories: [],
              isFetchingData: false,
            });
          }
        } catch (error) {
          console.error("Failed to fetch categories:", error);
          set({
            L1Categories: [],
            L2Categories: [],
            L3Categories: [],
            isFetchingData: false,
          });
        }
      },

      fetchCategoriesOf: async (parentCategoryId: string | undefined) => {
        const { step, selectedCategories } = get();

        if (selectedCategories.length < 1) return; // Early return if no categories are selected

        set({ isFetchingData: true });

        try {
          const response = await getCategories(parentCategoryId);

          const categories = response?.data || []; // Default to an empty array if no data exists

          if (categories.length > 0) {
            const results: PartsCategoryInterface[] = categories?.map((subcategory: any) => ({
              id: subcategory.id,
              parentId: subcategory.parentId,
              name: subcategory.name,
              titles: subcategory?.titles,
              children: subcategory?.children,
            }));

            set({ L2Categories: results });
          } else {
            set({ L2Categories: [] });
          }
        } catch (error) {
          console.error("Failed to fetch categories:", error);
          set({ L2Categories: [] }); // In case of an error, reset the category list
        } finally {
          set({ isFetchingData: false });
        }
      },
    }),
    {
      name: "adv-search-modal-storage",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
