import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import type { GarageItem } from "@/type";

interface SelectedCarState {
  selectedCar: GarageItem | null;
  setSelectedCar: (car: GarageItem | null) => void;
  editcarId: string | null;
  setEditCarId: (id: string | null) => void;
}

export const useSelectedCarStore = create<SelectedCarState>()(
  persist(
    (set) => ({
      selectedCar: null,
      setSelectedCar: (car: GarageItem | null) => set({ selectedCar: car }),
      editcarId: null,
      setEditCarId: (id: string | null) => set({ editcarId: id }),
    }),
    {
      name: "selected-car-storage", // unique name for localStorage key
      storage: createSafeJSONStorage(() => localStorage),
      // Optional: you can specify which parts of the state to persist
      partialize: (state) => ({ selectedCar: state.selectedCar }),
    },
  ),
);
