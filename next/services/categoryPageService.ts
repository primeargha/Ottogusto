import { cache } from "react";
import { apiClient } from "@/config/api";
import {
  mergeCategoryWithDetail,
  normalizeCategoryDetailResponse,
  normalizeCategoryListResponse,
} from "@/lib/category-api-normalize";
import { CATEGORY_CACHE_TTL_MS } from "@/constants";
import type { CategoryNode } from "@/types/categories";

export { mergeCategoryWithDetail } from "@/lib/category-api-normalize";

const CACHE_DURATION = CATEGORY_CACHE_TTL_MS;

let treeCache: { data: CategoryNode[]; timestamp: number } | null = null;
let treePendingPromise: Promise<CategoryNode[]> | null = null;

/** Brand-landing trees: keyed by manufacturer `brandId` — isolated from the global catalog tree. */
const brandTreeCache = new Map<string, { data: CategoryNode[]; timestamp: number }>();
const brandTreePending = new Map<string, Promise<CategoryNode[]>>();

/**
 * Lightweight emptiness probe for list/sitemap: `GET /Category?brandId=` only (no parentId fan-out).
 * Synced from full tree fetches when available.
 */
const brandHasCategoriesCache = new Map<string, { value: boolean; timestamp: number }>();
const brandHasCategoriesPending = new Map<string, Promise<boolean>>();

const detailCache = new Map<string, { data: CategoryNode; timestamp: number }>();
const detailPending = new Map<string, Promise<CategoryNode | null>>();

function rememberBrandHasCategories(brandId: string, value: boolean): void {
  brandHasCategoriesCache.set(brandId, { value, timestamp: Date.now() });
}

const fetchTreeFromApi = cache(async (): Promise<CategoryNode[]> => {
  const rootRes = await apiClient.get<{ data: unknown }>("/Category");
  const rootCategories = normalizeCategoryListResponse(rootRes.data);

  const childPromises = rootCategories.map(async (l1: CategoryNode): Promise<CategoryNode> => {
    try {
      const l2Res = await apiClient.get<{ data: unknown }>(`/Category?parentId=${l1.id}`);
      const l2Categories = normalizeCategoryListResponse(l2Res.data);
      const l2WithChildren = l2Categories.map((l2) => ({
        ...l2,
        children: l2.children ?? [],
      }));

      return { ...l1, children: l2WithChildren };
    } catch {
      return { ...l1, children: [] };
    }
  });

  return Promise.all(childPromises);
});

export async function fetchCategoryTree(): Promise<CategoryNode[]> {
  const now = Date.now();

  if (treeCache && now - treeCache.timestamp < CACHE_DURATION) {
    return treeCache.data;
  }

  if (treePendingPromise) {
    return treePendingPromise;
  }

  treePendingPromise = fetchTreeFromApi()
    .then((result) => {
      treeCache = { data: result, timestamp: Date.now() };
      treePendingPromise = null;
      return result;
    })
    .catch((error) => {
      treePendingPromise = null;
      throw error;
    });

  return treePendingPromise;
}

/**
 * Brand landing only: L1→L2→L3 tree limited to categories with Parts for this manufacturer.
 * `GET /Category?brandId=` + `GET /Category?brandId=&parentId=` — own cache per brandId
 * (does not share or overwrite the global `fetchCategoryTree` cache).
 */
async function fetchBrandTreeFromApi(brandId: string): Promise<CategoryNode[]> {
  const encoded = encodeURIComponent(brandId);
  const rootRes = await apiClient.get<{ data: unknown }>(`/Category?brandId=${encoded}`);
  const rootCategories = normalizeCategoryListResponse(rootRes.data);

  const childPromises = rootCategories.map(async (l1: CategoryNode): Promise<CategoryNode> => {
    try {
      const l2Res = await apiClient.get<{ data: unknown }>(
        `/Category?brandId=${encoded}&parentId=${encodeURIComponent(l1.id)}`,
      );
      const l2Categories = normalizeCategoryListResponse(l2Res.data);
      const l2WithChildren = l2Categories.map((l2) => ({
        ...l2,
        children: l2.children ?? [],
      }));

      return { ...l1, children: l2WithChildren };
    } catch {
      return { ...l1, children: [] };
    }
  });

  return Promise.all(childPromises);
}

/** React request dedupe: metadata + page share one brand tree fetch per render pass. */
const fetchBrandTreeFromApiCached = cache(async (brandId: string): Promise<CategoryNode[]> => {
  return fetchBrandTreeFromApi(brandId);
});

export async function fetchCategoryTreeForBrand(brandId: string): Promise<CategoryNode[]> {
  const id = brandId?.trim();
  if (!id) return [];

  const now = Date.now();
  const cached = brandTreeCache.get(id);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const pending = brandTreePending.get(id);
  if (pending) {
    return pending;
  }

  const promise = fetchBrandTreeFromApiCached(id)
    .then((result) => {
      brandTreePending.delete(id);
      brandTreeCache.set(id, { data: result, timestamp: Date.now() });
      rememberBrandHasCategories(id, result.length > 0);
      return result;
    })
    .catch((error) => {
      brandTreePending.delete(id);
      throw error;
    });

  brandTreePending.set(id, promise);
  return promise;
}

/**
 * True when `GET /Category?brandId=` returns ≥1 L1 (brand landing is indexable / linkable).
 * Uses full tree cache when warm; otherwise one lightweight list call (no parentId fan-out).
 */
