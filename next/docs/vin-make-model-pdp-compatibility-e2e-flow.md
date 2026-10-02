# EXISTING FUNCIONALITY AND FLOW OF UI AND LOGIC IN SHORT.

Reference for the **current** new car search (`carIds` / `new_mme_feature_flag`) and **PDP + checkout VIN** behaviour, before upcoming PDP make/model + VIN compatibility changes.

Related: `[sprint35-new-car-search.md](./sprint35-new-car-search.md)`, `[sprint36-vin-checkout.md](./sprint36-vin-checkout.md)`.

---

## 1. Search by car — homepage entry

**Feature gate:** `new_mme_feature_flag`. When off, legacy MME / `makeModelTypeId` paths remain.

| Entry          | UI                                            | Action                                                                                                                                              |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| No saved cars  | `HeroNewCarSelectionCard` (“SELECT YOUR CAR”) | Opens **right sidebar** (`showRightSidebarPanel`) — add/select flow                                                                                 |
| Has saved cars | `HeroCarDataCard` slider                      | Select car → **Find car parts** → catalog with `?carIds=`; **Other car** → empty sidebar; **Edit** → sidebar Save; **Delete** → remove from storage |
| Anywhere       | Header / car icon → right sidebar             | Same MME form (`RightSidebarCarSelection`)                                                                                                          |

**Hero data source** (`useHeroCarsPanel`):

- **Guest:** `sessionStorage` key `searched_car_id` (newest first, max 10) + labels via `GET /Cars/{id}`
- **Logged-in:** `GET /Garage` rows with `id` + `carId` (no session history)

---

## 2. Fields populating by APIs

**API:** `POST /api/Cars` (progressive filters). Prefill/edit also uses `GET /Cars/{id}`.

**VIN hydrate optimization (no product-rule change):** When the sidebar hydrate is VIN-driven (`vinPrefill` after `GET /Vin`, or URL `?vin=` warm-up with matching VIN field), the **first** `POST /Cars` may send `{ vin, make: null, … }` instead of `GET /Cars/{id}` + POST. Backend: VIN overrules other body fields — **never** send `vin` again after the user changes Make/Model/…. `GET /Vin/{vin}` stays required for Case 1/2/406. On `POST /Cars {vin}` failure, fall back to the legacy GET→POST path. Make+Model-only depth rules (§3.3) still apply (strip + follow-up POST **without** `vin`).

**Field order:** Make → Model → Body → Variant → Engine → EngineCode → GearBox → GearBoxCode.

| Rule             | Behaviour                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Progressive show | Make + Model always; later fields only if API returned options                                          |
| Hide empty       | No dropdown when dictionary is empty                                                                    |
| Auto-select      | Single-option fields (after make/model) auto-fill                                                       |
| Payload          | Dictionary **keys only** (never display labels)                                                         |
| Edit prefill     | On **Edit** open only (not on page load): GET → POST; repeat Edit on same id can hit edit-prefill cache |

Shared logic: `lib/newMmeFilters.ts` + `hooks/useNewMmeCarFilters.ts`.

---

## 3. Right sidebar CTA activation (Find car parts / Save)

CTA enabled only when **all** of:

1. Last Cars response has **≥1** `carIds`
2. **Every visible** dropdown has a valid selection (`isNewMmeApplyCtaEnabled`)
3. Not loading / not mid edit-prefill / not saving

**Extra for Find car parts (not Save):** if URL already has `carIds` and user has not changed any field → still **disabled** (`findCarPartsDirty`).

| Intent                      | Footer CTA         | Typical entry                              |
| --------------------------- | ------------------ | ------------------------------------------ |
| Add / select / listing edit | **Find car parts** | Hero Other car, banner Select/Edit/Add new |
| Hero edit                   | **Save**           | Hero slider Edit                           |

**Reset:** clears **form only** + reloads initial makes. Does **not** clear URL `carIds`, session, Garage, or banner state until user applies.

---

## 4. Apply destination — car-parts hub + `carIds` URL

After successful apply:

| User is on…      | Navigate to                                               |
| ---------------- | --------------------------------------------------------- |
| Search results   | Stay on listing; update `?carIds=`                        |
| L1 / L2 / L3 SEO | Stay on current path; update `?carIds=`                   |
| Home / other     | **Category catalog** e.g. `/{locale}/car-parts/?carIds=…` |

**URL rule (add and edit):** query always gets `**carIds[0]` only** (matches single selected car in banner).

**Persist rule:**

| Flow     | Guest session                      | Logged-in Garage                              | URL           |
| -------- | ---------------------------------- | --------------------------------------------- | ------------- |
| **Add**  | Push **all** resolved Cars API ids | `POST /Garage` `{ carId }` per new id         | `[carIds[0]]` |
| **Edit** | Replace old id with `carIds[0]`    | One `POST /Garage` `{ id, carId: carIds[0] }` | `[carIds[0]]` |

Example after home apply: `/en-BE/car-parts?carIds=mndb693fccd5mo`

---

## 5. Car selection banner (car-parts, L1–L3, search-results)

**Component:** `SearchResultsCarSelectionBanner` (catalog/SEO via `CategoryCarSelectionBanner` / slot).

### Active car shown (green vs gray)

| State              | Condition        | UI                                                                                    |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------- |
| **Green (active)** | URL has `carIds` | “Showing products compatible with” + dropdown (✓ on `carIds[0]`) + **Edit car**       |
| **Gray**           | No URL `carIds`  | “Identify your vehicle…” + Select car **or** dropdown with no selection + Add new car |

Active vehicle for listing/filters = **URL `carIds`**, not session/Garage alone.

### Saved cars in dropdown

| User      | Dropdown list order                                 | Labels                                                |
| --------- | --------------------------------------------------- | ----------------------------------------------------- |
| Guest     | `searched_car_id` session (+ URL-only ids appended) | `GET /Cars/{id}`                                      |
| Logged-in | Garage list order (+ URL-only ids)                  | Garage make/model when present, else `GET /Cars/{id}` |

Selecting a dropdown car → updates URL to that single id (**does not reorder** the list). Deselect clears URL/hero selection; guest history is kept.

---

## 6. `carIds` carry-forward to search-results (and beyond)

```text
Home (select car)
  → /car-parts?carIds=X
  → L1 / L2 / L3 (same carIds on path)
  → /search-results?carIds=X&categoryId=…&take=12&order=priority
```

| Navigation                                  | How `carIds` is kept                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Catalog / SEO browse → SRP                  | `appendCategorySearchQuery` with URL `carIds`                                               |
| Home browse-by-category + hero car selected | Shortcut → SRP with `carIds` + `categoryId`                                                 |
| Breadcrumbs (SRP / PDP / L1–L3)             | `appendVehicleContextToHref`                                                                |
| Header / footer / nav parts links           | `useNavigationCarIds` (URL else hero selection)                                             |
| Product cards → PDP                         | Callers can append `?carIds=` via `buildPartPdpHref` (SRP, L3 top parts, etc.) when flag on |

Products listing honors URL `carIds` when new MME flag is on.

---

## 7. Edit + remove saved cars

### Edit (banner / hero)

1. Banner **Edit car** → `showRightSidebarForListingEdit` (prefill from URL car; guest sets `editing_searched_car_id`)
2. Hero **Edit** → `showRightSidebarForHeroEdit` → **Save** CTA
3. Prefill once per open (GET + POST); Reset does not re-prefill until reopen
4. Apply → **replace** that car (`carIds[0]` only in URL/storage)

**Add new car** clears guest editing id so apply is push, not replace. Opens an **empty** sidebar (no URL `carIds` / `vin` hydrate) — same idea as homepage **Other car**.

**Edit + change VIN (sidebar live / Find):** Keep listing/hero edit context while VIN overrides Make/Model. Apply / VIN navigate must **replace** the car being edited (not push a second saved car). Do **not** call `showRightSidebarForVinPrefill` during an open edit — that clears edit ids and guest `editing_searched_car_id`.

**Banner / catalog sidebar open rules:**

| Entry                       | VIN from URL | Make/Model from URL / saved car |
| --------------------------- | ------------ | ------------------------------- |
| **Edit car**                | Yes          | Yes (edit prefill)              |
| **Add new car** / Other car | No (cleared) | No (`forceEmptySidebar`)        |

### Remove

| Surface                             | Action                | Effect                                                              |
| ----------------------------------- | --------------------- | ------------------------------------------------------------------- |
| Landing hero slider ⋮               | Delete                | Guest: `removeSearchedCarId`; logged-in: `DELETE /Garage/{id}`      |
| Right sidebar (edit) **Remove Car** | Confirm delete        | Same storage delete; strip `carIds` from URL if needed              |
| Banner dropdown                     | **Deselect Car** only | Clears active URL/hero car; **does not** delete from session/Garage |

There is **no** per-row delete inside the banner dropdown list itself.

---

## 8. VIN check — product details page (current placement)

### Where it is today

Mid-PDP, **below** product hero (gallery / price / ATC) and **above** Recently viewed:

```text
Productcardesc (hero)
  → matchingCarsSection
       → ProductMatchingCars / ProductMatchingCarsClient
            → Productcompatibilityverify
                 → Productcompatibilityverifyinput  ← “Guaranteed VIN Verification”
  → Recently viewed
```

VIN block **always renders** even when the compatible-cars list section is flag-gated off. (Upcoming flow will move this block elsewhere — this is the **current** mount point.)

### How PDP VIN works

1. User enters 17-char VIN (`A-HJ-NPR-Z0-9`, no I/O/Q) → **Verify**
2. API: `POST /Vin` with `{ vinNumber, partIds: [partId] }` (`usePdpVinCheck`)
3. Result for this part: **Yes** / **Maybe** / **No**

| Result              | UI (single part)                                                            |
| ------------------- | --------------------------------------------------------------------------- |
| **Fit (Yes)**       | Green success + tick; input locked; **Change VIN**                          |
| **May fit (Maybe)** | Info + email + “Request compatibility check” (support `GuaranteedVinCheck`) |
| **Not fit (No)**    | Red “not compatible” box; locked + Change VIN                               |
| API error / unknown | Treated as **Maybe** (still verified; no blocking)                          |

### localStorage cache (PDP + checkout shared)

- **Key:** `vin_compatibility_cache` (shape: one VIN → `{ [partId]: "Yes"|"No"|"Maybe" }`)
- **On Verify:** if `(vin, partId)` cached → **skip** `POST /Vin`
- **On mount:** if this part is cached → auto-show verified UI; else prefill VIN only
- **Write:** `set` on new VIN, `append` when same VIN gains more part ids
- Checkout uses the same cache with `POST /Order/VinCheck` for the whole cart (only fetches uncached part ids)

