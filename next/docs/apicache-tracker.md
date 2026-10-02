# API cache tracker – routes and strategy

This document explains how caching works for all APIs: **maxAge**, **staleTime**, and **gcTime**, where to set them (global vs per-query), and the exact strategy used for each API/route.

---

## Part 1: What is maxAge, staleTime, and gcTime?

### Real-world analogy

Think of a **newspaper**:

- **staleTime** = “For how long do we treat this copy as **fresh**?”  
  Example: 30 minutes. For 30 minutes you don’t buy a new paper; you keep reading the same one. After 30 minutes you consider it “old” and might get a new one next time you pass the stand.

- **gcTime** = “How long do we **keep** the copy after we’re done reading?”  
  Example: 60 minutes. If you put the paper down and don’t touch it for 60 minutes, you throw it away. If you pick it up again before 60 minutes, you still have it (and might or might not refetch, depending on staleTime).

- **maxAge** (persistence only) = “How long do we keep the **saved snapshot** (e.g. in localStorage)?”  
  Example: 24 hours. We save a snapshot of all cached data to disk. That snapshot is “valid” for 24 hours. After 24 hours we don’t restore from it; the next load will fetch from the API again.

So:

- **staleTime** → when to consider data “old” and **allow** refetch.
- **gcTime** → when to **delete** unused cache from memory.
- **maxAge** → how long the **persisted** cache (localStorage) is kept.

---

### Code example

```ts
// Per-query override (e.g. in a hook)
queryOptions({
  queryKey: ["brands"],
  queryFn: () => getBrands(),
  staleTime: 30 * 60 * 1000, // 30 min – treat as fresh
  gcTime: 60 * 60 * 1000, // 60 min – keep in memory after unused
  refetchOnMount: false,
});
```

```ts
// Global defaults (provider)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min default
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnMount: false,
    },
  },
});

// Persistence (one setting for the whole cache)
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister: localStoragePersister,
    maxAge: 24 * 60 * 60 * 1000,  // 24h – how long the saved snapshot is valid
  }}
>
```

---

### Where to change: global vs per-query

| Option                   | Global (provider)                                                                                                                                                                 | Per-query (override)                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **staleTime**            | `next/providers/index.tsx` → `QueryClient` → `defaultOptions.queries.staleTime`                                                                                                   | In the hook: `queryOptions({ ... queryKey, queryFn, staleTime: 0 })`                                                                |
| **gcTime**               | Same file → `defaultOptions.queries.gcTime`                                                                                                                                       | In the hook: `queryOptions({ ... gcTime: 5 * 60 * 1000 })`                                                                          |
| **refetchOnMount**       | `defaultOptions.queries.refetchOnMount`                                                                                                                                           | In the hook: `queryOptions({ ... refetchOnMount: "always" })`                                                                       |
| **refetchOnWindowFocus** | `defaultOptions.queries.refetchOnWindowFocus`                                                                                                                                     | In the hook: `queryOptions({ ... refetchOnWindowFocus: false })`                                                                    |
| **maxAge**               | **Only global.** `next/providers/index.tsx` → `PersistQueryClientProvider` → `persistOptions.maxAge`. There is **no per-query maxAge**; the whole persisted cache has one maxAge. | N/A. To “no maxAge” or “maxAge much less”: change `persistOptions.maxAge` (e.g. `1 * 60 * 60 * 1000` for 1h) or remove persistence. |

**How to override for one API (examples):**

- **Much less gcTime for one API:** In that API’s hook (e.g. `next/hooks/productdetails.ts`), add `gcTime: 5 * 60 * 1000` (5 min) to the `queryOptions` for that query.
- **No staleTime (always refetch):** In that hook set `staleTime: 0`.
- **No persistence for one API:** The persister saves the whole cache; TanStack Query doesn’t support “don’t persist this query” out of the box. To effectively avoid long-lived persistence for one API you can: (1) use a shorter global `maxAge`, or (2) call `queryClient.removeQueries({ queryKey: [...] })` when appropriate so that data isn’t in the cache when the next persist runs.
- **maxAge much less globally:** In `next/providers/index.tsx`, set `persistOptions.maxAge` to a smaller value (e.g. 1h). Then **all** persisted data expires sooner.

---

## Part 2: Global defaults (provider)

**File:** `next/providers/index.tsx`

