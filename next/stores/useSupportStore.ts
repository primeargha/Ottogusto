import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface SupportFile {
  name: string;
  data: string;
  mimeType: string;
}

interface SupportSelectedItem {
  description: string | null;
  image: string | null;
  id: string | null;
  partId: string | null;
  name: string | null;
  price: number | null;
  reason: string;
  status: string;
  comment: string | null;
  images: SupportFile[];
}

interface SupportPageStoreInterface {
  IBAN?: string;
  bankAccountName?: string;
  firstName: string;
  lastName: string;
  email: string;
  supportCategory?:
    | {
        label?: string | undefined;
        value?: string | undefined;
        id?: string | undefined;
      }
    | undefined;
  orderReturns: string | { label: string; value: string } | undefined;
  vin: string;
  invoiceNumber: string;
  comments: string;
  files: SupportFile[];
  selectedItems: SupportSelectedItem[];
  saveCurrentFormState: (currentFormValues: Partial<SupportPageStoreInterface>) => void;
  getSavedFormData: () => SupportPageStoreInterface;
  resetCurrentFormState: () => void;
}

export const useSupportStore = create<SupportPageStoreInterface>()(
  persist(
    (set, get) => ({
      IBAN: "",
      bankAccountName: "",
      firstName: "",
      lastName: "",
      email: "",
      supportCategory: undefined,
      orderReturns: "",
      vin: "",
      invoiceNumber: "",
      comments: "",
      files: [],
      selectedItems: [],
      resetCurrentFormState: () => {
        set({
          IBAN: "",
          bankAccountName: "",
          firstName: "",
          lastName: "",
          email: "",
          supportCategory: undefined,
          orderReturns: "",
          vin: "",
          invoiceNumber: "",
          comments: "",
          files: [],
          selectedItems: [],
        });
      },
      saveCurrentFormState: (currentFormData: Partial<SupportPageStoreInterface>) => {
        const {
          IBAN = "",
          bankAccountName = "",
          firstName = "",
          lastName = "",
          email = "",
          orderReturns = "",
          vin = "",
          invoiceNumber = "",
          comments = "",
          files = [],
          selectedItems = [],
        } = currentFormData;

        set({
          IBAN,
          bankAccountName,
          firstName,
          lastName,
          email,

          orderReturns,
          vin,
          invoiceNumber,
          comments,
          files,
          selectedItems,
        });
      },
      getSavedFormData: () => {
        return get();
      },
    }),
    {
      name: "support-page-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
