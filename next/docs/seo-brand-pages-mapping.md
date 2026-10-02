# SEO title / description / keyword mapping — Car Part Brand pages

Reference for the `<title>` / `<meta name="description">` / `<meta name="keywords">` values on the three car-part-brand surfaces (OD-2426 tree). All keys live in [`data/branding/seo.ts`](../data/branding/seo.ts) (`SEO_LABELS`), merged with backend/cockpit translations (`getTranslations(lang)`) before use — cockpit values win over the static fallback shown here.

Substitution is done with `getLabelUtility()` ([`helpers/UtilityHelper.ts`](../helpers/UtilityHelper.ts)), which replaces bracket tokens — legacy `[token]` and CMS-style `{token}` — found in the template string. The brand+L3 **description** is the one exception: it uses `$TOKEN$`-style tokens substituted manually with `.replaceAll()` (see note below), because `getLabelUtility` does not support that syntax.

---

## 1. Car Part Brands listing page

Route: `/{locale}/{car-parts-brands-seg}` — file: [`app/(public)/[language-country]/manufacturers/page.tsx`](<../app/(public)/[language-country]/manufacturers/page.tsx>)

All three keys are **static** — no dynamic data, no `replaceKeys` passed (`getLabelUtility(mergedTranslations, key, {})`).

| Meta field    | Key                               | Current template (`seo.ts`)                                                                                                                                        | Data mapped in       |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `title`       | `seo.car_part_brands.title`       | `Car Part Brands \| ${siteName}`                                                                                                                                   | none — static string |
| `description` | `seo.car_part_brands.description` | `Browse our full range of trusted OEM and premium car part brands. Select a brand to explore the parts it offers for your vehicle, with fast and secure delivery.` | none — static string |
| `keywords`    | `seo.car_part_brands.keyword`     | `OEM car parts, premium auto parts, car parts by make, all brands, catalog, ${siteNameLower}`                                                                      | none — static string |

---

## 2. Brand details (landing) page

Route: `/{locale}/{car-parts-brands-seg}/{brandSlug}` — file: [`app/(public)/[language-country]/manufacturers/[brandSlug]/page.tsx`](<../app/(public)/[language-country]/manufacturers/[brandSlug]/page.tsx>)

Brand fetched via `getManufacturerBySlug(brandSlug)` (`GET /Manufacturer/slug/{slug}`). L1 category titles fetched via `fetchCategoryTree()` (`GET /Category`).

| Meta field    | Key                                     | Current template (`seo.ts`) | Token          | Mapped to                                                                                                                                        |
| ------------- | --------------------------------------- | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | `seo.car_part_brands_brand.title`       | `[brand]`                   | `[brand]`      | `brand?.name \|\| brandSlug`                                                                                                                     |
| `description` | `seo.car_part_brands_brand.description` | `[sdesc]`                   | `[sdesc]`      | `resolveLocalizedText(brand?.shortDescriptions, lang)`                                                                                           |
| `keywords`    | `seo.car_part_brands_brand.keyword`     | `[brand], [categories]`     | `[brand]`      | `brand?.name \|\| brandSlug`                                                                                                                     |
|               |                                         |                             | `[categories]` | All L1 category titles for the current locale, comma-joined: `l1Categories.map(l1 => l1.titles?.[lang] \|\| l1.name).filter(Boolean).join(", ")` |

---

## 3. Brand × L3 page (OD-2433)

Route: `/{locale}/{car-parts-brands-seg}/{brandSlug}/{l3Slug}?brandId={brand.id}` — file: [`app/(public)/[language-country]/manufacturers/[brandSlug]/[l3Slug]/page.tsx`](<../app/(public)/[language-country]/manufacturers/[brandSlug]/[l3Slug]/page.tsx>)
Canonical / sitemap: path only (no `brandId`).

Brand fetched the same way as above. L3 category matched via `findL3ByLocaleSlug(fetchCategoryTree(), l3Slug, lang)`.

