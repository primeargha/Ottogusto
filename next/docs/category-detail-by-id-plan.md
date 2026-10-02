# Plan: Category SEO/FAQ from `GET /Category/{id}` only

## Status (implemented)

- List normalize strips `descriptions` / `fullDescriptions` / `faq`.
- `mergeCategoryWithDetail` takes SEO fields **only** from `GET /Category/{id}`.
- Catalog L1/L2/L3 via `resolveL*CategoryPage` (unchanged flow, hardened merge).
- Brand+L3 merges L3 detail for meta + body copy.
- Brand landing no longer shows per-L1 category descriptions from the list API.

See also: [category-api-optimization.md](./category-api-optimization.md).

---

Backend is removing `descriptions`, `fullDescriptions`, and `faq` from the **list** APIs:

- `GET /api/Category`
- `GET /api/Category?parentId={id}`

Those fields live only on:

```http
GET /api/Category/{id}
```

**Goal:** Nothing breaks. L1 / L2 / L3 (and any other page that shows category SEO copy / FAQ) must load that data from the detail-by-id API. List/tree APIs stay for structure, titles, slugs, children only.

Related: [category-api-optimization.md](./category-api-optimization.md), [new-brand-page.md](./new-brand-page.md).

---

## Contract (what stays where)

| Data                                     | List (`/Category`, `?parentId=`) | Detail (`/Category/{id}`)                           |
| ---------------------------------------- | -------------------------------- | --------------------------------------------------- |
| `id`, `parentId`, `name`, `displayOrder` | Yes                              | Yes                                                 |
| `titles`, `slugs`                        | Yes (routing / nav)              | Yes (may enrich)                                    |
| `children` (L2→L3 on parentId)           | Yes                              | Ignore / empty — **do not overwrite** tree children |
| `descriptions`                           | **Removed**                      | **Source of truth**                                 |
| `fullDescriptions`                       | **Removed**                      | **Source of truth**                                 |
| `faq`                                    | **Removed**                      | **Source of truth**                                 |

Detail response shape (backend):

```json
{
  "id": "string",
  "parentId": "string",
  "name": null,
  "displayOrder": 1,
  "titles": null,
  "descriptions": null,
  "fullDescriptions": null,
  "slugs": null,
  "faq": [
    {
      "id": "string",
      "order": 1,
      "lang": "nl",
      "question": null,
      "answer": null
    }
  ],
  "children": []
}
```

Store scoping via existing API key / headers — unchanged.

---

## Current FE (already correct for catalog L1/L2/L3)

Catalog SEO pages already do **not** depend on list FAQ/descriptions for the **active** category:

```text
URL slug(s)
  → fetchCategoryTree()          // list: structure + slugs + children
  → find L1 / L2 / L3 by slug
  → fetchCategoryDetail(node.id) // GET /Category/{id}
  → mergeCategoryWithDetail()
  → page UI + generateMetadata + FAQ JSON-LD
```

| Page | Resolver                | Detail call today            |
| ---- | ----------------------- | ---------------------------- |
| L1   | `resolveL1CategoryPage` | `fetchCategoryDetail(l1.id)` |
| L2   | `resolveL2CategoryPage` | `fetchCategoryDetail(l2.id)` |
| L3   | `resolveL3CategoryPage` | `fetchCategoryDetail(l3.id)` |

Consumers of the **merged** node (keep as-is):

- `CategoryDescription` → `descriptions`
- `CategoryLearnAndFAQ` / L2 / L3 variants → `fullDescriptions` + `faq`
- `categoryFaqCollect` + `CategoryFAQJsonLd`
- `categoryL1Metadata` / `L2` / `L3` → meta `description` from `descriptions`

`mergeCategoryWithDetail` already merges SEO fields without replacing `children` from detail (safe when detail returns `children: []`).

**Catalog L1/L2/L3: no architectural change required** — verify + harden only.

---

## Gap analysis (what breaks if we do nothing)

