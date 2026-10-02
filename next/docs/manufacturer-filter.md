## Manufacturer Filter – Requirements & Flow

### 1. Entry flow from Manufacturer / Landing pages

- **1.1 Source pages**
  - Manufacturer listing page.
  - Landing page manufacturer section.
- **1.2 Navigation target**
  - User lands first on the **category catalog page**: `/car-parts`.
- **1.3 Required URL param**
  - When a manufacturer is selected, the `/car-parts` URL **must include** a `manufacturerIds` query param.
  - **Example**: `/car-parts?manufacturerIds=abc`
  - `manufacturerIds` is **multi-select**:
    - Single: `manufacturerIds=abc`
    - Multiple: `manufacturerIds=abc,def,ghi`
  - **Keys must always be IDs**, never names.

### 2. Carrying manufacturerIds from catalog to search results

- **2.1 Category selection on `/car-parts`**
  - User can pick any category; category choice is independent of manufacturer.
  - When a category is selected and the flow navigates to the search results page (products page), the URL will:
    - Add/modify category-related params (e.g. `categoryIds`, `makeModelTypeId`, etc.).
    - **Must preserve and forward** existing `manufacturerIds` from `/car-parts`.
- **2.2 Target URL**
  - Search results / products page (MME searchdata slug or `/search-results` equivalent).
  - Whatever the resulting path, **the query string must still contain `manufacturerIds`** when it was present on `/car-parts`.

### 3. Search-results / products page URL allowlist

- **3.1 Allowlist file**
  - Implemented in `next/utils/searchResultsQueryAllowlist.ts`.
  - Base allowed product filter keys (excerpt, L10–L30):
    - `vendorId`, `search`, `name`, `oeReference`, `makeModelTypeId`, `categoryIds`,
      `take`, `minPrice`, `maxPrice`, **`manufacturerIds`**, `order`, `year`,
      `cc`, `fuel`, `hp`, `body`, `doors`, `variant`, `availability`.
- **3.2 Requirements**
  - **3.2.1** Ensure `manufacturerIds` is present in the allowed keys (already present; must stay).
  - **3.2.2** Legacy / incorrect key `brandId`:
    - Must **not** be used for search results validation or filter parsing.
    - Any old usage of `brandId` in search-results validation should be removed/migrated to `manufacturerIds`.
  - **3.2.3** If `manufacturerIds` is present in the URL but not allowed, the page would fall back to “not found”; the allowlist must prevent this by explicitly permitting `manufacturerIds`.

### 4. Avoiding duplicate API calls & using URL as source of truth

- **4.1 Current flow**
  - When user lands on search results / products page, the Parts API is called via:
    - `useInfiniteParts` in `next/hooks/products.ts`, which reads `filters` from `useUrlParams`.
  - `useUrlParams` (in `next/hooks/useUrlParams.ts`) exposes:
    - `filters`, `updateFilters`, `resetFilters`, etc.
- **4.2 Requirements for API call behaviour**
  - **4.2.1** There must be **no duplicate Parts API calls** just because `manufacturerIds` is being read or written.
  - **4.2.2** `manufacturerIds` must **not** be sourced from `useFilterStore`.
    - Similar to the **availability filter**, the single source of truth must be the URL (via `useUrlParams`).
  - **4.2.3** When `updateFilters` is called with new `manufacturerIds`, it should:
    - Merge with existing filters and compute a new URL query string.
    - Trigger **exactly one** navigation / state update (hence one query-key change) → one Parts API call.
  - **4.2.4** Any “prefill” logic for `manufacturerIds` from URL should:
    - Parse the `manufacturerIds` query param.
    - Store it only in the URL-derived `filters` (and any ephemeral in-memory helpers if needed).
    - Not write `manufacturerIds` back into `useFilterStore` as persistent state.

### 5. Data sources for manufacturer dropdown

- **5.1 Full manufacturer list (totalManufacturer)**
  - Available in `next/screens/products/products.tsx` via:
    - `useManufacturersQuery` (L439–L443):
      - `const { data: manufacturerData, isLoading, isError } = useManufacturersQuery();`
  - This returns the **complete** manufacturer list (likely cached ~1 day).
  - Shape example:
    ```json
    totalManufacturer = [
      {
        "id": "1",
        "name": "1_name",
        "type": null,
        "image": null
      },
      {
        "id": "2",
        "name": "2_name",
        "type": null,
        "image": null
      }
    ]
    ```
