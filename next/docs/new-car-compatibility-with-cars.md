# New car compatibility with Cars API

Reference for PDP **Potential Compatibility** using the **Cars API** (`carIds`) instead of legacy **MakeModelType**. Legacy code is **gated and preserved**, not deleted.

**Status:** Implemented. Enable with `COMPATIBLE_CAR_SECTION_FLAG=true` when the backend `GET /Cars/part/{partId}` endpoint is ready for a market.

---

## Intent

| Era                  | Vehicle identity      | PDP fitment API                                       |
| -------------------- | --------------------- | ----------------------------------------------------- |
| Legacy MME           | `makeModelTypeId`     | `GET /MakeModelType/part/{partId}` (server fetch)     |
| New MME (Sprint 35+) | `carId` (Cars API id) | `GET /Cars/part/{partId}` (client fetch, React Query) |

New MME search/catalog still uses `GET/POST /Cars`, session `searched_car_id`, hero slider, and URL `?carIds=` — see `docs/sprint35-new-car-search.md`.

---

## Feature flags

| Flag                          | Env                                       | Role                                              |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `compatible_car_section_flag` | `NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG` | PDP saved + all compatible accordions vs VIN-only |
| `new_mme_feature_flag`        | `NEXT_PUBLIC_NEW_MME_FEATURE_FLAG`        | Cars API path vs legacy MakeModelType             |
| `saved_car_feature_flag`      | `NEXT_PUBLIC_SAVED_CAR_FEATURE_FLAG`      | Saved Cars section on PDP (intersection)          |

Helpers: `isCompatibleCarSectionEnabled()`, `isNewMmeFeatureEnabledForCountry()` in `utils/legacyCarCompatibility.ts`.

### Behaviour matrix

| `compatible_car_section` | `new_mme` | Behaviour                                                                  |
| ------------------------ | --------- | -------------------------------------------------------------------------- |
| `false`                  | any       | **VIN only** — divider + Guaranteed VIN Verification; no compatibility API |
| `true`                   | `true`    | Client `GET /Cars/part/{id}`; Saved Cars + all compatible grouped by make  |
| `true`                   | `false`   | Server `GET /MakeModelType/part/{id}`; legacy accordions                   |

**VIN verification is always shown** regardless of `compatible_car_section_flag`.

**Enable new MME PDP fitment (local / QA):**

```bash
NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG={"default":true,"exception_countries":[]}
NEXT_PUBLIC_NEW_MME_FEATURE_FLAG={"default":true,"exception_countries":[]}
```

---

## API — `GET /Cars/part/{partId}`

**Service:** `getPartCompatibleCars(partId)` in `services/cars.ts`  
**Hook:** `usePartCompatibleCarsQuery(partId)` in `hooks/usePartCompatibleCars.ts`  
**Query key:** `queryKeys.cars.partCompatible(partId)`

### Response shape (`PartCompatibleCar`)

```json
[
  {
    "id": "mod8s5meh89fcm",
    "make": "FIAT",
    "model": "PANDA (312) 5D (22-24)",
    "variant": "Other",
    "body": "Van-5-Door",
    "engine": "999cc 51kW 70Hp - Petrol",
    "engineCode": "46341162+ECOE6E",
    "gearBox": "6-Speed-Manual",
    "gearBoxCode": "",
    "verifiedMatch": false
  }
]
```

`id` and `make` are the primary fields for intersection and grouping. Response is normalized in `normalizePartCompatibleCarsResponse()` (raw array or `{ data: [] }`).

---

## PDP UI layout (new MME)

Order on the product detail page (below main product content):

1. **Guaranteed VIN Verification** — always visible
2. **Potential Compatibility** heading + subtitle (`Compatibility_Guide`, `compatible_Car_subtitle`) — when API has data or is loading
3. **Saved Cars** (optional) — section title `Productdetailed_saved_carlist`; nested **make accordions** with matched saved cars only
4. **All compatible cars** — **make accordions** for the full API list
5. Info alert (`compatible_Car_info_note`)

Row text per car (make is the accordion title, not repeated in the row):

`model · body · variant · engine · engineCode · gearBox · gearBoxCode`