### Checkout VIN (related, not PDP)

`Vincompatibilitycheck` on checkout (below delivery, above Order and Pay): Verify → `POST /Order/VinCheck` for all cart lines → Fit / May fit / Not fit cases; Order and Pay **always** enabled. See sprint 36 doc.

---

## 9. End-to-end happy path (current)

```text
Homepage → Select / Find car parts (sidebar MME)
  → POST /Cars until carIds + all visible fields filled → CTA on
  → Persist cars (session or Garage) + navigate /car-parts?carIds=X
  → Green banner + dropdown of saved cars
  → Pick category → /search-results?carIds=X&categoryId=…
  → Product card → PDP (may include ?carIds=X)
  → PDP mid-page: Guaranteed VIN Verification (POST /Vin + localStorage cache)
  → Cart → Checkout: order-level VinCheck (shared cache)
```

---

## 10. Key files (quick index)

| Area               | Files                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Filters / CTA      | `lib/newMmeFilters.ts`, `hooks/useNewMmeCarFilters.ts`, `utils/newMmeCarApply.ts`          |
| Sidebar UI         | `components/RightSidebarCarSelection.tsx`, `screens/landing/rightsidebar.tsx`              |
| Hero               | `HeroNewCarSelectionCard.tsx`, `HeroCarDataCard.tsx`, `hooks/useHeroCarsPanel.ts`          |
| Banner             | `SearchResultsCarSelectionBanner.tsx`, `CategoryCarSelectionBanner*.tsx`                   |
| Session / Garage   | `utils/searchedCarIdsSession.ts`, `services/garageService.ts`, `utils/garageCarId.ts`      |
| URL helpers        | `utils/parseCarIdsParam.ts`, `utils/categorySearchUrl.ts`, `utils/build-part-pdp-url.ts`   |
| PDP VIN            | `productcompatibilityverify*.tsx`, `hooks/usePdpVinCheck.ts`, `PdpVinCheckResultBoxes.tsx` |
| VIN cache / shared | `utils/vinCompatibilityCache.ts`, `utils/vinCheck.ts`, `services/vin.ts`                   |
| Checkout VIN       | `checkout/Vincompatibilitycheck.tsx`, `hooks/useCheckoutVinCheck.tsx`                      |

---

# NEW FEATURE — END-TO-END VIN + MAKE/MODEL PDP COMPATIBILITY FLOW

**Status:** Implemented behind `end_to_end_vin_flow_feature_flag`. Homepage: `NewHeroCarDataCard` when saved cars exist (same Other car / Find car parts); empty → `NewHeroNewCarSelectionCard`. Open: revert QA, guest Maybe Support UI, final Figma/copy.

**Goal:** Dual entry (Search by VIN + Search by car), multi-`carIds` in URL (2–5) with **one saved car** (`carIds[0]`, make+model only), URL-carried `vin`, and auto VIN compatibility on PDP via a new search banner — all behind a feature flag so the **existing** flow stays intact and restorable.

---

## 0. Non-negotiable rules — **REVERTABILITY (CRITICAL)**

> **Whatever we implement for this feature must be fully hideable by flipping one flag.**  
> Setting `end_to_end_vin_flow_feature_flag = false` must restore the **exact current UI and behaviour** (Sprint 35/36). No permanent replacement of old components. No deleting old files. Every NEW surface is additive and gated.

| Rule                                      | Detail                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Do not delete** existing components     | Keep current landing search, right sidebar / mobile drawer, search banner, mid-PDP VIN verify block, etc. in the repo and in the tree.                                                                                    |
| **Flag name**                             | `end_to_end_vin_flow_feature_flag` (wire like other env flags in `feature-flag-env.ts` / `FeatureFlags` types + `NEXT_PUBLIC_*` JSON).                                                                                    |
| **Copy-first naming**                     | New UI = **copy** of the existing component with a **`New` prefix**, rest of the name the same (e.g. `NewSearchResultsCarSelectionBanner`, `NewRightSidebarCarSelection`, `NewHero…`). Do not rename or gut the original. |
| **Flag = true**                           | Show **only** the `New*` copies (with VIN field where specified). **Hide** (do not unmount permanently / do not delete) all corresponding **old** components.                                                             |
| **Flag = false**                          | Show **only** the **old** components again. All `New*` UI **hidden**. PDP uses the **existing mid-page VIN verify** as today — **no** VIN field / VIN verify on the search banner.                                        |
| **VIN → cars API**                        | **Ready for implement:** `GET /api/Vin/{vinNumber}` — see §4.3. Map `cars[].id` → `carIds[]` (same shape as search-by-vehicle).                                                                                           |
| **Car persistence — no change**           | **Logged-in:** cars saved in the **backend database** via Garage APIs. **Guest:** cars handled in the **browser** (`sessionStorage`). This split does **not** change for the E2E / VIN feature.                           |
| **Homepage — saved-car slider (flag on)** | See **§ Homepage hero** below — show `NewHeroCarDataCard` when user has saved cars (same edit/delete/Other car/Find car parts as old). Empty state → `NewHeroNewCarSelectionCard`.                                        |
| **Labels (`labels.ts`)**                  | See **§ Labels / i18n** below — reuse existing keys for unchanged UI; **add new keys only** for new VIN/E2E copy; **do not edit** existing label strings used by current UI.                                              |

### Reminder — where cars are stored (**unchanged**)

```text
Logged-in user  →  backend DB via Garage APIs  (GET / POST / DELETE /Garage)
Guest user      →  browser only                 (sessionStorage key searched_car_id)
```

There is **no change** to this requirement under `end_to_end_vin_flow_feature_flag`. New landing / sidebar / banner / VIN search still use the same guest-vs-logged-in storage. What _can_ change when the flag is on is only **which** id is written on a multi-`carIds` response (`carIds[0]` only — see §3.3), not _where_ it is stored.

### Homepage hero (**IMPORTANT**)

> When `end_to_end_vin_flow_feature_flag = true`, homepage search matches the **old** two-state pattern, using **`New*` copies** only:
>
> | Saved cars   | Mount                                                                                                                                                             |
> | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **Has cars** | `NewHeroCarDataCard` — same saved-car **slider** cards, **edit** / **delete** menu, **Other car** + **Find car parts** buttons and behaviour as `HeroCarDataCard` |
> | **No cars**  | `NewHeroNewCarSelectionCard` — VIN + car selection + Find your parts                                                                                              |

| Concern                               | Flag **true** (New)                                                                            | Flag **false** (Old — unchanged)                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Homepage search UI                    | Has cars → `NewHeroCarDataCard`; empty → `NewHeroNewCarSelectionCard`                          | Empty → `HeroNewCarSelectionCard`; has cars → `HeroCarDataCard` slider |
| **Other car**                         | Opens **New** right sidebar / drawer (`showRightSidebarPanel` → `NewRightSidebarCarSelection`) | Opens old sidebar                                                      |
| **Find car parts**                    | Navigate to `/car-parts?carIds=<selected>` (same as old when new MME on)                       | Same                                                                   |
| Edit / Delete                         | Same as old (hero edit → Save CTA; delete session/Garage)                                      | Same                                                                   |
| Save car (guest / logged-in)          | **Still save** as today (session / Garage)                                                     | Same                                                                   |
| Logged-in `GET /Garage` (and related) | **Still call** — drives New slider + banner                                                    | Same + old slider                                                      |

**Implementers:** do not change Other car / Find car parts / edit / delete handlers for the New slider — reuse the same callbacks as the old `HeroCarDataCard` mount. Only the component file is forked (`NewHeroCarDataCard`).

### Labels / i18n (`next/data/branding/labels.ts`)

| Rule                        | Detail                                                                                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unchanged UI copy**       | Reuse **existing** keys already used by search-by-vehicle, search banner, dropdowns, Find car parts, Edit car, VIN length/charset errors (`vin_length_error`, `vin_invalid_characters`, `VIN_information_message`, etc.). **Do not change** those key names or English values. |
| **New E2E / VIN-only copy** | For new surfaces (e.g. VIN search field **placeholder**, **heading**, Case 2 unable-to-select message), **add new keys** in `labels.ts` with sensible EN defaults.                                                                                                             |
| **Later ticket**            | Client may rename keys / update wording from a ticket — swap labels then; do not block implementation on final copy.                                                                                                                                                           |
| **Old components**          | When flag is false, old components keep calling the **same** existing `getLabel(...)` keys as today — zero label churn on the legacy path.                                                                                                                                     |

Examples of **new** keys (placeholders — eng may add similar as UI lands):

| Key (placeholder)                      | Purpose                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `vin_search_unable_select_vehicle`     | Sidebar Case 2 after failed `GET /Vin/{vin}` or empty `cars`                                   |
| _(VIN homepage heading / placeholder)_ | Add when building `New*` landing search box — choose clear key names; update from ticket later |

**PDP FIT/MAY_FIT/NO_FIT + MME + Add-VIN copy (added, `data/branding/labels.ts`):**

| Key                       | Default EN                                                                                   | Wired at                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `pdp_vin_fit_message`     | Product compatible with selected car.                                                        | VIN check FIT (banner headline)                                                     |
| `pdp_vin_may_fit_message` | Product compatible with selected car. We'll contact you before shipping if any issues arise. | VIN check MAY_FIT                                                                   |
| `pdp_vin_not_fit_message` | Product not compatible with selected car.                                                    | VIN check NO_FIT                                                                    |
| `pdp_mme_fit_message`     | Product most likely compatible with selected car. Enter VIN for fitment check.               | MME 2-state, `isCompatible === true`                                                |
| `pdp_mme_not_fit_message` | Product most likely not compatible with selected car. Enter VIN for fitment check.           | MME 2-state, `isCompatible === false`                                               |
| `pdp_mme_may_fit_message` | Product most likely compatible with selected car. Enter VIN for fitment check.               | **Not wired** — no MME tri-state signal exists yet                                  |
| `pdp_enter_vin_label`     | Enter VIN                                                                                    | PDP Add-VIN input placeholder (replaces `banner_enter_vin_placeholder` on PDP only) |
| `pdp_add_vin_cta`         | Add car VIN                                                                                  | PDP Add-VIN button (replaces `banner_add_car_vin` on PDP only)                      |

### Flag matrix (mount / visibility)

