import { create } from "zustand";

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  body: string;
  variant: "confirm" | "report";
  yesCallback: (() => void) | null;
  noCallback: (() => void) | null;
  openConfirmation: (
    title: string,
    body: string,
    variant: "confirm" | "report",
    yesCallback: () => void,
    noCallback?: () => void,
    cancelButtonTxt?: string,
    confirmButtonTxt?: string,
  ) => void;
  closeConfirmation: () => void;
  cancelButtonTxt: string;
  confirmButtonTxt: string;
  confirm: () => void;
  cancel: () => void;
}

export const useConfirmationStore = create<ConfirmationState>((set, get) => ({
  isOpen: false,
  title: "",
  body: "",
  variant: "confirm",
  yesCallback: null,
  noCallback: null,
  openConfirmation: (
    title,
    body,
    variant = "confirm",
    yesCallback,
    noCallback,
    cancelButtonTxt,
    confirmButtonTxt,
  ) =>
    set({
      isOpen: true,
      title,
      body,
      yesCallback,
      noCallback: noCallback || null,
      cancelButtonTxt: cancelButtonTxt || "Cancel",
      confirmButtonTxt: confirmButtonTxt || "Confirm",
      variant,
    }),
  closeConfirmation: () =>
    set({
      isOpen: false,
      title: "",
      body: "",
      yesCallback: null,
      noCallback: null,
      cancelButtonTxt: "Cancel",
      confirmButtonTxt: "Confirm",
      variant: "confirm",
    }),
  confirm: () => {
    const { yesCallback, closeConfirmation } = get();
    if (yesCallback) {
      yesCallback();
    }
    closeConfirmation();
  },
  cancel: () => {
    const { noCallback, closeConfirmation } = get();
    if (noCallback) {
      noCallback();
    }
    closeConfirmation();
  },
  cancelButtonTxt: "Cancel",
  confirmButtonTxt: "Confirm",
}));
