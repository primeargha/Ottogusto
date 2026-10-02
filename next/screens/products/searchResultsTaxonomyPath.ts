import type { CategoryNode } from "@/types/categories";
import { computeProductDetailsTaxonomyPath } from "@/screens/productdetails/productDetailsTaxonomyPath";
import { formatTitleObject } from "@/utils/languageFormating";
import { normalizeGtmCategoryLabel, type ViewItemListCategoryContext } from "@/utils/gtm";

/** Same taxonomy-prefix logic as SearchResultsBreadcrumb: resolve `categoryId` on the category tree. */
export function computeTaxonomyPrefixPath(
  categoriesData: CategoryNode[] | undefined | null,
  categoryIdParam: string,
): CategoryNode[] {
  const selectedIds = categoryIdParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!categoriesData || selectedIds.length === 0) return [];

  const idToNode = new Map<string, CategoryNode>();

  const walk = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      idToNode.set(node.id, node);
      if (node.children && node.children.length > 0) {
        walk(node.children as CategoryNode[]);
      }
    });
  };

  walk(categoriesData);

  const buildPath = (id: string): CategoryNode[] => {
    const path: CategoryNode[] = [];
    let current: CategoryNode | undefined = idToNode.get(id);

    while (current) {
      path.push(current);
      const parentId = current.parentId as string | undefined;
      if (!parentId || parentId === "root") break;
      current = idToNode.get(parentId);
    }

    return path.reverse();
  };

  const paths = selectedIds.map((id) => buildPath(id)).filter((p) => p.length > 0);
  if (paths.length === 0) return [];

  const first = paths[0]!;
  const prefix: CategoryNode[] = [];

  for (let i = 0; i < first.length; i++) {
    const nodeAtI = first[i]!;
    const allMatch = paths.every((p) => p[i] && p[i]!.id === nodeAtI.id);
    if (!allMatch) break;
    prefix.push(nodeAtI);
  }

  return prefix;
}

function labelForCategoryNode(node: CategoryNode | undefined, lang: string): string {
  if (!node) return "";
  const formatted = node.titles ? formatTitleObject(node.titles) : undefined;
  const raw = (formatted && formatted[lang]) || node.name || "";
  return normalizeGtmCategoryLabel(raw);
}

/** Maps breadcrumb / SRP taxonomy path to GA4 item_category fields for view_item_list. */
export function categoryPathToViewItemListCategoryFields(
  path: CategoryNode[],
  lang: string,
): {
  item_category: string;
  item_category2: string;
  item_category3: string;
  item_category4: string;
} {
  return {
    item_category: labelForCategoryNode(path[0], lang),
    item_category2: labelForCategoryNode(path[1], lang),
    item_category3: labelForCategoryNode(path[2], lang),
    item_category4: labelForCategoryNode(path[3], lang),
  };
}

const emptyGtmCategoryContext = (): ViewItemListCategoryContext => ({
  item_category: "",
  item_category2: "",
  item_category3: "",
  item_category4: "",
});

/**
 * GA4/GTM on search results: use part taxonomy from `categories[0]` (same tree walk as PDP).
 * If that does not resolve (e.g. empty `[]` or unknown id), use list/breadcrumb context from URL `categoryId`.
 */
export function gtmCategoryContextForSearchResultPart(
  product: { categories?: string[] | null } | null | undefined,
  categoriesData: CategoryNode[] | undefined | null,
  listFallback: ViewItemListCategoryContext | undefined | null,
  lang: string,
): ViewItemListCategoryContext {
  const path = computeProductDetailsTaxonomyPath(categoriesData, product?.categories ?? null);
  if (path.length > 0) {
    return categoryPathToViewItemListCategoryFields(path, lang);
  }
  return listFallback ?? emptyGtmCategoryContext();
}
