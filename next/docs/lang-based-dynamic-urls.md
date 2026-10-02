# Language-based dynamic URL segments (car parts)

## Task summary

Unify **car-parts** routing so Category Catalog, Category L1/L2/L3, and Product/Part detail pages no longer require **one physical App Router folder per language**. Today each locale uses its own path segment (for example `car-parts` for English, `auto-onderdelen` for Dutch, `pieces-auto` for French) under `next/app/(public)/[language-country]/`, which forces duplicate folders and copy-paste when adding locales or changing behavior.

**Goal:** drive those URLs from **central route constants** (locale → URL segment) while keeping the **same functional URLs and SEO behavior** as today. **Constraint:** **no existing SEO logic must regress**, and **no code paths should break** during rollout—changes must be additive or safely migrated with parity checks.

**Documentation:** category SEO and routing behavior for catalog/L1–L3 remains documented in [`categorypages-seo.md`](./categorypages-seo.md). This document focuses on **URL structure and the consolidation plan** for car-parts routes.

---

## Current routing layout (reference)

- App Router base: `next/app/(public)/[language-country]/`
- **Single implementation tree:** `car-parts/` (catalog, `category/[l1]/…`, `[partname]/[partid]`).
- **Localized URL segments** (`auto-onderdelen`, `pieces-auto`, `autoteile`, `categorie`, `kategorie`, …) are handled via **`rewriteLocalizedPartsUrlToCanonicalAppPath`** in [`config/url-segments.ts`](../config/url-segments.ts) + [`middleware.ts`](../middleware.ts) — no duplicate folders under `auto-onderdelen/` or `pieces-auto/`.

Related env lists for supported languages: `next/.env.local`, `next/.env.ottogusto.main`.

---

## Target URL shapes (English examples)

| Page                   | URL pattern (EN)                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Category catalog       | `/[lang-country]/car-parts?makeModelTypeId=00a00000000000000`                           |
| L1 / L2 / L3 category  | `/[lang-country]/car-parts/category/L1/L2/L3?makeModelTypeId=00a00000000000000`         |
| Part / product details | `/[lang-country]/car-parts/fiat-group/m3hls6q42403g7?makeModelTypeId=00a00000000000000` |

Other locales use the **same path structure**, with segments translated per locale (see constants below), not different folder trees per language.

---

## Problem

1. **New language:** each new locale in env requires **new duplicate** `app` route folders and parallel files.
2. **Logic changes:** fixes or features must be **replicated** across every language-specific folder—error-prone and not scalable.

---

## Proposed approach

### 1. Central route segment map (`next/constants.tsx`)

Store **locale → path segment** for shared logical routes. Initial scope: **car-parts root** and **category sub-segment**.

**Example — car parts root segment:**

```ts
car-parts: {
  en: "car-parts",
  nl: "auto-onderdelen",
  fr: "pieces-auto",
  de: "autoteile",
}
```

**Example — category sub-route segment:**

```ts
category: {
  en: "category",
  nl: "categorie",
  fr: "categorie",
  de: "kategorie",
}
```

Helpers (to be introduced alongside implementation) should resolve the **active locale’s** segments for links, `redirect()`, middleware matchers, and canonical/alternate URLs—always reading from this single source of truth.

### 2. Phased rollout

- **Now:** define constants and wire **car-parts** + **category** sub-paths for catalog, L1–L3, and product detail URLs as above.
- **Later:** extend the same pattern to other multi-segment routes so new languages do not multiply folders.

---

## Non-goals / guardrails

- **Do not** change SEO semantics (query params such as `makeModelTypeId`, category hierarchy in path, part slug patterns) unless a dedicated SEO task says otherwise.
- **Do not** break existing bookmarks or indexed URLs: old paths may need **rewrites/redirects** or a single dynamic catch-all—implementation must preserve **external URL compatibility**.
- **Verify** parity with [`categorypages-seo.md`](./categorypages-seo.md) behaviors (e.g. `createRoute`, MME slug usage, catalog vs non-catalog behavior).

---

## References

