# React Query (TanStack Query) — Setup & Optimization Guide

This document defines the standard approach for **client-side data fetching and caching** using [TanStack Query v5](https://tanstack.com/query/latest) in this project. It aligns with the official guides (Queries, Query Keys, Query Functions, Query Options, Invalidation, Invalidations from Mutations, Prefetching, SSR, Advanced SSR, Caching) and enforces **UI → Service → API** layering with **no direct API access from UI components**.

**References:**

- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)
- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
- [Server Rendering & Hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)

---

## 1. Architecture: UI → Service → API

### Rule: No direct API access from UI

- **UI (components, pages, screens)**
  - Only use **React Query hooks** (e.g. `useQuery`, `useMutation`) and optionally **services** that are thin wrappers returning data (no `apiClient`/`fetch` in components).
- **Service layer**
  - Contains all **query functions** and **mutation functions**: calls to `apiClient`, `fetch`, or backend URLs.
  - Services are used **only** by hooks or by other services (e.g. search service calling a shared API helper).
- **API layer**
  - Low-level client (`apiClient`, `fetch` config, headers, base URL).
  - Used **only** by services, never by UI.

```
┌─────────────────────────────────────────────────────────────┐
│  UI (Components / Pages)                                     │
│  • useQuery(…)  useMutation(…)  useQueryClient()             │
│  • No apiClient, no fetch, no direct API URLs                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Hooks (e.g. hooks/brands.ts, hooks/search.ts)               │
│  • queryOptions() with queryKey + queryFn                    │
│  • queryFn calls SERVICE only                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Service (e.g. services/search.ts, services/profile.ts)      │
│  • getBrands(), getProfileInformation(), etc.                │
│  • Uses apiClient / fetch                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  API (config/api.ts, newApiClient, etc.)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. TypeScript

- **Strict typing** is preferred; where API response types are not yet available, **`any` is allowed temporarily**.
- Plan to replace `any` with types from API documentation when available.
- Prefer typing at least:
  - Query key arrays (e.g. `QueryKey` or `readonly ['brands']`).
  - Hook return types when it helps (e.g. `UseQueryResult<YourType>`).
  - Service function signatures (params and return) even if return is `Promise<any>` for now.
- **Rule for temporary `any`:** Wherever `any` is used in the React Query surface (hooks that use `useQuery`/`useMutation`, and services used as `queryFn`/`mutationFn`), add on the same line or the line above: `// TODO: replace with types from api docs`. Scope: only the data-fetching/caching layer (query/mutation hooks and the services they call). Non-query hooks (e.g. `useThemeConfig`, `useClickOutside`) can be excluded.

---

## 2a. Implementation: File structure (industry standard)

Recommended layout for TanStack Query so it matches industry practice and the existing UI → Service → API layering.

**Query keys:** Centralize in one place to avoid typos and keep invalidation consistent. Two common patterns:

- **Option A:** Single file `next/lib/query-keys.ts` (or `next/query/query-keys.ts`) exporting a key factory object, e.g. `queryKeys.brands`, `queryKeys.profile()`, `queryKeys.order(id)`.
- **Option B:** Per-domain key constants next to query options (e.g. inside `next/query/brands.ts`).

**Query / mutation options:** Use `queryOptions()` (and mutation options) so the same key/fn/options are reused by hooks, prefetch, and invalidation. Place them either:

- In the same hook file (e.g. `next/hooks/brands.ts`) and export both `brandsQueryOptions()` and `useBrandQuery()`, or
- In a dedicated `next/query/` (or `next/lib/query/`) folder with one file per domain: `brands.ts`, `profile.ts`, `cart.ts`, `garage.ts`, `categories.ts`, etc., and have hooks in `next/hooks/` call `useQuery(brandsQueryOptions())`.

**Hooks:** Remain under `next/hooks/` and only call service functions inside `queryFn` / `mutationFn`. No `apiClient` or `fetch` in hooks (e.g. orders pagination should eventually move from hook to service).

**Services:** Remain under `next/services/`; all API calls stay here. No structural change.

**Types:** When API types exist, add them under `next/types/` (e.g. `api/profile.ts`, `api/cart.ts`) or next to the API client; query/mutation options and hooks then use these types instead of `any`.

**Suggested directory layout:**

```text
next/
  lib/
    query-keys.ts          # optional: centralized query key factory
  query/                   # optional: queryOptions + mutation options per domain
    brands.ts
    profile.ts
    cart.ts
    garage.ts
    categories.ts
    ...
  hooks/                   # useQuery(domainQueryOptions()), useMutation(...)
    brands.ts
    profile.ts
    cart.ts
    ...
  services/                # getX(), postY() — only place that calls API
  types/                   # API response/request types (when replacing any)
    api/
      profile.ts
      cart.ts
      ...
```

Either (1) query options live in the same hook file, or (2) they live in a separate `query/` (or `lib/query/`) folder. Query keys should be defined in one place per app (single file or per-domain file) and reused everywhere.

