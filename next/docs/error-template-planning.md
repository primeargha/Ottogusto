# Error template and not-found page planning

## Overview

This document describes how error and "not found" (404) pages are structured so that the header is shown consistently for all public routes. The header is provided by the `(public)` layout; if the 404 UI is rendered outside that layout, the header is missing.

## Problem: inconsistent header on 404.

Two different code paths produced "not found" UI:

| Scenario                                                                                                                                                                  | What happens                                                                                                                                                                                                                                        | Header?        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **Invalid path segment** (e.g. `/en-BE/ABAdfddRTH`), **invalid slug**, **wrong makeModelTypeId**, or **unmatched multi-segment path** (e.g. `/en-BE/en/wheel-suspension`) | A page calls `notFound()`, or no route matches. Next.js renders the nearest `not-found.tsx`. If only the root `app/not-found.tsx` existed, it was used as a direct child of the root layout, so the `(public)` layout (and its header) was skipped. | No header      |
| **Invalid query params** but **valid path** (e.g. `cfdffategoryIds`)                                                                                                      | The `[searchdata]` page does not call `notFound()`. It sets `notfound = true` and renders `<Products notfound={notfound} />`. The request stays inside the `(public)` route, so the header is shown.                                                | Header visible |

## Solution

1. **Segment-level not-found under (public)**  
   Add `app/(public)/not-found.tsx` that renders the same 404 UI (`NotFoundclient`). When `notFound()` is called from any page under `(public)`, Next.js uses this file instead of the root one, and it is rendered **inside** the `(public)` layout, so the header appears.

2. **Catch-all for unmatched paths**  
   For URLs with two or more segments after the locale that match no other route (e.g. `/en-BE/en/wheel-suspension`), no page was running under `(public)`, so the root 404 was used. Add `app/(public)/[language-country]/[...slug]/page.tsx` that only calls `notFound()`. Those URLs then hit this page under `(public)`, which triggers `(public)/not-found.tsx` and shows the header.

## Key files

- **`ErrorTemplate`** (`next/components/og-components/ErrorTemplate.tsx`) – Reusable UI: image, title, description, button. No header; the layout supplies it.
- **`NotFoundclient`** (`next/screens/not-found-client.tsx`) – Renders `ErrorTemplate` with 404 labels and footer; used by both root and `(public)` not-found.
- **`app/not-found.tsx`** – Root fallback for non-`(public)` routes (e.g. invalid locale).
- **`app/(public)/not-found.tsx`** – Used when `notFound()` is called from any page under `(public)`; ensures header is shown.
- **`app/(public)/[language-country]/[...slug]/page.tsx`** – Catch-all that calls `notFound()` so unmatched multi-segment paths get the `(public)` not-found with header.

## Flow diagram

```mermaid
flowchart TD
  subgraph request [Incoming request]
    A[Request to public URL]
  end

  subgraph routing [Routing]
    B{Route matches a page under public?}
    C[Page runs under public layout]
    D[No matching route]
  end

  subgraph notFoundCall [Page calls notFound]
    E[notFound called from public page]
    F[Next finds nearest not-found]
    G[(public)/not-found.tsx]
    H[Root not-found.tsx]
  end

  subgraph result [Result]
    I[Header from public layout]
    J[NotFoundclient with ErrorTemplate]
    K[No header]
    L[NotFoundclient only]
  end

  A --> B
  B -->|Yes| C
  B -->|No| D

  C --> E
  E --> F
  F -->|Segment under public| G
  F -->|No segment not-found| H

  G --> I
  G --> J
  H --> K
  H --> L

  D --> D2[Catch-all page runs under public]
  D2 --> D3[notFound]
  D3 --> G
```

## Flow summary

- **Valid public route, then `notFound()`** (e.g. invalid slug or wrong makeModelTypeId) → `(public)/not-found.tsx` → header + 404 UI.
- **Unmatched public path** (e.g. `/en-BE/en/wheel-suspension`) → catch-all page under `(public)` → `notFound()` → `(public)/not-found.tsx` → header + 404 UI.
- **Invalid query params, valid path** → Page renders with `notfound={true}` inside `(public)` → header + Products error state (unchanged).
- **Non-public or root-level 404** → Root `app/not-found.tsx` → no header (intended for invalid locale etc.).
