# Plan: Rename URL `carId` → `brandId` (part-brand manufacturer id)

## Status (superseded for Brand+L3 URL)

Brand+L3 **no longer** puts manufacturer id in the query. Clean path only; `brand.id` from slug API.

Historical rename `carId` → `brandId` still matters for:

- SEO strip/nofollow of residual `brandId` / legacy `carId`
- Legacy bookmark redirect → clean path
- Search-results / Parts still use **`manufacturerIds`**

See [brand-l3-carId-seo.md](./brand-l3-carId-seo.md).

---

**Original scope (kept for history):** New brand features only (Car Part Brands list / landing / Brand+L3).  
**Replace:** query param **`carId`** (singular) = part-brand / manufacturer id.  
**Do not touch:** **`carIds`** (plural) = vehicle / Cars API ids.  
**Parts API:** keep sending **`manufacturerIds: [brand.id]`** (not rename the Parts body field unless backend asks).

Related: [new-brand-page.md](./new-brand-page.md), [brand-l3-carId-seo.md](./brand-l3-carId-seo.md).

---

## Glossary (after change)

| Param / field                               | Meaning                                                             | Change?                                           |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| **`brandId`** (URL query)                   | Part-brand manufacturer id (`GET /Manufacturer/slug/{slug}` → `id`) | **NEW name** (was `carId`)                        |
| **`carIds`** (URL query)                    | Vehicle id(s)                                                       | **Unchanged**                                     |
| **`vin`**                                   | VIN marker                                                          | **Unchanged**                                     |
| **`manufacturerIds`** (POST `/Parts` body)  | Array of manufacturer ids for product filter                        | **Unchanged** — value comes from URL `brandId`    |
| **`carId`** on Garage / Cars / hero objects | Cars API vehicle id in **JSON models**                              | **Out of scope** — not a URL query on brand pages |

### Collision warning (confirm before implement)

Search-results already allows a query/filter key **`brandId`** in `ProductFilters` / `searchResultsQueryAllowlist.ts`, and Parts payloads historically have a separate `brandId` field alongside `manufacturerIds`.

| Context                        | `brandId` means today / after                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Brand+L3 URL                   | **After:** manufacturer id (this rename)                                                    |
| Search-results URL `?brandId=` | Existing ProductFilters key (vehicle/make-related or legacy Parts field) — **do not break** |

**FE rule:** On brand tree routes only, read/write `?brandId=` as manufacturer id and map to `manufacturerIds`. Do **not** globally treat every `brandId` query as manufacturer id on search-results unless product confirms they are the same concept.

---

## Why

Client feedback: `?carId=` on Brand+L3 looks like a selected vehicle. Renaming to **`brandId`** matches “part brand” and avoids confusing it with **`carIds`**.

SEO rules stay the same:

- Canonical / sitemap / hreflang / JSON-LD = **clean path** (no `brandId` / `carIds` / `vin`)
- App may still redirect Brand+L3 clean URL → `?brandId={manufacturerId}` for Parts filtering (same behaviour as today’s `carId` redirect)

---

## Target URL shapes

**Before**

```text
/en-BE/car-parts-brands/bosch/air-filter?carId=AJzGJJJzGJJJzG
/en-BE/car-parts-brands/bosch/air-filter?carId=AJzGJJJzGJJJzG&carIds=mod8…&vin=VF7…
```

**After**

```text
/en-BE/car-parts-brands/bosch/air-filter?brandId=AJzGJJJzGJJJzG
/en-BE/car-parts-brands/bosch/air-filter?brandId=AJzGJJJzGJJJzG&carIds=mod8…&vin=VF7…
```

Brand landing stays clean (no brand id in URL):

```text
/en-BE/car-parts-brands/bosch
/en-BE/car-parts-brands/bosch?carIds=…&vin=…   # vehicle only
```

**Parts SSR / client filter (unchanged contract):**

```json
{
  "categoryId": "L3_ID",
  "manufacturerIds": ["AJzGJJJzGJJJzG"],
  "carIds": null
}
```