| Surface                                                    | Uses list tree for SEO fields?                                         | After backend strip                                 | Action                                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Catalog L1 / L2 / L3 pages + metadata                      | No (detail already)                                                    | OK                                                  | Verify end-to-end                                                                                            |
| Brand + L3 (`manufacturers/[brandSlug]/[l3Slug]/page.tsx`) | **Yes** — `l3.descriptions` / `fullDescriptions` from tree only        | **Breaks** body + meta description                  | Call `fetchCategoryDetail(l3.id)` + merge                                                                    |
| Brand landing (`CarPartBrandLandingPage`)                  | **Yes** — per-L1 `descriptions` / `fullDescriptions` for section blurb | Sections lose copy                                  | Either: (A) skip L1 body copy, or (B) detail only if product requires it — **do not** N× detail for every L1 |
| Homepage `browse-by-category-new`                          | Tile `descriptions` from list                                          | Falls back to `DEFAULT_DESCRIPTION`                 | Accept default **or** branding labels; **do not** detail-fetch every L1 on home                              |
| Home `browse-by-category-2`, filters, advanced search      | titles / slugs / children only                                         | OK                                                  | No change                                                                                                    |
| Sitemap / locale redirect                                  | slugs / structure only                                                 | OK                                                  | No change                                                                                                    |
| Client `useCategories` / IDB nested tree                   | nav only                                                               | OK if code never reads faq from cache for SEO pages | Audit; SEO pages stay SSR detail                                                                             |

---

## End-to-end implementation plan

### Phase 0 — Assumptions to confirm with backend (same day)

1. Detail `GET /Category/{id}` always returns `descriptions`, `fullDescriptions`, `faq` (nullable ok).
2. List responses may omit those keys or send `null` — FE must not crash.
3. `titles` / `slugs` remain on list (required for URL resolve without detail).
4. Detail may return empty `children: []` — FE must keep tree children from list (already true in merge).

### Phase 1 — Harden catalog path (L1 / L2 / L3) — primary ask

1. **Keep** `resolveL*CategoryPage` = tree by slug + `fetchCategoryDetail(id)` + merge.
2. **Harden `mergeCategoryWithDetail`:**
   - Prefer detail for `descriptions` / `fullDescriptions` / `faq` (detail wins when present).
   - Never copy `children` from detail.
   - Optionally stop falling back to list for faq/descriptions once backend ships (avoids stale cached list fields).
3. **Ensure** `generateMetadata` and page share the same `resolveL*` (already `cache()`-deduped) so one detail call per request.
4. **Do not** call detail for sibling L2/L3 cards on the page — only the active category id.
5. Smoke-test each locale: hero description, Learn more, FAQ, JSON-LD, meta description.

**Files (touch only if hardening):**

- `services/categoryPageService.ts` — merge rules
- `screens/category/CategoryL*Page.tsx` — no logic change expected
- `screens/category/categoryL*Metadata.ts` — no logic change expected
- `lib/category-api-normalize.ts` — confirm detail unwrap still matches `{ id, … }` and `{ data: { id, … } }`

### Phase 2 — Fix Brand + L3 (must not break SEO copy)

Today Brand+L3 resolves L3 from **tree only** and reads descriptions without detail.

**Change:**

```text
findL3ByLocaleSlug(tree, l3Slug, lang)
  → fetchCategoryDetail(l3.id)
  → mergeCategoryWithDetail(l3, detail)
  → use merged for H1 body, meta $L3_DESCRIPTION$, etc.
```

**Files:**

- `app/(public)/[language-country]/manufacturers/[brandSlug]/[l3Slug]/page.tsx` (`generateMetadata` + page)

Reuse existing `fetchCategoryDetail` + `mergeCategoryWithDetail` (same as catalog). Still use Parts for products; still use Manufacturer slug API for brand.

### Phase 3 — Brand landing L1 blurbs (product decision)

Per-L1 section text currently from tree `descriptions` / `fullDescriptions`.

| Option                                                                  | Pros               | Cons                                   |
| ----------------------------------------------------------------------- | ------------------ | -------------------------------------- |
| **A. Drop L1 category blurbs** on brand landing (title + L3 links only) | No extra API calls | Less copy                              |
| **B. Detail for visible L1s only**                                      | Keeps copy         | Up to ~N detail calls (bad if all L1s) |
| **C. Brand API / Cockpit copy only**                                    | Brand-owned text   | Not category SEO                       |

