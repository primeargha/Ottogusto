import { getCategories } from "@/services/advancedSearchService";
import type { Category } from "@/type";
import {
  NESTED_L2_FETCH_CONCURRENCY,
  NESTED_L2_MAX_ATTEMPTS,
  isNestedCategoryTreeUsable,
  mapWithConcurrency,
  nestedL2RetryDelayMs,
} from "@/lib/nested-categories-tree";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch L2 (+ embedded L3) for one L1. Retries on thrown errors and empty lists.
 * Never returns `[]` as success — throws after max attempts.
 */
export async function fetchL2CategoriesForL1(l1Id: string): Promise<Category[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= NESTED_L2_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await getCategories(l1Id);
      const l2List: Category[] = result.data || [];
      if (l2List.length > 0) {
        return l2List.map((l2) => ({
          ...l2,
          children: l2.children ?? [],
        }));
      }
      lastError = new Error(`Empty L2 list for category ${l1Id}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < NESTED_L2_MAX_ATTEMPTS) {
      await sleep(nestedL2RetryDelayMs(attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch L2 for category ${l1Id}`);
}

/**
 * Build full L1→L2→L3 tree with limited concurrency and per-L1 retries.
 * Throws if L1 is empty or the resulting tree is unusable (do not cache).
 */
export async function buildNestedCategoryTree(l1List: Category[]): Promise<Category[]> {
  if (!l1List.length) {
    throw new Error("Empty L1 category list");
  }

  const tree = await mapWithConcurrency(
    l1List,
    NESTED_L2_FETCH_CONCURRENCY,
    async (l1): Promise<Category> => {
      const l1Id = l1.id;
      if (!l1Id) {
        throw new Error("L1 category missing id");
      }
      const children = await fetchL2CategoriesForL1(l1Id);
      return { ...l1, children };
    },
  );

  if (!isNestedCategoryTreeUsable(tree)) {
    throw new Error("Nested category tree unusable after L2 fetch");
  }

  return tree;
}
