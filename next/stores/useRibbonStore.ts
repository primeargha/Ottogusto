import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface RibbonStore {
  showRibbon: boolean;
  hideRibbon: () => void;
  resetRibbon: () => void;
}

const RIBBON_STORAGE_KEY = "ribbon-session-storage";

export const useRibbonStore = create<RibbonStore>()(
  persist(
    (set) => ({
      showRibbon: true, // Show ribbon on first load of session

      hideRibbon: () => set({ showRibbon: false }),

      resetRibbon: () => set({ showRibbon: true }),
    }),
    {
      name: RIBBON_STORAGE_KEY, // Session storage key
      storage: createSafeJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
    },
  ),
);

/**
 * Synchronously reads the persisted `showRibbon` value straight from
 * sessionStorage (same key/shape the `persist` middleware above uses).
 * `HeaderRowSkeleton` uses this so it reserves the same ribbon height the
 * real `HeaderRow` will render on its first client paint, instead of always
 * assuming the ribbon is visible — for returning visitors who dismissed it,
 * assuming "visible" caused a layout collapse once the real header mounted.
 */
export function getPersistedShowRibbon(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.sessionStorage.getItem(RIBBON_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    const value = parsed?.state?.showRibbon;
    return typeof value === "boolean" ? value : true;
  } catch {
    return true;
  }
}