| Setting                | Value | Meaning                                                 |
| ---------------------- | ----- | ------------------------------------------------------- |
| staleTime              | 5 min | Default: data is “fresh” for 5 minutes.                 |
| gcTime                 | 24h   | Default: keep cache in memory for 24h after unused.     |
| refetchOnMount         | false | Default: mounting a component does not trigger refetch. |
| refetchOnWindowFocus   | false | Default: focusing the window does not trigger refetch.  |
| refetchOnReconnect     | false | Default: reconnecting does not trigger refetch.         |
| retry                  | 1     | Default: retry failed requests once.                    |
| **Persistence maxAge** | 24h   | The saved cache in localStorage is valid for 24 hours.  |

Any hook that does **not** pass its own `staleTime` / `gcTime` / `refetchOnMount` uses these defaults.

---

## Part 3: Per-API / per-route strategy

---

### Brands API

**Source:** `next/hooks/brands.ts`  
**Endpoint:** GET /MakeModelType/brands (via search service)  
**Used by:** BrandsContext, allbrands, search flows.

| Setting              | Value           | Meaning                                                                                         |
| -------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| staleTime            | 30 min          | Data is treated as “fresh” for 30 minutes; no refetch just because the component mounted again. |
| gcTime               | 60 min          | After no component uses brands for 60 minutes, the cache is removed from memory.                |
| refetchOnMount       | false           | Opening a page that uses brands does not trigger a refetch.                                     |
| refetchOnWindowFocus | false           | Focusing the tab does not trigger a refetch.                                                    |
| Persistence          | Same 24h maxAge | Brands are stored in the same persisted cache (e.g. localStorage) with 24h maxAge.              |

**When you see fresh brands data:**

| When                                                                 | Do you see fresh data?                                                |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Within 30 min, same page / navigation                                | No – still “fresh”, no refetch.                                       |
| After 30 min, come back to a page that uses brands                   | Usually no – refetchOnMount is false, so mount alone doesn’t refetch. |
| After 60 min without using brands, then open a page that uses brands | Yes – cache was garbage-collected, so a new request is made.          |
| Clear site data / localStorage and reload                            | Yes – no cache, so new request.                                       |
| After 24h and reload (persisted cache expired)                       | Yes – no valid persisted cache, so new request.                       |

So for **brands**: fresh data mainly when cache is gone (after 60 min unused, or after clear storage / 24h persist), not automatically after 30 min.

---

### Translations API

**Source:** `next/hooks/translations.ts`  
**Endpoint:** GET /Translations/:lang  
**Used by:** BrandingContext (when no initialTranslations or after locale change).

| Setting              | Value           | Meaning                                         |
| -------------------- | --------------- | ----------------------------------------------- |
| staleTime            | 30 min          | Data is “fresh” for 30 minutes.                 |
| gcTime               | 60 min          | Cache kept in memory for 60 min after last use. |
| refetchOnMount       | false           | Mount does not trigger refetch.                 |
| refetchOnWindowFocus | false           | Focus does not trigger refetch.                 |
| Persistence          | Same 24h maxAge | Stored in the same persisted cache.             |

**Note:** On first load the server often provides `initialTranslations`, so the client doesn’t run this query until the user **changes locale**.

**When you see fresh translations data:**

| When                                                        | Do you see fresh data?            |
| ----------------------------------------------------------- | --------------------------------- |
| User changes locale (e.g. EN → NL)                          | Yes – new query key, new request. |
| Same locale, within 30 min                                  | No.                               |
| Same locale, after 60 min unused then use that locale again | Yes – cache was gc’d.             |
| Clear site data / reload                                    | Yes.                              |
| After 24h and reload                                        | Yes.                              |

---

### Profile API

**Source:** `next/hooks/profile.ts`  
**Endpoints:** GET /Profile (formation + userData)  
**Used by:** Checkout, profile screens, RedirectManager (cache seeding).

| Query                        | staleTime | gcTime        | refetchOnMount |
| ---------------------------- | --------- | ------------- | -------------- |
| profileFormationQueryOptions | 0         | default (24h) | "always"       |
| userProfileDataQueryOptions  | 0         | default       | —              |

**When you see fresh profile data:** Every time a component that uses this query mounts (refetchOnMount: "always", staleTime: 0). Also when cache is invalidated after login/mutations.

---