| Surface                                   | `end_to_end_vin_flow_feature_flag = true`                                                                                      | `= false` (revert to today)                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Landing — search by vehicle box**       | Has saved cars → `NewHeroCarDataCard` (slider + Other car / Find car parts). Empty → `NewHeroNewCarSelectionCard` (VIN + car). | Old empty card / saved-car **slider** as today. Hide `New*`                                       |
| **Search banner** (car-parts, L1–L3, SRP) | Show **new** banner + **new** car dropdown list + **VIN field**                                                                | Show **old** `SearchResultsCarSelectionBanner` / category slot. Hide new banner                   |
| **Same new search banner on PDP**         | Mount the **same new banner** on product details (dropdown + VIN). Hide old mid-page VIN block                                 | **Do not** put VIN verify on banner. Show existing mid-page `Productcompatibilityverify` as today |
| **Right sidebar (desktop)**               | Show `New*` sidebar (VIN on top + MME below)                                                                                   | Show **old** `RightSidebarCarSelection`. Hide `New*`                                              |
| **Mobile drawer**                         | Show `New*` drawer (same as sidebar content)                                                                                   | Show **old** drawer. Hide `New*`                                                                  |
| **Mid-PDP Guaranteed VIN Verification**   | **HIDDEN** (not removed) — VIN UX lives on new PDP banner                                                                      | **VISIBLE** — manual Verify flow unchanged                                                        |

### Implementation mindset (every PR / every action)

1. **Never** overwrite old component internals for E2E behaviour — fork to `New*` and change the copy.
2. **Always** branch visibility with `getClientFeatureFlag("end_to_end_vin_flow_feature_flag")` (or equivalent) at mount sites.
3. **Hide** old when flag true; **hide** new when flag false — both stay in codebase.
4. Shared helpers (URL allowlist `vin`, multi-`carIds` URL, save-`carIds[0]`-only, etc.) must either:
   - run **only when flag is on**, or
   - be written so flag-off paths keep today’s Phase 6c / mid-PDP VIN behaviour with **zero regression**.
5. QA gate before merge: flip flag **false** → visual + flow match **current production-like** UI (landing, sidebar, banner, PDP VIN mid-page).

---

## 1. Feature flag wiring (code requirement)

```text
end_to_end_vin_flow_feature_flag = true
  → show New* landing: saved cars → NewHeroCarDataCard; empty → NewHeroNewCarSelectionCard (VIN + car)
  → show New* right sidebar / mobile drawer (VIN + car)
  → show New* search banner (new dropdown + VIN) on catalog / L1–L3 / SRP / PDP
  → HIDE old landing search, old sidebar/drawer, old banner, old mid-PDP VIN verify

end_to_end_vin_flow_feature_flag = false
  → show ALL existing (old) components as today
  → HIDE every New* surface
  → PDP: mid-page VIN verify only — NO vin verify / VIN field on search banner
```

**Depends on / coexists with:** `new_mme_feature_flag` (Cars API / `carIds` plumbing). Exact nesting TBD at implement time — assume new E2E flow requires new MME already on for that locale.

**Files to touch when implementing:** `config/feature-flags.types.ts`, `utils/feature-flag-env.ts`, env JSON docs, mount sites (hero, `rightsidebar.tsx`, catalog/SRP shells, PDP page) — each mount site must choose OLD vs `New*` by this flag only.

### `New*` copy inventory (minimum)

| Existing (keep forever; show when flag false)           | New copy (show when flag true)       | New affordances                                                                          |
| ------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| Landing empty search-by-vehicle box                     | `NewHeroNewCarSelectionCard`         | VIN field + search by car                                                                |
| Landing saved-car slider (`HeroCarDataCard`)            | `NewHeroCarDataCard`                 | Same slider, edit/delete, Other car → New sidebar, Find car parts → `/car-parts?carIds=` |
| `SearchResultsCarSelectionBanner` (+ category wrappers) | `NewSearchResultsCarSelectionBanner` | Listing: dropdown + static VIN chip; PDP: Add car VIN / Fit chrome                       |
| `RightSidebarCarSelection` (+ mobile drawer mount)      | `NewRightSidebarCarSelection`        | VIN block above MME                                                                      |
| Mid-PDP `Productcompatibilityverify*`                   | _(no replacement file required)_     | Hidden when flag true; unchanged when flag false                                         |

Naming convention: **`New` + existing component name** (prefix), rest unchanged so AI/eng can map 1:1.
---

## 2. Shared CTA rules (Search by car **and** Search by VIN)

After Cars / VIN-search API resolves `carIds`:

| `carIds.length` | Find car parts / Save / “Finish selecting vehicle” CTA                                         | Prefill Make + Model                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0` or `[]`     | **Disabled**                                                                                   | No carIds to prefill                                                                                                                                                  |
| `1`–`5`         | **Active / enabled**                                                                           | Prefill from response / `carIds[0]` (see §3.2–§3.3)                                                                                                                   |
| `> 5`           | **Disabled** (same as empty for apply — user cannot Find car parts / Finish selecting vehicle) | **Still prefill Make + Model using `carIds[0]`** — same 2-level prefill behaviour as when length is 2–5 (§3.3). Do **not** skip prefill just because CTA is disabled. |

**E2E flag on (`isE2EMmeApplyCtaEnabled`):** CTA is gated **only** by `carIds.length` (1–5). Do **not** require every progressive dropdown (body / engine / gearbox / …) to be filled once the Cars API already returned 1–5 ids. Example: Make+Model+Body+Variant+Engine selected, Gearbox still empty, but `carIds: [id1, id2]` → **Finish selecting vehicle** is enabled → URL `?carIds=id1,id2` (no `vin`), persist **only** `carIds[0]`.

**Flag off (legacy Sprint 35):** keep `isNewMmeApplyCtaEnabled` — resolved `carIds` **and** all visible MME fields selected.

**Important (`> 5`):** CTA stays off so the user cannot apply that oversized `carIds` set, but the sidebar/drawer **Make** and **Model** fields should already show the make/model of `carIds[0]` (all ids share the same make+model). User can then change fields or narrow selection until a valid apply path exists.

---

## 3. A) Search by car (not VIN flow)

### 3.1 UI shell (`New*` copies — flag true only)

| Surface                                           | `New*` behaviour (flag on; old hidden)                                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Landing search**                                | Has cars → `NewHeroCarDataCard` (same Other car / Find car parts / edit / delete). Empty → `NewHeroNewCarSelectionCard` (VIN + car) |
| **Right sidebar / mobile drawer**                 | `NewRightSidebarCarSelection` (etc.): **VIN search on top**, then Make→… below (UI later)                                           |
| **Search banner** (catalog / SEO / SRP / **PDP**) | Shared `New*` banner: new car dropdown list + **VIN field**                                                                         |

VIN field stays **empty** on the Search-by-car path (user did not search by VIN). When flag **false**, none of these `New*` surfaces render — old components only (PDP mid-page VIN verify restored; no VIN on banner).

### 3.2 Case 1 — `carIds.length === 1`

- Same as **existing** add flow: persist that one car (guest session / logged-in Garage).
- Navigate hub as today: e.g. `/{locale}/car-parts?carIds=<id>` (single id).
- Carry `carIds` → L1/L2/L3 → search-results → PDP.
- **Search-by-car** (VIN field empty) → **no** `vin` query param.
- **Search-by-VIN** success → same hub + **`&vin=<17>`** (see §4.3 Case 1 / §4.5).

### 3.3 Case 2 — `carIds.length` is `2`, `3`, `4`, or `5`

Multi ids appear only after make+model selection (Cars API) or after VIN search. **All** ids in the array share the **same make + model**.

Example response: `carIds: [id1, id2, id3, id4, id5]` → treat `**carIds[0]` (`id1`)** as the single car for save / edit / delete.

| Concern                         | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persist (guest + logged-in)** | **Do not save all five.** Save **only `carIds[0]`** (same save APIs as single-car / existing guest session push one id or Garage `POST { carId: carIds[0] }`). The saved car represents **Make + Model only**.                                                                                                                                                                                                                                                                                                    |
| **Guest save metadata**         | Guest cars in `sessionStorage` key `searched_car_id` are objects `{ carId, vin? }` (legacy string ids migrate on read). Extra meta key `e2e_saved_car_meta` (same session lifetime): `{ makeModelOnly?: true, vin?: string, siblingCarIds?: string[] }`. VIN is written on the **car object** (and dual-written to meta). `makeModelOnly` + `siblingCarIds` when resolved length was **2–5**. Cleared when a later save resolves to **1** id. On Find / dropdown / nav / Edit, restore from car object then meta. |
| **Logged-in Garage metadata**   | Length **2–5**: `POST /Garage` `name: "makeModelOnly:id0,id1,…"` (legacy plain `"makeModelOnly"` still detected). Length **1**: `name: null`. VIN search also sends `vin`; search-by-car sends `vin: null`. Do **not** show `name` sentinel as a car label.                                                                                                                                                                                                                                                       |
| **URL**                         | Still put **all** returned ids in query for product filtering: `?carIds=id1,id2,id3,id4,id5` (max 5).                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Banner dropdown**             | Show **this one saved car** (make + model label from `carIds[0]`). Do **not** list id2…id5 as separate saved rows.                                                                                                                                                                                                                                                                                                                                                                                                |
| **Edit**                        | Prefill sidebar/drawer from the **saved** id (`carIds[0]`) through **Make + Model only** (2 levels).                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Delete / Remove**             | Delete that **one** saved car (`carIds[0]` from session or Garage). Clear/update URL `carIds` as needed. Not “delete all five as separate saves” — only one save existed.                                                                                                                                                                                                                                                                                                                                         |

**Important vs earlier draft of this doc:** multi-`carIds` does **not** mean push/POST every id into storage. Storage = `**carIds[0]` only**; URL = **full array**.

### 3.3a Case — `carIds.length > 5` (CTA off, still prefill)

Same make+model family as §3.3, but **too many** resolved ids to apply.

| Concern        | Requirement                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **CTA**        | **Find car parts** / **Finish selecting vehicle** / Save stay **disabled** (§2). Do **not** navigate or persist from this response as-is. |
| **Prefill**    | **Still** prefill sidebar/drawer **Make + Model** from **`carIds[0]`** — identical 2-level prefill to length 2–5.                         |
| **Save / URL** | No apply until the user changes selection so a later Cars/VIN response returns ≤5 ids (or a single valid path).                           |

### 3.4 Search banner dropdown — two URL shapes

| URL                  | Dropdown behaviour                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `carIds=<one id>`    | Like today: show that saved car (label from Cars/Garage).                                                                                                                                                                                                                                                                                                                                    |
| `carIds=a,b,…` (2–5) | Show the **one saved car** (`carIds[0]` → make + model). Sibling URL ids are for listing/compat filters only, not separate dropdown entries. Guest banner sync (`syncGuestSessionFromUrlCarIds` with E2E): **ensure only `[0]`** and **prune** sibling URL ids from session so Most Recent never lists the same make+model twice. Flag off keeps legacy `ensureSearchedCarIds(all url ids)`. |

### 3.5 Edit / delete when URL has multiple `carIds`

| URL                     | Edit → sidebar/drawer                                                                                                                                                                                                                                         | Delete / Remove Car                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Single `carIds`         | **Full progressive prefill** (Make → Model → Body → …) from that one linked car — same as today.                                                                                                                                                              | Existing: remove that one saved id.                                                                               |
| Multiple `carIds` (2–5) | Prefill **Make + Model only** from **`carIds[0]`** (shared super-set). Do **not** deep-fill body / variant / engine / gearbox (even if GET `/Cars/{id}` or singleton auto-prefill would). Deeper dropdowns may still **appear** empty for the user to narrow. | Remove the **one** saved car (`carIds[0]`); strip multi `carIds` from URL / hero as today for deselect vs delete. |

**Why:** With 2–5 ids in the URL we are **not** linked to one exact vehicle config — only the common Make+Model group. Saving used `carIds[0]` as the make+model representative; Edit must show that same super-set, not the full detail of id[0] alone (which would falsely look like a single linked car).

**Implementation notes (E2E flag on):**

- Detect multi via URL `carIds` length 2–5 (`shouldE2EPrefillMakeModelOnly`) when **not** in a VIN override.
- **Or** guest: `isE2ESavedCarMakeModelOnly(editingCarsApiId)` (`localStorage`).
- **Or** logged-in: Garage row `name === "makeModelOnly"` (`isGarageItemMakeModelOnly`).
- Bootstrap: GET `/Cars/{carIds[0]}` → keep make+model → POST `/Cars` with make+model only → **strip** any singleton/deep fields `reconcileSelected` may have filled (`toMakeModelOnlySelected`).
  - **Opt (same UX):** when hydrate is VIN-driven, first `POST /Cars { vin }` may replace the GET; then strip make+model and POST **without** `vin` (VIN must not stay on later requests).
- Do **not** restore edit prefill cache when multi-id / makeModelOnly meta (cache may hold a deep snapshot).
- Single-id URL **and** no makeModelOnly meta/Garage name: unchanged full deep prefill + cache.
- **VIN live / `vinPrefill` overrides URL:** depth uses `vinResolvedCarIds`, not the still-stale page URL.
  - `vinResolvedCarIds.length === 1` → **full progressive prefill** (same as homepage single-car VIN), even if URL still has 2–5 `carIds` from a prior vehicle search.
  - `vinResolvedCarIds.length` ≥ 2 (incl. `>5`) → Make+Model only.
  - Clearing VIN drops `vinPrefill` and falls back to URL rules / save meta / Garage name again.

Banner **Deselect** vs true delete: deselect clears active URL/hero; delete removes the single stored car (`carIds[0]`).

### 3.6 Propagation

- `carIds` (single or comma-separated multi) continue to **search-results** and **product details** URLs (browse / L1–L3 → SRP via `categorySearchUrl`; breadcrumbs via `getVehicleContextFromSearchParams`). Storage remains `**carIds[0]` only** when the apply response had 2–5 ids.
- When E2E VIN flow: also persist **`vin`** on those same outbound links whenever it is on the current URL (catalog / L1–L3 / breadcrumbs / footer parts links → SRP).
- **`vin` is URL-only** — allowlisted on search-results (`searchResultsQueryAllowlist` when E2E flag on) so OD-1670 accepts it, but it must **never** be sent in `POST /Parts` (strip in `useInfiniteParts`). `carIds` remains a real Parts filter field.
- Reasons `vin` stays in the query string: (1) mark “this listing is a VIN search”, (2) carry VIN forward to PDP for the part VIN-check API (later).
- On PDP (flag on): **do not** show old mid-page VIN component. New **search banner** on PDP has car dropdown + **VIN input on the right** — for Search-by-car flow the VIN input is **empty** (user can type later if product allows; auto-check only when `vin` is in URL — see §4).

---

## 4. B) Search by VIN

### 4.1 UI shell (same NEW copies)

| Surface                    | Placement                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| **Homepage**               | VIN search field **above** the existing “search your vehicle” / car box |
| **Right sidebar / drawer** | VIN field **above** Make / Model / Engine…                              |

Landing VIN and sidebar VIN are the **same field conceptually** (shared state). **Validation / API errors are shown under the VIN input in the sidebar/drawer only** — not on the homepage search box.

### 4.2 Client VIN format validation (same as PDP / checkout)

Reuse the **same** frontend VIN rules as the existing PDP Guaranteed VIN Verification and checkout VIN components:

| Rule                                                      | Message (existing labels)                                                                                              |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Must be **17 characters** long                            | `vin_length_error` → “VIN must be 17 characters long”                                                                  |
| **17 capital letters and numbers**, excluding **I, O, Q** | `vin_invalid_characters` / `VIN_information_message` — same charset as today (`/^[A-HJ-NPR-Z0-9]{17}$/` or equivalent) |

**Homepage search box — no inline error / no live API**

- While the user types a VIN on the **landing / homepage** VIN field, **do not** show length or charset error messages under that homepage search box.
- **Do not** call `GET /Vin` on homepage keystrokes — only after **Find car parts** click (then open sidebar on format fail, or navigate/prefill on success).

**Right sidebar / drawer — live validation + debounced API (override Make/Model)**

```text
User types or pastes VIN in sidebar/drawer VIN input
  → debounce ~450ms (E2E_SIDEBAR_VIN_LIVE_DEBOUNCE_MS)
  → (1) Frontend validation (length 17 + charset)
        FAIL  → error under VIN; clear vinResolvedCarIds; do NOT call GET /Vin
                (existing Make/Model may remain until a later successful VIN resolve)
        PASS  → (2) GET /api/Vin/{vinNumber}
                 → Case 1: set vinResolvedCarIds; **override** vehicle fields (ignore stale URL carIds depth)
                      → length **1**: full progressive prefill (Make→…→Gearbox), CTA enabled
                      → length **2–5**: Make+Model only, CTA enabled
                      → length **>5**: Make+Model only, CTA disabled (§3.3a)
                 → Case 2: unable-select error under VIN; CTA disabled
  → User clicks Find / Finish (when enabled)
        → persist carIds[0]; navigate ?vin=…&carIds=… (full array when 2–5)
