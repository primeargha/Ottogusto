import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  partid: string;
  setPartid: (partid: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  partid: "",
  setPartid: (partid) => set({ partid: partid }),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
