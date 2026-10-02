# Adding a New Store - Developer Guide

This guide explains how to add a new store/brand to the multi-store platform. The architecture uses centralized constants and environment variables to manage store-specific configurations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Store Configuration Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  .env files          →  store-constants.ts  →  Theme System     │
│  (STORE, NEXT_PUBLIC_STORE)    (STORE_IDS)      (Colors, Fonts) │
│                                                                  │
│                              ↓                                   │
│                                                                  │
│  client-theme-config.ts  ←──┴──→  ColorProvider.tsx             │
│  (Themes, Feature Flags)         (CSS Variables)                │
│                                                                  │
│                              ↓                                   │
│                                                                  │
│                    Component Rendering                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Guide

### Step 1: Update Store Constants

**File:** `next/config/store-constants.ts`

Add your new store to the centralized constants:

```typescript
// 1. Add store ID
export const STORE_IDS = {
  OTTOGUSTO: "ottogusto",
  QVERDE: "qverde",
  NEWSTORE: "newstore", // ← Add your store ID (lowercase)
} as const;

// 2. Add display name
export const STORE_DISPLAY_NAMES = {
  [STORE_IDS.OTTOGUSTO]: "Ottogusto",
  [STORE_IDS.QVERDE]: "Qverde",
  [STORE_IDS.NEWSTORE]: "NewStore", // ← Add display name (proper case)
} as const;

// 3. (Optional) Add convenience helper
export function isNewstore(): boolean {
  return CURRENT_STORE === STORE_IDS.NEWSTORE;
}
```

### Step 2: Create Theme Configuration

**File:** `next/config/client-theme-config.ts`

Add a complete theme configuration for your store:

```typescript
// 1. Create the theme object (copy from ottogustoTheme as template)
const newstoreTheme = {
  Color: {
    Background: {
      white: "#FFFFFF",
    },
    Brand: {
      100: "#YOUR_COLOR",
      200: "#YOUR_COLOR",
      // ... all color variants
      700: "#YOUR_PRIMARY_COLOR",
      800: "#YOUR_PRIMARY_DARK",
      900: "#YOUR_PRIMARY_DARKER",
    },
    Accent: {
      // ... accent colors
    },
    Neutral: {
      // ... neutral colors
    },
    Info: {/* ... */},
    Danger: {/* ... */},
    Warning: {/* ... */},
    Positive: {/* ... */},
    // Add any custom color palettes for your brand
  },
  Font: {
    Family: {
      Title: "'YourTitleFont', sans-serif",
      Body: "'YourBodyFont', sans-serif",
    },
    // ... font sizes, weights, line heights
  },
};

// 2. Add to CLIENT_THEME_CONFIG.stores object
export const CLIENT_THEME_CONFIG = {
  stores: {
    [STORE_IDS.OTTOGUSTO]: {/* ... */},
    [STORE_IDS.QVERDE]: {/* ... */},
    [STORE_IDS.NEWSTORE]: {
      // ← Add your store config
      mobile: newstoreTheme,
      desktop: newstoreTheme,
    },
  },
  // ...
};
```

### Step 3: Configure Feature Flags

**File:** `next/config/client-theme-config.ts`

Each store can have different feature flags:

```typescript
// In CLIENT_THEME_CONFIG.stores[STORE_IDS.NEWSTORE]
{
  mobile: {
    ...newstoreTheme,
    featureFlags: {
      brands_filter_feature_flag: true,
      show_left_nav_flag: false,
      vin_feature_flag: true,
      engine_trim_feature_flag: false,
      fbt_feature_flag: true,
      mobile_bottom_nav_enabled: true,
      saved_car_feature_flag: true,
      view_all_brands_page_flag: true,
      delivery_method_flag: false,
      social_pages_feature_flag: true,
      testimonials_feature_flag: true,
      footer_PopularLinks_feature_flag: false,
      pride_job_well_done_flag: false,
      homepage_ottogusto_way_flag: false,
      MyGarage_page_feature_flag: true,
      compatible_car_section_flag: true,
      payment_method_feature_flag: true,
      checkout_email_capture_feature_flag: true,
    },
  },
  desktop: {
    // ... same structure
  },
}
```