```

**Order of checks on Find car parts from homepage (VIN path)**

```text
User enters VIN (homepage) → clicks Find car parts
  → (1) Frontend validation FIRST (length 17 + charset, same as PDP/checkout)
        FAIL  → do NOT call GET /api/Vin/{vinNumber}
              → AUTO open sidebar/drawer
              → VIN prefilled (shared state)
              → show format/length error BELOW VIN input in sidebar/drawer only
                 (NOT on homepage search box)
        PASS  → (2) THEN call GET /api/Vin/{vinNumber}  → §4.3 Case 1 or Case 2
```

API failure / empty `cars` also auto-opens sidebar — see **§4.3 Case 2** (different error copy: unable to select vehicle by VIN).

### 4.3 VIN search API — `GET /api/Vin/{vinNumber}` (confirmed)

**Wire in React Query:** add a **query key** + **query function** (same patterns as other VIN/Cars hooks). Path param = entered VIN.

|                     |                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method / path**   | `GET /api/Vin/{enter_vin_number}` (e.g. `GET /Vin/VF7SABHY6GW595849` via `apiClient`)                                                       |
| **Focus**           | Extract vehicle **`id`**s from `cars[]` → normalize to **`carIds: string[]`** (same structure used after search-by-vehicle / `POST /Cars`)  |
| **Not the same as** | PDP/checkout part check `POST /Vin` (`checkPartVin` in `services/vin.ts`) — keep that for Fit/Maybe/No. This GET is **VIN → vehicle list**. |

#### Case 1 — Success with one or more cars

Example response (1 car; may also return multiple objects in `cars`):

```json
{
  "vinNumber": "VF7SABHY6GW595849",
  "cars": [
    {
      "id": "mod9lkki49htv2",
      "make": "DS",
      "model": "DS3 (S) 3D/CABRIO (10-20)",
      "variant": "Other",
      "body": "Convertible-3 Doors",
      "engine": "1560cc 73kW 100Hp - Diesel",
      "engineCode": "",
      "gearBox": "5-Speed Be4R-Manual",
      "gearBoxCode": ""
    }
  ]
}
```

**Normalize for the rest of the app (same as search-by-vehicle):**

```ts
// loop cars → ids only
carIds = cars.map((car) => car.id).filter(Boolean);
// e.g. carIds: ["mod9lkki49htv2"]
// or multiple: ["id1", "id2", …]  (then apply §2 CTA length + §3.2 / §3.3 save/URL rules)
```

Optional: keep full `cars[0]` (or first car) make/model/… for **prefill** labels/keys without an extra `GET /Cars/{id}` when convenient — still drive apply/save/URL off **`carIds`**.

Then:

- Apply **same CTA length rules** (§2): active for length 1–5; disabled for `[]` or `> 5`.
- Prefill **Make + Model** from `carIds[0]` / first car **only when length `> 5`** (sidebar open, CTA off — §3.3a). For length **1–5**, do **not** stop on sidebar prefill — go straight to catalog (below). All returned cars share the same make+model when multi.
- **Length 1–5 (valid VIN, no Case 2 error) → navigate immediately** to the car-parts hub (same destination as Find car parts). Do **not** require a second click on Finish selecting vehicle.
  - Persist: **always save `carIds[0]` only** (make+model).
  - URL:
    - 1 id → `/{locale}/car-parts?vin=<17>&carIds=<id1>`
    - 2–5 ids → `/{locale}/car-parts?vin=<17>&carIds=id1,id2,…` (full array; save still only `[0]`).
  - Banner later shows that one saved make+model car + VIN on the right.
- **Length `> 5`:** open sidebar/drawer, prefill Make+Model from `carIds[0]`, CTA disabled — **no** navigate, **no** `vin` on URL until a later valid apply.

#### Case 2 — Error or empty cars → auto-open sidebar / drawer

Treat as failure when **any** of:

- HTTP **500**, **400**, **409** (or other error responses **except 406** — see §4.3a)
- Success body but `cars: []` (length 0) → **no `carIds`**

```text
VIN search fails or cars: []
  → AUTO open right sidebar (desktop) / drawer (mobile)
  → VIN prefilled via same shared VIN state as landing
  → show error BELOW the VIN input in the sidebar/drawer only:
      "We were unable to select your vehicle using VIN, try again later or continue by selecting your car below."
  → user can continue with Make→… search by car below
