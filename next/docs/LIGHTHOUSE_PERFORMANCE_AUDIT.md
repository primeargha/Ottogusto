# Lighthouse Performance Audit Report

**Project:** Ottogusto Next.js 14 Application  
**Date:** 17 February 2026  
**Audited URL:** `http://localhost:3000/en-NL/car-parts/selenia/m3hfrdzrkadvp6`  
**Initial Score:** 37/100 (Performance)  
**Target Score:** 70+ (Performance)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [Fixes Implemented](#3-fixes-implemented)
4. [Remaining Recommendations](#4-remaining-recommendations)
5. [Architecture Observations](#5-architecture-observations)
6. [Files Modified](#6-files-modified)
7. [Testing & Verification](#7-testing--verification)
8. [Appendix: Lighthouse Metrics Explained](#8-appendix-lighthouse-metrics-explained)

---

## 1. Executive Summary

The Product Detail Page (PDP) at `/en-NL/car-parts/selenia/m3hfrdzrkadvp6` scored **37/100** on Lighthouse Performance. The root causes were identified across **6 major categories**:

| Category                                               | Impact   | Status         |
| ------------------------------------------------------ | -------- | -------------- |
| Image optimization disabled globally                   | Critical | ✅ Fixed       |
| Duplicate render-blocking Google Fonts CSS             | Critical | ✅ Fixed       |
| `force-dynamic` on root layout disabling all caching   | Critical | ✅ Fixed       |
| Lottie animations loaded synchronously (~250KB+)       | High     | ✅ Fixed       |
| 6+ modal components eagerly loaded in layout           | High     | ✅ Fixed       |
| `next/script` used for JSON-LD (unnecessary client JS) | Medium   | ✅ Fixed       |
| Unused React hook imports in server component          | Low      | ✅ Fixed       |
| `moment.js` in UtilityHelper (~70KB gzipped)           | Low      | 📋 Recommended |
| `react-icons` barrel imports                           | Low      | 📋 Recommended |

**Estimated improvement: 25-40+ points** depending on network conditions and image sizes.

---

## 2. Root Cause Analysis

### 2.1 🔴 CRITICAL: Image Optimization Disabled (`images.unoptimized: true`)

**File:** `next.config.js` (line 12)

```js
images: {
  unoptimized: true, // ← This disables ALL image optimization
}
```

**Impact on Lighthouse:**

- **LCP (Largest Contentful Paint):** +2-5 seconds. Product images served as original format (PNG/JPEG) instead of WebP/AVIF. No automatic resizing — a 2000×2000px image is sent even for a 200×200 thumbnail.
- **CLS (Cumulative Layout Shift):** Images without proper dimensions cause layout shifts.
- **Total Blocking Time:** Browser spends more time decoding large unoptimized images.

**Why this existed:** The `sharp` package (required for Next.js image optimization) was already in `package.json` but the config flag was overriding it. Likely set during early development or Docker deployment troubleshooting.

### 2.2 🔴 CRITICAL: Duplicate Google Fonts via CSS `@import`

**File:** `styles/global.css` (line 1)

```css
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Chivo+Mono:wght@300;400;500;600;700&family=Inter:...");
```

**Impact on Lighthouse:**

- **FCP (First Contentful Paint):** +300-800ms. CSS `@import` is render-blocking — the browser cannot paint anything until this external stylesheet is downloaded and parsed.
- **LCP:** Cascading delay from FCP.

**Why this is a duplicate:** The same 7 fonts (Anton, Chivo Mono, Inter, Overpass, Overpass Mono, Oswald, Public Sans) are already loaded via `next/font/google` in `app/layout.tsx` (lines 106-147) with `display: "swap"`. The `next/font` approach is superior because it:

- Self-hosts the fonts (no external request)
- Automatically applies `font-display: swap`
- Generates optimized `@font-face` declarations

### 2.3 🔴 CRITICAL: `force-dynamic` on Root Layout

**File:** `app/layout.tsx` (line 150)

```ts
export const dynamic = "force-dynamic";
```

**Impact on Lighthouse:**

- **TTFB (Time to First Byte):** Every page request triggers full server-side rendering with zero caching. Even static content like the footer, header, and theme configuration is re-rendered on every request.
- **FCP/LCP:** Delayed because the server must complete all async operations (API calls, translations) before sending any HTML.

**Why this existed:** The root layout uses `headers()` to read the current path, which already makes it dynamic. The explicit `force-dynamic` was redundant but also prevented Next.js from applying any route-level caching optimizations.

### 2.4 🟠 HIGH: Synchronous Lottie Imports (~250KB+)

**File:** `screens/landing/header-row.tsx` (lines 3, 13-15)

```ts
import Lottie from "lottie-react";
import cart from "../../data/animations/cart.json";
import carWithFullUpDown from "../../data/animations/shutter with car full up down.json";
import lottie from "lottie-web";
```

**Impact on Lighthouse:**

- **TBT (Total Blocking Time):** `lottie-web` is ~150KB minified + ~100KB+ for the two JSON animation files. All of this is included in the initial JS bundle and must be parsed/executed before the page becomes interactive.
- **TTI (Time to Interactive):** Delayed by the time needed to parse and execute lottie code.

**Why this matters:** The header is rendered on every page. These animations are decorative (cart icon animation, engine bay animation) and are not needed for first paint or interactivity.

### 2.5 🟠 HIGH: Eagerly Loaded Modal Components

**File:** `app/OLDClientLayout.tsx` (lines 9-16)

```ts
import { SearchModal } from "@/screens/search/search-modal";
import { AdvancedSearchModal } from "@/screens/advanced-search/adv-search-modal";
import { OgSearchModal } from "@/screens/og-search/OgSearchModal";
import { EditAddressModal } from "@/screens/profile/EditAddressModal";
import FilterModal from "@/screens/products/FilterModal";
import OERefNumber from "@/screens/oe-search/oe-ref-number";
import OGLanguageSelectionModel from "@/components/og-components/OGLanguageSelectionModel";
import { OGConfirmation } from "@/components/og-components/OGConfirmation";
```

**Impact on Lighthouse:**

- **TBT:** 8 modal components with their full dependency trees are included in the initial JS bundle. Each modal likely pulls in form libraries, validation, additional UI components, etc.
- **JS Bundle Size:** Estimated 100-300KB+ of unnecessary JavaScript loaded on every page.

**Why this matters:** These modals are only shown on specific user interactions (search, filter, address edit, etc.) and should not be in the critical rendering path.

### 2.6 🟡 MEDIUM: `next/script` for JSON-LD Structured Data

**File:** `app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx` (lines 264-270)

```tsx
<Script
  id="product-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
/>
```

**Impact:** `next/script` adds client-side JavaScript to manage script injection. For JSON-LD structured data (which is purely for SEO and never executed by the browser), a plain `<script>` tag in a server component is more efficient.

### 2.7 🟡 MEDIUM: Unused Imports in Server Component

**File:** `app/layout.tsx` (line 1)

```ts
import { useEffect, useState } from "react";
```

**Impact:** Minor — these React hooks cannot be used in server components. While tree-shaking should remove them in production, they add noise and could confuse the bundler.

---

## 3. Fixes Implemented

### Fix 1: Enable Next.js Image Optimization

**File:** `next.config.js`

**Before:**

```js
images: {
  unoptimized: true,
  remotePatterns: [...]
}
```

**After:**

```js
images: {
  // unoptimized: true, // PERF: Disabled — let Next.js optimize images
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [...]
}
```

**Expected Impact:**

- LCP improvement: 1-4 seconds (images served as WebP/AVIF, properly sized)
- Bandwidth reduction: 50-80% for images
- Cache hit rate: 30-day TTL for optimized images

---

### Fix 2: Remove Duplicate Google Fonts `@import`

**File:** `styles/global.css`

**Before:**

```css
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Chivo+Mono:...");
```

**After:**

```css
/* PERF: Removed duplicate Google Fonts @import — fonts are already loaded via next/font/google in layout.tsx */
```

**Expected Impact:**

- FCP improvement: 300-800ms (eliminated render-blocking external CSS request)
- Eliminated duplicate font downloads

---

### Fix 3: Remove `force-dynamic` from Root Layout

**File:** `app/layout.tsx`

**Before:**

```ts
export const dynamic = "force-dynamic";
```

**After:**

```ts
// PERF: Removed force-dynamic — it disabled ALL caching for every route.
// export const dynamic = "force-dynamic";
```

**Expected Impact:**

- TTFB improvement: varies (Next.js can now apply per-route caching)
- Note: The layout still uses `headers()` which makes it inherently dynamic, but removing the explicit flag allows Next.js to optimize individual routes

---

### Fix 4: Lazy-Load Lottie Animations

**File:** `screens/landing/header-row.tsx`

**Before:**

```ts
import Lottie from "lottie-react";
import cart from "../../data/animations/cart.json";
import carWithFullUpDown from "../../data/animations/shutter with car full up down.json";
import lottie from "lottie-web";
```

**After:**

```ts
// Static imports removed. Dynamic imports inside useEffect:
const [lottieModule, cartData, carData] = await Promise.all([
  import("lottie-web"),
  import("../../data/animations/cart.json"),
  import("../../data/animations/shutter with car full up down.json"),
]);
```

**Expected Impact:**

- Initial JS bundle reduction: ~250KB+
- TBT improvement: 100-300ms
- No visual impact — animations load after component mounts

---

### Fix 5: Plain `<script>` for JSON-LD

**File:** `app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx`

**Before:**

```tsx
import Script from "next/script";
// ...
<Script id="product-schema" type="application/ld+json" ... />
```

**After:**

```tsx
// No import needed
<script type="application/ld+json" ... />
```

**Expected Impact:**

- Minor JS bundle reduction
- Eliminates client-side script management overhead for static content

---

### Fix 6: Lazy-Load Modal Components

**File:** `app/OLDClientLayout.tsx`

**Before:**

```ts
import { SearchModal } from "@/screens/search/search-modal";
import { AdvancedSearchModal } from "@/screens/advanced-search/adv-search-modal";
// ... 6 more static imports
```

**After:**

```ts
import dynamic from "next/dynamic";
const SearchModal = dynamic(
  () => import("@/screens/search/search-modal").then((m) => m.SearchModal),
  { ssr: false },
);
const AdvancedSearchModal = dynamic(
  () => import("@/screens/advanced-search/adv-search-modal").then((m) => m.AdvancedSearchModal),
  { ssr: false },
);
// ... 6 more dynamic imports with ssr: false
```

**Expected Impact:**

- Initial JS bundle reduction: 100-300KB+ (estimated)
- TBT improvement: 50-200ms
- Modals load on-demand when user triggers them

---

### Fix 7: Remove Unused Imports

**File:** `app/layout.tsx`

Removed `useEffect` and `useState` imports from the server component.

---

## 4. Remaining Recommendations

### 4.1 Replace `moment.js` with Native Date APIs (Priority: Low)

**File:** `helpers/UtilityHelper.ts`

`moment.js` adds ~70KB gzipped to the bundle. The usage is minimal (date diff and sorting). Replace with:

```ts
// Before
import moment from "moment";
const old_time = moment(date1);
const new_time = moment(date2);
const differe = new_time.diff(old_time);
const duration = moment.duration(differe);
return Math.floor(duration.asDays());

// After (native)
const diffMs = new Date(date2).getTime() - new Date(date1).getTime();
return Math.floor(diffMs / (1000 * 60 * 60 * 24));
```

### 4.2 Replace `react-icons` Barrel Imports (Priority: Low)

**Files:** `search/categories/newCategory-tile.tsx`, `search/manually/RightPanel.tsx`, `advanced-search/newCategory-tile.tsx`

`react-icons` uses barrel exports that can pull in entire icon sets. Replace with specific SVG components or `lucide-react` (already in the project).

```ts
// Before — pulls in entire Material Design icon set
import { MdOutlineSearch } from "react-icons/md";

// After — use lucide-react (already a dependency)
import { Search } from "lucide-react-native";
```

### 4.3 Consider Server Components for Product Details (Priority: Medium)

**File:** `screens/productdetails/productdetails.tsx`

The main `Products` component is marked `"use client"` but much of its content is static (title, description, OEM badges). Consider splitting into:

- A **server component** wrapper for static content
- **Client component** islands for interactive parts (cart, recently viewed)

### 4.4 Preconnect to CDN Domain (Priority: Low)

Add preconnect hints for the image CDN to reduce DNS/TLS latency:

```tsx
// In app/layout.tsx <head>
<link rel="preconnect" href="https://cdn.ottogusto.group" />
<link rel="dns-prefetch" href="https://cdn.ottogusto.group" />
```

### 4.5 Review Sentry Client-Side Instrumentation (Priority: Low)

**File:** `instrumentation-client.ts`

`@sentry/nextjs` with `browserTracingIntegration()` adds ~30-50KB to the client bundle. Consider:

- Disabling `browserTracingIntegration` in production if not actively used
- Using `Sentry.lazyLoadIntegration()` for non-critical integrations

### 4.6 Reduce Provider Nesting Depth (Priority: Low)

**File:** `app/layout.tsx` → `OLDClientLayout.tsx` → `registry.tsx`

The current provider chain is 10+ levels deep:

```
ConfigProvider → StoreProvider → ColorProvider → ThemeProvider → ErrorBoundary
→ Suspense → TypographyProvider → OLDClientLayout → Provider (QueryClient)
→ StyledJsxRegistry → BrandingProvider → BrandsProvider → CategoriesProvider
→ SavedCarsProvider → GluestackUIProvider → Auth0Provider → children
```

While this doesn't directly impact Lighthouse, it increases React reconciliation time. Consider combining related providers.

---

## 5. Architecture Observations

### 5.1 Positive Patterns Already in Place

- ✅ `React.cache()` used for deduplicating API calls between `generateMetadata` and page render
- ✅ `Promise.all()` for parallel data fetching (product + matching cars)
- ✅ `dynamic()` with `ssr: false` for `ProductMatchingCarsLazy`
- ✅ `Suspense` boundaries around lazy components
- ✅ `next/font/google` with `display: "swap"` for font loading
- ✅ GTM loaded conditionally after Cookiebot consent (not blocking render)
- ✅ Cookiebot loaded with `strategy="lazyOnload"`

### 5.2 Areas of Concern

- ⚠️ `"use client"` on `productdetails.tsx` — the main PDP component is entirely client-rendered
- ⚠️ `styled-jsx` + `react-native-web` + `nativewind` + `tailwindcss` — 4 styling systems in one app increases CSS bundle size
- ⚠️ `react-native-web` aliasing adds overhead to every component import
- ⚠️ `PersistQueryClientProvider` with localStorage persister runs synchronously on hydration

---

## 6. Files Modified

| File                             | Change                                              | Impact   |
| -------------------------------- | --------------------------------------------------- | -------- |
| `next.config.js`                 | Enabled image optimization with AVIF/WebP           | Critical |
| `styles/global.css`              | Removed duplicate Google Fonts @import              | Critical |
| `app/layout.tsx`                 | Removed `force-dynamic`, cleaned unused imports     | Critical |
| `screens/landing/header-row.tsx` | Dynamic import for lottie-web + animation JSON      | High     |
| `app/OLDClientLayout.tsx`        | Dynamic import for 8 modal components               | High     |
| `app/(public)/.../page.tsx`      | Plain `<script>` for JSON-LD, removed Script import | Medium   |

---

## 7. Testing & Verification

### 7.1 How to Test

```bash
# 1. Rebuild the application
cd next
npm run build

# 2. Start production server
npm run start

# 3. Run Lighthouse audit
# Option A: Chrome DevTools → Lighthouse tab → Performance
# Option B: CLI
npx lighthouse http://localhost:8080/en-NL/car-parts/selenia/m3hfrdzrkadvp6 --only-categories=performance --output=html --output-path=./lighthouse-report.html
```

### 7.2 Key Metrics to Compare

| Metric            | Before (Expected) | After (Expected) |
| ----------------- | ----------------- | ---------------- |
| Performance Score | 37                | 60-75+           |
| FCP               | ~3-5s             | ~1-2s            |
| LCP               | ~5-10s            | ~2-4s            |
| TBT               | ~1-3s             | ~0.3-1s          |
| CLS               | ~0.1-0.3          | ~0.05-0.1        |

### 7.3 Regression Checklist

- [ ] Product images load correctly (WebP/AVIF format in Network tab)
- [ ] Fonts render correctly (no FOUT/FOIT issues)
- [ ] Lottie cart animation plays in header
- [ ] All modals open correctly (search, filter, language, address edit)
- [ ] JSON-LD structured data visible in page source
- [ ] GTM fires correctly after Cookiebot consent
- [ ] No console errors on page load

### 7.4 Bundle Analysis

```bash
# Run bundle analyzer to verify JS reduction
NEXT_PUBLIC_BUNDLE_ANALYZER=true npm run build
```

---

## 8. Appendix: Lighthouse Metrics Explained

| Metric                             | Weight | What It Measures                              |
| ---------------------------------- | ------ | --------------------------------------------- |
| **FCP** (First Contentful Paint)   | 10%    | Time until first text/image is painted        |
| **LCP** (Largest Contentful Paint) | 25%    | Time until largest visible element is painted |
| **TBT** (Total Blocking Time)      | 30%    | Sum of blocking time for long tasks (>50ms)   |
| **CLS** (Cumulative Layout Shift)  | 25%    | Visual stability — how much content shifts    |
| **SI** (Speed Index)               | 10%    | How quickly content is visually populated     |

### Scoring Thresholds (Lighthouse v12)

| Score  | Rating                     |
| ------ | -------------------------- |
| 90-100 | Good (green)               |
| 50-89  | Needs Improvement (orange) |
| 0-49   | Poor (red)                 |

---

## 9. Phase 2: Bundle Size Reduction (Treemap Analysis)

### 9.1 Initial Treemap (19.4 MiB total)

| Chunk                         | Size    | % of Total |
| ----------------------------- | ------- | ---------- |
| `global-error.js`             | 3.6 MiB | 19%        |
| `car-parts/.../page.js`       | 3.3 MiB | 17%        |
| `layout.js`                   | 3.1 MiB | 16%        |
| `(public)/layout.js`          | 3.0 MiB | 16%        |
| `error.js`                    | 1.7 MiB | 9%         |
| `main-app.js`                 | 1.3 MiB | 7%         |
| Lazy-loaded modals (6 chunks) | 2.4 MiB | 12%        |
| Other                         | 1.0 MiB | 5%         |

**Top 5 chunks = 14.7 MiB (76%)** — all caused by unused or over-imported dependencies.

### 9.2 Root Causes & Fixes

#### Fix 8: `(public)/layout.tsx` — 8 unused imports (~2+ MiB savings)

**Problem:** The public layout imported 8 landing page section components that were **never rendered**:

- `WhyUs_BrandValues`, `OurBrandsYourTrust`, `BrowseByCategory`, `Reviews`, `KeyFeaturesSection`, `FaqSection`
- `PreviousSearchCarousel`, `PreviousSearchClientContainer`, `SevenPreviousSearches`
- `BottomNavBar`, `FooterLanding`, `RedirectManager`
- `Anton`, `Inter`, `Overpass` (duplicate font imports)

These were dead code — imported but never used in the `PublicLayout` render function. Webpack cannot tree-shake them because they could have side effects.

**Fix:** Removed all unused imports.

#### Fix 9: `global-error.tsx` — Full app shell in error page (3.6 MiB → ~5 KiB)

**Problem:** The global error page imported the **entire application shell**:

- `OLDClientLayout` (pulls in Auth0, QueryClient, all modals, styled-jsx registry)
- `HeaderRow` (pulls in lottie-web, animations, 20+ stores)
- `FooterLanding`, `BottomNavBar`, `RedirectManager`
- All 6 context providers (Config, Store, Color, Theme, Typography)
- All 7 Google Fonts via `next/font/google`
- `@sentry/nextjs` (static import)

This is a **catastrophic error boundary** — it only renders when the entire app crashes. It should be self-contained with zero dependencies on the app.

**Fix:** Replaced with a minimal self-contained error page using inline styles, dynamic Sentry import, and no provider tree.

#### Fix 10: `error.tsx` — Unused HeaderRow + static Sentry (1.7 MiB → ~0.3 MiB)

**Problem:**

- Static `import HeaderRow from "@/screens/landing/header-row"` — never rendered (commented out in JSX) but still bundled with lottie + animations
- `import * as Sentry from "@sentry/nextjs"` — static import adds ~50KB+
- Unused `Suspense`, `useLayoutEffect`, `dynamic` imports

**Fix:** Removed all unused imports, switched Sentry to dynamic import.

#### Fix 11: `productdetails.tsx` — 11 unused imports in page component

**Problem:** The main PDP component had 11 imports that were never used in the render output:

- `Productmatchingcars` (already lazy-loaded from `page.tsx`)
- `Productnavigation`, `Productmanufacturerbrand` (commented out in JSX)
- `Addtocart` (commented out in JSX)
- `SearchContainer` (commented out, moved to `page.tsx`)
- `OGAlert`, `CustomTooltip`, `Image`, `exclamicon`, `star`
- `useGetMatchingCarsQuery`, `useParams`

Each unused import pulls its entire dependency tree into the page chunk.

**Fix:** Removed all 11 unused imports.

### 9.3 Expected Bundle Reduction

| Chunk                       | Before  | After (Est.) | Savings      |
| --------------------------- | ------- | ------------ | ------------ |
| `global-error.js`           | 3.6 MiB | ~5 KiB       | ~3.6 MiB     |
| `(public)/layout.js`        | 3.0 MiB | ~0.5 MiB     | ~2.5 MiB     |
| `car-parts/.../page.js`     | 3.3 MiB | ~1.5 MiB     | ~1.8 MiB     |
| `error.js`                  | 1.7 MiB | ~0.3 MiB     | ~1.4 MiB     |
| **Total estimated savings** |         |              | **~9.3 MiB** |

### 9.4 Additional Files Modified (Phase 2)

| File                                        | Change                                          | Impact   |
| ------------------------------------------- | ----------------------------------------------- | -------- |
| `app/(public)/layout.tsx`                   | Removed 8 unused landing page imports           | ~2+ MiB  |
| `app/global-error.tsx`                      | Replaced with minimal self-contained error page | ~3.6 MiB |
| `app/error.tsx`                             | Removed unused HeaderRow, Sentry static import  | ~1.4 MiB |
| `screens/productdetails/productdetails.tsx` | Removed 11 unused imports                       | ~1.8 MiB |

---

## 10. Third-Party Scripts and Lighthouse (Mobile Category Page)

Lighthouse may report browser errors, bf-cache prevention, and unused/legacy JS from third-party scripts. These are configuration or GTM/tag changes, not in-repo code fixes.

### 10.1 Freshdesk

- **Issue:** `TypeError: Cannot read properties of undefined (reading 'init')`; bf-cache prevented by unload handler in Freshdesk widget.
- **Recommendation:** If the widget is loaded via GTM or a global script, load it only after user interaction (e.g. "Help" or "Contact" click) or after `requestIdleCallback`/post-LCP. Fix or guard the `init` call so the error does not fire. Deferring the widget improves TBT and allows bf-cache.

### 10.2 GTM (Google Tag Manager)

- GTM is loaded via `@next/third-parties/google` in `components/GTM.tsx` with default (afterInteractive) strategy.
- **Recommendation:** In the GTM container, configure heavy tags (Facebook, Freshdesk) to fire after consent and, if possible, after LCP or on interaction (e.g. when user opens help or social share).

### 10.3 Facebook (fbevents.js)

- **Issue:** Legacy JavaScript and deprecations (e.g. AttributionReporting) in third-party code; unused JS on pages that do not need the SDK.
- **Recommendation:** Load the Facebook SDK only when needed (e.g. for login or share) rather than on every page. Prefer loading after user interaction or after LCP.

### 10.4 Optional: Category Page Caching (TTFB)

- **Current:** L3 category page is server-rendered; `fetchCategoryTree` uses in-memory cache (24h). The L3 route does not set `revalidate` or `dynamic`.
- **Optional:** If category content can be stale for a short period, add `export const revalidate = 3600` to the L3 page file (`app/(public)/[language-country]/car-parts/category/[l1]/[l2]/[l3]/page.tsx`) so Next.js can cache the generated page and improve TTFB. Trade-off: category tree or copy changes may take up to 1 hour to appear.

---

_Report generated as part of the Ottogusto performance optimization initiative._
