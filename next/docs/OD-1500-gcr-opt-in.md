# OD-1500 — Google Store Reviews (GCR) survey opt-in, PROD rollout behind a feature flag

Related docs:

- [`flags_to_env.md`](./flags_to_env.md) — how `NEXT_PUBLIC_*` JSON feature flags work (required reading for §3)
- [`AXIOM.md`](./AXIOM.md) — logging used for the PROD-only verification in §6
- [`GTM_CONSENT_MODE_FIX.md`](./GTM_CONSENT_MODE_FIX.md) — Cookiebot/GTM consent wiring referenced in §7

Google references (checked 2026-08-19):

- [Integrate the survey opt-in module](https://support.google.com/merchants/answer/7106244) (mirrored at [14629205](https://support.google.com/merchants/answer/14629205))
- [Google Customer Reviews opt-in and survey](https://support.google.com/merchants/answer/14629305)
- [Survey Opt-In Module Troubleshooting](https://support.google.com/merchants/answer/14633731)

> Naming: the ticket says "Store Reviews". Google's product and all current documentation call it **Google Customer Reviews (GCR)**. Same program, same snippet. Code uses `GoogleCustomerReviews` / `gcr`.

---

## 1. Current state

The opt-in module itself is **already implemented and committed** (`511770dd OD-1500`). It is not yet safe to ship, because it is unconditional and the production env files point at the wrong Merchant Center account.

| Concern                                          | File                                        | State                      |
| ------------------------------------------------ | ------------------------------------------- | -------------------------- |
| Opt-in component (loads `platform.js`, not GTM)  | `components/GoogleCustomerReviewsOptIn.tsx` | Done                       |
| Date / country / email / lang / merchant helpers | `utils/googleCustomerReviews.ts`            | Done, 2 fixes needed (§4)  |
| `window.gapi` / `___gcfg` typings                | `types/google-customer-reviews.d.ts`        | Done                       |
| Render on order confirmation                     | `screens/payment-status/paymentstatus.tsx`  | Done, needs flag gate (§3) |
| Feature flag                                     | —                                           | **Missing**                |
| PROD merchant IDs                                | `.env.*.master`                             | **Wrong (`32410`)**        |

What the confirmation page sends today, on payment success only, once per order:

```js
window.___gcfg = { lang };
window.gapi.load("surveyoptin", () => {
  window.gapi.surveyoptin.render({
    merchant_id,
    order_id,
    email,
    delivery_country,
    estimated_delivery_date,
    opt_in_style: "CENTER_DIALOG",
  });
});
```

Matches the ticket: no `products` / GTIN field, no badge, not via GTM, `CENTER_DIALOG` so the modal is centred rather than tucked into a corner.

### 1.1 Why the confirmation page qualifies

- **Order confirmation page** — `/[language-country]/payment-status`, reached after PayNL redirects back to our own domain (Google requires the third-party processor to return to a page we own).
- **HTTPS** — `ottogusto.com` / `qverde.com`.
- **HTML5 DOCTYPE** — Next.js App Router emits `<!DOCTYPE html>` as the first bytes, no comment or whitespace before it.
- **"Just before `</body>`"** — in an SPA the equivalent is `document.body.appendChild(script)` at render time, which is what the component does. There is no static HTML template to paste into.

---

## 2. Rollout decision

Dev (`dev.ottogusto.com` / `dev.qverde.com`) is **not** a verified and claimed website in Merchant Center. Google's troubleshooting lists "mismatched website URL" as a 404 on the module, so the opt-in cannot be validated on dev at all.

Therefore, per the client:

1. Ship to PROD (`master`) with the module **behind a feature flag, default off**.
2. Flip the flag on, place **live PayNL orders** on each storefront.
3. Confirm the modal appears on the thank-you page immediately after purchase.
4. Google sends the survey email a **couple of days after** `estimated_delivery_date`, not immediately — verification of the email leg is asynchronous and must not block sign-off on the modal itself.

---

## 3. Phase 1 — Feature flag

Flag key follows the existing convention in `config/feature-flags.types.ts`:

|               | Value                                        |
| ------------- | -------------------------------------------- |
| Code key      | `gcr_opt_in_feature_flag`                    |
| Env var       | `NEXT_PUBLIC_GCR_OPT_IN_FEATURE_FLAG`        |
| Initial value | `{"default":false,"exception_countries":[]}` |

Per [`flags_to_env.md`](./flags_to_env.md), a new flag needs three edits — the env var alone does nothing, because `NEXT_PUBLIC_*` must be referenced statically to be inlined into the browser bundle.

1. `config/feature-flags.types.ts` — add `gcr_opt_in_feature_flag: boolean` to `FeatureFlags` and `"gcr_opt_in_feature_flag"` to `FEATURE_FLAG_KEYS`. This also makes it show up automatically on the `/[language-country]/flags` and design-system showcase routes.
2. `utils/feature-flag-env.ts` — add `gcr_opt_in_feature_flag: process.env.NEXT_PUBLIC_GCR_OPT_IN_FEATURE_FLAG,` to `NEXT_PUBLIC_FEATURE_FLAG_JSON`.
3. All five env files — add the JSON line (§5).

Gate in `screens/payment-status/paymentstatus.tsx`, inside the existing GCR `useEffect` and before any work is done:

```ts
if (!getClientFeatureFlag("gcr_opt_in_feature_flag", languageCountry)) return;
```

Reading it inside an effect means `window` already exists, so there is no SSR/hydration mismatch and no need to thread the locale down from the server (see "Deferred client reads" in `flags_to_env.md`).

### 3.1 Canary trick

The flag semantics invert the default for listed countries, which gives a free single-country canary without a code change:

| Env value                                        | Effect                       |
| ------------------------------------------------ | ---------------------------- |
| `{"default":false,"exception_countries":[]}`     | Off everywhere (ship state)  |
| `{"default":false,"exception_countries":["BE"]}` | On in **BE only** — canary   |
| `{"default":true,"exception_countries":[]}`      | On everywhere — full rollout |

`NEXT_PUBLIC_*` is inlined at build time, so **each flip needs a rebuild/redeploy**, not just an env edit.

---

## 4. Phase 2 — Correctness fixes

### 4.1 `lang` must be a code Google actually supports

`mapLanguageCountryToGcrLang()` currently passes the raw language segment through. Two problems:

- The `key-*` pseudo-locale (staff translation-key debug mode) yields `lang: "key"`, which is not a language.
- Any other unlisted code is silently ignored by Google.

Fix: validate against Google's supported list and, when there is no match, **omit `window.___gcfg` entirely** so Google falls back to the customer's browser language — which is a better outcome than sending a bogus code.

Our live locales map cleanly: `en → en`, `fr → fr`, `de → de`, `it → it`, `key → en` (fallback).

**Dutch is a deliberate exception.** Google's published table lists `ml` for "Dutch" and does not list `nl` at all. `ml` is the ISO code for Malayalam, so this is almost certainly an error in Google's doc, and sending `ml` risks rendering the dialog in Malayalam for our largest market. **Decision: send `nl`.** If Google does not recognise it, the documented behaviour is to fall back to the browser language, which for a Dutch-speaking customer is Dutch anyway. Worst case is a correct-language dialog; best case is an explicitly correct one.

### 4.2 Observability

Because PROD is the only place this can be exercised, the current silent `return`s (missing merchant ID, unparseable email, missing/`ZZ` country) need to be logged. Add Axiom logging for both the skip reasons and a successful render, so a failed live test can be diagnosed without a screen-share.

---

## 5. Phase 3 — Environment matrix

| File                    | Store          | `NEXT_PUBLIC_MERCHANT_ID` now | Target           | `NEXT_PUBLIC_GCR_OPT_IN_FEATURE_FLAG`        |
| ----------------------- | -------------- | ----------------------------- | ---------------- | -------------------------------------------- |
| `.env.ottogusto.master` | Ottogusto PROD | `32410`                       | **`5682637354`** | `{"default":false,"exception_countries":[]}` |
| `.env.qverde.master`    | Qverde PROD    | `32410`                       | **`5723182938`** | `{"default":false,"exception_countries":[]}` |
| `.env.ottogusto.main`   | Ottogusto dev  | `5682637354`                  | unchanged        | `{"default":false,"exception_countries":[]}` |
| `.env.qverde.main`      | Qverde dev     | `5723182938`                  | unchanged        | `{"default":false,"exception_countries":[]}` |
| `.env.ottogusto.local`  | local          | `5682637354`                  | see note         | `{"default":false,"exception_countries":[]}` |

`32410` on both `.master` files is the blocking defect: live confirmations would attach to the wrong Merchant Center account and Google would reject them on the claimed-URL check.

Note on `.env.ottogusto.local`: the active store block in that file is `STORE=qverde` while the merchant ID is Ottogusto's. Harmless locally (the module cannot work on `localhost` anyway), but the mismatch should be corrected or commented so nobody copies it into a real deployment.

---

## 6. Phase 4 — PROD verification

### 6.1 Pre-flip (flag off)

Deploy to `master` with the flag off and confirm the module is genuinely inert: no request to `apis.google.com/js/platform.js` in the Network tab on the confirmation page, and no `gcr-platform-script` element in the DOM.

### 6.2 Flip and place a live order

One live PayNL order per storefront, ideally starting with a single-country canary. On the thank-you page, walk Google's troubleshooting table:

| Check                                                | Expected                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Modal appears immediately after purchase             | Centred dialog, no scrolling needed                                                                                     |
| Exactly one instance of the module code              | One `#gcr-platform-script`, one `surveyoptin.render` call                                                               |
| Not obscured                                         | Sticky header is `z-50`; confirm the Cookiebot banner and any chat widget do not cover the dialog on mobile and desktop |
| Page is HTTPS with HTML5 DOCTYPE                     | View source, first line is `<!DOCTYPE html>`                                                                            |
| All five required params present and non-placeholder | `merchant_id`, `order_id`, `email`, `delivery_country`, `estimated_delivery_date`                                       |
| `merchant_id` correct per storefront                 | `5682637354` / `5723182938`                                                                                             |
| `estimated_delivery_date`                            | Quoted string, `YYYY-MM-DD`                                                                                             |
| `delivery_country`                                   | ISO 3166-1 alpha-2, never `ZZ`                                                                                          |
| `email`                                              | Real, correctly formatted, deliverable — this is the address Google surveys                                             |
| `opt_in_style`                                       | `CENTER_DIALOG`                                                                                                         |
| No JS errors / no 404 from the module                | Console clean                                                                                                           |
| Ad blocker disabled during the test                  | Blockers hide the module and produce a false negative                                                                   |

Use a **real mailbox you control** for the order email, since the survey lands there days later.

### 6.3 Asynchronous follow-up

Google emails the survey a few days **after** the `estimated_delivery_date` we sent, and Merchant Center reporting can lag by up to a week. Record order ID, email, storefront, and the `estimated_delivery_date` sent, then re-check after that date passes. Do not treat a missing email on day one as a failure.

---

## 7. Risks and open questions

**Consent / Cookiebot.** Integrating the opt-in means sharing the customer's order email with Google, and Cookiebot is loaded through GTM on our sites. Two things need confirming on PROD: that Cookiebot does not block the dynamically injected `apis.google.com` script (dynamic injection normally escapes Cookiebot's auto-blocking, which rewrites markup present in the initial HTML), and that Legal is comfortable firing the module before marketing consent. The ticket forbids implementing _via_ GTM for CLS reasons; that does not by itself settle the consent question.

**Delivery-date accuracy.** `estimated_delivery_date` is derived from the same `small` / `medium` / `large` stock tiers that checkout shows, taking the **upper bound** of the slowest item (3 / 7 / 14 business days, matching the `delivery_type_*` labels). Google asks for the order details to be accurate to the best of our ability, and the upper bound is the safe direction — the survey firing slightly late is harmless, firing before delivery is not.

**Extra API calls on the confirmation page.** The date calculation re-fetches stock info per line item, because the cart (and its cached `deliveryTime`) is cleared on payment success. Acceptable, and it keeps the GCR path independent of cart-reset effect ordering, but it is worth knowing it is N calls.

**Merchant Center prerequisites.** Both `ottogusto.com` and `qverde.com` must be verified and claimed under their respective Merchant IDs, and the Google Customer Reviews program must be enabled, before any of this can succeed. Worth confirming with whoever owns the Merchant Center accounts before the test order.

---

## 8. Out of scope

- GCR badge
- Product Reviews / `products` GTIN field
- Any GTM-based delivery of the opt-in

---

## 9. Work breakdown

| #   | Change                                                             | Files                                                                        |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 1   | Add `gcr_opt_in_feature_flag` key                                  | `config/feature-flags.types.ts`                                              |
| 2   | Add static env reference                                           | `utils/feature-flag-env.ts`                                                  |
| 3   | Gate the opt-in effect                                             | `screens/payment-status/paymentstatus.tsx`                                   |
| 4   | Validate `lang`, map `key` → `en`, omit `___gcfg` when unsupported | `utils/googleCustomerReviews.ts`                                             |
| 5   | Log skip reasons and successful render                             | `utils/googleCustomerReviews.ts`, `screens/payment-status/paymentstatus.tsx` |
| 6   | Fix PROD merchant IDs, add flag var                                | `.env.ottogusto.master`, `.env.qverde.master`                                |
| 7   | Add flag var                                                       | `.env.ottogusto.main`, `.env.qverde.main`, `.env.ottogusto.local`            |

Rollback is a flag flip plus redeploy; nothing else in the payment-success flow depends on the module, and all of its failure paths already return silently.
