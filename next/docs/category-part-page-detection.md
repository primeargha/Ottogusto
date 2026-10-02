# Category vs Part (PDP) Page Detection — Parts API 404 Fix

Context for incorrect `GET /Parts/{id}` and `GET /parts/{id}` calls, why category URLs were mistaken for product pages, what was fixed, and how safe product URLs are built for navigation/redirect.

Related: [middleware-language-store-proxy.md](./middleware-language-store-proxy.md), [lang-based-dynamic-urls.md](./lang-based-dynamic-urls.md), [category-api-optimization.md](./category-api-optimization.md)

---

## 1 — Reported issue (backend)

### Symptoms

High volume of **404** responses on the Parts details API. Example failing requests (invalid by design):

| Bad API call                             | Why it fails                                                          |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `GET .../api/parts/spark-plug-glow-plug` | `spark-plug-glow-plug` is a **category/SEO slug**, not a product id   |
| `GET .../api/parts/null`                 | `null` is a **missing id** turned into the string `"null"` in the URL |

Example scale (from backend): ~2.5K failures out of ~5.3K requests in one hour — mostly **noise**, not broken real products.

### What the API expects

`GET /Parts/{id}` (or `/parts/{id}`) must receive a **real part id**, for example:

- UUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Numeric id: `12345`
- Internal alphanumeric code: `mfvctpr7v02v2t`

It must **not** receive hyphenated marketing/category slugs or literal `null`.

---

## 2 — Root cause (full context)

### 2.1 Middleware: “last URL segment = part id”

`middleware.ts` runs **PDP wrong-URL handling** for paths that look like the parts catalog. `parsePdpCandidate()` splits the pathname and sets:

```ts
const partid = segments[segments.length - 1]; // always the LAST segment
```

**Intended** product URL shape:

```text
/{locale}/{partsRoute}/{manufacturer}/{partId}
/en-BE/car-parts/fiat-group/mfvctpr7v02v2t
                              ↑ partId (last segment) ✓
```

**Category L3 URL** (different page type, same “many segments” shape):

```text
/{locale}/{partsRoute}/{categoryKeyword}/{l1}/{l2}/{l3}
/en-BE/car-parts/category/engine/spark-plug-glow-plug
 0      1          2        3       4
```

| Index | Segment                | Used as `partid` before fix?          | Sent to Parts API? |
| ----- | ---------------------- | ------------------------------------- | ------------------ |
| 0     | `en-BE`                | No (locale)                           | No                 |
| 1     | `car-pars`             | No (parts route)                      | No                 |
| 2     | `category`             | No (was **ignored** for API decision) | No                 |
| 3     | `engine`               | No                                    | No                 |
| 4     | `spark-plug-glow-plug` | **Yes — wrongly treated as part id**  | **Yes → 404**      |

**Important:** The word `category` in the URL did **not** automatically stop the Parts API. Old logic never asked “is this a category page?” — it only used **last segment = id**. So `category` and `engine` were never sent to the API; only **`spark-plug-glow-plug`** was.

When the URL was “malformed” for PDP rules (e.g. missing manufacturer segment), middleware called:

```text
GET {NEXT_PUBLIC_API_URL}/parts/{partid}
```

with that last slug → backend 404.

### 2.2 Short product-like URLs without `/category/`

```text
/en-BE/car-parts/spark-plug-glow-plug
```

Here segment 2 is the slug itself (no `category` keyword), so the category-path guard did not apply. The last segment was still passed to the API.

### 2.3 Client links with missing `part.id`

Search, OE modal, cart, header links sometimes built PDP paths when `part.id` was `null` / `undefined`. JavaScript stringified that as `"null"`:

```text
/en-BE/car-parts/some-seo-name/null  →  GET /parts/null
```

### 2.4 Server PDP page

Route `app/.../car-parts/[partname]/[partid]/page.tsx` called `GET /parts/{partid}` on the server for **any** value in `[partid]`, including slugs and `null`.

### 2.5 Why frontend devs did not always see it

- Many calls run on the **server** (middleware + RSC), not in the browser Network tab.
- Production traffic (crawlers, bookmarks, bad links) is larger than local testing.
- Category browsing triggers middleware on every navigation.

---

## 3 — URL shapes reference

### Parts route segments (by language)

| Lang | Public segment    | Canonical app folder    |
| ---- | ----------------- | ----------------------- |
| en   | `car-parts`       | `car-parts`             |
| nl   | `auto-onderdelen` | `car-parts` (rewritten) |
| fr   | `pieces-auto`     | `car-parts` (rewritten) |
| de   | `autoteile`       | `car-parts` (rewritten) |

