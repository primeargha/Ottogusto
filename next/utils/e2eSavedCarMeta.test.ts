import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/theme-utils", () => ({
  getClientFeatureFlag: (flag: string) => flag === "new_mme_feature_flag",
}));

import {
  clearE2ESavedCarMeta,
  E2E_GARAGE_MAKE_MODEL_ONLY_NAME,
  E2E_SAVED_CAR_META_KEY,
  encodeGarageMakeModelOnlyName,
  getE2ESavedCarSiblingCarIds,
  getE2ESavedCarVin,
  isE2EGarageMakeModelOnlyName,
  isE2ESavedCarMakeModelOnly,
  parseGarageMakeModelOnlyCarIds,
  resolveUrlCarIdsForSavedCar,
  setE2ESavedCarVin,
  syncE2ESavedCarMakeModelOnlyMeta,
  transferE2ESavedCarMeta,
} from "@/utils/e2eSavedCarMeta";
import { pushSearchedCarIds, setSearchedCarVin } from "@/utils/searchedCarIdsSession";

const SAMPLE_VIN = "VF7SABHY6GW595849";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  };
}

describe("e2eSavedCarMeta", () => {
  beforeEach(() => {
    const session = createMemoryStorage();
    const local = createMemoryStorage();
    vi.stubGlobal("localStorage", local);
    vi.stubGlobal("sessionStorage", session);
    vi.stubGlobal("window", { sessionStorage: session, localStorage: local });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks makeModelOnly for resolved length 2–5", () => {
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0", "id1", "id2"]);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(true);
    expect(sessionStorage.getItem(E2E_SAVED_CAR_META_KEY)).toContain("makeModelOnly");
  });

  it("stores siblingCarIds for resolved length 2–5", () => {
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0", "id1", "id2"]);
    expect(getE2ESavedCarSiblingCarIds("id0")).toEqual(["id0", "id1", "id2"]);
    expect(resolveUrlCarIdsForSavedCar("id0")).toEqual(["id0", "id1", "id2"]);
  });

  it("clears makeModelOnly and siblings when resolved length is 1 but keeps vin", () => {
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0", "id1"]);
    setE2ESavedCarVin("id0", SAMPLE_VIN);
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0"]);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(false);
    expect(getE2ESavedCarSiblingCarIds("id0")).toBeNull();
    expect(getE2ESavedCarVin("id0")).toBe(SAMPLE_VIN);
    expect(resolveUrlCarIdsForSavedCar("id0")).toEqual(["id0"]);
  });

  it("clears entire entry when makeModelOnly cleared and no vin", () => {
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0", "id1"]);
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0"]);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(false);
    expect(sessionStorage.getItem(E2E_SAVED_CAR_META_KEY)).toBe("{}");
  });

  it("stores and clears vin without wiping makeModelOnly or siblings", () => {
    syncE2ESavedCarMakeModelOnlyMeta("id0", ["id0", "id1"]);
    setE2ESavedCarVin("id0", SAMPLE_VIN);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(true);
    expect(getE2ESavedCarSiblingCarIds("id0")).toEqual(["id0", "id1"]);
    expect(getE2ESavedCarVin("id0")).toBe(SAMPLE_VIN);

    setE2ESavedCarVin("id0", null);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(true);
    expect(getE2ESavedCarSiblingCarIds("id0")).toEqual(["id0", "id1"]);
    expect(getE2ESavedCarVin("id0")).toBeNull();
  });

  it("rejects invalid vin", () => {
    setE2ESavedCarVin("id0", "SHORT");
    expect(getE2ESavedCarVin("id0")).toBeNull();
  });

  it("transfers meta including vin and siblings on edit replace", () => {
    syncE2ESavedCarMakeModelOnlyMeta("old", ["old", "b"]);
    setE2ESavedCarVin("old", SAMPLE_VIN);
    transferE2ESavedCarMeta("old", "new");
    expect(isE2ESavedCarMakeModelOnly("old")).toBe(false);
    expect(getE2ESavedCarVin("old")).toBeNull();
    expect(isE2ESavedCarMakeModelOnly("new")).toBe(true);
    expect(getE2ESavedCarVin("new")).toBe(SAMPLE_VIN);
    expect(getE2ESavedCarSiblingCarIds("new")).toEqual(["new", "b"]);
  });

  it("clear removes entry", () => {
    syncE2ESavedCarMakeModelOnlyMeta("x", ["x", "y"]);
    setE2ESavedCarVin("x", SAMPLE_VIN);
    clearE2ESavedCarMeta("x");
    expect(isE2ESavedCarMakeModelOnly("x")).toBe(false);
    expect(getE2ESavedCarVin("x")).toBeNull();
  });

  it("ignores empty ids", () => {
    syncE2ESavedCarMakeModelOnlyMeta("  ", ["a", "b"]);
    setE2ESavedCarVin("  ", SAMPLE_VIN);
    expect(sessionStorage.getItem(E2E_SAVED_CAR_META_KEY)).toBeNull();
  });

  it("migrates legacy localStorage meta into sessionStorage", () => {
    localStorage.setItem(
      E2E_SAVED_CAR_META_KEY,
      JSON.stringify({ id0: { vin: SAMPLE_VIN, makeModelOnly: true } }),
    );
    expect(getE2ESavedCarVin("id0")).toBe(SAMPLE_VIN);
    expect(isE2ESavedCarMakeModelOnly("id0")).toBe(true);
    expect(sessionStorage.getItem(E2E_SAVED_CAR_META_KEY)).toContain(SAMPLE_VIN);
    expect(localStorage.getItem(E2E_SAVED_CAR_META_KEY)).toBeNull();
  });

  it("keeps vin in sessionStorage when localStorage is cleared (login/logout split)", () => {
    setE2ESavedCarVin("id0", SAMPLE_VIN);
    localStorage.clear();
    expect(getE2ESavedCarVin("id0")).toBe(SAMPLE_VIN);
  });

  it("getE2ESavedCarVin prefers vin on the session car object", () => {
    pushSearchedCarIds(["id0"]);
    setSearchedCarVin("id0", SAMPLE_VIN);
    // Meta empty / different — car object wins.
    expect(getE2ESavedCarVin("id0")).toBe(SAMPLE_VIN);
  });
});

describe("Garage makeModelOnly name encode/decode", () => {
  it("encodes full id list for 2–5", () => {
    expect(encodeGarageMakeModelOnlyName(["a", "b", "c"])).toBe(
      `${E2E_GARAGE_MAKE_MODEL_ONLY_NAME}:a,b,c`,
    );
  });

  it("falls back to flag-only for single id", () => {
    expect(encodeGarageMakeModelOnlyName(["a"])).toBe(E2E_GARAGE_MAKE_MODEL_ONLY_NAME);
  });

  it("detects legacy and encoded names", () => {
    expect(isE2EGarageMakeModelOnlyName("makeModelOnly")).toBe(true);
    expect(isE2EGarageMakeModelOnlyName("makeModelOnly:a,b")).toBe(true);
    expect(isE2EGarageMakeModelOnlyName("My Car")).toBe(false);
  });

  it("parses encoded siblings", () => {
    expect(parseGarageMakeModelOnlyCarIds("makeModelOnly:a,b,c")).toEqual(["a", "b", "c"]);
    expect(parseGarageMakeModelOnlyCarIds("makeModelOnly")).toBeNull();
  });
});
