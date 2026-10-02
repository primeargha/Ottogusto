# Auth0 Email Prefill with Redirect Data

This note documents how to prefill the Auth0 Universal Login email field while safely carrying client-side data across a Next.js App Router redirect (using `router.push`).

## Goals

- Pre-fill the Auth0 login email (`login_hint`) to improve conversion.
- Preserve client-side data during redirects (e.g., post-login route, local context).
- Keep data ephemeral (tab-scoped) and avoid leaking across sessions.

## Key Pieces

- `next/utils/useRedirectData.ts`: sessionStorage-backed helper to stash data per target path with a 5-minute TTL.
- `RedirectManager.tsx`: Auth0 login flow that can use `login_hint` and redirect with preserved data.

## How redirect data is stored (sessionStorage)

`useRedirectData` keeps data tab-scoped and expiring in 5 minutes. Core logic:

```tsx
// next/utils/useRedirectData.ts (excerpt)
const REDIRECT_DATA_PREFIX = "next-redirect-data:";

// Set data + TTL
const setRedirectData = (path: string, data: Record<string, any>) => {
  const key = `${REDIRECT_DATA_PREFIX}${path}`;
  sessionStorage.setItem(key, JSON.stringify(data));
  sessionStorage.setItem(`${key}:expires`, (Date.now() + 5 * 60 * 1000).toString());
};

// Read data for current path, respecting TTL
const getRedirectData = <T = Record<string, any>,>(pathname: string): T | null => {
  const key = `${REDIRECT_DATA_PREFIX}${pathname}`;
  const expires = sessionStorage.getItem(`${key}:expires`);
  if (expires && Date.now() > parseInt(expires, 10)) {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}:expires`);
    return null;
  }
  const data = sessionStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
};

// Convenience helper for router.push
const pushWithData = (path: string, data: Record<string, any>) => {
  setRedirectData(path, data);
  return path; // pass this to router.push
};
```

On destination pages, call `getRedirectData()` then `clearRedirectData()` to clean up.

## Implementation Plan

1. **Collect the email hint**
   - Derive from user input, remembered profile, or marketing params.
   - Avoid hardcoding; the current stub uses `"argha@gmail.com"` only as a placeholder.

2. **Set `login_hint` in Auth0 popup**
   - In `RedirectManager`, pass `authorizationParams: { login_hint: email }` to `getAccessTokenWithPopup`.
   - Ensure the value is validated and sanitized (trim, lowercase).

3. **Persist redirect context (optional)**
   - Before `router.push`, call `pushWithData("/target-path", { desiredRoute, context })` from `useRedirectData`.
   - On the destination page, read with `getRedirectData()` and clean up with `clearRedirectData()`.

4. **Handle post-login routing**
   - After Auth0 returns, route to `redirectToAfterLogin` or fallback (e.g., profile completion).
   - If you stored context via `useRedirectData`, restore it and then clear it.

5. **Cleanup and expiry**
   - Data is stored in `sessionStorage` and auto-expires after 5 minutes; call `clearRedirectData()` after use.

## Usage Snippets

**Set email hint & navigate with data**

```tsx
const { pushWithData } = useRedirectData();

const handleLogin = async (email: string) => {
  const path = pushWithData("/post-login", { redirectTo: "/orders" });
  await getAccessTokenWithPopup({
    authorizationParams: { login_hint: email.trim().toLowerCase() },
  });
  router.push(path);
};
```

**Consume redirect data after login**

```tsx
const { getRedirectData, clearRedirectData } = useRedirectData();
useEffect(() => {
  const data = getRedirectData<{ redirectTo?: string }>();
  if (data?.redirectTo) router.push(data.redirectTo);
  clearRedirectData();
}, []);
```

## Notes & Safeguards

- Use **sessionStorage** (not localStorage) to keep data tab-scoped.
- TTL prevents stale leakage; defaults to 5 minutes in `useRedirectData`.
- Always sanitize `login_hint` and avoid logging sensitive values.
- If no hint is available, omit `login_hint` entirely.