**Implementation status:** Query keys are centralized in `next/lib/query-keys.ts`. Hooks use `queryOptions()` (and `infiniteQueryOptions()` where applicable) and call `useQuery(domainQueryOptions())` (or `useInfiniteQuery(domainInfiniteQueryOptions())`); invalidation, prefetch, and `fetchQuery`/`removeQueries` use `queryKeys.*` or the options’ `.queryKey`. No hardcoded query key arrays in hooks or in app/screens/utils.

---

## 3. Query Keys

- Query keys must be **arrays** and **serializable** (no functions, class instances).
- Keys must be **unique per logical resource** and include **all variables** that affect the result.

**Conventions:**

- **List/global resource:** `['brands']`, `['config']`
- **Resource by id:** `['product', productId]`, `['order', orderId]`
- **With filters:** `['parts', filters]`, `['orders', { status, page }]`
- **Deterministic hashing:** `['todos', { page, status }]` and `['todos', { status, page }]` are treated as the same; **array order matters**: `['todos', status, page]` ≠ `['todos', page, status]`.

**Best practice:** Define keys in one place using **query options** (see below) so components and invalidation use the same keys.

---

## 4. Query Functions

- **Any function that returns a Promise** can be a query function.
- It must **resolve with data** or **throw / return a rejected Promise** on error so React Query can set `isError` and `error`.
- If using `fetch`, **throw on `!response.ok`** (or equivalent) so errors are not swallowed.

**Query function variables:** Prefer receiving `{ queryKey }` from the QueryFunctionContext when the key holds parameters:

```ts
queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]);
```

Keep **all API calls inside the service**; the hook’s `queryFn` should only call the service (e.g. `() => getBrands()`).

---

## 5. Query Options (Required Pattern)

Use **`queryOptions()`** from `@tanstack/react-query` to co-locate **queryKey**, **queryFn**, and shared options. This gives:

- Single source of truth for key + fetcher
- Type inference and safer refactors
- Reuse in `useQuery`, `prefetchQuery`, `invalidateQueries`, `setQueryData`

**Example:**

```ts
// hooks/brands.ts or a dedicated query-options file
import { queryOptions } from "@tanstack/react-query";
import { getBrands } from "@/services/search";

export const brandsQueryOptions = () =>
  queryOptions({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

// Usage in component
const { data } = useQuery(brandsQueryOptions());

// Prefetch
queryClient.prefetchQuery(brandsQueryOptions());

// Invalidate
queryClient.invalidateQueries({ queryKey: ["brands"] });
```

For parameterized queries:

```ts
export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });
```

---

## 6. Caching Strategy (Stale-While-Revalidate)

- **staleTime:** How long data is considered “fresh”. While fresh, no refetch on mount/focus.
- **gcTime (formerly cacheTime):** How long inactive query data stays in memory before garbage collection.
- **Background refetch:** When data is stale but still in cache, React Query can show cache and refetch in the background (stale-while-revalidate).

**Important:** **Not all APIs should be cached.** Use the following.

| Use case                                         | staleTime                 | gcTime      | Rationale                                  |
| ------------------------------------------------ | ------------------------- | ----------- | ------------------------------------------ |
| Reference data (brands, config, categories)      | 30 min – 24 h             | ≥ staleTime | Rarely changes; cache aggressively.        |
| User-specific, sensitive (profile, cart, orders) | 0 or short (e.g. 1–5 min) | 5–10 min    | Prefer fresh data or explicit refetch.     |
| Real-time / critical (checkout, payment status)  | 0                         | Short or 0  | Do not rely on cache; refetch when needed. |
| One-off actions (submit form, trigger job)       | N/A                       | N/A         | Use **mutations**, not queries.            |

**Explicit “do not cache”:** For endpoints that must always hit the network (e.g. “refresh profile” on checkout):

- Use `staleTime: 0` and optionally `gcTime: 0`, **or**
- Use `queryClient.invalidateQueries()` before/after and then `refetch()`, **or**
- Use `queryClient.fetchQuery()` when you need a one-off fetch without tying it to cache lifetime.

Document in this file (or in code comments) which resources are “no cache” or “short cache” so future changes stay consistent.

---

## 7. Defaults (QueryClient)

Recommended in `QueryClient` (e.g. in `providers/index.tsx`):

- **staleTime:** e.g. 5 minutes (default for “normal” list/detail data).
- **gcTime:** e.g. 10 minutes.
- **refetchOnMount / refetchOnWindowFocus:** `false` if you prefer to rely on staleTime and explicit invalidation; set to `true` only where you want automatic refetch.
- **structuralSharing:** `true` (default) to avoid unnecessary re-renders when data is referentially equal.

Override per query in `queryOptions()` where needed (e.g. long cache for brands, no cache for profile).

---

## 8. Query Invalidation

