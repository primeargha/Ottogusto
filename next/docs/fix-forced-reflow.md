# Fix Forced Reflow Issues (Safe, Non-Breaking)

Eliminate forced reflow patterns across 10 files using conservative, behaviour-preserving changes: wrapping layout reads in `requestAnimationFrame`, adding debounce/throttle, and caching measurements.

## Safety Principles

- **No API/prop/behaviour changes** — all fixes are internal performance optimisations.
- **No new dependencies** — only use `requestAnimationFrame`, `ResizeObserver`, and existing utilities.
- **Preserve all existing functionality** exactly (scroll positions, tooltip placement, drag values, etc.).
- **Smallest possible diffs** — change only the lines that trigger forced reflow; leave surrounding logic untouched.
- **Remove only dead code** (empty `useEffect`) — nothing else gets deleted.

---

## High Priority

### 1. Address Components — `SavedBillingAddress.tsx`, `SavedBillingAddress2.tsx`, `SavedDeliveryAddress.tsx`

| What changes                                                          | What stays the same                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| Wrap `scrollWidth - clientWidth` read in `requestAnimationFrame`      | All scroll behaviour, card selection, address rendering |
| Replace `window resize` listener with `ResizeObserver` on `scrollRef` | The `maxScroll` state and its usage                     |
| Remove empty `useEffect(() => {}, [selectedSavedBillingAddress])`     | Everything else — zero functional change                |

The `scroll()` function's `offsetWidth` read is user-triggered (arrow click) so impact is low — leave it as-is to avoid risk.

### 2. Search Filters — `MMESearchFilter.tsx`, `MMESearchFilter2.tsx`

| What changes                                                                       | What stays the same                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Wrap non-step-2 branch of `scrollToSelected` in `requestAnimationFrame`            | All dropdown open/close logic, selection behaviour         |
| Reduce triple `setTimeout` (600/1000/1500ms) to single 600ms + one 1200ms fallback | scrollToSelected still happens; just fewer redundant calls |

**Why safe:** `scrollToSelected` only adjusts `scrollTop` within the dropdown — reducing calls from 3 to 2 still guarantees the selected item is visible.

### 3. `OGtooltip.tsx`

| What changes                                                                                         | What stays the same                               |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Wrap both `getBoundingClientRect()` and `offsetHeight` reads inside a single `requestAnimationFrame` | Tooltip positioning, show/hide, scroll protection |

---

## Medium Priority

### 4. `TypographyProvider.tsx`

| What changes                     | What stays the same                                       |
| -------------------------------- | --------------------------------------------------------- |
| Debounce resize handler (~200ms) | Initial typography injection logic, server-rendered check |

### 5. `productimgcarousal.tsx`

| What changes                                                                      | What stays the same                   |
| --------------------------------------------------------------------------------- | ------------------------------------- |
| Gate `checkScrollPosition` with rAF flag (frame-rate cap)                         | All scroll/arrow visibility behaviour |
| Cache `getBoundingClientRect()` on `handleMouseEnter`, reuse in `handleMouseMove` | Magnifier visuals and position        |

### 6. `PriceMeter.tsx`

| What changes                                                         | What stays the same                   |
| -------------------------------------------------------------------- | ------------------------------------- |
| Replace resize listener with `ResizeObserver` on `sliderRef`         | `sliderWidth` state, slider rendering |
| Cache `getBoundingClientRect()` at drag start, reuse in `handleMove` | All drag/price calculation behaviour  |

---

## Lower Priority

### 7. `OGScrollList.tsx` — Wrap `handleLoadMore` reads in rAF for consistency. Already user-triggered, minimal risk.

### 8. `MMEBaseSearch.tsx` — Same `setTimeout` chain reduction as MMESearchFilter.

---

## Implementation Order

1. Address components (3 files — near-identical change)
2. Search filters (2 files — near-identical change)
3. OGtooltip (1 file)
4. PriceMeter (1 file)
5. productimgcarousal (1 file)
6. TypographyProvider (1 file)
7. OGScrollList + MMEBaseSearch (2 files — minor)

## Verification

After each group of changes:

- **Smoke test** the affected UI: carousel scrolling, dropdown selection, tooltip hover, price slider drag, magnifier.
- **No new console errors or warnings.**
- Chrome DevTools Performance tab: confirm fewer "Layout Forced" entries.
