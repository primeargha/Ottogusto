import { create } from "zustand";

export type TabType = {
  id: string;
  label: string;
  icon: {
    active: string;
    inactive: string;
  };
  content: React.ReactNode;
};

interface TabsState {
  activeTab: string;
  tabs: TabType[];
  setActiveTab: (tabId: string) => void;
  setTabs: (tabs: TabType[]) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  activeTab: "",
  tabs: [],
  setActiveTab: (tabId) => set({ activeTab: tabId }),
  // Preserve current activeTab if it exists in the new tabs, otherwise default to first tab
  setTabs: (tabs) => {
    const currentActiveTab = get().activeTab;
    const tabExists = tabs.some((tab) => tab.id === currentActiveTab);
    set({
      tabs,
      activeTab: tabExists ? currentActiveTab : tabs[0]?.id || "",
    });
  },
}));
