import { create } from "zustand";
import { useAuthStore } from "@/stores/useAuthStore";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { clearGuestEditingSearchedCarIdOnAddEntry } from "@/utils/searchedCarIdsSession";

/** `heroSave` = hero Edit + Save CTA. `findCarParts` = add/select/SRP edit + Find car parts CTA. */
export type RightSidebarIntent = "findCarParts" | "heroSave";

type HeroEditParams = {
  /** Cars API id used for GET /Cars/{id} prefill and guest session replace on Save. */
  carsApiId: string;
  /** Logged-in Garage record id (`id`) for POST /Garage edit `{ id, carId }`. */
  myCarRecordId?: string | null;
};

type ListingEditParams = {
  /** Cars API id to prefill when editing from SRP banner (Find car parts apply, not Save). */
  carsApiId: string;
  /** Logged-in Garage record id for POST /Garage update on Find car parts apply. */
  myCarRecordId?: string | null;
};

interface RightSidebarStore {
  showRightSidebar: boolean;
  sidebarIntent: RightSidebarIntent;
  /** When true, ignore URL/session prefill and show empty MME (Add new car / hero Other Car). */
  forceEmptySidebar: boolean;
  editingCarsApiId: string | null;
  editingMyCarRecordId: string | null;
  listingPrefillCarsApiId: string | null;
  /**
   * E2E VIN Case 1: bootstrap Make/Model from VIN (POST /Cars {vin} or GET /Cars/{id} fallback)
   * without edit/replace semantics. Cleared on hide / add panel open.
   */
  vinPrefillCarsApiId: string | null;
  hideRightSidebar: () => void;
  /** Default open (header / empty homepage car box). Keeps typed VIN (shared with homepage). */
  showRightSidebarPanel: () => void;
  /**
   * Banner “Add new car” / hero “Other car” — empty sidebar: no URL carIds/VIN hydrate.
   * Clears VIN field + suppresses URL→VIN re-fill while open (Edit restores from URL).
   */
  showRightSidebarForNewCar: () => void;
  showRightSidebarForHeroEdit: (params: HeroEditParams) => void;
  showRightSidebarForListingEdit: (params: ListingEditParams) => void;
  /** After successful GET /Vin/{vin} — open sidebar and prefill from carIds[0]. */
  showRightSidebarForVinPrefill: (carsApiId: string) => void;
}

const clearEditState = {
  editingCarsApiId: null as string | null,
  editingMyCarRecordId: null as string | null,
  listingPrefillCarsApiId: null as string | null,
  vinPrefillCarsApiId: null as string | null,
};

const closeSidebarState = {
  showRightSidebar: false,
  sidebarIntent: "findCarParts" as const,
  forceEmptySidebar: false,
  ...clearEditState,
};

export const useRightSidebarStore = create<RightSidebarStore>((set) => ({
  showRightSidebar: false,
  sidebarIntent: "findCarParts",
  forceEmptySidebar: false,
  ...clearEditState,

  hideRightSidebar: () => set(closeSidebarState),

  showRightSidebarPanel: () => {
    clearGuestEditingSearchedCarIdOnAddEntry(useAuthStore.getState().isAuthenticated);
    set({
      showRightSidebar: true,
      sidebarIntent: "findCarParts",
      forceEmptySidebar: false,
      ...clearEditState,
    });
  },

  showRightSidebarForNewCar: () => {
    clearGuestEditingSearchedCarIdOnAddEntry(useAuthStore.getState().isAuthenticated);
    // Empty add: do not carry page `?vin=` into the sidebar (Edit-only hydrates from URL).
    useE2EVinSearchStore.getState().clearVinForVehicleSearchEdit();
    set({
      showRightSidebar: true,
      sidebarIntent: "findCarParts",
      forceEmptySidebar: true,
      ...clearEditState,
    });
  },

  showRightSidebarForHeroEdit: ({ carsApiId, myCarRecordId }) => {
    // Edit may show URL VIN again (clears suppress from a prior Add new car).
    useE2EVinSearchStore.getState().setVinUrlHydrationSuppressed(false);
    set({
      showRightSidebar: true,
      sidebarIntent: "heroSave",
      forceEmptySidebar: false,
      editingCarsApiId: carsApiId?.trim() || null,
      editingMyCarRecordId: myCarRecordId?.trim() || null,
      listingPrefillCarsApiId: null,
      vinPrefillCarsApiId: null,
    });
  },

  showRightSidebarForListingEdit: ({ carsApiId, myCarRecordId }) => {
    useE2EVinSearchStore.getState().setVinUrlHydrationSuppressed(false);
    set({
      showRightSidebar: true,
      sidebarIntent: "findCarParts",
      forceEmptySidebar: false,
      editingCarsApiId: carsApiId?.trim() || null,
      editingMyCarRecordId: myCarRecordId?.trim() || null,
      listingPrefillCarsApiId: carsApiId?.trim() || null,
      vinPrefillCarsApiId: null,
    });
  },

  showRightSidebarForVinPrefill: (carsApiId) => {
    clearGuestEditingSearchedCarIdOnAddEntry(useAuthStore.getState().isAuthenticated);
    set({
      showRightSidebar: true,
      sidebarIntent: "findCarParts",
      forceEmptySidebar: false,
      editingCarsApiId: null,
      editingMyCarRecordId: null,
      listingPrefillCarsApiId: null,
      vinPrefillCarsApiId: carsApiId?.trim() || null,
    });
  },
}));
