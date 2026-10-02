# Plan: Brand landing categories filtered by `brandId` (only cats with Parts)

> **Status: implemented** — `fetchCategoryTreeForBrand` (per-`brandId` Map cache), brand landing SSR/metadata, client uses `initialCategories` only (no global `useCategories`).

## Problem

Brand details page (`/car-parts-brands/{slug}`) today loads the **global** category tree:

1. SSR: `fetchCategoryTree()` → `GET /Category` + `GET /Category?parentId={l1}` (no brand filter)
2. Client: `useCategories()` — when warm, **replaces** SSR tree with the same global tree

Result: L1 cards + L3 links include categories with **zero parts for that brand** → Brand+L3 opens empty / soft-404 for many links.

Backend now supports brand-scoped list Category:

```http
GET /api/Category?brandId={manufacturerId}
GET /api/Category?brandId={manufacturerId}&parentId={l1Id}
```

Same shape as today’s list (L1; L2 with `children` L3). Only categories that have Parts for that manufacturer (store-scoped via API key).

---

## Goal

On **Brand landing only**:

```text
1. GET /Manufacturer/slug/{slug}     → brand.id, name, image, descriptions
2. GET /Category?brandId={brand.id}  → L1s with parts for this brand
3. For each L1:
   GET /Category?brandId={brand.id}&parentId={l1.id}  → L2s + L3 children
4. UI unchanged: flatten L3 under L1 (skip L2 display) via collectL3UnderL1
```

Homepage / car-parts / catalog L1–L3 / filters keep **unfiltered** `GET /Category` (no `brandId`).

---

## Current vs target

| Concern                      | Today                            | Target                                                                       |
| ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| Brand landing SSR categories | `fetchCategoryTree()` global     | `fetchCategoryTreeForBrand(brand.id)`                                        |
| Brand landing client         | Prefers `useCategories()` global | **Do not** use global `useCategories` for this page — SSR/filtered tree only |
| Metadata keywords L1 titles  | Global L1 names                  | Brand-filtered L1 names                                                      |
| L3 links                     | All L3s under L1                 | Only L3s returned under filtered tree + `?brandId=` on href (already)        |
| Global nav cache             | Shared                           | **Separate** cache key by `brandId` — never overwrite global tree            |

---

## API contract (confirm with Frank)

| Call                               | Returns                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `GET /Category?brandId=`           | L1 list (only L1s that have ≥1 part for brand in this store)   |
| `GET /Category?brandId=&parentId=` | L2 list; each L2 has `children` = L3s **with parts** for brand |
| Without `brandId`                  | Unchanged global tree (home / catalog)                         |

**Ask backend:**

1. Empty L1s omitted (no L1 with zero L3s for brand).
2. Empty L2s omitted or empty `children`.
3. Param name is **`brandId`** (= Manufacturer `id` — same as URL Brand+L3 `brandId`).
4. Response still has `id`, `titles`, `slugs`, `displayOrder`, `children` (list SEO fields still stripped by FE normalize).

---

## Implementation plan

### Phase 1 — Service: brand-scoped tree fetch

**File:** `services/categoryPageService.ts` (or small `services/brandCategoryTree.ts`)

Add:

```ts
fetchCategoryTreeForBrand(brandId: string): Promise<CategoryNode[]>
```

Behaviour (mirror `fetchTreeFromApi`):

```text
GET /Category?brandId={brandId}
for each L1:
  GET /Category?brandId={brandId}&parentId={l1.id}
  attach L2.children (L3)
return nested tree
```

**Caching:**

- Separate from global `treeCache`
- Key: `brandId` (Map or `${brandId}` entry)
- Same TTL as global (`CATEGORY_CACHE_TTL_MS`)
- React `cache()` keyed by brandId for request dedupe
- Clear in `clearCategoryTreeCache()` if used in tests

**Normalize:** reuse `normalizeCategoryListResponse` (still strips faq/descriptions from list).

**Do not** change `getCategories()` / `useCategories` / global `fetchCategoryTree` used by home and L1–L3 catalog.

### Phase 2 — Brand landing page SSR

**File:** `app/(public)/…/manufacturers/[brandSlug]/page.tsx`

```text
brand = await getManufacturerBySlug(slug)
tree = await fetchCategoryTreeForBrand(brand.id)
pass initialCategories={tree}
```

**Metadata:** for keywords `categories`, use the same brand-filtered tree (or L1 titles from that fetch) — not global `fetchCategoryTree()`. Prefer sharing one filtered fetch via `cache()` so page + metadata don’t double-hit when both run.

