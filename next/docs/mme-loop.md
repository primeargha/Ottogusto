### Context

- **Area**: MME search data (`useMmeStore`) on **category L1/L2/L3 pages**.
- **Related files**:
  - `next/utils/detectPage.ts`
  - `next/components/SearchContainer.tsx`
  - `next/stores/useMmeStore.ts`
  - Category pages and shells under `next/screens/category/*`.

The goal was to avoid showing **stale car context** (old `make/model/engine` selections) when the user lands on a category URL **without** `makeModelTypeId` in the query string, while keeping existing behavior intact when `makeModelTypeId` is present.

---

### Original behavior (before this change)

- `useMmeStore` persists `searchData` (`make`, `model`, `engine`, etc.) in local storage.
- When navigating to a category URL like:

  ```text
  /en-BE/car-parts/category/engine/filters/oil-filter
  ```

  with **no** `makeModelTypeId`:
  - The page could still show an old car in headings/breadcrumbs because `searchData` was populated from a previous session or page.
  - There was **no centralized logic** to clear stale MME data on category L1/L2/L3 pages.

---

### First attempt (why it looped)

The first attempt added a `useEffect` in `SearchContainer` that:

- Checked:
  - `detectPage(pathname)` returned `category-l1` / `category-l2` / `category-l3`.
  - `makeModelTypeIdFromUrl` was empty.
  - `searchData` had `make/model/engine` values.
- When those conditions were true, it called:

  ```ts
  const mmeStore = useMmeStore.getState();
  mmeStore.resetSearch();
  mmeStore.clearMmeApiCache();
  ```

**Problem**:

- This effect ran on **every render** while:
  - The page type stayed `category-l1/2/3`, and
  - The URL still had **no** `makeModelTypeId`.
- When the user tried to select a new car (updating `searchData` but still without `makeModelTypeId` in the URL yet), the effect kept firing and **re-cleared** `searchData` on each change.
- Result: a practical **loop** where the user could not keep new MME selections on category pages without `makeModelTypeId`.

---

### Final behavior (current implementation)

We kept the idea of clearing **only stale data on entry**, but made it **one-shot per path** and used the store state directly instead of the `searchData` hook in the dependency array.

#### 1. Page detection

`detectPage` already returns:

- `"category-l1"` for `/locale/{parts}/category/{l1}`.
- `"category-l2"` for `/locale/{parts}/category/{l1}/{l2}`.
- `"category-l3"` for `/locale/{parts}/category/{l1}/{l2}/{l3}`.

`SearchContainer` computes:

```ts
const pathname = usePathname();
const currentPageType = React.useMemo(() => {
  if (!pathname) return "search-results";
  return detectPage(pathname);
}, [pathname]);
```

#### 2. One-shot reset effect in `SearchContainer`

Key additions in `next/components/SearchContainer.tsx`:

```ts
const pathname = usePathname();
const hasClearedMmeForPathRef = React.useRef<string | null>(null);
```

And the effect:

```ts
React.useEffect(() => {
  if (!pathname) return;

  const isCategoryWithoutMMEId =
    (currentPageType === "category-l1" ||
      currentPageType === "category-l2" ||
      currentPageType === "category-l3") &&
    !makeModelTypeIdFromUrl;

  if (!isCategoryWithoutMMEId) {
    return;
  }

  // Avoid re-running for the same path; only evaluate once per navigation
  if (hasClearedMmeForPathRef.current === pathname) {
    return;
  }

  const mmeState = useMmeStore.getState();
  const currentSearchData = mmeState.searchData;

  const hasStaleSearchData =
    !!currentSearchData?.make?.value ||
    !!currentSearchData?.model?.value ||
    !!currentSearchData?.engine?.value;

  if (!hasStaleSearchData) {
    return;
  }

  try {
    // Reset stored MME search context and clear any cached MME API data
    mmeState.resetSearch();
    mmeState.clearMmeApiCache();
    hasClearedMmeForPathRef.current = pathname;
  } catch (error) {
    console.error("[SearchContainer] Failed to reset MME search data on category page", error);
  }
}, [pathname, currentPageType, makeModelTypeIdFromUrl]);
```

**Important points**:

- **Scope**:
  - Only runs when `detectPage` reports `category-l1`, `category-l2` or `category-l3`.
  - Only when the URL has **no** `makeModelTypeId`.
- **One-shot per path**:
  - `hasClearedMmeForPathRef` ensures the reset happens **only once per `pathname`**.
  - Subsequent state changes on the same page (e.g. while the user is selecting a new car) do **not** trigger another reset.
- **Stale-data-only**:
  - We check the current store state (`mmeState.searchData`) and only reset when there is existing MME data (`make/model/engine` present).

---

### Effects on behavior

- **Landing on category URL without `makeModelTypeId`**:
  - Example: `/en-BE/car-parts/category/engine/filters/oil-filter`
  - If `useMmeStore` has old data:
    - On first mount, the effect clears MME search data and cache.
    - Headings and breadcrumbs no longer show an old vehicle.
  - After that, as the user selects a new car:
    - The effect does **not** run again for that path.

- **Landing on category URL with `makeModelTypeId`**:
  - Example: `/en-BE/car-parts/category/engine/filters/oil-filter?makeModelTypeId=00a00400300000000`
  - `isCategoryWithoutMMEId` is `false`, so **no reset** occurs.
  - Existing behavior and heading logic remain unchanged.

- **Non-category pages**:
  - `detectPage` returns other types (`category-catalog`, `search-results`, `product-details`), so the effect never runs.

---

### Summary

- **Problem**: We needed to clear old MME search data when entering category L1/L2/L3 pages without `makeModelTypeId`, but the initial implementation caused a loop by re-clearing while the user was selecting a new car.
- **Solution**:
  - Limit the reset to `category-l1/2/3` **and** missing `makeModelTypeId`.
  - Use `useMmeStore.getState()` for a snapshot of `searchData`.
  - Run the reset **once per pathname** using `hasClearedMmeForPathRef`.
- **Guarantee**: This change only affects category L1/L2/L3 pages without `makeModelTypeId` and does not interfere with any flows where `makeModelTypeId` is present or on non-category pages.
