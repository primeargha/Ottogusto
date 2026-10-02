# GTM & Consent Mode Stabilization (Qverde & Ottogusto)

## Summary

- **Problem**: GA4 was reporting a high share of sessions and revenue as `(not set)` because GTM and Consent Mode were effectively being re-initialized when users interacted with Cookiebot or changed language/country. This created broken sessions and attribution loss.
- **Cause**:
  - GTM script (`gtm.js`) + `gtm.init_consent` were tied to a React component lifecycle.
  - Cookiebot events could trigger a new GTM load and a new “Consent Default” sequence.
  - Language selection was forcing a full `window.location.href` reload.
- **Fix**:
  - Moved GTM loading to the official Next.js `@next/third-parties/google` API.
  - Introduced a dedicated, idempotent consent bootstrap script.
  - Removed full-page reload on language change so the app shell (and GTM) stays mounted.

## Files touched

- `components/GTM.tsx`
- `components/GTMConsentBootstrap.tsx` (new)
- `app/layout.tsx`
- `components/og-components/OGLanguageSelectionModel.tsx`
- `next/docs/GTM_CONSENT_MODE_FIX.md` (this document)

## GTM loading implementation

### GTM ID configuration

- GTM container ID is now **read exclusively from** `process.env.NEXT_PUBLIC_GTM_ID`.
- There is **no store-based branching in code**:
  - Qverde / Ottogusto
  - dev / staging / prod
- Each deployment/environment must provide the correct ID via its own env file:
  - `.env.qverde.main`, `.env.qverde.master`, `.env.ottogusto.main`, `.env.ottogusto.master`, `.env.local`, etc.

> **Required env var**
>
> - `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`

If the env var is missing, `GTM` and `GTMNoScript` render nothing (fail-safe).

### `components/GTM.tsx`

- Old behavior:
  - Contained inline JS that:
    - Pushed `gtm.init_consent` into `dataLayer`.
    - Loaded `gtm.js` manually and coupled loading to Cookiebot consent.
  - Contained its own Cookiebot consent listeners.
