# New MME search (Cars API) — planning reference

This document defines the planned implementation for the **new progressive car selection** flow
(`Make -> Model -> Variant -> Body Style -> Engine -> Gearbox`) using the Cars APIs, while keeping
legacy `makeModelTypeId` search unchanged.

Scope of this document:

- New filter panel on homepage (temporary placement at end of page).
- New filter panel behavior on search results page (prefill + editable).
- Feature-flag rollout in DEV.
- Translation-safe key handling.
- Backward compatibility guarantees with old MME.

---

## Table of contents

1. [Goals and non-goals](#goals-and-non-goals)
2. [Feature flag strategy (DEV-only)](#feature-flag-strategy-dev-only)
3. [Data contracts and key policy](#data-contracts-and-key-policy)
4. [Architecture and isolation from legacy MME](#architecture-and-isolation-from-legacy-mme)
   4a. [Homepage vs search-results UI (NewMmeSearch vs SearchResultsNewMmeSidebar)](#homepage-vs-search-results-ui-newmmesearch-vs-searchresultsnewmmesidebar)
5. [Homepage filter panel plan (new widget)](#homepage-filter-panel-plan-new-widget)
6. [Search results filter panel plan (prefill + edit)](#search-results-filter-panel-plan-prefill--edit)
7. [Progressive filtering algorithm (single source of truth)](#progressive-filtering-algorithm-single-source-of-truth)
8. [Selective reset behavior](#selective-reset-behavior)
9. [Prefill / auto-fill / visibility rules](#prefill--auto-fill--visibility-rules)
10. [Routing and URL contract](#routing-and-url-contract)
11. [Error/loading/empty-state behavior](#errorloadingempty-state-behavior)
12. [API sufficiency conclusion](#api-sufficiency-conclusion)
13. [Implementation checklist](#implementation-checklist)
14. [Backward compatibility checklist](#backward-compatibility-checklist)
15. [Open questions to confirm with backend/product](#open-questions-to-confirm-with-backendproduct)
16. [References](#references)
17. [Changelog](#changelog)

---

## Goals and non-goals

### Goals

- Implement **new Cars-based filtering** with progressive disclosure:
  `Make`, `Model` mandatory first, then `Variant`, `Body`, `Engine`, `Gearbox`.
- Use **pure filtering** logic via `POST /api/Cars` (no old MME hierarchy dependency).
- Keep all old `makeModelTypeId` logic and UI behavior intact.
- Ensure localization readiness by using **keys** for state/filtering identity.

### Non-goals (current phase)

- Replace old MME components/stores.
- Modify legacy parts-linking behavior.
- Migrate existing URL contract from `makeModelTypeId` to the new Cars flow globally in one phase.

---

## Feature flag strategy (DEV-only)

### Environment flag

Use env payload:

- `NEXT_PUBLIC_NEW_MME_FEATURE_FLAG={"default":true,"exception_countries":[]}`

### Codebase integration pattern

Use existing feature-flag framework in:

- `next/utils/theme-utils.ts` (`getClientFeatureFlag`)
- `next/utils/feature-flag-env.ts` (static env mapping + evaluator)
- `next/config/feature-flags.types.ts` (flag key typing)

### Required additions

1. Add `new_mme_feature_flag: boolean` to `FeatureFlags` interface.
2. Add `"new_mme_feature_flag"` to `FEATURE_FLAG_KEYS`.
3. Add static env mapping in `NEXT_PUBLIC_FEATURE_FLAG_JSON`:
   `new_mme_feature_flag: process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG`.
4. Gate new UI using:
   `getClientFeatureFlag("new_mme_feature_flag")`.

Notes:

- Evaluation already supports country exceptions and default inversion.
- If country cannot be resolved, evaluator returns `false` (safe fallback).

---

## Data contracts and key policy

### APIs

- `POST /api/Cars` (filters/options)
- `GET /api/Cars/{id}` (single car details for prefill by id)

### Key policy (critical for translation)

The API returns key-value dictionaries for option groups (example: `makes`, `models`, `engines`,
etc.). We must treat **object keys as the canonical identity** for filtering and selections.

Store each option as:

- `key`: canonical API key (used in payloads and comparisons)
- `label`: display text (initially same as key/value; later replaceable by translations)

This ensures filtering remains stable when translated labels are introduced.

---

## Architecture and isolation from legacy MME

### Keep legacy untouched

Legacy flows documented in:

- `next/docs/OLD_MME_SEARCH_REFERENCE.md`

Legacy dependencies that must remain unchanged:

- `useMmeStore`
- `getMMEId`
- `makeModelTypeId` URL logic
- Existing `MMESearchFilter`, `MMEBaseSearch`, `MMESearchModal` behavior

### New isolated module

Create new standalone module(s) for Cars flow (example naming):

- `useNewMmeCarsStore` (or dedicated hook + reducer)
- `NewMmeFilterPanel` (homepage)
- `NewMmeSearchResultsPanel` (results page)
- `cars service` client functions

No shared mutable state with `useMmeStore`.

---

## Homepage vs search-results UI (NewMmeSearch vs SearchResultsNewMmeSidebar)

Implemented as **two components** with the **same core behaviour** (progressive `POST /api/Cars`,
key-based fields, `carIds` → URL via `updateFilters`), but **not identical** in every detail.

|                | **Same**                                                                           | **Different**                                                                                                                                                                         |
| :------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **APIs**       | `POST /api/Cars`; same payload / reconcile helpers in `next/lib/newMmeFilters.ts`. | **Sidebar** also uses **`GET /api/Cars/{id}`** for each id in the URL `carIds` list and **merges** responses when prefill applies.                                                    |
| **State**      | Selected keys + options come from the Cars API responses.                          | **Homepage** (`NewMmeSearch`): **`useNewMmeStore`** (global Zustand). **Sidebar** (`SearchResultsNewMmeSidebar`): **local `useState`** so it does not clash with the homepage widget. |
| **Entry**      | User picks filters → **Find car parts** when the API exposes `carIds`.             | **Homepage**: initial **`POST`** with all-null payload. **Sidebar**: may start from **URL `carIds`** (batch GET + merge) or the same empty **`POST`** when there are no ids.          |
| **Navigation** | `updateFilters` with **`carIds`** (comma-separated).                               | **Homepage** targets **`/search-results`**. **Sidebar** uses the **current listing path segment** from `useParams()` (e.g. `/search-results` vs an MMT `[searchdata]` slug).          |
| **UI**         | Searchable dropdowns + primary CTA.                                                | **Homepage**: horizontal card (`NewMmeSearch`). **Sidebar**: left filter column / accordion above Availability (`SearchResultsNewMmeSidebar` in `OGCategoriesSearcBlock/index.tsx`).  |

**Code references**

- Homepage: `next/components/NewMmeSearch.tsx` (mounted from `next/app/(public)/[language-country]/page.tsx`).
- Search results / listing column: `next/components/SearchResultsNewMmeSidebar.tsx`.

---

## Homepage filter panel plan (new widget)

Temporary placement: end of homepage (ticket requirement).

### Initial load

On mount:

1. Call `POST /api/Cars` with all null fields.
2. Normalize response dictionaries into option arrays.
3. Render `Make` as first active field.
4. `Model` appears after selecting make.
5. Remaining fields appear progressively per visibility rules.

### User interactions

After every selection:

1. Update selected field.
2. Call `POST /api/Cars` with current selected payload.
3. Recompute options + visibility + auto-prefill.
4. Keep valid downstream selections, reset only invalid ones.

### CTA behavior

Enable/disable rule (confirmed):

- Enable **Find car parts** / **Save** when `POST /api/Cars` returns `carIds` with **at least one** non-empty id (`isNewMmeSearchCtaEnabled` — multiple ids are allowed).
- Keep the CTA disabled when `carIds` is empty, all ids are blank, or the response omits / clears `carIds` (state `[]`).

On click:

- Route to search results with the **full** `carIds` array in the query string (comma-separated). **Edit** flows use `carIds[0]` only for replace / my-cars update / single-id listing URL; see `sprint35-new-car-search.md` Phase 4.

---

## Search results filter panel plan (prefill + edit)

### Prefill entry

When page has `carIds` query parameter:

1. Parse comma-separated `carIds`.
2. Select one id for prefill detail fetch (typically first id) and call `GET /api/Cars/{id}`.
3. Map response to selected state using returned **KEY values** (`make`, `model`, `variant`,
   `body`, `engine`, `gearBox`, plus optional codes).
4. Call `POST /api/Cars` with selected payload to hydrate option dictionaries.
5. Render fields with selected values prefilled.

### Editable behavior after prefill

User can change any visible field:

1. Apply change to selected state.
2. Re-run `POST /api/Cars`.
3. Preserve downstream values if still valid; clear only invalid ones.
4. Re-apply single-option auto-fill and hide rules.

This reproduces old preselect-and-edit UX intent without old hierarchy.

---

## Progressive filtering algorithm (single source of truth)

Use `POST /api/Cars` response as authoritative source for available options at every step.

### Field order

1. `make` (mandatory)
2. `model` (mandatory)
3. `variant`
4. `body`
5. `engine`
6. `gearBox`

Optional hidden companions:

- `engineCode`
- `gearBoxCode`

### Payload rule

Always send current selected state (null for unselected fields). Never compute options locally from
previous snapshots.

On any user selection change, **do not pre-clear** previously selected fields in client state before
calling `POST /api/Cars`. Send the full current selection payload as-is, then reconcile with the API
response.

### Call frequency rule (confirmed)

- There is no call limit for `POST /api/Cars`.
- Do **not** stop calling when `carIds` appears.
- Re-call Cars API whenever user changes any selection to keep options/prefill/validation in sync.

---

## Selective reset behavior

After each `POST /api/Cars` response (server-authoritative reconciliation):

- Recompute available option keys from latest POST response.
- For each downstream field, if selected key not in current available keys => reset to null.
- Keep values that remain valid.

Important:

- Any reset should happen **only during response reconciliation**.
- Do **not** clear dependent fields proactively in the `handleSelect` step.

This avoids unnecessary clearing and matches expected usability.

---

## Prefill / auto-fill / visibility rules

Per field (`variant`, `body`, `engine`, `gearBox`):

- **0 options**: hide field; selection = null.
- **1 option**: auto-select that key; field can be visually shown as read-only style or hidden
  interaction per UX decision.
- **>1 options**: show searchable dropdown.

Search is local (client-side) against normalized option labels.

---

## Routing and URL contract

### New flow parameters

Use dedicated params to avoid collision with legacy:

- `carIds` as comma-separated list from response array (example: `id1,id2,id3`)
- optional marker: `newMme=1` (or `newCarSearch=1`) for analytics/debug/context

### URL serialization behavior

- On **Find car parts**, call `updateFilters` from `next/hooks/useUrlParams.ts`.
- Pass full `carIds` array from Cars API response as a comma-separated string (same URL style as
  `availability` handling pattern in
  `next/components/og-components/OGCategoriesSearcBlock/OGAvailabilityBlock.tsx`).
- Navigate to `/search-results`.

### Legacy compatibility

- Do not modify current `makeModelTypeId` readers/writers.
- New panel should not overwrite `makeModelTypeId` unless explicitly required by a future linking
  phase.

### Search-results URL validation (OD-1670)

- `getSearchResultsProductFilterKeys(languageCountry)` in
  `next/utils/searchResultsQueryAllowlist.ts` adds `carIds` to the allowed product filter keys only
  when `new_mme_feature_flag` is enabled for that URL’s country (from the `language-country`
  segment, via `NEXT_PUBLIC_NEW_MME_FEATURE_FLAG`).
- `[searchdata]/page.tsx` uses that list for OD-1670 invalid-key checks.
- `pickSearchResultsAllowedProductFiltersFromSearchParams` only copies `carIds` from the URL when
  those keys are allowed; callers such as `OGHeaderSearchLinks` pass the first path segment (e.g.
  `en-BE`) so behavior matches the search-results page.

---

## Error/loading/empty-state behavior

### Loading

- Show skeleton/spinner during POST/GET fetches.
- Disable CTA while loading initial options.

### API errors

- Show non-blocking error banner + retry action.
- Keep previous stable selections in UI when possible.

### Empty responses

- If initial POST returns no makes: show empty-state message and disable panel interaction.
- For downstream empty dictionaries: hide only affected field(s), not whole panel.

---

## API sufficiency conclusion

Given current ticket scope (UI + filtering validation, no parts linking):

- `POST /api/Cars` is sufficient for progressive filtering and dynamic field rendering.
- `GET /api/Cars/{id}` is sufficient for search-results prefill using one id from `carIds`.

Potential later requirement:

- If large datasets impact UX/performance, add server-side search/pagination endpoints.

---

## Implementation checklist

1. Add `new_mme_feature_flag` to feature-flag types and env mapping.
2. Add env variable in target env files (`NEXT_PUBLIC_NEW_MME_FEATURE_FLAG=...`).
3. Create Cars API service wrappers:
   - `postCarsFilters(payload)`
   - `getCarById(id)`
4. Build new normalized option mapper (`Record<string,string>` -> `[{key,label}]`).
5. Implement standalone new MME state manager (no legacy store coupling).
6. Implement homepage new panel with progressive logic.
7. Implement results-page panel with `carIds` URL parsing + editable prefill behavior.
8. Add URL updates for `carIds` (comma-separated) in new flow only.
9. Add telemetry hooks if required (selection step, CTA click, error).
10. Validate with multi-language labels while key identity remains stable.

---

## Backward compatibility checklist

- Legacy `MMEBaseSearch` behavior unchanged.
- Legacy `MMESearchFilter` behavior unchanged.
- `useMmeStore` and `getMMEId` unchanged.
- `makeModelTypeId` URL behavior unchanged.
- Old docs remain valid:
  `next/docs/OLD_MME_SEARCH_REFERENCE.md`.

---

## Open questions to confirm with backend/product

1. Confirm dictionaries are always present as object maps for all groups.
2. Confirm canonical key format (case sensitivity, uniqueness guarantees).
3. Confirm `carIds` semantics:
   - unique only when full selection,
   - or may return many rows at intermediate steps.
4. Confirm handling of `engineCode` and `gearBoxCode` in UI phase.
5. Confirm whether `carIds` can be present as an empty array and how CTA should behave in that case.

---

## References

- Legacy reference:
  `next/docs/OLD_MME_SEARCH_REFERENCE.md`
- Feature flag utilities:
  `next/utils/theme-utils.ts`
  `next/utils/feature-flag-env.ts`
  `next/config/feature-flags.types.ts`
- Existing search page pattern:
  `next/app/(public)/[language-country]/search/page.tsx`

---

## Worked example (real user flow)

This section captures the exact progressive behavior using `POST /api/Cars`, with **key-based**
values sent in each next payload.

Endpoint used for filtering:

- `https://api-dev.ottogusto.com/api/Cars`

### Call 1: initial load (no selections)

Payload:

```json
{
  "make": null,
  "model": null,
  "body": null,
  "engine": null,
  "engineCode": null,
  "variant": null,
  "gearBoxCode": null
}
```

Response (example):

```json
{
  "makes": {
    "ALFA ROMEO": "ALFA ROMEO"
  }
}
```

UI effect:

- Show **Make** field only.

### Call 2: after selecting make

Payload:

```json
{
  "make": "ALFA ROMEO",
  "model": null,
  "body": null,
  "engine": null,
  "engineCode": null,
  "variant": null,
  "gearBoxCode": null
}
```

Response (example):

```json
{
  "makes": {
    "ALFA ROMEO": "ALFA ROMEO"
  },
  "models": {
    "GT (937) 3D (04-10)": "GT (937) 3D (04-10)",
    "145/146 (930) 3/5D (94-01)": "145/146 (930) 3/5D (94-01)"
  },
  "make": "ALFA ROMEO"
}
```

UI effect:

- Show **Make + Model** fields.

### Call 3: after selecting model

Payload:

```json
{
  "make": "ALFA ROMEO",
  "model": "GT (937) 3D (04-10)",
  "body": null,
  "engine": null,
  "engineCode": null,
  "variant": null,
  "gearBoxCode": null
}
```

Response (example):

```json
{
  "makes": {
    "ALFA ROMEO": "ALFA ROMEO"
  },
  "models": {
    "GT (937) 3D (04-10)": "GT (937) 3D (04-10)"
  },
  "bodys": {
    "3 Doors-Coupé": "3 Doors-Coupé"
  },
  "engines": {
    "1747cc 106kW 144Hp - Petrol": "1747cc 106kW 144Hp - Petrol",
    "1910cc 110kW 150Hp - Diesel": "1910cc 110kW 150Hp - Diesel"
  },
  "make": "ALFA ROMEO",
  "model": "GT (937) 3D (04-10)",
  "body": "3 Doors-Coupé"
}
```

UI effect:

- Show **Body** and **Engine** in addition to Make/Model.
- If a group has one option (like body above), prefill it automatically.

### Call 4: after selecting body + engine

Payload:

```json
{
  "make": "ALFA ROMEO",
  "model": "GT (937) 3D (04-10)",
  "body": "3 Doors-Coupé",
  "engine": "1747cc 106kW 144Hp - Petrol",
  "engineCode": null,
  "variant": null,
  "gearBoxCode": null
}
```

Response (example):

```json
{
  "variants": {
    "Other": "Other"
  },
  "gearBoxes": {
    "5-Speed-Manual": "5-Speed-Manual"
  },
  "carIds": ["mndb693fccd5mo"],
  "make": "ALFA ROMEO",
  "model": "GT (937) 3D (04-10)",
  "body": "3 Doors-Coupé",
  "engine": "1747cc 106kW 144Hp - Petrol",
  "variant": "Other",
  "gearBox": "5-Speed-Manual"
}
```

UI effect:

- Show/prefill **Variant** and **Gearbox** based on option counts.
- `carIds` array is available and is used as the search identity payload.

### CTA behavior with `carIds`

- Enable **Find car parts** / **Save** when the response includes **one or more** resolved car ids (`carIds.length >= 1` with at least one non-empty string).
- Clicking **Find car parts** (non-edit) sends the **full `carIds` array** (comma-separated in the URL) via `updateFilters` to `/search-results`. **Edit** apply uses `carIds[0]` as the primary id for replace / URL when the API returns multiple matches.
- Even after `carIds` appears, user edits can trigger more Cars API calls; no stop condition is
  applied for API calling.

### Important implementation note

- Always pass the **selected KEY** values in subsequent payloads.
- Do not rely on translated display text for filtering identity.

---

## Changelog

| Date       | Change                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-20 | Initial planning reference for new Cars-based MME flow (feature-flagged, translation-safe keys, legacy-safe isolation).                                                                |
| 2026-04-20 | Added worked 4-call API example flow with `carIds` and CTA behavior.                                                                                                                   |
| 2026-04-20 | Updated per client confirmation: CTA enabled by `carIds` property, unlimited Cars API recalls, prefill uses keys, and URL uses comma-separated `carIds` array via `updateFilters`.     |
| 2026-04-20 | Documented OD-1670 alignment: `carIds` allowlist and URL picking gated by `new_mme_feature_flag` per locale country.                                                                   |
| 2026-04-20 | Added side-by-side table: `NewMmeSearch` (homepage) vs `SearchResultsNewMmeSidebar` (listing filter column)—same Cars flow, different state, entry, navigation base path, and UI.      |
| 2026-04-21 | Clarified selection-change payload behavior: do not pre-clear existing selections; preserve all fields in request payload and only clear invalid values after Cars API reconciliation. |
