import { describe, expect, it } from "vitest";
import {
  asNavigationCategory,
  mergeCategoryWithDetail,
  normalizeCategoryDetailResponse,
  normalizeCategoryListResponse,
} from "@/lib/category-api-normalize";
import type { CategoryNode } from "@/types/categories";

const listNodeWithSeo: CategoryNode = {
  id: "001",
  parentId: "root",
  name: "ENGINE",
  displayOrder: 1,
  titles: { en: "Engine" },
  slugs: { en: "engine" },
  descriptions: { en: "LIST short — must not leak" },
  fullDescriptions: { en: "LIST long — must not leak" },
  faq: [{ id: "f1", order: 1, lang: "en", question: "List Q?", answer: "List A" }],
  children: [
    {
      id: "001001",
      parentId: "001",
      name: "FILTERS",
      displayOrder: 1,
      titles: { en: "Filters" },
      slugs: { en: "filters" },
      descriptions: { en: "child list desc" },
      children: [],
    },
  ],
};

describe("normalizeCategoryListResponse", () => {
  it("strips descriptions, fullDescriptions, and faq from list nodes and children", () => {
    const nodes = normalizeCategoryListResponse([listNodeWithSeo]);
    expect(nodes).toHaveLength(1);
    const node = nodes[0]!;
    const child = node.children![0]!;
    expect(node.descriptions).toBeUndefined();
    expect(node.fullDescriptions).toBeUndefined();
    expect(node.faq).toBeUndefined();
    expect(node.titles).toEqual({ en: "Engine" });
    expect(node.slugs).toEqual({ en: "engine" });
    expect(child.descriptions).toBeUndefined();
    expect(child.titles).toEqual({ en: "Filters" });
  });

  it("unwraps { data: [...] } payloads", () => {
    const nodes = normalizeCategoryListResponse({ data: [listNodeWithSeo] });
    const node = nodes[0]!;
    expect(node.id).toBe("001");
    expect(node.faq).toBeUndefined();
  });
});

describe("normalizeCategoryDetailResponse", () => {
  it("keeps SEO fields on detail payloads", () => {
    const detail = normalizeCategoryDetailResponse({
      id: "001",
      parentId: "root",
      name: "ENGINE",
      displayOrder: 1,
      titles: { en: "Engine" },
      slugs: { en: "engine" },
      descriptions: { en: "Detail short" },
      fullDescriptions: { en: "Detail long" },
      faq: [{ id: "f1", order: 1, lang: "en", question: "Q?", answer: "A" }],
      children: [],
    });
    expect(detail?.descriptions).toEqual({ en: "Detail short" });
    expect(detail?.fullDescriptions).toEqual({ en: "Detail long" });
    expect(detail?.faq).toHaveLength(1);
  });
});

describe("mergeCategoryWithDetail", () => {
  it("applies SEO fields only from detail, never from navigation list data", () => {
    const merged = mergeCategoryWithDetail(listNodeWithSeo, {
      id: "001",
      parentId: "root",
      name: "ENGINE",
      displayOrder: 1,
      titles: { en: "Engine" },
      slugs: { en: "engine" },
      descriptions: { en: "Detail short" },
      fullDescriptions: { en: "Detail long" },
      faq: [{ id: "d1", order: 1, lang: "en", question: "Detail Q?", answer: "Detail A" }],
      children: [],
    });

    expect(merged.descriptions).toEqual({ en: "Detail short" });
    expect(merged.fullDescriptions).toEqual({ en: "Detail long" });
    expect(merged.faq![0]!.question).toBe("Detail Q?");
    // Tree children preserved from navigation, not wiped by detail.children: []
    expect(merged.children).toHaveLength(1);
    const child = merged.children![0]!;
    expect(child.id).toBe("001001");
    expect(child.descriptions).toBeUndefined();
  });

  it("returns navigation without SEO fields when detail is null", () => {
    const merged = mergeCategoryWithDetail(listNodeWithSeo, null);
    expect(merged.descriptions).toBeUndefined();
    expect(merged.fullDescriptions).toBeUndefined();
    expect(merged.faq).toBeUndefined();
    expect(merged.titles).toEqual({ en: "Engine" });
  });
});

describe("asNavigationCategory", () => {
  it("strips SEO fields defensively", () => {
    const nav = asNavigationCategory(listNodeWithSeo);
    expect(nav.descriptions).toBeUndefined();
    expect(nav.faq).toBeUndefined();
  });
});
