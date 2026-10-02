// store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { IManufacturer } from "./useFilter";

interface ManufacturerState {
  manufacturerdata: IManufacturer[] | null;
  setmanufacturerdata: (data: IManufacturer[] | null) => void;
}

export const useManufacturerStore = create<ManufacturerState>()(
  persist(
    (set) => ({
      manufacturerdata: null,
      setmanufacturerdata: (data: IManufacturer[] | null) => set({ manufacturerdata: data }),
    }),
    {
      name: "manufcaturer-data", // key in localStorage
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
