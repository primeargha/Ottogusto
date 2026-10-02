# Single category filter — search results sidebar

Reference for **one category id** in URL, hierarchical sidebar UI (no checkboxes), and redirect entry points from browse/SEO pages.

**Status:** Implemented on search results (desktop sidebar + mobile filter modal). See [Implemented behaviour](#implemented-behaviour) below.

---

## New requirements (search results sidebar)

> UI reference: Figma — left sidebar on search results (`ENGINE FOR ALFA ROMEO` → drill L1 → L2 → L3).

### 1. Single id in URL — `categoryId` only

- Filter always represents **exactly one** category id (L1, L2, L3, or **Other**).
- **Query param:** `categoryId` (singular) — used by redirects, sidebar clicks, and Parts API payload.
- **`categoryIds` removed** from search-results allowlist, URL writes, and `PostPartsSearchPayload`. Legacy URLs with `categoryIds` are no longer read or validated.

Example:

```
/en-BE/search-results?categoryId=001&take=12&order=priority&availability=InStock,BackOrder,OnRequest,EndofLife
```

| Layer     | Detail                                                                |
| --------- | --------------------------------------------------------------------- |
| Allowlist | `categoryId` only — `utils/searchResultsQueryAllowlist.ts`            |
| Read URL  | `getCategoryIdFromSearchParams()` — `utils/categorySearchUrl.ts`      |
| Filters   | `ProductFilters.categoryId: string \| null` — `hooks/useUrlParams.ts` |
| Parts API | `categoryId` on POST body — `hooks/products.ts`, `type.d.ts`          |

### 2. No checkboxes — single choice, bold selection

- Checkbox / accordion category block **removed** from search sidebar (`OGCat_Block` deleted from `OGCategoriesSearcBlock`).
- User picks **one** category by clicking a row in `SingleCategorySidebarFilter`.
- **No section heading** (“Category”) — list starts directly with L1 rows (Figma).
- Selected row(s) per visibility rules use **bold** at the **same font size** as normal rows (`typography-body-strong-02` vs `typography-body-02`).
- Clicking a category updates URL → refetches products.

### 3. Category data source

- Sidebar list comes from **React Query cached tree** via `useCategories()` (`CategoriesProvider`).
- **No Category API** calls on search page when cache is warm.
- See [Category list — React Query cached data](#category-list--react-query-cached-data) below.

### 4. Visibility & bold rules

Derive UI state from **URL `categoryId`** + nested tree (not multi-select store logic).

| URL state                          | Sidebar shows                                                          | Bold styling                                                       |
| ---------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **No category param**              | Flat **L1 list** including **Other** as last L1 row (`id = 000000000`) | Nothing bold                                                       |
| **L1 selected** (e.g. `001`)       | That L1’s **L2 children** visible; other L1s collapsed                 | **L1 bold** + **all visible L2s bold**                             |
| **L2 selected** (e.g. `001001`)    | Parent L1 open; **L3 children** of that L2 visible                     | **L1 bold** + **selected L2 bold only** + **all visible L3s bold** |
| **L3 selected** (e.g. `001001002`) | Parent L1 + L2 open; L3 list visible                                   | **L1 bold** + **parent L2 bold** + **selected L3 bold only**       |
| **Other selected** (`000000000`)   | Same as L1-selected pattern if tree has children                       | **Other bold**                                                     |

**Interaction**

- Click **L1** → URL `categoryId={L1.id}`; previous L1 branch collapses; new L1 expands with L2s.
- Click **L2** → URL `categoryId={L2.id}`; show that L2’s L3s.
- Click **L3** → URL `categoryId={L3.id}`.
- Click **different L1** → old branch collapses; new L1 opens.
- Click **Other** → URL `categoryId=000000000`.
- **Re-click** already selected row → no-op (`handleSelect` early return).

**Other row:** Appended as final L1 in the same list (no divider, no separate section). Synthetic node if absent from API — `createSyntheticOtherCategory()`.

**Page title / breadcrumb:** Heading reflects deepest selected category + car context via `PageTitleHelper` / `SearchResultsBreadcrumb` (read `categoryId` from URL).

### 5. Out of scope (must not break)

These keep current behaviour:

- Home landing — `BrowseByCategory2`
- Category catalog — `/car-parts` + `BrowseByCategory2`
- SEO pages — L1 / L2 / L3 (`CategoryL1Page`, `CategoryL2Page`, `CategoryL3Page`)
- Advanced search multi-category flows (`useAdvancedSearchStore`, `/search/categories`) — redirects now emit single `categoryId` via `pickPrimaryCategoryId()`
- `CategoryL2Modal` pre-navigation store writes

---

## Store strategy (implemented)

**URL is the source of truth on search results.** Do not push `useCategorySearchStore` back to the URL.

| Store / layer                 | Role on search results                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| **URL `categoryId`**          | Primary — sidebar reads via `getCategoryIdFromSearchParams()`                                |
| `SingleCategorySidebarFilter` | Writes URL only — `updateFilters({ categoryId: id })`                                        |
| `OGCategoriesSearcBlock`      | One-way **URL → store** sync for filter pills/tags (`setSelectedCategories([node])`)         |
| `useCategorySearchStore`      | Legacy multi-select elsewhere; on search page holds **at most one** category synced from URL |

**Critical:** Never sync store → URL on search results. The old store→URL effect caused **L1/L2 URL ping-pong** (e.g. `001` ↔ `001001`). Removed.

**Search page init:** `products.tsx` no longer calls `prefillCategoriesFromUrl` — category store sync is owned by `OGCategoriesSearcBlock`.

**On reset filters:** clear `categoryId` from URL → sidebar returns to L1-only view; store cleared when URL has no `categoryId`.

---

## Implemented behaviour

### Components

| File                                                                              | Status                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `components/og-components/OGCategoriesSearcBlock/index.tsx`                       | MME sidebar + `SingleCategorySidebarFilter`; URL→store effect only |
| `components/og-components/OGCategoriesSearcBlock/SingleCategorySidebarFilter.tsx` | Single-select hierarchical list                                    |
| `components/og-components/OGCategoriesSearcBlock/OGCat_Block.tsx`                 | **Deleted** (search results)                                       |
| `utils/singleCategoryFilter.ts`                                                   | Selection resolve, bold/expand helpers                             |
| `utils/singleCategoryFilter.test.ts`                                              | Unit tests                                                         |
| `utils/categorySearchUrl.ts`                                                      | URL helpers, redirect query builder                                |
| `utils/categorySearchUrl.test.ts`                                                 | Unit tests                                                         |

### URL & API

- `hooks/useUrlParams.ts` — `ProductFilters.categoryId`; URL serialization never emits `categoryIds`
- `hooks/products.ts` — Parts request uses `categoryId`
- `constants.tsx` — `OTHER_CATEGORY_ID = "000000000"`

### Redirect entry points (use `categoryId`)

All browse/SEO entry points pass **one** id via `utils/categorySearchUrl.ts`:

| Source                                         | Typical id   |
| ---------------------------------------------- | ------------ |
| Home / car-parts — `BrowseByCategory2`         | L1 / L2 / L3 |
| L1 SEO — `CategoryL2Section`, `OGFeatureMakes` | L3 / L2 / L1 |
| L2 SEO — `CategoryL3Grid`                      | L3 / L2      |
| L3 SEO — `CategoryL3TopPartsSection`           | L3           |

URL shapes:

| Context  | Example                                                                         |
| -------- | ------------------------------------------------------------------------------- |
| No car   | `/{locale}/search-results?categoryId={id}&take=12&order=priority`               |
| With car | `/{locale}/{mme-slug}?makeModelTypeId=…&categoryId={id}&take=12&order=priority` |

Built via `Routes.viewCategory` / `Routes.viewMMECategory` + `appendCategorySearchQuery()`.

---

## Category list — React Query cached data

**Home, car-parts catalog, and search results** share one client-side category tree. Do **not** refetch Category APIs on those pages when cache is warm.

| Layer       | Where                                                                       | TTL                                                      |
| ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| React Query | `CategoriesProvider` → `categoriesNestedQueryOptions` (`hooks/appHooks.ts`) | 24h `staleTime`, no refetch on mount/focus               |
| Persist     | localStorage + IndexedDB (`lib/nested-categories-browser-cache.ts`)         | 24h, locale-keyed                                        |
| Store sync  | `useCategorySearchStore.setNestedCategoryData`                              | Same tree as `useCategories()` — legacy / pill consumers |

**First load (cache miss):** `GET /Category`, then `GET /Category?parentId={L1.id}` per L1 (L3 embedded in L2 `children`).

**SEO L1/L2/L3 pages** use server `fetchCategoryTree()` for page content; redirect links use ids from props — independent of client React Query cache.

---

## UI sketch (sidebar states)

```
No categoryId             L1 selected (001)              L2 selected (001001)
─────────────────         ─────────────────────          ─────────────────────────
Engine                    Engine          ← bold         Engine          ← bold
Transmission              Filters         ← bold         Filters         ← bold
Chassis                   Ignition        ← bold         Oil filter      ← bold
…                         Cooling         ← bold         Air filter      ← bold
Other                     …                              Fuel filter     ← bold
                          Transmission                     Cabin filter    ← bold
                          Chassis                          Ignition        (normal)
                          …                              …
                          Other
```

No “Category” heading. **Other** is the last L1 row (same styling as Engine, Transmission, etc.).

---

## Mobile filter modal (deferred apply)

On **mobile** (`FilterModal`), category selection does **not** update the URL until the user taps **Apply filters**:

| Step                | Behaviour                                                  |
| ------------------- | ---------------------------------------------------------- |
| Open modal          | `pendingCategoryId` = current URL `categoryId`             |
| Tap L1/L2/L3        | Updates `pendingCategoryId` + sidebar bold/expand only     |
| Apply enabled       | When `pendingCategoryId !==` initial URL category          |
| Apply               | `updateFilters({ categoryId })` + sync store + close modal |
| Close without Apply | Store reverted to URL category                             |

`OGCategoriesSearcBlock` is passed `categoryApplyMode="deferred"` from `FilterModal`. Desktop sidebar uses default `immediate` (click → URL).

`FilterModalFooter` uses `requireMake={false}` so Apply works for category-only changes (no make required).

| Item                                                | Notes                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| Filter tag pills                                    | May still use multi-select store remove flow; consider single chip only |
| `prefillCategoriesFromUrl` in `useSearchModalStore` | Still multi-id parser; unused on search results init                    |
| `OGCategoriesSearcBlockNewModal` / Old              | Separate flows; still have checkbox patterns                            |
| Invalid `categoryId` in URL                         | Currently no toast; sidebar shows L1-only if id not in tree             |

---

## Tests

Run:

```bash
npx vitest run utils/singleCategoryFilter.test.ts utils/categorySearchUrl.test.ts
```

Manual checklist:

1. Home → L1 → search-results with `categoryId`
2. L1/L2/L3 SEO → search with `categoryId`
3. Sidebar L1 → L2 → L3 drill; URL stable (no `001` ↔ `001001` loop)
4. Switch L1; Other; clear filters
5. Parts Network payload uses `categoryId`, not `categoryIds`