export async function hasBrandScopedCategories(brandId: string): Promise<boolean> {
  const id = brandId?.trim();
  if (!id) return false;

  const now = Date.now();
  const treeCached = brandTreeCache.get(id);
  if (treeCached && now - treeCached.timestamp < CACHE_DURATION) {
    return treeCached.data.length > 0;
  }

  const cached = brandHasCategoriesCache.get(id);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }

  const pending = brandHasCategoriesPending.get(id);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const encoded = encodeURIComponent(id);
      const rootRes = await apiClient.get<{ data: unknown }>(`/Category?brandId=${encoded}`);
      const roots = normalizeCategoryListResponse(rootRes.data);
      const value = roots.length > 0;
      rememberBrandHasCategories(id, value);
      return value;
    } catch {
      // Fail open toward brand landing (landing page still redirects if tree is empty).
      return true;
    } finally {
      brandHasCategoriesPending.delete(id);
    }
  })();

  brandHasCategoriesPending.set(id, promise);
  return promise;
}

const fetchCategoryDetailFromApi = cache(async (id: string): Promise<CategoryNode | null> => {
  try {
    const res = await apiClient.get<{ data: unknown }>(`/Category/${id}`);
    return normalizeCategoryDetailResponse(res.data);
  } catch {
    return null;
  }
});

/**
 * Full SEO payload for one category; cached 1 day per id.
 * Callers must merge via `mergeCategoryWithDetail` — never read SEO fields from the tree alone.
 */
export async function fetchCategoryDetail(id: string): Promise<CategoryNode | null> {
  if (!id) return null;

  const now = Date.now();
  const cached = detailCache.get(id);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const pending = detailPending.get(id);
  if (pending) {
    return pending;
  }

  const promise = fetchCategoryDetailFromApi(id)
    .then((node) => {
      detailPending.delete(id);
      if (node) {
        detailCache.set(id, { data: node, timestamp: Date.now() });
      }
      return node;
    })
    .catch((error) => {
      detailPending.delete(id);
      throw error;
    });

  detailPending.set(id, promise);
  return promise;
}

export const resolveL1CategoryPage = cache(
  async (l1Slug: string, locale: string): Promise<{ l1: CategoryNode } | null> => {
    const tree = await fetchCategoryTree();
    const l1Nav = findL1BySlug(tree, l1Slug, locale);
    if (!l1Nav) return null;

    const detail = await fetchCategoryDetail(l1Nav.id);
    return { l1: mergeCategoryWithDetail(l1Nav, detail) };
  },
);

export const resolveL2CategoryPage = cache(
  async (
    l1Slug: string,
    l2Slug: string,
    locale: string,
  ): Promise<{ l1: CategoryNode; l2: CategoryNode } | null> => {
    const tree = await fetchCategoryTree();
    const match = findL2BySlug(tree, l1Slug, l2Slug, locale);
    if (!match) return null;

    const detail = await fetchCategoryDetail(match.l2.id);
    return {
      l1: match.l1,
      l2: mergeCategoryWithDetail(match.l2, detail),
    };
  },
);

export const resolveL3CategoryPage = cache(
  async (
    l1Slug: string,
    l2Slug: string,
    l3Slug: string,
    locale: string,
  ): Promise<{ l1: CategoryNode; l2: CategoryNode; l3: CategoryNode } | null> => {
    const tree = await fetchCategoryTree();
    const match = findL3BySlug(tree, l1Slug, l2Slug, l3Slug, locale);
    if (!match) return null;

    const detail = await fetchCategoryDetail(match.l3.id);
    return {
      l1: match.l1,
      l2: match.l2,
      l3: mergeCategoryWithDetail(match.l3, detail),
    };
  },
);

export function findL1BySlug(
  tree: CategoryNode[],
  slug: string,
  locale: string,
): CategoryNode | undefined {
  const normalizedSlug = slug.toLowerCase();
  return tree.find((node) => {
    const nodeSlug = node.slugs?.[locale];
    return nodeSlug?.toLowerCase() === normalizedSlug;
  });
}

export function findL2BySlug(
  tree: CategoryNode[],
  l1Slug: string,
  l2Slug: string,
  locale: string,
): { l1: CategoryNode; l2: CategoryNode } | undefined {
  const l1 = findL1BySlug(tree, l1Slug, locale);
  if (!l1?.children) return undefined;
  const normalizedL2Slug = l2Slug.toLowerCase();
  const l2 = l1.children.find((node) => {
    const nodeSlug = node.slugs?.[locale];
    return nodeSlug?.toLowerCase() === normalizedL2Slug;
  });
  if (!l2) return undefined;
  return { l1, l2 };
}

export function findL3BySlug(
  tree: CategoryNode[],
  l1Slug: string,
  l2Slug: string,
  l3Slug: string,
  locale: string,
): { l1: CategoryNode; l2: CategoryNode; l3: CategoryNode } | undefined {
  const l2Result = findL2BySlug(tree, l1Slug, l2Slug, locale);
  if (!l2Result?.l2?.children) return undefined;

  const normalizedL3Slug = l3Slug.toLowerCase();
  const l3 = l2Result.l2.children.find((node) => {
    const nodeSlug = node.slugs?.[locale];
    return nodeSlug?.toLowerCase() === normalizedL3Slug;
  });

  if (!l3) return undefined;
  return { l1: l2Result.l1, l2: l2Result.l2, l3 };
}

export function findCategoryById(tree: CategoryNode[], id: string): CategoryNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function clearCategoryTreeCache(): void {
  treeCache = null;
  treePendingPromise = null;
  brandTreeCache.clear();
  brandTreePending.clear();
  brandHasCategoriesCache.clear();
  brandHasCategoriesPending.clear();
  detailCache.clear();
  detailPending.clear();
}
