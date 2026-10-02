import { create } from "zustand";

/**
 * When true, missing `availability` in the URL means the user cleared all options on this mount
 * (POST null). When false, missing param means use DEFAULT_AVAILABILITY_FILTER_KEYS.
 * Not persisted — full page reload resets to false.
 */
interface AvailabilityUrlIntentState {
  absentAvailabilityMeansNull: boolean;
  setAbsentAvailabilityMeansNull: (value: boolean) => void;
}

export const useAvailabilityUrlIntentStore = create<AvailabilityUrlIntentState>()((set) => ({
  absentAvailabilityMeansNull: false,
  setAbsentAvailabilityMeansNull: (value) => set({ absentAvailabilityMeansNull: value }),
}));
