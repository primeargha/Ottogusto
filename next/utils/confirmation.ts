import { useConfirmationStore } from "@/stores/useConfirmationStore";

/**
 * Utility function to trigger a confirmation dialog
 * @param title - The title of the confirmation dialog
 * @param body - The body text of the confirmation dialog
 * @param yesCallback - Callback function to execute when user confirms
 * @param noCallback - Optional callback function to execute when user cancels
 */
export const askConfirmation = (
  title: string,
  body: string,
  variant: "confirm" | "report",
  yesCallback: () => void,
  noCallback?: () => void,
  cancelButtonTxt?: string,
  confirmButtonTxt?: string,
) => {
  const { openConfirmation } = useConfirmationStore.getState();
  openConfirmation(
    title,
    body,
    variant,
    yesCallback,
    noCallback,
    cancelButtonTxt,
    confirmButtonTxt,
  );
};

/**
 * Hook to access confirmation store methods
 */
export const useConfirmation = () => {
  const store = useConfirmationStore();
  return {
    askConfirmation: (
      title: string,
      body: string,
      variant: "confirm" | "report",
      yesCallback: () => void,
      noCallback?: () => void,
      cancelButtonTxt?: string,
      confirmButtonTxt?: string,
    ) => {
      store.openConfirmation(
        title,
        body,
        variant,
        yesCallback,
        noCallback,
        cancelButtonTxt,
        confirmButtonTxt,
      );
    },
    closeConfirmation: store.closeConfirmation,
    isOpen: store.isOpen,
  };
};