### Step 4: Update Domain Detection

**File:** `next/config/client-theme-config.ts`

Add domain patterns for your store in `getStoreFromDomain()`:

```typescript
export function getStoreFromDomain(domain: string): StoreName {
  // ... existing code ...

  // Add detection for your store domains
  if (
    hostname === "newstore.com" ||
    hostname === "dev.newstore.com" ||
    hostname === "dev-ns.ottogusto.com" ||
    hostname.includes("newstore") ||
    hostname.startsWith("dev-ns")
  ) {
    return STORE_IDS.NEWSTORE;
  }

  // Update subdomain mapping
  switch (storeCode) {
    case "og":
      return STORE_IDS.OTTOGUSTO;
    case "qv":
      return STORE_IDS.QVERDE;
    case "ns": // ← Add your store code
      return STORE_IDS.NEWSTORE;
    default:
      return CLIENT_THEME_CONFIG.settings.defaultStore;
  }
}
```

### Step 5: Add Color Mappings

**File:** `next/components/ColorProvider.tsx`

Add color mappings for your store in the colorMappings array:

```typescript
const colorMappings = [
  // Add your store to EACH mapping
  {
    name: "color-text-emphasis",
    [STORE_IDS.OTTOGUSTO]: "Neutral.900",
    [STORE_IDS.QVERDE]: "Neutral.900",
    [STORE_IDS.NEWSTORE]: "Neutral.900", // ← Add for each color
  },
  {
    name: "color-text-brand",
    [STORE_IDS.OTTOGUSTO]: "Brand.700",
    [STORE_IDS.QVERDE]: "Brand.700",
    [STORE_IDS.NEWSTORE]: "Brand.600", // ← Can be different per store
  },
  // ... repeat for ALL color mappings (~300+ entries)
];
```

### Step 6: Update Theme Aliases

**File:** `next/config/theme-alias.ts`

Add store-specific color aliases:

```typescript
export const color_primary_main =
  store === STORE_IDS.OTTOGUSTO
    ? "--color-piston-900m"
    : store === STORE_IDS.QVERDE
      ? "--color-green-500m"
      : store === STORE_IDS.NEWSTORE
        ? "--color-your-primary" // ← Add
        : "--color-piston-900m"; // fallback

// Repeat for all color aliases
```

### Step 7: Create Environment Files

Create environment files for your store:

**File:** `next/.env.newstore.local` (for local development)

```env
# Store Configuration
STORE=newstore
NEXT_PUBLIC_STORE=newstore
NEXT_SITE_NAME=NewStore

# API Configuration
NEXT_PUBLIC_API_URL=https://api-dev.newstore.com/api
FRONTEND_PROD_URL=https://dev.newstore.com
NEXT_PUBLIC_FRONTEND_PROD_URL=https://dev.newstore.com

# CDN
NEXT_PUBLIC_CDN_BASE=https://cdn.newstore.com

# Support
NEXT_PUBLIC_SUPPORT_EMAIL=support@newstore.com

# Analytics (GTM)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXX

# Sentry
SENTRY_PROJECT=newstore
NEXT_PUBLIC_SENTRY_ENABLED=true

# Feature flags (can override defaults)
# These are optional - defaults come from client-theme-config.ts
```

**File:** `next/.env.newstore.main` (for staging/production)

```env
# Same structure as above with production values
```

### Step 8: Add Translation Labels

The label system provides internationalization (i18n) support with fallback values. Labels are fetched from the API at runtime, with `DEFAULT_LABELS` serving as fallbacks.

