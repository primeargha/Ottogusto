import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

interface OrderStore {
  orderId: string; // Fixed casing to be consistent
  setOrderId: (id: string) => void;
  resetOrder: () => void;
}

export const useOrderStore = create<OrderStore>()(
  // Fixed store name from useCartStore
  persist(
    (set) => ({
      orderId: "", // Fixed casing
      setOrderId: (id: string) => set({ orderId: id }), // Fixed casing
      resetOrder: () => set({ orderId: "" }), // Fixed casing
    }),
    {
      name: "order-storage", // Changed storage name to match order context
      storage: createSafeJSONStorage(() => sessionStorage),
    },
  ),
);