- Category pages SEO & routing notes: [`next/docs/categorypages-seo.md`](./categorypages-seo.md)
- App Router public segment: `next/app/(public)/[language-country]/`
- Env-driven locales: `next/.env.local`, `next/.env.ottogusto.main`
- Route builders & per-language switches today: [`next/config/routes.ts`](../config/routes.ts) (`Routes.parts`, `categorySelection`, `categoryL1`–`categoryL3`)
- PDP / URL-shape logic: [`next/middleware.ts`](../middleware.ts) (`parsePdpCandidate`, `getPartsRouteSegmentForLang` via [`url-segments.ts`](../config/url-segments.ts), canonical 301 behavior)
- Scattered “known parts URL segment” lists (must converge on constants): e.g. `categorySlugs` in product/search components
- **Implemented:** `next/config/url-segments.ts` (parts + category segment maps and helpers; used by `config/routes.ts`, `middleware.ts`, `utils/hreflang.ts`, and pathname detection)
- **NL / FR / DE (and any mapped locale):** public segments differ (`auto-onderdelen`, `pieces-auto`, `autoteile`, `categorie`, `kategorie`, …); middleware **rewrites** to **`car-parts` / `category`** — only those folders exist under `app/`. Configure languages via `NEXT_PUBLIC_LANGUAGES` / `NEXT_PUBLIC_LANG_COUNTRY_COMBINATIONS` as needed.

---

## Implementation plan (no breakage, SEO-safe)

### Principles

1. **URL parity first** — For each supported locale, the **public URL** for catalog, category L1–L3, and PDP must remain **character-for-character identical** to today unless Product/SEO explicitly approves a change. Treat current behavior as the regression baseline.
2. **Single source of truth** — All segment strings (`car-parts` / `auto-onderdelen` / … and `category` / `categorie` / …) come from **one map** keyed by language (and later by store if needed). [`config/routes.ts`](../config/routes.ts) switches and [`middleware.ts`](../middleware.ts) string checks must **not** drift from that map.
3. **Refactor for equivalence** — First refactor reads the map but emits the **same strings** as today; ship and verify. Only then add rewrites / folder consolidation.
4. **SEO-sensitive surfaces** — Pay extra attention to:
   - **Canonical URLs**, **`hreflang` / alternate links**, **breadcrumbs** ([`ProductDetailsBreadcrumb`](../screens/productdetails/ProductDetailsBreadcrumb.tsx), category pages).
   - **301 vs 302** — Middleware already uses **301** for PDP canonicalization in defined cases; do not change status codes or destination shapes without an audit.
   - **Legacy / migration redirects** — e.g. `QVERDE_301_MAP` in middleware: targets must stay aligned with locale-correct parts segments after constants land.
5. **Fail open** — Middleware PDP block uses try/catch and “fail open”; preserve that so a bug in new helpers does not take the site down.

### Phase 0 — Inventory & baseline (before code moves)

- [ ] List **exact** per-locale paths for: parts root, category prefix, L1/L2/L3 examples, PDP (`/{locale}/{parts}/{brand}/{partId}`), plus query patterns (`makeModelTypeId`, `categoryIds`, etc.).
- [ ] Capture **current** `Routes.*` outputs for `en-BE`, `nl-BE`, `fr-BE` (and any other `LANG_COUNTRY_COMBINATIONS`) from [`config/routes.ts`](../config/routes.ts).
- [ ] Note **middleware** behaviors: `parsePdpCandidate` accepted segments, `expectedPartsRouteForLang`, redirect to `DEFAULT_PDP_BASE` vs locale-aware canonical.
- [ ] From [`categorypages-seo.md`](./categorypages-seo.md), confirm `createRoute` / `viewMMECategory` / catalog vs non-catalog rules—implementation must not change those semantics.

### Phase 1 — Central segment map (behavior-identical refactor) — **implemented**

- [x] Introduce maps in [`config/url-segments.ts`](../config/url-segments.ts): `PARTS_ROUTE_SEGMENT_BY_LANG`, `CATEGORY_ROUTE_SEGMENT_BY_LANG`, helpers (`getPartsRouteSegmentForLang`, `getCategoryRouteSegmentForLang`, `isKnownPartsRouteSegment`, `pathnameIncludesPartsRouteSegment`).
- [x] Replace **inline switches** in [`config/routes.ts`](../config/routes.ts) (`parts`, `categorySelection`, `categoryL1`–`categoryL3`) with those helpers (same emitted paths as before).
- [x] Replace hardcoded “parts root” lists in consumers (`detectPage`, products, saved-car dropdown, category-locale-redirect API, etc.) with the shared constants / helpers.
- [x] Update [`middleware.ts`](../middleware.ts): `parsePdpCandidate` uses `isKnownPartsRouteSegment`; PDP redirects use `getPartsRouteSegmentForLang` and `PartsRouteSegment`; `QVERDE_301_MAP` / `DEFAULT_PDP_BASE` derive segments from the same helpers.
- [x] Update [`utils/hreflang.ts`](../utils/hreflang.ts) to build segment translation and category alternates from [`url-segments.ts`](../config/url-segments.ts).

