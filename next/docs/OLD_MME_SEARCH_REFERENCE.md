# Legacy MME car search — reference (knowledge base)

This document describes the **original hierarchical** car search: **Make → Model → Engine (MME)** — APIs per step, how **`makeModelTypeId`** is derived, and how the main UI pieces connect. Use it when implementing or replacing this flow.

---

## Table of contents

1. [Purpose](#purpose)
2. [User flow](#user-flow)
3. [Component map](#component-map)
4. [State: `useMmeStore`](#state-usemmestore)
5. [APIs](#apis)
6. [`makeModelTypeId` resolution](#makemodeltypeid-resolution)
7. [Reverse: id → UI](#reverse-id--ui)
8. [Related behavior](#related-behavior)
9. [File index](#file-index)

---

## Purpose

- **Hierarchy**: Make id → **model/types API** → model variant id → **engines API** → engine row id = **full `makeModelTypeId`** for a complete selection.
- **Code references**: `MMEBaseSearch.tsx`, `MMESearchFilter.tsx`, `useMmeStore.ts`, `MMESearchModal.tsx`, `getMMEId.ts`, `services/search.ts`.

---

## User flow

1. User chooses **Make** (brand list).
2. User chooses **Model** (grouped by model name; each selectable row is a **variant**: `model` + `type`; stored `key` = API **`id`**).
3. User chooses **Engine** (grouped by fuel, e.g. Petrol / Other; display uses `engine` field; stored `key` = API **`id`** = full vehicle id for that engine).
4. **Enter / Confirm** uses the **deepest selected id** as `makeModelTypeId` via `getMMEId` (see below).

The landing-style UI matches: vertical steps with “Search make / model / engine” filters inside each dropdown.

---

## Component map

| Component           | Path                                  | Role                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MMESearchFilter** | `next/components/MMESearchFilter.tsx` | Vertical MME (border-left steps, three dropdowns). Used on **landing** (`heroCard2.tsx`, `hero-card-mobile.tsx`) and inside **MMESearchModal** step 1. Seeds makes from **`useBrands()`**; **`setStep`** loads models/engines. |
| **MMEBaseSearch**   | `next/components/MMEBaseSearch.tsx`   | Numbered Make / Model / Engine + **Enter**; used in search container flows (products, PDP, category) with routing (`updateFilters`, `router.push`, garage). Same store and hierarchy as MMESearchFilter.                       |
| **MMESearchModal**  | `next/components/MMESearchModal.tsx`  | Modal: step 1 = VIN **or** MMESearchFilter; step 2 = confirm; optional duplicate-car step. **`handleConfirm`** resolves `makeModelTypeId` from engine → model → make keys.                                                     |

---

## State: `useMmeStore`

**File:** `next/stores/useMmeStore.ts`

| Concept                | Description                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`searchData`**       | `{ make, model, engine }` — each `{ key, value, originalData? } \| null`. **`key` is always the API row `id` at that level.**                |
| **`currentStep`**      | `1` Make, `2` Model, `3` Engine; after engine select, `updateSearchData` sets step **`4`**.                                                  |
| **`searchResults`**    | List for the active step: flat (makes) or grouped `{ key, value, children[] }` (models by name; engines by fuel).                            |
| **`updateSearchData`** | Step 1: set make → **`fetchModels(data.key)`** (`getModalTypes`). Step 2: set model → **`fetchEngines(data.key)`**. Step 3: set engine only. |
| **`setStep`**          | When opening a dropdown, refetches models (step 2) or engines (step 3) so lists stay correct. Step 1 relies on brands from context in UI.    |

Changing Make clears model + engine; changing Model clears engine (see `handleSelectWithClearing` in components and logic inside `updateSearchData`).

---

## APIs

**File:** `next/services/search.ts` (via `apiClient`)

| Step          | Store method             | Service function         | Method | Path                               |
| ------------- | ------------------------ | ------------------------ | ------ | ---------------------------------- |
| Makes         | `fetchBrands` (fallback) | `getBrands()`            | GET    | `/MakeModelType/brands`            |
| Models        | `fetchModels(makeId)`    | `getModalTypes(brandId)` | GET    | `/MakeModelType/types/{brandId}`   |
| Engines       | `fetchEngines(modelId)`  | `getEngines(modelId)`    | GET    | `/MakeModelType/engines/{modelId}` |
| VIN (current) | `fetchCarByVin`          | `getCarByVin(vin)`       | GET    | `/vin/{vin}`                       |
| VIN (legacy)  | —                        | `getCarByVinOld(vin)`    | GET    | `/MakeModelType/vin/{vin}`         |

**Implementation notes:**

- **`getBrands`**: 24h in-memory cache + React `cache()` for request deduplication.
- **Landing / modal**: **`BrandsContext`** (`useBrandQuery`) supplies brands; components map `brand.id` / `brand.brand` into `searchResults` when `currentStep === 1` to avoid redundant fetches.
- **`getModalTypes`** is named “modal” in code but calls **`/MakeModelType/types/{brandId}`** — pass the **full make id** from the brands list.
- **`getEngines`** takes the **selected model/type variant `id`** from step 2 (not the human-readable model name).

**Row type:** `MakeModelTypeBrandItem` in `next/type.d.ts` (`id`, `brand`, `model`, `type`, `engine`, `yearFrom`, `yearTo`, `fuel`, `image`, …).

---

## `makeModelTypeId` resolution

**File:** `next/utils/getMMEId.ts`

Priority (deepest completed level):

1. If **engine** has `key` and `value` → return **`engine.key`** (full id for product/vehicle lock-in).
2. Else if **model** → **`model.key`** (partial).
3. Else if **make** → **`make.key`** (make-level only).
4. Else, when reading from store, VIN flow may supply **`carByVinResults[0].id`**.

Garage save and URL query params use this helper so **partial** MME still sends a valid id for the highest completed tier.

---

## Reverse: id → UI

**In store:** `generateMmeSearchData(makeModelTypeId)` and `returnMmeSearchData(makeModelTypeId)`.

- Infer completion depth from **last non-zero** character index in the id string.
- Build padded ids (`actualMakeId`, `actualModelId`, `actualEngineId`) and sequentially call **`getBrands` → `getModalTypes(actualMakeId)` → `getEngines(actualModelId)`**, matching rows to rebuild `searchData`.
- **`mmeSearchDataCache`** memoizes by `makeModelTypeId`; **`clearMmeApiCache`** clears it (e.g. on Enter in `MMEBaseSearch`).

---

## Related behavior

- **MMEBaseSearch `handleEnterClick`**: Branches on partial vs complete MME, page type (category / PDP / search results), auth, `saved_car_feature_flag` — may `updateFilters(..., "/products")`, `router.push` with `?makeModelTypeId=`, or `useAddUpdateMyCarsToEB`.
- **MMESearchModal `handleConfirm`**: Resolves id, optional garage save, navigation to `Routes.categorySelection` with query string.
- **Other endpoints** in `search.ts` (`getModels`, `getYears`, `getTypes` with year) exist but are **not** the primary path for this classic three-dropdown MME.

---

## File index

| Area      | Path                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| UI        | `next/components/MMESearchFilter.tsx`, `MMEBaseSearch.tsx`, `MMESearchModal.tsx` |
| State     | `next/stores/useMmeStore.ts`                                                     |
| ID helper | `next/utils/getMMEId.ts`                                                         |
| HTTP      | `next/services/search.ts`                                                        |
| Types     | `next/type.d.ts`                                                                 |
| Brands    | `next/contexts/BrandsContext.tsx`, `next/hooks/brands`                           |

---

## Changelog

| Date       | Change                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| 2026-04-20 | Initial knowledge base for legacy MME search (pre–new feature implementation). |
