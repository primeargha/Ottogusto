import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface OERefStoreInterface {
  isOERefSearchOpen: boolean;
  openOERefSearch: () => void;
  closeOERefSearch: () => void;
}

export const useOERefStore = create<OERefStoreInterface>()(
  persist(
    (set, get) => ({
      isOERefSearchOpen: false,
      openOERefSearch: () => set({ isOERefSearchOpen: true }),
      closeOERefSearch: () => {
        set({ isOERefSearchOpen: false });
      },
    }),
    {
      name: "oe-ref-search-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