Field order matches RightSidebar dropdown order from `FIELD_ORDER` in `lib/newMmeFilters.ts` (make omitted). Formatter: `formatCompatibleCarLine()` / `PDP_CAR_DISPLAY_FIELDS` in `utils/partCompatibleCars.ts`. Rendered via `CarItem.displayLine` in `productfaqcard.tsx`.

### Tick icons

`verifiedMatch` from `GET /Cars/part/{partId}` is mapped to `CarItem.isMatching` in `utils/partCompatibleCars.ts`. Icons in `productfaqcard.tsx` (`CarItemRow`):

| Row type                           | Match state            | Icon               | Tooltip                                                      |
| ---------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------ |
| Saved Cars (new MME, matched only) | compatible             | `GreenCircleTick`  | —                                                            |
| All compatible list (Cars API)     | `verifiedMatch: true`  | `GreenCircleTick`  | —                                                            |
| All compatible list (Cars API)     | `verifiedMatch: false` | `GrayQuestionIcon` | `potential_match` label via `CustomTooltip` (hover or click) |
| Legacy saved cars                  | `isMatching: true`     | `GreenCircleTick`  | —                                                            |
| Legacy saved cars                  | `isMatching: false`    | `GrayQuestionIcon` | `potential_match` via `CustomTooltip`                        |
| Legacy all-compatible rows         | n/a                    | `GreenCircleTick`  | —                                                            |

Label key: `potential_match` in `data/branding/labels.ts` — e.g. _"Potential match. VIN verification available at checkout."_

Cars API rows are detected via `CarItem.displayLine`. Tooltip component: `components/og-components/OGtooltip.tsx` (`CustomTooltip`).

---

## Grouping & Saved Cars algorithm

Implemented in `utils/partCompatibleCars.ts`:

| Function                                               | Purpose                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `groupCompatibleCarsByMake(cars)`                      | Full API list → accordions by `make` (A–Z)                |
| `buildSavedCompatibleGroups(savedIds, compatibleCars)` | Intersect by `id`, then group by `make`                   |
| `toCarBrandGroups(groups)`                             | Adapter to existing `CarBrand` / `CarItem` for accordions |

### Saved Cars steps

1. Collect user saved **`carId`** values (not `makeModelTypeId`).
2. If none → **hide** Saved Cars section.
3. Intersect with `GET /Cars/part/{partId}` response by **`id`**.
4. If no intersection → **hide** Saved Cars section.
5. Group matches by **`make`** → one accordion per make; each row shows full car fields.

Gated by `saved_car_feature_flag` in addition to the steps above.

### Saved `carId` sources (new MME)

| User      | Source                                 | Hook / util                                                          |
| --------- | -------------------------------------- | -------------------------------------------------------------------- |
| Logged in | `GET /Garage` rows with `carId`        | `useNewMmeGarageCarsQuery()` → `useUserCarsApiIdsForCompatibility()` |
| Guest     | `sessionStorage` key `searched_car_id` | `getSearchedCarIds()` when `shouldUseSessionCarHistory()`            |

**Do not** use `SavedCarsContext` / `makeModelTypeId` for new MME PDP matching.

### Example

**Saved cars:** `{ id: 777, make: A }`, `{ id: 008, make: B }`, `{ id: 123, make: A }`, `{ id: 999, make: B }`

**API response ids:** `777`, `123`, `999`, `7771` (make A), `444` (make C)

**Saved Cars section:**

- Accordion **A** → rows for `777`, `123`
- Accordion **B** → row for `999`

(`008` has no API match — omitted.)

**All compatible section:**

- Accordion **A** → `123`, `777`, `7771`
- Accordion **B** → `999`
- Accordion **C** → `444`

---

## Performance / LCP

- `ProductMatchingCarsLazy` uses `dynamic(..., { ssr: false })` — compatibility block does not block PDP LCP or SEO-critical server render.
- When `new_mme` is on, **`fetchMatchingCars` (`MakeModelType/part`) is skipped on the server** (`page.tsx`); data loads client-side after hydration.
- `getmatchingcarsInformation()` returns `{ data: [] }` when new MME is on (avoids duplicate legacy fetch).
- Loading state: inline skeleton in `productmatchingcars-client.tsx` while React Query is pending.

