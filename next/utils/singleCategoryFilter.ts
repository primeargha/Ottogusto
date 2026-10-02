import { OTHER_CATEGORY_ID } from "@/constants";
import type { PartsCategoryInterface } from "@/types/categories";

export type CategoryLevel = 1 | 2 | 3 | "other";

export type ResolvedCategorySelection = {
  level: CategoryLevel;
  l1Id: string;
  l2Id: string | null;
  l3Id: string | null;
  node: PartsCategoryInterface | null;
};

/** Read a single category id from URL (legacy comma lists → first id). */
export function isOtherCategoryId(id: string | null | undefined): boolean {
  return id === OTHER_CATEGORY_ID;
}

export function parseSingleCategoryId(param: string | null | undefined): string | null {
  if (!param?.trim()) return null;
  const decoded = decodeURIComponent(param.trim());
  const first = decoded.split(",")[0]?.trim();
  return first || null;
}

export function getCategoryLevelFromId(id: string): CategoryLevel | null {
  if (id === OTHER_CATEGORY_ID) return "other";
  if (id.length === 3) return 1;
  if (id.length === 6) return 2;
  if (id.length >= 9) return 3;
  return null;
}

export function findCategoryInTree(
  tree: PartsCategoryInterface[],
  id: string,
): PartsCategoryInterface | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findCategoryInTree(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function resolveCategorySelection(
  tree: PartsCategoryInterface[],
  selectedId: string | null,
): ResolvedCategorySelection | null {
  if (!selectedId) return null;

  const level = getCategoryLevelFromId(selectedId);
  if (!level) return null;

  if (level === "other") {
    return {
      level: "other",
      l1Id: OTHER_CATEGORY_ID,
      l2Id: null,
      l3Id: null,
      node: findCategoryInTree(tree, OTHER_CATEGORY_ID) ?? null,
    };
  }

  const node = findCategoryInTree(tree, selectedId) ?? null;
  const l1Id = selectedId.slice(0, 3);
  const l2Id = selectedId.length >= 6 ? selectedId.slice(0, 6) : null;

  return {
    level,
    l1Id,
    l2Id,
    l3Id: level === 3 ? selectedId : null,
    node,
  };
}

export function partitionL1Categories(tree: PartsCategoryInterface[]): {
  regularL1s: PartsCategoryInterface[];
  otherNode: PartsCategoryInterface | undefined;
} {
  const regularL1s = tree.filter((c) => c.id !== OTHER_CATEGORY_ID);
  const otherNode = tree.find((c) => c.id === OTHER_CATEGORY_ID);
  return { regularL1s, otherNode };
}

export function createSyntheticOtherCategory(label = "Other"): PartsCategoryInterface {
  return {
    id: OTHER_CATEGORY_ID,
    parentId: "root",
    name: "OTHER",
    titles: { en: label, nl: label, fr: label },
    children: [],
  };
}

/** Bold rules per Figma / new-single-category-filter.md */
export function isCategoryRowBold(
  rowLevel: 1 | 2 | 3,
  categoryId: string,
  selection: ResolvedCategorySelection | null,
): boolean {
  if (!selection) return false;

  const { level, l1Id, l2Id, l3Id } = selection;

  if (level === 1 || level === "other") {
    if (rowLevel === 1) return categoryId === l1Id;
    if (rowLevel === 2) return categoryId.startsWith(l1Id);
    return false;
  }

  if (level === 2) {
    if (rowLevel === 1) return categoryId === l1Id;
    if (rowLevel === 2) return categoryId === l2Id;
    if (rowLevel === 3) return l2Id != null && categoryId.startsWith(l2Id);
    return false;
  }

  // level === 3
  if (rowLevel === 1) return categoryId === l1Id;
  if (rowLevel === 2) return categoryId === l2Id;
  if (rowLevel === 3) return categoryId === l3Id;
  return false;
}

export function shouldShowL3Children(
  l2Id: string,
  selection: ResolvedCategorySelection | null,
): boolean {
  if (!selection) return false;
  return (selection.level === 2 || selection.level === 3) && selection.l2Id === l2Id;
}

export function shouldExpandL1(l1Id: string, selection: ResolvedCategorySelection | null): boolean {
  if (!selection) return false;
  return selection.l1Id === l1Id;
}
