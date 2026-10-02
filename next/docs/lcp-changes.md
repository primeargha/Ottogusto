# LCP performance changes (reversible)

Reference for homepage, category L1/L2/L3, and product detail page (PDP) Largest Contentful Paint improvements. **Revert by removing the files and edits listed below** if metrics regress or behaviour changes.

Related: [category-part-page-detection.md](./category-part-page-detection.md)

---

## Problem summary

| Page              | Typical LCP element                                                   | Main issue (PSI)                                                                                                                 |
| ----------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Homepage          | Hero carousel slide 1 (`hero_001.jpg`)                                | ~2s **resource load delay** — image discovered only after client JS (`heroCard2.tsx`)                                            |
| Category L1/L2/L3 | Description `<p class="typography-body-02">` in `CategoryDescription` | ~4s **element render delay** — text LCP blocked by client Typography, redundant Suspense skeleton, country modal on first paint  |
| PDP               | Main product image in `productimgcarousal.tsx`                        | ~2.3s **resource load delay** — LCP image only after client JS (`Products` → carousel); preload URL did not match `/_next/image` |

---

## Approach

1. **`<link rel="preload" as="image" fetchPriority="high">`** from Server Components so the browser starts downloading the LCP image early.
2. **Homepage only:** defer carousel slides 2–5 until after first paint (reduces competing downloads).
3. **Homepage only:** fix `sizes` on hero `next/image` to match real display width (~668px).
4. **Category only:** server-native `<p>` for description (no client `Typography`); remove redundant inner `Suspense` after data is already awaited; sync locale from URL so country/language modal does not block category LCP in PSI.
5. **PDP only:** server-rendered `ProductMainImage` in HTML; carousel defers thumbnails and client main image until interaction; remove outer PDP `Suspense` skeleton (route `loading.tsx` unchanged).
6. **No change** to category API resolution, MME search, breadcrumbs, grids, or manual language selector (header/footer still opens modal).

---

## New files (delete to partially revert)

| File                                          | Purpose                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `utils/lcp-utils.ts`                          | URL builders for preload hrefs                                         |
| `components/lcp/LcpImagePreload.tsx`          | Renders preload `<link>`                                               |
| `screens/landing/HomeLcpPreload.tsx`          | Homepage preload wrapper                                               |
| `screens/productdetails/ProductMainImage.tsx` | Server PDP hero `next/image` (400×400, same sizes/quality as carousel) |
| `docs/lcp-changes.md`                         | This document                                                          |

---

## Modified files

### Homepage

| File                                       | Change                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(public)/[language-country]/page.tsx` | Renders `<HomeLcpPreload />` at top of page                                                                                            |
| `screens/landing/heroCard2.tsx`            | Slide 0 only until `requestAnimationFrame`; carousel interval starts after all slides mount; `sizes="(max-width: 639px) 100vw, 668px"` |

**Revert homepage:**

```bash
# Remove HomeLcpPreload import + usage from page.tsx
# Restore heroCard2 carousel useEffect and map (all slides always mounted)
# Restore sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
```

### Category L1 / L2 / L3

| File                                                    | Change                                                                                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `screens/category/CategoryL1Page.tsx`                   | `<LcpImagePreload />`; removed outer `<Suspense fallback={CategoryPageLoading}>`; removed inner `<Suspense>` around `CategoryL2Section`                               |
| `screens/category/CategoryL2Page.tsx`                   | Same preload; removed outer + inner Suspense around `CategoryL3Grid`                                                                                                  |
| `screens/category/CategoryL3Page.tsx`                   | Same preload; removed outer + inner Suspense around `CategoryL3TopPartsSection`                                                                                       |
| `screens/category/CategoryDescription.tsx`              | Description uses native `<p class="... typography-body-02">` instead of client `Typography` (same styles, server HTML)                                                |
| `components/og-components/OGLanguageSelectionModel.tsx` | On mount: if URL has valid `/{locale}/` (e.g. `en-BE`) and no `localStorage.locale`, set storage + `closeLanguageSelector` — no blocking modal on category deep links |

Preload URL matches `CategoryDescription` image (`width=560`, `quality=80`).

**Why PSI showed ~4s element render delay on the paragraph**

- LCP was the **description text**, not the 120×120 category image (text has larger painted area).
- Client `Typography` forced hydration before the `<p>` counted as painted.
- Outer `Suspense` + `CategoryPageLoading` could show skeleton then swap to real text after `resolveL*CategoryPage` finished.
- `ShowLanguageSelector` defaulted to `true` in the store → country/language overlay on first visit without `localStorage.locale` (common in PSI).

**Unchanged (behaviour preserved)**

- Route `loading.tsx` still shows skeleton during client navigations.
- `CategoryDescription` image still uses `priority` + `fetchPriority="high"`.
- Category data still from `resolveL1/L2/L3CategoryPage` (same APIs).
- Users without locale on true first visit to `/` can still get the modal via landing footer / header `openLanguageSelector()`.

**Revert category (preload + element-delay fixes)**

```bash
# CategoryL1/2/3Page.tsx — restore:
#   import Suspense, CategoryPageLoading, *Skeleton imports
#   wrap ClientShell in <Suspense fallback={<CategoryPageLoading level="l*" />}>
#   wrap L2Section / L3Grid / TopParts in inner Suspense + skeleton fallbacks
#   remove LcpImagePreload lines if reverting all LCP work

