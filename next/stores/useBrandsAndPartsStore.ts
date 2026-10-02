import { BRANDS_SLIDER_ACTIVE_BRAND_ID } from "@/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";

export interface BrandInterface {
  id: string;
  brand?: string;
  model?: string;
  type?: string;
  sortIdx: number;
  children?: {
    Id: string;
    Brand: string;
    SortIdx: number;
  }[];
}
interface BrandsAndPartsStoreInterface {
  brandsList: object[];
  updateBrandsList: (data: any) => void;
  activeBrandId: string;
  setActiveBrandId: (id: string) => void;
  activeBrand: BrandInterface | null;
  setActiveBrand: (brand: BrandInterface) => void;
  // isOERefSearchOpen: boolean;
  // openOERefSearch: () => void;
  // closeOERefSearch: () => void;
}

export const useBrandsAndPartsStore = create<BrandsAndPartsStoreInterface>()(
  persist(
    (set, get) => ({
      brandsList: [],
      updateBrandsList: (data: any) => {
        if (data.length > 0) {
          set({ brandsList: data, activeBrandId: data[0].id });
        }
      },
      activeBrandId: BRANDS_SLIDER_ACTIVE_BRAND_ID,
      setActiveBrandId: (id: string) => {
        set({ activeBrandId: id });
      },
      activeBrand: null,
      setActiveBrand: (brand: BrandInterface) => {
        set({
          activeBrand: brand,
          activeBrandId: brand.id,
        });
      },
    }),
    {
      name: "brands-and-parts-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
