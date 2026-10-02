# Brand + L3 URL: Clean path (no manufacturer id in query)

Explains Brand × L3 URLs: clean path in the address bar; manufacturer id from slug API.

Related: [new-brand-page.md](./new-brand-page.md), OD-2433.

---

## Short answer

**Browser / SEO / links:** clean path only — no `brandId` (and no legacy `carId`).

**Parts / View-all SRP:** manufacturer id from `GET /Manufacturer/slug/{brandSlug}` → `brand.id`, passed as props → Parts / search-results `manufacturerIds`.

Optional vehicle only: `?carIds=` / `vin`.

Canonical, sitemap, hreflang, and breadcrumb JSON-LD never include manufacturer query params.

---

## Param glossary

| Param                                          | Meaning                                                    |
| ---------------------------------------------- | ---------------------------------------------------------- |
| **Path `brandSlug`**                           | Resolves manufacturer via slug API → `id`                  |
| **`manufacturerIds`** (Parts body / SRP query) | That manufacturer `id` — **unchanged** mapping             |
| **`carIds` / `vin`**                           | Vehicle context (optional)                                 |
| **Legacy `?brandId=` / `?carId=`**             | Old manufacturer query — Brand+L3 **strips** to clean path |

---

## Example

### Indexed / linked URL

```
https://dev.ottogusto.com/en-BE/car-parts-brands/aks-dasis/ignition-coil-relay
```

### Open in browser

1. `getManufacturerBySlug("aks-dasis")` → `brand.id`
2. Resolve L3 + `GET /Category/{id}`
3. `POST /Parts` with `manufacturerIds: [brand.id]` + `categoryId`
4. No redirect to add manufacturer query

### Legacy bookmark with `?brandId=`

Redirects to the clean path (keeps `carIds` / `vin` if present).

### View all → search-results

```
/en-BE/search-results?categoryId={l3Id}&take=12&order=priority&manufacturerIds={brand.id}
```

Same as before: brand manufacturer id → **`manufacturerIds`** (not URL `brandId`).

---

## Brand landing L3 links

```
/{seg}/{brandSlug}/{l3Slug}
/{seg}/{brandSlug}/{l3Slug}?carIds=…&vin=…   # vehicle only
```

No `?brandId=`.
