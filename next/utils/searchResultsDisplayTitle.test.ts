import { describe, expect, it } from "vitest";

import {
  buildLegacyMmeCarLabel,
  buildSearchResultsDisplayTitle,
  resolveCategoryDisplayName,
} from "./searchResultsDisplayTitle";

const getLabel = (key: string, replaceKeys?: Record<string, string>) => {
  const templates: Record<string, string> = {
    oe_ref_search_page_title: "OE Ref: [oeReference]",
    search_results_page_title_cat: "[parts] for [title]",
    search_results_page_title: "Looking Car Parts for [title]",
    search_results_page_title_cat_no_car: "[parts]",
    search_results_title: "Your Search Results",
  };
  let out = templates[key] ?? key;
  if (replaceKeys) {
    for (const [k, v] of Object.entries(replaceKeys)) {
      out = out.replace(`[${k}]`, v);
    }
  }
  return out;
};

describe("buildSearchResultsDisplayTitle", () => {
  it("returns OE title when oeReference is set", () => {
    expect(
      buildSearchResultsDisplayTitle({
        oeReference: "12345",
        getLabel,
      }).title,
    ).toBe("OE Ref: 12345");
  });

  it("returns car + category title", () => {
    expect(
      buildSearchResultsDisplayTitle({
        carLabel: "ALFA ROMEO GT",
        categoryName: "Oil filter",
        getLabel,
      }).title,
    ).toBe("Oil filter for ALFA ROMEO GT");
  });

  it("returns car-only title", () => {
    expect(
      buildSearchResultsDisplayTitle({
        carLabel: "ALFA ROMEO GT",
        getLabel,
      }).title,
    ).toBe("Looking Car Parts for ALFA ROMEO GT");
  });

  it("returns category-only title", () => {
    expect(
      buildSearchResultsDisplayTitle({
        categoryName: "Engine",
        getLabel,
      }).title,
    ).toBe("Engine");
  });

  it("returns generic title when no car and no category", () => {
    expect(buildSearchResultsDisplayTitle({ getLabel }).title).toBe("Your Search Results");
  });
});

describe("buildLegacyMmeCarLabel", () => {
  it("joins make and model", () => {
    expect(buildLegacyMmeCarLabel("ALFA ROMEO", "GT")).toBe("ALFA ROMEO GT");
  });
});

describe("resolveCategoryDisplayName", () => {
  const tree = [
    {
      id: "001",
      parentId: "root",
      name: "Engine",
      titles: { en: "Engine" },
      children: [
        {
          id: "001001",
          parentId: "001",
          name: "Filters",
          titles: { en: "Filters" },
          children: [],
        },
      ],
    },
  ];

  it("resolves L2 category name", () => {
    expect(resolveCategoryDisplayName(tree as any, "001001", "en-BE")).toBe("Filters");
  });

  it("returns null for missing id", () => {
    expect(resolveCategoryDisplayName(tree as any, null, "en")).toBeNull();
  });
});