where `manufacturerIds[0]` = URL `brandId` (or slug-API `brand.id` when redirecting).

---

## Code touch list (FE)

### A. Emit `brandId` on brand → L3 links

| File                                                  | Change                                         |
| ----------------------------------------------------- | ---------------------------------------------- |
| `screens/car-part-brands/CarPartBrandLandingPage.tsx` | `?carId=` → `?brandId=` when building L3 hrefs |
| Comments / JSDoc on landing + L3 shell                | Update glossary                                |

### B. Brand+L3 page: read / redirect / Parts

| File                                                         | Change                                                                                                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(public)/…/manufacturers/[brandSlug]/[l3Slug]/page.tsx` | `searchParams.carId` → `brandId`; redirect helper sets `brandId`; `manufacturerIds: [brandId]`; rename `buildCarIdRedirectUrl` → `buildBrandIdRedirectUrl` |
| Soft-404 / metadata Parts probe                              | Same mapping                                                                                                                                               |

**Redirect rules (same as today, new name):**

1. Missing `brandId` or `brandId !== brand.id` → redirect to path + `?brandId={brand.id}` (+ preserve `carIds` / `vin`)
2. Optional **compat:** if only legacy `?carId=` present → 308/redirect to same URL with `brandId` and drop `carId` (recommended short period)

### C. Client product grid on Brand+L3

| File                                             | Change                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `screens/category/CategoryL3TopPartsSection.tsx` | Read `searchParams.get("brandId")` (and briefly fall back to `carId` if compat); still pass as `manufacturerIds` |
| `CategoryL3TopPartsSectionServer.tsx`            | Props already use `manufacturerIds` — callers pass brand id; comments only                                       |

### D. SEO strip / nofollow (OD-2300)

| File                         | Change                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `utils/seoUrlParams.ts`      | Strip + nofollow **`brandId`**; remove **`carId`** from brand SEO helpers **or** keep both during compat window |
| `utils/seoUrlParams.test.ts` | Update examples to `brandId`; add cases that `carIds` still stripped separately                                 |

### E. Vehicle append helpers

| Concern                                  | Change                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appendVehicleContextToHref`             | Must **preserve** existing `brandId` on href when adding `carIds`/`vin` (today it replaces query keys carefully — verify it does not drop `brandId`) |
| Locale switch / category-locale-redirect | Preserve `brandId` on Brand+L3 like today’s `carId` (if currently preserved via raw search string, verify after rename)                              |

### F. Docs

| File                                 | Change                                                              |
| ------------------------------------ | ------------------------------------------------------------------- |
| `docs/new-brand-page.md`             | Glossary + all examples `carId` → `brandId`                         |
| `docs/brand-l3-carId-seo.md`         | Rename doc or retitle to `brand-l3-brandId-seo.md`; update all copy |
| `docs/seo-brand-pages-mapping.md`    | Update URL examples                                                 |
| `docs/category-detail-by-id-plan.md` | Mentions of `carId` redirect only if still relevant                 |

### G. Tests

| File                           | Change                    |
| ------------------------------ | ------------------------- |
| `utils/seoUrlParams.test.ts`   | `brandId` strip/nofollow  |
| Any brand L3 URL builder tests | Assert `brandId=` in href |
| Manual QA checklist below      |                           |

---

## Explicit non-goals

- Do **not** rename **`carIds`** anywhere.
- Do **not** rename Garage/Cars model property `carId` (vehicle).
- Do **not** rename POST `/Parts` field `manufacturerIds`.
- Do **not** put `brandId` on Brand list or Brand landing URLs.
- Do **not** change sitemap (still clean paths).
- Do **not** change Category `?brandId=` list filter (separate client ask) in this ticket unless product merges them — that would be Category API query, not this URL rename. If Category later uses `brandId`, **same id value** as Manufacturer `id` / URL `brandId`.

---

## Compat strategy (recommended)

