import type { CategoryNode } from "@/types/categories";

/**
 * Same path resolution as ProductDetailsBreadcrumb: `categories[0]`, try 9/6/3 prefixes
 * against the category tree, then walk parents to root and reverse.
 */
export function computeProductDetailsTaxonomyPath(
  categoriesData: CategoryNode[] | undefined | null,
  categories: string[] | undefined | null,
): CategoryNode[] {
  if (!categoriesData || !Array.isArray(categoriesData)) return [];
  if (!categories || categories.length === 0) return [];

  const rawId = categories[0];
  if (!rawId || typeof rawId !== "string") return [];

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

  const candidates: string[] = [];
  if (rawId.length >= 9) candidates.push(rawId.slice(0, 9));
  if (rawId.length >= 6) candidates.push(rawId.slice(0, 6));
  if (rawId.length >= 3) candidates.push(rawId.slice(0, 3));

  let startNode: CategoryNode | undefined;
  for (const candidate of candidates) {
    const node = idToNode.get(candidate);
    if (node) {
      startNode = node;
      break;
    }
  }

  if (!startNode) return [];

  const pathLeafToRoot: CategoryNode[] = [];
  let current: CategoryNode | undefined = startNode;
  while (current) {
    pathLeafToRoot.push(current);
    const parentId = current.parentId as string | undefined;
    if (!parentId || parentId === "root") break;
    current = idToNode.get(parentId);
  }

  return pathLeafToRoot.reverse();
}
