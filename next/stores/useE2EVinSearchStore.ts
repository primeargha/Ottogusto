import { create } from "zustand";

/**
 * Shared VIN field for E2E flow (`end_to_end_vin_flow_feature_flag`).
 * Homepage + New sidebar/drawer read/write the same value.
 * Validation / API errors are shown under VIN in the sidebar only — never on the homepage search box.
 */
type E2EVinSearchState = {
  vinNumber: string;
  setVinNumber: (vin: string) => void;
  /** Sidebar/drawer-only error under the VIN input. */
  sidebarVinError: string | null;
  setSidebarVinError: (error: string | null) => void;
  /**
   * GET /Vin returned 406 (brand not supported) — show support form instead of MME.
   * Cleared when VIN changes, Reset, or a non-406 outcome.
   */
  sidebarVinBrandUnsupported: boolean;
  setSidebarVinBrandUnsupported: (value: boolean) => void;
  /**
   * carIds from last successful GET /Vin/{vin} (Case 1).
   * Used to disable CTA when length > 5 while Make+Model still prefills from [0].
   */
  vinResolvedCarIds: string[];
  setVinResolvedCarIds: (ids: string[]) => void;
  clearVinResolvedCarIds: () => void;
  /**
   * When true, `useE2EVinUrlSync` must not re-fill VIN from `?vin=` —
   * user switched to search-by-car by editing Make/Model/… while URL still has vin
   * (URL updates only on Find car parts click).
   */
  vinUrlHydrationSuppressed: boolean;
  /** Clear VIN UI + suppress URL re-hydration (MME field change / vehicle-search path). */
  clearVinForVehicleSearchEdit: () => void;
  setVinUrlHydrationSuppressed: (suppressed: boolean) => void;
  /**
   * Bumped when GET /Vin fails Case 2 style (empty `cars`, 400/406/500).
   * Sidebar listens and clears Make→Gearbox dropdowns (`handleReset`).
   */
  mmeClearOnVinFailureNonce: number;
  requestMmeClearOnVinFailure: () => void;
};

function sameIdList(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}

export const useE2EVinSearchStore = create<E2EVinSearchState>((set) => ({
  vinNumber: "",
  setVinNumber: (vinNumber) =>
    set((state) => {
      if (state.vinNumber === vinNumber) {
        // Still clear hydration suppress when user types a non-empty VIN.
        if (vinNumber.trim() && state.vinUrlHydrationSuppressed) {
          return { vinUrlHydrationSuppressed: false };
        }
        return state;
      }
      return {
        vinNumber,
        vinUrlHydrationSuppressed: vinNumber.trim() ? false : state.vinUrlHydrationSuppressed,
      };
    }),
  sidebarVinError: null,
  setSidebarVinError: (sidebarVinError) =>
    set((state) => (state.sidebarVinError === sidebarVinError ? state : { sidebarVinError })),
  sidebarVinBrandUnsupported: false,
  setSidebarVinBrandUnsupported: (sidebarVinBrandUnsupported) =>
    set((state) =>
      state.sidebarVinBrandUnsupported === sidebarVinBrandUnsupported
        ? state
        : { sidebarVinBrandUnsupported },
    ),
  vinResolvedCarIds: [],
  setVinResolvedCarIds: (vinResolvedCarIds) =>
    set((state) =>
      sameIdList(state.vinResolvedCarIds, vinResolvedCarIds) ? state : { vinResolvedCarIds },
    ),
  clearVinResolvedCarIds: () =>
    set((state) => (state.vinResolvedCarIds.length === 0 ? state : { vinResolvedCarIds: [] })),
  vinUrlHydrationSuppressed: false,
  clearVinForVehicleSearchEdit: () =>
    set((state) => {
      if (
        !state.vinNumber &&
        state.sidebarVinError == null &&
        !state.sidebarVinBrandUnsupported &&
        state.vinResolvedCarIds.length === 0 &&
        state.vinUrlHydrationSuppressed
      ) {
        return state;
      }
      return {
        vinNumber: "",
        sidebarVinError: null,
        sidebarVinBrandUnsupported: false,
        vinResolvedCarIds: [],
        vinUrlHydrationSuppressed: true,
      };
    }),
  setVinUrlHydrationSuppressed: (vinUrlHydrationSuppressed) =>
    set((state) =>
      state.vinUrlHydrationSuppressed === vinUrlHydrationSuppressed
        ? state
        : { vinUrlHydrationSuppressed },
    ),
  mmeClearOnVinFailureNonce: 0,
  requestMmeClearOnVinFailure: () =>
    set((state) => ({ mmeClearOnVinFailureNonce: state.mmeClearOnVinFailureNonce + 1 })),
}));