# CategoryDescription.tsx — restore Typography import + <Typography> wrapper

# OGLanguageSelectionModel.tsx — remove LANG_COUNTRY_COMBINATIONS import and the
#   "sync locale from URL on mount" useEffect block; restore ShowModal state if desired
```

### Product detail (PDP)

| File                                             | Change                                                                                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/.../car-parts/[partname]/[partid]/page.tsx` | `<LcpImagePreload />`; `<ProductMainImage />` passed as `serverMainImage` to `Products`; removed outer `<Suspense fallback={ProductDetailsPageLoading}>` (route `loading.tsx` still used on client nav) |
| `screens/productdetails/ProductMainImage.tsx`    | **New** — server LCP image in initial HTML                                                                                                                                                              |
| `screens/productdetails/productdetails.tsx`      | Passes `serverMainImage` to `Productcardesc`                                                                                                                                                            |
| `screens/productdetails/productcardesc.tsx`      | Passes `serverMainImage` to `OGImageCarousal`                                                                                                                                                           |
| `screens/productdetails/productimgcarousal.tsx`  | Shows server image until thumbnail click / hover / tap; thumbnails deferred via `requestAnimationFrame`; client `Image` uses `priority` only when no server image                                       |

**Why PSI showed ~2.3s resource load delay**

- LCP `<img>` lived inside `"use client"` carousel; browser could not paint until `Products` + carousel JS ran.
- `<link rel="preload">` pointed at CDN URL while `next/image` requested `/_next/image?url=...` (limited preload benefit).

**Unchanged (behaviour preserved)**

- Magnifier, mobile modal, thumbnail switching, add-to-cart.
- `fetchProduct` / `generateMetadata` (React `cache` dedupes per request).
- Route-level `loading.tsx` for client transitions.

**Revert PDP**

```bash
# page.tsx — restore outer Suspense + ProductDetailsPageLoading; remove ProductMainImage + serverMainImage prop
# Delete ProductMainImage.tsx
# productdetails.tsx / productcardesc.tsx — remove serverMainImage prop wiring
# productimgcarousal.tsx — restore always-mounted thumbnails + single client Image with priority/fetchPriority high
# Optionally remove LcpImagePreload from page.tsx
```

---

## How to verify

1. **PSI / Lighthouse** — LCP element unchanged; check lower **resource load delay** for the same image URL.
2. **Network** — preload request for hero / `cat_*` / product image appears early in the waterfall.
3. **Homepage** — carousel still rotates after ~15s; all slides appear after first paint.
4. **Regression** — category pages, PDP, OE search, hero links unchanged.
5. **Category** — `/en-BE/car-parts/category/.../fluids` — description visible without modal on cold load when locale is in URL; lower element render delay on `<p>`.

Dev filter: Network → Img; look for early preload + single hero `hero_001` before other `hero_00x`.

Category PSI: LCP may still be the description `<p>` until image area is enlarged; expect **element render delay** to drop, not necessarily LCP element switching to image.

---

## Not in this change (future)

- Server-rendered hero `<Image>` in HTML without waiting for `heroCard2` client bundle (PDP now has server main image; homepage hero still client-discovered)
- PDP preload href aligned with `/_next/image` optimizer URL (server `Image` is primary LCP fix)
- Removing duplicate `fetchProduct` in PDP `generateMetadata` + page (separate optimisation)
- Preload via `metadata` API (not used; link component hoisted to `<head>` instead)
- Category L3 grid card images (not LCP on most layouts; description text often wins LCP)
- Faster category API (fetch tree + detail) — separate backend/frontend optimisation

---

## Rollback checklist

- [ ] Delete `utils/lcp-utils.ts`, `components/lcp/LcpImagePreload.tsx`, `screens/landing/HomeLcpPreload.tsx`, `screens/productdetails/ProductMainImage.tsx`
- [ ] Revert edits in `page.tsx` (home), `heroCard2.tsx`, `CategoryL1/2/3Page.tsx`, `CategoryDescription.tsx`, `OGLanguageSelectionModel.tsx`, PDP `page.tsx`, `productdetails.tsx`, `productcardesc.tsx`, `productimgcarousal.tsx`
- [ ] Delete or archive `docs/lcp-changes.md` if no longer needed
- [ ] Re-run PSI on homepage, one L3 category, one PDP
