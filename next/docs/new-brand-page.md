# New brand pages — rough requirements

Production car-make pages (list, brand details, brand × L3). Not a test route.

Throwaway context from an earlier spike (`/{locale}/car-brands-test`, dummy Fiat): **reuse behaviour, not those files**. Exact slugs / brand API contract TBD after the end-to-end flow walkthrough.

Related: [OD-2300.md](./OD-2300.md) (vehicle query params vs crawlers), [breadcrumb.md](./breadcrumb.md), existing L3 catalog at `/{locale}/car-parts/category/[l1]/[l2]/[l3]/`.

---

## Goal

Three crawlable surfaces, real brand API, category tree shared with the rest of the app.

| Page                | Role                                                | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Car brands list** | Index of makes + breadcrumbs                        | `/manufacturers` list page (OD-2427 surface): added `ManufacturerListPageSkeleton` (breadcrumb + H1 + description + brand grid placeholders, same footprint as the real layout — no CLS). Split the page's SSR `GET /Manufacturer` fetch into its own `ManufacturerListContent` server component wrapped in `<Suspense fallback={<ManufacturerListPageSkeleton />}>`, so a slow API streams the skeleton instead of blocking the whole route. SEO unaffected — Next.js serves crawlers (Googlebot etc.) the fully-resolved HTML (no streamed fallback), and `generateMetadata` already resolves independently of this boundary. |
| **Car brand page**  | One make: hero + L1 cards/tabs + L3 rows + scroll   | Not started (OD-2340).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Brand × L3**      | Make + one L3; similar to existing L3 category page | Not started (OD-2433).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

L3 click on the brand page goes to **brand × L3**, not only `search-results?categoryId=`.

---

## 1. Car brands list

- Index of makes (logo / name). Data from the **real brand API**, not dummy data.
- Breadcrumbs, e.g. Home / Car Makes. Last crumb is the current page (not a link).
- Closest listing today: `/{locale}/allbrands`. Replace or evolve that page; do not keep a test URL.
- Canonical / hreflang = **clean path** (no `carIds` / `vin`).
- Labels from branding, not hardcoded English “Car Makes”.

URL pattern TBD (examples only): `/{locale}/allbrands` or `/{locale}/car-brands`.

---

## 2. Car brand page (make details)

This is the main page from the last discussion.

### Content

- Breadcrumbs, e.g. Home / Car Makes / Fiat.
- Hero: real brand name, logo, description from **brand API** (not SVG placeholder / lorem).
- Categories: **L1 cards + L1 tabs + L3 rows**. **Do not show L2** (homepage / `/car-parts` stay L1 → L2).

### Category grouping

Tree is still `L1 → L2 → L3`. Display skips L2:

- Each L1 card / tab is an L1.
- Each row heading is that L1.
- Cards under a row are **all L3s** under that L1 (every L2’s children), **deduped by L3 id**.
- L3s come as `l2.children` on `GET /Category?parentId={l1Id}`. No extra L3 request.

Logic to reuse (if still on branch) or reimplement: flatten L1 with nested L3s, skip L2 names.

### Category data — SSR vs already-loaded tree

**Direct load / paste URL (server):**

- Page is a server component. Call **brand-scoped** category APIs so HTML contains only L1/L3s with Parts for this manufacturer.
- `GET /Category?brandId={manufacturerId}` then `GET /Category?brandId=&parentId={l1Id}` per L1.
- Helper: `fetchCategoryTreeForBrand(brandId)` in `next/services/categoryPageService.ts` (own Map cache per `brandId`, same TTL as global tree — does not overwrite `fetchCategoryTree`).
- Pass the tree into the client view as `initialCategories`.

**Coming from homepage / car-parts / other in-app pages:**

- **Do not** reuse global `useCategories()` on brand landing — that tree is unfiltered and would show empty Brand×L3 links again.
- Always render the SSR brand-filtered `initialCategories`.
- Revisiting the same brand (e.g. Fiat) within TTL hits the server `brandTreeCache` — no Category refetch for that `brandId`.

Skeleton only if the brand-filtered tree is still loading. If the tree is empty after
`GET /Category?brandId=`, the server **redirects** to search-results
(`categoryId=000000000` + `manufacturerIds={brand.id}`) — brand landing is not rendered.

### Scroll (keep this behaviour)

Different from homepage: homepage L1 click scrolls **to the tab bar** then shows **that L1’s L2s**. Brand page scrolls **to that L1’s L3 row**.

- Click L1 **card or tab** → select that L1 and smooth-scroll to `#…-l1-{id}` (600ms ease-in-out). Offset = sticky header height + tab bar height + small gap.
- Do **not** auto-scroll on first paint; only select the first L1.
- Tabs stick under the site header; selected tab = brand underline (same treatment as homepage L1 tabs).
- Scroll spy (`IntersectionObserver`) updates selected tab + L1 card `isActive` while the user scrolls. Ignore spy during programmatic scroll.
- Overflow tabs: selected tab scrolls horizontally into view.
- No L2 pills or L2 card grid under the tabs.

**Header offset:** real header is sticky in `next/screens/landing/header-row.tsx` and has **no** `id="site-header-sticky"`. Measure that node (or give it an id). Do not hardcode `108px`. Ribbon show/hide must move the offset.

Also watch: click-then-click race if a timeout clears the “programmatic scroll” flag while a second animation is running; short last L1 may not win spy if bottom `rootMargin` is aggressive.

### L3 click

Navigate to the **brand × L3** page (section 3). Preserve **`carId`** (brand manufacturer id) and `carIds` / `vin` when a car is selected.

---

## 3. Brand × L3 page (OD-2433)

