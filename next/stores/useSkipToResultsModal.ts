import { create } from "zustand";

interface SkipToResultsModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useSkipToResultsModal = create<SkipToResultsModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