```

**Label:** add a key in `next/data/branding/labels.ts` (name TBD — client may rename later). Suggested placeholder key:

| Key (placeholder)                  | Default EN                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `vin_search_unable_select_vehicle` | `We were unable to select your vehicle using VIN, try again later or continue by selecting your car below.` |

Do **not** navigate to catalog with empty `carIds` on this path.

### 4.3a Case — HTTP **406** brand not supported → support form (sidebar / drawer)

When `GET /api/Vin/{vinNumber}` returns **406 Not Acceptable** (store does not support that VIN’s brand):

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.7",
  "title": "Not Acceptable",
  "status": 406,
  "detail": "TOYOTA",
  "traceId": "…"
}
```

| Concern                 | Behaviour                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Error under VIN**     | `getLabel("vin_side_panel_brand_not_supported_message", { brand_name })` — template has `{brand_name}` (API `detail`); brand position is locale-specific (en/nl/fr/de). Do **not** append brand at the end. |
| **UI swap**             | Hide Make→… vehicle selection + Find car parts footer. Divider label becomes **Support** (not “or”). Show **No Product Found–style** support form (OD-2093 fields).                                         |
| **Support form fields** | Looking for (required), Email (required), newsletter checkbox (optional), response-time text, **Request information** button. **Reuse sidebar VIN** — do not duplicate a VIN input in the form.             |
| **Support API**         | Same `POST /Support` as No Product Found / `useSubmitSupportMutation`, `category: "PartQuery"`, **Source: VIN Side panel**, VIN included in message + payload.                                              |
| **Help copy**           | Info alert: “We can still help you.” (`vin_brand_unsupported_help_message`).                                                                                                                                |
| **Exit support UI**     | On VIN change (success, format error, Case 2 unable-select, empty cars, Reset, URL clear) → clear `sidebarVinBrandUnsupported` and restore MME + Find footer.                                               |

**Not 406:** keep existing Case 2 unable-select copy + Make/Model path (no support form).

### 4.4 VIN vs car search — field coupling

| Flow              | VIN field                                               | Make / Model                                                                     | Catalog URL                           |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| **Search by VIN** | Filled / carried on URL as `vin`                        | Prefills from VIN→`carIds` (or skip UI when length 1–5 and navigate immediately) | `?carIds=…&vin=…`                     |
| **Search by car** | **Stays empty** (never reverse-prefill from Make/Model) | User-driven progressive MME                                                      | `?carIds=…` only — **no** `vin` param |

**Asymmetry:** VIN search may prefill Make+Model (or skip straight to catalog). Vehicle / MME search must **not** fill the VIN input. Absence of `vin` in the URL is how listing/PDP/banner detect “not a VIN search”.

**VIN filled + user edits any vehicle dropdown (Make / Model / Body / …):**

- Immediately **clear the VIN field** (and `vinResolvedCarIds` / vin prefill / sidebar VIN errors).
- Treat the session as **search-by-car** until the user types a VIN again.
- **Do not** change the page URL yet — URL (`vin` / `carIds`) updates only when the user clicks **Find car parts** / **Finish selecting vehicle**.
- While the sidebar stays open and URL still contains a stale `?vin=`, do **not** re-hydrate the VIN input (`vinUrlHydrationSuppressed`).
- If the user **closes** the sidebar without Find while URL still has `vin`, **restore** the VIN field from the URL (abandoned edit).
- Typing a VIN again clears suppression so live VIN search works.

**VIN field cleared (sidebar):** clear Make→… selections in the sidebar form only (same as Reset for MME). Do **not** strip `vin` / `carIds` from the URL. Empty VIN → Find stays vehicle-path / disabled for VIN search as today.

**URL ↔ VIN field sync (shared store):**

| Location                                            | Rule                                                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage (no `vin` in URL)                          | Clear homepage + right-sidebar VIN inputs (and resolved ids / sidebar VIN errors).                                                                                                                                        |
| Catalog / L1–L3 / SRP / PDP with `?vin=`            | Banner may show read-only VIN from URL. **Edit car** opens sidebar with VIN + Make/Model from URL. **Add new car** / **Other car** open a **fully empty** sidebar (clear VIN field; suppress URL→VIN re-fill while open). |
| Same pages **without** `vin` (search-by-car)        | VIN field stays empty; vehicle fields follow existing carIds / edit prefill only.                                                                                                                                         |
| Sidebar/drawer **close** while URL has **no** `vin` | Reset VIN input + errors + `vinResolvedCarIds` + `vinPrefill` so reopen starts empty (typed-but-not-applied VIN must not stick).                                                                                          |
| Sidebar/drawer close while URL **has** `vin`        | **Restore** VIN (+ resolved ids) from URL and clear `vinUrlHydrationSuppressed` — closing without Find abandons the MME edit that cleared VIN. Reopen shows URL VIN again.                                                |
| User edits any MME field while VIN was set          | Clear VIN UI immediately; suppress URL→VIN re-hydration **while sidebar stays open**. Close without Find → restore from URL (row above). Find → URL updates.                                                              |

### 4.5 Persist VIN in URL (flow detector)

VIN search is detected by presence of `vin` query param (17-char value):

| Page           | Example                                                    |
| -------------- | ---------------------------------------------------------- |
| Catalog        | `/{locale}/car-parts?carIds=abc,def&vin=XXXXXXXXXXXXXXXXX` |
| Search results | `/{locale}/search-results?carIds=…&vin=…&categoryId=…`     |
| PDP            | `/{locale}/car-parts/{seo}/{partId}?carIds=…&vin=…`        |

**Code requirements:**

- Allowlist `**vin**` in search-results / product filter query allowlist (`searchResultsQueryAllowlist.ts` and any catalog/PDP query builders) when `end_to_end_vin_flow_feature_flag` is on (mirror how `carIds` is gated by `new_mme_feature_flag`).
- Propagate `vin` with `carIds` on breadcrumbs, browse→SRP, nav, `categorySearchUrl` helpers (`appendCategorySearchQuery` / `appendVehicleContextToHref` / `getVehicleContextFromSearchParams`).
- Header L1 ribbon (`OGHeaderSearchLinks`) and hamburger Car Parts: pass URL `vin` into `appendNavigationCarIdsToPartsHref` / `buildPartsCatalogUrl` (same as footer).
- **Do not** include `vin` in Parts listing API payload (`useInfiniteParts` omits it); keep `carIds` in the payload.
- Search-by-car must **not** invent a `vin` param.
- PDP `buildPartPdpHref` appends `vin` (+ `carIds`) when present on the source page URL (L3 cards, SRP, recently viewed via `partPdpOptionsFromSearchParams`).

### 4.6 Banner on catalog / SRP / SEO

| URL `vin`   | Banner right of dropdown                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------- |
| **Absent**  | **Nothing** — car dropdown only (same as old Sprint 35 banner). Change vehicle via Edit → sidebar. |
| **Present** | Read-only static text `VIN: {value}` + tick (not an input). No Add car VIN.                        |

**Part VIN check (`POST /Vin`) does not run on catalog / L1–L3 / SRP** — only the static VIN chip when `vin` is in the URL.

### 4.7 Product details — VIN check on New banner (replaces manual mid-page Verify)

**PDP + `vin` in URL** (auto check):

```text
PDP load (client)
  → fixed-height banner skeleton (CLS: height before === after)
  → if vin_compatibility_cache already has (vin, partId) → paint from cache (no network)
  → else auto POST /Vin { vinNumber, partIds: [partId] } → write cache → paint Fit/Maybe/No
```

**PDP + no `vin` in URL** (manual entry — **Add car VIN**):

```text
Show empty VIN input + "Add car VIN" (PDP-only)
  → user enters VIN + clicks Add car VIN
  → (0) `?vin=` is written to the URL IMMEDIATELY (updateFilters({ vin }, currentPath))
        — unconditional, before either API call resolves, so it persists across
          refresh/session even when car resolution (B) fails or returns 0 / >5 cars.
          Fixes a bug where `vin` never reached the URL on Case 2 / >5 / API-error car
          search outcomes even though the part Fit/Maybe/No check had already run.
  → BOTH APIs (parallel):
       (A) POST /Vin { vinNumber, partIds: [partId] }  — part Fit/Maybe/No (cache-aware)
           → updates banner chrome (Fit=green, Maybe=blue, No=orange) even if car search fails
       (B) GET /Vin/{vinNumber}  — same as homepage car search
           format / Case 2 error → open right sidebar with VIN prefilled + error (never banner error)
           length >5 → sidebar Make+Model prefill
           length 1–5 → persist carIds[0], merge `carIds` into the URL alongside the
                        `vin` already set in step (0) (on current PDP path)
```

**VIN readout beside the dropdown — always shown when `vin` is in the URL:** the read-only `VIN: {value}` chip must render regardless of FIT / MAY_FIT / NO_FIT and regardless of whether `hasUrlCar` / `hasDropdownOptions` resolved (e.g. a direct PDP URL with only `?vin=` and no `carIds`, or a NOT_FIT VIN that never resolved a car). Previously the component's early "select car" branch (`!hasUrlCar && !hasDropdownOptions`) short-circuited before the VIN badge could render, silently dropping the VIN display in that case. Fixed by adding `&& !urlVin` to that early-return guard so any URL `vin` always falls through to the branch that renders the VIN badge next to the MME dropdown slot.

**PDP + `vin` in URL** (auto on load):

```text
Skeleton → cache hit OR POST /Vin { vinNumber, partIds: [partId] } → Fit/Maybe/No chrome
```

**Do not** show VIN input / Add car VIN on catalog / SRP / L1–L3.
**Do not** show VIN errors on the search banner — always sidebar/drawer (homepage pattern).
**Do not** require the old mid-page Verify (that block is hidden when flag on).

| `isMatch` / part status | Banner chrome                                                                | Extra UI                                             |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Yes (Fit)**           | Green: `border-color-border-positive` + `bg-color-background-positive-muted` | —                                                    |
| **Maybe (May fit)**     | Blue: `border-color-border-info` + `bg-color-background-info-muted`          | Guest email CTA when applicable; maybe-fit messaging |
| **No (Not fit)**        | Orange: `border-color-border-warning` + `bg-color-background-warning-muted`  | Guest email CTA when applicable; not-fit messaging   |

Listing surfaces (car-parts / L1–L3 / SRP) do **not** run Fit/Maybe/No chrome — they keep green when a car is selected.

### 4.8 Maybe → Support API

| User          | Behaviour                                                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logged-in** | On **Maybe**, **auto-call** Support API with VIN + **email from user data Zustand store**. While compatibility is in flight, keep **banner skeleton** (same height as loaded banner for CLS). |
| **Guest**     | How to collect email + call Support — **UI TBD** (client will provide later). Leave hook/stub points; do not invent guest email UI yet.                                                       |

Reuse PDP support patterns where possible (`GuaranteedVinCheck` / existing `useSubmitSupportMutation` message builders) — confirm category/source with product when implementing.