- **When:** After a mutation that changes data (e.g. add/update/delete), or when the user does an action that invalidates a view (e.g. “refresh”, “return to list”).
- **How:** `queryClient.invalidateQueries({ queryKey: ['todos'] })`. Queries matching the key are marked stale; if they are currently rendered, they refetch.
- Use **exact: true** to invalidate only the exact key (e.g. `['todos']` but not `['todos', { type: 'done' }]`).
- Use **predicate** for fine-grained rules (e.g. invalidate by key and version).

**Best practice:** Invalidate in **mutation `onSuccess`** (or in the same flow that performs the mutation) so the UI stays in sync. Prefer targeted keys (e.g. `['orders']`, `['profile']`) over global `invalidateQueries()`.

---

## 9. Invalidations from Mutations

After a mutation succeeds, invalidate related queries so they refetch:

```ts
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

If multiple query keys are affected, use `Promise.all` with multiple `invalidateQueries` calls. Return a Promise from `onSuccess` if you need the mutation to “finish” only after invalidation (and optional refetch) completes.

---

## 10. Prefetching

- Use **prefetchQuery** when you know data will be needed soon (e.g. route transition, hover).
- Prefetch respects **staleTime**: if cache is still fresh, prefetch may not trigger a network request.
- Use **fetchQuery** when you need the data as a Promise (e.g. in a loader or guard); it will throw on error, unlike prefetchQuery.

**Where to prefetch:**

- **Event handlers:** e.g. `onMouseEnter` / `onFocus` on a link to prefetch the target page’s data.
- **Router integration:** prefetch in route loaders or in Next.js App Router (e.g. Server Component or layout) and pass dehydrated state to `<HydrationBoundary>` for SSR (see official SSR guides).
- **Parent components:** prefetch a child’s query so when the child mounts it gets cache hit (flattens waterfalls).

Do **not** put API or low-level fetch logic in the UI; the prefetch should use the same `queryOptions()` and thus the same service-backed `queryFn`.

---

## 11. SSR & Hydration (Next.js)

- **Per-request client:** Create a new `QueryClient` per request on the server so data is not shared between users.
- **Prefetch** in the server context (e.g. Server Component or getServerSideProps), then **dehydrate** and pass the state to the client.
- **HydrationBoundary:** Wrap the client tree with `<HydrationBoundary state={dehydratedState}>` so the client React Query cache is primed and no duplicate request is made for the same key.
- **staleTime:** Set a non-zero default (e.g. 60s) for SSR so that hydrated data is not immediately refetched on the client.

Details: [Server Rendering & Hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).

---

## 12. Deduplication & Redundant Calls

- **Same queryKey + same queryFn** = one active request; multiple components using the same `useQuery(options)` share the same cache and in-flight request.
- Ensure **all consumers** of a resource use the **same query key** (via shared `queryOptions()`). Avoid calling the **service/API directly** from components or stores; that bypasses React Query and causes duplicate calls.
- **Stores (Zustand, etc.):** If they need server data, they should either:
  - Use **queryClient.getQueryData() / fetchQuery()** with the same key as the hook, or
  - Trigger a refetch/invalidation and let components read from `useQuery`; stores hold UI state only, not server cache.

---

## 13. Checklist for New Features

1. **API call** lives only in **service** (e.g. `services/…`).
2. **Query/mutation** is defined with **queryOptions()** (or mutation options) with a clear **queryKey** and **queryFn** that calls the service.
3. **UI** uses only **useQuery** / **useMutation** (and optionally **useQueryClient** for invalidation/prefetch); no `apiClient` or `fetch` in components.
4. **Caching:** Choose **staleTime** / **gcTime** (or no cache) per resource; document “no cache” or “short cache” where applicable.
5. **Mutations** invalidate related queries in **onSuccess** (or equivalent).
6. **TypeScript:** Prefer types; use **any** only where API types are pending, and plan to replace later.

---

## 14. Summary

| Topic        | Approach                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| Layering     | UI → Hooks (queryOptions) → Service → API; no direct API in UI.                      |
| Keys         | Arrays, serializable, unique per resource; include variables.                        |
| Options      | Use **queryOptions()** for every query; reuse in useQuery, prefetch, invalidate.     |
| Caching      | Not all APIs are cached; use staleTime/gcTime per resource; document no-cache cases. |
| Invalidation | After mutations; use targeted queryKey; prefer onSuccess.                            |
| Prefetch     | Use queryOptions(); no API in UI.                                                    |
| SSR          | Per-request client, prefetch, dehydrate, HydrationBoundary.                          |
| Types        | Prefer strict types; allow **any** temporarily until API types exist.                |

This setup keeps a single source of truth for client data (React Query), avoids redundant requests, and keeps a clear separation between UI, service, and API layers.

---

## 15. Implementation TODO — Subtasks & Areas to Change

**Strict rules (must be enforced):**

- **No duplicate same API calls** — identical requests must be deduplicated via React Query (same queryKey).
- **Brand & Category APIs** — must be called **once on app load** (e.g. at root/layout or a single provider); all consumers use the same React Query cache.
- **Garage (saved cars) API** — when authentication state changes, **must not be called multiple times**; single source (e.g. one hook with `enabled: isAuthenticated`), no parallel refetches from multiple components.
- **Checkout Calculate API** — must run **once** per valid state: **wait for Profile/Address API to finish first** (logged-in), then call Calculate; **guest user** = no Profile API, so call Calculate **once per tab** (e.g. Personal/Business).

**Note — Shopping cart page:** In `next/screens/shoppingcart/shoppingcartpage.tsx` the **Calculate API is currently cached/reused**: the page uses `useCalculatePriceMutation` and in `onSuccess` it (1) updates cart from the Calculate response, (2) stores VAT in a ref (`vatFromCalculateApi`) for reuse by children so Calculate is not called again for that, (3) uses `ProductCacheService.get/set` and `getProductInformation` per cart item for product details. When unifying with React Query: consider caching the Calculate result (e.g. via a query key derived from cart + address) so cart page and checkout share the same strategy; replace ProductCacheService/product-detail fetches with React Query (e.g. product-detail query by id).

**TypeScript note:** We allow `any` for now; below we note **where and which APIs** need strict types once API documentation is available. Plan to replace all `any` in query/mutation types, service return types, and component props that come from these APIs.

---

### TODO 1 — Audit: Pages / routes / subcomponents — API usage to change

Go through all App Router pages, routes, layouts, and their subcomponents; ensure all client-side API usage goes through React Query (or mutations) with UI → Service → API layering. Below is the **audit list** of areas that need changes. **Landing header-row, left-navbar, hamburger-menu** use `getProfile` / `postAuthDetails`; **BrandsAndPartsSection** uses `getAvailableBrands`, `getBrandsWithCarImage` — all must go through React Query (no direct service in UI).

#### Root / layout

| Location                                | Current API usage                                         | Change needed                                                                                                                                         |
| --------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next/app/layout.tsx`                   | `getConfig()` (server), `getTranslations()` (server)      | Keep server calls as-is; if any client config/translations fetch exists elsewhere, unify with React Query.                                            |
| `next/app/(public)/RedirectManager.tsx` | `getProfile()` (authService) direct call                  | Use React Query (e.g. profile query or dedicated auth query); avoid direct service call from UI.                                                      |
| `next/app/registry.tsx`                 | Wraps `BrandsProvider` (context that fetches brands once) | Prefer single React Query source for brands (e.g. root prefetch or one `useQuery` in provider); remove or align BrandsContext with React Query cache. |

