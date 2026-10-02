export {
  LANG_COUNTRY_COMBINATIONS,
  PUBLIC_LANG_COUNTRY_COMBINATIONS,
} from "./lang-country-combinations-env";

/** Next.js App Router RSC flight URLs (?_rsc= / &_rsc=). */
export const ROBOTS_DISALLOW_QUERY_PATTERNS: string[] = ["/*?_rsc=*", "/*&_rsc=*"];

/** Internal observability endpoints that are not locale-prefixed. */
export const ROBOTS_DISALLOW_INTERNAL_PATHS: string[] = [
  "/api/telemetry",
  "/api/axiom",
  "/api/axiom-ui",
  "/monitoring",
];

/** Internal/user-specific routes expanded for every supported locale. */
export const ROBOTS_DISALLOW: string[] = [
  "/search-results",
  "/profile",
  "/profile/info",
  "/profile/orders-returns",
  "/profile/saved-addresses",
  "/shoppingcart",
  "/shoppingcart/checkout",
  "/account",
  "/login",
  "/register",
  "/order-confirmation",
  "/payment-status",
  "/garage-bay",
  "/design-system",
  "/telemetry",
  "/test-axiom",
  "/search",
  "/search/**",
];
