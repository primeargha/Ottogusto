import { create } from "zustand";
import type { CarsFiltersResponse } from "@/services/cars";

export type NewMmeField =
  | "make"
  | "model"
  | "variant"
  | "body"
  | "engine"
  | "gearBox"
  | "engineCode"
  | "gearBoxCode";

export interface NewMmeOption {
  key: string;
  value: string;
}

export interface NewMmeSelectedState {
  make: string | null;
  model: string | null;
  variant: string | null;
  body: string | null;
  engine: string | null;
  gearBox: string | null;
  engineCode: string | null;
  gearBoxCode: string | null;
}

export interface NewMmeOptionsState {
  makes: NewMmeOption[];
  models: NewMmeOption[];
  variants: NewMmeOption[];
  bodys: NewMmeOption[];
  engines: NewMmeOption[];
  gearBoxes: NewMmeOption[];
  engineCodes: NewMmeOption[];
  gearBoxCodes: NewMmeOption[];
}

interface NewMmeStoreState {
  selected: NewMmeSelectedState;
  options: NewMmeOptionsState;
  carIds: string[];
  hasCarIdsProperty: boolean;
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelected: (payload: Partial<NewMmeSelectedState>) => void;
  reset: () => void;
  applyFiltersResponse: (response: CarsFiltersResponse) => void;
}

const emptySelectedState: NewMmeSelectedState = {
  make: null,
  model: null,
  variant: null,
  body: null,
  engine: null,
  gearBox: null,
  engineCode: null,
  gearBoxCode: null,
};

const emptyOptionsState: NewMmeOptionsState = {
  makes: [],
  models: [],
  variants: [],
  bodys: [],
  engines: [],
  gearBoxes: [],
  engineCodes: [],
  gearBoxCodes: [],
};

const mapDictionaryToOptions = (dictionary?: Record<string, string>): NewMmeOption[] => {
  if (!dictionary || typeof dictionary !== "object") {
    return [];
  }

  return Object.entries(dictionary).map(([key, value]) => ({
    key,
    value: value ?? key,
  }));
};

export const useNewMmeStore = create<NewMmeStoreState>()((set) => ({
  selected: emptySelectedState,
  options: emptyOptionsState,
  carIds: [],
  hasCarIdsProperty: false,
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelected: (payload) =>
    set((state) => ({
      selected: {
        ...state.selected,
        ...payload,
      },
    })),

  reset: () =>
    set({
      selected: emptySelectedState,
      options: emptyOptionsState,
      carIds: [],
      hasCarIdsProperty: false,
      isLoading: false,
      error: null,
    }),

  applyFiltersResponse: (response) =>
    set((state) => ({
      options: {
        makes: mapDictionaryToOptions(response.makes),
        models: mapDictionaryToOptions(response.models),
        variants: mapDictionaryToOptions(response.variants),
        bodys: mapDictionaryToOptions(response.bodys),
        engines: mapDictionaryToOptions(response.engines),
        gearBoxes: mapDictionaryToOptions(response.gearBoxes),
        engineCodes: mapDictionaryToOptions(response.engineCodes),
        gearBoxCodes: mapDictionaryToOptions(response.gearBoxCodes),
      },
      carIds: Array.isArray(response.carIds) ? response.carIds : state.carIds,
      hasCarIdsProperty: Object.prototype.hasOwnProperty.call(response, "carIds"),
      selected: {
        ...state.selected,
        make: response.make ?? state.selected.make,
        model: response.model ?? state.selected.model,
        variant: response.variant ?? state.selected.variant,
        body: response.body ?? state.selected.body,
        engine: response.engine ?? state.selected.engine,
        gearBox: response.gearBox ?? state.selected.gearBox,
        engineCode: response.engineCode ?? state.selected.engineCode,
        gearBoxCode: response.gearBoxCode ?? state.selected.gearBoxCode,
      },
    })),
}));