---

## Legacy path (preserved)

When `new_mme` is **off** and `compatible_car_section` is **on**:

- Server `fetchMatchingCars` → `GET /MakeModelType/part/{partId}`
- `groupByBrand()` in `productmatchingcars-client.tsx` (uses `makeModelTypeId` from garage)
- **Saved Cars:** single flat accordion (`legacySavedCars` prop on `SavedCarCompatibilityList`)
- **All compatible:** make accordions with legacy row labels (`modelName`, `typeName`, `engine`)

---

## Brands API (separate from PDP accordions)

When `new_mme_feature_flag` is **on**:

| Behaviour             | Detail                                                               |
| --------------------- | -------------------------------------------------------------------- |
| No Brands API         | `getBrands()` returns `{ data: [] }`; no `GET /MakeModelType/brands` |
| No PDP legacy MME bar | `SearchContainerWrapper` hidden when `new_mme` on                    |

---

## File index

| File                                                              | Role                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `services/cars.ts`                                                | `PartCompatibleCar`, `getPartCompatibleCars`                            |
| `utils/partCompatibleCars.ts`                                     | Grouping, intersection, row formatter, response normalizer              |
| `utils/partCompatibleCars.test.ts`                                | Unit tests for grouping / intersection                                  |
| `hooks/usePartCompatibleCars.ts`                                  | React Query for `/Cars/part/{id}`                                       |
| `hooks/useUserCarsApiIdsForCompatibility.ts`                      | Saved `carId`s (garage + session)                                       |
| `hooks/productdetails.ts`                                         | Legacy `useGetMatchingCarsQuery` disabled when new MME on               |
| `lib/query-keys.ts`                                               | `queryKeys.cars.partCompatible`                                         |
| `types/cars.ts`                                                   | `CarItem.displayLine` and Cars API field optional props                 |
| `screens/productdetails/productmatchingcars-client.tsx`           | New vs legacy branch, loading skeleton                                  |
| `screens/productdetails/productmatchingcars.tsx`                  | Lazy wrapper entry                                                      |
| `screens/productdetails/productcompatibilityverify.tsx`           | VIN + Potential Compatibility heading                                   |
| `screens/productdetails/productfaqcard.tsx`                       | Make accordion + row; green / gray icon + `potential_match` tooltip     |
| `screens/productdetails/GrayQuestionIcon.tsx`                     | Gray question icon when unverified                                      |
| `screens/productdetails/components/SavedCarCompatibilityList.tsx` | Saved Cars (grouped new / flat legacy)                                  |
| `screens/productdetails/components/CompatibleCarList.tsx`         | All compatible by make                                                  |
| `app/.../car-parts/[partname]/[partid]/page.tsx`                  | `ProductMatchingCarsLazy`; legacy server fetch only when `new_mme` off  |
| `services/productdetailsservice.ts`                               | `getmatchingcarsInformation` gated; skips MakeModelType when new MME on |
| `utils/legacyCarCompatibility.ts`                                 | Flag helpers                                                            |

---

## QA checklist

1. **`COMPATIBLE_CAR_SECTION_FLAG=false`** — no compatibility API; VIN visible; no runtime error.
2. **Both flags `true`** — network shows `GET /Cars/part/{id}` only (no `MakeModelType/part`).
3. **Saved Cars** — hidden when no saved cars, no intersection, or `saved_car_feature_flag` off; grouped by make when shown; only matching ids listed.
4. **All compatible** — full API list grouped by make; `verifiedMatch: true` → green tick; `false` → gray question + `potential_match` tooltip.
5. **`new_mme` on** — no `MakeModelType/brands` 404; `?carIds=` SRP banner still works.
6. **Legacy market** — `new_mme` off, `compatible_car_section` true — `MakeModelType/part` + legacy accordions unchanged.
7. **LCP** — compatibility block loads after main PDP content (lazy, `ssr: false`).

---

## Related docs

- `docs/sprint35-new-car-search.md`
- `docs/OLD_MME_SEARCH_REFERENCE.md`