### Category path segments (by language)

Detected via `isCategoryPathSegment()` in `config/url-segments.ts` (segment at index **2** after locale + parts route):

| Lang | Category segment |
| ---- | ---------------- |
| en   | `category`       |
| nl   | `categorie`      |
| fr   | `categorie`      |
| de   | `kategorie`      |

Canonical app folder: `category`. Localized public URLs are rewritten to `.../car-parts/category/...` before routing when needed (`rewriteLocalizedPartsUrlToCanonicalAppPath`).

### Category pages (App Router)

```text
app/(public)/[language-country]/car-parts/category/[l1]/page.tsx
app/(public)/[language-country]/car-parts/category/[l1]/[l2]/page.tsx
app/(public)/[language-country]/car-parts/category/[l1]/[l2]/[l3]/page.tsx
```

These routes use **category APIs**, not `GET /Parts/{id}` for the path slug.

### Product detail page (PDP)

```text
app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx
```

`[partid]` must be a validated id before any Parts API call.

---

## 4 — Solution overview

Defense in depth: validate the id **everywhere** we might call the Parts API or build a PDP link.

```text
URL / click / [partid] param
        ↓
  normalizePartId + isValidPartIdForApi  (utils/part-id.ts)
        ↓
   invalid → skip API, no PDP href, not-found where appropriate
   valid   → GET /Parts/{id} or /parts/{id} as before
```

---

## 5 — What was implemented

### 5.1 `utils/part-id.ts`

| Function                  | Purpose                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `normalizePartId()`       | Trim; reject empty, `null`, `undefined`, `nan` literals                                               |
| `isValidPartIdForApi()`   | Allow UUID, numeric ids, alphanumeric codes; **reject** hyphen-only slugs like `spark-plug-glow-plug` |
| `logSkippedPartApiCall()` | Dev-only: log when API is **not** called                                                              |
| `logPartApiCall()`        | Dev-only: log when API **is** called                                                                  |

### 5.2 `middleware.ts` — `parsePdpCandidate()`

1. **`isCategoryPathSegment(segments[2])`** — If the path is `.../category/...` (or `categorie`, `kategorie`, etc.), return `null` → **no** PDP candidate → **no** middleware `GET /parts/...`.
2. **`isValidPartIdForApi(partid)`** — Reject slug/`null` last segments even on non-category URLs.
3. Malformed-but-valid-id PDP redirect logic only runs when both checks pass.

### 5.3 PDP server page — `car-parts/[partname]/[partid]/page.tsx`

- `fetchProduct()` and `fetchMatchingCars()` return early without `api.get` when id is invalid.
- User sees `<NotFound />` instead of hammering the API.

### 5.4 `services/productdetailsservice.ts`

- `getProductInformation`, `getmatchingcarsInformation`, `checkPartCompatibility` bail out before HTTP when id is invalid.

### 5.5 Safe PDP URLs — `utils/build-part-pdp-url.ts`

Central builder for **client navigation and redirects** to the product page. Returns `null` when the id is invalid (no link to `/.../null` or slug-as-id).

### 5.6 UI call sites (use `buildPartPdpHref` / guards)

- `components/OERefModal.tsx`, `OERefSearchInput.tsx`
- `screens/productdetails/OGHeaderSearchLinks.tsx`, `OGRecentCard.tsx`
- `screens/category/CategoryL3TopPartsSection.tsx`
- `screens/products/ProductList.tsx`
- `screens/shoppingcart/OGcart-card.tsx`
- `screens/order-details/ordercard.tsx`
- `screens/og-search/SearchByOEView.tsx`
- `screens/oe-search/oe-ref-number.tsx`

---

## 6 — Building URLs for redirect / navigation (`buildPartPdpHref`)

Use this for any programmatic navigation (`router.push`, `<Link href>`, etc.) to a product page.

### API

```ts
import { buildPartPdpHref, buildPartPdpHrefFromPathname } from "@/utils/build-part-pdp-url";

buildPartPdpHref(languageCountry, partId, options?): string | null
buildPartPdpHrefFromPathname(pathname, partId, options?): string | null
```

**Options:**

| Option            | Type                         | Purpose                                                                                                             |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `seoName`         | `string \| null`             | Slug segment before id (brand, title, name); slugified                                                              |
| `makeModelTypeId` | `string \| null`             | Optional query `?makeModelTypeId=...` for legacy MME context                                                        |
| `carIds`          | `string \| string[] \| null` | Optional query `?carIds=...` (comma-separated) when new MME flag is on and the current page URL has vehicle context |

