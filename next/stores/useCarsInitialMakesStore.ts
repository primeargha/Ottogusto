import { create } from "zustand";
import { emptyPayload } from "@/lib/newMmeFilters";
import { postCarsFilters, type CarsFiltersResponse } from "@/services/cars";

type CarsInitialMakesStatus = "idle" | "loading" | "ready" | "error";

interface CarsInitialMakesStore {
  /** Full POST /Cars response for empty payload — session-scoped (cleared on full page reload). */
  response: CarsFiltersResponse | null;
  status: CarsInitialMakesStatus;
  error: string | null;
  inFlight: Promise<CarsFiltersResponse> | null;
  /** Fetch initial makes once per session; dedupes concurrent callers. */
  ensureInitialMakes: () => Promise<CarsFiltersResponse>;
}

export const useCarsInitialMakesStore = create<CarsInitialMakesStore>()((set, get) => ({
  response: null,
  status: "idle",
  error: null,
  inFlight: null,

  ensureInitialMakes: async () => {
    const { response, inFlight } = get();
    if (response) return response;
    if (inFlight) return inFlight;

    const promise = (async () => {
      set({ status: "loading", error: null });
      try {
        const { data } = await postCarsFilters(emptyPayload);
        set({ response: data, status: "ready", inFlight: null, error: null });
        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load car makes";
        set({ status: "error", error: message, inFlight: null });
        throw err;
      }
    })();

    set({ inFlight: promise });
    return promise;
  },
}));
