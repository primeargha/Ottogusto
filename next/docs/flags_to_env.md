# Feature flags from environment variables

Runtime feature flags are **not** stored in theme config. They come only from **`NEXT_PUBLIC_*`** environment variables (JSON per flag). Ops can change behavior per deployment (dev / prod / Ottogusto / Qverde) by editing env and redeploying—no code change.

## Flag keys in code

TypeScript keys live in [`config/feature-flags.types.ts`](../config/feature-flags.types.ts) as `FeatureFlags` and `FEATURE_FLAG_KEYS`. Evaluation logic is in [`utils/feature-flag-env.ts`](../utils/feature-flag-env.ts).

## Environment variable name

For a flag used in code as `vin_feature_flag`:

- Env name: `NEXT_PUBLIC_` + the flag name in **UPPER_SNAKE_CASE** (same letters as the code key, uppercased).
- Example: `vin_feature_flag` → `NEXT_PUBLIC_VIN_FEATURE_FLAG`
- Example: `MyGarage_page_feature_flag` → `NEXT_PUBLIC_MYGARAGE_PAGE_FEATURE_FLAG`

## JSON value format

Each variable is a **single-line JSON** string:

```env
NEXT_PUBLIC_VIN_FEATURE_FLAG={"default":false,"exception_countries":[]}
```

### Fields

| Field                 | Type     | Meaning                                                      |
| --------------------- | -------- | ------------------------------------------------------------ |
| `default`             | boolean  | Value when no country-specific override applies (see below). |
| `exception_countries` | string[] | ISO 3166-1 alpha-2 country codes (e.g. `"BE"`, `"NL"`).      |

### Semantics

1. If `exception_countries` is **empty** → the flag result is **`default`** for every country.
2. If the current locale’s country is **listed** in `exception_countries` → the result is **`!default`** (inverted).
3. Otherwise → the result is **`default`**.

Examples:

- `{"default":true,"exception_countries":["BE"]}` → **true** everywhere except **Belgium** (BE), where it is **false**.
- `{"default":false,"exception_countries":["BE"]}` → **false** everywhere except **BE**, where it is **true**.

Country is derived from the first URL segment (e.g. `en-BE` → `BE`).

## How country is resolved

- **Browser:** first path segment (e.g. `/en-BE/...` → `en-BE` → country `BE`).
- **Server:** use [`getServerFeatureFlag`](../utils/server-feature.ts) so locale comes from request headers (`x-api-locale` / `x-current-path`) set by middleware.

## API usage

### Client components

```ts
import { getClientFeatureFlag } from "@/utils/theme-utils";

getClientFeatureFlag("saved_car_feature_flag");
```

Optionally pass the locale segment from the server to avoid SSR/hydration mismatches when the flag must match on first paint:

```ts
getClientFeatureFlag("saved_car_feature_flag", params["language-country"]);
```

### Server components / layouts

```ts
import { getServerFeatureFlag } from "@/utils/server-feature";

getServerFeatureFlag("show_left_nav_flag");
```

### Direct evaluation (when you already have a country code)

```ts
import { getFeatureFlag } from "@/utils/theme-utils";

getFeatureFlag("vin_feature_flag", "BE");
```

## Next.js client bundle note

`NEXT_PUBLIC_*` values are inlined at **build** time. Each flag must be referenced **statically** in [`feature-flag-env.ts`](../utils/feature-flag-env.ts) (`NEXT_PUBLIC_FEATURE_FLAG_JSON`). Adding a **new** flag requires:

1. Add the key to `FeatureFlags` and `FEATURE_FLAG_KEYS` in [`feature-flags.types.ts`](../config/feature-flags.types.ts).
2. Add one static `process.env.NEXT_PUBLIC_...` line in `NEXT_PUBLIC_FEATURE_FLAG_JSON`.
3. Add the variable to your `.env` templates.

Without step 2, dynamic `process.env[key]` is **undefined** in the browser.

## Ops workflow

1. Edit the deployment’s env (e.g. `.env.local`, platform env, or store-specific file).
2. Set or change the `NEXT_PUBLIC_<FLAG>_FEATURE_FLAG` JSON line.
3. **Rebuild / restart** the app so Next picks up `NEXT_PUBLIC_*` (especially for production).

## Deferred client reads (no hydration issue)

If a flag is only used **after** mount (e.g. `isMounted && getClientFeatureFlag(...)`), you do not need to pass the locale segment; `window` is available when the flag is read.

## Related pages

- Design system: feature flags showcase under the `[language-country]/design-system` route (uses `FEATURE_FLAG_KEYS` and `getClientFeatureFlag`).
- Debug route: `[language-country]/flags` compares server vs client evaluation.