**Exit criteria:** Automated or manual diff of generated URLs vs Phase 0; smoke test PDP, category L3, catalog with query strings; no new 301 loops (`redirect-helper`).

### Phase 2 — Physical route consolidation (folder reduction) — **implemented**

**Goal:** one implementation under **`car-parts`** while **public** URLs stay locale-specific.

- [x] **`middleware` `NextResponse.rewrite()`** via **`rewriteLocalizedPartsUrlToCanonicalAppPath`** maps localized parts + category segments → **`car-parts` / `category`** (NL, FR, DE, any future mapped lang).
- [x] Rewrite runs early; query string preserved on the cloned URL.
- [x] Removed duplicate **`auto-onderdelen`** and **`pieces-auto`** trees under `app/(public)/[language-country]/`.

**SEO note:** User-visible URL stays localized. Rewrites are **internal**; avoid unnecessary **301** chains for URLs that already match the intended public form.

_(Details and “add a new language” steps: see **What we implemented** and **How to add support for a new language** at the end of this file.)_

### Phase 3 — Adding a new language (validation)

- [ ] Add env entries per existing process.
- [ ] Add one row to the segment map (parts + category); **no new folder copy** if Phase 2 rewrites + single tree are in place.
- [ ] Extend middleware language normalization only if the new locale appears in `LANG_COUNTRY_COMBINATIONS` / routing—keep fallbacks explicit.

### Verification checklist (release gate)

| Area                      | Check                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Links**                 | `Routes.parts`, `categoryL1`–`L3`, `getRouteLocaleString` produce same URLs as Phase 0 for each locale                                |
| **PDP**                   | Correct locale segment; middleware 301 to canonical only when rules already intended (malformed / mismatch); 302 on API 404 unchanged |
| **Category catalog**      | Query params preserved; [`categorypages-seo.md`](./categorypages-seo.md) flows (MME slug, `makeModelTypeId`) intact                   |
| **hreflang / alternates** | Part pages and listing pages still emit correct language-country bases (`buildAlternateLanguages` / metadata)                         |
| **Legacy redirects**      | `QVERDE_301_MAP` and any marketing paths still land on correct locale-specific parts roots                                            |
| **Crawler**               | No accidental `noindex` / duplicate canonical; optional Search Console spot-check for key templates                                   |

### Rollback

- Phase 1 is low risk if outputs are verified equal; rollback = revert the constants refactor commit.
- Phase 2: keep rewrites behind a short QA window; disable rewrites to restore previous folder-based routing if needed.

---

## Appendix: Next.js constraint (category vs part sibling)

You cannot mount two **different** dynamic sibling folders `[partname]` and `[category]` at the same path level—both would compete for one URL segment. Acceptable patterns:

- **Literal + dynamic:** `category/...` (or localized segment via rewrite) alongside `[partname]`.
- **Single dynamic segment** whose first subsegment is resolved against `CATEGORY_ROUTE_SEGMENT[lang]` (category flow) else part flow.
- **Rewrites** from localized category words to the internal literal folder name.

This is why consolidation relies on **constants + rewrites**, not multiple copies of `categorie` / `kategorie` folders with duplicated code.

---

## What we implemented (change log — plain English)

Think of **two layers**:

1. **What the user sees in the browser** — translated path words (e.g. Dutch `auto-onderdelen`, German `autoteile`).
2. **What Next.js actually runs** — one folder tree only: **`car-parts`** and **`car-parts/category/…`** plus **`car-parts/[partname]/[partid]`**.

**How those stay in sync**