### Phase 3 — Client shell: stop using global `useCategories`

**File:** `screens/car-part-brands/CarPartBrandLandingPage.tsx`

Today:

```ts
const tree = clientCategories?.length ? clientCategories : initialCategories;
```

**Change:** always use `initialCategories` (SSR brand-filtered). Remove `useCategories()` from this page.

Optional later: client React Query `['categories-by-brand', brand.id]` if we want soft refresh — **not required** for v1 if SSR is enough for SEO + first paint.

UI logic stays:

- `sortCategoriesByDisplayOrder`
- L1 cards / sticky tabs
- `collectL3UnderL1(l1)` for L3 links
- `buildL3Href` → `?brandId={brand.id}` (+ vehicle)

Empty tree: **SSR temporary redirect** to
`/{locale}/search-results?categoryId=000000000&take=12&order=priority&manufacturerIds={brand.id}`
(do not render brand landing). Helper: `buildBrandEmptyCategoriesSrpHref`.

**Brand list / homepage tiles:** SSR probes `GET /Category?brandId=` per manufacturer
(`hasBrandScopedCategories`) and sets the `<Link href>` to the SRP URL when empty — so hover
and crawlers never see `/car-parts-brands/{slug}` for empty brands. Sitemap omits those landings.
Brand landing redirect remains a safety net for direct/bookmarked URLs.

### Phase 4 — Out of scope / do not break

| Surface                          | Action                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand list (`/car-parts-brands`) | No Category call — unchanged                                                                                                                                                                             |
| Brand+L3                         | Still resolve L3 via **global** tree + detail by id + Parts filter (soft-404). Links from landing already only show populated L3s. Optional later: resolve via brand-filtered tree — not required for v1 |
| Homepage / car-parts browse      | Global `useCategories` — unchanged                                                                                                                                                                       |
| Sitemap brand×L3 population      | Still Parts sweep (or keep as-is) — not blocked by this                                                                                                                                                  |
| Catalog L1/L2/L3 SEO             | Global tree + detail by id — unchanged                                                                                                                                                                   |

### Phase 5 — Tests & QA

**Unit / service**

- `fetchCategoryTreeForBrand` builds query strings with `brandId` and `brandId+parentId`
- Cache isolation: global tree ≠ brand tree

**Manual**

| Check                                                            | Expect                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Brand with few categories                                        | Only L1/L3 that have parts                                                     |
| Click every L3 link                                              | Brand+L3 has products (or rare race)                                           |
| Network on brand landing                                         | `Manufacturer/slug/…` + `Category?brandId=` + N× `Category?brandId=&parentId=` |
| Network must **not** prefer global nested categories for this UI |                                                                                |
| Home category browse                                             | Still full tree                                                                |
| Cold load / curl                                                 | L1 titles + L3 `<a href="…?brandId=">` in HTML                                 |

---

## Request flow (Brand landing)

```text
GET /Manufacturer/slug/fiat-group
  → { id, name, image, shortDescriptions, … }

GET /Category?brandId={id}
  → [ L1… ]

GET /Category?brandId={id}&parentId={l1Id}   (per L1)
  → [ L2 { children: [L3…] } ]

UI: L1 cards + per-L1 L3 links
  → /car-parts-brands/fiat-group/{l3Slug}?brandId={id}
```

---

## Risks

| Risk                                           | Mitigation                                   |
| ---------------------------------------------- | -------------------------------------------- |
| Reusing `useCategories` shows empty cats again | Remove client global tree from brand landing |
| Polluting global category cache                | Separate `brandId` cache map                 |
| Backend `brandId` vs FE URL `brandId` mismatch | Same Manufacturer `id` value                 |
| Metadata still lists all L1s in keywords       | Switch metadata to filtered tree             |
| Extra N+1 calls per brand                      | Same as global tree today; cache per brandId |

---

## Implementation order

1. `fetchCategoryTreeForBrand(brandId)` + cache
2. Brand `[brandSlug]/page.tsx` SSR + metadata
3. `CarPartBrandLandingPage` drop `useCategories`
4. QA Network + empty-state
5. Update `new-brand-page.md` open Q “full vs brand-filtered” → **brand-filtered**

---

## Verdict

**Enough:** two APIs as specified + FE stops using global category tree on brand details.  
**Critical:** do **not** merge filtered tree into `useCategories` / global cache.  
**UI:** keep L1 + flatten L3 under L1; no L2 UI change.
