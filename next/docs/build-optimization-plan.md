# Next.js Build Optimization Plan

Safe, non-breaking changes to reduce bundle size and build output for the `next/` app. All items preserve existing UI and functionality.

---

## Completed Changes

### 1. Fixed `optimizePackageImports` config (HIGH)

**File**: `next.config.js`

Removed invalid/unused entries (`expoimage` x3, `expo-image`, `native-wind`, `lottie-image`). Added high-value packages: `lucide-react-native`, `react-use`, `react-icons`, `@tanstack/react-query`, `framer-motion`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@auth0/auth0-react`, `sonner`.

### 2. Replaced `moment` with native Date APIs (HIGH — ~300KB savings)

**Files**: `helpers/UtilityHelper.ts`, `screens/profile/OrderDetails.tsx`, `screens/profile/orderdetails_bk.tsx`, `screens/support/SupportForm.tsx`

Replaced `moment()` calls with `new Date()` and rewrote `getdaysbetween()` / `getLatestDeliveryDate()` using native `Date` math.

### 3. Replaced `react-icons` with lucide equivalents (MEDIUM)

**Files**: 3x `newCategory-tile.tsx`, `RightPanel.tsx`, `BottomGrid.tsx`

- `FiArrowRight` from `react-icons/fi` → `ArrowRight` from `lucide-react-native`
- `MdOutlineSearch` from `react-icons/md` → `Search` from `lucide-react-native`

### 4. Replaced `useMedia` from `react-use` with custom hook (MEDIUM — ~50KB savings)

**Created**: `hooks/useMedia.ts` — 10-line wrapper around `window.matchMedia`
**Updated**: 88 files had `import { useMedia } from "react-use"` → `import { useMedia } from "@/hooks/useMedia"`

Note: 1 test file (`test/h/page.tsx`) still uses `useNetworkState` from `react-use`.

### 5. Removed unused dependencies from `package.json` (LOW)

Removed: `validate-vat`, `ts-markdown`, `bun`, `yarn` — zero source imports found.

### 6. Removed dead/backup files from build scope

Moved the following files/directories to `BKP/` folder to exclude them from build scope:

- `screens/advanced-search_OLD/` (8 files)
- `screens/profile/orderdetails_bk.tsx`
- `screens/products/DummyProductListOld.tsx`
- `services/cart_bk.ts`
- `app/(public)/[language-country]/car-parts/pageOLD.tsx`
- `app/OLDsitemap.ts`
- `screens/shoppingcart/shoppingcartbk.tsx`, `shoppingcartbk2.tsx`

## Expected Impact

| Change                          | Estimated Savings         | Risk |
| ------------------------------- | ------------------------- | ---- |
| 1. Fix `optimizePackageImports` | ~100-200KB (tree-shaking) | None |
| 2. Replace `moment`             | ~300KB                    | Low  |
| 3. Replace `react-icons`        | ~50-100KB                 | Low  |
| 4. Replace `react-use`          | ~50KB                     | Low  |
| 5. Remove unused deps           | Install time              | None |

**Total estimated**: ~500-650KB reduction in client JS bundle