- URL: `/{locale}/{car-parts-brands-seg}/{brand-slug}/{l3-slug}?carId={brandId}` (+ optional `carIds` / `vin`).
- L3 slug **from backend**, localized.
- SSR top products: `POST /Parts` with `manufacturerIds: [carId]` + `categoryId` (L3 id).
- Breadcrumb: Home / Car Part Brands / {Brand} / {L3}.
- H1: `{Brand} {L3}` + brand logo.
- Soft-404 when zero products; View all → search-results; product click → unchanged PDP.

Example: `/en-BE/car-parts-brands/bosch/air-filter?carId=AJzGJJJzGJJJzG`.

---

## 4. Breadcrumbs — crawlable paths, vehicle params not crawled

Reuse existing helpers. Do not invent a new SEO rule. See [OD-2300.md](./OD-2300.md).

**Contract:**

- Breadcrumb **paths** are crawlable and present **server-side** (real `href`s in HTML + JSON-LD, not JS-only).
- `?carIds`, `vin`, and similar vehicle params must **not** be what crawlers index.
- Users with a car selected may still have those params on the **visible** `<Link>` (session continuity), same as L1/L2/L3/PDP today.

| Concern                                             | Use                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Visible link may keep vehicle context               | `appendVehicleContextToHref` / `getVehicleContextFromSearchParams` — `next/utils/categorySearchUrl.ts`  |
| JSON-LD `BreadcrumbList` = clean URLs               | `cleanHrefForBreadcrumbSchema` — `next/utils/seoUrlParams.ts` (`OGBreadcrumb` already calls this)       |
| Visible href with vehicle params → `rel="nofollow"` | `shouldNofollowBreadcrumbHref` — same file / `OGBreadcrumb`                                             |
| Existing pattern                                    | `ProductDetailsBreadcrumb`, `SearchResultsBreadcrumb`, `CategoryL1ClientShell`, `CategoryL2ClientShell` |

`OGBreadcrumb` (`next/components/og-components/OGBreadcrumb.tsx`): JSON-LD uses cleaned hrefs; `<Link>` uses the real href and sets `rel="nofollow"` when needed.

**Gap vs product rule:** `seoUrlParams.ts` today strips / nofollows `carIds`, `makeModelTypeId`, and `from=brand`. Brand tree must also strip/nofollow **`vin`** and **`carId`** (manufacturer / part-brand id — **not** vehicle `carIds`).

Canonical / hreflang on all three brand routes = **clean path only**. User links: list → brand → L3 = clean paths (optional `carIds`/`vin` only). Manufacturer id is resolved from the brand slug on Brand+L3 (not a query param).

##### Query param glossary (final)

| Param         | Meaning                  | Example use                                                                               |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| **Path slug** | Brand public slug        | `GET /Manufacturer/slug/{slug}` → `id` used for Parts `manufacturerIds` and View-all SRP. |
| **`carIds`**  | Vehicle / Cars API id(s) | Search-by-car browsing context.                                                           |
| **`vin`**     | Optional VIN marker      | With vehicle context when applicable.                                                     |

```text
/en-BE/car-parts-brands/bosch
/en-BE/car-parts-brands/bosch/air-filter
/en-BE/car-parts-brands/bosch/air-filter?carIds=mod8…&vin=VF7…
```

Canonical / sitemap / JSON-LD = `/en-BE/car-parts-brands/bosch` or `/…/bosch/air-filter` (no query).

---

## 5. SEO checkpoints

Follow the same bar as highly SEO’d surfaces (product details, L1/L2/L3 category pages). Applies to **list**, **brand**, and **brand × L3**.

1. **Breadcrumbs crawlable, query-free for crawlers** — Real `<Link>` paths in HTML. Strip **any** search query params from what crawlers see (`?carId=…` brand id, `?carIds=…`, `?vin=…`, etc.). Brand SEO identity is the **path slug**; `carId` is for FE Parts filter only. JSON-LD / schema = clean path; visible user `href` may keep params with `rel="nofollow"` ([OD-2300](./OD-2300.md)). Extend strip/nofollow to include **`vin`** and **`carId`**.
2. **Static metadata** — `generateMetadata`: title / description / keywords from cockpit translations (`next/data/branding/labels.ts` + locale SEO seeds) merged with **server-side brand / category API** data. Canonical = clean path only.
3. **Hreflang + crawlable links** — `buildAlternateLanguages` / alternates like category + PDP. Every nav link crawlable and **SSR’d**; use Next.js `<Link>` (`<a>`), **never** `router.push` for SEO-facing navigation (breadcrumbs, L3 cards, brand list tiles).
4. **JSON-LD / schemas** — BreadcrumbList via `OGBreadcrumb` (clean `item` URLs). Extra schemas (Organization / Product / etc.) once API response is shared.
5. **One H1** — Exactly **one** `<h1>` / `Typography type="h1"` per page (brand name on brand page; list / L3 titles accordingly). Section titles = `h2`+.
6. **Skeleton / no CLS** — Match loaded layout heights. On dynamic routes use stable **`key`s** so skeletons remount correctly (same pattern as other catalog / PDP loadings). Prefer `loading.tsx` + in-page skeleton when data is empty/pending.

**Also follow (existing product SEO):**

- Pages **indexable** when content is real (no permanent `noindex` like the old test page).
- Open Graph / Twitter meta aligned with title, description, canonical URL.
- **Sitemap** — which pages are included (list / brand / brand × L3) is **TBD from the task tickets**; product will decide. When added, entries must be **clean paths only** (no `carIds` / `vin`).
- Meaningful content (H1, description, L1/L3 names) in **server HTML** on cold load — not client-only after JS.
- Images: real brand CDN art with proper `alt` (brand name); avoid empty decorative placeholders as the main visual for crawlers.
- `detectPage` / middleware so brand routes are not swallowed by `[searchdata]` and are not treated as search-results listings.