- New behavior:
  - Uses the official [`GoogleTagManager` component from `@next/third-parties/google`](https://nextjs.org/docs/app/guides/third-party-libraries).
  - Reads the container ID from `process.env.NEXT_PUBLIC_GTM_ID`.
  - No longer:
    - Creates or mutates `window.dataLayer` directly.
    - Manages Cookiebot listeners.
    - Manually injects `gtm.js`.

Key behavior:

- `GTM` (head):
  - `<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />`.
- `GTMNoScript` (body):
  - Renders the `noscript` iframe with the same `NEXT_PUBLIC_GTM_ID`.

This ensures **exactly one GTM script tag per hard page load**.

## Consent & dataLayer bootstrap

### `components/GTMConsentBootstrap.tsx`

New server component that renders a single inline `<script>` into `<head>`:

- Guarantees `window.dataLayer` exists.
- Fires **exactly one** consent-default init event per hard page load.
- Attaches Cookiebot listeners **once** using global guards.

Behavior (high level):

- On first run:
  - Sets `window.__gtmConsentInitialized = true`.
  - Pushes:
    - `event: "gtm.init_consent"`
    - `gtm.uniqueEventId` (random).
- Attaches listeners once (guarded by `window.__gtmCookiebotListenersAttached`):
  - `CookiebotOnConsentReady`
  - `CookiebotOnAccept`
  - `CookiebotOnDecline`
- Each listener call:
  - Reads `window.Cookiebot.consent`.
  - Pushes a `consent_update` event:
    - `marketing`, `preferences`, `statistics`, `necessary`.
  - Pushes either:
    - `CookiebotConsentGiven` **or**
    - `CookiebotConsentDenied`.
- **No GTM script injection in this file.** GTM loading is fully handled by `GoogleTagManager`.

### `app/layout.tsx` wiring

In `<head>`:

- Before:
  - Rendered theme fonts/CSS.
  - Rendered `<GTM />`.
  - Rendered `<CookiebotScript />`.
- After:
  - `GTMConsentBootstrap` is rendered before `<GTM />`:
    - `GTMConsentBootstrap` → sets up `dataLayer` + consent init + Cookiebot listeners.
    - `GTM` → mounts the official GTM container using `GoogleTagManager`.
  - `CookiebotScript` remains responsible for loading Cookiebot from `consent.cookiebot.com`.

This ordering ensures:

1. `dataLayer` and consent flags exist before GTM container logic runs.
2. Cookiebot events update consent state in `dataLayer` without ever re-injecting `gtm.js`.

## Language selector routing fix

### `components/og-components/OGLanguageSelectionModel.tsx`

Previously, after a language / country change:

- The component:
  - Built `newPath` with the new locale and query.
  - Updated navigation history.
  - Cleared MME cache.
  - Called:
    - `router.navigate(newPath);`
    - `window.location.href = newPath;` **(full page reload)**.

The explicit `window.location.href` forced:

- Full document reload.
- Re-running all `<head>` scripts (including GTM and Cookiebot bootstrap).
- Risk of duplicated `Consent Default` / `Container Loaded` events and session splits.

Now:

- We still:
  - Compute `newPath` (with locale + path + query preserved).
  - Append to navigation history.
  - Clear MME cache.
- But we **only**:
  - Call `router.navigate(newPath);`
  - **Removed** the `window.location.href = newPath;` call.

Result:

- Language/country changes perform **client-side navigation only**.
- The app shell, GTM container, and consent bootstrap stay mounted once.
- GTM is not re-loaded; we only get normal SPA route changes.

## Expected tracking behavior after the fix

### GTM Preview (Consent events)

- On first page load (hard refresh / new entry):
  - You should see:
    - One `gtm.init_consent` (or equivalent Consent Default event coded in GTM).
    - One `Container Loaded`.
- When interacting with Cookiebot (accept, decline, update preferences):
  - You should **not** see an additional `Container Loaded` event.
  - You should see:
    - `consent_update` events with accurate consent flags.
    - `CookiebotConsentGiven` or `CookiebotConsentDenied`.

### Network tab (`gtm.js`)

- On page entry:
  - Exactly **one** `https://www.googletagmanager.com/gtm.js?id=GTM-XXXX` request.
- When:
  - Accepting/declining Cookiebot.
  - Switching language/country via the language modal.
  - Navigating between routes via internal links.
- You should **not** see new `gtm.js` requests unless:
  - You explicitly hard-refresh the page or open a new tab.

### GA4 DebugView / Attribution

- Enter via a tagged URL, e.g. `?utm_source=test_check&utm_medium=...`.
- Interactions:
  - Accept/decline Cookiebot.
  - Change language/country.
  - Navigate through the site to a purchase.
- Expectations:
  - `ga_session_id` remains stable across these interactions.
  - `source / medium` stays as the original campaign values.
  - Events should **not** flip mid-journey to `(direct) / (none)` or `(not set)`.

## QA checklist

### For both Qverde and Ottogusto

1. **GTM Preview**
   - Enable Preview for the relevant GTM container.
   - Load the homepage with a campaign URL.
   - Accept cookies, decline cookies, and modify consent.
   - Change language/country with the language selector.
   - Confirm:
     - One `Container Loaded` event per hard entry.
     - One initial consent default/init event.
     - Subsequent interactions only emit `consent_update` + `CookiebotConsentGiven/Denied`.

2. **Network**
   - Open DevTools → Network → filter `gtm.js`.
   - Repeat the same interactions as above.
   - Confirm:
     - Only the initial `gtm.js?id=GTM-XXXX` request appears.
     - No additional GTM script loads on language change or consent updates.

3. **GA4 DebugView**
   - Use a tagged URL (e.g. `?utm_source=gtm_fix_test&utm_medium=qa`).
   - Track:
     - `page_view`
     - navigation events
     - `purchase` (test order in non-production or via test mode).
   - Confirm:
     - All events share the same `ga_session_id` for a single journey.
     - `source / medium` remains `gtm_fix_test / qa` (or equivalent) throughout.
     - No `(not set)` or unexpected `(direct)` attribution mid-journey.

## Notes for future changes

- If you add new components that manipulate URL or locale:
  - Prefer `next/navigation`’s router methods (`push`, `replace`, `navigate`) over `window.location`.
  - Avoid short-lived URLs like `/en?` that can create ambiguous states.
- If you change how Cookiebot works:
  - Update `GTMConsentBootstrap` to keep consent events in sync with the new model.
  - Keep `gtm.js` loading responsibility inside `GTM.tsx` / `GoogleTagManager` only.
