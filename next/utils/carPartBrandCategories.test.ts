import { describe, expect, it } from "vitest";
import {
  collectL3UnderL1,
  collectRelatedL3sUnderL1,
  findL3ByLocaleSlug,
  getCategoryLocaleSlug,
  sortCategoriesByDisplayOrder,
} from "./carPartBrandCategories";
import type { CategoryNode } from "@/types/categories";

const l1 = (partial: Partial<CategoryNode> & { id: string }): CategoryNode => {
  const node: CategoryNode = {
    id: partial.id,
    parentId: partial.parentId ?? "",
    name: partial.name || partial.id,
    displayOrder: partial.displayOrder ?? 0,
    titles: partial.titles || { en: partial.name || partial.id },
    slugs: partial.slugs || { en: partial.id },
  };
  if (partial.children) node.children = partial.children;
  if (partial.descriptions) node.descriptions = partial.descriptions;
  if (partial.fullDescriptions) node.fullDescriptions = partial.fullDescriptions;
  if (partial.faq) node.faq = partial.faq;
  return node;
};

describe("collectL3UnderL1", () => {
  it("flattens L3s under L2s and dedupes by id", () => {
    const tree = l1({
      id: "engine",
      children: [
        l1({
          id: "l2a",
          children: [l1({ id: "l3-a", name: "A" }), l1({ id: "l3-b", name: "B" })],
        }),
        l1({
          id: "l2b",
          children: [l1({ id: "l3-b", name: "B dup" }), l1({ id: "l3-c", name: "C" })],
        }),
      ],
    });

    expect(collectL3UnderL1(tree).map((n) => n.id)).toEqual(["l3-a", "l3-b", "l3-c"]);
  });
});

describe("getCategoryLocaleSlug", () => {
  it("prefers localized slug then falls back to slugify(name)", () => {
    expect(
      getCategoryLocaleSlug(
        l1({ id: "x", name: "Air Filter", slugs: { en: "air-filter", nl: "luchtfilter" } }),
        "nl",
      ),
    ).toBe("luchtfilter");
    expect(getCategoryLocaleSlug(l1({ id: "x", name: "Air Filter", slugs: {} }), "en")).toBe(
      "air-filter",
    );
  });
});

describe("sortCategoriesByDisplayOrder", () => {
  it("sorts ascending by displayOrder", () => {
    const sorted = sortCategoriesByDisplayOrder([
      l1({ id: "b", displayOrder: 2 }),
      l1({ id: "a", displayOrder: 1 }),
    ]);
    expect(sorted.map((n) => n.id)).toEqual(["a", "b"]);
  });
});

describe("findL3ByLocaleSlug", () => {
  const tree = [
    l1({
      id: "l1",
      children: [
        l1({
          id: "l2",
          children: [
            l1({
              id: "l3-air",
              name: "Air filter",
              slugs: { en: "air-filter", nl: "luchtfilter" },
            }),
          ],
        }),
      ],
    }),
  ];

  it("matches localized backend slug", () => {
    expect(findL3ByLocaleSlug(tree, "luchtfilter", "nl")?.l3.id).toBe("l3-air");
    expect(findL3ByLocaleSlug(tree, "air-filter", "en")?.l3.id).toBe("l3-air");
  });

  it("returns null when missing", () => {
    expect(findL3ByLocaleSlug(tree, "unknown", "en")).toBeNull();
  });
});

describe("collectRelatedL3sUnderL1", () => {
  it("excludes current L3 and respects limit", () => {
    const parent = l1({
      id: "engine",
      children: [
        l1({
          id: "l2",
          children: [
            l1({ id: "a", name: "A" }),
            l1({ id: "b", name: "B" }),
            l1({ id: "c", name: "C" }),
          ],
        }),
      ],
    });
    expect(collectRelatedL3sUnderL1(parent, "b", 1).map((n) => n.id)).toEqual(["a"]);
  });
});
