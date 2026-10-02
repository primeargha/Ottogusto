# Feasibility Analysis: Breadcrumb and Static L1/L2/L3 Category Pages

## 1. Executive Summary

This document outlines the feasibility of introducing breadcrumb navigation and static category pages (L1, L2, L3) into the application. Technical feasibility is confirmed with minor backend support required.

---

## 2. Technical Feasibility

**Status:** Feasible. No major blockers identified. Minor backend support is required.

---

## 3. Constraints and Risks

The PDP (Product Detail Page) response includes a `categories` array. The following points should be considered:

- **Multiple categories in response:** For some products, the API returns two categories (e.g. `["00100200b", "00100200c"]`). The current approach is to use the first element (index 0). This may cause issues in the future; **confirmation from Frank is needed**.
- **Client-side category resolution:** Category IDs are returned by the API and category details are resolved/filtered on the frontend. This may have a **minor performance impact**.

---

## 4. Recommendation: Option A (Fast Path)

**Recommendation:** Option A is preferred for both L2 and L3 pages.

### L2 Pages

- **Option A — Fast path:** Clicking an L2 category navigates directly to search results.
- The L2 static page is still maintained for **SEO and breadcrumb** purposes.

### L3 Pages

- **URL pattern:** `/car-parts/{l1}/{l2}/{l3}/`
- **Page content:** Breadcrumb + H1.
- **Option A:** The L3 static page does **not** display a product grid. A CTA (Call to Action) redirects the user to the existing search results page with **Make / Model / Engine + category** filters applied.

---

## 5. Rough Effort Estimates

| Task                                                              | Estimate |
| ----------------------------------------------------------------- | -------- |
| UI design for category pages                                      | 2 d      |
| SEO handling and implementation                                   | 2 d      |
| Integrating search banner                                         | 2 d      |
| Breadcrumb component creation and integration                     | 1 d      |
| Bug fixing and testing                                            | 1 d      |
| Caching and optimization                                          | 6 h      |
| Campaign landing readiness (important non-functional requirement) | 1 d      |

---

## 6. Assumptions and Dependencies

### Backend Dependencies

1. **L1 Categories**
   - **Endpoint:** `https://api-dev.ottogusto.com/api/Category`
   - **Requirement:** The API must return an **L1 category slug**. Slugs must be stored and created on the backend.
   - **Rationale:** L1 slugs are required for SEO of L1 category pages.

2. **L2 and L3 Categories**
   - **Endpoint:** `https://api-dev.ottogusto.com/api/Category?parentId=001`
   - **Requirement:** The API must return **L2 and L3 category slugs**.
   - **Rationale:** L2 and L3 slugs are required for SEO of L2 and L3 category pages.

3. **Slug uniqueness**
   - Category slugs **must be unique** in the database. Slugs are used for category page URLs and for filtering a specific category for SEO purposes.
