import { create } from "zustand";

interface ConfirmDuplicateCarState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  errorMessage: string | null;
  setErrorMessage: (errorMessage: string | null) => void;
}

export const useConfirmDuplicateCarStore = create<ConfirmDuplicateCarState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  errorMessage: null,
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
}));
