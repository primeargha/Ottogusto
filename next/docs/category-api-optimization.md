# Category API Optimization

Context for the category API split (light list vs full category-by-id), prior frontend behavior, current bugs, and frontend implementation.

Related: [categorypages-seo.md](./categorypages-seo.md)

---

## Section 1 — What was implemented earlier (old behavior)

### Overview

The frontend used **one category API contract** for:

1. **Client (navigation)** — home, car-parts catalog, filters, breadcrumbs, search-by-category modals.
2. **Server (SEO pages)** — L1 / L2 / L3 routes, metadata, descriptions, FAQ, hreflang.

Both built a **full nested tree**: `GET /Category` (L1) + `GET /Category?parentId={L1}` (L2 with embedded L3 in `children`).

### Old backend APIs

| Purpose            | Request                              |
| ------------------ | ------------------------------------ |
| L1 list            | `GET /api/Category`                  |
| L2 + L3 for one L1 | `GET /api/Category?parentId={L1_ID}` |

**Expected on every node:** `id`, `parentId`, `name`, `displayOrder`, `titles`, **`slugs`**, `descriptions`, `fullDescriptions`, `faq`, and on L2: **`children`** (L3).

### Old frontend — Home & car-parts catalog

| Item      | Detail                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| **Pages** | `page.tsx`, `car-parts/page.tsx`                                                       |
| **UI**    | `BrowseByCategory2`                                                                    |
| **Data**  | `useCategories()` → `categoriesNestedQueryOptions` in `hooks/appHooks.ts`              |
| **Fetch** | `getCategories()` + per-L1 `getCategories(l1Id)` → 24h browser/IDB + React Query cache |

### Old frontend — L1 / L2 / L3 SEO pages

| Route (example)                  | Component            | Resolution                             |
| -------------------------------- | -------------------- | -------------------------------------- |
| `/en-BE/car-parts/category/[l1]` | `CategoryL1Page.tsx` | `fetchCategoryTree()` → `findL1BySlug` |
| `.../category/[l1]/[l2]`         | `CategoryL2Page.tsx` | `findL2BySlug`                         |
| `.../category/[l1]/[l2]/[l3]`    | `CategoryL3Page.tsx` | `findL3BySlug`                         |

**Service:** `services/categoryPageService.ts` — full tree in memory (24h), match **`slugs[locale]`** to URL segments. No match → `<NotFound />`.

**Content:** `CategoryDescription`, `CategoryLearnAndFAQ`, FAQ JSON-LD from tree nodes (`fullDescriptions`, `faq` on the same payload).

### Why L1 / L2 / L3 went to Not Found after backend optimization

1. **List API no longer returns** `fullDescriptions` / `faq` on tree nodes (moved to detail API) — routing still works if `slugs` + `children` remain.
2. **Response shape** — if API returns a raw array but code expected only `response.data` as array without normalization, tree could be empty.
3. **Stale cache** without `slugs`.

Example failing URL: `https://dev.ottogusto.com/en-BE/car-parts/category/engine/filters`

---

## Section 2 — New backend APIs

### API set 1 — List / tree (existing URLs, optimized)

```http
GET /api/Category
GET /api/Category?parentId={L1_ID}
```

**Keep for navigation + routing:** `id`, `parentId`, `name`, `displayOrder`, `titles`, **`slugs`**, L2 **`children`** (L3).

**Omitted on list (for speed):** `fullDescriptions`, `faq` (and optionally heavy `descriptions`).

### API set 2 — Single category detail (new)

```http
GET /api/Category/{categoryId}
```

**Returns:** one object with `descriptions`, **`fullDescriptions`**, **`slugs`**, **`faq`**. No nested `children`.

**Used for:** L1 / L2 / L3 SEO page body, learn-more, FAQ, metadata (one call per page category id).

### Responsibility matrix

| Need                         | List API                      | Detail API |
| ---------------------------- | ----------------------------- | ---------- |
| Home / catalog browse        | Yes                           | No         |
| Filter/search tree           | Yes                           | No         |
| Breadcrumb links             | Yes (`slugs`)                 | No         |
| URL slug → id                | Yes (tree + `slugs`)          | No         |
| Page copy / FAQ / learn more | Optional short `descriptions` | **Yes**    |
| L2/L3 grids on L1/L2         | Yes (`children`)              | No         |

---

## Section 3 — Frontend implementation (this branch)

### Principles

- **No extra API calls:** SEO pages = **one** cached tree fetch + **one** cached detail fetch for the active category id only.
- **1 day cache** for tree and per-id detail (server memory + React `cache()` dedupe within a request).
- **Navigation** (home, catalog, breadcrumbs): list APIs only via `useCategories()` / `getCategories`.
- **Do not** call detail API for every node on landing.

### Files

| Area                        | File                                     |
| --------------------------- | ---------------------------------------- |
| Response normalization      | `lib/category-api-normalize.ts`          |
| SEO tree + detail + resolve | `services/categoryPageService.ts`        |
| Client list fetch + caches  | `services/advancedSearchService.ts`      |
| L1/L2/L3 pages              | `screens/category/CategoryL*Page.tsx`    |
| Metadata                    | `screens/category/categoryL*Metadata.ts` |

### SEO page flow

```text
1. fetchCategoryTree()           → slug → node (structure, children, slugs)
                                   list normalize STRIPS descriptions / fullDescriptions / faq
2. fetchCategoryDetail(node.id)  → GET /Category/{id} — sole source of SEO copy + faq
3. mergeCategoryWithDetail()     → SEO fields from detail only; never from list; keep tree children
```

`generateMetadata` and the page component share `resolveL*CategoryPage()` so React `cache()` dedupes tree + detail within one request.

Brand+L3 uses the same detail merge after `findL3ByLocaleSlug` (not list descriptions).

### Caching

| Cache                          | TTL | Scope                             |
| ------------------------------ | --- | --------------------------------- |
| Navigation tree (server)       | 24h | `categoryPageService` tree        |
| Category detail by id (server) | 24h | `categoryPageService` detail map  |
| Root `getCategories()`         | 24h | `advancedSearchService`           |
| Per-`parentId` list            | 24h | `advancedSearchService` child map |
| Client nested categories       | 24h | LS + IDB + React Query            |

---

## Test checklist

| Scenario                                              | Expected                  |
| ----------------------------------------------------- | ------------------------- |
| Home / car-parts catalog                              | Fast; list APIs only      |
| `/en-BE/car-parts/category/engine`                    | L1 renders                |
| `/en-BE/car-parts/category/engine/filters`            | L2 renders                |
| `/en-BE/car-parts/category/engine/filters/oil-filter` | L3 renders                |
| Learn more + FAQ on L2                                | From `GET /Category/{id}` |
| Product breadcrumb                                    | `slugs` from client tree  |
| `nl-BE` routes                                        | Uses `slugs.nl`           |
