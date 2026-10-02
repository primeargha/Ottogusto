import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface OgSearchTabState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useOgSearchTabStore = create<OgSearchTabState>((set) => ({
  activeTab: useAuthStore.getState().isAuthenticated ? "saved" : "car",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
