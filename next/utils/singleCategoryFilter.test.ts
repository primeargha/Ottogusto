import { describe, expect, it } from "vitest";
import {
  isCategoryRowBold,
  isOtherCategoryId,
  parseSingleCategoryId,
  resolveCategorySelection,
  shouldExpandL1,
  shouldShowL3Children,
} from "./singleCategoryFilter";
import type { PartsCategoryInterface } from "@/types/categories";

const tree: PartsCategoryInterface[] = [
  {
    id: "001",
    parentId: "root",
    name: "ENGINE",
    titles: { en: "Engine" },
    children: [
      {
        id: "001001",
        parentId: "001",
        name: "FILTERS",
        titles: { en: "Filters" },
        children: [
          { id: "001001001", parentId: "001001", name: "OIL", titles: { en: "Oil filter" } },
          { id: "001001002", parentId: "001001", name: "AIR", titles: { en: "Air filter" } },
        ],
      },
      { id: "001002", parentId: "001", name: "IGNITION", titles: { en: "Ignition" } },
    ],
  },
  { id: "002", parentId: "root", name: "TRANSMISSION", titles: { en: "Transmission" } },
];

describe("parseSingleCategoryId", () => {
  it("returns null for empty", () => {
    expect(parseSingleCategoryId(null)).toBeNull();
    expect(parseSingleCategoryId("")).toBeNull();
  });

  it("returns first id from comma list", () => {
    expect(parseSingleCategoryId("001,002")).toBe("001");
  });
});

describe("resolveCategorySelection", () => {
  it("resolves L2 selection", () => {
    const sel = resolveCategorySelection(tree, "001001");
    expect(sel?.level).toBe(2);
    expect(sel?.l1Id).toBe("001");
    expect(sel?.l2Id).toBe("001001");
  });
});

describe("isCategoryRowBold", () => {
  it("L1 selected: L1 and all L2s bold", () => {
    const sel = resolveCategorySelection(tree, "001")!;
    expect(isCategoryRowBold(1, "001", sel)).toBe(true);
    expect(isCategoryRowBold(2, "001001", sel)).toBe(true);
    expect(isCategoryRowBold(2, "001002", sel)).toBe(true);
    expect(isCategoryRowBold(3, "001001001", sel)).toBe(false);
  });

  it("L2 selected: only that L2 bold among L2s; all L3s bold", () => {
    const sel = resolveCategorySelection(tree, "001001")!;
    expect(isCategoryRowBold(1, "001", sel)).toBe(true);
    expect(isCategoryRowBold(2, "001001", sel)).toBe(true);
    expect(isCategoryRowBold(2, "001002", sel)).toBe(false);
    expect(isCategoryRowBold(3, "001001001", sel)).toBe(true);
    expect(isCategoryRowBold(3, "001001002", sel)).toBe(true);
  });

  it("L3 selected: path bold, sibling L3 normal", () => {
    const sel = resolveCategorySelection(tree, "001001002")!;
    expect(isCategoryRowBold(3, "001001002", sel)).toBe(true);
    expect(isCategoryRowBold(3, "001001001", sel)).toBe(false);
  });
});

describe("expansion helpers", () => {
  it("expands L1 when selected", () => {
    const sel = resolveCategorySelection(tree, "001");
    expect(shouldExpandL1("001", sel)).toBe(true);
    expect(shouldExpandL1("002", sel)).toBe(false);
  });

  it("shows L3s when L2 selected", () => {
    const sel = resolveCategorySelection(tree, "001001");
    expect(shouldShowL3Children("001001", sel)).toBe(true);
    expect(shouldShowL3Children("001002", sel)).toBe(false);
  });
});

describe("isOtherCategoryId", () => {
  it("matches Other L1 id only", () => {
    expect(isOtherCategoryId("000000000")).toBe(true);
    expect(isOtherCategoryId("001")).toBe(false);
    expect(isOtherCategoryId(null)).toBe(false);
  });
});
