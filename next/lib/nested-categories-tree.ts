import type { Category } from "@/type";

/** Parallel L2 parentId fetches after a cold cache miss. */
export const NESTED_L2_FETCH_CONCURRENCY = 4;
/** Attempts per L1 (includes first try). Empty `[]` and thrown errors both retry. */
export const NESTED_L2_MAX_ATTEMPTS = 3;
const L2_RETRY_BASE_MS = 300;

/**
 * True when the nested tree is safe to serve/cache.
 * Rejects L1-only poison trees (every L1 has `children: []`).
 */
export function isNestedCategoryTreeUsable(tree: Category[] | null | undefined): boolean {
  if (!Array.isArray(tree) || tree.length === 0) return false;

  const withId = tree.filter((l1) => !!l1?.id);
  if (withId.length === 0) return false;

  const withChildren = withId.filter(
    (l1) => Array.isArray(l1.children) && (l1.children?.length ?? 0) > 0,
  );
  if (withChildren.length === 0) return false;

  // When multiple L1s exist, require at least half to have L2 (covers "all empty").
  if (withId.length >= 2) {
    return withChildren.length * 2 >= withId.length;
  }
  return true;
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(limit, items.length));

  const run = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index] as T, index);
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => run()));
  return results;
}

export function nestedL2RetryDelayMs(attempt: number): number {
  return L2_RETRY_BASE_MS * 2 ** Math.max(0, attempt - 1);
}