| Piece                                                                                                | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`next/config/url-segments.ts`](../config/url-segments.ts)                                           | **Single source of truth:** for each language code (`en`, `nl`, `fr`, `de`, …) defines the **public** slug for “parts hub” and for “category under parts”. Also defines **canonical** folder names (`car-parts`, `category`) and **`rewriteLocalizedPartsUrlToCanonicalAppPath`**, which turns public URLs into internal paths before routing.                                                                                                                 |
| [`next/config/routes.ts`](../config/routes.ts)                                                       | **Link builders:** `Routes.parts`, `categorySelection`, `categoryL1`–`categoryL3` read from `url-segments` so every generated link uses the **correct public** slug per locale.                                                                                                                                                                                                                                                                                |
| [`next/middleware.ts`](../middleware.ts)                                                             | Early **rewrite**: if the URL uses a localized parts slug or localized category slug, it is rewritten internally to **`/…/car-parts/…`** and **`…/category/…`** so only one App Router implementation is needed. **Headers like `x-current-path` stay on the original (public) path** where we set them for the rewrite response. PDP “wrong URL” handling still uses **`isKnownPartsRouteSegment`** / **`getPartsRouteSegmentForLang`** from the same config. |
| [`next/utils/hreflang.ts`](../utils/hreflang.ts)                                                     | **Alternate language URLs:** builds correct per-locale paths for **`buildAlternateLanguages`** and category helpers; **`PARTS_LANGS`** must include every language you want fully translated in that matrix; `translatePath` also swaps the **category** keyword after the parts segment when needed.                                                                                                                                                          |
| [`next/app/(public)/[language-country]/car-parts/`](<../app/(public)/[language-country]/car-parts/>) | **Only** this tree serves catalog **page**, category **L1/L2/L3** pages, and **part detail** pages. Duplicate folders **`auto-onderdelen`** and **`pieces-auto`** were removed; they are not required anymore.                                                                                                                                                                                                                                                 |
| [`next/utils/detectPage.ts`](../utils/detectPage.ts)                                                 | Knows **all** localized parts-route slugs and **category** keywords (`category`, `categorie`, `kategorie`, …) so client logic still classifies catalog vs PDP vs category levels from the **visible** pathname.                                                                                                                                                                                                                                                |

---

## How the **`category` sub-route** works (`/car-parts/category` → category section)

Under the parts hub there are **three** page families. After **`/{locale}/`** comes the **parts** segment (`car-parts`, `auto-onderdelen`, …). After that:

- **only query string** (or end of path) → **category catalog**;
- **`category` / `categorie` / `kategorie` + slugs** → **L1 / L2 / L3 category section**;
- **something that is not a category keyword + part id** → **product details (PDP)**.

### 1) Category hub / browse tree (L1, L2, L3)

- **English (what you see):**  
  `/[locale]/car-parts/category/[l1]`  
  `/[locale]/car-parts/category/[l1]/[l2]`  
  `/[locale]/car-parts/category/[l1]/[l2]/[l3]`

- **Other languages (localized words in the browser):** the **middle** segment is translated, e.g. **`categorie`** (nl/fr) or **`kategorie`** (de). Example:  
  `/nl-BE/auto-onderdelen/categorie/motor/...`

So **`category`** (and its translations) is **not** a mystery string — it marks “you are inside the **category taxonomy**”, not the part-detail flow.

### 2) How Next.js folders map to that

Only **one** filesystem branch is used:

- **`app/(public)/[language-country]/car-parts/category/[l1]/...`** → L1 / L2 / L3 screens.

The folder name is always the English literal **`category`**, because Next needs a **fixed** segment next to **`[partname]`**:

- **`car-parts/category/...`** = category tree routes
- **`car-parts/[partname]/[partid]`** = product detail routes

