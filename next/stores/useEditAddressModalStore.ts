import { Address } from "@/types/profile";
import { create } from "zustand";

interface EditAddressModalState {
  isOpen: boolean;
  modalType: "edit" | "add";
  modalSaveType: "Personal" | "Business" | null;
  openedFrom: "billing" | "delivery" | null; // Track which section opened the modal
  selectedAddress: Address | null; // Address object that is selected for editing
  hasDuplicateInSavedAddresses: boolean;
  setHasDuplicateInSavedAddresses: (value: boolean) => void;
  justSelectedDuplicateForCheckout: boolean;
  setJustSelectedDuplicateForCheckout: (value: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  setModalType: (type: "edit" | "add") => void;
  setSelectedAddress: (address: Address | null) => void; // Function to set the selected address
  setModalSaveType: (type: "Personal" | "Business" | null) => void;
  setOpenedFrom: (from: "billing" | "delivery" | null) => void;
}

export const useEditAddressModalStore = create<EditAddressModalState>((set) => ({
  isOpen: false,
  modalType: "add",
  selectedAddress: null,
  openedFrom: null,
  hasDuplicateInSavedAddresses: false,
  justSelectedDuplicateForCheckout: false,
  openModal: () => set({ isOpen: true, justSelectedDuplicateForCheckout: false }),
  closeModal: () =>
    set({
      isOpen: false,
      selectedAddress: null,
      modalType: "add",
      modalSaveType: null,
      openedFrom: null,
      // Do NOT reset justSelectedDuplicateForCheckout – checkout close effect clears it
    }),
  setModalType: (type: "edit" | "add") => set({ modalType: type }),
  setSelectedAddress: (address: Address | null) => set({ selectedAddress: address }),
  modalSaveType: null,
  setModalSaveType: (type: "Personal" | "Business" | null) => set({ modalSaveType: type }),
  setOpenedFrom: (from: "billing" | "delivery" | null) => set({ openedFrom: from }),
  setHasDuplicateInSavedAddresses: (value: boolean) => set({ hasDuplicateInSavedAddresses: value }),
  setJustSelectedDuplicateForCheckout: (value: boolean) =>
    set({ justSelectedDuplicateForCheckout: value }),
}));