---

## 6. Out of scope (from the spike)

- Dummy Fiat, `/{locale}/car-brands-test`, permanent `noindex`.
- L3 → `search-results?categoryId=` as the only destination.
- Hardcoded English crumbs.
- Changing homepage / `/car-parts` L1→L2 browse.
- Page-local category cache.

---

## 7. Open (fill in after the flow walkthrough)

- Final URL patterns (list, make slug, brand×L3).
- Brand API path, response shape, locale fields, logo CDN.
- Whether list is `/allbrands` or a new path.
- Exact breadcrumb labels and whether brand×L3 includes L1 in the trail.
- Brand×L3: product grid vs L3-style CTA to search-results.
- Sitemap: which of list / brand / brand × L3 to include — **decide from task tickets**, then implement clean-path entries only.
  - **OD-2340**: brand landing pages = **yes** (static-pages sitemap, per brand × locale, slug in path).
  - **OD-2433**: brand + L3 pages = **yes** when populated; **empty** brand+L3 combos excluded (soft-404 / noindex).
  - **OD-2427** list page still TBD.
- `detectPage` / middleware so brand slugs are not swallowed by `[searchdata]`.

---

## Checklist (when implementing)

### List

- [ ] Renders for locale routes; breadcrumbs Home → list.
- [ ] Real brand API; crawlable links to each make (clean href in HTML).
- [ ] Canonical / hreflang without vehicle params.

### Brand page

- [ ] SSR category tree on cold visit; client cache when navigating from other pages.
- [ ] L1 cards + L1 tabs only; L3s flattened under each L1; L2 not shown.
- [ ] Card/tab click smooth-scrolls to that L1 row; spy + sticky tabs; overflow tab follows selection.
- [ ] Header offset tracks real sticky header (ribbon included).
- [ ] L3 click → brand×L3; `carIds`/`vin` on user href only when a car is selected.

### Brand × L3

- [ ] Similar to L3 catalog product grid; brand in breadcrumb.
- [ ] Canonical clean; vehicle params nofollow / stripped from JSON-LD.
- [ ] Soft-404 / noindex when zero products; excluded from sitemap.
- [ ] View all → search-results with brand + L3 + vehicle; product click → unchanged PDP URL.

### Breadcrumbs (all three)

- [ ] Server-rendered crawlable path links via `OGBreadcrumb`.
- [ ] JSON-LD without `carIds` / `vin`.
- [ ] `rel="nofollow"` when those params are on the visible href (`vin` included).

---

## 8. Sprint tickets (capture one by one)

Tickets arrive in random order. For each ticket: **gist**, **APIs**, **translations** (reuse existing keys from `next/data/branding/labels.ts` when present; only note new keys if the ticket requires them), **Figma** (paste later when implementing that page), **open questions**.

When all tickets are shared and you say **“tickets are done”**, a single **implementation flow** is generated so every ticket requirement is covered (list → brand detail → brand×L3, etc.).

### Process

1. Paste ticket N.
2. Gist + labels + APIs written below.
3. Ask for next ticket (or “tickets are done → generate flow”).
4. Before coding any page: pause for Figma + related APIs for that page, then continue.

### Ticket log

#### Ticket 1 — OD-2427: Update All Car Part Brands Page

**Epic:** **OD-2426** (car part brands tree)

**Epic hierarchy:**

1. **Car Part Brands Page** ← **OD-2427**
2. Car Part Brand Landing Page ← **OD-2340**
3. Car Part Brand + Category Landing Page ← **OD-2433**

> **Terminology note:** This is **part brands** (Bosch, Valeo, VOLVO vendor…), not vehicle makes (Fiat, BMW). Existing surface is `/manufacturers` (`ManufacturerBlock`), not `/allbrands` (car makes). Do not confuse the two trees.

**Gist**

- Enhance the existing manufacturers listing into the SEO **Car Part Brands** landing page.
- Rename customer-facing copy Manufacturers → **Car Part Brands**.
- New URL: `/{locale}/car-parts-brands` (localized slug; config-driven like current manufacturers segments).
- Breadcrumb: **Home > Car Part Brands** (translated).
- Keep listing behaviour already built: logos, names, homepage-style tooltips; filter brands with **product count > 0**.
- Each brand links to **Car Part Brand Landing Page**: **clean path slug only** — e.g. `/car-parts-brands/bosch` (**no** `?carId`). Optional vehicle: `carIds` / `vin` only. **Not** filtered catalogue / search-results.
- Dynamic list from API (no hardcoded brand names). Slug is **FE-generated** from `name` for the path. Brand id for Parts comes later from `GET /Manufacturer/slug/{slug}` (`id`) and is attached as `?carId=` only on **brand → L3**.
- **SSR:** list page calls `GET /Manufacturer` on the server so brand `<Link>`s are in the initial HTML for crawlers.
- SEO meta + intro copy block under H1 from translation keys.
- Hamburger nav unchanged.
- **Out of this ticket:** 301 from legacy `/manufacturers` → OD-2429.

**Page structure**

1. Breadcrumb
2. Page title (**one H1**)
3. SEO description block (`car_part_brands_description`)
4. Brand logo grid (links to brand landing)

**URL / locale slugs** (update `MANUFACTURERS_ROUTE_SEGMENT_BY_LANG` / related config — today still `manufacturers` / `fabrikant` / …)

