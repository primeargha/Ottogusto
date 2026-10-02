import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

export interface FaqQuestionAnswerNodeInterface {
  question: string;
  answer: string;
  isExpanded?: boolean;
}

export interface FaqCategoryNodeInterface {
  category: string;
  questions: FaqQuestionAnswerNodeInterface[];
}
interface FAQStoreInterface {
  TotalFAQCategories: number;
  TotalQustionsInEachCategory: number;
  SelectedFAQCategory: FaqCategoryNodeInterface;
  changeFaqSelectedCategory: (category: FaqCategoryNodeInterface) => void;
}

export const useFAQStore = create<FAQStoreInterface>()(
  persist(
    (set, get) => ({
      TotalFAQCategories: 5,
      TotalQustionsInEachCategory: 5,
      SelectedFAQCategory: {
        category: "",
        questions: [],
      },
      changeFaqSelectedCategory: (category: FaqCategoryNodeInterface) => {
        set({ SelectedFAQCategory: category });
      },
    }),
    {
      name: "faq-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