#### How the Label System Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      Label Resolution Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Component calls getLabel("key")                                 │
│              ↓                                                   │
│  BrandingContext checks WhiteLabels (from API)                   │
│              ↓                                                   │
│  If not found → Falls back to DEFAULT_LABELS.default             │
│              ↓                                                   │
│  If not found → Returns the key itself                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 8.1: Add Store Name Label

**File:** `next/data/branding/labels.ts`

```typescript
import { STORE_IDS, STORE_DISPLAY_NAMES } from "@/config/store-constants";

export const DEFAULT_LABELS = {
  default: {
    // Store names - used by getLabel(STORE_IDS.NEWSTORE)
    [STORE_IDS.OTTOGUSTO]: STORE_DISPLAY_NAMES[STORE_IDS.OTTOGUSTO],
    [STORE_IDS.QVERDE]: STORE_DISPLAY_NAMES[STORE_IDS.QVERDE],
    [STORE_IDS.NEWSTORE]: STORE_DISPLAY_NAMES[STORE_IDS.NEWSTORE], // ← Add

    // Other labels...
  },
};
```

#### 8.2: Using Labels in Components

```typescript
import { useBranding } from "@/contexts/BrandingContext";
import { STORE_IDS } from "@/config/store-constants";

function MyComponent() {
  const { getLabel } = useBranding();

  // Get store display name
  const storeName = getLabel(STORE_IDS.NEWSTORE);  // Returns "NewStore"

  // Get any translated label
  const welcomeText = getLabel("header_welcome");  // Returns "Hi, [username]"

  // With dynamic replacement
  const personalWelcome = getLabel("header_welcome", { username: "John" });
  // Returns "Hi, John"

  return <div>{storeName} - {personalWelcome}</div>;
}
```

#### 8.3: Store-Specific Labels Pattern

For labels that differ between stores, use this pattern in components:

```typescript
import { useBranding } from "@/contexts/BrandingContext";
import { STORE_IDS } from "@/config/store-constants";
import { useTheme } from "@/hooks/useThemeConfig";

function StoreSpecificComponent() {
  const { getLabel } = useBranding();
  const { currentStore } = useTheme();

  // Get the current store's display name dynamically
  const storeName = getLabel(currentStore);  // "Ottogusto", "Qverde", or "NewStore"

  // Conditional store-specific labels
  const tagline = currentStore === STORE_IDS.OTTOGUSTO
    ? getLabel("tagline_ottogusto")
    : currentStore === STORE_IDS.QVERDE
    ? getLabel("tagline_qverde")
    : getLabel("tagline_newstore");

  return <h1>{storeName}: {tagline}</h1>;
}
```

#### 8.4: Add Store-Specific Default Labels

If your store needs unique labels, add them to `DEFAULT_LABELS`:

```typescript
export const DEFAULT_LABELS = {
  default: {
    // Store names
    [STORE_IDS.NEWSTORE]: STORE_DISPLAY_NAMES[STORE_IDS.NEWSTORE],

    // NewStore-specific labels (fallbacks)
    tagline_newstore: "Your tagline here",
    newstore_welcome: "Welcome to NewStore!",
    newstore_slogan: "Quality parts, great prices",

    // ... existing labels
  },
};
```

#### 8.5: API Translation Override (Cockpit CMS)

Labels from the API (Cockpit CMS) override `DEFAULT_LABELS`. The backend handles **store-specific labels** - same key can have different values per store.