#### Public routes — pages that use hooks / services

| Route / page                                                                                                                                                              | Files              | API / data usage                                                                                                  | Change needed                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(public)/[language-country]/page.tsx`                                                                                                                                    | Landing            | Uses `useBranding`, `BrowseByCategory`, `BrowseByCategory2` (categories)                                          | Ensure categories from single `useFetchCategoriesNested` (same queryKey app-wide). Brands: single source on app load.                                                                                                                           |
| `(public)/[language-country]/shoppingcart/page.tsx`                                                                                                                       | Cart               | Renders `Shoppingcartpage` which uses `useCalculatePriceMutation`, `ProductCacheService`, `getProductInformation` | **See note above.** Cart page caches Calculate API result (VAT ref) and uses ProductCacheService + getProductInformation; unify with React Query (Calculate cache, product cache). No duplicate Calculate; single product-detail source per id. |
| `(public)/[language-country]/shoppingcart/checkout/page.tsx`                                                                                                              | Checkout           | `useGetProfileQuery`, `getProfileInformation` direct, `useCalculatePriceMutation`, address hooks                  | **See TODO 2.** Profile must complete before Calculate (logged-in); guest = Calculate once per tab. All via React Query / mutations; no direct `getProfileInformation` in component.                                                            |
| `(public)/[language-country]/pieces-auto/page.tsx`                                                                                                                        | Pieces-auto        | `useQueryClient`, invalidates `get-my-saved-cars`                                                                 | Use single Garage query; ensure invalidation only when mutation succeeds; no duplicate Garage fetch on auth change.                                                                                                                             |
| `(public)/[language-country]/auto-onderdelen/page.tsx`                                                                                                                    | Auto Onderdelen    | Same as pieces-auto                                                                                               | Same as above.                                                                                                                                                                                                                                  |
| `(public)/[language-country]/search/manually/page.tsx`                                                                                                                    | Search manually    | Uses Branding, search flows                                                                                       | Brands/categories from app-level or shared hooks only.                                                                                                                                                                                          |
| `(public)/[language-country]/search/manually/mobileFiles/BottomGrid.tsx`                                                                                                  | BottomGrid         | `useGetMySavedCarsQuery`, `useQueryClient`, invalidates Garage                                                    | Ensure one Garage query key; `enabled: isAuthenticated` where appropriate; no duplicate calls on auth change.                                                                                                                                   |
| `(public)/[language-country]/search/manually/RightPanel.tsx`                                                                                                              | RightPanel         | Same as BottomGrid (Garage)                                                                                       | Same as above.                                                                                                                                                                                                                                  |
| `(public)/[language-country]/search/categories/page.tsx`                                                                                                                  | Categories         | `useBranding`, category modal state                                                                               | Categories from `useFetchCategoriesNested` (single key).                                                                                                                                                                                        |
| `(public)/[language-country]/search/categories/CategoryList.tsx`                                                                                                          | CategoryList       | `useFetchCategoriesNested`                                                                                        | Keep; ensure queryKey `get-l2-l3-categories-nested` is unique and used app-wide (one call on load where possible).                                                                                                                              |
| `(public)/[language-country]/search/categories/LeftColumn.tsx`, `RightColumn.tsx`, `l2-l3-category-block.tsx`, `L1CategoriesBlock.tsx`, `main-block.tsx`, `RCatBlock.tsx` | Category UI        | Some use `useFetchCategoriesNested`                                                                               | All must use same queryKey; no extra category API from stores or direct service.                                                                                                                                                                |
| `(public)/[language-country]/search/vin-number/*`                                                                                                                         | VIN steps          | useBranding                                                                                                       | No direct API; ensure labels/translations from shared source.                                                                                                                                                                                   |
| `(public)/[language-country]/products/page.tsx`                                                                                                                           | Products           | **Server:** `getTranslations(lang)`, `getCategories` (passed as `partsCategory`)                                  | Products list via React Query. If `getCategories` is used on client elsewhere, use same React Query category source; avoid duplicate category calls.                                                                                            |
| `(public)/[language-country]/car-parts/page.tsx`, `auto-onderdelen/page.tsx`, `pieces-auto/page.tsx`                                                                      | Catalog            | BrowseByCategory, RightColumn, etc.                                                                               | Categories/brands once on app load; catalog pages only consume cache.                                                                                                                                                                           |
| `(public)/[language-country]/category-selection/page.tsx`                                                                                                                 | Category selection | Same pattern                                                                                                      | Same as above.                                                                                                                                                                                                                                  |
| `(public)/[language-country]/garage-bay/page.tsx`, `my-saved-cars/page.tsx`, `my-saved-car/page.tsx`, `my-saved-cars/[cardId]/page.tsx`                                   | Garage bay         | Use garage screens (MySavedCars, CarDetailView, etc.)                                                             | Garage API: single hook (`useGetMySavedCarsQuery`) with one queryKey; ensure `enabled: isAuthenticated` and no refetch storm on auth change.                                                                                                    |
| `(public)/[language-country]/support/page.tsx`, `support/[category]/page.tsx`                                                                                             | Support            | `getConfig()` in page (server)                                                                                    | If config is also used on client elsewhere, unify with React Query (e.g. get-config).                                                                                                                                                           |
| `(public)/[language-country]/telemetry/page.tsx`                                                                                                                          | Telemetry          | Direct `fetch` to `/api/telemetry/*`                                                                              | Prefer React Query or a single service layer; no raw fetch in page if it’s reusable data.                                                                                                                                                       |
| `(public)/[language-country]/payment-status/page.tsx`                                                                                                                     | Payment status     | Likely order/payment hooks                                                                                        | Confirm single source for order status.                                                                                                                                                                                                         |
| `(public)/[language-country]/returns/[orderId]/[emailId]/page.tsx`                                                                                                        | Returns            | Return details                                                                                                    | Use hooks from `hooks/orders.ts` (or similar); no direct API in page.                                                                                                                                                                           |
| `(public)/[language-country]/allbrands/page.tsx`                                                                                                                          | All brands         | **Server:** `getTranslations(lang)`                                                                               | AllBrands screen; brands from single app-level fetch; page only consumes cache.                                                                                                                                                                 |
| `(public)/[language-country]/fitment-details/page.tsx`                                                                                                                    | Fitment details    | **Server:** `getTranslations(lang)`                                                                               | Content via fitment hook/API; translations from shared source.                                                                                                                                                                                  |
| `(public)/[language-country]/return-policy/page.tsx`                                                                                                                      | Return policy      | **Server:** `getTranslations(lang)`                                                                               | Policy content; translations shared.                                                                                                                                                                                                            |
| `(public)/[language-country]/migration-faq/page.tsx`                                                                                                                      | Migration FAQ      | **Server:** `getTranslations(lang)`                                                                               | FAQ content; translations shared.                                                                                                                                                                                                               |
| `(public)/[language-country]/about-us/page.tsx`                                                                                                                           | About us           | **Server:** `getTranslations(lang)`                                                                               | About content; translations shared.                                                                                                                                                                                                             |
| `(public)/[language-country]/[searchdata]/page.tsx`                                                                                                                       | Search results     | **Server:** `getTranslations(lang)` (called twice in flow)                                                        | Ensure translations fetched once per request; search data via React Query.                                                                                                                                                                      |
| `(public)/page.tsx`                                                                                                                                                       | Public root        | **Server:** `getTranslations(lang)`                                                                               | Redirect/landing; translations shared.                                                                                                                                                                                                          |
| `(public)/[language-country]/cart/shared/[orderId]/page.tsx`                                                                                                              | Shared cart        | **Server:** `getOrderByIdWithoutemail(params["orderId"])` direct in page                                          | Use React Query (e.g. order/cart by id hook); same queryKey for shared cart.                                                                                                                                                                    |
| `(public)/[language-country]/drive-assist/page.tsx`                                                                                                                       | Drive assist       | —                                                                                                                 | Confirm no direct API in page or its components.                                                                                                                                                                                                |
| `(public)/[language-country]/pit-stop/page.tsx`                                                                                                                           | Pit stop           | —                                                                                                                 | Confirm no direct API in page or its components.                                                                                                                                                                                                |
| `(public)/[language-country]/checkout-options/page.tsx`                                                                                                                   | Checkout options   | —                                                                                                                 | Confirm no direct API; use hooks only.                                                                                                                                                                                                          |
| `(public)/[language-country]/[...slug]/page.tsx`                                                                                                                          | Catch-all slug     | —                                                                                                                 | Confirm no direct API; use hooks only.                                                                                                                                                                                                          |
| `(public)/[language-country]/notFoundPage/page.tsx`                                                                                                                       | Not found          | —                                                                                                                 | Confirm no direct API.                                                                                                                                                                                                                          |
| `(public)/[language-country]/og-search/page.tsx`, `og-search/[searchBy]/page.tsx`                                                                                         | OG search          | Uses og-search screens (Garage, etc.)                                                                             | Same Garage/category rules; no duplicate API.                                                                                                                                                                                                   |
| `news-feed/news-and-feed/page.tsx`, `dashboard/dashboard-layout/page.tsx`                                                                                                 | News, dashboard    | —                                                                                                                 | Confirm all data via React Query.                                                                                                                                                                                                               |
| `auth/splash-screen/page.tsx`, `signin/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `create-password/page.tsx`                                               | Auth               | Likely auth only                                                                                                  | No duplicate profile/cart API; use auth + profile hooks where needed.                                                                                                                                                                           |
| `forbidden/page.tsx`                                                                                                                                                      | Forbidden          | —                                                                                                                 | No API.                                                                                                                                                                                                                                         |
| `(public)/[language-country]/design-system/page.tsx`, `design-system/test/page.tsx`, `qv/page.tsx`, `og/page.tsx`                                                         | Design system      | —                                                                                                                 | No API or demo only.                                                                                                                                                                                                                            |
| `(public)/[language-country]/test/page.tsx`, `test/h/page.tsx`, `test-server/page.tsx`, `test-mme/page.tsx`, `test-mme/[search-data]/page.tsx`                            | Test pages         | Various                                                                                                           | Test only; align with React Query if they call real APIs.                                                                                                                                                                                       |

#### Protected routes (profile, orders)

| Route                                                                                                                     | Files                     | API usage                                                                      | Change needed                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `(protected)/[language-country]/profile/page.tsx`, `info/page.tsx`, `orders-returns/page.tsx`, `saved-addresses/page.tsx` | Profile                   | Profile/orders/addresses hooks                                                 | All via React Query; no direct `getProfileInformation` or profile service in components.                                            |
| `(protected)/[language-country]/profile/order-details/[orderId]/[emailId]/page.tsx`                                       | Order details             | **Uses `getOrderById(orderId, emailId)`** (from services/cart) in hook or page | Use React Query only (e.g. `useOrderById` from `hooks/cart.ts`); same queryKey for order details. No direct `getOrderById` in page. |
| `(protected)/[language-country]/order-details/page.tsx`                                                                   | Order details (alternate) | Same                                                                           | Same as above.                                                                                                                      |

#### Screens used by app routes (ensure no direct API in UI — full list)

| Screen / component      | Location                                                                                                                                          | API usage                                                                                                                                                                                         | Change needed                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Checkout page**       | `screens/shoppingcart/checkout/page.tsx`                                                                                                          | Profile direct (`getProfileInformation`), `getAllOrders`, `saveCart` (mutation), `getProfile` (authService)                                                                                       | **TODO 2** — Calculate once after Profile; guest once per tab. All data via React Query/mutations; no direct service calls.                |
| **Shopping cart page**  | `screens/shoppingcart/shoppingcartpage.tsx`                                                                                                       | **Caches Calculate API** (VAT ref, cart from mutation onSuccess); `ProductCacheService.get/set`; `getProductInformation` per item                                                                 | Unify with React Query: Calculate result cache; product details via React Query per id; remove ProductCacheService in UI.                  |
| **Cart variants**       | `screens/shoppingcart/shoppingcartnew.tsx`, `shoppingcartbk2.tsx`, `shoppingcartbk.tsx`                                                           | Same: `useCalculatePriceMutation`, `ProductCacheService`, `getProductInformation`                                                                                                                 | Same strategy as shoppingcartpage.                                                                                                         |
| **Cart card / delete**  | `screens/shoppingcart/OGcart-card.tsx`, `ConfirmationDelete.tsx`                                                                                  | `useCalculatePriceMutation`                                                                                                                                                                       | Keep mutation; single Calculate source.                                                                                                    |
| **Shopping cart email** | `screens/shoppingcart/shoppingcartemail.tsx`                                                                                                      | `getProfile(AuthUserObject)` direct                                                                                                                                                               | Use React Query profile hook; no direct getProfile.                                                                                        |
| Garage screens          | `screens/garage-bay/*` (CarDetailView, CarDetailsMobileView, MySavedCars, SavedCarsListView, etc.)                                                | Multiple `useGetMySavedCarsQuery` + invalidations                                                                                                                                                 | Single queryKey; avoid duplicate refetches; consider `enabled: isAuthenticated` at hook level.                                             |
| Landing                 | `screens/landing/*` (hero-section, browse-by-category-2, footer BrandsAndPartsSection, etc.)                                                      | `useFetchCategoriesNested`, `useGetMySavedCarsQuery` (landing variant)                                                                                                                            | Categories: one key app-wide. Garage: one key; landing can use same or a dedicated “landing” key that’s populated once when authenticated. |
| Search modal            | `screens/search/search-modal.tsx`                                                                                                                 | `useGetMySavedCarsQuery`, refetch/invalidate                                                                                                                                                      | Same Garage key; no duplicate calls.                                                                                                       |
| OG Search               | `screens/og-search/SavedCars.tsx`, `SavedCarContainer.tsx`, `SearchPanel.tsx`, `SavedCarContent.tsx`                                              | Multiple `useGetMySavedCarsQuery` / refetch                                                                                                                                                       | Consolidate to one hook usage; invalidate only on mutation success.                                                                        |
| Products                | `screens/products/products.tsx`, `PageHeadingBlock.tsx`                                                                                           | `useFetchCategoriesNested`                                                                                                                                                                        | Same category key.                                                                                                                         |
| **Profile**             | `screens/profile/ProfileInformation.tsx`, `AddressBox.tsx`, `EditAddressModal.tsx`, `SavedAddresses.tsx`, `ReturnDetails.tsx`, `OrderDetails.tsx` | **ProfileInformation:** `getProfileInformation()` direct; **AddressBox, EditAddressModal, SavedAddresses:** `getProfile({})` direct; **ReturnDetails, OrderDetails:** useQueryClient + getProfile | All profile/address/order via React Query; no direct getProfile or getProfileInformation.                                                  |
| **Support**             | `screens/support/SupportForm.tsx`                                                                                                                 | `getOrderById(...)` direct                                                                                                                                                                        | Use React Query order-by-id hook; no direct getOrderById in UI.                                                                            |
| **Advanced search**     | `screens/advanced-search/adv-search-modal.tsx`                                                                                                    | `getCategories` from advancedSearchService (import; one use commented)                                                                                                                            | If category fetch used, use React Query category hook (same key app-wide).                                                                 |
| **Components**          | `components/SearchContainerWrapper.tsx`                                                                                                           | `checkPartCompatibility(currentMakeModelTypeId, partId)` direct                                                                                                                                   | Use React Query (e.g. compatibility query); no direct service in component.                                                                |
| Contexts                | `contexts/BrandsContext.tsx`, `SavedCarsContext.tsx`                                                                                              | BrandsContext fetches brands; SavedCarsContext calls `getMySavedCars()`                                                                                                                           | Replace with React Query: brands from one query; saved cars from `useGetMySavedCarsQuery` or queryClient.                                  |

#### Helpers / stores that call APIs (must not be only source of client data)

| Location                                                           | API usage                                | Change needed                                                                                                             |
| ------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `helpers/UtilityHelper.ts`                                         | `getCategories(parentNode?.id)` etc.     | Use React Query (queryClient.fetchQuery or hook) with same category key; or move to service and call from queryFn only.   |
| `helpers/PageTitleHelper.ts`                                       | `getCategories`, `getCategoryByIdNested` | No direct getCategories in helpers used by UI — use queryClient or pass data from React Query.                            |
| `stores/useCategorySearchStore.ts`, `useNewCategorySearchStore.ts` | `getCategories`, `getCategoryByIdNested` | Stores should not fetch; use queryClient.getQueryData/fetchQuery with shared category key or let components use useQuery. |
| `stores/useAdvancedSearchStore.ts`                                 | `getCategories(parentCategoryId)`        | No direct API in store; use queryClient or hook.                                                                          |
| `stores/useLandingPageDataStore.ts`                                | `getBrandsWithCarImage`, `getBrands`     | Use React Query brands data (queryClient or hook).                                                                        |
| `stores/useNewSearchModalStore.ts`                                 | `getAvailableBrands` (commented)         | If re-enabled, use React Query brands only.                                                                               |

#### API routes (server)

| Route                                                                                  | Usage                                           | Note                                                                                                                          |
| -------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `app/api/brands/route.ts`                                                              | `getBrands()`                                   | Server-only; keep. Ensure client never calls this route for “brands list” — client uses React Query with same backend source. |
| `app/api/fitment-details/route.ts`, `return-policy/route.ts`, `migration-faq/route.ts` | fetch to CDN                                    | Server-only; no change for client caching.                                                                                    |
| `app/api/translation/[lang]/route.ts`                                                  | apiClient                                       | Server; if client needs translations, consider a client-side query that calls this route or a dedicated translation hook.     |
| `app/api/test-cache/route.ts`                                                          | `getTranslations`, `getCategories`, `getBrands` | Test only; can remove or align with React Query later.                                                                        |

#### APIs / services to type strictly later (replace `any`)

- **Profile:** `getProfileInformation`, `getProfile` (authService), profile response (addresses, user fields).
- **Auth:** `postAuthDetails` (authService) request/response.
- **Cart / Checkout:** Calculate payload and response (`saveCart`), cart items, order summary; address payloads (billing, delivery, warehouse); **`getOrderById`**, **`getOrderByIdWithoutemail`** request/response.
- **Garage:** `getMySavedCars` request/response; saved car model.
- **Brands:** `getBrands` response; **`getAvailableBrands`**, **`getBrandsWithCarImage`** (landingPageDataService) response.
- **Categories:** L2/L3 categories response (`get-l2-l3-categories-nested`, etc.); category tree type; **`getCategories`**, **`getCategoryByIdNested`** (advancedSearchService) request/response.
- **Products:** **`getProductInformation`** (productdetailsservice) request/response; **`checkPartCompatibility`** request/response.
- **Config:** `getConfig` response (support categories, theme, etc.).
- **Orders:** `getAllOrders`, order details, return details (hooks/orders.ts).
- **Search:** `getModels`, `getYears`, `getTypes`, search parts response.
- **Translations:** `getTranslations` response (if typed on client).

---

### TODO 2 — Checkout: Calculate API once (after Profile/Address; guest once per tab)

**Current behavior (to fix):**

- On load, Calculate is triggered once when Purchase type tab renders, and again when profile/address data is fetched — so it runs more than once.
- Desired: **wait for Profile/Address API to complete first** (logged-in user), then call Calculate **once**. For **guest user**, there is no Profile API, so call Calculate **once per tab** (e.g. Personal vs Business).

**Tasks:**

1. Ensure **logged-in flow:** Profile/Address fetch (e.g. `getProfileInformation` or React Query profile query) runs first; only after it has completed and address state is ready, trigger **one** Calculate call (no duplicate on “tab render” then “profile done”).
2. **Guest flow:** No profile fetch; trigger Calculate **once** when the active tab (e.g. Personal/Business) and any guest form inputs required for the payload are ready.
3. Remove any direct `getProfileInformation({ skipCache: true })` from the checkout page; use React Query profile query (or a single fetch that fills React Query cache) so that “wait for profile” is “wait for query success” then run Calculate.
4. Keep existing deduplication (e.g. `lastCalculateSignatureRef`) but ensure the **ordering** is correct: profile/address ready → then one Calculate.

**File:** `next/screens/shoppingcart/checkout/page.tsx`

---

### TODO 3 — Checkout page: split into smaller components (industry standard)

**Current state:** Checkout page is very large (~3000+ lines), which hurts maintainability and testability.

**Tasks:**

1. **Audit** the checkout page: identify logical sections (e.g. purchase type tabs, address accordion, delivery method, billing block, payment summary, actions).
2. **Extract components** without breaking behavior:
   - e.g. `CheckoutPurchaseTypeTabs`, `CheckoutAddressSection`, `CheckoutDeliveryMethod`, `CheckoutBillingBlock`, `CheckoutOrderSummary`, `CheckoutActions`.
3. **Pass only needed props/callbacks**; avoid prop drilling (consider small context or hooks for checkout-specific state if needed).
4. **Keep API and business logic** in hooks or a single orchestration layer (e.g. custom hook `useCheckout`) so components stay presentational where possible.
5. **Industry standard:** Single responsibility per component; readable file size (e.g. &lt; 300–400 lines per file); clear naming and folder structure (e.g. `checkout/` with subcomponents).

**File:** `next/screens/shoppingcart/checkout/page.tsx` (and new files under e.g. `screens/shoppingcart/checkout/components/` or similar).

---

### Summary of TODO order

1. **TODO 1** — Audit and list (this section) is done; next step is to **implement** changes route by route (Brand/Category once on load, Garage single key + no duplicate on auth, all UI → hooks → service → API).
2. **TODO 2** — Checkout Calculate once: implement after or in parallel with checkout refactor (TODO 3) so ordering (Profile → Calculate) and guest (once per tab) are correct.
3. **TODO 3** — Checkout split: can be done in parallel; splitting first may make TODO 2 easier to implement in a single place (e.g. `useCheckout` or main checkout container).
