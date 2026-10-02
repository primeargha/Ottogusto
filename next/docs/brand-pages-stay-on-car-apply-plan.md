# Plan: Stay on brand pages after vehicle save (banner / sidebar)

## Status (implemented)

- `shouldStayOnPathAfterCarApply()` includes brand list / landing / Brand+L3
- Wired into `useNewMmeCarFilters`, `useE2EVinFindCarParts`, `NewRightSidebarCarSelection`
- `updateFilters` preserves URL `brandId` when applying `carIds` / `vin` on non-SRP paths

---

## Bug

On Brand list / Brand landing / Brand+L3 (e.g. `/en-BE/car-parts-brands/fiat-group/oil-filter?brandId=…`), using the search banner “Select Car” → finish/save navigates to **`/car-parts`**.

On catalog **L1 / L2 / L3**, the same flow **stays on the current page** and only updates `carIds` / `vin`.

---

## Root cause

Vehicle apply destination is computed in a few places. **Stay-on-path** is only granted to:

- `category-l1` / `category-l2` / `category-l3`
- `product-details`

Brand routes already have `detectPage` types:

- `car-part-brands`
- `car-part-brand`
- `car-part-brand-l3`

…but they are **not** included in the stay-on-path check. So apply falls through to:

```ts
Routes.parts(languageCountry); // → /en-BE/car-parts
```

Primary site (new MME Finish / Save):

```130:141:next/hooks/useNewMmeCarFilters.ts
  const carApplyDestination = useMemo(() => {
    if (isListingPage) return listingBase;
    const pageType = detectPage(pathname ?? "");
    const isCategorySeoPage =
      pageType === "category-l1" || pageType === "category-l2" || pageType === "category-l3";
    // Catalog SEO + PDP: stay on current path (update carIds/vin only — do not jump to car-parts hub).
    if (isCategorySeoPage || pageType === "product-details") {
      const pathOnly = (pathname ?? "").split("?")[0];
      if (pathOnly) return pathOnly;
    }
    if (isFeatureEnabled && languageCountry) return Routes.parts(languageCountry);
    return "/search-results";
  }, [...]);
```

Same gap duplicated in:

| File                                         | What                                            |
| -------------------------------------------- | ----------------------------------------------- |
| `hooks/useE2EVinFindCarParts.ts`             | `carApplyDestination` + VIN “stay on path”      |
| `components/NewRightSidebarCarSelection.tsx` | `handleE2EPrimaryCta` → `stayOnPathDestination` |

`isSearchResultsListingPage` already returns **false** for brand pages (correct — they are not SRP). That is why destination is not “listing”; it wrongly becomes **car-parts hub**.

---

## Secondary bug (fix in same change)

Even after staying on Brand+L3 path, `updateFilters` when applying `carIds` on a non-SRP path only rebuilds:

```ts
{ carIds, vin?, manufacturerIds? from URL }
```

It does **not** preserve URL **`brandId`** (see `useUrlParams.ts` ~552–561 and vin-only block ~613–616).

So you could land on:

```text
/…/fiat-group/oil-filter?carIds=…
```

without `brandId`, then Brand+L3 redirects to re-add `brandId`. Works eventually, but extra redirect and risk of losing context. **Preserve `brandId` (and legacy `carId` via helper) when merging catalog query.**

---

## Fix plan

### 1. Shared helper (avoid 3 copy-pastes)

Add in `utils/detectPage.ts`:

```ts
/** Pages where car apply should only update query (carIds/vin), not navigate away. */
export function shouldStayOnPathAfterCarApply(pathname: string | null | undefined): boolean {
  const page = detectPage(pathname ?? "");
  return (
    page === "category-l1" ||
    page === "category-l2" ||
    page === "category-l3" ||
    page === "product-details" ||
    page === "car-part-brands" ||
    page === "car-part-brand" ||
    page === "car-part-brand-l3"
  );
}
```

Unit tests: brand list / brand / brand+L3 → true; homepage / car-parts catalog root → false (catalog root still goes to hub? today catalog root is `category-catalog` and is **not** in stay list — keep that behaviour).

### 2. Wire helper into all apply destinations

| File                                         | Change                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `hooks/useNewMmeCarFilters.ts`               | `carApplyDestination`: if `shouldStayOnPathAfterCarApply(pathname)` → `pathname` pathOnly |
| `hooks/useE2EVinFindCarParts.ts`             | Same for `carApplyDestination` and VIN stay-on-path                                       |
| `components/NewRightSidebarCarSelection.tsx` | `stayOnPathDestination` uses helper                                                       |

### 3. Preserve `brandId` in `updateFilters` carIds/vin catalog navigation

In `hooks/useUrlParams.ts` (both carIds and vin-only non-SRP branches):

```ts
const brandManufacturerId = getBrandManufacturerIdFromSearchParams(searchParams);
if (brandManufacturerId) {
  catalogQuery.brandId = brandManufacturerId;
}
// keep existing manufacturerIds preservation
```

Result after save on Brand+L3:

```text
/en-BE/car-parts-brands/fiat-group/oil-filter?brandId=…&carIds=…
```

### 4. Tests

- `detectPage` / new helper: brand paths stay true
- Optional: assert `carApplyDestination` logic via helper tests (enough)
- Manual QA checklist below

### 5. Docs

One-liner in `new-brand-page.md` or brandId plan: vehicle apply on brand SEO pages stays on path (same as L1–L3).

---

## Explicit non-goals

- Do not change homepage / garage / other flows that intentionally go to `/car-parts`
- Do not treat brand pages as search-results listings
- Do not remove Brand+L3 `brandId` redirect logic

---

## Manual QA

| From                                           | Action              | Expect                                  |
| ---------------------------------------------- | ------------------- | --------------------------------------- |
| Brand+L3 (`…/fiat-group/oil-filter?brandId=…`) | Select car → Finish | Same path + `carIds` (+ `brandId` kept) |
| Brand landing (`…/fiat-group`)                 | Select car → Finish | Stay on brand landing + `carIds`        |
| Brand list (`…/car-parts-brands`)              | Select car → Finish | Stay on list + `carIds`                 |
| L3 category                                    | Select car → Finish | Still stays (regression)                |
| Homepage                                       | Select car → Finish | Still → `/car-parts` (unchanged)        |
| Brand+L3 + VIN (E2E)                           | VIN resolve → Find  | Stay on Brand+L3                        |

---

## Verdict

**Cause:** stay-on-path allowlist missing brand page types → default `Routes.parts`.  
**Fix:** include `car-part-brands` / `car-part-brand` / `car-part-brand-l3` (shared helper) + preserve `brandId` when rewriting query on apply.

Ready to implement when you say go.