```
┌─────────────────────────────────────────────────────────────────┐
│                  Cockpit CMS Label Management                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Key: "heading"                                                  │
│  ├── Ottogusto: "I am coder at Ottogusto"                       │
│  ├── Qverde:    "I am coder at Qverde"                          │
│  └── NewStore:  "I am coder at NewStore"                        │
│                                                                  │
│  Frontend calls: getLabel("heading")                             │
│  API returns:    Store-specific value automatically              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**For a new store, add labels in Cockpit CMS:**

1. Navigate to the translations/labels section in Cockpit
2. For each label key, add the new store's value
3. The API will automatically return the correct value based on the current store

**Frontend usage remains simple:**

```typescript
// Same code works for all stores - API handles store-specific values
const heading = getLabel("heading"); // Returns store-specific value from Cockpit
const tagline = getLabel("tagline"); // Returns store-specific value from Cockpit
```

**`DEFAULT_LABELS` in frontend are only fallbacks** - used when:

- API is unavailable
- A specific key is missing from the API response

### Step 9: Update GTM Configuration

**File:** `next/components/GTM.tsx`

Add GTM ID for your store:

```typescript
const getGTMId = (): string => {
  const frontendUrl = process.env.FRONTEND_PROD_URL || "";
  const store = process.env.STORE || process.env.NEXT_PUBLIC_STORE || "";

  // NewStore Production
  if (frontendUrl === "https://newstore.com" && store === STORE_IDS.NEWSTORE) {
    return "GTM-NEWSTORE-PROD";
  }

  // NewStore Development
  if (frontendUrl === "https://dev.newstore.com" && store === STORE_IDS.NEWSTORE) {
    return "GTM-NEWSTORE-DEV";
  }

  // ... existing stores
};
```

### Step 10: Add Store Assets

Create the following assets for your store:

```
next/public/newstore/
├── favicon.png
├── logo.svg
├── logo-white.svg
├── og-image.jpg
└── ... other brand assets
```

### Step 11: Update Middleware (if needed)

**File:** `next/middleware.ts`

If your store needs special API routing:

```typescript
// For NewStore: adjust API URL if needed
if (currentStore === STORE_IDS.NEWSTORE) {
  apiBaseUrl = process.env.NEWSTORE_API_URL || apiBaseUrl;
}
```

---

## Quick Checklist

### Core Configuration

- [ ] **store-constants.ts** - Add `STORE_IDS` entry and `STORE_DISPLAY_NAMES`
- [ ] **client-theme-config.ts** - Add full theme configuration (colors, fonts)
- [ ] **client-theme-config.ts** - Add feature flags for mobile/desktop
- [ ] **client-theme-config.ts** - Update `getStoreFromDomain()` with domains
- [ ] **ColorProvider.tsx** - Add store to all color mappings (~300 entries)
- [ ] **theme-alias.ts** - Add store to all color aliases

### Environment & Deployment

- [ ] **.env files** - Create `.env.newstore.local` and `.env.newstore.main`
- [ ] **GTM.tsx** - Add GTM container ID for dev and production

### Labels & Translations

- [ ] **labels.ts** - Add store name key: `[STORE_IDS.NEWSTORE]: STORE_DISPLAY_NAMES[STORE_IDS.NEWSTORE]`
- [ ] **labels.ts** - Add any store-specific fallback labels (used when API unavailable)
- [ ] **Cockpit CMS** - Add store-specific label values for all existing keys (heading, tagline, etc.)
- [ ] **Cockpit CMS** - Same key can have different values per store - add values for new store

### Assets

- [ ] **Public assets** - Add `public/newstore/` folder with favicon, logo, images
- [ ] **layout.tsx files** - Metadata will auto-use ENV (no changes needed)

### Testing

- [ ] **Local test** - Run with `STORE=newstore npm run dev`
- [ ] **Verify labels** - Check `getLabel()` returns correct values
- [ ] **Verify colors** - Inspect CSS variables in browser dev tools
- [ ] **Verify feature flags** - Test enabled/disabled features

---

## Testing Your New Store

### Local Development

```bash
# Option 1: Use environment variable
STORE=newstore npm run dev

# Option 2: Use store-specific env file
cp .env.newstore.local .env.local
npm run dev

