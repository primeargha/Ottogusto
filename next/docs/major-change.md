# Major Change: API Call Optimization for Brands and Translations

## Overview

This document describes the implementation of optimization strategies to prevent duplicate API calls for **Brands** and **Translations** APIs across the Next.js application. The solution ensures each API is called only **once per page load** and when necessary, using Context API pattern instead of React Query for these specific endpoints.

## Problem Statement

### Initial Issues

1. **Brands API** (`/api/MakeModelType/brands`) was being called **multiple times** (3-4 times) on page load and when interacting with dropdowns
2. **Translations API** (`/api/Translations/{lang}`) was being called **multiple times** (2-3 times) on page load and when switching languages
3. Multiple components were making independent API calls instead of sharing cached data
4. React Query deduplication was not working effectively for these specific APIs

### Root Causes

- Multiple components mounting simultaneously and fetching the same data
- React Query's automatic deduplication had timing issues with React 18 StrictMode
- Store-based fetching (Zustand) was bypassing React Query's cache
- No centralized data source for these commonly used APIs

## Solution Approach

### Strategy

Instead of using React Query for Brands and Translations APIs, we implemented a **Context API-based solution** that:

1. **Fetches data once** at the application initialization level
2. **Shares the same data instance** across all components via Context
3. **Uses React refs** to prevent duplicate calls even with React 18 StrictMode
4. **Maintains backward compatibility** with existing component code

### Design Decisions

- **Context API over React Query**: For these specific APIs, Context API provides better control and prevents race conditions
- **Server-side initial data**: Translations are fetched server-side and passed as props to avoid client-side fetch on initial load
- **Ref-based guards**: Using `useRef` pattern to ensure effects run only once, even with StrictMode double-mounting
- **Store synchronization**: Components populate Zustand stores from Context data, maintaining existing store-based logic

## Implementation Details

### 1. Brands API Optimization

#### Created: `BrandsContext.tsx`

```typescript
// Key Features:
- Fetches brands data ONCE on provider mount
- Uses useRef pattern to prevent duplicate calls (StrictMode safe)
- Provides brands data through Context API
- All components share the same data instance
```

**Location**: `next/contexts/BrandsContext.tsx`

**Key Implementation Pattern**:

```typescript
const hasFetched = useRef(false);
const isFetching = useRef(false);

useEffect(() => {
  if (hasFetched.current || isFetching.current) return;

  isFetching.current = true;
  hasFetched.current = true;

  // Fetch brands once
  fetchBrands();
}, []); // Empty dependency array ensures single execution
```

#### Integration

- **Provider Placement**: Added `BrandsProvider` in `next/app/registry.tsx` (wrapped around children)
- **Hook Usage**: Created `useBrands()` hook for components to access brands data
- **Components Updated**:
  - `next/screens/brands/brandlist.tsx`
  - `next/screens/landing/our-brands-your-trust/index.tsx`
  - `next/components/og-components/OGFeatureMakes/index.tsx`
  - `next/screens/landing/footer/BrandsAndPartsSection.tsx`
  - `next/components/MMESearchFilter.tsx`
  - `next/components/MMESearchFilter2.tsx`
  - `next/components/MMEBaseSearch.tsx`

### 2. Translations API Optimization

#### Updated: `BrandingContext.tsx`

**Key Changes**:

- Added `useRef` pattern to prevent duplicate client-side fetches
- Only fetches if server-side data (`initialTranslations`) is not provided
- Tracks last fetched language to prevent refetching same language
- Language switching only fetches if language actually changed

**Location**: `next/contexts/BrandingContext.tsx`

**Key Implementation Pattern**:

```typescript
const hasInitialized = useRef(false);
const isFetching = useRef(false);
const lastFetchedLang = useRef<string | null>(null);

useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  if (initialTranslations) {
    // Use server-provided data (no API call)
    setWhiteLabels(trimObjectKeys(initialTranslations));
  } else {
    // Fallback to client-side fetch if needed
    getWhiteLabels(langCode);
  }
}, []); // Empty dependency array
```

#### Server-Side Integration

- **Layout Level**: `next/app/layout.tsx` fetches translations server-side once
- **Data Flow**: Server data → `RootLayout` → `OLDClientLayout` → `StyledJsxRegistry` → `BrandingProvider`
- **Benefits**: No client-side API call on initial page load

### 3. MME Store Integration

#### Updated: `useMmeStore.ts`

**Changes to `setStep` function**:

- **Step 1 (Brands)**: Removed `fetchBrands()` call - components handle via BrandsContext
- **Step 2 (Models)**: Only fetches if `searchResults` is empty (prevents duplicate calls)
- **Step 3 (Engines)**: Only fetches if `searchResults` is empty (prevents duplicate calls)

**Key Pattern**:

```typescript
case 2: // Models
  if (searchData.make?.key) {
    // ✅ Only fetch if searchResults is empty (prevents duplicate calls)
    if (searchResults.length === 0) {
      await get().fetchModels(searchData.make.key);
    }
    // If searchResults already has data, keep it (no need to refetch)
  }
  break;
```

#### Component Updates

- Removed duplicate `fetchModels()` and `fetchEngines()` calls from component handlers
- Components now rely on `setStep()` function which handles fetching logic with duplicate prevention

## File Changes Summary

### New Files Created

- `next/contexts/BrandsContext.tsx` - Brands context provider and hook

### Files Modified

1. **Context Files**:
   - `next/contexts/BrandingContext.tsx` - Added ref-based duplicate prevention