### Cart / Order-by-id (cart hook)

**Source:** `next/hooks/cart.ts`  
**Endpoint:** GET /Order/:orderId/...  
**Used by:** Order details, checkout, support.

| Setting        | Value         | Meaning                       |
| -------------- | ------------- | ----------------------------- |
| staleTime      | 0             | Always considered stale.      |
| refetchOnMount | "always"      | Every mount triggers refetch. |
| gcTime         | default (24h) | From provider.                |

**When you see fresh data:** On every visit to a page that uses this query (refetchOnMount: "always").

---

### Orders APIs

**Source:** `next/hooks/orders.ts`  
**Endpoints:** GET /Order (list, pagination, by id, without email), GET /Return/:orderId/:emailId, GET /Order/:orderId/invoice.

| Query                                | staleTime | refetchOnMount | Notes                                  |
| ------------------------------------ | --------- | -------------- | -------------------------------------- |
| allOrdersQueryOptions                | 0         | "always"       |                                        |
| allOrdersSupportQueryOptions         | 0         | "always"       |                                        |
| ordersPaginationInfiniteQueryOptions | 0         | "always"       |                                        |
| orderByIdQueryOptions                | 0         | "always"       |                                        |
| orderByIdWithoutEmailQueryOptions    | 0         | "always"       |                                        |
| returnDetailByIdQueryOptions         | 5 min     | —              | So return details can be cached 5 min. |
| orderInvoiceQueryOptions             | 5 min     | —              | retry: false.                          |

**When you see fresh data:** Orders list / by-id refetch on every mount. Return details and invoice: fresh when cache is older than 5 min or when cache is gone.

---

### Garage APIs

**Source:** `next/hooks/garage.ts`  
**Endpoints:** GET /Garage, GET /Garage/:id, POST/DELETE /Garage.

| Query                               | staleTime       | gcTime  | refetchOnMount                              |
| ----------------------------------- | --------------- | ------- | ------------------------------------------- |
| savedCarsQueryOptions (and aliases) | 60 s            | default | false                                       |
| carByIdQueryOptions                 | default (5 min) | default | —                                           |
| Mutations (add/delete car)          | N/A             | N/A     | Invalidate savedCars/carById after success. |

**When you see fresh garage data:** After 60 s the list is stale; refetch happens only if something triggers it (e.g. invalidateQueries after add/delete). After 24h unused, cache is gc’d so next use fetches again.

---

### Config API

**Source:** `next/hooks/config.ts`  
**Endpoint:** GET /Config  
**Used by:** ConfigProvider, support pages, layout.

| Setting        | Value           | Meaning        |
| -------------- | --------------- | -------------- |
| staleTime      | default (5 min) | From provider. |
| gcTime         | default (24h)   | From provider. |
| refetchOnMount | default (false) | From provider. |

**Note:** Config service also has an in-memory cache (50 min). So config can be up to 5 min stale from React Query and up to 50 min from the service cache.

**When you see fresh data:** When cache is older than 5 min and a refetch is triggered, or when cache is gc’d / cleared.

---

### Search APIs (brands, models, years, types)

**Source:** `next/hooks/search.ts`  
**Endpoints:** GET /MakeModelType/brands, models, years, types (and POST for search).

| Query                    | staleTime       | gcTime  | refetchOnMount |
| ------------------------ | --------------- | ------- | -------------- |
| searchBrandsQueryOptions | default (5 min) | default | —              |
| searchModelsQueryOptions | default         | default | —              |
| searchYearsQueryOptions  | default         | default | —              |
| searchTypesQueryOptions  | default         | default | —              |

Search steps use **defaults** from the provider. Mutations (searchParts) don’t cache.

**When you see fresh data:** When the query key changes (e.g. different brand/model) or when cache is stale and a refetch is triggered (e.g. after 5 min if refetchOnMount were true; currently default is false so no refetch on mount).

---

### Products (parts list + manufacturer)

**Source:** `next/hooks/products.ts`  
**Endpoints:** POST /Parts (parts list with filters), GET /Manufacturer  
**Used by:** Product search result page (products.tsx), shopping cart prefetch.

| Query                     | staleTime | gcTime        | refetchOnMount | Other                       |
| ------------------------- | --------- | ------------- | -------------- | --------------------------- |
| partsInfiniteQueryOptions | 1 min     | default (24h) | true           | refetchOnWindowFocus: false |
| manufacturerQueryOptions  | default   | default       | default        | —                           |

