import { create } from "zustand";

interface OESearchState {
  searchValue: string;
  isInputFilled: boolean;
  setSearchValue: (value: string) => void;
  setIsInputFilled: (state: boolean) => void;
  resetOESearch: () => void;
}

export const useOESearchStore = create<OESearchState>((set) => ({
  searchValue: "",
  isInputFilled: false,
  setSearchValue: (value) => set({ searchValue: value, isInputFilled: !!value }),
  setIsInputFilled: (state) => set({ isInputFilled: state }),
  resetOESearch: () => set({ searchValue: "", isInputFilled: false }),
}));