If the middle word were only dynamic, Next could not reliably tell a **part slug** from a **category slug** at the same depth (see [Appendix](#appendix-nextjs-constraint-category-vs-part-sibling) below).

### 3) Localized words → `category` (middleware)

When the user opens **`.../categorie/...`** or **`.../kategorie/...`** (after the localized parts word), **middleware** runs **`rewriteLocalizedPartsUrlToCanonicalAppPath`** ([`url-segments.ts`](../config/url-segments.ts)).

- It rewrites the **third** URL segment from the localized category word to **`category`** **only when** that segment is one of the configured values in **`CATEGORY_ROUTE_SEGMENT_BY_LANG`** (or any known category keyword tracked there).
- Internal request becomes: **`/[locale]/car-parts/category/...`**, which matches the **real** route files.
- The **address bar** still shows the localized path (e.g. **`categorie`** / **`kategorie`**) — good for SEO and bookmarks.

English paths that already use **`/car-parts/category/...`** need **no** rewrite for the category word.

### 4) Catalog root (no `category` segment yet)

- **`/[locale]/car-parts`** (or **`auto-onderdelen`**, **`pieces-auto`**, **`autoteile`**, …) = **category catalog** landing (browse tiles, `makeModelTypeId` in query, etc.).
- That is served by **`car-parts/page.tsx`**, not by the `category/[l1]` folder.

### 5) Part details (no `category` in the middle)

- **`/[locale]/[parts-word]/[something]/[partId]`** where the third segment is **not** a category keyword → treated as **PDP** (`[partname]` + `[partid]` under `car-parts` after rewrite).

**Helper:** [`detectPage()`](../utils/detectPage.ts) uses **`isCategoryPathSegment()`** from **`url-segments`** so it understands **`category` / `categorie` / `kategorie`** on the **visible** pathname and returns **`category-l1`**, **`category-l2`**, **`category-l3`**, **`category-catalog`**, or **`product-details`** accordingly.

### 6) Links in code

**`Routes.categoryL1`**, **`categoryL2`**, **`categoryL3`** in [`routes.ts`](../config/routes.ts) build the **public** URL per locale (localized parts word + localized category word). Avoid hard-coding **`/car-parts/category`** unless English-only.

---

**Important:** After this work, **you do not create** new `app/.../[your-lang-word]/` folders for parts URLs. You only update **constants + env (+ a few lists)** as below.

---

## How to add support for a **new language** (step by step)

Use this when Product/SEO agrees on:

- **`{lang}`** — two-letter language code (`it`, `es`, …).
- **Parts URL word** — the segment after `/{locale}/` for catalog & PDP root (similar role to `car-parts`).
- **Category URL word** — the segment **after** the parts word for L1/L2/L3 (similar role to `category` / `categorie` / `kategorie`).

### Step 1 — Register the language in **`url-segments.ts`**

Open [`next/config/url-segments.ts`](../config/url-segments.ts).

1. Add the new code to **`PartsLangKey`** (e.g. `| "it"`).
2. Add one line to **`PARTS_ROUTE_SEGMENT_BY_LANG`** with the **public** parts slug (ASCII slug you want in URLs).
3. Add one line to **`CATEGORY_ROUTE_SEGMENT_BY_LANG`** with the **public** category slug.
4. In **`normalizePartsLangKey`**, map the first part of `{lang}-{country}` to that code (e.g. `if (key === "it") return "it"`; unknown languages should keep falling back the way your product expects — today non‑matching keys behave like **`en`** for segments).

Nothing else is required in `url-segments` for routing: **`ALL_PARTS_ROUTE_SEGMENTS`** and rewrite logic update automatically.

### Step 2 — Make **`hreflang` / alternates** aware of the new language

Open [`next/utils/hreflang.ts`](../utils/hreflang.ts).

1. Append the new **`lang` code** to the **`PARTS_LANGS`** array (same union as parts languages you expose in alternates).

If you skip this step, **`buildAlternateLanguages`** may not emit the right path for that language on PDP/catalog/category metadata.

Category-specific helpers (**`buildCategoryAlternateLanguages`**, L2/L3 variants) already use **`getPartsRouteSegmentForLang`** / **`getCategoryRouteSegmentForLang`**; they pick up new maps automatically once **`LANG_COUNTRY_COMBINATIONS`** contains locales starting with `{lang}-`.

### Step 3 — Make **locales** exist end-to-end (env + defaults)

1. **`NEXT_PUBLIC_LANGUAGES`** — include `{ "it": "Italiano", … }` (or rely on **`DEFAULT_ENV_LANGUAGES`** in [`next/constants.tsx`](../constants.tsx) for local defaults).
2. **`NEXT_PUBLIC_LANG_COUNTRY_COMBINATIONS`** — add every **`it-BE`**, **`it-NL`**, … pair you support (see [`next/config/lang-country-combinations-env.ts`](../config/lang-country-combinations-env.ts) for default JSON shape if env is empty).
3. **`LANG_TO_DEFAULT_LOCALE`** in [`next/config/locale-constants.ts`](../config/locale-constants.ts) — e.g. `it: "it-BE"` so **`/it` → `/it-BE`** style redirects work if you use them.

### Step 4 — **Middleware** short paths (only if you use `/en`, `/nl`, … style shortcuts)

In [`next/middleware.ts`](../middleware.ts), if the new language has a **one-segment** shortcut like **`/it`**, extend:

- **`isHomepage`**
- **`isSingleSegmentUnknownPath`** (so `/it` is not treated as “unknown”)
- **`getHomepageRedirectPath`** regex + **`LANG_TO_DEFAULT_LOCALE`**

If you only ever use **`it-BE`** full locale in the path, you may not need every one of these—match what you already do for `en` / `nl` / `fr` / `de`.

### Step 5 — **UI copy** (catalog page label, etc.)

[`next/app/(public)/[language-country]/car-parts/page.tsx`](<../app/(public)/[language-country]/car-parts/page.tsx>) may define a **`partsLabel`** switch (`fr` / `nl` / `de` / default “Car Parts”) for a **human-readable** “parts hub” name. **Routing and SEO URLs do not depend on this** — it is only for **on-page copy / UX**.

**Note:** The breadcrumb on that page may use **`getLabel("car_parts")`** from branding instead of **`partsLabel`**. For a new language you often only need the **`car_parts`** (or equivalent) **translation in your CMS/branding**, unless you refactor the page to wire **`partsLabel`** into **`OGBreadcrumb`**.

See **[FAQ](#faq--common-questions-future-reference)** → first item below.

### Step 6 — **Sitemap** (optional but recommended for SEO)

[`next/app/sitemap-pages.xml/route.ts`](../app/sitemap-pages.xml/route.ts) still pushes a few **static catalog roots** per language. Add lines for each new **`{locale}/{public-parts-segment}`** you care about, or refactor that block to loop over **`LANG_COUNTRY_COMBINATIONS`** + **`getPartsRouteSegmentForLang`** so you do not hand-maintain rows.

### Step 7 — **Do not** add new App Router folders

**No** new folder under:

`next/app/(public)/[language-country]/{your-new-parts-word}/`

The **middleware rewrite** sends all localized parts/category URLs to **`car-parts`** + **`category`**.

### Step 8 — Test the three page families

| Page type            | What to open                                                                           | What should happen                                                               |
| -------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Category catalog** | `/{locale}/{public-parts-slug}` (and with `?makeModelTypeId=…` if you use car context) | Page loads; URL bar keeps **localized** slug; internal route is **`car-parts`**. |
| **L1 / L2 / L3**     | `/{locale}/{public-parts-slug}/{public-category-slug}/…`                               | Same: visible localized words; internally **`car-parts/category/…`**.            |
| **Part details**     | `/{locale}/{public-parts-slug}/{manufacturer-or-seo}/{partId}`                         | Same; **`detectPage`** and PDP middleware still see **public** segments.         |

Also test **language switcher** on a category L1/L2/L3 URL (uses [`/api/category-locale-redirect`](../app/api/category-locale-redirect/route.ts) + **`Routes.categoryL*`**).

### Step 9 — Backend / CMS (out of scope for this file, but remember)

Slugs for L1/L2/L3 often come from **category tree** (`slugs[lang]`). Ensure the API / CMS actually provides slugs and titles for the new **`lang`**; otherwise category pages may 404 or fall back to names.

---

## FAQ — common questions (future reference)

### FAQ — Step 5 / What does “catalog UI copy” do?

**Q:** Step 5 mentions **`partsLabel`** on the catalog page — what is it for?

**A:** It is an optional **human-readable title** for the parts hub (e.g. “Autoteile”, “Pièces Auto”) so headings or breadcrumbs feel natural in each language. It does **not** change URLs, redirects, or rewrites.

**Detail:** [`car-parts/page.tsx`](<../app/(public)/[language-country]/car-parts/page.tsx>) defines **`partsLabel`** from **`lang`**, but the breadcrumb **`active`** text may come from **`getLabel("car_parts")`** instead. Adding a **`lang`** branch to **`partsLabel`** only matters if that variable is actually used in JSX — otherwise add or verify the **`car_parts`** branding string for the new language.

---

### FAQ — Why don’t we need `auto-onderdelen` / `pieces-auto` folders in `app/`?

**Q:** We only have **`car-parts`** and **`category`** folders. How does the App Router serve **`/nl-BE/auto-onderdelen`** and similar URLs?

**A:** **`middleware`** runs **before** routing. It **`rewrite`**s public paths to internal ones:

| What the user sees (example)               | What Next uses internally to pick `page.tsx` |
| ------------------------------------------ | -------------------------------------------- |
| `/nl-BE/auto-onderdelen/...`               | `/nl-BE/car-parts/...`                       |
| `.../categorie/...` or `.../kategorie/...` | `.../category/...`                           |

**`NextResponse.rewrite(internalUrl)`** means: “route this request as if it were **`internalUrl`**,” while the **browser URL usually stays** the public (localized) one. The filesystem only has to match the **rewritten** path (`car-parts` + `category`), not every localized segment name.

**Without** middleware rewrite, a path like **`/nl-BE/auto-onderdelen`** would not match **`car-parts`** unless you also had an `auto-onderdelen` folder or configured an equivalent **`rewrite`** or **`redirect`** in **`next.config`**.

---

### FAQ — Do rewrites hurt SEO?

**Q:** Does this rewrite approach negatively affect SEO?

**A:** **No — not inherently.** Crawlers request a URL like **`/nl-BE/auto-onderdelen`** and receive **200** + HTML for that URL. The rewrite chooses which Server Component / route renders the response; it is normal Next.js behaviour and not “cloaking” as long as the content matches the localized URL intent.

**What actually matters:**

- **Canonical URLs** — Should reflect the URL you **want indexed** (normally the **localized** path: `auto-onderdelen`, `pieces-auto`, `autoteile`, …). Wrong canonicals (e.g. always English) dilute locale signals.
- **hreflang / alternates** — Should list correct **localized** URLs per locale (see **`utils/hreflang.ts`** + **`Routes`**).
- **Duplicate URLs** — If both **`/nl-BE/car-parts`** **and** **`/nl-BE/auto-onderdelen`** return the **same** content and both get discovered without a preferred canonical, engines may treat them as duplicates. Prefer **consistent internal linking** + **one** canonical URL per canonical “page”; use **redirects** to the unused variant if you must retire a path.

---

## Quick “where do I change what?” table

| I want to…                       | Main file(s)                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change URL words for a language  | [`config/url-segments.ts`](../config/url-segments.ts)                                                                                               |
| Fix links in code                | [`config/routes.ts`](../config/routes.ts) (usually no change if maps are right)                                                                     |
| Fix internal routing / PDP rules | [`middleware.ts`](../middleware.ts) + [`config/url-segments.ts`](../config/url-segments.ts)                                                         |
| Fix hreflang alternates          | [`utils/hreflang.ts`](../utils/hreflang.ts) **`PARTS_LANGS`** + maps                                                                                |
| Enable locale in app             | **Env** + [`lang-country-combinations-env.ts`](../config/lang-country-combinations-env.ts) + [`locale-constants.ts`](../config/locale-constants.ts) |
| Change catalog UI label          | [`car-parts/page.tsx`](<../app/(public)/[language-country]/car-parts/page.tsx>)                                                                     |
| Add sitemap entries              | [`sitemap-pages.xml/route.ts`](../app/sitemap-pages.xml/route.ts)                                                                                   |

---

## Note — Product card click & PDP redirects: **URL locale wins over cookie / localStorage**

> Future reference for any change touching PDP redirect logic, the `locale` cookie, `localStorage["locale"]`, or product-card click handlers.

### The bug we hit

A user who had previously chosen French in the language modal (cookie `locale=fr-BE`, `localStorage["locale"]=fr-BE`) would close the tab and later open `/en-BE` in a fresh tab. From there:

1. Opening **`/en-BE/car-parts/category/engine/ignition/spark-plug-glow-plug`** (an L3 page) loaded fine, **but**
2. Clicking any product card on that L3 (or on **`/en-BE/search-results?...`**) hard-redirected the user to **`/fr-BE/pieces-auto/<manufacturer>/<partid>`** — i.e. flipped the locale on click and lost the `en-BE` context.

### Root cause

Two cooperating issues, each on its own seemingly harmless:

1. **Click-time URL was sometimes built off non-URL state.** The card click handlers in `CategoryL3TopPartsSection`, `ProductList`, and `OGRecentCard` used `getRouteLocaleString(Routes.parts, params)`. `params["language-country"]` is reliable in normal App Router pages, but we wanted to harden this so the click URL is **always** built from the visible pathname — not from any cookie / branding-context state that could be stale.

2. **Middleware was overriding a clean URL based on the cookie.** [`middleware.ts`](../middleware.ts) → `parsePdpCandidate` block had a redirect trigger:

   ```ts
   if (isMalformed || languageMismatchWithSelection) { ... }
   ```

   `languageMismatchWithSelection` was `true` whenever the URL's language differed from the cookie's language. So a perfectly well-formed `/en-BE/car-parts/<seoName>/<partid>` would still enter the block, fetch the part, and 301 the user to **`/{cookieLocale}/{cookieLangPartsRoute}/<manufacturer>/<partid>`** — i.e. `/fr-BE/pieces-auto/...`. The URL the user was actually browsing lost to a value persisted from a previous session.

### The fix (two halves, both small)

**Half 1 — Click handler builds the URL from the pathname directly.** In each of the three call sites we now derive the PDP base from `usePathname()`:

```ts
const productPdpBase = (() => {
  const urlLocaleSeg = (pathname || "").split("/").filter(Boolean)[0] || "";
  const safeLocale = LANG_COUNTRY_COMBINATIONS.includes(urlLocaleSeg)
    ? urlLocaleSeg
    : DEFAULT_HOMEPAGE_LOCALE;
  const partsRoute = getPartsRouteSegmentForLang(safeLocale.split("-")[0] || "en");
  return `/${safeLocale}/${partsRoute}/`;
})();
```

Files:

- [`screens/category/CategoryL3TopPartsSection.tsx`](../screens/category/CategoryL3TopPartsSection.tsx) — L3 "Top Parts" cards.
- [`screens/products/ProductList.tsx`](../screens/products/ProductList.tsx) — search-results & catalog product list.
- [`screens/productdetails/OGRecentCard.tsx`](../screens/productdetails/OGRecentCard.tsx) — recently-viewed cards (also used inside `Productfrequentlybought`).

**Half 2 — Middleware no longer redirects on cookie mismatch.** In [`middleware.ts`](../middleware.ts), the PDP block now triggers **only on malformed URLs**:

```ts
const isMalformed = !localeValid || !routeMatchesLang || !manufacturerPresent;
if (isMalformed) { ... }
```

`languageMismatchWithSelection`, `selectedLocaleCookie`, `selectedLang`, the cookie-driven `redirectLocale` branch, and the now-unused helpers `getCountryFromLocale` / `buildSupportedLocale` were all removed. Malformed URLs still 301-canonicalize to the **default base** (`/en-BE/car-parts`), and 404 part lookups still 302 to `/{locale}/not-found` — exactly as before.

### The rule going forward

When a request reaches middleware **with a valid `[language-country]` segment in the URL**, that locale is the source of truth. Cookie / `localStorage` / branding state may be **read** for UX (e.g. preselecting a language in the modal), but they must **never** override the URL with a redirect.

- ✅ Build click URLs from `usePathname()`-derived locale + `getPartsRouteSegmentForLang(lang)` from [`config/url-segments.ts`](../config/url-segments.ts).
- ✅ Reuse `LANG_COUNTRY_COMBINATIONS` (from [`config/locale-constants.ts`](../config/locale-constants.ts)) to validate the URL segment before trusting it.
- ✅ Keep the `isCategoryPathSegment(segments[2])` guard in `parsePdpCandidate` — it prevents L1/L2/L3 URLs from being read as PDPs and bounced into `/{locale}/not-found`.
- ❌ Don't reintroduce a `languageMismatchWithSelection`-style redirect in middleware. If a future feature genuinely needs to nudge users between locales, do it client-side (e.g. an in-page banner offering to switch), not via a 301 that swaps the URL out from under them.
- ❌ Don't read `getLocale()` from `BrandingContext` (or `localStorage`) when constructing a redirect target URL. That state can lag the URL during navigation and across tabs.

### Quick repro / regression check

After any change to middleware PDP logic or click handlers:

1. In an incognito/private window, open `/fr-BE`, pick FR/BE in the language modal (cookie + storage are now `fr-BE`).
2. Open `/fr-BE/pieces-auto/categorie/moteur/allumage/bougie-dallumage-bougie-de-prechauffage` — confirm it loads.
3. Close the tab.
4. Open a new tab to `/en-BE`.
5. Navigate to `/en-BE/car-parts/category/engine/ignition/spark-plug-glow-plug` and `/en-BE/search-results?categoryIds=001002001&take=12&order=priority`.
6. Click any product card on each.

   Expected: browser lands on `/en-BE/car-parts/<seoName>/<partid>` (with `?makeModelTypeId=...` if applicable). It must **not** bounce to `/fr-BE/pieces-auto/...`.

7. Repeat with reversed locales (cookie EN, URL FR) — the FR URL must win.
8. Visit a deliberately malformed PDP (e.g. `/en-BE/car-parts//<partid>` or `/en-BE/auto-onderdelen/<partid>`) — these **should** still 301 to the default canonical base, and unknown `partid`s must still 302 to `/{locale}/not-found`.

---

_Last updated: URL-locale-wins on PDP redirects + click handlers harden against stale cookie/localStorage; middleware `languageMismatchWithSelection` redirect removed._