**When you see fresh parts data:** Within 1 min, same URL/filters → cache used, no refetch. After 1 min or on revisit with stale data → refetch (POST /Parts). When **filters/query key change** (new category, manufacturer, etc.) → new request. After 24h unused or clear storage → cache gone, next load fetches.

---

### Product details APIs

**Source:** `next/hooks/productdetails.ts`  
**Endpoints:** GET /parts/:id, GET /stock/:id, GET /Manufacturer, GET /MakeModelType/part/:partId  
**Used by:** Part details page, cart.

| Query                             | staleTime | gcTime  | refetchOnMount  |
| --------------------------------- | --------- | ------- | --------------- |
| instockInformationQueryOptions    | 0         | 0       | —               |
| productFormationQueryOptions      | 5 min     | default | default (false) |
| manufacturerFormationQueryOptions | default   | default | default         |
| matchingCarsQueryOptions          | default   | default | default         |

**When you see fresh data:**

- **In-stock:** Every time you open that part’s page (staleTime 0, gcTime 0).
- **Product info (GET /Parts/{id}):** Within 5 min same part → cache used, no refetch. After 5 min or when cache is gone → refetch. **Manufacturer, matching cars:** When you open a **different** part (new key), or when cache is gone (24h / clear storage).

---

### Categories APIs

**Source:** `next/hooks/appHooks.ts`  
**Endpoint:** GET /Category (and by parentId)  
**Used by:** CategoriesContext, browse-by-category, search/categories.

| Query                          | staleTime       | gcTime  | refetchOnMount |
| ------------------------------ | --------------- | ------- | -------------- |
| categoriesByIdQueryOptions     | 1 min           | default | —              |
| categoriesNestedQueryOptions   | 30 min          | default | false          |
| singleCategoryByIdQueryOptions | default (5 min) | default | —              |

**When you see fresh data:** By id: after 1 min stale or when cache is gone. Nested: similar to brands (30 min fresh, refetchOnMount false). Single by id: default behaviour.

---

### Policy / static pages (return policy, fitment, migration FAQ)

**Source:** `next/hooks/return-policy.ts`, `useFitmentDetails.ts`, `migration-faq.ts`  
**Endpoints:** fetch to /api/return-policy, /api/fitment-details, /api/migration-faq

| Query                      | staleTime | gcTime  | refetchOnMount |
| -------------------------- | --------- | ------- | -------------- |
| returnPolicyQueryOptions   | 0         | default | —              |
| fitmentDetailsQueryOptions | 0         | default | —              |
| migrationFAQQueryOptions   | 0         | default | —              |

**When you see fresh data:** Data is always stale (staleTime 0), so the next time the query is used it will refetch (subject to gcTime: if cache was evicted, refetch; if still in memory, may still refetch because stale). retry: 2 for these.

---

### Address & support

**Source:** `next/hooks/address.ts`, `next/hooks/support.ts`  
**Endpoints:** POST/DELETE /Profile/address, POST /Support, POST /Return

These are **mutations only** (save address, delete address, submit support, submit for return). They don’t have their own cache; they typically invalidate related queries (e.g. profile) after success.

---

## Part 4: Quick reference – where to change what

| Goal                                         | Where to change                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Change default staleTime for all queries     | `next/providers/index.tsx` → `defaultOptions.queries.staleTime`                                              |
| Change default gcTime for all queries        | `next/providers/index.tsx` → `defaultOptions.queries.gcTime`                                                 |
| Change how long persisted cache is valid     | `next/providers/index.tsx` → `persistOptions.maxAge`                                                         |
| One API: no staleTime (always refetch)       | In that hook’s `queryOptions`: `staleTime: 0`                                                                |
| One API: much less gcTime                    | In that hook’s `queryOptions`: `gcTime: 5 * 60 * 1000` (e.g. 5 min)                                          |
| One API: refetch every time component mounts | In that hook’s `queryOptions`: `refetchOnMount: "always"`                                                    |
| maxAge much less or “no maxAge”              | Only in provider: set `persistOptions.maxAge` to a smaller value or remove persistence. No per-query maxAge. |

---

_Last updated from codebase: provider in `next/providers/index.tsx`, hooks in `next/hooks/_.ts`.\*