| Lang | Slug                     |
| ---- | ------------------------ |
| en   | `car-parts-brands`       |
| nl   | `auto-onderdelen-merken` |
| fr   | `auto-pieces-marques`    |
| de   | `autoteile-marken`       |

Canonical app folder can stay rewrite-target style (same pattern as `manufacturers` → localized segment). Exact folder rename vs rewrite TBD at implement time.

**APIs**

- List: `GET /api/Manufacturer` via `getManufacturer()` / `useManufacturersQuery` (powers `ManufacturerBlock` + `/manufacturers`).
- Example item:

```json
{
  "id": "AJzGJJJzGJJJzG",
  "name": "VOLVO",
  "type": "OEM",
  "image": "https://cdn.ottogusto.group/vendors/AJzGJJJzGJJJzG.svg"
}
```

- Filter: only brands with published products (`product count > 0` — confirm field/rule on payload).
- Brand tile `href`: `/{locale}/{car-parts-brands-seg}/{fe-slug}` (+ optional `carIds` / `vin` when vehicle selected) — **no `carId` on list → brand**
  - FE slug from `name` via `slugifyManufacturerForPdp`: `VOLVO` → `volvo`, `RENAULT DACIA` → `renault-dacia`, `MAXGEAR` → `maxgear`.
  - Brand manufacturer `id` is loaded on the brand page via slug API; attach as `?carId=` only when linking to brand+L3.

**Translations**

| Key                                         | Status                                                                               | Where used                                                                                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `car_part_brands_description`               | **NEW** (ticket table — OG + QVerde EN/NL/FR/DE)                                     | Intro block under H1                                                                                                                                                                               |
| `seo.car_part_brands.title`                 | **NEW** (cockpit; add EN seed + locale fallbacks like `seo.all_brands.*`)            | `generateMetadata` title                                                                                                                                                                           |
| `seo.car_part_brands.description`           | **NEW** (cockpit; same)                                                              | `generateMetadata` description                                                                                                                                                                     |
| Breadcrumb / H1 label for “Car Part Brands” | Ticket says update from Part Manufacturer → Car Part Brands; **exact key not named** | Reuse/adapt existing: `part_manufacturers`, `shop_by_manufacturer_title`, `all_part_brand_manufacturers` **or** add e.g. `car_part_brands` if copy must be exactly “Car Part Brands” — **confirm** |
| `home`                                      | **EXISTS**                                                                           | Breadcrumb Home                                                                                                                                                                                    |

Do **not** reuse `seo.all_brands.*` / `all_brands` / `all_brands_parah` — those are **car makes** (`/allbrands`), different product.

Ticket EN/NL/FR/DE strings for `car_part_brands_description` (store-specific OG vs QVerde) — add to `labels.ts` + cockpit seeds when implementing; prefer cockpit as source of truth with label fallbacks.

**Reuse from codebase**

- Page shell: `app/(public)/[language-country]/manufacturers/page.tsx` + `screens/manufacturers/page.tsx` + `ManufacturerBlock`.
- Route segments: `config/url-segments.ts` (`MANUFACTURERS_ROUTE_SEGMENT_BY_LANG`, rewrite helpers).
- Routes helper: `Routes.manufacturers`.
- Homepage manufacturer tooltips / grid behaviour (ticket: reuse homepage tooltip).
- SEO pattern: `seoAllBrandsLocales` / manufacturers or car-parts `generateMetadata` (canonical + `buildAlternateLanguages`, clean path).
- Breadcrumb: `OGBreadcrumb` + OD-2300 (no vehicle params on crawlable schema; `<Link>` not `router.push`).
- Slug helper: `slugifyManufacturerForPdp` (`utils/legacyPartPdp.ts`).

**Acceptance (checklist)**

- [ ] Reachable at localized `/car-parts-brands` (etc.).
- [ ] Terminology Car Part Brands on this page.
- [ ] Breadcrumb Home > Car Part Brands (translated).
- [ ] Only brands with product count > 0.
- [ ] Logo + name + SSR crawlable link to brand landing (`/{slug}` clean path; + vehicle params if selected; new URL tree, not SRP/catalogue filter).
- [ ] Dynamic brands, no hardcoded names; FE-generated slugs.
- [ ] Meta title/description via `seo.car_part_brands.*`.
- [ ] Intro block via `car_part_brands_description`.
- [ ] Hamburger unchanged.
- [ ] Breadcrumb translations.

**Open questions (ticket + ours)**

1. Ticket: GA4 event on brand click?
2. Exact breadcrumb/H1 translation **key** for “Car Part Brands”?
3. Confirm API field / rule for product count > 0 on list.
4. Sitemap for this **list** page — still TBD (brand **detail** pages = yes per OD-2340).
5. Should `seo.car_part_brands.title` / `.description` EN+locale strings be supplied in a later ticket, or only keys for now?

**Figma / implement pause:** before coding this page, paste Figma + confirm list filter field for published brands.

---

#### Ticket 2 — OD-2340: Implement Car Part Brand Landing Page

**Depends on:** OD-2427 (list page + localized `/car-parts-brands` segment). Brand + Category page = OD-2433 (later ticket).

##### URL / query params

| Concern             | Rule                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brand in path**   | Slug for SEO + detail API (`GET /Manufacturer/slug/{slug}`).                                                                                       |
| **Brand id**        | From **`GET /Manufacturer/slug/{slug}`** response `id` — **not** required in the brand landing URL. Attach as `?carId=` only on links to brand+L3. |
| **Vehicle context** | Optional **`?carIds=…&vin=…`** (search-by-car). Path and breadcrumb never contain car name.                                                        |
| **Canonical**       | Clean brand path **without** `carId` / `carIds` / `vin` (SSR `<head>`).                                                                            |

