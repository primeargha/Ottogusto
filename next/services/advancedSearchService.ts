// Example usage:
import { apiClient, ApiError } from "@/config/api";
import { CATEGORY_CACHE_TTL_MS } from "@/constants";
import type { Category } from "@/type";
import { clearNestedCategoriesBrowserCache } from "@/lib/nested-categories-browser-cache";
import { normalizeCategoryListResponse } from "@/lib/category-api-normalize";
import { cache } from "react";

// API response shape for GET /Category
interface CategoryResponse {
  data: Category[];
}

// ✅ In-memory cache for categories (shared across requests during server lifetime)
let categoriesCache: { data: CategoryResponse; timestamp: number } | null = null;
let categoriesPendingPromise: Promise<CategoryResponse> | null = null; // ✅ Track pending request
const childCategoriesCache = new Map<string, { data: CategoryResponse; timestamp: number }>();
const childCategoriesPending = new Map<string, Promise<CategoryResponse>>();
let nestedCategoriesCache: { data: Category[]; timestamp: number } | null = null;
let nestedCategoriesPendingPromise: Promise<Category[]> | null = null; // ✅ Track pending nested request
const CACHE_DURATION = CATEGORY_CACHE_TTL_MS;

// ✅ Server-side cached version using React cache() for request deduplication
const getCategoriesCached = cache(async (parentCategoryId?: string): Promise<CategoryResponse> => {
  try {
    const res = parentCategoryId
      ? await apiClient.get<{ data: unknown }>(`/Category?parentId=${parentCategoryId}`)
      : await apiClient.get<{ data: unknown }>("/Category");
    return { data: normalizeCategoryListResponse(res.data) as Category[] };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
});

//  will call for react query - query
// ✅ Added 24-hour caching for root categories (without parentId) with request deduplication
export const getCategories = async (parentCategoryId?: string): Promise<CategoryResponse> => {
  // For root categories (no parentId), use long-term cache
  if (!parentCategoryId) {
    const now = Date.now();

    // Check if cache is valid
    if (categoriesCache && now - categoriesCache.timestamp < CACHE_DURATION) {
      return categoriesCache.data;
    }

    // ✅ If a request is already in progress, wait for it (prevents duplicate concurrent calls)
    if (categoriesPendingPromise) {
      return categoriesPendingPromise;
    }

    // Fetch fresh data

    // ✅ Store the promise so concurrent calls can reuse it
    categoriesPendingPromise = getCategoriesCached()
      .then((result) => {
        categoriesCache = { data: result, timestamp: Date.now() };
        categoriesPendingPromise = null;
        return result;
      })
      .catch((error) => {
        categoriesPendingPromise = null;
        throw error;
      });

    return categoriesPendingPromise;
  }

  // Per-L1 child list: 24h in-memory cache (navigation tree builds one call per L1)
  const now = Date.now();
  const cached = childCategoriesCache.get(parentCategoryId);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const pending = childCategoriesPending.get(parentCategoryId);
  if (pending) {
    return pending;
  }

  const promise = getCategoriesCached(parentCategoryId)
    .then((result) => {
      childCategoriesCache.set(parentCategoryId, { data: result, timestamp: Date.now() });
      childCategoriesPending.delete(parentCategoryId);
      return result;
    })
    .catch((error) => {
      childCategoriesPending.delete(parentCategoryId);
      throw error;
    });

  childCategoriesPending.set(parentCategoryId, promise);
  return promise;
};

// ✅ Server-side cached version for nested categories
const getCategoryByIdNestedCached = cache(async (): Promise<Category[]> => {
  const response = await getCategories();
  const { data = [] } = response;

  // One GET per L1; each L2 in the response already carries L3 in `children`.
  const childPromises = data.map(async (item: Category): Promise<Category> => {
    const l1Id = item.id;
    if (!l1Id) {
      return { ...item, children: [] };
    }
    const result = await getCategoriesCached(l1Id);
    const l2List: Category[] = result.data || [];
    const l2WithEmbeddedL3 = l2List.map((l2) => ({
      ...l2,
      children: l2.children ?? [],
    }));
    return { ...item, children: l2WithEmbeddedL3 };
  });

  return Promise.all(childPromises);
});

// ✅ Added 24-hour caching for nested categories with request deduplication
export const getCategoryByIdNested = async (): Promise<Category[]> => {
  try {
    const now = Date.now();

    // Check if cache is valid
    if (nestedCategoriesCache && now - nestedCategoriesCache.timestamp < CACHE_DURATION) {
      return nestedCategoriesCache.data;
    }

    // ✅ If a request is already in progress, wait for it (prevents duplicate concurrent calls)
    if (nestedCategoriesPendingPromise) {
      return nestedCategoriesPendingPromise;
    }

    // Fetch fresh data

    // ✅ Store the promise so concurrent calls can reuse it
    nestedCategoriesPendingPromise = getCategoryByIdNestedCached()
      .then((result) => {
        nestedCategoriesCache = { data: result, timestamp: Date.now() };
        nestedCategoriesPendingPromise = null;
        return result;
      })
      .catch((error) => {
        nestedCategoriesPendingPromise = null;
        throw error;
      });

    return nestedCategoriesPendingPromise;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

// ✅ Utility to clear category cache (useful for admin operations)
export const clearCategoryCache = () => {
  categoriesCache = null;
  categoriesPendingPromise = null;
  childCategoriesCache.clear();
  childCategoriesPending.clear();
  nestedCategoriesCache = null;
  nestedCategoriesPendingPromise = null;
  clearNestedCategoriesBrowserCache();
};