# Option 3: Use query parameter (for quick testing)
# Visit: http://localhost:3000?store=newstore
```

### Verify Configuration

1. Check the browser console for any store detection warnings
2. Verify colors are applied correctly (inspect CSS variables)
3. Test feature flags are working as expected
4. Verify GTM is loading the correct container
5. Check all pages render without hardcoded store references

---

## Common Issues

### Issue: Store not detected

- Verify domain is added to `getStoreFromDomain()`
- Check ENV variables are set correctly
- Ensure store ID is lowercase in STORE_IDS

### Issue: Colors not applying

- Verify all ColorProvider mappings have the new store
- Check theme configuration has all required Color paths
- Run `node getRuntimeStoreColorMapping.node.js` to debug

### Issue: Feature flag not working

- Ensure featureFlags object exists in both mobile and desktop configs
- Verify the flag name matches exactly

### Issue: TypeScript errors

- The `StoreId` type automatically updates from `STORE_IDS`
- If using string comparisons, use `STORE_IDS.NEWSTORE` constant

---

## File Reference

| File                            | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------- |
| `config/store-constants.ts`     | Central source of truth for store IDs and display names |
| `config/client-theme-config.ts` | Theme colors, fonts, feature flags                      |
| `config/theme-alias.ts`         | CSS variable aliases per store                          |
| `components/ColorProvider.tsx`  | Runtime CSS variable injection                          |
| `utils/theme-utils.ts`          | Helper functions for store detection                    |
| `components/GTM.tsx`            | Google Tag Manager per store                            |
| `contexts/BrandingContext.tsx`  | Label/translation provider with `getLabel()` hook       |
| `data/branding/labels.ts`       | Default/fallback translation labels                     |
| `data/branding/seo.ts`          | SEO defaults                                            |
| `data/branding/herobanner.ts`   | Hero banner labels                                      |
| `data/branding/pages.ts`        | Page-specific labels                                    |
| `middleware.ts`                 | API routing per store                                   |

---

## Label System Quick Reference

### Getting Labels in Components

```typescript
// 1. Import the hook
import { useBranding } from "@/contexts/BrandingContext";
import { STORE_IDS } from "@/config/store-constants";

// 2. Use in component
function MyComponent() {
  const { getLabel } = useBranding();

  // Basic usage
  const text = getLabel("label_key");

  // Store name
  const name = getLabel(STORE_IDS.NEWSTORE);

  // With replacements - replaces [placeholder] in label value
  const welcome = getLabel("welcome_message", { name: "User" });

  return <div>{text}</div>;
}
```

### Adding New Labels

1. **Add to Cockpit CMS** (primary source):
   - Add the label key with store-specific values
   - Same key can have different values for each store
   - API automatically returns correct value based on current store

2. **Add fallback** in `data/branding/labels.ts` (optional):

   ```typescript
   my_new_label: "Default text here",
   my_label_with_var: "Hello [name]!",
   ```

   _Fallbacks are only used when API is unavailable_

3. **Use in component**:
   ```typescript
   getLabel("my_new_label");
   getLabel("my_label_with_var", { name: "World" });
   ```

### Store-Specific Labels (Handled by Cockpit)

```
Same key → Different values per store (managed in Cockpit CMS)

Key: "welcome_message"
├── Ottogusto API returns: "Welcome to Ottogusto!"
├── Qverde API returns:    "Welcome to Qverde!"
└── NewStore API returns:  "Welcome to NewStore!"

Frontend code (same for all stores):
const welcome = getLabel("welcome_message");
```

---

## Architecture Benefits

1. **Type Safety**: `StoreId` type is derived from constants - TypeScript catches invalid store references
2. **Single Source of Truth**: All store identifiers come from `store-constants.ts`
3. **ENV-Driven**: Store configuration is environment-based, enabling easy deployment
4. **No Hardcoding**: Store names are never hardcoded in components
5. **Feature Flags**: Each store can enable/disable features independently
6. **Theme Isolation**: Complete visual customization per store