**NO_FIT → Support API (added, mirrors §4.8 Maybe):** logged-in users now also get an automatic `GuaranteedVinCheck` Freshdesk ticket when a part resolves to **NO_FIT** on PDP (previously the auto-ticket effect fired only for MAY_FIT). Guest NO_FIT ticketing remains **UI TBD**, same as guest MAY_FIT — no guest email-popup UX exists yet, so guests are still skipped entirely (`!isAuthenticated || !userEmail.trim()` short-circuit).

- `utils/vinCheck.ts` — `buildPdpGuaranteedVinCheckSupportMessage` now accepts `matchType?: "MAY_FIT" | "NO_FIT"` (default `MAY_FIT`); switches the section label (`May Fit Items:` / `No Fit Items:`) and message body (`GUARANTEED_VIN_CHECK_MAIN_MESSAGE` / `GUARANTEED_VIN_CHECK_NO_FIT_MESSAGE`) accordingly — same pattern the checkout builder already used.
- `hooks/useE2EPdpBannerVinCheck.ts` — the auto-ticket effect condition changed from `partStatus !== "MAY_FIT"` to `partStatus !== "MAY_FIT" && partStatus !== "NO_FIT"`; `matchType: partStatus` is passed through; the dedupe key (`maybeSupportSentKeyRef`) now includes `partStatus` so a VIN/part pair that later flips between MAY_FIT and NO_FIT (re-check after cache invalidation) can send a fresh ticket per status.

### PDP MME (no VIN) — compatible chrome until VIN check

When the customer arrived via **MME** (`hasUrlCar && !urlVin`, i.e. `carIds` in URL but no `vin`):

| Banner   | Behaviour                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Chrome   | Always **positive (green)** — “compatible car” state                                                     |
| Headline | `pdp_mme_fit_message` — “Product most likely compatible with selected car. Enter VIN for fitment check.” |
| VIN UI   | Empty VIN input + **Add car VIN** (unchanged)                                                            |

Do **not** use `GET /MakeModelType/{carId}/check/{partId}` to flip the banner to orange “not compatible” on this path (404 / `isCompatible: false` previously caused that bug). Confirmed Fit / Maybe / No chrome only after the user adds a VIN and `POST /Vin` runs.

`pdp_mme_not_fit_message` / MakeModelType check remain available in code for other surfaces if needed later; the New PDP banner no longer wires them for carIds-only arrival.

- The "Add VIN" CTA always shows for `isPdp && !urlVin` per §4.6/§4.7.

---

## 5. PDP search banner (`New*` — shared with catalog/SRP) — summary

When `end_to_end_vin_flow_feature_flag` is **true**, PDP mounts the **same `New*` search banner** used on car-parts / L1–L3 / SRP (dropdown + VIN **display or PDP-only entry**). Mid-page `Productcompatibilityverify` is **hidden** (not removed).

When flag is **false**: do **not** mount the `New*` banner on PDP for VIN; restore **old mid-page VIN verify** exactly as today — **no VIN verify on search banner**.

| Region / surface          | Catalog / L1–L3 / SRP (flag true)        | PDP (flag true)                                                                                             |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Car dropdown              | Same (multi-URL → one saved `carIds[0]`) | Same                                                                                                        |
| No `vin` in URL           | **Dropdown only** (no VIN input)         | Empty VIN input + **Add car VIN** beside Select car / dropdown; **no** auto `POST /Vin` until user adds VIN |
| `vin` in URL              | Static `VIN: …` + tick                   | Static `VIN: …` + tick + auto/`cache` Fit/Maybe/No chrome                                                   |
| Mid-page old VIN block    | n/a                                      | **Hidden**                                                                                                  |
| `vin_compatibility_cache` | n/a (no part check)                      | Skip `POST /Vin` when `(vin, partId)` already cached                                                        |

Skeleton (PDP + URL `vin`, flag true): reserve **max loaded height** so CLS stays stable.

---

## 6. URL / allowlist contract (target)

| Param                           | When                              | Notes                                                                          |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `carIds`                        | Always for active vehicle context | `1` id or `2–5` comma-separated; `>5` must not apply; **Parts API filter**     |
| `vin`                           | VIN search flow only              | 17-char; allowlisted when E2E flag on; **URL marker only — not Parts payload** |
| `categoryId` / `take` / `order` | Unchanged on SRP                  | —                                                                              |

**Parts API vs URL:**

| Key      | On SRP / catalog URL | In `POST /Parts` body                                 |
| -------- | -------------------- | ----------------------------------------------------- |
| `carIds` | Yes                  | **Yes** (compatibility filter)                        |
| `vin`    | Yes (VIN flow)       | **No** — omit in `useInfiniteParts` / payload builder |

**Examples:**

```text
# Search by car — single
/en-BE/car-parts?carIds=abc

# Search by car — multi carIds in URL, one saved make+model car (carIds[0])
/en-BE/car-parts?carIds=abc,def,ghi

# Search by VIN — catalog then browse to SRP keeps both params
/en-BE/car-parts?carIds=abc,def&vin=JTPAAAAA20R067972
/en-BE/search-results?carIds=abc,def&vin=JTPAAAAA20R067972&categoryId=001&take=12&order=priority
/en-BE/car-parts/some-part/partId123?carIds=abc,def&vin=JTPAAAAA20R067972
```

---

## 7. Flow diagrams

### 7.1 Search by car (flag on)

```text
Landing / sidebar — Search by car (VIN empty)
  → POST /Cars → carIds
  → length 0 or >5 → CTA disabled
       → if >5: still prefill Make+Model from carIds[0] (§3.3a); no apply/nav
  → length 1 → save carIds[0] (existing) → /car-parts?carIds=id
  → length 2–5 → save ONLY carIds[0] (make+model) → URL ?carIds=id1,id2,…(all)
       → banner shows that one saved make+model car
       → Edit / Delete → operate on saved carIds[0]; Edit prefills Make+Model only
  → category → SRP?carIds=… (full array if multi)
  → PDP?carIds=…  (no vin)
       → NEW banner: dropdown only on catalog; on PDP: dropdown + empty VIN + Add car VIN
       → OLD mid-page VIN hidden
```

### 7.2 Search by VIN (flag on)

```text
Landing / sidebar — enter VIN
  → clicks Find car parts
  → (1) frontend validation FIRST (17 chars + charset, same as PDP/checkout)
       FAIL → do NOT call GET /Vin/{vin}
            → AUTO open sidebar/drawer, VIN prefilled
            → length/charset error under VIN in sidebar ONLY
               (no error on homepage search box)
  → (2) if validation PASS → GET /api/Vin/{vinNumber}  (React Query key + queryFn)
  → Case 1: cars[] with ids
       → carIds = cars.map(c => c.id)
       → length 1 → save carIds[0] → /car-parts?vin=…&carIds=id1   (immediate nav)
       → length 2–5 → save ONLY carIds[0] → /car-parts?vin=…&carIds=id1,id2,…  (immediate nav)
       → banner later: one saved make+model car + VIN on right
       → length >5 → open sidebar; CTA disabled; prefill Make+Model from carIds[0] (§3.3a); no apply/nav
  → Case 2: 400/409/500 OR cars: []
       → AUTO open sidebar/drawer, VIN prefilled
       → error under VIN: vin_search_unable_select_vehicle (labels.ts)
       → user continues with search by car below (no catalog nav; changing MME clears VIN field)
  → SRP keeps carIds + vin (VIN flow only)
  → PDP?carIds=…&vin=… (VIN flow only)
       → skeleton banner
       → auto POST /Vin part-check (or cache hit)  ← different from GET /Vin/{vin}
       → Fit=green / Maybe=blue / No=orange (+ guest email CTA when applicable)
       → Maybe + logged-in → auto Support (email from Zustand)
       → Maybe + guest → TBD UI
```

---

## 8. What changes vs EXISTING logic (flag on only)

| Area                             | Existing (flag off)                                                    | New E2E (flag on)                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Persist when API returns 2–5 ids | Guest may push **all** ids / Garage may post each (Sprint 35 Phase 6b) | **Save `carIds[0]` only** (make+model car). Do **not** save id2…id5.                              |
| Apply URL `carIds` on add        | Often `**[primary]` only** (Phase 6c)                                  | **Full array (1–5)** in URL for filters when API returns multiple; CTA still disabled if `>5`     |
| Banner for multi URL ids         | One selected id / list of saved cars                                   | Show **one** saved car (`carIds[0]` make+model); URL siblings not separate dropdown rows          |
| Edit / delete multi              | Full prefill / delete that saved id                                    | Edit+delete the **one** saved `carIds[0]`; Edit prefills **Make + Model only**                    |
| VIN on catalog/SRP/PDP URL       | Not used                                                               | `vin` param marks VIN search flow                                                                 |
| PDP VIN UX                       | Mid-page Guaranteed VIN Verification + manual Verify                   | Hidden old block; **banner + auto check** when `vin` present                                      |
| Landing / sidebar                | Car MME only (new MME); saved-car slider when cars exist               | Empty → VIN+car `NewHero…`; has cars → `NewHeroCarDataCard` (same buttons); sidebar VIN above MME |
| Components                       | Current files                                                          | **`New*` copies**; old **hidden** (not removed) when flag true; restored when false               |
| PDP VIN when flag false          | Mid-page verify                                                        | Same mid-page verify — **no** VIN verify on search banner                                         |

---

## 9. Implementation checklist (for AI / eng)

1. [x] Add `end_to_end_vin_flow_feature_flag` to types + env map; env key `NEXT_PUBLIC_END_TO_END_VIN_FLOW_FEATURE_FLAG`. _*Local (`.env.local` / `.env.ottogusto.local`): `default: true` for building New* UI. Store main/master/qverde templates stay `default: false` until ship._*
2. [x] Fork with **`New` prefix** — landing empty: `NewHeroNewCarSelectionCard`; landing saved-car slider: `NewHeroCarDataCard` (same edit/delete/Other car → New sidebar / Find car parts → `/car-parts?carIds=`); sidebar/drawer: `NewRightSidebarCarSelection`; search banner: `NewSearchResultsCarSelectionBanner` (shared catalog / L1–L3 / SRP / PDP).
3. [x] Mount sites: flag **true** → New landing (slider if cars else VIN card) + New sidebar/drawer + New banner (catalog via `CategoryCarSelectionBanner`, SRP via `products.tsx`, PDP via `PdpE2ECarSelectionBanner`); flag **false** → old. Mid-PDP `Productcompatibilityverify` **hidden** when flag true (kept in repo).
4. [x] CTA helper: E2E uses `isE2EMmeApplyCtaEnabled` — enable when `carIds.length` is 1–5 (no full progressive-field gate); disable for `[]` / `>5`. Sidebar also disables when `vinResolvedCarIds.length > 5`. When `length > 5`, still prefill Make+Model from `carIds[0]` (§3.3a). Flag off keeps legacy `isNewMmeApplyCtaEnabled` (all visible fields).
5. [x] Apply persistence (E2E flag on): for length 2–5 **save `carIds[0]` only**; put **full** `carIds` array in URL (`urlCarIdsForE2EApply` / `carIdsForE2EPersistence`). Vehicle apply clears VIN + omits `vin` query. Flag off keeps existing Phase 6c behaviour.
       5b. [x] Banner guest URL→session (existing `SearchResultsCarSelectionBanner`): E2E on → `syncGuestSessionFromUrlCarIds(..., { e2eSingleSave: true })` so multi-URL only keeps `carIds[0]` in Most Recent (prunes siblings). Flag off → ensure all URL ids (Sprint 35).