Examples:

```text
/en-BE/car-parts-brands/bosch
/en-BE/car-parts-brands/bosch?carIds=mod8qzounygtrp&vin=VF7SABHY6GW595849
```

**Gist**

- New SEO page: `/{locale}/{car-parts-brands-seg}/{brand-slug}` (+ optional vehicle query only).
- Brand destination: vehicle selector, H1 + logo + description, L1 anchors + L3 grids (green link text), sticky L1 nav. SSR brand via slug API.
- L3 click → brand+L3 page (OD-2433) **with `?carId={brand.id}`** from slug API (+ `carIds` / `vin` if selected).
- Full SSR for SEO (curl-verifiable H1, description, category `<a href>`s).
- Path never contains brand **internal id** or car name; breadcrumb never contains car name.
- Canonical = clean brand path; strip all query params for crawlers / sitemap.
- **Sitemap: yes** — localized segment + slug only (no `carId` in sitemap).

**Page structure**

1. Vehicle selector (reuse from Car Parts page) — updates **`carIds`** / **`vin`** (brand id stays from slug API response, not required in this URL)
2. Breadcrumb: Home > Car Part Brands > {Brand name}
3. Brand header: **H1** (text) → logo left + short description right (Figma)
4. L1 category **image cards** grid (Figma: ~6 cols desktop / 3–2 mobile) — click scrolls to L1 section
5. Sticky L1 tab bar
6. Per-L1 sections: L1 heading + description + **dense L3 text links** (`color: var(--color-text-link, #006341)`) — no L3 images
7. **Recently viewed** (Ticket 4) — below all L3 sections; hidden when empty

**Category behaviour**

- Group **L3 under L1**; skip L2 UI.
- L1 card/tab → smooth-scroll to section; sticky tabs + scroll spy.
- L3 = `<Link>` to brand+L3 route with `?carId={brand.id}` from slug API (+ vehicle params).

**Routing / slug**

- Segment: OD-2427 localized map.
- Path slug: FE from `name` via `slugifyManufacturerForPdp`; detail via **`GET /Manufacturer/slug/{slug}`**.
- Brand landing URL has **no** `carId`. Use response `id` as `carId` when building brand→L3 links.

**Vehicle / brand / SEO**

| Concern          | Rule                                                     |
| ---------------- | -------------------------------------------------------- |
| Brand fetch      | Path slug → `GET /Manufacturer/slug/{slug}` (SSR)        |
| Brand filter id  | Response `id` → attach as `?carId=` on **brand→L3 only** |
| Vehicle selector | `carIds` / `vin`                                         |
| Canonical        | Clean path — strip `carId`, `carIds`, `vin`              |
| Crawlable links  | `<Link>`; OD-2300 strip/nofollow includes **`carId`**    |

**APIs**

- List: `GET /api/Manufacturer` (**SSR on list page**).
- Detail: `GET /api/Manufacturer/slug/{slug}` (fields: `id`, `name`, `type`, `image`, `slug`, `shortDescriptions`, `fullDescriptions`).
- Categories: `fetchCategoryTreeForBrand(brand.id)` SSR (cached per manufacturer id); client uses `initialCategories` only — not global `useCategories`.
- Vehicle: car-parts helpers; Brand → L3 links are **clean path** (optional `carIds`/`vin` only). Brand+L3 resolves manufacturer id from slug for Parts / View-all `manufacturerIds`.

**Translations** — unchanged (`seo.car_part_brands_brand.*`, list crumb, API descriptions).

**Reuse** — car-parts selector, L1 cards, sticky tabs/spy, `CategoryL3Card` without images **or** plain green text links per Figma, `slugifyManufacturerForPdp`, `OGBreadcrumb`, sitemap clean paths.

**Acceptance**

- [ ] `/car-parts-brands/{slug}` works (clean path); detail by slug API; use response `id` as `carId` on L3 links.
- [ ] Vehicle selector; `carIds`/`vin` optional; breadcrumb without car name.
- [ ] H1 + logo + description SSR; L1 grid + sticky tabs; L3 green links under L1.
- [ ] L3 → OD-2433 with `carId` (+ vehicle params).
- [ ] Recently viewed below L3s when available.
- [ ] Meta, canonical, hreflang, sitemap (slug only).

**Open questions**

1. ~~carId on brand landing URL?~~ — **no**. Resolve brand id from slug API; put `?carId=` on brand→L3 only (for Parts `manufacturerIds`).
2. ~~Category tree: full vs brand-filtered L3s?~~ — **brand-filtered** via `GET /Category?brandId=` (`fetchCategoryTreeForBrand`).
3. SEO title/description placeholders?
4. List FE slug vs API `slug` when both exist?
5. `shortDescriptions` locale shape?

**Figma:** Image 2–3 (brand landing). L3 link color `var(--color-text-link, #006341)`.

---

#### Ticket 3 — OD-2433: Implement Car Part Brand + Category Landing Page

**Epic:** OD-2426. **Depends on:** OD-2427 (list), OD-2340 (brand landing). Vehicle filter bug ref: **OD-2436**.

**Gist**

- SEO page: `/{locale}/{car-parts-brands-seg}/{brand-slug}/{l3-slug}` e.g. `/en-BE/car-parts-brands/bosch/brake-pads`.
- Brand + L3 context, vehicle selector, product grid, category SEO copy, PDP links unchanged.
- Entry: brand landing L3 click; or homepage/hamburger → brands → brand → L3.
- **Soft-404 guard:** clean URL with **zero products** → **404 or noindex**; **exclude from sitemap**. Only populated combos are indexable + sitemapped.

