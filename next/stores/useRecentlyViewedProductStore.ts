import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { CartItem } from "./useCartStore";

interface RecentlyViewedStore {
  recentlyViewed: CartItem[];
  addRecentlyViewedProduct: (product: CartItem) => void;
  removeRecentlyViewedProduct: (id: string) => void;
  clearRecentlyViewedProducts: () => void;
}

export const useRecentlyViewedProductStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewedProduct: (product) =>
        set((state) => {
          // Remove if already exists to move it to the top
          const filtered = state.recentlyViewed.filter((item) => item.id !== product.id);
          // Add to the beginning and limit to 10 items
          return {
            recentlyViewed: [product, ...filtered].slice(0, 10),
          };
        }),
      removeRecentlyViewedProduct: (id) =>
        set((state) => ({
          recentlyViewed: state.recentlyViewed.filter((item) => item.id !== id),
        })),
      clearRecentlyViewedProducts: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "recently-viewed-storage",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Tracks whether the persisted store has finished rehydrating from
 * localStorage. Rehydration is async, so callers that conditionally render
 * based on `recentlyViewed` should reserve a loading placeholder until this
 * is true instead of rendering nothing (which pops in as a layout shift once
 * hydration resolves for returning visitors who do have saved items).
 */
export function useRecentlyViewedHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useRecentlyViewedProductStore.persist.hasHydrated(),
  );

  useEffect(() => {
    setHydrated(useRecentlyViewedProductStore.persist.hasHydrated());
    return useRecentlyViewedProductStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
