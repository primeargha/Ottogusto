# Hreflang Implementation: Server-Side via Next.js Metadata API

Hreflang tags are generated server-side using the Next.js Metadata API (`alternates.languages`) in each page's `generateMetadata()`. This replaced a broken client-side `AlternateLinks.tsx` component (Feb 2026).

## Locale Structure

- **12 locales**: `en-BE`, `nl-BE`, `fr-BE`, `en-NL`, `nl-NL`, `fr-NL`, `en-FR`, `nl-FR`, `fr-FR`, `en-LU`, `nl-LU`, `fr-LU`
- **Countries**: BE, NL, FR, LU
- **Languages**: en, nl, fr
- **x-default**: `en-BE`
- **URL pattern**: `/{locale}/{route-segment}/...`

## Translated Route Segments

| English (`en-*`) | Dutch (`nl-*`)    | French (`fr-*`) |
| ---------------- | ----------------- | --------------- |
| `car-parts`      | `auto-onderdelen` | `pieces-auto`   |

All other routes (`about-us`, `support`, `allbrands`, `shoppingcart`, etc.) use the **same segment** across all locales.

## How It Works

### Utility: `next/utils/hreflang.ts`

```ts
import { buildAlternateLanguages } from "@/utils/hreflang";
```

The `buildAlternateLanguages(pathname)` function:

1. Takes the current pathname (e.g., `"/en-BE/car-parts/toyota/abc123"`)
2. For each of the 12 locales, swaps the locale prefix and translates any language-specific route segment
3. Returns a `Record<string, string>` shaped for `alternates.languages`, including `x-default`

### Usage in `generateMetadata()`

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "language-country": languagecountry } = params;
  return {
    alternates: {
      canonical: `${baseUrl}/${languagecountry}/about-us`,
      languages: buildAlternateLanguages(`/${languagecountry}/about-us`),
    },
    // ... other metadata
  };
}
```

For product detail pages with dynamic slugs:

```ts
languages: buildAlternateLanguages(
  `/${languagecountry}/car-parts/${product?.seo?.name || product?.name || "part"}/${partid}`
),
```

## Rendered Output

For `/en-BE/car-parts/toyota/m3i0kpesu0mn7p`:

```html
<link
  rel="alternate"
  hreflang="en-BE"
  href="https://ottogusto.com/en-BE/car-parts/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="nl-BE"
  href="https://ottogusto.com/nl-BE/auto-onderdelen/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="fr-BE"
  href="https://ottogusto.com/fr-BE/pieces-auto/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="en-NL"
  href="https://ottogusto.com/en-NL/car-parts/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="nl-NL"
  href="https://ottogusto.com/nl-NL/auto-onderdelen/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="fr-NL"
  href="https://ottogusto.com/fr-NL/pieces-auto/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="en-FR"
  href="https://ottogusto.com/en-FR/car-parts/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="nl-FR"
  href="https://ottogusto.com/nl-FR/auto-onderdelen/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="fr-FR"
  href="https://ottogusto.com/fr-FR/pieces-auto/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="en-LU"
  href="https://ottogusto.com/en-LU/car-parts/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="nl-LU"
  href="https://ottogusto.com/nl-LU/auto-onderdelen/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="fr-LU"
  href="https://ottogusto.com/fr-LU/pieces-auto/toyota/m3i0kpesu0mn7p"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://ottogusto.com/en-BE/car-parts/toyota/m3i0kpesu0mn7p"
/>
```

Reciprocity is automatic — every locale page generates all 12 hreflang links + x-default.

## Files

- **`next/utils/hreflang.ts`** — Shared utility (`buildAlternateLanguages`)
- **`next/app/layout.tsx`** — `AlternateLinks` removed from `<head>`
- **`next/app/AlternateLinks.tsx`** — Deleted (was broken: `"use client"`, returned `null` during SSR)
- **18 page files** with `alternates.languages` in `generateMetadata()`:
  - `(public)/[language-country]/page.tsx` (homepage)
  - `about-us/page.tsx`
  - `allbrands/page.tsx`
  - `car-parts/[partname]/page.tsx`
  - `car-parts/[partname]/[partid]/page.tsx`
  - `auto-onderdelen/[partname]/page.tsx`
  - `auto-onderdelen/[partname]/[partid]/page.tsx`
  - `pieces-auto/[partname]/page.tsx`
  - `pieces-auto/[partname]/[partid]/page.tsx`
  - `fitment-details/page.tsx`
  - `migration-faq/page.tsx`
  - `return-policy/page.tsx`
  - `products/page.tsx`
  - `shoppingcart/page.tsx`
  - `shoppingcart/checkout/page.tsx`
  - `support/page.tsx`
  - `support/[category]/page.tsx`
  - `[searchdata]/page.tsx`

## Notes

- 3 client-side category browsing pages (`car-parts/page.tsx`, `auto-onderdelen/page.tsx`, `pieces-auto/page.tsx`) are `"use client"` and cannot use `generateMetadata()` — no hreflang for those pages.
- `CanonicalLink.tsx` is already commented out in `layout.tsx`; canonical is set per-page via `alternates.canonical`.
- Adding a new translated route segment requires updating the `ROUTE_SEGMENT_MAP` and `TRANSLATED_SEGMENTS` in `next/utils/hreflang.ts`.