**URL / query params**

| Concern        | Rule                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **Path**       | `…/car-parts-brands/{brand-slug}/{l3-slug}` — localized prefix + brand slug + **backend L3 slug**        |
| **Brand slug** | FE / PDP `slugifyManufacturerForPdp` — not internal id in path                                           |
| **L3 slug**    | Backend localized slug                                                                                   |
| **`carId`**    | **Manufacturer id** from brand slug API (`id`) — required on this URL for Parts filter `manufacturerIds` |
| **Vehicle**    | Optional `carIds` / `vin`; path + breadcrumb unchanged                                                   |
| **Canonical**  | Clean path without query (SSR `<head>`)                                                                  |

> Jira sometimes labels vehicle as `carId` — **wrong**. Vehicle = **`carIds`**. Brand manufacturer = **`carId`**.

Examples:

```text
/en-BE/car-parts-brands/bosch/air-filter?carId=AJzGJJJzGJJJzG
/nl-BE/auto-onderdelen-merken/bosch/luchtfilter?carId=AJzGJJJzGJJJzG&carIds=mod8…&vin=VF7…
```

**Page structure**

1. Vehicle selector (reuse car-parts)
2. Breadcrumb: Home > Car Part Brands > {Brand} > {L3}
3. Header: **H1** `{Brand} {L3}` (text, SSR) + brand logo
4. Short description (below header, above products) — brand + L3 templates / category content approach (**TBD discuss**)
5. Product grid (reuse `CategoryL3TopPartsSection` / `OGProductcard` patterns)
6. Empty state when brand+L3 exists but **no compatible products** for selected vehicle — breadcrumb, H1, description stay visible (**UX TBD**)

**Breadcrumb**

- Home > Car Part Brands > Bosch > Brake Pads (translated labels).
- Vehicle selection does **not** change breadcrumb.
- Middle crumbs link to list + brand landing (clean paths; vehicle params on user href only per OD-2300).

**Product listing**

- Filter: selected **brand** + **L3** + **vehicle** (when selected); results update on vehicle change (OD-2436 behaviour like L3 page).
- Reuse existing product grid + product card.
- **Product click** → existing PDP URL / behaviour — **no change**.
- **View all** → search-results with brand + category + car (if selected) applied — **not** a new URL shape for PDP.

**SEO**

- SSR in raw HTML: H1, short description, product `<a href>` to PDPs. No full-page CSR bailout (follow L3 `Suspense` pattern for vehicle banner only if needed).
- Meta: `seo.car_part_brands_brand_category.title` / `.description` (cockpit).
- Canonical + hreflang in raw `<head>`; hreflang uses **localized prefix + brand slug + localized L3 slug** per locale.
- Verify via curl.

**APIs**

- **Brand:** `GET /api/Manufacturer/slug/{brand-slug}` (same as OD-2340); use response `id` / URL `carId` for Parts (`carId` should be present on brand+L3).
- **L3:** resolve by localized slug from category tree / detail (same as car-parts L3).
- **Products (top 8) — SSR like Category L3:** `POST /api/Parts` with **`manufacturerIds: [SELECTED_BRAND_ID]`** + **`categoryId: L3_ID`** (+ optional `carIds` when vehicle selected).

```json
{
  "vendorId": null,
  "search": null,
  "name": null,
  "oeReference": null,
  "makeModelTypeId": null,
  "categoryId": "L3_ID",
  "take": 12,
  "minPrice": null,
  "maxPrice": null,
  "manufacturerIds": ["SELECTED_BRAND_ID"],
  "order": "priority",
  "year": null,
  "availability": null,
  "manufacturerTypes": null,
  "carIds": null,
  "brandId": null,
  "cc": null,
  "fuel": null,
  "hp": null,
  "body": null,
  "doors": null,
  "variant": null,
  "language": "en",
  "continuationToken": null
}
```

- `SELECTED_BRAND_ID` = URL `carId` (from brand landing slug API `id` when the L3 link was built).
- `L3_ID` = resolved L3 category id.
- When vehicle selected, set `carIds` in payload (array / string per existing Parts client).
- Soft-404: zero products on clean URL → 404 or noindex; exclude from sitemap.

**Translations**

| Key                                                                       | Status                                    | Where                                      |
| ------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `seo.car_part_brands_brand_category.title`                                | **NEW** (cockpit)                         | `generateMetadata`                         |
| `seo.car_part_brands_brand_category.description`                          | **NEW** (cockpit)                         | `generateMetadata`                         |
| `home`                                                                    | EXISTS                                    | Breadcrumb                                 |
| Car Part Brands list label                                                | OD-2427 key TBD                           | Breadcrumb                                 |
| Brand name                                                                | Brand slug API                            | Breadcrumb + H1 (part 1)                   |
| L3 name                                                                   | Category API / tree                       | Breadcrumb + H1 (part 2)                   |
| Short description                                                         | Category + brand template / API (**TBD**) | Body copy                                  |
| `no_results_l3_title` / `no_results_l3_description` / `no_results_l3_cta` | **EXISTS**                                | Empty state (reuse or extend for brand+L3) |

**Reuse from codebase**

- Vehicle selector / banner from car-parts + `CategoryL3DynamicHeader` Suspense pattern.
- Products: `CategoryL3TopPartsSection` / `CategoryL3TopPartsSectionServer`, `OGProductcard`, `buildPartPdpHrefFromPathname`.
- Category L3 page shell patterns: `CategoryL3ClientShell`, L3 metadata helpers.
- Breadcrumb: `OGBreadcrumb` + vehicle append helpers.
- Brand slug: `slugifyManufacturerForPdp`; L3 slug from category `slugs[locale]`.
- Search-results link: `appendCategorySearchQuery` + manufacturer/brand filter (**confirm param**: today `manufacturerIds` on some surfaces — align with new brand tree).

