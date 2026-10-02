import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/theme-utils", () => ({
  getClientFeatureFlag: (flag: string) => flag === "new_mme_feature_flag",
}));
import {
  SEARCHED_CAR_EDITING_ID_SESSION_KEY,
  SEARCHED_CAR_IDS_SESSION_KEY,
  SEARCHED_CAR_SELECTION_CLEARED_KEY,
  clearGuestEditingSearchedCarIdOnAddEntry,
  clearGuestSelectionClearedFlag,
  ensureSearchedCarIds,
  getEditingSearchedCarId,
  getSearchedCarIds,
  getSearchedCarVin,
  getSearchedSessionCars,
  isGuestSelectionCleared,
  markGuestSelectionCleared,
  pushSearchedCarIds,
  replaceSearchedCarId,
  setSearchedCarVin,
  syncGuestSessionFromUrlCarIds,
} from "./searchedCarIdsSession";

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("searchedCarIdsSession", () => {
  let storage: ReturnType<typeof createSessionStorageMock>;

  beforeEach(() => {
    storage = createSessionStorageMock();
    vi.stubGlobal("sessionStorage", storage);
    vi.stubGlobal("window", { sessionStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pushSearchedCarIds prepends new ids", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b"]));
    pushSearchedCarIds(["c"]);
    expect(getSearchedCarIds()).toEqual(["c", "a", "b"]);
  });

  it("ensureSearchedCarIds appends missing ids without reordering", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b", "c"]));
    ensureSearchedCarIds(["c"]);
    expect(getSearchedCarIds()).toEqual(["a", "b", "c"]);
  });

  it("ensureSearchedCarIds does not move existing id to front on selection", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b", "c"]));
    ensureSearchedCarIds(["c"]);
    expect(getSearchedCarIds()).toEqual(["a", "b", "c"]);
  });

  it("ensureSearchedCarIds appends unknown url id at end", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b"]));
    ensureSearchedCarIds(["z"]);
    expect(getSearchedCarIds()).toEqual(["a", "b", "z"]);
  });

  it("clearGuestEditingSearchedCarIdOnAddEntry clears for guest only", () => {
    storage.setItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY, "mod-edit-id");
    clearGuestEditingSearchedCarIdOnAddEntry(false);
    expect(getEditingSearchedCarId()).toBeNull();

    storage.setItem(SEARCHED_CAR_EDITING_ID_SESSION_KEY, "mod-edit-id");
    clearGuestEditingSearchedCarIdOnAddEntry(true);
    expect(getEditingSearchedCarId()).toBe("mod-edit-id");
  });

  it("markGuestSelectionCleared keeps history and blocks until cleared", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b"]));
    markGuestSelectionCleared();
    expect(isGuestSelectionCleared()).toBe(true);
    expect(getSearchedCarIds()).toEqual(["a", "b"]);
    expect(storage.getItem(SEARCHED_CAR_SELECTION_CLEARED_KEY)).toBe("1");

    clearGuestSelectionClearedFlag();
    expect(isGuestSelectionCleared()).toBe(false);
  });

  it("pushSearchedCarIds clears guest selection-cleared flag", () => {
    markGuestSelectionCleared();
    pushSearchedCarIds(["c"]);
    expect(isGuestSelectionCleared()).toBe(false);
    expect(getSearchedCarIds()).toEqual(["c"]);
  });

  it("ensureSearchedCarIds clears guest selection-cleared flag even when id exists", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b"]));
    markGuestSelectionCleared();
    ensureSearchedCarIds(["a"]);
    expect(isGuestSelectionCleared()).toBe(false);
    expect(getSearchedCarIds()).toEqual(["a", "b"]);
  });

  it("syncGuestSessionFromUrlCarIds legacy ensures all URL ids", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a"]));
    syncGuestSessionFromUrlCarIds(["a", "b"]);
    expect(getSearchedCarIds()).toEqual(["a", "b"]);
  });

  it("syncGuestSessionFromUrlCarIds e2e keeps only primary and prunes siblings", () => {
    storage.setItem(
      SEARCHED_CAR_IDS_SESSION_KEY,
      JSON.stringify(["mod903f5dtxndl", "mod903hx8qgcy3"]),
    );
    syncGuestSessionFromUrlCarIds(["mod903f5dtxndl", "mod903hx8qgcy3"], {
      e2eSingleSave: true,
    });
    expect(getSearchedCarIds()).toEqual(["mod903f5dtxndl"]);
  });

  it("syncGuestSessionFromUrlCarIds e2e appends primary only when missing", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["other"]));
    syncGuestSessionFromUrlCarIds(["primary", "sibling"], { e2eSingleSave: true });
    expect(getSearchedCarIds()).toEqual(["other", "primary"]);
  });

  it("migrates legacy string ids to car objects", () => {
    storage.setItem(SEARCHED_CAR_IDS_SESSION_KEY, JSON.stringify(["a", "b"]));
    expect(getSearchedSessionCars()).toEqual([{ carId: "a" }, { carId: "b" }]);
    pushSearchedCarIds(["c"]);
    expect(JSON.parse(storage.getItem(SEARCHED_CAR_IDS_SESSION_KEY)!)).toEqual([
      { carId: "c" },
      { carId: "a" },
      { carId: "b" },
    ]);
  });

  it("setSearchedCarVin stores vin on the car object and push preserves it", () => {
    pushSearchedCarIds(["id0"]);
    setSearchedCarVin("id0", "VF7SABHY6GW595849");
    expect(getSearchedCarVin("id0")).toBe("VF7SABHY6GW595849");
    expect(getSearchedSessionCars()[0]).toEqual({
      carId: "id0",
      vin: "VF7SABHY6GW595849",
    });
    pushSearchedCarIds(["id0"]);
    expect(getSearchedCarVin("id0")).toBe("VF7SABHY6GW595849");
  });

  it("setSearchedCarVin null clears vin on the car object", () => {
    pushSearchedCarIds(["id0"]);
    setSearchedCarVin("id0", "VF7SABHY6GW595849");
    setSearchedCarVin("id0", null);
    expect(getSearchedCarVin("id0")).toBeNull();
    expect(getSearchedSessionCars()[0]).toEqual({ carId: "id0" });
  });

  it("replaceSearchedCarId moves vin from old id to new id", () => {
    pushSearchedCarIds(["old"]);
    setSearchedCarVin("old", "VF7SABHY6GW595849");
    replaceSearchedCarId("old", "new");
    expect(getSearchedCarIds()).toEqual(["new"]);
    expect(getSearchedCarVin("old")).toBeNull();
    expect(getSearchedCarVin("new")).toBe("VF7SABHY6GW595849");
  });
});