2. **Layout/Registry Files**:
   - `next/app/registry.tsx` - Added BrandsProvider wrapper
   - `next/app/layout.tsx` - Server-side translations fetch (already existed, enhanced)

3. **Component Files** (Replaced React Query with Context API):
   - `next/screens/brands/brandlist.tsx`
   - `next/screens/landing/our-brands-your-trust/index.tsx`
   - `next/components/og-components/OGFeatureMakes/index.tsx`
   - `next/screens/landing/footer/BrandsAndPartsSection.tsx`
   - `next/components/MMESearchFilter.tsx`
   - `next/components/MMESearchFilter2.tsx`
   - `next/components/MMEBaseSearch.tsx`

4. **Store Files**:
   - `next/stores/useMmeStore.ts` - Updated `setStep` to prevent duplicate API calls

5. **Files Removed**:
   - `next/components/AppDataPrefetcher.tsx` - No longer needed (removed React Query prefetch approach)

## How It Works

### Brands API Flow

1. **App Initialization**:

   ```
   BrandsProvider mounts → useEffect runs → Checks ref guards → Fetches brands once → Stores in state
   ```

2. **Component Usage**:

   ```
   Component mounts → useBrands() hook → Gets brands from Context → Transforms if needed → Uses in component
   ```

3. **MME Filter Integration**:
   ```
   Component → useBrands() → Gets brands → Transforms to store format → setSearchResults() → Store populated
   ```

### Translations API Flow

1. **Server-Side (Initial Load)**:

   ```
   layout.tsx → getTranslations(lang) → Passed as props → BrandingProvider receives initialTranslations → Sets state (no API call)
   ```

2. **Client-Side (Language Switch)**:

   ```
   changeLocale(lang) → Checks if already fetched → If not, fetches → Updates state
   ```

3. **Fallback (No Server Data)**:
   ```
   BrandingProvider mounts → No initialTranslations → useEffect runs once → Fetches from localStorage locale
   ```

## Benefits

### Performance Improvements

1. **Reduced API Calls**:
   - Brands: From 3-4 calls → **1 call** per page load
   - Translations: From 2-3 calls → **1 call** per page load (server-side) or language change

2. **Faster Initial Load**:
   - Translations loaded server-side, eliminating client-side fetch delay
   - Brands cached immediately after first fetch, shared across all components

3. **Better Network Efficiency**:
   - Eliminated redundant network requests
   - Reduced server load
   - Improved user experience with faster page loads

### Code Quality

1. **Single Source of Truth**:
   - All components use the same data instance
   - Consistent data across the application

2. **Maintainability**:
   - Centralized data fetching logic
   - Easy to update if API structure changes

3. **Backward Compatibility**:
   - Existing components continue to work
   - Store-based logic preserved
   - No breaking changes

## Key Patterns Used

### 1. useRef Guard Pattern (React 18 StrictMode Safe)

```typescript
const hasFetched = useRef(false);
const isFetching = useRef(false);

useEffect(() => {
  if (hasFetched.current || isFetching.current) return;
  hasFetched.current = true;
  isFetching.current = true;

  // Your fetch logic here

  isFetching.current = false;
}, []); // Empty dependency array
```

**Why**: Prevents duplicate execution even when React 18 StrictMode mounts components twice in development.

### 2. Context-Based Data Sharing

```typescript
// Provider
const [data, setData] = useState(null);
// Fetch once
return <Context.Provider value={{ data }}>{children}</Context.Provider>;

// Consumer
const { data } = useContext(MyContext);
```

**Why**: Ensures all components share the same data instance, preventing duplicate fetches.

### 3. Conditional Fetching Pattern

```typescript
if (searchResults.length === 0) {
  await fetchData();
} else {
  // Use existing data, no fetch needed
}
```

**Why**: Prevents redundant API calls when data already exists.

## Migration Notes

### For Future Development

1. **Adding New Components That Need Brands**:

   ```typescript
   import { useBrands } from "@/contexts/BrandsContext";

   const MyComponent = () => {
     const { brands, isLoading } = useBrands();
     // Use brands data directly - no API call needed
   };
   ```

2. **Adding New Components That Need Translations**:

   ```typescript
   import { useBranding } from "@/contexts/BrandingContext";

   const MyComponent = () => {
     const { getLabel } = useBranding();
     // Translations already available via context
   };
   ```

3. **When to Use React Query vs Context API**:
   - **Use Context API**: For data needed app-wide, fetched once, shared across many components
   - **Use React Query**: For data with frequent updates, pagination, background refetching needs

### Testing Considerations

1. **React 18 StrictMode**: The solution handles double-mounting correctly
2. **Server-Side Rendering**: Translations work correctly with SSR
3. **Language Switching**: Only fetches when language actually changes
4. **Component Mounting**: Brands available immediately to all components

## Troubleshooting

### If Brands API is Still Called Multiple Times

1. Check if `BrandsProvider` is properly wrapped in `registry.tsx`
2. Verify components are using `useBrands()` hook, not direct API calls
3. Check if any stores are still calling `getBrands()` directly
4. Ensure `useRef` guards are in place in `BrandsContext`

### If Translations API is Still Called Multiple Times

1. Verify `initialTranslations` is being passed from `layout.tsx`
2. Check if `hasInitialized` ref is properly set
3. Ensure `changeLocale` checks for existing language before fetching
4. Verify server-side fetch in `layout.tsx` is working
