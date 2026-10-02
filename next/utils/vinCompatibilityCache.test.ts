import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendVinCompatCache,
  areAllPartsCached,
  clearVinCompatCache,
  getCachedPartStatus,
  getCachedVin,
  getUncachedPartIds,
  setVinCompatCache,
  VIN_COMPAT_CACHE_KEY,
} from "./vinCompatibilityCache";
import {
  buildVinCheckResultFromCache,
  formatCheckoutVinResponseToCache,
  formatPdpVinResponseToCache,
} from "./vinCheck";

function createLocalStorageMock() {
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
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe("vinCompatibilityCache", () => {
  beforeEach(() => {
    const localStorageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("window", { localStorage: localStorageMock });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and reads a single VIN entry", () => {
    setVinCompatCache("UU1DBG001NU059092", { m7o3ba8zhlugj0: "Yes" });
    expect(getCachedVin()).toBe("UU1DBG001NU059092");
    expect(getCachedPartStatus("UU1DBG001NU059092", "m7o3ba8zhlugj0")).toBe("Yes");
  });

  it("replaces cache when a new VIN is set", () => {
    setVinCompatCache("VIN_A", { part1: "Yes" });
    setVinCompatCache("VIN_B", { part2: "No" });
    expect(getCachedVin()).toBe("VIN_B");
    expect(getCachedPartStatus("VIN_A", "part1")).toBeNull();
    expect(getCachedPartStatus("VIN_B", "part2")).toBe("No");
  });

  it("appends parts under the same VIN", () => {
    setVinCompatCache("VIN_A", { part1: "Yes" });
    appendVinCompatCache("VIN_A", { part2: "Maybe" });
    expect(areAllPartsCached("VIN_A", ["part1", "part2"])).toBe(true);
    expect(getUncachedPartIds("VIN_A", ["part1", "part2", "part3"])).toEqual(["part3"]);
  });

  it("clearVinCompatCache removes storage", () => {
    setVinCompatCache("VIN_A", { part1: "Yes" });
    clearVinCompatCache();
    expect(getCachedVin()).toBeNull();
    expect(localStorage.getItem(VIN_COMPAT_CACHE_KEY)).toBeNull();
  });
});

describe("vinCheck cache formatters", () => {
  it("formatPdpVinResponseToCache maps parts", () => {
    const cache = formatPdpVinResponseToCache({
      parts: { m7o3ba8zhlugj0: "Yes", other: "No" },
    });
    expect(cache).toEqual({ m7o3ba8zhlugj0: "Yes", other: "No" });
  });

  it("formatCheckoutVinResponseToCache maps isMatch for requested ids", () => {
    const cache = formatCheckoutVinResponseToCache(
      [
        { id: "a", isMatch: "Yes" },
        { id: "b", isMatch: "No" },
      ],
      ["a", "b"],
    );
    expect(cache).toEqual({ a: "Yes", b: "No" });
  });

  it("buildVinCheckResultFromCache produces VinCheckResult", () => {
    const result = buildVinCheckResultFromCache("VIN1", ["a"], { a: "Yes" });
    expect(result.vin).toBe("VIN1");
    expect(result.items).toEqual([{ id: "a", isMatch: "FIT" }]);
  });
});
