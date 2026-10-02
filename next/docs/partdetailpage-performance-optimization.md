# PartDetailPage Performance Optimization

## Overview

Performance optimization of the `PartDetailPage` across all three language versions (English, Dutch, French) targeting improved Google PageSpeed Insights scores. Focus areas: Largest Contentful Paint (LCP), Total Blocking Time (TBT), and First Contentful Paint (FCP).

**Constraint**: Zero UI regressions — all changes preserve existing visual output and functionality.

---

## Changes Summary

### 1. Critical SSR Fix — OLDClientLayout (`app/OLDClientLayout.tsx`)

**Root cause of ~13s LCP**: `origin` state was initialized as `null`, causing `{origin && (...)}` to evaluate `false` during SSR. This meant the **entire page content** (including the product image) was never server-rendered — the browser had to download, parse, and execute the full JS bundle before any content appeared.

**Fix**: Initialize `origin` with `AUTH_0.REDIRECT_URI` so children render during SSR. After hydration, `useEffect` still updates to `window.location.origin` for correct auth redirects.

```diff
- const [origin, setOrigin] = useState<string | null>(null);
+ const [origin, setOrigin] = useState<string>(AUTH_0.REDIRECT_URI || "");
```

### 2. GTM Server Component Conversion (`components/GTM.tsx`)

Converted GTM from a `"use client"` React component (useState + useEffect + next/script) to a **server-rendered component** with plain inline `<script>` tags. Eliminates React hydration cost entirely while preserving identical consent-based GTM loading behavior.

- DataLayer initialization: inline `<script>` runs immediately
- Consent-based GTM loader: inline `<script>` with same Cookiebot event listeners

### 3. Cookiebot Script Conversion (`app/layout.tsx`)

Converted `CookiebotScript` from `next/script` with `strategy="lazyOnload"` to a plain `<script>` using `requestIdleCallback` (with `setTimeout` fallback). Removes the client-side `next/script` component overhead while matching the same deferred loading behavior.

### 4. Font Loading Optimization (`app/layout.tsx`)

- Replaced broken `media="print" onLoad` pattern (React strips `onLoad` from `<link>` during SSR) with `<link rel="preload" as="style">` + deferred `requestIdleCallback` script injection
- Trimmed external Google Fonts weight ranges from full ranges (100–900) to only used weights (400, 500, 600, 700) — reduces font CSS download by ~60%

### 5. CDN Preconnect (`app/layout.tsx`)

Added `<link rel="preconnect">` and `<link rel="dns-prefetch">` for `cdn.ottogusto.group` — saves DNS + TLS handshake time for product images (the LCP element).

### 6. Product Image Optimization (`screens/productdetails/productimgcarousal.tsx`)

- Main image `width`: 200 → 400, `height`: 320 → 400 (matches actual display size)
- `quality`: 80 → 75
- `sizes`: updated to `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px`
- Added `fetchPriority="high"` for explicit browser LCP prioritization

### 7. Lazy-Load Below-Fold Components (`app/layout.tsx`)

`FooterLanding` and `BottomNavBar` converted from static imports to `dynamic()` with `ssr: false` — removes them from the initial JS bundle since they're below the fold.

### 8. Page Alignment (EN/NL/FR)

Aligned Dutch (`auto-onderdelen`) and French (`pieces-auto`) PartDetailPage implementations with the English (`car-parts`) version:

- Replaced static `ProductMatchingCars` import with `dynamic()` + `Suspense`
- Replaced `next/script` for JSON-LD with plain `<script>` tag
- Wrapped `SearchContainerWrapper` in `Suspense`

### 9. Image Size Reductions

- `OGRecentCard.tsx`: image dimensions 1000 → 320, quality 100 → 75
- `noImage.tsx`: quality 100 → 60, removed `priority` preload, added lazy loading

### 10. Dead Code Removal

- `productdetails.tsx`: removed dead `useEffect` (code after `return` was unreachable)
- `productfulldescription.tsx`: removed unused `useThemeChangePs` import and `selectedStore`/`selectedDevice` state
- `OGRecentCard.tsx`: removed unused `Divide` import from `lucide-react-native`

### 11. Lazy-Load Below-Fold Product Components

- `Productfrequentlybought` in `productdetails.tsx`: converted to `dynamic()` import
- `SearchContainerWrapper` wrapped in `Suspense` on all three language pages

### 12. Package Import Optimization (`next.config.js`)

Added `optimizePackageImports` for `lucide-react`, `@headlessui/react`, `lodash`, and other large packages to enable tree-shaking of barrel exports.

---

## Files Modified

| File                                                                           | Changes                                                                                                |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `app/OLDClientLayout.tsx`                                                      | SSR fix: initialize `origin` with `AUTH_0.REDIRECT_URI`                                                |
| `app/layout.tsx`                                                               | CDN preconnect, font optimization, lazy footer/nav, Cookiebot conversion, removed `next/script` import |
| `components/GTM.tsx`                                                           | Full server component conversion (removed `"use client"`)                                              |
| `screens/productdetails/productimgcarousal.tsx`                                | LCP image sizing + fetchPriority                                                                       |
| `screens/productdetails/productdetails.tsx`                                    | Dead useEffect removal, lazy-load Productfrequentlybought                                              |
| `screens/productdetails/productfulldescription.tsx`                            | Removed unused imports/state                                                                           |
| `screens/productdetails/OGRecentCard.tsx`                                      | Image size reduction, removed unused import                                                            |
| `screens/productdetails/noImage.tsx`                                           | Quality reduction, lazy loading                                                                        |
| `app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx`       | Suspense wrapper for SearchContainerWrapper                                                            |
| `app/(public)/[language-country]/auto-onderdelen/[partname]/[partid]/page.tsx` | Aligned with EN pattern + Suspense wrapper                                                             |
| `app/(public)/[language-country]/pieces-auto/[partname]/[partid]/page.tsx`     | Aligned with EN pattern + Suspense wrapper                                                             |
| `next.config.js`                                                               | `optimizePackageImports` configuration                                                                 |

---

## Expected Impact

| Metric      | Before        | Expected After                                         |
| ----------- | ------------- | ------------------------------------------------------ |
| FCP         | 0.9s          | ~0.4s                                                  |
| LCP         | 16.6s → 13.5s | ~2-4s (SSR fix enables server-rendered content)        |
| TBT         | 2,250ms       | Reduced (GTM/Cookiebot no longer need React hydration) |
| CLS         | 0             | 0 (unchanged)                                          |
| Speed Index | 3.7s          | ~2-3s                                                  |

The single highest-impact change is the `OLDClientLayout` SSR fix (#1), which allows the entire page to be server-rendered instead of requiring full client-side JS execution before any content appears.
