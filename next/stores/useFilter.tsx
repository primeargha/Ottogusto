import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

export interface IManufacturer {
  id: string;
  name: string;
  type: "OEM" | string;
}

interface FilterModalState {
  isOpen: boolean;
  order: "ASC" | "DESC" | "priority";
  type: "OEM" | "AMS" | "OES";
  minPrice: number | null;
  maxPrice: number | null;
  defaultPriceRange: {
    min: number;
    max: number;
  };

  openModal: () => void;
  closeModal: () => void;
  setOrder: (order: "ASC" | "DESC" | "priority") => void;
  setType: (type: "OEM" | "AMS" | "OES") => void;
  setMinPrice: (minPrice: number | null) => void;
  setMaxPrice: (maxPrice: number | null) => void;
  setDefaultPriceRange: (min: number, max: number) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterModalState>()(
  persist(
    (set) => ({
      isOpen: false,
      order: "priority",
      type: "OEM",
      minPrice: null,
      maxPrice: null,
      defaultPriceRange: {
        min: 0,
        max: 50000,
      },

      openModal: () => set({ isOpen: true }),
      closeModal: () => set({ isOpen: false }),
      setOrder: (order) => set({ order }),
      setType: (type) => set({ type }),
      setMinPrice: (minPrice) =>
        set((state) => {
          // Only allow null or valid numbers
          const validPrice =
            minPrice === null || (typeof minPrice === "number" && !isNaN(minPrice))
              ? minPrice
              : null;
          if (state.minPrice === validPrice) return state;

          return { minPrice: validPrice };
        }),
      setMaxPrice: (maxPrice) =>
        set((state) => {
          // Only allow null or valid numbers
          const validPrice =
            maxPrice === null || (typeof maxPrice === "number" && !isNaN(maxPrice))
              ? maxPrice
              : null;
          if (state.maxPrice === validPrice) return state;

          return { maxPrice: validPrice };
        }),
      setDefaultPriceRange: (min, max) =>
        set((state) => {
          // Validate input values and use defaults if invalid
          const validMin = typeof min === "number" && !isNaN(min) ? min : 0;
          const validMax = typeof max === "number" && !isNaN(max) ? max : 5000;

          // Ensure min is not greater than max
          const finalMin = Math.min(validMin, validMax);
          const finalMax = Math.max(validMin, validMax);

          if (state.defaultPriceRange.min === finalMin && state.defaultPriceRange.max === finalMax)
            return state;

          return { defaultPriceRange: { min: finalMin, max: finalMax } };
        }),

      reset: () =>
        set({
          order: "priority",
          minPrice: null,
          maxPrice: null,
          defaultPriceRange: {
            min: 0,
            max: 50000,
          },
        }),
    }),
    {
      name: "filter-store",
      storage: createSafeJSONStorage(() => localStorage),
      partialize: (state) => ({
        order: state.order,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        defaultPriceRange: state.defaultPriceRange,
      }),
    },
  ),
);
