import type { CategoryNode } from "@/types/categories";

/**
 * List/tree APIs (`GET /Category`, `?parentId=`) are navigation-only.
 * SEO copy lives on `GET /Category/{id}` — strip these so callers cannot
 * accidentally treat list payloads as the SEO source of truth.
 */
const LIST_SEO_KEYS = ["descriptions", "fullDescriptions", "faq"] as const;

function stripListSeoFields(node: CategoryNode): CategoryNode {
  const cleaned: CategoryNode = {
    id: node.id,
    parentId: node.parentId,
    name: node.name,
    displayOrder: node.displayOrder,
    titles: node.titles ?? {},
    slugs: node.slugs ?? {},
  };

  if (node.children?.length) {
    cleaned.children = node.children.map(stripListSeoFields);
  } else if (node.children) {
    cleaned.children = [];
  }

  return cleaned;
}

/** Unwrap list payloads whether API returns a raw array or `{ data: [...] }`. */
export function normalizeCategoryListResponse(body: unknown): CategoryNode[] {
  if (Array.isArray(body)) {
    return (body as CategoryNode[]).map(stripListSeoFields);
  }
  if (body && typeof body === "object") {
    const nested = (body as { data?: unknown }).data;
    if (nested !== undefined) {
      return normalizeCategoryListResponse(nested);
    }
  }
  return [];
}

/** Unwrap single-category payloads from GET /Category/{id}. */
export function normalizeCategoryDetailResponse(body: unknown): CategoryNode | null {
  if (!body) return null;
  if (Array.isArray(body)) {
    const first = body[0];
    return first && typeof first === "object" && "id" in first ? (first as CategoryNode) : null;
  }
  if (typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if ("id" in obj && typeof obj.id === "string") {
      return obj as unknown as CategoryNode;
    }
    if ("data" in obj) {
      return normalizeCategoryDetailResponse(obj.data);
    }
  }
  return null;
}

/** Drop SEO fields from a navigation/tree node (defensive; list normalize already strips). */
export function asNavigationCategory(node: CategoryNode): CategoryNode {
  return stripListSeoFields(node);
}

/**
 * Tree node = structure / titles / slugs / children.
 * SEO fields (`descriptions`, `fullDescriptions`, `faq`) come **only** from
 * `GET /Category/{id}` — never from the list/tree payload.
 * Detail `children` are ignored so an empty detail array cannot wipe the tree.
 */
export function mergeCategoryWithDetail(
  navigation: CategoryNode,
  detail: CategoryNode | null,
): CategoryNode {
  const nav = asNavigationCategory(navigation);

  if (!detail) return nav;

  const merged: CategoryNode = {
    ...nav,
    titles: { ...nav.titles, ...(detail.titles ?? {}) },
    slugs: { ...nav.slugs, ...(detail.slugs ?? {}) },
  };

  if (detail.descriptions) merged.descriptions = detail.descriptions;
  if (detail.fullDescriptions) merged.fullDescriptions = detail.fullDescriptions;
  if (detail.faq?.length) merged.faq = detail.faq;

  return merged;
}

export { LIST_SEO_KEYS };