6. [x] Edit prefill: URL `carIds` length 2–5 → Make+Model only; single id → full deep **unless** guest `e2e_saved_car_meta` **or** logged-in Garage `name === "makeModelOnly"`. VIN override uses `vinResolvedCarIds` (1 = full deep even if URL still multi). Guest meta on session save; Garage `name` on logged-in Find/Save/VIN apply (2–5 set, 1 clears to `null`).
7. [x] VIN search: React Query mutation `GET /api/Vin/{vinNumber}`; map `cars[].id` → `carIds`; Case 1 length 1–5 → **immediate** `/car-parts?vin=…&carIds=…` (save `[0]` only); Case 1 `>5` → sidebar Make+Model prefill; Case 2 auto-open sidebar/drawer + `vin_search_unable_select_vehicle`; format errors under sidebar VIN only.
8. [x] Shared VIN state landing ↔ sidebar (`useE2EVinSearchStore` + `useE2EVinFindCarParts`).
       8b. [x] URL sync (`useE2EVinUrlSync`): no `vin` → clear VIN UI; `?vin=` → fill VIN (+ Make+Model from URL `carIds[0]` when sidebar opens).
       8c. [x] Sidebar live VIN: debounced format + `GET /Vin` (`useE2ESidebarVinLiveSearch` via `fetchVinCarsSearch`); shares React Query cache with Find / Add car VIN; skips GET when Find already set `sidebarVinError` for that VIN (or RQ query is already in `error`); `retry: false` so Case 2 / 409 is not re-fired.
       8d. [x] GET /Vin **406** brand not supported: show `detail` under VIN; swap MME for OD-2093-style support form (`NewVinBrandUnsupportedSupportForm`, Source: VIN Side panel); restore MME on VIN change / other errors (`sidebarVinBrandUnsupported`).
9. [x] Allowlist `vin` when E2E flag on (`searchResultsQueryAllowlist` + `ProductFilters.vin` + Phase 4b catalog nav). Persist `vin`+`carIds` catalog/L1–L3→SRP via `categorySearchUrl` / breadcrumbs; L3/SRP→PDP via `buildPartPdpHref` / `partPdpOptionsFromSearchParams`. Strip `vin` from `POST /Parts` in `useInfiniteParts`.
       9b. [x] New banner VIN: **Catalog/SRP/L1–L3** — no `vin` → dropdown only; with `vin` → static VIN + tick. **PDP** — no `vin` → Add car VIN runs **POST /Vin part check** + **GET /Vin cars** together (`runPartCheckForVin` + `runVinFindCarParts`); with `vin` → auto POST on load. Banner chrome from Fit/Maybe/No; car errors → sidebar only. Cache: `vin_compatibility_cache`.
10. [x] PDP flag on: skeleton → auto part VIN check + cache on **new banner**; Fit=green / Maybe=blue / No=orange; Maybe/No + logged-in Support; guest email CTA when applicable. Flag off: old mid-page verify only. CLS: fixed `min-h` skeleton.
11. **Revert QA (mandatory):** flag false → landing / sidebar / drawer / banner / PDP match **current** UI; no leftover VIN on banner; mid-PDP VIN visible. Then flag true paths: car case 1; car case 2–5; VIN GET success (1 and multi); VIN Case 2 (4xx/5xx/empty); invalid format; PDP Fit/Maybe/No; cache hit; logged-in Maybe support.

---

## 10. Open / deferred (do not invent in code yet)

| Item                                                                                                     | Owner                                                                           |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Confirm final label key names / wording for new VIN E2E copy (placeholders OK until ticket)              | Client                                                                          |
| Confirm final label key name for VIN search Case 2 copy (placeholder `vin_search_unable_select_vehicle`) | Client                                                                          |
| Figma for dual landing options, sidebar VIN stack, banner VIN-right, PDP green/red/maybe                 | Design / client                                                                 |
| Guest Maybe → email + Support UX                                                                         | Client (later)                                                                  |
| Whether empty PDP VIN input can trigger manual verify without URL `vin`                                  | **Resolved:** PDP shows Add car VIN → updates URL then part-check (cache-aware) |
| Whether >5 `carIds` shows a specific error copy (CTA already disabled; Make+Model still prefilled)       | Product / design                                                                |

---

## 11. Key files to extend / fork (when implementing)

| Concern              | Existing (keep)                                                             | Likely NEW / touch                                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flag                 | `feature-flag-env.ts`, `feature-flags.types.ts`                             | Add `end_to_end_vin_flow_feature_flag`                                                                                                                                                 |
| Apply / URL          | `newMmeCarApply.ts`, `useNewMmeCarFilters.ts`                               | E2E paths only when flag on: save `carIds[0]` only; URL full array when length 2–5                                                                                                     |
| Guest banner session | `searchedCarIdsSession.ts` + existing banner                                | E2E: `syncGuestSessionFromUrlCarIds` keeps/prunes to `carIds[0]` for multi-URL; flag off: ensure all URL ids; multi URL sync also sets `e2e_saved_car_meta`                            |
| E2E save meta        | —                                                                           | Guest: VIN on session car `{ carId, vin? }` + `e2e_saved_car_meta` (`makeModelOnly` / siblings / dual-write vin). Logged-in: Garage `name` + `vin` via `persistGarageCarsForApply`     |
| Sidebar              | `RightSidebarCarSelection.tsx` (**keep**)                                   | `NewRightSidebarCarSelection` (+ drawer): VIN block + error; multi edit = make+model of `carIds[0]`                                                                                    |
| Landing              | Hero / search-by-vehicle (**keep**)                                         | `NewHeroNewCarSelectionCard` (empty); `NewHeroCarDataCard` (saved slider — same Other car / Find car parts)                                                                            |
| Banner               | `SearchResultsCarSelectionBanner.tsx` (**keep**)                            | `NewSearchResultsCarSelectionBanner` (+ `PdpE2ECarSelectionBanner`): VIN chip / empty VIN + Add car VIN; PDP Fit/Maybe/No + skeleton                                                   |
| PDP VIN check        | `usePdpVinCheck` / mid-page verify (**keep, hide when flag true**)          | `useE2EPdpBannerVinCheck` on New banner — auto `POST /Vin` when URL has `vin`                                                                                                          |
| Allowlist            | `searchResultsQueryAllowlist.ts`                                            | Allow `vin` **only when** E2E flag on                                                                                                                                                  |
| PDP href             | `build-part-pdp-url.ts`, breadcrumbs                                        | Append `vin` when flag on                                                                                                                                                              |
| VIN search (vehicle) | — (new)                                                                     | `GET /Vin/{vinNumber}`; **406** → `detail` under VIN + `NewVinBrandUnsupportedSupportForm` (Source: VIN Side panel)                                                                    |
| PDP VIN check (part) | `productcompatibilityverify*` + `POST /Vin` (**keep, hide when flag true**) | Flag false → show as today; flag true → hidden; part-check reused from NEW banner                                                                                                      |
| Support              | PDP / No Product Found helpers                                              | Auto Maybe for logged-in (flag-on PDP); VIN 406 side panel → `POST /Support`                                                                                                           |
| Labels               | `data/branding/labels.ts`                                                   | **Reuse** existing keys for unchanged UI (do not edit those strings). **Add** new keys only for new VIN/E2E copy (heading, placeholder, Case 2, 406 help, …); rename later from ticket |

---

## 12. Optimization — `POST /Cars` with `vin` (API-call reduction)

**Product behaviour unchanged.** This only speeds up VIN-driven sidebar Make/Model (and deep) prefill.

### Before

After `GET /Vin/{vin}` resolved `carIds`:

1. `GET /Cars/{carIds[0]}` — field keys
2. One or more `POST /Cars` with make/model/… — options + selection

### After (VIN-driven hydrate only)

One first request:

`POST /api/Cars`

```json
{
  "make": null,
  "model": null,
  "body": null,
  "engine": null,
  "engineCode": null,
  "variant": null,
  "gearBox": null,
  "gearBoxCode": null,
  "vin": "VF7SABHY6GW595849"
}
```

Response already includes option dictionaries, selected keys (`make` / `model` / …), and `carIds` — so we **skip** `GET /Cars/{id}` and usually skip extra progressive POSTs for that first paint.

### Rules (backend note)

| Rule                                                                                | Why                                          |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| Send `vin` **only on the first** Cars hydrate for that VIN open                     | VIN **overrules** any other body fields      |
| After the user changes Make / Model / …, POST again **without** `vin` (`vin: null`) | User choice must win                         |
| Keep `GET /Vin/{vin}`                                                               | Case 1/2, multi-ids, 406 brand-not-supported |
| On `POST /Cars {vin}` failure                                                       | Fall back to legacy `GET /Cars/{id}` → POST  |
| Edit **without** VIN / Add new car empty                                            | Unchanged — no `vin` on Cars                 |

### Savings (typical)

| Scenario                              | Calls saved                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| Single-car VIN → full sidebar prefill | Drop `GET /Cars/{id}` (+ often fewer progressive POSTs) → **1×** `POST /Cars {vin}` |
| Multi / make+model-only               | Drop `GET /Cars/{id}`; may still POST once without `vin` after strip                |

Wire-up: `buildVinBootstrapPrefillPayload` + `useNewMmeCarFilters` VIN first-hydrate path; normal `buildPayload` always sends `vin: null`.

---

## 13. Changelog — PDP MME messaging + VIN persistence fixes (2026-08-04)

Concrete implementation session on top of the spec above. Each row is a real code change with file references, distinct from the design-intent sections (§1–§12) above it.