| Phase                 | Behaviour                                                                   |
| --------------------- | --------------------------------------------------------------------------- |
| **1. Dual-read**      | Brand+L3 accepts `brandId` **or** legacy `carId` (prefer `brandId` if both) |
| **2. Dual-write end** | All new links emit only `brandId`                                           |
| **3. Redirect**       | If request has only `carId` → redirect to `brandId` + drop `carId`          |
| **4. Cleanup**        | Remove `carId` query reads after bookmarks/GSC calm down                    |

Without compat, shared/old links with `?carId=` would redirect as “missing brandId” and still work via slug API, but the URL would flip to `brandId` on every hit — that’s fine if redirect always uses slug `brand.id`.

---

## End-to-end flow (after)

```text
List /car-parts-brands
  → Brand /car-parts-brands/bosch          (no brandId)
  → L3 click
  → /car-parts-brands/bosch/air-filter?brandId={manufacturerId}[&carIds=&vin=]
  → SSR GET /Manufacturer/slug/bosch
  → SSR GET /Category/{l3Id} (SEO copy)
  → SSR POST /Parts { manufacturerIds: [brandId], categoryId, carIds? }
```

Clean open (canonical):

```text
/bosch/air-filter
  → redirect → /bosch/air-filter?brandId={id}
  → canonical still /bosch/air-filter
```

---

## Implementation order

1. **Helpers first** — `seoUrlParams` add `brandId`; keep `carId` strip during compat.
2. **Emitters** — Brand landing L3 links → `brandId`.
3. **Brand+L3 page** — read/redirect/Parts mapping; rename locals from `carId` → `brandId` (manufacturer).
4. **CategoryL3TopPartsSection** — URL read `brandId` (+ fallback `carId`).
5. **Verify** `appendVehicleContextToHref` preserves `brandId`.
6. **Docs** update.
7. **QA** (below).
8. **Remove** legacy `carId` query support when agreed.

---

## Test plan

### Must pass

- [ ] Brand → L3 link contains `brandId=` and **not** `carId=`
- [ ] Brand+L3 loads products filtered by that manufacturer (`manufacturerIds` in Parts payload)
- [ ] With vehicle: `?brandId=…&carIds=…&vin=…` both preserved; Parts gets `manufacturerIds` + `carIds`
- [ ] Clean Brand+L3 URL redirects to `?brandId={brand.id}` (not `carId`)
- [ ] Canonical / sitemap still without query
- [ ] Breadcrumb JSON-LD strips `brandId`; visible href with `brandId` gets `rel="nofollow"`
- [ ] Locale switch on Brand+L3 keeps `brandId` (+ vehicle params)
- [ ] Legacy `?carId=` still works during compat (redirect or dual-read)
- [ ] Search-results existing `brandId` / `manufacturerIds` behaviour unchanged
- [ ] `carIds` vehicle flows (home, car-parts, SRP) unchanged

### Curl / Network

```text
1. Open Brand landing → click L3 → address bar shows brandId=
2. Network POST /Parts body.manufacturerIds[0] === URL brandId
3. View source canonical = path without brandId
```

---

## Effort / risk

| Item                                       | Risk                                |
| ------------------------------------------ | ----------------------------------- |
| Rename on brand tree only                  | Low–medium                          |
| Confusing with ProductFilters `brandId`    | **Medium** — confirm with product   |
| Forgetting strip/nofollow for `brandId`    | SEO leak of query URLs              |
| Dropping `brandId` when appending `carIds` | Wrong unfiltered Parts call         |
| Renaming `carIds` by mistake               | **Critical** — checklist every diff |

---

## Verdict

**Enough for FE:** replace URL query **`carId` → `brandId`** on Brand+L3 emit/read/redirect/SEO helpers; map value to **`manufacturerIds`** on Parts. Leave **`carIds`** and all vehicle `carId` model fields alone.

**Confirm with client/Frank before coding:** URL `brandId` is manufacturer id only on brand routes; Parts body stays `manufacturerIds`; no conflict with search-results `brandId` filter meaning.
