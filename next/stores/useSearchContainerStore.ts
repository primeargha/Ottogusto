import { create } from "zustand";
import { useMmeStore } from "./useMmeStore";

type ViewType = "view1" | "view2";

interface SearchContainerStore {
  currentView: ViewType;
  userExplicitlyChoseView1: boolean; // Flag to track if user explicitly switched to view1
  setCurrentView: (view: ViewType) => void;
  switchToView1: () => void;
  switchToView2: () => void;
}

export const useSearchContainerStore = create<SearchContainerStore>((set) => ({
  currentView: "view1",
  userExplicitlyChoseView1: false,
  setCurrentView: (view: ViewType) => set({ currentView: view }),
  switchToView1: () => {
    // Clear MME search data when switching from VIEW 2 to VIEW 1 (NEW SEARCH)
    useMmeStore.getState().resetSearch();
    set({ currentView: "view1", userExplicitlyChoseView1: true }); // Mark as explicit user choice
  },
  switchToView2: () => set({ currentView: "view2", userExplicitlyChoseView1: false }), // Reset flag when switching to view2
}));