| Meta field    | Key                                              | Current template (`seo.ts`)                                                                                                      | Token                                            | Mapped to                                                                                                      |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `title`       | `seo.car_part_brands_brand_category.title`       | `[brand] [category] \| ${siteName}`                                                                                              | `[brand]`                                        | `brand?.name \|\| brandSlug`                                                                                   |
|               |                                                  |                                                                                                                                  | `[category]`                                     | `match.l3.titles?.[lang] \|\| match.l3.name` (L3 title)                                                        |
| `description` | `seo.car_part_brands_brand_category.description` | `$BRAND_DESCRIPTION$ $L3_DESCRIPTION$ Genuine OE parts for Alfa Romeo, Fiat, Lancia, Abarth and Jeep, available at ${siteName}.` | `$BRAND_DESCRIPTION$`                            | `resolveLocalizedText(brand?.shortDescriptions, lang)`                                                         |
|               |                                                  |                                                                                                                                  | `$L3_DESCRIPTION$`                               | `resolveLocalizedText(match.l3.descriptions, lang) \|\| resolveLocalizedText(match.l3.fullDescriptions, lang)` |
| `keywords`    | `seo.car_part_brands_brand_category.keyword`     | `OEM car parts, premium auto parts, car parts by make, all brands, catalog, ${siteNameLower}`                                    | `[brand]` / `[category]` passed as `replaceKeys` | Template has no tokens today, so `brand`/`category` are currently inert here — static string is rendered as-is |

**Description substitution differs from the other two keys**: it is _not_ run through `getLabelUtility`'s `replaceKeys`. The raw template is fetched with no `replaceKeys` (`getLabelUtility(mergedTranslations, "seo.car_part_brands_brand_category.description")`), then manually substituted:

```ts
const seoDesc = seoDescTemplate
  .replaceAll("$BRAND_DESCRIPTION$", brandDescription)
  .replaceAll("$L3_DESCRIPTION$", l3BodyDescription)
  .replace(/\s{2,}/g, " ")
  .trim();
```

### On-page body description (not a meta tag)

Separately from the `<head>` meta description above, the brand×L3 page also renders a **visible body paragraph** under the H1, driven by its own template key — `car_part_brands_L3_description` in [`data/branding/labels.ts`](../data/branding/labels.ts) — resolved client-side in [`screens/car-part-brands/CarPartBrandL3Page.tsx`](../screens/car-part-brands/CarPartBrandL3Page.tsx):

| Key                              | Current template (`labels.ts`)         | Token                 | Mapped to                                                                                    |
| -------------------------------- | -------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `car_part_brands_L3_description` | `$BRAND_DESCRIPTION$ $L3_DESCRIPTION$` | `$BRAND_DESCRIPTION$` | `resolveLocalizedText(brand.shortDescriptions, lang)`                                        |
|                                  |                                        | `$L3_DESCRIPTION$`    | `l3Description` prop (page-resolved: `l3.descriptions[lang] \|\| l3.fullDescriptions[lang]`) |

Same `$TOKEN$`/`.replaceAll()` substitution style as the meta description above, but computed independently on the client and rendered as page copy, not `<meta>`.

---

## Summary table — all keys at a glance

| Page                                | Title key                                  | Description key                                  | Keyword key                                  |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------ | -------------------------------------------- |
| Brands listing                      | `seo.car_part_brands.title`                | `seo.car_part_brands.description`                | `seo.car_part_brands.keyword`                |
| Brand details                       | `seo.car_part_brands_brand.title`          | `seo.car_part_brands_brand.description`          | `seo.car_part_brands_brand.keyword`          |
| Brand × L3                          | `seo.car_part_brands_brand_category.title` | `seo.car_part_brands_brand_category.description` | `seo.car_part_brands_brand_category.keyword` |
| Brand × L3 (on-page body, not meta) | —                                          | `car_part_brands_L3_description` (`labels.ts`)   | —                                            |
