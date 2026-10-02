import { describe, expect, it } from "vitest";
import {
  carIdsForE2EPersistence,
  carIdsForPersistence,
  isE2EMakeModelOnlyResolvedLength,
  primaryCarId,
  urlCarIdsForApply,
  urlCarIdsForE2EApply,
} from "./newMmeCarApply";

describe("newMmeCarApply", () => {
  it("carIdsForPersistence returns full array on add", () => {
    expect(carIdsForPersistence(["a", "b", "c"], false)).toEqual(["a", "b", "c"]);
  });

  it("carIdsForPersistence returns only primary on edit", () => {
    expect(carIdsForPersistence(["a", "b", "c"], true)).toEqual(["a"]);
  });

  it("urlCarIdsForApply returns only primary on add", () => {
    expect(urlCarIdsForApply(["a", "b", "c"], false)).toEqual(["a"]);
  });

  it("urlCarIdsForApply returns only primary on edit", () => {
    expect(urlCarIdsForApply(["a", "b", "c"], true)).toEqual(["a"]);
  });

  it("carIdsForE2EPersistence always returns only primary", () => {
    expect(carIdsForE2EPersistence(["a", "b", "c"])).toEqual(["a"]);
    expect(carIdsForE2EPersistence(["solo"])).toEqual(["solo"]);
    expect(carIdsForE2EPersistence([])).toEqual([]);
  });

  it("urlCarIdsForE2EApply returns up to 5 ids", () => {
    expect(urlCarIdsForE2EApply(["a", "b", "c"])).toEqual(["a", "b", "c"]);
    expect(urlCarIdsForE2EApply(["1", "2", "3", "4", "5", "6"])).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("primaryCarId", () => {
    expect(primaryCarId(["x", "y"])).toBe("x");
    expect(primaryCarId([])).toBe("");
  });

  it("isE2EMakeModelOnlyResolvedLength is true only for 2–5", () => {
    expect(isE2EMakeModelOnlyResolvedLength(["a"])).toBe(false);
    expect(isE2EMakeModelOnlyResolvedLength(["a", "b"])).toBe(true);
    expect(isE2EMakeModelOnlyResolvedLength(["1", "2", "3", "4", "5"])).toBe(true);
    expect(isE2EMakeModelOnlyResolvedLength(["1", "2", "3", "4", "5", "6"])).toBe(false);
  });
});
