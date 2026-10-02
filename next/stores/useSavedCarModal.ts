import { create } from "zustand";

interface SavedCarModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useSavedCarModal = create<SavedCarModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