**Acceptance (checklist)**

- [ ] `…/car-parts-brands/{brand}/{l3}` works per locale (localized L3 slug).
- [ ] Vehicle selector; `carId` kept; `carIds` / `vin` optional; path + breadcrumb without car name.
- [ ] Breadcrumb Home > Car Part Brands > brand > L3.
- [ ] H1 `{Brand} {L3}`, logo, short description in SSR HTML.
- [ ] Top products via SSR `POST /Parts` with `manufacturerIds` + `categoryId` (+ `carIds` if vehicle); grid/card reused; PDP URLs unchanged.
- [ ] View all → search-results with brand + category + car filters.
- [ ] Empty state when vehicle selected but no compatible products (UX pending).
- [ ] Meta keys; canonical + hreflang; SSR product links.
- [ ] Zero-product combo: 404 or noindex; **not** in sitemap.
- [ ] Populated combos in static-pages sitemap per locale.

**Open questions (ticket + ours)**

1. Brand + L3 description: different content per store?
2. Product count on page?
3. GA4 events?
4. Short description templates — “need to discuss”.
5. Empty-state UX.
6. View all query params (`manufacturerIds` / `categoryId` / `carIds`).
7. Figma “People also looked” / related L3 block — in scope for Phase 1?

**Figma:** Image 4 (brand L3) — vehicle banner, H1, top 8 cards, View all, related categories.

---

#### Ticket 4 — Recently Viewed on Car Part Brand landing page

**Parent page:** Car Part Brand landing (**OD-2340**; Jira also refs **OD-2430**). Phase 1 add-on — **no new recently-viewed logic**.

**Gist**

- Reuse existing **Recently Viewed Products** block on the brand landing page.
- **Placement:** below **all L3 category sections** (after last L1/L3 row).
- **Visibility:** render **only** when `recentlyViewed.length > 0`; otherwise **hidden** (no empty shell).
- Do **not** change store, persistence, or PDP write logic.

**Behaviour**

| Rule      | Detail                                                                                  |
| --------- | --------------------------------------------------------------------------------------- |
| Component | Existing `RecentlyViewedSection`                                                        |
| Data      | `useRecentlyViewedProductStore` (`recently-viewed-storage` in localStorage)             |
| UI        | `Productfrequentlybought` carousel/grid inside section                                  |
| Logic     | Unchanged — same as L1/L2/L3 category pages                                             |
| SSR / SEO | Client-only block (same as category pages); hidden when empty → no CLS from empty block |

**Reuse from codebase**

- `next/screens/category/RecentlyViewedSection.tsx` — returns `null` when no items.
- Dynamic import pattern from `CategoryL3Page.tsx`:

```tsx
const RecentlyViewedSection = dynamic(() => import("@/screens/category/RecentlyViewedSection"), {
  loading: () => <RecentlyViewedSkeleton />,
  ssr: false,
});
// …after all L1/L3 category rows:
<RecentlyViewedSection />;
```

- Skeleton: `RecentlyViewedSkeleton` from `CategorySkeletons.tsx` (optional in brand page `loading.tsx` if matching category layout).
- Store: `useRecentlyViewedProductStore` / `useRecentlyViewedHydrated` (PDP adds items — no change).

**Translations**

- Reuse labels already used inside `Productfrequentlybought` / recently viewed on category pages — **no new keys** expected.

**Acceptance (checklist)**

- [ ] Recently viewed appears on brand landing **below** all L3 sections when user has history.
- [ ] Section **hidden** when no recently viewed products.
- [ ] No changes to recently viewed store or PDP tracking.
- [ ] Same look/behaviour as L3 category page block.

**Open questions**

1. Figma spacing vs L3 sections — **paste Figma** when implementing.
2. Confirm OD-2430 vs OD-2340 ticket id for same brand landing page.

**Figma / implement pause:** paste Figma for placement/spacing on brand landing (with OD-2340 Figma).

---

## 9. Figma reference (attached screens)

| Image   | Page                                   | Notes                                                                                                                                                                                                  |
| ------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1**   | Car Part Brands **list** (OD-2427)     | Breadcrumb Home / Car Part Brands; H1 + back; intro copy; circular brand logo grid (~8/row desktop, ~2 mobile); SSR `GET /Manufacturer`; click → brand landing clean slug (no `carId`)                 |
| **2–3** | Brand **landing** (OD-2340 + Ticket 4) | Breadcrumb Home / Car Part Brands / Brand; H1 + logo + description; L1 image cards; sticky L1 tabs; per-L1 L3 **green text links** `color: var(--color-text-link, #006341)`; recently viewed below L3s |
| **4**   | Brand **+ L3** (OD-2433)               | Vehicle selector banner; H1 `{Brand} {L3}`; short description; top 8 product cards (SSR Parts); View all; “People also looked” related L3s (confirm scope)                                             |

---

## 10. End-to-end implementation flow

Implement in this order so each page has its dependencies. Pause for Figma/API confirmation before coding each page if anything is still open.

### Phase 0 — Shared foundation (do first)

