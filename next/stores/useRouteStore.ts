import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface RouteState {
  navigationHistory: string[];
  appendToNavigationHistory: (url: string) => void;
}

type RouteStorePersist = (
  config: StateCreator<RouteState>,
  options: PersistOptions<RouteState>,
) => StateCreator<RouteState>;

/**
 * Zustand store for managing route navigation history in a Next.js application.
 *
 * @remarks
 * This store uses Zustand with persistence to keep track of the user's navigation history.
 * The history is stored in an array, with the most recent route at the beginning.
 * Only the latest 6 routes (including the current one) are kept in the history.
 *
 * @example
 * // Append a new route to the navigation history
 * useRouteStore.getState().appendToNavigationHistory('/about');
 *
 * @property {string[]} navigationHistory - Array of route paths, with the most recent first.
 * @method appendToNavigationHistory - Adds a new route to the navigation history, maintaining a maximum of 6 entries.
 */
export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      navigationHistory: ["/??"],
      appendToNavigationHistory: (url: string) => {
        set((state) => ({
          navigationHistory: [url, ...state.navigationHistory.slice(0, 5)],
        }));
      },
    }),
    {
      name: "route-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
