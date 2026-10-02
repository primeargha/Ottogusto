import { flattenTree, getTitleOfCategory } from "@/helpers/UtilityHelper";
import type { PartsCategoryInterface } from "@/types/categories";

import { findCategoryInTree } from "@/utils/singleCategoryFilter";

export type SearchResultsLabelFn = (
  keyName: string,
  replaceKeys?: Record<string, string>,
) => string;

export type BuildSearchResultsDisplayTitleInput = {
  carLabel?: string | null;
  categoryName?: string | null;
  oeReference?: string | null;
  getLabel: SearchResultsLabelFn;
};

export type SearchResultsDisplayTitleResult = {
  title: string;
  description: string;
};

/**
 * Shared title matrix for search-results H1, metadata, and previous-search cards.
 * @see new-single-category-filter.md, sprint35-new-car-search.md
 */
export function buildSearchResultsDisplayTitle({
  carLabel,
  categoryName,
  oeReference,
  getLabel,
}: BuildSearchResultsDisplayTitleInput): SearchResultsDisplayTitleResult {
  const car = carLabel?.trim() || "";
  const category = categoryName?.trim() || "";
  const oe = oeReference?.trim() || "";

  if (oe) {
    const title = getLabel("oe_ref_search_page_title", { oeReference: oe });
    return { title, description: title };
  }

  if (car && category) {
    const title = getLabel("search_results_page_title_cat", {
      title: car,
      parts: category,
    });
    return { title, description: car };
  }

  if (car) {
    const title = getLabel("search_results_page_title", { title: car });
    return { title, description: car };
  }

  if (category) {
    const title = getLabel("search_results_page_title_cat_no_car", {
      parts: category,
    });
    return { title, description: category };
  }

  const title = getLabel("search_results_title");
  return { title, description: title };
}

/** Resolve localized category display name from nested tree + single categoryId. */
export function resolveCategoryDisplayName(
  categoryTree: PartsCategoryInterface[] | null | undefined,
  categoryId: string | null | undefined,
  locale: string,
): string | null {
  if (!categoryId?.trim() || !categoryTree?.length) return null;

  const node = findCategoryInTree(categoryTree, categoryId.trim());
  if (!node) {
    const flat = flattenTree(categoryTree, "children") as PartsCategoryInterface[];
    const fromFlat = flat.find((item) => item.id === categoryId.trim());
    if (!fromFlat) return null;
    return getTitleOfCategory(fromFlat, locale.split("-")[0]?.toLowerCase() || "en");
  }

  return getTitleOfCategory(node, locale.split("-")[0]?.toLowerCase() || "en");
}

/** Legacy: derive category name from stored `parts` (array or single node). */
export function resolveCategoryNameFromLegacyParts(
  categoryTree: PartsCategoryInterface[] | null | undefined,
  parts: unknown,
  locale: string,
): string | null {
  if (!parts || !categoryTree?.length) return null;

  const list = Array.isArray(parts) ? parts : [parts];
  const categoriesMasterFlattened = flattenTree(
    categoryTree,
    "children",
  ) as PartsCategoryInterface[];

  const names = list
    .map((cat: { id?: string }) => {
      const catId = cat?.id;
      if (!catId) return "";
      const node =
        categoriesMasterFlattened.find((item) => item.id === catId) ??
        findCategoryInTree(categoryTree, catId);
      if (!node) return "";
      return getTitleOfCategory(node, locale.split("-")[0]?.toLowerCase() || "en");
    })
    .filter(Boolean);

  if (names.length === 0) return null;
  if (names.length <= 2) return names.join(", ");
  return names.join(", ");
}

/** Build car display label from legacy MME make/model strings. */
export function buildLegacyMmeCarLabel(make?: string | null, model?: string | null): string {
  return `${make?.trim() || ""} ${model?.trim() || ""}`.trim();
}
