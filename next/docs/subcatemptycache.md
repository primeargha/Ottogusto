# Subcategory empty cache (homepage categories)

## Symptom

On the homepage browse-by-category section:

- L1 (main categories) loaded correctly — names and images fine
- L2 (subcategories) was an empty array for every L1

Often noticed around the next day / when the ~24h category cache expired and rebuilt.

## Root cause

Nested category tree is built as:

1. `GET /Category` → L1 list
2. For each L1: `GET /Category?parentId={id}` → L2 (+ embedded L3)

On L2 failure (network, timeout, rate limit, or empty `[]`), the client used to **swallow the error** and return `{ ...l1, children: [] }`, then **still write** that tree to:

- localStorage (`og-nested-categories-navigation-v3:*`)
- IndexedDB (`og-nested-categories`)
- React Query persist (~24h)

Cache readers only checked “L1 array has length”, not “children are populated”. So a poison tree (L1 OK, all L2 empty) was treated as a successful cache hit for another day.

## What we fixed

| Area              | Change                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- |
| L2 fetch          | Retry up to 3 times on error **or** empty `[]`; then throw (never accept empty L2 as success) |
| Concurrency       | Max 4 parallel L2 parentId calls (avoids one big request storm after cold miss)               |
| Cache write       | Do not write LS/IDB unless tree is usable (L1 present and L2 not all empty)                   |
| Cache read        | Treat L1-with-all-empty-children as invalid → delete entry → refetch                          |
| QueryFn           | Removed silent `catch → children: []`; unusable tree throws → RQ error, not poison success    |
| RQ                | Nested query `retry: 1`; query key bumped to `…-nested-v4` to drop old persisted poison       |
| CategoriesContext | Do not expose/sync unusable trees; `removeQueries` if poison hydrates from RQ                 |

### Key files

- `next/lib/nested-categories-tree.ts` — `isNestedCategoryTreeUsable`, concurrency helpers
- `next/lib/build-nested-category-tree.ts` — L2 retry + tree build
- `next/lib/nested-categories-browser-cache.ts` — LS read/write guards
- `next/lib/nested-categories-idb-cache.ts` — IDB read/write guards
- `next/hooks/appHooks.ts` — `fetchCategoriesNestedQueryFn`
- `next/contexts/CategoriesContext.tsx` — usable-data gate
- `next/lib/query-keys.ts` — nested key `v4`

## Guarantees

- No infinite retry: max 3 attempts per L1 L2 fetch + 1 query-level retry, then error UI
- Incomplete trees are not cached
- Existing happy path (valid LS/IDB within 24h TTL) unchanged

## Optional follow-up (not done in this fix)

Same swallow-empty pattern still exists in:

- `next/services/categoryPageService.ts` (`fetchCategoryTree`)
- `next/services/advancedSearchService.ts` (`getCategoryByIdNested`)

Homepage path is covered; align those if needed later.

## How to verify locally

1. Clear LS keys `og-nested-categories-navigation-v3:*`, IDB `og-nested-categories`, hard reload homepage → L1 + L2 both fill
2. Inject poison LS (L1s with `children: []`) → reload → should rebuild, not show empty L2
3. Block `Category?parentId=` in Network → should retry then error — not cache empty L2 forever