### Output shape

```text
/{locale}/{localizedPartsRoute}/{seoSlug}/{partId}
```

Optional query: `?makeModelTypeId={encoded}` and/or `?carIds={encoded}` (use `partPdpOptionsFromSearchParams` to copy from the current page URL)

### Examples

**Valid product (English locale):**

```ts
buildPartPdpHref("en-BE", "mfvctpr7v02v2t", { seoName: "Fiat Group" });
// → "/en-BE/car-parts/fiat-group/mfvctpr7v02v2t"
```

**Valid product (Dutch locale — localized parts segment):**

```ts
buildPartPdpHref("nl-BE", "mfvctpr7v02v2t", { seoName: "Fiat" });
// → "/nl-BE/auto-onderdelen/fiat/mfvctpr7v02v2t"
```

**With MME query:**

```ts
buildPartPdpHref("en-BE", "mfvctpr7v02v2t", {
  seoName: "Brake pad",
  makeModelTypeId: "abc123",
});
// → "/en-BE/car-parts/brake-pad/mfvctpr7v02v2t?makeModelTypeId=abc123"
```

**Invalid id — no navigation (returns `null`):**

```ts
buildPartPdpHref("en-BE", null); // null
buildPartPdpHref("en-BE", "spark-plug-glow-plug"); // null (slug)
buildPartPdpHref("en-BE", "null"); // null (literal)
```

### Usage pattern (e.g. OE modal)

```ts
const href = locale
  ? buildPartPdpHref(locale, part.id, {
      seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
    })
  : null;
if (href) router.push(href);
```

**Do not** manually concatenate `/${locale}/car-parts/${slug}/${part.id}` without validation — use `buildPartPdpHref` so bad ids never produce URLs.

### Locale from current path

```ts
buildPartPdpHrefFromPathname(pathname, partId, { seoName: "..." });
```

Uses first path segment as locale (`en-BE`, `nl-BE`, …) with fallback to default homepage locale.

---

## 7 — Middleware vs PDP page vs client

| Layer                            | When Parts API runs                                   | Category URL `/.../category/...`          |
| -------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Middleware `parsePdpCandidate`   | Only if not category + valid id + malformed PDP rules | **Blocked** at category check             |
| PDP `page.tsx` `fetchProduct`    | Only if `[partid]` valid                              | Category routes do not use this page file |
| `productdetailsservice` (client) | Only if id valid                                      | N/A (id from product object, not path)    |
| `buildPartPdpHref`               | No API; builds link only                              | N/A                                       |

---

## 8 — Development verification

With `npm run dev`, watch the **terminal** (server) and filter `[parts-guard]`:

| Log                                | Meaning                             |
| ---------------------------------- | ----------------------------------- |
| `[parts-guard] skipped API call`   | Guard ran; **no** HTTP to Parts API |
| `[parts-guard] executing API call` | Valid id; request proceeds          |

**Category L3 (should skip, no Parts API):**

```text
/en-BE/car-parts/category/engine/spark-plug-glow-plug
```

**Valid PDP (should execute):**

```text
/en-BE/car-parts/fiat-group/mfvctpr7v02v2t
```

Confirm in Network: no `parts/spark-plug-glow-plug` or `parts/null` for bad URLs; real id still loads product.

**Note:** One PDP load may log `pdp.fetchProduct` twice (metadata + page) — that is separate from the 404 guard issue.

---

## 9 — Expected outcome after deploy

- Sharp drop in `GET /parts/spark-plug-glow-plug`, `GET /parts/null`, and similar invalid ids.
- Real product pages unchanged for valid ids.
- Remaining Parts API 404s should be genuine “product not found” for valid ids, not URL bugs.

---

## 10 — If this issue appears again (troubleshooting)

If again for any reason we face this issue again we will check if URL has `category` / `categorie` / `kategorie` (and any other localized category keywords from `CATEGORY_ROUTE_SEGMENT_BY_LANG` in `config/url-segments.ts`) — **do not call the Parts API** when that segment appears at index 2 after locale and parts route (`/{locale}/{partsRoute}/{categorySegment}/...`).

Also verify:

1. `isValidPartIdForApi()` is still applied in middleware, PDP `page.tsx`, `productdetailsservice.ts`, and `buildPartPdpHref()`.
2. New navigation code uses `buildPartPdpHref` instead of manual URL strings.
3. Dev `[parts-guard]` logs: unexpected `executing` for slug-like ids or `skipped` missing on known bad URLs.
4. Backend sample: copy one failing URL from logs and reproduce locally with terminal + Network.