**Recommendation:** **A** unless design requires L1 blurbs; brand hero already uses Manufacturer `shortDescriptions`. Document in ticket.

**File if A:** `screens/car-part-brands/CarPartBrandLandingPage.tsx` — stop reading `l1.descriptions` / `fullDescriptions` (or leave; they become empty harmlessly).

### Phase 4 — Homepage category tiles (non-blocking)

`browse-by-category-new/main-block.tsx` uses `node.descriptions` → will use `DEFAULT_DESCRIPTION`.

- Accept default, **or** use a Cockpit label.
- **Do not** call `GET /Category/{id}` per tile on homepage.

### Phase 5 — Docs + regression checklist

Update [category-api-optimization.md](./category-api-optimization.md): list no longer carries FAQ/descriptions; detail-by-id is mandatory for SEO pages.

---

## Explicit non-goals (do not do)

- Do **not** switch detail to slug-based for this ticket (`/{id}` only, as client confirmed).
- Do **not** fetch detail for every node in the tree.
- Do **not** put FAQ back onto list via FE workarounds.
- Do **not** change Brand list (`GET /Manufacturer`) — no Category SEO there.
- Do **not** change Parts / soft-404 / `carId` redirect in this plan (separate issue).

---

## Request flow after change (catalog L3 example)

```text
GET /Category
GET /Category?parentId={each L1}     → tree (titles, slugs, children)
GET /Category/{l3Id}                 → descriptions, fullDescriptions, faq
POST /Parts                          → products (unchanged)
```

Same pattern for L1/L2 with their own `{id}`.

Brand+L3 after Phase 2:

```text
GET /Manufacturer/slug/{brandSlug}
GET /Category (+ parentId…)          → resolve l3 id from slug
GET /Category/{l3Id}                 → L3 SEO copy
POST /Parts (manufacturerIds + categoryId)
```

---

## Test plan (nothing breaks)

### Catalog

- [ ] L1 URL: H1, short description, Learn more, FAQ, FAQ JSON-LD, meta description
- [ ] L2 URL: same + L3 grid links still from tree `slugs` / `titles`
- [ ] L3 URL: same + top parts SSR
- [ ] Wrong slug → Not Found
- [ ] `nl` / `fr` / `de`: FAQ filtered by `faq.lang`, titles/slugs from tree
- [ ] Curl HTML: description + FAQ present without waiting on client JS

### Brand

- [ ] Brand landing: L1 cards + L3 links still render (structure from tree)
- [ ] Brand+L3: short description / SEO template still filled after Phase 2
- [ ] Brand+L3: products still filter by manufacturer

### Nav / other

- [ ] Homepage / car-parts browse: categories load
- [ ] Search category filter / sidebar: tree only
- [ ] Locale switch on category paths still resolves slugs
- [ ] Sitemap still builds from tree slugs

### Failure modes

- [ ] Detail 404/null → page still renders structure; description/FAQ empty (no crash); meta falls back to generic sentence where coded
- [ ] List without faq keys → normalize + tree build unchanged

---

## Effort summary

| Work                                   | Effort | Risk if skipped             |
| -------------------------------------- | ------ | --------------------------- |
| Catalog L1/L2/L3 verify + merge harden | Small  | Low (already wired)         |
| Brand+L3 add `fetchCategoryDetail`     | Small  | **High** — SEO copy empty   |
| Brand landing L1 blurb decision        | Tiny   | Medium — empty section text |
| Homepage tile default                  | Tiny   | Low — default copy          |
| Docs / QA                              | Small  | Process                     |

---

## Verdict

**Client ask (L1/L2/L3 use `GET /Category/{id}` for FAQ/SEO):** already the design in `resolveL*CategoryPage`. Main work is **verify + harden**, then **fix Brand+L3** (and decide Brand landing / home tile copy) so removing those fields from the list API does not silently empty SEO surfaces outside catalog pages.