| #   | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Files                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | **Bug fix:** `NewSearchResultsCarSelectionBanner` FIT headline was leftover debug code (`return 444444444444444`) instead of the real `pdp_vin_fit_message` label call.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `components/NewSearchResultsCarSelectionBanner.tsx`                                                  |
| 2   | **New translation keys** added to the English-only default label set (`DEFAULT_LABELS.default` — this file is a fallback only; other locales are CMS-driven, not stored here): `pdp_mme_fit_message`, `pdp_mme_not_fit_message`, `pdp_mme_may_fit_message`, `pdp_enter_vin_label`, `pdp_add_vin_cta`. See the labels table in §"Labels / i18n" above for defaults + wiring.                                                                                                                                                                                                                                                                       | `data/branding/labels.ts`                                                                            |
| 3   | **MME (no VIN) two-state compatibility** — new hook reusing the existing `checkPartCompatibility` (`GET /MakeModelType/{carId}/check/{partId}`) boolean endpoint; drives `pdp_mme_fit_message` / `pdp_mme_not_fit_message` + warning chrome when the customer arrived via MME (`hasUrlCar && !urlVin`) and hasn't run a VIN check yet. See §4.8 "PDP MME (no VIN) two-state compatibility". `pdp_mme_may_fit_message` added per copy spec but left unwired (no tri-state MME signal).                                                                                                                                                             | `hooks/useE2EPdpMmeCompatibilityCheck.ts` (new), `components/NewSearchResultsCarSelectionBanner.tsx` |
| 4   | **PDP Add-VIN CTA copy** swapped from the shared `banner_enter_vin_placeholder` / `banner_add_car_vin` keys to dedicated `pdp_enter_vin_label` / `pdp_add_vin_cta` keys. Safe because both call sites are already PDP-only (`showVinEntry = isPdp && !urlVin`) — no listing-surface behaviour change.                                                                                                                                                                                                                                                                                                                                             | `components/NewSearchResultsCarSelectionBanner.tsx`                                                  |
| 5   | **NO_FIT Freshdesk auto-ticket on PDP** (logged-in only, mirrors the existing MAY_FIT auto-ticket per §4.8): `buildPdpGuaranteedVinCheckSupportMessage` gained `matchType?: "MAY_FIT" \| "NO_FIT"`; the PDP auto-ticket effect now fires for both statuses instead of MAY_FIT only. Guest NO_FIT/MAY_FIT ticketing remains out of scope — no email-popup UX has been designed yet.                                                                                                                                                                                                                                                                | `utils/vinCheck.ts`, `hooks/useE2EPdpBannerVinCheck.ts`                                              |
| 6   | **VIN readout always renders beside the dropdown** when `?vin=` is in the URL, regardless of FIT/MAY_FIT/NO_FIT and regardless of whether `hasUrlCar`/`hasDropdownOptions` resolved. Previously the early "select car" branch (`!hasUrlCar && !hasDropdownOptions`) could short-circuit before the VIN badge rendered — e.g. a direct PDP URL with only `vin` and no `carIds`. Fixed the guard to `!hasUrlCar && !hasDropdownOptions && !urlVin`.                                                                                                                                                                                                 | `components/NewSearchResultsCarSelectionBanner.tsx`                                                  |
| 7   | **`vin` now always written to the URL on Add car VIN**, immediately and unconditionally, instead of only as a side effect of a successful car resolution (`navigateVinCatalogSuccess` inside `runVinFindCarParts`, which only fired for 1–5 resolved cars). Previously a VIN that resolved to 0 cars, >5 cars, or an API error never reached the URL even though the part Fit/Maybe/No check had already completed and rendered a result. `handleAddCarVin` now calls `updateFilters({ vin }, ...)` directly before/independent of the car-search call; `runVinFindCarParts` still runs afterward and merges `carIds` in on top when it succeeds. | `components/NewSearchResultsCarSelectionBanner.tsx`                                                  |

**Not changed / explicitly deferred (per product decision during this session):**

- Guest email-popup UX for MAY_FIT/NO_FIT Freshdesk tickets — still "pending design" per the original ticket; guests continue to be skipped by the auto-ticket effect.
- `pdp_mme_may_fit_message` stays unwired until an MME endpoint can return a "maybe" state.

---

## 14. Changelog — persist VIN on saved cars (guest meta + Garage) (2026-08-06)

VIN search previously saved only `carId` (session / Garage). After leaving `?vin=` (e.g. homepage), Find car parts / Edit had no VIN context. This session attaches VIN to the saved car.

| #   | Change                                                                                                                                                                                                                                                                                                                                                    | Files                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Guest meta merge + `vin`:** `e2e_saved_car_meta` entries are `{ makeModelOnly?, vin? }`. `syncE2ESavedCarMakeModelOnlyMeta` **merges** (no longer wipes VIN). `setE2ESavedCarVin` / `getE2ESavedCarVin` / `normalizeSavedCarVin`.                                                                                                                       | `utils/e2eSavedCarMeta.ts`, `e2eSavedCarMeta.test.ts`                                                                        |
| 2   | **Garage POST `vin`:** `postGarageNewMmeCar` + `persistGarageCarsForApply` accept optional `vin` (`string` set / `null` clear / omit).                                                                                                                                                                                                                    | `services/garageService.ts`, `utils/newMmeCarApply.ts`, `utils/garageCarId.ts` (`getGarageItemVin`, `findGarageVinByCarId`)  |
| 3   | **Write:** VIN success (`navigateVinCatalogSuccess`) sets guest meta VIN + Garage `vin`. Vehicle Find/Save clears guest VIN + posts `vin: null`.                                                                                                                                                                                                          | `hooks/useE2EVinFindCarParts.ts`, `hooks/useNewMmeCarFilters.ts`                                                             |
| 4   | **Read — homepage Find:** attaches saved VIN to `updateFilters` when present. Hero items expose optional `vin`.                                                                                                                                                                                                                                           | `hooks/useHeroCarsPanel.ts`, `screens/landing/heroCard2.tsx`, `hero-card-mobile.tsx`, `HeroCarDataCard` type                 |
| 5   | **Read — Edit hydrate:** sidebar Edit fills VIN from URL **or** saved-car meta/Garage when URL has no `vin`. `useE2EVinUrlSync` does not clear VIN while sidebar is open.                                                                                                                                                                                 | `components/NewRightSidebarCarSelection.tsx`, `hooks/useE2EVinUrlSync.ts`                                                    |
| 6   | **Read — banner dropdown:** selecting a VIN-saved car restores `?vin=`; vehicle-saved car clears `vin`.                                                                                                                                                                                                                                                   | `hooks/useSearchResultsCarBannerModel.ts`                                                                                    |
| 7   | **Edit VIN hydrate via GET /Vin (not Cars flood):** Edit open with VIN context seeds the field, calls `GET /Vin/{vin}` immediately (same as typing), sets `vinPrefill` → `POST /Cars {vin}`. Filters **defer** `GET /Cars/{id}` while VIN resolve is pending; Case 2 falls back to Cars-by-id; 406 stays on support UI.                                   | `NewRightSidebarCarSelection.tsx`, `useNewMmeCarFilters.ts`, hero/banner Edit handlers                                       |
| 8   | **Outbound nav carries saved-car VIN:** `useNavigationVin` — URL `vin` else guest meta / Garage for active nav car. Wired into header L1–L3, footer, hamburger Car Parts, manufacturers, homepage browse-by-category, L2/L3 search links. Banner dropdown already updates `?vin=` with `?carIds=`. Explicit `vin: null` clears stale VIN on href helpers. | `useNavigationCarIds.ts`, `categorySearchUrl.ts`, header/footer/hamburger/ManufacturerBlock/browse-by-category/CategoryL2–L3 |
| 9   | **Multi carIds (2–5) sibling context:** Guest `siblingCarIds` in meta; Garage `name: "makeModelOnly:id0,id1,…"`. Find / dropdown / nav restore full URL array; still save only `[0]`.                                                                                                                                                                     | `e2eSavedCarMeta.ts`, `newMmeCarApply.ts`, `garageCarId.ts`, hero Find, banner dropdown, `useNavigationCarIds`               |
| 10  | **car-parts Browse + Find harden:** Catalog Browse by category no longer skips vehicle context (`!isCategoryCatalogPage` removed). Hero Find VIN from meta/Garage (same as banner). L1/L2/L3 → SRP keep `manufacturerIds`.                                                                                                                                | `browse-by-category-2`, `heroCard2`, `hero-card-mobile`, `CategoryL2Section`, `CategoryL3Grid`, `CategoryL3TopPartsSection`  |
| 11  | **Guest VIN same lifetime as guest cars:** `e2e_saved_car_meta` moved to `sessionStorage` (migrate from localStorage). Hero Edit seeds VIN via `getE2ESavedCarVin(carId)`. Login→logout keeps guest car + VIN together.                                                                                                                                   | `e2eSavedCarMeta.ts`, `heroCard2`, `hero-card-mobile`                                                                        |
| 12  | **VIN on guest session car object:** `searched_car_id` entries are `{ carId, vin? }` (legacy string[] migrates). VIN Find writes `setSearchedCarVin`; vehicle apply clears it. `getE2ESavedCarVin` prefers car object then meta.                                                                                                                          | `searchedCarIdsSession.ts`, `useE2EVinFindCarParts.ts`, `useNewMmeCarFilters.ts`, `e2eSavedCarMeta.ts`                       |

**Unchanged:** search-by-car never invents VIN; flag-off Garage/session behaviour; mid-PDP VIN when flag false; Parts API still omits `vin`.

---

## 15. Changelog — PDP banner resets Fit/Maybe/No when URL drops `vin` (2026-08-07)

Browser BACK after **Add car VIN** correctly removed `?vin=` from the URL, but the banner kept Fit/Maybe/No chrome because `useE2EPdpBannerVinCheck` intentionally preserved mid-Add results when URL had no `vin`.

| #   | Change                                                                                                                                                                                                             | Files                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | **Reset on URL vin loss:** when previous URL had `vin` and current has none (BACK / deselect), clear part-check phase/result/`checkedVin`. Still keep mid-Add result while URL is catching up (`prev` also empty). | `hooks/useE2EPdpBannerVinCheck.ts`, `utils/pdpBannerVinCheckUrl.ts` |
| 2   | **Ignore stale mutation:** `onSuccess` / `onError` no-op when `lastCheckedKeyRef` no longer matches (in-flight check after BACK).                                                                                  | `hooks/useE2EPdpBannerVinCheck.ts`                                  |
| 3   | Unit helpers: `shouldResetPdpBannerVinCheckOnUrlVinLoss`, `isCurrentPdpPartVinCheckKey`.                                                                                                                           | `utils/pdpBannerVinCheckUrl.ts`, `pdpBannerVinCheckUrl.test.ts`     |

**Unchanged:** session/meta/Garage VIN persistence from Add; listing surfaces; FORWARD re-runs auto-check from URL `vin`.
