import { create } from "zustand";

/** Selected hero slider Cars API id — shared with homepage category browse links. */
interface LandingHeroCarStore {
  selectedCarsApiId: string | null;
  setSelectedCarsApiId: (id: string | null) => void;
}

export const useLandingHeroCarStore = create<LandingHeroCarStore>((set) => ({
  selectedCarsApiId: null,
  setSelectedCarsApiId: (id) => set({ selectedCarsApiId: id?.trim() || null }),
}));
