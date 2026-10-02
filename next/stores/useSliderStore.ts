import { create } from "zustand";

export interface SavedCar {
  id?: string | null;
  name?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  modelId?: string | null;
  modelName?: string | null;
  typeId?: string | null;
  typeName?: string | null;
  year?: number | string | null;
  picture?: string | null;
  vin?: string | null;
  isFavorite?: boolean;
  isNew?: boolean;
}

interface SliderStore {
  mySavedCarsForSlider: SavedCar[];
  setMySavedCarsForSlider: (value: SavedCar[]) => void;
  resetMySavedCarsForSlider: () => void;
}

export const useSliderStore = create<SliderStore>((set) => ({
  mySavedCarsForSlider: [],
  setMySavedCarsForSlider: (value) => set({ mySavedCarsForSlider: value }),
  resetMySavedCarsForSlider: () => set({ mySavedCarsForSlider: [] }),
}));