- **5.2 Brands information from Parts API**
  - When Parts API is called with the current filters (including `manufacturerIds` from URL), it returns an aggregated brands object.
  - Expected shape example:
    ```json
    brands = {
      "id1": 42,   // count of parts for manufacturer id1
      "id2": 7     // count of parts for manufacturer id2
    }
    ```
  - Keys are **manufacturer IDs**; values are counts of parts for that manufacturer under current filters.
- **5.3 Dropdown data derivation**
  - Combine `totalManufacturer` and `brands` to derive the **effective dropdown options**:
    - **Never remove** a manufacturer from the list based on `brands` alone: the dropdown always reflects the **full** `totalManufacturer` list (same universe as the “no brands” case).
    - **When `brands` is absent or empty** (`null`, `undefined`, `{}`, or no usable map): use the full list **unchanged**; do not attach counts (or leave `count` undefined) so the UI can show names only.
    - **When `brands` is non-empty**: for **every** manufacturer in `totalManufacturer`, set `count` to the numeric value from `brands[id]` when that key exists, otherwise **`count: 0`** (manufacturer stays in the list).
    - **Sort** when counts are applied: **descending by `count`** (highest first); **tie-break** by manufacturer **name** ascending (then `id` if needed) so order is stable.
    - Implemented in `next/screens/products/products.tsx` (`dropdownBrands` `useMemo`): maps every manufacturer to a count, then sorts once before passing to the dropdown component.
- **5.4 Dropdown display order (`BrandsDropdownBlock`)**
  - File: `next/screens/products/BrandsDropdownBlock.tsx`.
  - Search text filtering preserves the underlying list order (`.filter` only; no re-sort on filter).
  - **Landing / no pending selection** (`pendingManufacturerIds` is empty — typical first open when URL has no `manufacturerIds`):
    - **Do not re-sort** in the dropdown; render `filteredBrands` in the order received from `dropdownBrands`.
    - Brands with parts in the current result set appear at the top with counts, highest first, then all `count: 0` manufacturers below.
    - Example (20 parts across 3 brands): `A (10)`, `C (7)`, `B (3)`, then every other manufacturer with no count label.
  - **While user is selecting** (`pendingManufacturerIds` is non-empty — ticks before Save, or URL selection copied on open):
    - **Selected** manufacturers are pinned to the **top** of the list.
    - **Among selected**: order follows `pendingManufacturerIds` array order (first ticked = highest in the selected block; e.g. tick `D` then `C` → `D`, `C` at top).
    - **Among unselected**: same as landing — **count descending**, then name ascending, then `id`.
  - After **Save**, the Parts API refetches with `manufacturerIds`; counts and order update from the new `brands` response. Re-opening the dropdown copies URL selection into `pendingManufacturerIds`, so saved selections stay pinned at the top.

### 6. Dropdown options format

- **6.1 Normal case (non-empty `brands` from Parts API)**
  - Final dropdown list format (every manufacturer appears; optional example with partial API keys):
    ```json
    [
      { "id": "B", "name": "B_name", "count": 89 },
      { "id": "C", "name": "C_name", "count": 56 },
      { "id": "A", "name": "A_name", "count": 0 }
    ]
    ```
  - Rows with no entry in `brands` still appear with **`count: 0`** after sorting.
  - **Display:** Show **`Name (count)`** only when **`count > 0`**; when **`count` is `0`**, show the **name only** (omit `(0)`).
  - ID is the primary key used for:
    - Matching with `brands` keys.
    - Selection state and `isActive`.
    - URL param `manufacturerIds` (comma-separated list of IDs).
- **6.2 Fallback case (no usable brands from Parts API)**
  - If Parts API returns **no brands info** (brands is `null`, `undefined`, an empty object `{}`, or otherwise treated as empty — same detection as today):
    - Use the **full `totalManufacturer`** list as dropdown options **without** filtering.
    - `count` will be `undefined` in this case and can be handled accordingly in UI (e.g. show name only, not `(0)`).

### 7. Handling pre-selected manufacturerIds from URL

- **7.1 Existing selections**
  - If URL already contains `manufacturerIds`, after building the dropdown options:
    - For each option, check if its `id` is in the `manufacturerIds` list from URL.
    - This must work whether options are the **full list with counts and sort** (non-empty `brands`) or the **full list without counts** (brands missing / empty).