1. **Route segments** — Update `MANUFACTURERS_ROUTE_SEGMENT_BY_LANG` (and rewrites / `Routes`) to localized car-parts-brands slugs (en/nl/fr/de from OD-2427). Canonical app folder rewrite pattern like today.
2. **Query helpers** — Glossary: `carId` = brand manufacturer id (on **brand→L3 only**); `carIds` / `vin` = vehicle. Extend `seoUrlParams` strip/nofollow for **`carId`** + **`vin`**. Preserve `carId` when appending vehicle context on brand→L3 links.
3. **Slug helper** — Reuse `slugifyManufacturerForPdp` for brand path segments.
4. **Brand services** — `GET /Manufacturer` (list); `GET /Manufacturer/slug/{slug}` (detail). Map list → `{ id, name, image, feSlug }`.
5. **Labels / SEO seeds** — Add/reuse keys: `car_part_brands` (H1/crumb TBD), `car_part_brands_description`, `seo.car_part_brands.*`, `seo.car_part_brands_brand.*`, `seo.car_part_brands_brand_category.*` (store-specific OG/QV where ticket supplied). Prefer existing `labels.ts` keys when copy matches.
6. **`detectPage` / middleware** — Register brand list / brand / brand+L3 so `[searchdata]` does not swallow them; not search-results listings.
7. **SEO baseline** — Every page: one H1, `generateMetadata` + clean canonical + `buildAlternateLanguages`, `OGBreadcrumb` + JSON-LD clean URLs, SSR crawlable `<Link>`s (no `router.push` for nav), skeletons / keys for no CLS.

### Phase 1 — OD-2427 Car Part Brands list (Figma image 1)

1. Evolve `/manufacturers` → `/car-parts-brands` (localized).
2. Page: breadcrumb Home > Car Part Brands; H1; intro `car_part_brands_description`; logo grid.
3. Data: **SSR** `GET /Manufacturer` in the list page; filter product count > 0; FE slug from name; pass list into the grid so crawlers see `<a href>`s.
4. Each tile: `<Link href="/{locale}/{seg}/{slug}">` (+ `carIds`/`vin` if vehicle already selected) — **no `carId`**.
5. Meta `seo.car_part_brands.*`; indexable; clean canonical.
6. Hamburger / homepage “view all brands” → new URL.
7. **Out of phase:** OD-2429 301 from `/manufacturers` (separate ticket).

### Phase 2 — OD-2340 Brand landing (Figma images 2–3) + Ticket 4

1. Route: `/{locale}/{seg}/[brandSlug]` — **clean path** (no `carId` required on this URL).
2. SSR: brand via `GET /Manufacturer/slug/{slug}` (use response `id` as brand manufacturer id); category tree via `fetchCategoryTreeForBrand(brand.id)` (per-brandId cache).
3. UI: vehicle selector; breadcrumb; H1 + logo + `shortDescriptions`; L1 cards; sticky L1 tabs + scroll spy; L3 green links under each L1 (`--color-text-link`).
4. L3 `<Link>` → `/{seg}/{brandSlug}/{l3Slug}` (+ vehicle params only; manufacturer id from slug on Brand+L3).
5. Ticket 4: `RecentlyViewedSection` below all L3 rows; hide if empty.
6. Meta `seo.car_part_brands_brand.*`; hreflang; sitemap entry per brand × locale (path only).
7. Skeletons matching layout (header + L1 grid + tabs + rows).

### Phase 3 — OD-2433 Brand + L3 (Figma image 4)

1. Route: `/{locale}/{seg}/[brandSlug]/[l3Slug]`.
2. Resolve brand (slug API) + L3 (localized slug → category id).
3. SSR `POST /Parts` with `manufacturerIds: [brand.id from slug]`, `categoryId: L3_ID`, `take`/`order` like L3 top parts; include `carIds` when vehicle selected (OD-2436 behaviour).
4. UI: vehicle banner; breadcrumb Home > Car Part Brands > Brand > L3; H1 `{Brand} {L3}` + logo; short description; product grid (reuse cards); View all → search-results with **`manufacturerIds={brand.id}`** + category + car; product click → **unchanged PDP URL**.
5. Soft-404: zero products → 404 or noindex; exclude from sitemap.
6. Meta `seo.car_part_brands_brand_category.*`; hreflang with localized L3 slug; sitemap only populated combos.
7. Related “People also looked” if in Figma scope.

### Phase 4 — Cross-cutting SEO & polish

1. Sitemap: list (if ticketed) + all brands + populated brand+L3; clean paths only.
2. OD-2429 301 legacy manufacturers → car-parts-brands.
3. Curl / GSC checks: H1, description, `<a href>` present without JS; canonical in raw `<head>`; noindex empty brand+L3.
4. CLS: `loading.tsx` + in-page skeletons; dynamic route `key`s.
5. Extend OD-2300 helpers for `carId` / `vin` everywhere on this tree.

### User journey (happy path)

```text
Home / hamburger
  → Car Part Brands list  (/{seg})                    SSR GET /Manufacturer
  → click Bosch           (/{seg}/bosch)              clean path; SSR GET /Manufacturer/slug/bosch → id
  → scroll / pick L3      (/{seg}/bosch/air-filter)   clean path; slug → brand.id
  → top 8 Parts SSR       (manufacturerIds: [brand.id] + categoryId)
  → View all              (/search-results?…&manufacturerIds={brand.id}&categoryId=…)
  → product → PDP (unchanged)  OR  View all → search-results
```

### Implementation order checklist

- [ ] Phase 0 shared infra (routes, `carId` helpers, services, labels, detectPage)
- [ ] Phase 1 list page (OD-2427) — Figma 1
- [ ] Phase 2 brand landing (OD-2340) + recently viewed (Ticket 4) — Figma 2–3
- [ ] Phase 3 brand+L3 (OD-2433) + Parts SSR — Figma 4
- [ ] Phase 4 sitemap, 301, SEO verification, CLS
