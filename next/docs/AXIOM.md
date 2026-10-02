# Axiom Logging

Logs backend API calls and UI errors to Axiom for monitoring and email alerts.

## What gets logged

### Backend API (`backend_api_hit`)

Every call to `NEXT_PUBLIC_API_URL` with timing, method, payload, and client/server source.

| Field             | Description                            |
| ----------------- | -------------------------------------- |
| `apiUrl`          | Full backend URL                       |
| `method`          | HTTP method                            |
| `durationMs`      | Response time in milliseconds          |
| `source`          | `client` or `server`                   |
| `status`          | HTTP status code                       |
| `requestPayload`  | POST/PUT/PATCH body (truncated at 2KB) |
| `responsePayload` | Response body (truncated at 2KB)       |

### Network failures (`network_error`)

When a fetch/axios call fails before an HTTP response (timeouts, DNS, offline).

### UI errors (`ui_error`)

Unhandled React errors from `error.tsx` and `global-error.tsx`.

| Field          | Description             |
| -------------- | ----------------------- |
| `store`        | `Ottogusto` or `Qverde` |
| `pageUrl`      | Full browser URL        |
| `route`        | Pathname                |
| `errorName`    | e.g. `TypeError`        |
| `errorMessage` | Error message           |
| `stack`        | Stack trace             |
| `digest`       | Next.js error digest    |

## Environment variables

```bash
NEXT_PUBLIC_AXIOM_ENABLED=true
NEXT_PUBLIC_AXIOM_DATASET=ottogusto-logs    # API logs dataset (per store in prod)
NEXT_PUBLIC_AXIOM_UI_DATASET=ottogusto-logs # UI logs — both stores in prod
AXIOM_TOKEN=xaat-your-token-here
AXIOM_EDGE_URL=https://eu-central-1.aws.edge.axiom.co
```

| Variable                       | Required | Notes                                                  |
| ------------------------------ | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_AXIOM_ENABLED`    | Yes      | Set `true` to enable                                   |
| `NEXT_PUBLIC_AXIOM_DATASET`    | Yes      | Backend API log dataset                                |
| `NEXT_PUBLIC_AXIOM_UI_DATASET` | No       | UI error dataset; falls back to API dataset if omitted |
| `AXIOM_TOKEN`                  | Yes      | Server-only ingest token                               |
| `AXIOM_EDGE_URL`               | No       | Defaults to EU Central 1                               |

### Production (master env files)

| Env file                | API dataset      | UI dataset       |
| ----------------------- | ---------------- | ---------------- |
| `.env.ottogusto.master` | `ottogusto-logs` | `ottogusto-logs` |
| `.env.qverde.master`    | `qverde-logs`    | `ottogusto-logs` |

Qverde API errors go to `qverde-logs`. All UI errors (both stores) go to `ottogusto-logs`.

### Development

Copy the same dataset names and monitor queries from prod into the dev Axiom workspace when ready. Until then, dev can keep a single shared API dataset; omit `NEXT_PUBLIC_AXIOM_UI_DATASET` to fall back to the API dataset.

## Edge deployment (region)

| Dashboard name         | `AXIOM_EDGE_URL`                         |
| ---------------------- | ---------------------------------------- |
| **EU Central 1 (AWS)** | `https://eu-central-1.aws.edge.axiom.co` |
| **US East 1 (AWS)**    | `https://us-east-1.aws.edge.axiom.co`    |

## Architecture

- **Backend API (client)** → `/api/axiom` proxy → `NEXT_PUBLIC_AXIOM_DATASET`
- **Backend API (server/SSR)** → direct ingest → `NEXT_PUBLIC_AXIOM_DATASET`
- **UI errors (client)** → `/api/axiom-ui` proxy → `NEXT_PUBLIC_AXIOM_UI_DATASET`
- **Network errors** → same path as API logs → `NEXT_PUBLIC_AXIOM_DATASET`

## Crawler policy

Logging, telemetry, test, and monitoring surfaces are internal and must never be indexed:

- `/{locale}/telemetry` and `/{locale}/test-axiom/**` are disallowed in `robots.txt`.
- `/api/telemetry/**`, `/api/axiom`, `/api/axiom-ui`, and the Sentry `/monitoring`
  tunnel are disallowed in `robots.txt`.
- Dashboard/test pages emit server-rendered `noindex, nofollow, noarchive` metadata.
- All internal observability routes emit the equivalent `X-Robots-Tag` response header.
- These routes must not be added to sitemaps or public navigation.

When adding another logging report or monitor endpoint, add the same three layers:
`robots.txt` disallow, server metadata where HTML is rendered, and `X-Robots-Tag`.
Crawler controls do not replace authentication for sensitive reports.

## Production monitors

Three match monitors (Axiom free tier limit):

| Monitor                   | Dataset          | Filter                                            |
| ------------------------- | ---------------- | ------------------------------------------------- |
| Production — OG API Error | `ottogusto-logs` | `backend_api_hit` status ≥ 400 or `network_error` |
| Production — QV API Error | `qverde-logs`    | `backend_api_hit` status ≥ 400 or `network_error` |
| Production UI error       | `ottogusto-logs` | `ui_error`                                        |

## Test page (dev only)

When `NEXT_PUBLIC_AXIOM_TEST_ERRORS=true`, open:

`/{locale}/test-axiom`

| Action                                            | Axiom event                |
| ------------------------------------------------- | -------------------------- |
| Client UI error                                   | `ui_error`                 |
| Client API error                                  | `backend_api_hit` (404)    |
| Server API error (`/test-axiom/server-api-error`) | `backend_api_hit` (SSR)    |
| Server UI error (`/test-axiom/server-ui-error`)   | `ui_error` (null `.map()`) |

Do **not** set `NEXT_PUBLIC_AXIOM_TEST_ERRORS` on production (`.env.*.master`).

## Files

```
next/lib/axiom/
  axiom.ts
  datasets.ts
  server.ts              # API + UI server loggers
  client.ts              # Browser API logger → /api/axiom
  client-ui.ts           # Browser UI logger → /api/axiom-ui
  log-api-hit.ts
  log-api-hit-server.ts
  log-api-hit-client.ts
  log-ui-error.ts
  log-ui-error-client.ts
  log-network-error.ts
  log-network-error-server.ts
  log-network-error-client.ts

next/app/api/axiom/route.ts
next/app/api/axiom-ui/route.ts
next/app/(public)/[language-country]/test-axiom/
next/app/error.tsx
next/app/global-error.tsx
next/config/api.ts
next/config/newApiClient.ts
```