- **7.2 Active / tick mark state**
  - UI components (e.g. `OGBrandOption`, checkbox/radio-like visuals) must:
    - Use **ID-based** matching exclusively:
      - `isActive = manufacturerIdsFromUrl.includes(option.id)`
    - **Never** rely on names for equality (`name` is only for display).
- **7.3 Multi-select behaviour**
  - Multiple manufacturers can be active simultaneously.
  - The selection list in memory and in the URL must always be:
    - `string[]` of IDs.
    - Serialized as comma-separated `manufacturerIds` in the query string.

### 8. User interactions and updateFilters integration

- **8.1 Toggling selection**
  - On click of a manufacturer option:
    - Determine whether the option’s `id` is currently selected (using URL-derived `manufacturerIds`).
    - If **not selected**: add this `id` to the array.
    - If **already selected**: remove this `id` from the array.
  - Click actions update a **local pending selection buffer** only.
  - **Do not call `updateFilters` on option click.**
- **8.1.1 Save interaction (important)**
  - `updateFilters` must be called **only when the user clicks `Save`** in the brands dropdown.
  - On `Save`, apply pending selection to URL:
    - If pending array is non-empty, call `updateFilters` with `manufacturerIds: updatedIdsArray`.
    - If pending array is empty, call `updateFilters` with `manufacturerIds: null`.
  - If pending selection has no difference from current URL selection, close dropdown without calling `updateFilters`.
  - Example (conceptual):
    ```ts
    updateFilters(
      {
        manufacturerIds: updatedIds.length > 0 ? updatedIds : null,
        year: currentYear ?? null, // preserve year when needed
      },
      "/products",
    );
    ```
- **8.2 Resetting manufacturer filter**
  - A “Reset” action in the dropdown should:
    - Clear selected manufacturer IDs immediately.
    - Trigger URL update immediately (no `Save` required for reset):
      - `updateFilters({ manufacturerIds: null, year: currentYear ?? null }, "/products")`.
    - This immediate URL update should trigger the parts API refetch with cleared manufacturer filter.
    - Not touch unrelated filters (category, price, etc.).
- **8.3 No dependence on useFilterStore for manufacturerIds**
  - Manufacturer selection state should be:
    - Derived from `filters.manufacturerIds` (URL via `useUrlParams`).
    - Controlled solely via `updateFilters`.
  - `useFilterStore` may still handle **other** concerns (price, sort, etc.), but must **not** be considered the source of truth for `manufacturerIds`.

- **8.4 Implementation note: outside-click and React refs**
  - The search results header may host **multiple** dropdowns (e.g. sort/price and brands). Each dropdown must use its **own** `ref` on the wrapper that contains the trigger **and** the floating panel.
  - The document-level “click outside” handler must close **only** the dropdown whose ref does not contain the event target (e.g. close sort when outside `sortDropdownRef`, close brands when outside `brandsDropdownRef`).
  - **Do not** reuse one `ref` for more than one wrapper: React keeps only the last assigned node, so outside-click logic will treat clicks on brand options as “outside” the wrong element, immediately closing the brands panel and preventing ticks and Save from working.

### 9. Summary of key invariants

- **9.1 Keys and identity**
  - Manufacturer identity is always the **ID**:
    - URL param `manufacturerIds`.
    - Dropdown selection and `isActive`.
    - Brands map keys from Parts API.
  - Names (`name`) are purely display labels.
- **9.2 URL as source of truth**
  - `manufacturerIds` are:
    - Read from URL into `filters` via `useUrlParams`.
    - Updated only via `updateFilters`.
    - Never persisted primarily in `useFilterStore`.
- **9.3 API call discipline**
  - Landing on products/search results:
    - Exactly one initial Parts API call based on URL filters (including `manufacturerIds`).
  - Clicking/toggling manufacturers:
    - Each `updateFilters` call should cause at most one new Parts API request via query-key change.
  - No redundant calls purely due to internal state mirrors for `manufacturerIds`.
- **9.4 Dropdown list completeness**
  - With a **non-empty** `brands` map, the dropdown still includes **all** `totalManufacturer` rows: attach counts from `brands` or **0**, then **sort by count descending** (stable tie-break by name / id). Do **not** hide manufacturers solely because they are missing from `brands`.
- **9.5 Dropdown display order**
  - **No pending selection** (landing): count-based order from `products.tsx` is shown as-is — brands with matching parts float to the top (`Name (count)` when `count > 0`).
  - **Pending selection** (ticking before Save): selected IDs pinned to top in tick order; remaining rows keep count-based order. **Do not** fall back to alphabetical sort for the full list.
