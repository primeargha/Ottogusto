# Sprint 35 — New car search (context)

Short reference for reusing **existing new-MME logic** in a **new UI**. Full design/history: [`NEW_MME_SEARCH_REFERENCE.md`](./NEW_MME_SEARCH_REFERENCE.md). Legacy hero flow: [`OLD_MME_SEARCH_REFERENCE.md`](./OLD_MME_SEARCH_REFERENCE.md).

---

## `carIds` from Cars API (client contract)

| Scenario                                                                  | CTA (Find car parts / Save)                          | URL / session on apply                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Response has **no** `carIds` or `carIds: []`                              | Disabled                                             | N/A until user completes selection                                                                                                                                                                                                                                                                                 |
| Response has **one or more** ids but **not** all visible dropdowns filled | Disabled (`isNewMmeApplyCtaEnabled`)                 | N/A until every dynamically shown field has a selection — [Phase 7](#phase-7--cta-requires-all-visible-fields--carids)                                                                                                                                                                                             |
| Response has ids **and** all visible fields selected                      | Enabled (`isNewMmeApplyCtaEnabled`)                  | See row below                                                                                                                                                                                                                                                                                                      |
| **Edit** (hero Save, SRP banner Edit)                                     | Enabled when ≥1 id; apply uses **`carIds[0]`** only  | `replaceSearchedCarId(old, carIds[0])`, `updateFilters({ carIds: [carIds[0]] })` on listing                                                                                                                                                                                                                        |
| **Add / new / non-edit** search                                           | Same enable rule                                     | **Full** `carIds` array from Cars API: persist **all** ids (guest `pushSearchedCarIds(carIds)`; logged-in `POST /Garage` per id); `updateFilters({ carIds })` → `?carIds=id1,id2,id3`. **Target destination:** catalog when not on SRP ([Phase 4b](#phase-4b--navigation-hub-category-catalog-car-parts-planned)). |
| **Edit** (any surface)                                                    | Enabled when ≥1 id; **`carIds[0]` only** for replace | Guest `replaceSearchedCarId(old, carIds[0])`; logged-in one `POST /Garage` `{ id, carId: carIds[0] }`; URL `updateFilters({ carIds: [carIds[0]] })`.                                                                                                                                                               |

Implementation: `next/lib/newMmeFilters.ts` (`isNewMmeApplyCtaEnabled`, `getVisibleMmeFields`), `next/utils/newMmeCarApply.ts` (add vs edit persistence + URL ids), `next/hooks/useNewMmeCarFilters.ts` (`handleFindCarParts`, `handleSave`), hero `NewMmeSearch.tsx`, listing `SearchResultsNewMmeSidebar.tsx`.

---

## Old UI (current) — what exists today

### 1. Homepage — car picker below FAQ (retired)

- **Was:** `FaqSection` then `<NewMmeSearch />` on the locale home page — **commented out**; entry is hero card + right sidebar.
- **Gating:** Renders only when `getClientFeatureFlag("new_mme_feature_flag")` is on.
- **UX:** Progressive dropdowns — **Make → Model → Body → Variant → Engine → EngineCode → GearBox → GearBoxCode** (each step shown only when `POST /api/Cars` returns options for it). Searchable dropdowns + **Find car parts** CTA.
- **State:** `useNewMmeStore` (Zustand).
- **Data:** `POST /api/Cars` on load (empty payload) and after each selection. Shared helpers in `next/lib/newMmeFilters.ts` (`buildPayload`, `reconcileSelected`, `clearDependentFields`, etc.).
- **CTA rule:** **Find car parts** / **Save** enabled when `isNewMmeApplyCtaEnabled` is true — Cars API returned **at least one** resolved `carId` **and** every **currently visible** dropdown (make, model, and any dynamically added variant/body/engine/gearbox) has a valid selection. See [Phase 7](#phase-7--cta-requires-all-visible-fields--carids).
- **Navigation (today):** Non-listing apply often goes to `/search-results?carIds=…`. **Planned (Phase 4b):** non-SRP apply → **category catalog** `/{locale}/{parts-seg}/?carIds=…`; SRP apply unchanged — see [Phase 4b](#phase-4b--navigation-hub-category-catalog-car-parts-planned).
- **Edit vs search apply:** When the user is **editing** a car (hero Save or SRP banner Edit), persistence and listing URL use the **primary** id `carIds[0]` only (`replaceSearchedCarId`, `POST /my-cars` update, `updateFilters({ carIds: [newId] })`). **Add / new / non-edit Find car parts** push or set the **full** `carIds` array to session and URL (`pushSearchedCarIds(carIds)`, `updateFilters({ carIds })`).

### 2. Search results page — left sidebar (car + category)

- **Route:** `[language-country]/[searchdata]/page.tsx` → `products.tsx` when `searchdata` is `search-results` (or an MMT SEO slug).
- **Layout:** Desktop left column uses `OGCategoriesSearcBlock` (`next/components/og-components/OGCategoriesSearcBlock/index.tsx`), mounted from `products.tsx`.
- **Sidebar blocks (top → bottom):**
  1. **Car filter** — `SearchResultsNewMmeSidebar` (same Cars API flow as homepage, but **local `useState`**, not the homepage store). Accordion UI; **Find car parts** updates URL on the **current listing segment** (`search-results` or MMT slug), not always hard-coded `/search-results`.
  2. **Category filter** — `SingleCategorySidebarFilter` (L1 category; URL `categoryId`, synced with `useCategorySearchStore`).
- **URL prefill (car):** If `carIds` is in the URL, sidebar parses it → batch `GET /api/Cars/{id}` → merge prefill → optional `POST /api/Cars` to reconcile options. User can change filters and apply again via **Find car parts**.
- **Products listing:** Product API filters honor `carIds` when the new-MME flag is on (`useUrlParams`, `searchResultsQueryAllowlist.ts`).
- **PDP navigation:** When the listing URL has `carIds`, product cards (SRP grid, recently viewed on PDP, catalog top parts) append the same `carIds` to the part PDP URL via `buildPartPdpHref` / `partPdpOptionsFromSearchParams` (gated by `new_mme_feature_flag`).

### 3. Legacy MME in codebase (unchanged, not used by new car search)

- **Home hero / header:** `MMESearchFilter`, `heroCard2`, `SearchContainer`, `MMEBaseSearch` still support `makeModelTypeId` in code — **not part of Sprint 35**; new car UI must not depend on them.
- New sidebar car block returns `null` when `new_mme_feature_flag` is off; category sidebar still works.

### 4. Garage API + landing saved cars (logged-in, legacy flow)

For authenticated users, the **old hero / landing** flow also used the **Garage** API to persist “my cars” (still in code; tied to `makeModelTypeId`, not `carIds`).

**Landing UI — saved cars carousel**

- **Component:** `next/screens/landing/LandingSavedcarsContainer2.tsx`
- **Where shown:** Replaces the default hero MME block in `heroCard2.tsx` (and mobile `hero-card-mobile.tsx`) when `saved_car_feature_flag` is on, user is logged in, and `GET /Garage` returns at least one car.
- **Behavior:** Horizontal carousel of saved cars; select a car → **Find car parts** navigates to category selection with `?makeModelTypeId=…`; per-car menu for favorite, edit (opens `MMESearchModal` in garage edit mode via `generateMmeSearchData`), delete (confirm modal); OE ref modal integration.
- **Data source:** List from `SavedCarsContext` → `useGetMySavedCarsQuery()` → `getMySavedCars()`; mutations call `refreshSavedCars()` after success.

**Garage HTTP APIs** (`next/services/garageService.ts` → `next/hooks/garage.ts`)

| Method     | Path           | Service / hook                                                                    | Used for                                                                                                                                                                                               |
| ---------- | -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GET**    | `/Garage`      | `getMySavedCars` · `useGetMySavedCarsQuery` / `useGetMySavedCarsQueryLandingPage` | Load all saved cars (landing, header dropdown, garage bay, search modal, PDP, etc.)                                                                                                                    |
| **GET**    | `/Garage/{id}` | `getCarById` · `useGetCarByIdQuery`                                               | Single saved car by garage record id                                                                                                                                                                   |
| **POST**   | `/Garage`      | `addUpdateCarToEB` · `useAddUpdateMyCarsToEB`                                     | **Add** new car after MME/VIN search (`makeModelTypeId`, `name`, `year`, `isNew`, …); **update** display name, picture, `isFavorite`, `lastUsed`, etc. (body: `PostGaragePayload` in `next/type.d.ts`) |
| **DELETE** | `/Garage/{id}` | `deleteCarFromEB` · `useDeleteCarFromEB`                                          | Remove a saved car (`LandingSavedcarsContainer2` delete confirm)                                                                                                                                       |

**Favorite (logged-in):** toggle via **POST `/Garage`** with existing garage `id` + `isFavorite: true | false` (`handleToggleFavorite` in `LandingSavedcarsContainer2.tsx`) — not a separate endpoint.

**Other call sites (same Garage hooks):** `heroCard2` / `MMESearchModal` / `MMEBaseSearch` (auto-save on search), `next/screens/garage-bay/*`, `next/screens/og-search/SavedCars.tsx`, `next/screens/search/search-modal.tsx`, `useImageUpload` (car picture).

**Legacy / unused in UI:** `getAllCars(token)` — **POST `/Garage`** with `URLSearchParams({ token })`; exported from service but not wired through a React Query hook in current code.

**Sprint 35 note:** Garage + saved-car landing block remain in the repo; new car search does **not** use Garage or `makeModelTypeId` until product defines a Cars/Garage mapping.

---

## Logic to reuse (not the old hero MME)

| Concern                                                       | Where                                            |
| ------------------------------------------------------------- | ------------------------------------------------ |
| Progressive filter algorithm                                  | `next/lib/newMmeFilters.ts`                      |
| Cars API client                                               | `next/hooks/cars.ts`, `next/services/cars.ts`    |
| URL `carIds` read/write                                       | `useUrlParams`, `searchResultsQueryAllowlist.ts` |
| Homepage widget                                               | `next/components/NewMmeSearch.tsx`               |
| Results sidebar widget (legacy left; hidden when new flag on) | `next/components/SearchResultsNewMmeSidebar.tsx` |
| Right sidebar car UI                                          | `next/components/RightSidebarCarSelection.tsx`   |
| Shared filter hook                                            | `next/hooks/useNewMmeCarFilters.ts`              |
| Store (homepage only)                                         | `next/stores/useNewMmeStore.ts`                  |

Sprint goal: **new UI shell** wired to the same `POST /api/Cars` + `carIds` → search-results contract above.

---

## `makeModelTypeId` — out of scope for now

- **Sprint 35 / new car search does not use `makeModelTypeId`.** Vehicle context is **`carIds` only** (Cars API).
- **Leave existing `makeModelTypeId` code in the repo** (hero MME, `useMmeStore`, `SearchContainer`, URL helpers, etc.) — no removal in this sprint.
- **Do not wire the new UI to `makeModelTypeId`.** That param will not be set, read, or relied on for the new flow; it should not appear in new navigation or filters. Legacy paths may still reference it elsewhere until fully retired later.

---

## URL contract (new flow)

- **Param:** `carIds` — one or more car record ids, comma-separated in the query string.
- **Example:** `/en-BE/search-results?carIds=id1,id2&categoryId=001&take=12&order=priority`
- **Feature flag:** `carIds` is only allowlisted/parsed when `new_mme_feature_flag` is enabled for the locale country.

---

## Phase 1 — Figma “Car Selection” in global right sidebar (implemented)

### Design reference (Figma)

- **Shell:** `rightsidebar.tsx` — `fixed right-0 top-0 z-[60]`, 400px (`gtsm`/`gtlg`), overlay `z-[55]`. Open anywhere via `useRightSidebarStore.showRightSidebarPanel()`.
- **Header:** Close (X) · title **“Car Selection”** · **Reset** (top-right).
- **Body:** Stacked bordered dropdowns (Make, Model, + progressive Variant / Body / Engine / Gearbox per API).
- **Footer:** Full-width primary CTA — **`Find car parts`** on `gtsm+`, **`Save`** on `base` (Tailwind only, no `useMedia` for label).

### Architecture (implementation)

| Layer        | File                                                  | Role                                                                                                            |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Logic        | `next/hooks/useNewMmeCarFilters.ts`                   | Prefill from URL `carIds`, `POST /api/Cars`, select, reset, apply (extracted from `SearchResultsNewMmeSidebar`) |
| Parse helper | `next/utils/parseCarIdsParam.ts`                      | Shared `carIds` query parsing                                                                                   |
| UI           | `next/components/RightSidebarCarSelection.tsx`        | Figma dropdowns + header/footer                                                                                 |
| Shell        | `next/screens/landing/rightsidebar.tsx`               | Mounts car selection when `new_mme_feature_flag`                                                                |
| SRP banner   | `next/components/SearchResultsCarSelectionBanner.tsx` | State A/B + session dropdown                                                                                    |
| Store        | `next/stores/useRightSidebar.ts`                      | `showRightSidebar` default **`false`**                                                                          |

Bootstrap runs when sidebar is **open** (`enabled` on hook) so idle pages do not call Cars API.

### CTA labels (Tailwind only)

```tsx
<span className="gtsm:hidden">{getLabel("save", "Save")}</span>
<span className="hidden gtsm:inline">{getLabel("find_car_parts", "Find car parts")}</span>
```

Same `onClick` for both.

### Reset

- Clear **sidebar form only** + `POST /api/Cars` empty payload (initial makes).
- Does **not** change URL, session, or Zustand edit/add intent until **Save** / **Find car parts** (see [Phase 6f](#phase-6f--sidebar-reset-form-only-no-url--page-side-effects)).
- Does **not** clear `searched_car_id` session.

### Search-results: prefill in right sidebar (not left)

| Area              | Behavior                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Right sidebar** | `useNewMmeCarFilters({ enabled: isOpen })` — same prefill as old left block (`GET /Cars/{id}` batch → merge → `POST /api/Cars`).                |
| **Left sidebar**  | `OGCategoriesSearcBlock` — **no** `SearchResultsNewMmeSidebar` when `new_mme_feature_flag` (category filter only).                              |
| **SRP header**    | `SearchResultsCarSelectionBar` when new flag on listing; legacy `SearchContainer` hidden on listing when new flag on (avoids duplicate MME UI). |

**Apply on listing:** `updateFilters({ carIds }, listingBase, …, { appendAllowedTrackingQueryParams: true })`; CTA disabled until `findCarPartsDirty` when URL already has `carIds`.

**Apply elsewhere:** `updateFilters({ carIds }, "/search-results", …)` + `hideRightSidebar()`.

### Regression guards

- `new_mme_feature_flag` **off** → left `SearchResultsNewMmeSidebar` unchanged; no right car UI.
- Product listing still reads `carIds` from URL; `searchResultsQueryAllowlist` unchanged.
- Legacy `mme_feature_flag` / `SearchContainer` still on non-listing pages when new flag on.
- No `makeModelTypeId` / Garage in new flow.

### Homepage browse-by-category + hero car (implemented)

When the user has a car selected in the **hero slider** and clicks a category on the homepage (`BrowseByCategory2` — L2/L3 links or L1/L2 “View all”):

| Piece                            | Role                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `useLandingHeroCarStore`         | `selectedCarsApiId` synced from `HeroCarDataCard` on slider selection; cleared when hero has no cars                         |
| `categorySearchUrl.ts`           | `appendCategorySearchQuery` accepts optional `carIds`                                                                        |
| `browse-by-category-2/index.tsx` | If `new_mme_feature_flag` + hero car + not category-catalog → `/search-results?carIds=…&categoryId=…&take=12&order=priority` |
| Legacy                           | Flag off or no hero car → unchanged `makeModelTypeId` / category-only URLs                                                   |

**Example:** `/en-BE/search-results?carIds=mndb693fccd5mo&categoryId=001001002&take=12&order=priority`

**Planned:** Phase 4b routes new-car apply to catalog with `carIds`; Phase 5 adds banner + browse links with `carIds` on catalog/SEO. **Not changed yet:** Category **catalog** still uses URL `makeModelTypeId` only when new MME off; L1 tiles still only select L1 (no direct link).

### Phase 1 checklist

- [x] Document Figma + architecture (this section)
- [x] `useNewMmeCarFilters` + `parseCarIdsParam`
- [x] `RightSidebarCarSelection` + `rightsidebar.tsx`
- [x] Hide left car filter when flag on; SRP car banner on listing
- [x] `showRightSidebar` default `false`
- [ ] Design QA: z-index, header trigger icon

---

## Session storage — `searched_car_id` (Phase 2)

### Who uses session

| User                       | Session history | Notes                                                          |
| -------------------------- | --------------- | -------------------------------------------------------------- |
| Logged out                 | Yes             | Primary case                                                   |
| Logged in                  | No              | Car selection is expected to be persisted by backend save flow |
| Logged in + Garage (later) | No              | Use backend saved cars / Garage, not session                   |

**Code rule:** `shouldUseSessionCarHistory(isAuthenticated)` → `true` only when `new_mme_feature_flag` is on **and user is logged out**.

### Storage contract

- **Key:** `searched_car_id`
- **Value:** JSON `string[]`, **newest first**: `["latestId", "previousId", …]`
- **Max length:** 10 (dedupe on push)
- **Write:** On successful apply from right sidebar (`useNewMmeCarFilters.handleApply`) — push each applied `carIds` entry **for logged-out users only**
- **Read:** SRP banner dropdown; future hero “recent cars”
- **Reset (sidebar):** Clears form only; **does not** change URL or session (see Phase 6f)

### Two sources of truth

| Concept               | Source                    | UI                               |
| --------------------- | ------------------------- | -------------------------------- |
| Active car on listing | URL `carIds`              | SRP banner State B, product API  |
| Recent searches       | Session `searched_car_id` | Dropdown options on State B only |

**State A** when URL has **no** `carIds` (even if session has ids). **State B** when URL has `carIds`.

### Files

| File                                  | Role                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| `next/utils/searchedCarIdsSession.ts` | `get` / `push` / `clear` / `shouldUseSessionCarHistory` |
| `next/utils/formatCarDisplayLabel.ts` | Display string from `GET /Cars/{id}` payload            |
| `next/hooks/useSearchedCarLabels.ts`  | React Query labels for session id list                  |

---

## Phase 2 — Homepage hero “SELECT YOUR CAR” (implemented)

### Figma

- White card: **SELECT YOUR CAR**
- Row: car icon + **Car selection** + subtitle _Make, model, year, version…_ → opens right sidebar
- CTA **Find your parts** → opens right sidebar (same as row)
- Right column: existing hero carousel unchanged
- If user has car data, show **car-data slider/card view** (single card when only one; slider controls when multiple) like legacy saved-cars UX.

### Hero display priority (when `new_mme_feature_flag`)

| Priority  | Condition                           | UI                           |
| --------- | ----------------------------------- | ---------------------------- |
| 1 (later) | Logged in + Garage has cars + flags | `LandingSavedcarsContainer2` |
| 2 (later) | Session has ids                     | Recent-cars hero carousel    |
| 3 (now)   | Default                             | `HeroNewCarSelectionCard`    |

**Interim:** When new MME flag is on, skip Garage hero carousel (`showSavedCarsInHero = false`) so all users get the new card until save-car on new flow is ready.

### Wiring

- `heroCard2.tsx` / `hero-card-mobile.tsx`: if `new_mme_feature_flag` → `HeroNewCarSelectionCard` instead of legacy `MMESearchFilter` card
- Legacy hero unchanged when flag off
- Homepage `NewMmeSearch` below FAQ: **commented out** (sidebar is entry point)
- New component: `HeroCarDataCard` for data-present state (Image 2)
- State switching:
  - **No car data** (logged-out session empty OR logged-in saved-cars empty) → Image 1 `HeroNewCarSelectionCard`
  - **Has car data** → Image 2 `HeroCarDataCard`

| File                                          | Role            |
| --------------------------------------------- | --------------- |
| `next/components/HeroNewCarSelectionCard.tsx` | Hero trigger UI |

---

## Phase 2b — SRP car banner: two states + recent dropdown (implemented)

### State A — no car in URL (Figma image 1)

- Background: `bg-color-background-emphasis` (cream / emphasis)
- Icon + _Identify your vehicle to view compatible products_
- **Select car** → `showRightSidebarPanel()`
- No dropdown
- Mobile: stacked; full-width Select car

### State B — `carIds` in URL (Figma image 2)

- Background: `bg-color-background-positive-muted` + positive border (green banner)
- _Showing products compatible with_ + **dropdown** of session recent cars (labels from `GET /Cars/{id}`)
- Selected option = primary URL `carIds[0]`
- **Edit car** → open right sidebar (prefill from URL)
- Dropdown change → `updateFilters({ carIds: [id] }, listingBase, …)` (no sidebar)
- Mobile: label row, full-width dropdown, Edit car

### Component

- `SearchResultsCarSelectionBanner.tsx` — replaces single-state `SearchResultsCarSelectionBar.tsx`
- Mounted from `products.tsx` when `new_mme_feature_flag` on search-results listing

---

## Phase 2c — Hero car-data source & CRUD behavior (implemented/placeholder)

### Logged-out source

- Source: session key `searched_car_id` (array of car ids).
- Resolve labels/details by calling `GET /Cars/{id}`.
- Delete: remove id from session.
- Edit (hero): set editing id in session, open sidebar in **heroSave** intent, **Save** replaces that id in session.

### Logged-in source

- Source: backend “my cars” (placeholder endpoint wiring for now).
- Dummy API contract used in code:
  - Add/save/edit: `POST /api/my-cars`
  - Delete: `DELETE /api/my-cars/{id}`
- Until APIs are ready, failures are handled safely and UI falls back to empty-data view.

### Flow diagram

```text
URL carIds empty  → State A → Select car → Right sidebar → Apply → URL + session push → State B
URL carIds set    → State B → Dropdown picks session id → URL update → listing refetch
                    → Edit car → Right sidebar (Find car parts — see Phase 4)
```

---

## Phase 4 — Two “Edit” flows (hero Save vs SRP Find car parts)

Both open the same right sidebar and **prepopulate** MME fields via `GET /Cars/{id}` + `POST /api/Cars`. The **footer CTA and persistence** differ.

### Comparison

|                  | **Homepage hero** (`HeroCarDataCard` → Edit)                                  | **Banner → Edit car** (SRP, `/car-parts`, category L1–L3 via `CategoryCarSelectionBanner`)                                                                                           |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Store intent** | `sidebarIntent: "heroSave"`                                                   | `sidebarIntent: "findCarParts"` + `listingPrefillCarsApiId` + `editingCarsApiId` / `editingMyCarRecordId`                                                                            |
| **Footer CTA**   | **Save**                                                                      | **Find car parts** (label unchanged; apply semantics differ from add/new)                                                                                                            |
| **Stay on page** | Yes (hero refreshes)                                                          | Yes on SRP (listing URL updates). Catalog hub stays on current path (`applyBasePath`) with updated `carIds`.                                                                         |
| **Logged out**   | **Replace** that car id in `searched_car_id` session (`replaceSearchedCarId`) | **Edit apply:** **replace** the prefill/banner car id in session on **any** surface (not gated on `isListingPage`). **Add/new/select:** still **push**                               |
| **Logged in**    | **Edit** saved row: `POST /my-cars` with `{ id: myCarRecordId, carId }`       | **Edit apply:** same **update** when a my-cars row exists for the old `carId` (catalog + SRP). **Add/new on SRP only:** `POST /my-cars` with `{ carId }` only                        |
| **URL `carIds`** | N/A (navigate only if user used Find car parts elsewhere)                     | **Edit apply:** `updateFilters({ carIds: [carIds[0]] })` — single primary id even if API returned multiple. **Add/new:** full `carIds` array on SRP; catalog navigation per Phase 4b |
| **Skeleton**     | Edit skeleton while prefill (`isEditPrefillActive`)                           | No Save skeleton; uses listing warm cache when URL already hydrated                                                                                                                  |

### API entry points

| Action                                             | Method                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hero edit                                          | `showRightSidebarForHeroEdit({ carsApiId, myCarRecordId? })`                                      |
| Banner edit (SRP + catalog)                        | `showRightSidebarForListingEdit({ carsApiId, myCarRecordId? })` + guest `setEditingSearchedCarId` |
| Add / select car                                   | `showRightSidebarPanel()`                                                                         |
| SRP “Add new car” (empty MME, like hero Other Car) | `showRightSidebarForNewCar()` → Find car parts → session push / `POST /my-cars` add               |

### Session duplicate car id (logged-out)

If **Save** or **Find car parts** resolves to a `carId` already in `searched_car_id`:

- Close right sidebar (no redundant session write beyond promoting that id to front).
- **Hero:** `HERO_CAR_SELECT_EVENT` focuses the matching slider card.
- **SRP / catalog:** `updateFilters({ carIds: [id] })` so the banner dropdown shows that car selected.

New cars (id not in session) keep existing replace / push / URL / API behaviour. **Banner Edit** uses replace when the resolved id was already in session (via `applyExistingSessionCar` with the old prefill id). `getEditOldCarsApiId()` in `useNewMmeCarFilters` drives edit detection (`listingPrefillCarsApiId` / `editingCarsApiId` / guest `editing_searched_car_id`).

### Logged-in note (banner edit)

- **Banner → Edit car → Find car parts** (opened via `showRightSidebarForListingEdit`, `listingPrefillCarsApiId` set): **update** the my-cars row when `myCarRecordId` is known (from banner lookup or React Query cache by old `carId`). If no row exists, only URL/session update — no add-only POST on this path. Applies on **catalog** (`/car-parts`, category pages) as well as SRP.
- **Add new car**, **Select car** (State A), or generic sidebar open on listing: unchanged — **add** with `POST /my-cars` `{ carId }` when dirty.

### Files

| File                                    | Role                                                           |
| --------------------------------------- | -------------------------------------------------------------- |
| `useRightSidebar.ts`                    | `heroSave` vs `findCarParts` + `listingPrefillCarsApiId`       |
| `useNewMmeCarFilters.ts`                | `handleSave` (hero) vs `handleFindCarParts` (SRP + add my-car) |
| `heroCard2.tsx`, `hero-card-mobile.tsx` | `showRightSidebarForHeroEdit`                                  |
| `SearchResultsCarSelectionBanner.tsx`   | `showRightSidebarForListingEdit`                               |
| `CategoryCarSelectionBanner.tsx`        | Catalog wrapper; same edit/replace apply via shared banner     |

### Checklist

- [x] Document Phase 4 (this section)
- [x] Split sidebar intents + listing prefill id
- [x] Hero → Save / replace / upsert-with-id
- [x] SRP Edit → Find car parts / replace session / POST my-cars with id (aligned with hero edit semantics)
- [x] Catalog (`/car-parts`, category) Edit → same replace session + URL `[carIds[0]]` (not gated on `isListingPage`)

---

## Phase 3 — SRP listing: warm sidebar, banner dropdown, reset (planned + implementing)

Reference legacy UI: `SavedCarDropdownComponent.tsx`, `SearchContainer.tsx` (green vs gray band).

### Goals

| #      | Requirement       | Behavior                                                                                                                                                                                                                                                                                              |
| ------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3a** | Page-load warm-up | ~~When URL has `carIds` on search-results, run `GET /Cars/{id}` + `POST /api/Cars` once on load~~ **Superseded by [Phase 9](#phase-9--lazy-edit-prefill-one-post-cars-on-edit-only-not-on-page-load):** no `POST /Cars` on load; prefill on **Edit car** only.                                        |
| **3b** | Banner dropdown   | Custom dropdown (search, “Add new car”, **Most recent** list, ✓ on selected id) — same UX pattern as `SavedCarDropdownComponent`, but options are **Cars API ids** + labels from `useSearchedCarLabels` / `formatCarDisplayLabel`. Selected row = primary URL `carIds[0]`.                            |
| **3c** | Banner colors     | **Green** (`border-color-border-positive`, `bg-color-background-positive-muted`, green car icon) when URL has `carIds` (active compatibility). **Gray** (`border-color-border-emphasis`, `bg-color-background-emphasis`) when URL has no `carIds` — including after Reset while session list remains. |
| **3d** | Sidebar Reset     | Reset sidebar MME fields to empty makes only. **Do not** clear URL `carIds` or session until apply (updated — [Phase 6f](#phase-6f--sidebar-reset-form-only-no-url--page-side-effects)).                                                                                                              |

### State machine (SRP banner)

```text
State A (gray)     — no URL carIds, no session ids → “Identify…” + Select car CTA
State A′ (gray)    — no URL carIds, session has ids → dropdown (no selection) + Add new car
State B (green)    — URL has carIds → “Showing products compatible with” + dropdown (id selected) + Edit car
```

### Technical notes

| Concern           | Approach                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warm-up           | ~~`useNewMmeCarFilters({ enabled: isOpen, keepWarmOnListing })`~~ **Phase 9:** `enabled: isOpen` only; edit prefill on open via `listingPrefillCarsApiId` |
| Skip re-bootstrap | `listingHydratedKeyRef` — skip GET+POST batch if `initKey` already hydrated                                                                               |
| Edit on SRP       | If same `initKey` already warm, skip `isEditPrefillActive` skeleton                                                                                       |
| Labels on load    | Selected car only: `useSearchedCarLabels([primaryCarId])` on URL change; other session ids fetched when dropdown **opens**                                |
| Files             | `SearchResultsSearchedCarsDropdown.tsx`, `SearchResultsCarSelectionBanner.tsx`, `useNewMmeCarFilters.ts`, `RightSidebarCarSelection.tsx`                  |

### Checklist

- [x] 3a Warm listing sidebar + skip re-prefill on open
- [x] 3b Custom dropdown UI (SavedCarDropdown parity)
- [x] 3c Green / gray banner from URL `carIds`
- [x] 3d Reset clears sidebar form only; URL/session preserved until apply (Phase 6f)

---

## Phase 4b — Navigation hub: category catalog (`car-parts`) (implemented)

**Status:** Implemented. Catalog hub navigation before Phase 5 banner/propagation.

**Product rule (canonical):** After the user **selects or saves** a car via the new MME flow, they should land on the **category catalog** (`/{locale}/{parts-seg}/`, e.g. `/en-BE/car-parts/`) to **pick a category**, unless they are **already on search results** — then behaviour stays as today (update `carIds` on the current listing and refetch).

| User is on…                                                            | After **Find car parts** or **Save** (new MME)                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Search results** (`detectPage === "search-results"`)                 | **Stay on search results** — `updateFilters({ carIds })` on current listing segment (Phase 2b / 3 / 4; no redirect to catalog). |
| **Any other page** (home, car-parts, L1/L2/L3 SEO, PDP, profile, etc.) | **Navigate to category catalog** with `carIds` in the query string.                                                             |

Localized parts segment comes from `getPartsRouteSegmentForLang` / `Routes.parts(languageCountry)` — not hard-coded `car-parts` in code.

### Case 1 — Hero already has a car selected

**Trigger:** User has a car selected in the **hero slider** (`HeroCarDataCard` / `useLandingHeroCarStore.selectedCarsApiId` or equivalent). User taps **Find car parts** (hero CTA).

**Flow:**

```text
Home (hero car selected)
  → Find car parts
  → /{locale}/{parts-seg}/?carIds={selectedCarId}     ← category catalog
  → user picks L1 / L2 / L3 (BrowseByCategory2 or SEO tiles)
  → /{locale}/search-results?carIds=…&categoryId=…&take=12&order=priority
```

**Notes:**

- Today hero **Find car parts** may open the sidebar or deep-link elsewhere; target is **direct catalog navigation** when a car is already known (no extra sidebar step unless product asks for confirm).
- Homepage **browse-by-category** tiles (when hero car is set) may continue to deep-link **straight to search-results** with `carIds` + `categoryId` (shortcut), or also route via catalog — **default for Phase 4b:** hero Find car parts → catalog; homepage category click can remain shortcut to SRP (documented in § Homepage browse-by-category) unless PM aligns both to catalog-first.

### Case 2 — No car yet, or “Other car” / new selection

**Trigger:** No car in hero/session yet, **or** user chose **Other car** / empty sidebar (`forceEmptySidebar`) and completed MME in the **right sidebar** (desktop) or **drawer** (mobile). User taps **Find car parts** or **Save**.

**Flow when NOT on search results:**

```text
Any non-SRP page
  → sidebar/drawer: complete MME → Find car parts or Save
  → session/my-cars updates (existing Phase 2 / 4 rules)
  → /{locale}/{parts-seg}/?carIds={resolved ids}      ← category catalog
  → user picks category
  → search-results?carIds=…&categoryId=…
```

**Flow when already on search results (unchanged):**

```text
Search results
  → sidebar Find car parts (add / edit / new car)
  → stay on listing; URL carIds (+ session / my-cars per Phase 4)
  → product refetch
```

**Notes:**

- **Save** on home (hero edit intent) today may refresh hero only; under Phase 4b, **Save** from non-SRP should also send the user to **catalog with `carIds`** after a successful save (same hub rule as Find car parts), unless PM limits Save to in-place hero refresh only — **default:** both CTAs use the hub rule when `!isListingPage`.
- Logged-in **Save** still runs `POST /my-cars`; logged-out still updates `searched_car_id` before navigation.

### Query string on catalog

| Param             | Required on catalog after apply    | Purpose                                          |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| `carIds`          | Yes (one or more, comma-separated) | Drives Phase 5 banner State B + browse redirects |
| `categoryId`      | No until user picks a category     | Set only on navigation to search-results         |
| `makeModelTypeId` | Legacy only when new MME flag off  | Do not rely on for new flow                      |

Example: `/en-BE/car-parts?carIds=mndb693fccd5mo` (nl-BE: `/nl-BE/auto-onderdelen?carIds=…`).

### Current behaviour vs target (gap)

| Entry point                                                    | Current (typical)                                 | Target (Phase 4b)                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `useNewMmeCarFilters.handleFindCarParts` when `!isListingPage` | `updateFilters({ carIds }, "/search-results", …)` | `updateFilters({ carIds }, Routes.parts(locale), …)` or equivalent path to catalog |
| Hero Find car parts with car selected                          | Sidebar / varies                                  | Catalog with `carIds` (Case 1)                                                     |
| Hero browse category + car                                     | `/search-results?carIds&categoryId` (implemented) | Optional shortcut — keep unless PM wants catalog-first for all                     |
| SRP sidebar / banner apply                                     | Stay on SRP                                       | **No change**                                                                      |

### Implementation plan (Phase 4b only)

| Step | File(s)                                                                  | Change                                                                                                                                                                                                                         |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `hooks/useNewMmeCarFilters.ts`                                           | In `handleFindCarParts` / `handleSave`: if `!isListingPage` and `new_mme_feature_flag`, navigate to `Routes.parts(languageCountry)` + `carIds` query instead of `/search-results`. Keep full `carIds` array (comma-separated). |
| 2    | `HeroNewCarSelectionCard.tsx` / `heroCard2.tsx` / `hero-card-mobile.tsx` | Case 1: Find car parts with known `carsApiId` → catalog URL with `carIds` (may skip opening sidebar).                                                                                                                          |
| 3    | `browse-by-category-2/index.tsx`                                         | On **category catalog** (`detectPage === "category-catalog"`), read `carIds` from URL and pass into `appendCategorySearchQuery` when building links to search-results (pairs with Phase 5).                                    |
| 4    | `utils/categorySearchUrl.ts`                                             | Optional helper `buildPartsCatalogUrl(locale, carIds)` for consistent catalog links.                                                                                                                                           |
| 5    | Docs / QA                                                                | Update § Homepage browse-by-category if hero shortcut policy changes.                                                                                                                                                          |

### Phase 4b testing checklist

1. Hero car selected → Find car parts → catalog URL contains `carIds`; no SRP until category chosen.
2. Home → Other car → sidebar → Find car parts → catalog with `carIds`; then category → SRP with `categoryId` + `carIds`.
3. SRP → Add new car → Find car parts → **still SRP**, URL updated, listing refetch.
4. SRP → Edit car → apply → **still SRP** (Phase 4).
5. Localized locale (nl-BE) → correct parts segment + `carIds` preserved.
6. `new_mme_feature_flag` off → legacy navigation unchanged.

### Dependency

- **Phase 5** (banner on catalog/SEO) assumes catalog URLs already carry `carIds` from Phase 4b.

---

## Phase 5 — Car selection banner on category surfaces + `carIds` propagation

**Status:** Implemented.  
**Depends on:** [Phase 4b](#phase-4b--navigation-hub-category-catalog-car-parts-implemented) (catalog as hub with `carIds` in URL).  
**Related:** [`new-single-category-filter.md`](./new-single-category-filter.md) (search-results `categoryId` contract must stay unchanged).

### Goal

Reuse the **search-results car banner** (`SearchResultsCarSelectionBanner` + session/URL `carIds` behaviour) on **category catalog** and **category SEO** pages, and ensure **`carIds` persist** when users navigate via breadcrumbs or category links (including from **product details**).

Legacy **`SearchContainer` / `makeModelTypeId`** remains for locales or flags where `new_mme_feature_flag` is off.

### Surfaces in scope

| Surface          | Route (example)                         | Current car UI                               | Target                                     |
| ---------------- | --------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| Category catalog | `/en-BE/car-parts/` (localized segment) | `SearchContainer` (`mme_feature_flag`)       | New MME banner when `new_mme_feature_flag` |
| Category L1 SEO  | `/en-BE/car-parts/category/engine`      | `SearchContainer` in `CategoryL1ClientShell` | Same banner (dynamic client chunk)         |
| Category L2 SEO  | `…/category/engine/filters`             | `CategoryL2ClientShell`                      | Same                                       |
| Category L3 SEO  | `…/category/engine/filters/oil-filter`  | `CategoryL3ClientShell`                      | Same                                       |
| Product details  | `/en-BE/car-parts/{seo}/{partId}`       | No banner                                    | Breadcrumb links only (carry `carIds`)     |
| Search results   | `/en-BE/search-results?carIds=…`        | Banner (done)                                | No regression                              |

### Feature gating

- Show new banner only when `getClientFeatureFlag("new_mme_feature_flag")` is true for the locale country.
- When flag is off: keep existing `SearchContainer` + `makeModelTypeId` behaviour on catalog/SEO (no layout change).

### LCP / CLS (SEO pages)

- Do **not** add the full banner synchronously in server `CategoryL*Page` shells (avoid growing critical JS like today’s `SearchContainer`).
- Load banner via `next/dynamic` from a thin wrapper (e.g. `CategoryCarSelectionBanner.tsx`) with **`ssr: false`** or client-only boundary consistent with `HeaderRowWithNoSSR` / Phase 3 warm patterns.
- Render a **fixed-height skeleton** placeholder in the shell until the chunk loads:
  - Match banner layout: `section-standard`, `py-4` / `gtsm:py-6`, icon + title + dropdown row (see `SearchResultsCarSelectionBanner` State A′/B).
  - One skeleton spec for State A (no car) height; optional taller variant if dropdown row present — prefer **max height of State B** to avoid CLS when car is in URL.
- Catalog `car-parts/page.tsx` is client-heavy already; same dynamic + skeleton pattern for consistency.

### Banner behaviour on category pages (parity with SRP)

- Read **`carIds`** from `useSearchParams()` (`parseCarIdsParam`).
- **Green / gray** states, dropdown, Add new car, Edit car → same right sidebar intents as SRP (`showRightSidebarPanel`, `showRightSidebarForNewCar`, `showRightSidebarForListingEdit`).
- **Do not** require URL `carIds` for page render (SEO content is server-driven); banner is client overlay on catalog/SEO.
- On catalog/SEO, changing car via dropdown should set `?carIds=` on the **current pathname** (stay on page) — aligns with Phase 4b hub URLs.
- **Open product decision:** Show banner State B when `carIds` only in session (no URL)? **Default for Phase 5:** URL-only State B on catalog/SEO (same as SRP); session ids appear in dropdown after first catalog visit with URL `carIds`.

### `carIds` propagation rules

**Query contract (unchanged):** comma-separated `carIds` in query string; parse via `parseCarIdsParam`; build via `appendCategorySearchQuery` / `convertObjToSearchParams`.

| Navigation type                              | Rule                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SRP + PDP breadcrumb → Car parts, L1, L2, L3 | If URL has `carIds`, append to each breadcrumb `href` via `appendVehicleContextToHref` (`SearchResultsBreadcrumb.tsx`, `ProductDetailsBreadcrumb.tsx`). Legacy `makeModelTypeId` preserved when new MME flag off.                                                                                    |
| SEO shell breadcrumbs (L1/L2/L3)             | Same: Home, Car parts, parent category links include current `carIds` (and legacy `makeModelTypeId` when applicable).                                                                                                                                                                                |
| Browse / grid → **search-results**           | `appendCategorySearchQuery(..., { categoryId, carIds: parseCarIdsParam(sp), … })` when `carIds` present; else today’s behaviour. Update: `BrowseByCategory2` (catalog), `CategoryL2Section`, `CategoryL3Grid`, `CategoryL3TopPartsSection`, any other `appendCategorySearchQuery` call sites on SEO. |
| Home browse (shortcut)                       | May still link directly to SRP with `carIds` + `categoryId` when hero car set (see Phase 4b); catalog browse must pass URL `carIds`.                                                                                                                                                                 |
| Search-results                               | No change to `categoryId`-only sidebar rules.                                                                                                                                                                                                                                                        |

**Primary vs multiple ids:**

- URL may contain multiple ids: `?carIds=id1,id2` (already supported on SRP apply).
- Banner dropdown **selected** row = `carIds[0]` (same as SRP banner).
- **Edit apply** on listing: still `carIds[0]` + replace session row (Phase 4 — no change).

**Legacy coexistence:**

- If both `carIds` and `makeModelTypeId` exist, new MME flows prefer **`carIds`** for banner and search-results product API; do not strip `makeModelTypeId` from URLs until product deprecates legacy MME on those surfaces.

### Out of scope / must not break

- Search-results **single `categoryId`** sidebar and URL allowlist (`new-single-category-filter.md`).
- Advanced search multi-category (`/search/categories`) unless explicitly extended later.
- Middleware locale rewrites for parts/category segments.
- Phase 3 warm sidebar, session reset rules, hero Save vs SRP edit (Phase 4).
- Replacing PDP fitment/compatibility API contracts in this phase (breadcrumb query only unless PM asks for listing filters on PDP).

### Implementation plan (files)

| Step | File(s)                                                                                 | Notes                                                                                                |
| ---- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 0    | Phase 4b                                                                                | Catalog hub navigation before banner UX                                                              |
| 1    | `utils/categorySearchUrl.ts` (or new helper)                                            | `appendVehicleContextToHref`, `getCarIdsFromSearchParams` wrapper                                    |
| 2    | `ProductDetailsBreadcrumb.tsx`, `SearchResultsBreadcrumb.tsx`                           | Read `carIds` from URL; append to `partsHref`, L1/L2/L3 hrefs when flag on                           |
| 3    | `CategoryL1/2/3ClientShell.tsx`                                                         | Breadcrumb hrefs + replace `SearchContainer` with dynamic banner wrapper                             |
| 4    | `car-parts/page.tsx`                                                                    | Flag branch: dynamic banner vs `SearchContainer`                                                     |
| 5    | `CategoryCarSelectionBanner.tsx` + `CategoryCarSelectionBannerSkeleton.tsx`             | Wrap `SearchResultsCarSelectionBanner`; `listingBase` = current pathname for dropdown on catalog/SEO |
| 6    | `BrowseByCategory2`, `CategoryL2Section`, `CategoryL3Grid`, `CategoryL3TopPartsSection` | Pass `carIds` from `searchParams` into `appendCategorySearchQuery` when flag on                      |
| 7    | `SearchResultsCarSelectionBanner.tsx` (optional refactor)                               | Extract shared props: `basePath`, `onApplyCarIds` if catalog should not use `search-results` segment |

### Testing checklist

1. Phase 4b Case 1 + 2 flows, then PDP with `?carIds=x` → breadcrumb Car parts / L1 / L2 / L3 URLs include `carIds=x`.
2. L1 → L2 breadcrumb with `carIds` → child URL keeps `carIds`.
3. L3 “view products” / grid link → `search-results?categoryId=…&carIds=…` (multi-id if API returned several).
4. Catalog `auto-onderdelen` (nl-BE) → banner loads with skeleton, no layout shift; rewrite still works.
5. `new_mme_feature_flag` off → `SearchContainer` unchanged, no skeleton/banner.
6. SRP regression: banner, warm sidebar, edit replace, `categoryId` drill.
7. Vitest: extend `categorySearchUrl.test.ts` for `carIds` on `appendCategorySearchQuery` + new href helper.

### Open product decisions

- Homepage category tiles: keep **direct SRP** shortcut vs force **catalog-first** for all paths.
- Banner State B when `carIds` only in session on catalog/SEO (default: URL-only).

---

## Implementation index (refer here when coding)

| Phase | Item                                    | File(s)                                                                                                                                                 |
| ----- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Right sidebar shell                     | `rightsidebar.tsx`, `useRightSidebar.ts`                                                                                                                |
| 1     | Car filters logic                       | `useNewMmeCarFilters.ts`, `newMmeFilters.ts`                                                                                                            |
| 1     | Sidebar UI                              | `RightSidebarCarSelection.tsx`                                                                                                                          |
| 2     | Session                                 | `searchedCarIdsSession.ts`, hook apply push                                                                                                             |
| 2     | Hero card                               | `HeroNewCarSelectionCard.tsx`, `heroCard2.tsx`, `hero-card-mobile.tsx`                                                                                  |
| 2b    | SRP banner                              | `SearchResultsCarSelectionBanner.tsx`, `useSearchedCarLabels.ts`                                                                                        |
| 2b    | Labels                                  | `formatCarDisplayLabel.ts`                                                                                                                              |
| 3     | SRP warm + dropdown + reset             | `SearchResultsSearchedCarsDropdown.tsx`, Phase 3 section above                                                                                          |
| 4     | Hero Save vs SRP Find car parts edit    | `useRightSidebar.ts`, Phase 4 section above                                                                                                             |
| 4b    | Catalog hub navigation (`carIds`)       | `useNewMmeCarFilters.ts`, `heroCard2.tsx`, `hero-card-mobile.tsx`, `categorySearchUrl.ts` — § Phase 4b                                                  |
| 5     | Banner on catalog/SEO + propagation     | `CategoryCarSelectionBannerSlot.tsx`, `SearchResultsCarSelectionBanner.tsx`, shells, `browse-by-category-2`, `ProductDetailsBreadcrumb.tsx` — § Phase 5 |
| 6     | Logged-in Garage (`carId`)              | `garageService.ts`, `hooks/garage.ts`, `useHeroCarsPanel.ts`, `useNewMmeCarFilters.ts`, `garageCarId.ts` — § Phase 6                                    |
| 6b    | Multiple `carIds` add vs edit           | `utils/newMmeCarApply.ts`, `useNewMmeCarFilters.ts` — § Phase 6b                                                                                        |
| 8     | Field order + EngineCode/GearBoxCode    | `lib/newMmeFilters.ts`, `RightSidebarCarSelection.tsx`, `useNewMmeCarFilters.ts` — § Phase 8                                                            |
| 9     | Lazy edit prefill (1 POST, no SRP load) | `useNewMmeCarFilters.ts`, `newMmeFilters.ts`, `RightSidebarCarSelection.tsx` — § Phase 9                                                                |
| 9c    | Edit prefill cache (repeat Edit)        | `newMmeEditPrefillCache.ts`, `useNewMmeCarFilters.ts` — § Phase 9c                                                                                      |

---

## Sprint 35 intent

- [x] Document Phase 1 (right sidebar)
- [x] Implement Phase 1 core
- [x] Document Phase 2 + 2b (hero, session, SRP banner)
- [x] Implement Phase 2 + 2b
- [x] Phase 3: SRP warm sidebar, SavedCar-style dropdown, reset/session rules (this doc § Phase 3)
- [x] Phase 4: Hero Save vs SRP Find car parts edit (documented + implemented per § Phase 4)
- [x] **Phase 4b:** Catalog hub navigation (Case 1 hero → catalog; Case 2 sidebar apply → catalog; SRP unchanged)
- [x] **Phase 5:** Banner on catalog/SEO + `carIds` propagation (`CategoryCarSelectionBannerSlot`, breadcrumbs, browse links)
- [x] **Phase 6 (logged-in Garage):** Implemented — Garage APIs for logged-in (§ Phase 6)
- [x] **Phase 6b:** Multiple `carIds` add (save all) vs edit (`carIds[0]` only) — § Phase 6b
- [x] **Phase 8:** Field order (Body before Variant), EngineCode / GearBoxCode UI, hide empty, key-only payload — § Phase 8
- [x] **Phase 9:** Lazy edit prefill — no page-load `POST /Cars`; Edit-only; shared URL = progressive POST, step-by-step = 1× POST — § Phase 9
- [x] **Phase 9c:** Edit prefill cache — repeat Edit on same `carId` skips GET/POST — § Phase 9c
- [ ] Remove commented `NewMmeSearch` on homepage when product confirms

---

## Phase 6 — Logged-in user: Garage APIs (same UX as guest, no session)

**Date documented:** 2026-06-02 (dev verification against `api-dev.ottogusto.com`).

### Product rule

Logged-in users get the **same new MME behaviour as guests** (hero slider, Find car parts, edit, delete, URL `carIds`, SRP/catalog banner, right sidebar). The **only** difference is storage:

|                      | **Guest (logged out)**                 | **Logged in**                                                                                   |
| -------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Car history**      | `sessionStorage` key `searched_car_id` | **`GET/POST/DELETE /api/Garage`**                                                               |
| **Primary car key**  | Cars API `carId` (in session array)    | Garage row **`id`** (record) + **`carId`** (Cars API id, same role as session)                  |
| **Hero list source** | Session ids + `GET /Cars/{id}` labels  | `GET /Garage` list (filtered client-side)                                                       |
| **Add car**          | `pushSearchedCarIds` on Find car parts | `POST /Garage` `{ "carId": "<carsApiId>" }`                                                     |
| **Edit car**         | `replaceSearchedCarId` / hero Save     | `POST /Garage` `{ "id": "<garageRecordId>", "carId": "<carsApiId>" }`                           |
| **Delete**           | Remove from session                    | `DELETE /Garage/{id}`                                                                           |
| **Must not use**     | Garage writes                          | `sessionStorage` searched-car history (`shouldUseSessionCarHistory` → false when authenticated) |

Guest flows are **unchanged** — no Garage calls from new MME when logged out.

### API contract (new MME — minimal POST bodies)

| Action                         | Method                    | Body                                                   |
| ------------------------------ | ------------------------- | ------------------------------------------------------ |
| Add (Find car parts / new car) | `POST /api/Garage`        | `{ "carId": "<carsApiId>" }` only                      |
| Edit saved car                 | `POST /api/Garage`        | `{ "id": "<garageRecordId>", "carId": "<carsApiId>" }` |
| List saved cars                | `GET /api/Garage`         | —                                                      |
| One saved car (detail)         | `GET /api/Garage/{id}`    | —                                                      |
| Delete                         | `DELETE /api/Garage/{id}` | —                                                      |

Implementation: `postGarageNewMmeCar()` in `next/services/garageService.ts`, `usePersistNewMmeGarageCarMutation` in `next/hooks/garage.ts`.

**Do not** use `/api/my-cars` on new MME paths.

### Frontend implementation (done)

| Area                       | Files                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| POST add/edit              | `garageService.ts` (`postGarageNewMmeCar`), `hooks/garage.ts` (`usePersistNewMmeGarageCarMutation`)                                      |
| GET list for hero / banner | `useNewMmeGarageCarsQuery`, `useGetMySavedCarsQuery` / `SavedCarsProvider` (shared React Query key `queryKeys.garage.savedCars(userId)`) |
| Filter new MME rows        | `utils/garageCarId.ts` — only rows with both `id` and `carId`                                                                            |
| Hero slider                | `hooks/useHeroCarsPanel.ts`, `heroCard2.tsx`, `hero-card-mobile.tsx`                                                                     |
| Find car parts / Save      | `hooks/useNewMmeCarFilters.ts`                                                                                                           |
| Banner edit record id      | `SearchResultsCarSelectionBanner.tsx`                                                                                                    |
| Delete                     | `useDeleteCarFromEB` + `DELETE /Garage/{id}` on hero                                                                                     |
| Types                      | `GarageItem.carId`, `PostGaragePayload.carId` in `type.d.ts`                                                                             |

After successful POST, cache invalidation: `queryKeys.garage.savedCars(userId)` with `refetchType: "all"`.

### Known backend blocker (2026-06-02) — hero empty until fixed

**Symptom:** POST save works; hero car slider stays on “Select your car” after add.

**Cause:** `GET /api/Garage` list response does **not** include `carId` (and other display fields). The client does **not** strip fields — the list payload from the API is already sparse.

**Observed on dev:**

`POST /api/Garage` — payload:

```json
{ "carId": "mod8pdkumnduio" }
```

`POST` response (full — OK):

```json
{
  "brandName": "ALFA ROMEO",
  "modelName": "GT (937) 3D (04-10)",
  "engineName": "1747cc 106kW 144Hp - Petrol",
  "body": "Coupé-3 Doors",
  "variant": "Other",
  "gearBox": "5-Speed-Manual",
  "id": "mpzo92r0het71u",
  "carId": "mod8pdkumnduio",
  "isFavorite": false,
  "isNew": false
}
```

`GET /api/Garage` — response (list — **missing `carId`**):

```json
[
  {
    "id": "mpzo92r0het71u",
    "isFavorite": false,
    "isNew": false
  }
]
```

**Client behaviour:** `filterNewMmeGarageCars()` requires non-empty `id` **and** `carId`. Rows from GET without `carId` are excluded → `heroCars.length === 0`.

**Backend ask:** Return `carId` (and ideally `brandName` / `modelName` or equivalent) on **every** item in `GET /api/Garage`, matching POST/detail shape. Alternative: document that list is summary-only and clients must call `GET /api/Garage/{id}` per row (not implemented yet).

**Optional follow-up on frontend (after backend fix or if list stays summary):** merge POST response into React Query cache on `onSuccess`; or hydrate list via `GET /Garage/{id}` per `id`.

### Tomorrow — retest checklist (after backend fix)

1. Logged in, load homepage → **one** `GET /Garage`; each item in JSON includes **`carId`**.
2. Right sidebar → add car → **Find car parts** → `POST /Garage` with `{ carId }` only.
3. Return to `/en-BE` → hero shows **HeroCarDataCard** slider (not empty Select car).
4. Edit car → `POST /Garage` with `{ id, carId }`.
5. Delete → `DELETE /Garage/{id}`; slider updates.
6. **Guest regression:** no `GET/POST /Garage` from new MME; session + slider unchanged.
7. Network: no duplicate `POST /Garage` on single CTA click; list refetch after save shows full rows.

### Phase 6 implementation index

| Step                 | File(s)                                                       |
| -------------------- | ------------------------------------------------------------- |
| Garage POST payloads | `services/garageService.ts`                                   |
| React Query hooks    | `hooks/garage.ts`                                             |
| Hero + session split | `hooks/useHeroCarsPanel.ts`, `utils/searchedCarIdsSession.ts` |
| Apply / Save         | `hooks/useNewMmeCarFilters.ts`                                |
| Helpers              | `utils/garageCarId.ts`, `utils/garageCarId.test.ts`           |

---

## Phase 6b — Multiple `carIds` from Cars API (add vs edit)

**Problem:** `POST /api/Cars` can return **multiple** `carIds` (e.g. `id1,id2,id3`). On **add**, URL and storage must include **all** ids. On **edit**, only **`carIds[0]`** replaces the car being edited — but logged-in **Garage** was only saving `carIds[0]` while URL still had the full array → dropdown showed cars that were never saved.

**Rule (guest and logged-in — same UX, different storage):**

| Flow                                                              | Detect edit                                                                         | Persist                                                                                                                                                                                   | URL `carIds`                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Add** (new car, Find car parts, hero Save without edit context) | No `listingPrefillCarsApiId` / `editingCarsApiId` / guest `editing_searched_car_id` | Guest: `pushSearchedCarIds(full array)`. Logged-in: `POST /Garage` `{ carId }` **in parallel** for each new id, then **one** `GET /Garage` via single `invalidateQueries` (not per POST). | **`[carIds[0]]` only** — see Phase 6c |
| **Edit** (hero Save, banner Edit → Find car parts)                | `getEditOldCarsApiId()` or hero `oldCarsApiId` set                                  | Guest: `replaceSearchedCarId(old, carIds[0])`. Logged-in: **one** `POST /Garage` `{ id: garageRecordId, carId: carIds[0] }`.                                                              | **`[carIds[0]]` only**                |

**Surfaces:** `RightSidebarCarSelection` / `rightsidebar.tsx` (desktop + mobile drawer) via `useNewMmeCarFilters` — `handleFindCarParts` and `handleSave`.

**SRP / catalog banner dropdown:** `SearchResultsCarSelectionBanner` (also L1–L3 + car-parts via `CategoryCarSelectionBanner`) — guest dropdown ids = URL + session; logged-in = URL + `GET /Garage` (`useNewMmeGarageCarsQuery`), labels from Garage row or `GET /Cars/{id}` fallback.

**Implementation:** `next/utils/newMmeCarApply.ts` — `urlCarIdsForApply`, `persistSessionCarsForApply`, `persistGarageCarsForApply`.

### Testing checklist (Phase 6b)

1. **Add** — Cars API returns 3 ids → guest session has 3; logged-in 3× `POST /Garage` (if not cached); navigate `?carIds=a,b,c`.
2. **Edit** — change filters → 3 ids in response → session/Garage updates **one** row to `carIds[0]`; URL `?carIds=a` only.
3. Hero / SRP banner / catalog sidebar — same rules.
4. Guest regression unchanged when single id.

---

## Phase 6c — Single URL `carId` on add + L1/L2/L3 persistence + logged-in labels

**Problems (reported):**

1. After **add**, Cars API may return multiple `carIds` and we correctly persist **all** of them (session or Garage), but navigation sets **all** ids in the URL (`?carIds=a,b`). The banner dropdown always has **one** selected car — URL must match that: **`carIds[0]` only**.
2. **L1 / L2 / L3** category pages: adding a car from the sidebar did not always persist **all** returned `carIds` (guest early-return when `carIds[0]` was already in session skipped pushing siblings). Apply destination also sent users to catalog hub instead of **staying on the current category path** (SRP already stays on SRP).
3. **Logged-in** hero cards and banner dropdown sometimes showed raw **Cars API id** instead of make/model — Garage list rows can be sparse (`carId` only). Display must match guest: **`GET /Cars/{id}`** via `useSearchedCarLabels`, with Garage `brandName`/`modelName` when present.

**Rule (guest and logged-in — same UX, different storage):**

| Flow     | Persist (session / Garage)                                 | URL `carIds` after apply                            |
| -------- | ---------------------------------------------------------- | --------------------------------------------------- |
| **Add**  | **All** trimmed ids from Cars API (`carIdsForPersistence`) | **`[carIds[0]]` only** — matches dropdown selection |
| **Edit** | Replace one row with `carIds[0]`                           | **`[carIds[0]]` only**                              |

**Apply destination (`useNewMmeCarFilters.carApplyDestination`):**

| Page                       | Navigate to                                                     |
| -------------------------- | --------------------------------------------------------------- |
| SRP (listing)              | Current listing base (unchanged)                                |
| L1 / L2 / L3               | **Current pathname** (stay on category page, append `?carIds=`) |
| Catalog hub / home / other | `Routes.parts(locale)`                                          |

**Early-return fix:** If `carIds[0]` is already in session on **add**, still run `persistSessionCarsForApply` for the **full** array before navigating (so sibling ids from the same Cars API response are not dropped).

**Logged-in labels:**

| Surface                                             | Source                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Banner dropdown (`SearchResultsCarSelectionBanner`) | `useSearchedCarLabels` for all dropdown ids; prefer Garage label only when row has `brandName` or `modelName` |
| Hero panel (`useHeroCarsPanel`)                     | Same: Cars API labels when Garage row lacks make/model                                                        |

**Implementation:**

| Step | File(s)                                          | Change                                                                                |
| ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 1    | `utils/newMmeCarApply.ts`                        | Split `carIdsForPersistence` (all on add) vs `urlCarIdsForApply` (always `[primary]`) |
| 2    | `hooks/useNewMmeCarFilters.ts`                   | Use split helpers; fix add early-return; `carApplyDestination` for L1/L2/L3           |
| 3    | `components/SearchResultsCarSelectionBanner.tsx` | Logged-in labels via Cars API + meaningful Garage fallback                            |
| 4    | `hooks/useHeroCarsPanel.ts`                      | Logged-in hero cards: Cars API labels when Garage sparse                              |
| 5    | `utils/newMmeCarApply.test.ts`                   | Update tests for single-URL-on-add                                                    |

### Testing checklist (Phase 6c)

1. **Add** (guest) — Cars API returns 2+ ids → session has all; URL `?carIds=<first>` only (car-parts, SRP, L3 fluids).
2. **Add** (logged-in) — parallel `POST /Garage` for each new id; one `GET /Garage`; URL single id.
3. **L3** — add car from drawer without prior car → stay on L3 path with `?carIds=<first>`; dropdown lists all saved cars.
4. **SRP** — add car → stay on SRP with single `carIds` in URL.
5. **Edit** — still replace + single URL id (Phase 6b regression).
6. **Logged-in** hero + banner — make/model text, not raw `mod…` id when Garage list is sparse.
7. Guest flows unchanged when Cars API returns a single id.

---

## Phase 6d — Banner dropdown: stable list order on selection

**Problem:** In `SearchResultsCarSelectionBanner` / `SearchResultsSearchedCarsDropdown`, choosing a different car in the “Most Recent” list moved that row to the **top**. Example: cars `1, 2, 3` — selecting `3` reordered the menu to `3, 1, 2`.

**Requirement:** Dropdown list order is **stable**. Selection only updates:

- the **URL** `carIds` (single selected id),
- the **checkmark** on the chosen row,

and does **not** reorder existing entries. After selecting `3`, the list stays `1, 2, 3` with ✓ on `3`.

**Root cause:**

1. `dropdownIds` merged `[...urlCarIds, ...sessionIds]` (guest) or `[...urlCarIds, ...garageCarIds]` (logged-in) — URL-selected id was always first.
2. Guest `useEffect` called `pushSearchedCarIds(urlCarIds)` on every URL change; `pushSearchedCarIds` **prepends** ids, so dropdown selection also reshuffled session “most recent” order.

**Rule:**

| Action                                  | Session / Garage order                                               | URL            |
| --------------------------------------- | -------------------------------------------------------------------- | -------------- |
| **Add new car** (Find car parts)        | `pushSearchedCarIds` / `POST /Garage` — new ids at front (unchanged) | `[carIds[0]]`  |
| **Dropdown select** existing car        | **No reorder** — list keeps storage order                            | `[selectedId]` |
| **Land with `?carIds=`** not in session | Append missing id(s) at end (`ensureSearchedCarIds`) — no prepend    | unchanged      |

**Canonical dropdown order:**

- **Guest:** `sessionIds` order (then any URL-only ids appended).
- **Logged-in:** `GET /Garage` list order (then any URL-only ids appended).

### Implementation plan (Phase 6d)

| Step | File(s)                                          | Change                                                                                                                           |
| ---- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `utils/searchedCarIdsSession.ts`                 | Add `ensureSearchedCarIds(ids)` — append missing ids without reordering existing entries                                         |
| 2    | `components/SearchResultsCarSelectionBanner.tsx` | Build `dropdownIds` from session/garage order first; replace `pushSearchedCarIds` in URL-sync effect with `ensureSearchedCarIds` |
| 3    | `utils/searchedCarIdsSession.test.ts`            | Unit test: ensure does not reorder; push still prepends                                                                          |

### Testing checklist (Phase 6d)

1. Guest — add 3 cars → list `A, B, C`; select `C` → list still `A, B, C`, ✓ on `C`, URL `?carIds=C`.
2. Guest — select `A` again → order unchanged, ✓ on `A`.
3. Logged-in — same with Garage-backed dropdown.
4. Add new car — new id still appears at top of “Most Recent” (push semantics unchanged).
5. SRP / car-parts / L1–L3 banners — same behavior via `CategoryCarSelectionBanner`.

---

## Phase 6e — Guest: clear stale `searched_car_editing_id` on add entry

**Problem (guest only):** After banner **Edit car** → `setEditingSearchedCarId` writes `searched_car_editing_id` to session. If the user **closes** the sidebar/drawer without saving, that key remains. A subsequent **add** flow then behaves like **edit** (`getEditOldCarsApiId()` reads session → replace semantics, wrong header/CTA context).

Logged-in users use Zustand `editingCarsApiId` / `listingPrefillCarsApiId` (cleared on `hideRightSidebar` and add intents) — **no change**.

**Requirement:** Entering any **add** flow must clear `searched_car_editing_id` for guest users so apply is always **push / add**, not replace / edit.

**Add entry points (must clear session editing id):**

| Entry                                            | Trigger                                                     |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Homepage hero — **Other car**                    | `showRightSidebarPanel()` (`heroCard2`, `hero-card-mobile`) |
| Homepage hero — **first car** (empty state)      | `HeroNewCarSelectionCard` → `showRightSidebarPanel()`       |
| Banner — **Add new car**                         | `showRightSidebarForNewCar()`                               |
| Banner — **Select car** (gray state, no vehicle) | `showRightSidebarPanel()`                                   |

**Defence in depth:** `useNewMmeCarFilters.getEditOldCarsApiId()` must return `null` when `forceEmptySidebar` is true (banner “Add new car”), so stale session id cannot force edit mode even if clearing were missed.

**Do not clear** on `showRightSidebarForListingEdit` / `showRightSidebarForHeroEdit` — those intentionally set edit context.

### Implementation plan (Phase 6e)

| Step | File(s)                               | Change                                                                                                              |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1    | `utils/searchedCarIdsSession.ts`      | `clearGuestEditingSearchedCarIdOnAddEntry(isAuthenticated)` — guest-only wrapper around `clearEditingSearchedCarId` |
| 2    | `stores/useRightSidebar.ts`           | Call wrapper in `showRightSidebarPanel` and `showRightSidebarForNewCar` before opening sidebar                      |
| 3    | `hooks/useNewMmeCarFilters.ts`        | `getEditOldCarsApiId`: return `null` when `forceEmptySidebar`                                                       |
| 4    | `utils/searchedCarIdsSession.test.ts` | Unit test guest vs logged-in clear behaviour                                                                        |

### Testing checklist (Phase 6e)

1. Guest — save cars → select one in banner → **Edit** → close sidebar without saving → **Add new car** → empty add form, **Find car parts** pushes new car (not replace).
2. Guest — same path via hero **Other car** after abandoned edit → add behaviour.
3. Guest — `HeroNewCarSelectionCard` (no cars yet) after abandoned edit → add behaviour.
4. Guest — **Edit** → close → **Edit** again → still prefills and replaces on apply (edit sets id again on open).
5. Logged-in — same flows unchanged (Garage edit/add).

---

## Phase 6f — Sidebar Reset: form only (no URL / page side effects)

**Problem:** **Reset** in `RightSidebarCarSelection` (desktop sidebar + mobile drawer) cleared URL `carIds` on listing pages (`updateFilters({ carIds: null })`) and wiped guest edit context (`clearEditingSearchedCarId`, Zustand edit fields). Example: banner **Edit car** → **Reset** → page lost active vehicle filter while the user had not clicked **Find car parts** or **Save**.

**Requirement:** **Reset** affects **only** the sidebar/drawer MME form instance — empty dropdowns, reload initial makes (`POST /api/Cars` empty payload). It must **not** change until apply (Save / Find car parts):

- URL `carIds` (or any query params)
- Session `searched_car_id` / `searched_car_editing_id`
- Zustand sidebar intent (`listingPrefillCarsApiId`, `editingCarsApiId`, `forceEmptySidebar`, etc.)
- Banner green/gray state or product listing filters

**Surfaces:** Same rule for every entry point — hero Other car, banner Edit / Add new car, SRP, car-parts, L1–L3 (`useNewMmeCarFilters` + `rightsidebar.tsx`).

**Technical:** After Reset, skip sidebar prefill (`skipSidebarPrefill`) so edit/URL context does not immediately repopulate the form. In **edit** flow, prefill is also locked after first open — see [Phase 6g](#phase-6g--edit-sidebar-prefill-once-per-open-no-re-prefill-after-reset--field-change).

**Supersedes:** Phase 3d “Reset clears URL `carIds` on listing” — URL changes only on **Find car parts** / **Save** / banner dropdown select.

### Implementation plan (Phase 6f)

| Step | File(s)                           | Change                                                                                                                                                  |
| ---- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `hooks/useNewMmeCarFilters.ts`    | Remove `updateFilters`, `clearEditingSearchedCarId`, and Zustand edit clear from `handleReset`; add `skipSidebarPrefill` to keep form empty after reset |
| 2    | `hooks/useNewMmeCarFilters.ts`    | Clear `skipSidebarPrefill` when sidebar closes (`!isActive`), on `handleSelect`, and on successful apply                                                |
| 3    | `docs/sprint35-new-car-search.md` | Update § Reset / Phase 3d notes                                                                                                                         |

### Testing checklist (Phase 6f)

1. SRP with `?carIds=X` → banner **Edit** → **Reset** → URL still `X`, banner still green, form empty (makes only).
2. Same → pick make/model → **Find car parts** → URL updates (edit replace or new apply).
3. Guest edit → **Reset** → `searched_car_editing_id` still set → apply still replaces correct car.
4. **Add new car** (`forceEmptySidebar`) → **Reset** → still empty add form; URL unchanged.
5. **Reset** → close sidebar → reopen **Edit** → car prefills again.
6. Logged-in edit → **Reset** → Garage/URL unchanged.

---

## Phase 6g — Edit sidebar: prefill once per open (no re-prefill after Reset / field change)

**Problem:** In **edit** flow (banner **Edit car** or hero **Save**), after **Reset** the user picked a new make (e.g. Fiat) but the form re-prefilled the original car (Alfa Romeo). Cause: `handleSelect` cleared `skipSidebarPrefill`, restoring `prefillCarIds` from edit context and re-running `GET /Cars/{id}` bootstrap.

**Requirement (edit flow only):** MME form pre-populates **once** when the edit sidebar/drawer opens. After that — including after **Reset** or any dropdown change — **no** automatic re-prefill from the car being edited. User selections drive `POST /api/Cars` only. Add / Other-car / non-edit flows unchanged.

**Rule:**

| Flow                                                                | Auto-prefill from `GET /Cars/{id}`                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Edit** (banner `showRightSidebarForListingEdit`, hero `heroSave`) | **Once** per sidebar open; locked after first hydrate or **Reset** |
| Add / Other car / `forceEmptySidebar`                               | Unchanged (Phase 6f `skipSidebarPrefill` rules)                    |

### Implementation plan (Phase 6g)

| Step | File(s)                        | Change                                                                                  |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------- |
| 1    | `hooks/useNewMmeCarFilters.ts` | `isSidebarEditFlow` + `editSidebarPrefillLockedRef` — skip car-id bootstrap when locked |
| 2    | `hooks/useNewMmeCarFilters.ts` | Lock on first edit hydrate (incl. warm sidebar); lock on **Reset** in edit flow         |
| 3    | `hooks/useNewMmeCarFilters.ts` | Do **not** clear `skipSidebarPrefill` on `handleSelect` in edit flow                    |

### Testing checklist (Phase 6g)

1. SRP → **Edit** (Alfa) → form prefilled once.
2. **Reset** → select **Fiat** make → stays Fiat path; no Alfa re-prefill.
3. Complete **Find car parts** → URL/session update as edit replace.
4. Close → **Edit** again → Alfa prefills once again.
5. **Add new car** / hero **Other** — no regression.

---

## Phase 7 — CTA requires all visible fields + `carIds`

**Client requirement:** In the right sidebar / mobile drawer (`RightSidebarCarSelection` via `useNewMmeCarFilters`), **Find car parts** / **Save** must stay **disabled** if any **on-screen** dropdown has no selection — even when `POST /api/Cars` already returned `carIds`.

**Enable rule (`isNewMmeApplyCtaEnabled`):**

```text
enabled =
  isNewMmeSearchCtaEnabled(carIds)     // ≥1 non-empty id from last Cars API response
  && areAllVisibleMmeFieldsSelected(   // every row in getVisibleMmeFields(...)
       visibleFields, selected, options)
  && (existing gates: loading, hero prefill, findCarPartsDirty on listing, …)
```

**Visible fields** (`getVisibleMmeFields`) — same progressive logic as the UI (see [Phase 8](#phase-8--field-order-enginecode--gearboxcode--key-only-payload)):

| Always      | After make + model (in order, only if API dictionary has ≥1 entry) |
| ----------- | ------------------------------------------------------------------ |
| make, model | body → variant → engine → engineCode → gearBox → gearBoxCode       |

A field is **hidden** when its dictionary is empty — never render an empty dropdown.

**Surfaces:** Primary — `hooks/useNewMmeCarFilters.ts` (desktop sidebar + mobile drawer). Helpers in `lib/newMmeFilters.ts`.

**Unchanged:** Listing `findCarPartsDirty` when URL already has `carIds`; hero Save skips dirty but still requires full visible fields + `carIds`.

### Implementation plan (Phase 7)

| Step | File(s)                           | Change                                                                             |
| ---- | --------------------------------- | ---------------------------------------------------------------------------------- |
| 1    | `lib/newMmeFilters.ts`            | `getVisibleMmeFields`, `areAllVisibleMmeFieldsSelected`, `isNewMmeApplyCtaEnabled` |
| 2    | `hooks/useNewMmeCarFilters.ts`    | `canApplyCarSearch` → `isNewMmeApplyCtaEnabled`; reuse `getVisibleMmeFields`       |
| 3    | `utils/newMmeSearchCta.test.ts`   | Unit tests for new helpers                                                         |
| 4    | `docs/sprint35-new-car-search.md` | This section + § `carIds` table                                                    |

### Testing checklist (Phase 7)

1. Make + model only visible; API returns `carIds` but variant row appears empty → CTA **disabled**.
2. All visible rows filled + `carIds` → CTA **enabled** (if dirty/loading rules pass).
3. **Edit** prefill: all fields filled + `carIds` → disabled until user changes a field (listing dirty rule).
4. **Reset** → empty form → disabled until full selection path completes.
5. Hero **Save** → disabled until all visible fields + `carIds` (no partial apply).

---

## Phase 8 — Field order, EngineCode / GearBoxCode, key-only payload

**Status:** Implemented (this section is the canonical plan).

### Product rules

| #   | Rule                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Field order:** Make → Model → Body → Variant → Engine → EngineCode → GearBox → GearBoxCode                                                                                        |
| 2   | **Hide empty fields:** Do not render a dropdown when `POST /api/Cars` returns no entries for that dictionary (e.g. no `engineCodes` for the current selection).                     |
| 3   | **Auto-select singletons:** When a visible field has exactly one option, auto-select its **key**; counts as completed for CTA.                                                      |
| 4   | **Mandatory visible fields:** User must complete every visible field with **>1** option; CTA also requires ≥1 `carIds` from the last Cars API response (`isNewMmeApplyCtaEnabled`). |
| 5   | **Payload = keys only:** Every `POST /api/Cars` body must send dictionary **keys** (IDs), never display labels — including SRP warm-up prefill from `GET /Cars/{id}`.               |

### API contract

**Filter:** `POST /api/Cars`

```json
{
  "make": null,
  "model": null,
  "body": null,
  "engine": null,
  "engineCode": null,
  "variant": null,
  "gearBox": null,
  "gearBoxCode": null
}
```

All non-null values must be option **keys** from the corresponding dictionary in the previous response.

**Response dictionaries:** `makes`, `models`, `bodys`, `variants`, `engines`, `engineCodes`, `gearBoxes`, `gearBoxCodes`, plus echo fields and `carIds`.

### Implementation (single source of truth)

| Step | File(s)                                                                    | Change                                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `lib/newMmeFilters.ts`                                                     | `FIELD_ORDER` reorder; `VisibleField` = all 8 fields; `FIELD_CONFIG` for `engineCode` / `gearBoxCode`; strict `getVisibleMmeFields`; `coerceSelectedToKeys` + `buildPayload` guard |
| 2    | `lib/newMmeFilters.ts`                                                     | `AUTO_PREFILL_FIELDS`: all post–make/model fields; `reconcileSelected` uses full `FIELD_ORDER` (incl. codes)                                                                       |
| 3    | `lib/newMmeFilters.ts`                                                     | `isMmeFieldEnabled(field, visibleFields, selected)` for progressive disable                                                                                                        |
| 4    | `hooks/useNewMmeCarFilters.ts`                                             | `runFilters` loop max = `FIELD_ORDER.length`; extend `searchText` / reset for new fields                                                                                           |
| 5    | `components/RightSidebarCarSelection.tsx`                                  | Render all `visibleFields`; use `isMmeFieldEnabled` for disabled state (desktop + mobile drawer share this component)                                                              |
| 6    | `components/SearchResultsNewMmeSidebar.tsx`, `components/NewMmeSearch.tsx` | Parity with shared helpers (flag-off / QA widget)                                                                                                                                  |
| 7    | `utils/newMmeSearchCta.test.ts`, `utils/newMmeFilters.coerce.test.ts`      | Unit tests for order, hide, key coercion                                                                                                                                           |

### Key-only payload (prefill bug fix)

`GET /Cars/{id}` may return display labels. Before every `POST /api/Cars`:

1. `coerceSelectedToKeys(selected, options)` maps each value to `option.key` (match key first, then label).
2. `buildPayload` always runs coercion so warm listing bootstrap never sends labels.

### Testing checklist (Phase 8)

1. SRP with `?carIds=` — network tab: warm `POST /Cars` uses keys only, not make/model display strings.
2. Make + model → body appears before variant when API returns both.
3. `engineCode` / `gearBoxCode` render when API returns dictionaries; hidden when empty.
4. Single-option field auto-fills; CTA enables when all visible fields + `carIds` satisfied.
5. Multi-option field left empty → CTA disabled even if `carIds` present.
6. **Edit** / **Reset** / **Add new car** — Phases 6f–6g unchanged.
7. Mobile drawer (same `RightSidebarCarSelection`) — same behaviour as desktop sidebar.

---

## Phase 9 — Lazy edit prefill (canonical)

**Status:** Implemented.

### Product rules

| #   | Rule                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No sidebar `POST /Cars` on page load** — banner `GET /Cars/{id}` + products API only.                                           |
| 2   | **Edit click only** — `showRightSidebarForListingEdit` / `showRightSidebarForHeroEdit` sets prefill id; not passive URL `carIds`. |
| 3   | **Shared URL / incognito** — `GET` then **progressive** `POST /Cars` with `preserveCandidates` (GET returns labels).              |
| 4   | **Step-by-step user** — `GET` then **1× `POST /Cars`** when make+model are filter keys; bounded fallback if incomplete.           |
| 5   | **Landing Find car parts** — empty makes bootstrap; reset form on sidebar close; clear edit session on car delete.                |
| 6   | **Logged-in Garage** — unchanged (banner Edit + `myCarRecordId`, apply via `persistGarageCarsForApply`).                          |

### API flow (Edit car)

```text
Edit car → sidebar opens → GET /Cars/{id} (banner cache)
  → if GET has key hashes: 1× POST /Cars
  → if GET has labels (shared link): N× POST /Cars (runFilters + preserveCandidates)
```

### Files

| File                           | Change                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `useNewMmeCarFilters.ts`       | No `keepWarmOnListing`; edit-only `prefillCarIds`; dual bootstrap                        |
| `newMmeFilters.ts`             | `buildBootstrapPrefillPayload`, `isMmeBootstrapPrefillComplete`, `looksLikeMmeFilterKey` |
| `RightSidebarCarSelection.tsx` | `enabled: isOpen` only                                                                   |
| `searchedCarIdsSession.ts`     | Clear editing id when car removed from session                                           |

### Phase 9c — Edit prefill cache (repeat Edit, same `carId`)

**Goal:** After a successful Edit prefill, cache hydrated `selected` + `options` + `carIds` per Cars API id. Re-opening Edit for the **same** id without changes skips GET/POST.

| Event                              | Cache                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| First Edit prefill completes       | `setEditPrefillCache(carId, snapshot)`                |
| Close sidebar, Edit same car again | Restore from cache — **no network**                   |
| Edit different car                 | Miss → fetch → cache new id                           |
| Reset / dropdown change / Apply    | `invalidateEditPrefillCache(carId)`                   |
| Guest deletes car from hero        | `invalidateEditPrefillCache` in `removeSearchedCarId` |

**File:** `utils/newMmeEditPrefillCache.ts`, wired in `useNewMmeCarFilters.ts` only (not used for Select car / landing empty bootstrap).

### Testing checklist (Phase 9c)

1. Edit car → close → Edit same car → **0** sidebar GET/POST; form instant.
2. Edit car A → Edit car B → network runs; B cached.
3. Edit B again → no network.
4. Edit → change dropdown → close → Edit → network runs (cache invalidated).
5. Edit → Reset → Edit → network runs.
6. Guest: delete car from hero → Edit (add flow) → empty form, no stale cache.
