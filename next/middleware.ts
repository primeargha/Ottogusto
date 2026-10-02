import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORE_IDS } from "./config/store-constants";
import type { StoreId } from "./config/store-constants";
import {
  LANG_COUNTRY_COMBINATIONS,
  DEFAULT_HOMEPAGE_LOCALE,
  LANG_TO_DEFAULT_LOCALE,
} from "./config/locale-constants";
import {
  handleQueryStringPreservation,
  isRedirectLoop,
  shouldSkipRedirect,
} from "./utils/redirect-helper";
import {
  fixManufacturersLocaleSegmentsInPathname,
  fixPartsLocaleSegmentsInPathname,
  getBareCategoryUnderPartsRedirectPath,
  getLegacyCategoryLandingRedirectPath,
  getLegacyManufacturersRedirectPath,
  getPartsRouteSegmentForLang,
  isCategoryPathSegment,
  isKnownPartsRouteSegment,
  rewriteLocalizedManufacturersUrlToCanonicalAppPath,
  rewriteLocalizedPartsUrlToCanonicalAppPath,
  type PartsRouteSegment,
} from "./config/url-segments";
import { isValidPartIdForApi, logPartApiCall, logSkippedPartApiCall } from "./utils/part-id";
import {
  buildCanonicalPartPdpPath,
  isLegacyPartUrl,
  parseLegacyPartPdpCandidate,
  resolveCanonicalLocaleForLegacyPart,
  slugifyManufacturerForPdp,
} from "./utils/legacyPartPdp";
import { getRequestIp, withRequestApiIpHeader } from "./lib/clientIp";
import { isCategorySeoPage } from "./utils/detectPage";
import { stripLegacyCategorySeoParams } from "./utils/seoUrlParams";

function nextWithForwardedIp(request: NextRequest): NextResponse {
  const ip = getRequestIp(request.headers);
  const requestHeaders = new Headers(request.headers);
  if (ip) requestHeaders.set("x-api-ip", ip);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (ip) response.headers.set("x-api-ip", ip);
  return response;
}

function rewriteWithForwardedIp(request: NextRequest, url: URL): NextResponse {
  const ip = getRequestIp(request.headers);
  const requestHeaders = new Headers(request.headers);
  if (ip) requestHeaders.set("x-api-ip", ip);

  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  if (ip) response.headers.set("x-api-ip", ip);
  return response;
}

const DEFAULT_PDP_BASE = `/en-BE/${getPartsRouteSegmentForLang("en")}`;

// Qverde: static 301 map (path pattern → redirect targets by lang). No proxy call.
const QVERDE_301_MAP: { pattern: RegExp; en: string; nl: string }[] = [
  { pattern: /^\/(en|nl)\/our-story\/?$/i, en: "/en-BE/about-us", nl: "/nl-BE/about-us" },
  {
    pattern: /^\/(en|nl)\/ons-verhaal\/?$/i,
    en: `/en-BE/${getPartsRouteSegmentForLang("en")}`,
    nl: `/nl-BE/${getPartsRouteSegmentForLang("nl")}`,
  },
  {
    pattern: /^\/(en|nl)\/catalog\/motor\/brandstofsysteem\/?$/i,
    en: `/en-BE/${getPartsRouteSegmentForLang("en")}`,
    nl: `/nl-BE/${getPartsRouteSegmentForLang("nl")}`,
  },
];

function isHomepage(pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return true;
  if (/^\/(en|nl|fr|de)$/i.test(p)) return true;
  const localePart = p.startsWith("/") ? p.slice(1).split("/")[0] : p.split("/")[0];
  if (LANG_COUNTRY_COMBINATIONS.some((lc) => lc === localePart)) {
    return p === `/${localePart}`;
  }
  return false;
}

/** True if path is exactly one segment that is not /, not en|nl|fr, and not a valid locale (e.g. /foo, /random). */
function isSingleSegmentUnknownPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return false;
  const parts = p.startsWith("/") ? p.slice(1).split("/") : p.split("/");
  if (parts.length !== 1) return false;
  const segment = parts[0] ?? "";
  if (/^(en|nl|fr|de)$/i.test(segment)) return false;
  if (LANG_COUNTRY_COMBINATIONS.includes(segment)) return false;
  return true;
}

function normalizeLanguage(value: string | null | undefined): "en" | "nl" | "fr" | "de" {
  const lang = (value || "").toLowerCase();
  if (lang === "nl") return "nl";
  if (lang === "fr") return "fr";
  if (lang === "de") return "de";
  return "en";
}

function slugifyLoose(input: string): string {
  // Middleware-safe slugify: lowercase, replace +, strip non-alphanum to hyphen, collapse hyphens.
  return (input || "")
    .trim()
    .toLowerCase()
    .replaceAll("+", "plus")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function parsePdpCandidate(pathname: string): null | {
  locale: string;
  routeBasedOnLang: string;
  manufacturer: string | null;
  partid: string;
} {
  // Expected shapes:
  // - /{locale}/{partsRoute}/{manufacturer}/{partid}
  // - /{locale}/{partsRoute}/{partid} (manufacturer missing; can happen with double slashes)
  const normalized = pathname.replace(/\/$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 3) return null;

  const [locale, routeBasedOnLang] = segments;
  const partid = segments[segments.length - 1] || "";
  if (!locale || !routeBasedOnLang || !partid) return null;

  // Only consider known parts route segments to avoid unintended redirects.
  if (!isKnownPartsRouteSegment(routeBasedOnLang)) return null;

  // Category L1/L2/L3 URLs (/{locale}/{partsRoute}/{categoryKeyword}/...) are NOT
  // PDPs. Without this guard, a stale `locale` cookie pointing at a different
  // language than the URL flips `languageMismatchWithSelection` to true, the last
  // category slug (engine, spark-plug-glow-plug, …) is read as a partid, /parts/<slug>
  // returns 404, and middleware 302s every category click to /{locale}/not-found —
  // locking the user inside the not-found page across L1/L2/L3 navigation.
  // Mirrors the exclusion already present in OGLanguageSelectionModel's PDP detector.
  if (isCategoryPathSegment(segments[2])) return null;

  // Do not treat SEO/category slugs or literal "null" as part ids (avoids GET /parts/{slug} noise).
  if (!isValidPartIdForApi(partid)) {
    logSkippedPartApiCall("middleware.parsePdpCandidate", partid, { pathname: normalized });
    return null;
  }

  const manufacturer = segments.length >= 4 ? (segments[2] ?? null) : null;
  return { locale, routeBasedOnLang, manufacturer, partid };
}

/** Returns redirect path for homepage (e.g. /en → /en-BE), or null if no redirect needed. */
function getHomepageRedirectPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return `/${DEFAULT_HOMEPAGE_LOCALE}`;
  const langMatch = p.match(/^\/(en|nl|fr|de)$/i);
  if (langMatch) {
    const lang = (langMatch[1] ?? "en").toLowerCase();
    const locale = LANG_TO_DEFAULT_LOCALE[lang] ?? `${lang}-BE`;
    return `/${locale}`;
  }
  const localePart = (p.startsWith("/") ? p.slice(1).split("/")[0] : p.split("/")[0]) ?? "";
  if (LANG_COUNTRY_COMBINATIONS.includes(localePart) && p === `/${localePart}`) {
    return null; // already valid locale homepage
  }
  return null;
}

/** If pathname matches a Qverde 301 rule, returns the target path; otherwise null. */
function getQverde301Redirect(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || pathname;
  for (const { pattern, en, nl } of QVERDE_301_MAP) {
    const m = normalized.match(pattern);
    if (!m) continue;
    const lang = (m[1] || "").toLowerCase();
    const target = lang === "nl" ? nl : en;
    if (isRedirectLoop(pathname, target)) return null;
    return target;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkipRedirect(pathname)) {
    return nextWithForwardedIp(request);
  }

  // OD-2300 + locale segment canonicalization: 301 wrong parts/category segments and/or strip legacy query params.
  const segmentCanonicalPath = fixPartsLocaleSegmentsInPathname(pathname);
  const cleanParams = new URLSearchParams(request.nextUrl.searchParams);
  const shouldStripLegacyParams = segmentCanonicalPath !== null || isCategorySeoPage(pathname);
  const legacyParamsStripped = shouldStripLegacyParams && stripLegacyCategorySeoParams(cleanParams);

  if (segmentCanonicalPath !== null || legacyParamsStripped) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const hostHeader = request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const redirectBaseUrl = `${protocol}://${hostHeader}`;
    const target = request.nextUrl.clone();
    target.pathname = segmentCanonicalPath ?? pathname;
    target.search = cleanParams.toString();
    const redirectPathWithSearch = `${target.pathname}${target.search ? `?${target.search}` : ""}`;
    if (!isRedirectLoop(`${pathname}${request.nextUrl.search}`, redirectPathWithSearch)) {
      return NextResponse.redirect(new URL(target.toString(), redirectBaseUrl), { status: 301 });
    }
  }

  const localizedPartsRewritePath = rewriteLocalizedPartsUrlToCanonicalAppPath(pathname);
  if (localizedPartsRewritePath) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPartsRewritePath;
    const rewriteResponse = rewriteWithForwardedIp(request, url);
    const localeSeg = pathname.split("/", 2)[1] ?? "";
    const hostHeaderRewrite =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const hostnameRewrite = hostHeaderRewrite.split(":")[0];
    rewriteResponse.headers.set("x-api-locale", localeSeg);
    rewriteResponse.headers.set("x-current-path", pathname);
    rewriteResponse.headers.set(
      "x-current-path-with-search",
      `${pathname}${request.nextUrl.search ? request.nextUrl.search : ""}`,
    );
    rewriteResponse.headers.set("x-domain", hostHeaderRewrite || hostnameRewrite || "");
    return rewriteResponse;
  }

  // Legacy Category landing page (Sprint 40 Car Part Brands SEO update):
  // /{locale}/category -> permanent 301 to /{locale}/car-parts (new Car Part landing page)
  const legacyCategoryLandingRedirectPath = getLegacyCategoryLandingRedirectPath(pathname);
  if (legacyCategoryLandingRedirectPath) {
    const searchParamsLegacyCategory = request.nextUrl.search;
    const originalQueryStringLegacyCategory = searchParamsLegacyCategory.toString();
    const protocolLegacyCategory = request.headers.get("x-forwarded-proto") || "https";
    const hostHeaderLegacyCategory =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const redirectBaseUrlLegacyCategory = `${protocolLegacyCategory}://${hostHeaderLegacyCategory}`;
    const finalUrlLegacyCategory = handleQueryStringPreservation(
      legacyCategoryLandingRedirectPath,
      originalQueryStringLegacyCategory,
    );
    if (!isRedirectLoop(pathname, legacyCategoryLandingRedirectPath)) {
      return NextResponse.redirect(new URL(finalUrlLegacyCategory, redirectBaseUrlLegacyCategory), {
        status: 301,
      });
    }
  }

  // /{locale}/{parts}/category (bare, no L1) has no page -> permanent 301 to /{locale}/{parts}
  const bareCategoryUnderPartsRedirectPath = getBareCategoryUnderPartsRedirectPath(pathname);
  if (bareCategoryUnderPartsRedirectPath) {
    const searchParamsBareCategory = request.nextUrl.search;
    const originalQueryStringBareCategory = searchParamsBareCategory.toString();
    const protocolBareCategory = request.headers.get("x-forwarded-proto") || "https";
    const hostHeaderBareCategory =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const redirectBaseUrlBareCategory = `${protocolBareCategory}://${hostHeaderBareCategory}`;
    const finalUrlBareCategory = handleQueryStringPreservation(
      bareCategoryUnderPartsRedirectPath,
      originalQueryStringBareCategory,
    );
    if (!isRedirectLoop(pathname, bareCategoryUnderPartsRedirectPath)) {
      return NextResponse.redirect(new URL(finalUrlBareCategory, redirectBaseUrlBareCategory), {
        status: 301,
      });
    }
  }

  // Legacy Manufacturer landing page (Sprint 40 Car Part Brands SEO update):
  // /{locale}/manufacturers[...] -> permanent 301 to /{locale}/{car-parts-brands-equivalent}[...]
  const legacyManufacturersRedirectPath = getLegacyManufacturersRedirectPath(pathname);
  if (legacyManufacturersRedirectPath) {
    const searchParamsLegacy = request.nextUrl.search;
    const originalQueryStringLegacy = searchParamsLegacy.toString();
    const protocolLegacy = request.headers.get("x-forwarded-proto") || "https";
    const hostHeaderLegacy =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const redirectBaseUrlLegacy = `${protocolLegacy}://${hostHeaderLegacy}`;
    const finalUrlLegacy = handleQueryStringPreservation(
      legacyManufacturersRedirectPath,
      originalQueryStringLegacy,
    );
    if (!isRedirectLoop(pathname, legacyManufacturersRedirectPath)) {
      return NextResponse.redirect(new URL(finalUrlLegacy, redirectBaseUrlLegacy), {
        status: 301,
      });
    }
  }

  // Wrong localized brands segment for this locale → permanent 301 to the correct slug
  // (e.g. /fr-FR/car-parts-brands → /fr-FR/auto-pieces-marques). Do not 302 to not-found.
  const manufacturersSegmentCanonicalPath = fixManufacturersLocaleSegmentsInPathname(pathname);
  if (manufacturersSegmentCanonicalPath) {
    const searchParamsMfr = request.nextUrl.search;
    const originalQueryStringMfr = searchParamsMfr.toString();
    const protocolMfr = request.headers.get("x-forwarded-proto") || "https";
    const hostHeaderMfr =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const redirectBaseUrlMfr = `${protocolMfr}://${hostHeaderMfr}`;
    const finalUrlMfr = handleQueryStringPreservation(
      manufacturersSegmentCanonicalPath,
      originalQueryStringMfr,
    );
    if (!isRedirectLoop(pathname, manufacturersSegmentCanonicalPath)) {
      return NextResponse.redirect(new URL(finalUrlMfr, redirectBaseUrlMfr), { status: 301 });
    }
  }

  const localizedManufacturersRewritePath =
    rewriteLocalizedManufacturersUrlToCanonicalAppPath(pathname);
  if (localizedManufacturersRewritePath) {
    const url = request.nextUrl.clone();
    url.pathname = localizedManufacturersRewritePath;
    const rewriteResponse = rewriteWithForwardedIp(request, url);
    const localeSeg = pathname.split("/", 2)[1] ?? "";
    const hostHeaderRewrite =
      request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
    const hostnameRewrite = hostHeaderRewrite.split(":")[0];
    rewriteResponse.headers.set("x-api-locale", localeSeg);
    rewriteResponse.headers.set("x-current-path", pathname);
    rewriteResponse.headers.set(
      "x-current-path-with-search",
      `${pathname}${request.nextUrl.search ? request.nextUrl.search : ""}`,
    );
    rewriteResponse.headers.set("x-domain", hostHeaderRewrite || hostnameRewrite || "");
    return rewriteResponse;
  }

  const searchParams = request.nextUrl.search;
  const originalQueryString = searchParams.toString();

  const hostHeader = request.headers.get("host") || request.headers.get("x-forwarded-host") || "";
  const hostname = hostHeader.split(":")[0];

  const response = nextWithForwardedIp(request);
  const locale = pathname.split("/", 2)[1] ?? "";
  response.headers.set("x-api-locale", locale);
  response.headers.set("x-current-path", pathname);
  response.headers.set(
    "x-current-path-with-search",
    `${pathname}${searchParams ? `${originalQueryString}` : ""}`,
  );
  response.headers.set("x-domain", hostHeader || hostname || "");

  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const redirectBaseUrl = `${protocol}://${hostHeader}`;

  // Homepage: same for any store; no proxy; redirect to locale homepage if needed
  if (isHomepage(pathname)) {
    const redirectPath = getHomepageRedirectPath(pathname);
    if (redirectPath) {
      const finalUrl = handleQueryStringPreservation(redirectPath, originalQueryString);
      return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), {
        status: 301,
      });
    }
    return response;
  }

  // Do not redirect /pdfs or /pdfs/... to default homepage; let them through (old approach: serve PDFs at /pdfs/...)
  if (pathname === "/pdfs" || pathname.startsWith("/pdfs/")) {
    return response;
  }

  // Special-case: legacy/typo marketing URL should go to locale support page
  if (pathname === "/marketingqr") {
    const mergedParams = new URLSearchParams(request.nextUrl.searchParams);
    mergedParams.set("marketingqr", "1");
    const finalQuery = mergedParams.toString();
    const finalUrl = `/${DEFAULT_HOMEPAGE_LOCALE}${finalQuery ? `?${finalQuery}` : ""}`;
    return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), {
      status: process.env.NODE_ENV === "development" ? 307 : 301,
    });
  }

  // Single segment that is not a valid locale (e.g. /foo, /random) → redirect to /en-BE
  if (isSingleSegmentUnknownPath(pathname)) {
    const redirectPath = `/${DEFAULT_HOMEPAGE_LOCALE}`;
    const finalUrl = handleQueryStringPreservation(redirectPath, originalQueryString);
    return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), {
      status: 301,
    });
  }

  // Store from env only
  const currentStore = (process.env.STORE ||
    process.env.NEXT_PUBLIC_STORE ||
    STORE_IDS.OTTOGUSTO) as StoreId;

  // ---------------------------------------------------------------------------
  // OD-2305: Legacy `/part/` PDPs → 301 canonical live PDP, or 410 when deleted
  // ---------------------------------------------------------------------------
  // Google still crawls `/{locale}/part/{slug}/{partId}` (and older 3-segment shapes).
  // These must never soft-404 with HTTP 200.
  try {
    const legacyCandidate = parseLegacyPartPdpCandidate(pathname);
    if (legacyCandidate) {
      const { locale: incomingLocale, partid } = legacyCandidate;
      const redirectLocale = resolveCanonicalLocaleForLegacyPart(incomingLocale);
      const lang = normalizeLanguage(redirectLocale.split("-")[0] || "en");

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const apiUrl = `${apiBase.replace(/\/$/, "")}/parts/${encodeURIComponent(partid)}`;
      logPartApiCall("middleware.legacyPartPdpFetch", partid, {
        pathname,
        method: "GET",
        path: `/parts/${partid}`,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const apiHeaders = withRequestApiIpHeader(
        {
          "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
          "X-API-Lang": lang || "en",
        },
        request.headers,
      );

      let part: any = null;
      let status: number | null = null;
      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: apiHeaders,
          signal: controller.signal,
        });
        status = res.status;
        if (res.ok) {
          part = await res.json();
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // Deleted product only: explicit API 404 → 410 Gone (do not 410 on timeouts/5xx).
      if (status === 404) {
        return new NextResponse("Gone", {
          status: 410,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      if (part) {
        const manufacturerRaw = (part?.manufacturer ||
          part?.brand?.name ||
          part?.brand ||
          "") as string;
        const manufacturerSlug = slugifyManufacturerForPdp(manufacturerRaw) || "manufacturer";
        const redirectPath = buildCanonicalPartPdpPath(redirectLocale, manufacturerSlug, partid);
        const finalUrl = handleQueryStringPreservation(redirectPath, originalQueryString);
        if (
          !isRedirectLoop(
            `${pathname}${originalQueryString ? `?${originalQueryString}` : ""}`,
            finalUrl,
          )
        ) {
          return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), { status: 301 });
        }
      }
      // API failure / unexpected response: fail open (do not soft-lock crawlers on 410).
    } else if (isLegacyPartUrl(pathname)) {
      // Unmatched `/part/` shapes (bad id, wrong segment count) → true HTTP 404 (no soft-404).
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  } catch {
    // Fail open for transient errors on parseable legacy URLs.
    // Unmatched legacy shapes still get a hard 404.
    if (isLegacyPartUrl(pathname) && !parseLegacyPartPdpCandidate(pathname)) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // PDP wrong URL handling (SEO hardening)
  // ---------------------------------------------------------------------------
  // Redirect policy:
  // - Canonicalizable URLs (missing slug/route cleanup) => 301 for SEO consolidation.
  // - Not-found outcomes (part API 404) => 302 to avoid sticky permanent browser cache.
  // Algorithm:
  // 1) detect PDP-like URL with last segment as partid
  // 2) fetch part by id
  // 3) if 404 => redirect to locale not-found
  // 4) manufacturer = from API response
  // 5) if locale invalid OR route segment mismatches language => 301 to DEFAULT_PDP_BASE/{manufacturer}/{partid}
  try {
    const candidate = parsePdpCandidate(pathname);
    if (candidate) {
      const { locale: incomingLocale, routeBasedOnLang, partid } = candidate;
      const lang = normalizeLanguage(incomingLocale.split("-")[0] || "en");

      const localeValid = LANG_COUNTRY_COMBINATIONS.includes(incomingLocale);
      const expectedRoute = getPartsRouteSegmentForLang(lang);
      const routeMatchesLang = routeBasedOnLang === expectedRoute;
      const manufacturerPresent =
        typeof candidate.manufacturer === "string" && candidate.manufacturer.trim().length > 0;
      const isMalformed = !localeValid || !routeMatchesLang || !manufacturerPresent;

      // Redirect triggers (URL locale is the source of truth):
      // - invalid locale, OR
      // - route segment doesn't match URL language, OR
      // - manufacturer segment missing/empty (e.g. double slashes: /auto-onderdelen//{partid})
      //
      // We do NOT redirect on a stale `locale` cookie disagreeing with the
      // URL. Doing so caused users who had previously chosen e.g. fr-BE to
      // be bounced from clean /en-BE/car-parts/<seoName>/<partid> URLs to
      // /fr-BE/pieces-auto/<manufacturer>/<partid>, even when they clicked
      // a product on /en-BE/car-parts/category/... or /en-BE/search-results.
      // The URL the user is actually browsing wins over the cookie.
      if (isMalformed) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        const apiUrl = `${apiBase.replace(/\/$/, "")}/parts/${encodeURIComponent(partid)}`;
        logPartApiCall("middleware.malformedPdpFetch", partid, {
          pathname,
          method: "GET",
          path: `/parts/${partid}`,
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        const apiHeaders = withRequestApiIpHeader(
          {
            "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
            "X-API-Lang": lang || "en",
          },
          request.headers,
        );

        let part: any = null;
        let status: number | null = null;
        try {
          const res = await fetch(apiUrl, {
            method: "GET",
            headers: apiHeaders,
            signal: controller.signal,
          });
          status = res.status;
          if (res.ok) {
            part = await res.json();
          }
        } finally {
          clearTimeout(timeoutId);
        }

        if (status === 404 || !part) {
          const localeForNotFound = localeValid
            ? incomingLocale
            : LANG_TO_DEFAULT_LOCALE[lang] || DEFAULT_HOMEPAGE_LOCALE;
          const notFoundPath = `/${localeForNotFound}/not-found`;
          const finalUrl = handleQueryStringPreservation(notFoundPath, originalQueryString);
          // Temporary redirect avoids sticky browser caching for transient not-found resolutions.
          return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), { status: 302 });
        }

        const manufacturerRaw = (part?.manufacturer ||
          part?.brand?.name ||
          part?.brand ||
          "") as string;
        const manufacturerSlug = slugifyLoose(manufacturerRaw) || "manufacturer";

        // Malformed PDP URLs canonicalize to the default base (/en-BE/car-parts).
        // We only enter this block on isMalformed, so there's no longer a
        // cookie-driven branch picking a different locale.
        const redirectLocale = DEFAULT_HOMEPAGE_LOCALE;
        const redirectRoute: PartsRouteSegment = getPartsRouteSegmentForLang("en");
        const redirectPath = `/${redirectLocale}/${redirectRoute}/${manufacturerSlug}/${partid}`;
        const finalUrl = handleQueryStringPreservation(redirectPath, originalQueryString);
        return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), { status: 301 });
      }
    }
  } catch (e) {
    // Fail open: don't block request on redirect logic errors.
  }

  if (currentStore === STORE_IDS.OTTOGUSTO) {
    return response;
  }

  // Qverde: only static 301 map; no proxy
  if (currentStore === STORE_IDS.QVERDE) {
    // Skip proxy when request is already for the not-found page to avoid repeated calls and redirect loop
    const pathSegments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const isNotFoundPath = pathSegments.length === 1 && pathSegments[0] === "not-found";
    const isLocaleNotFoundPath =
      pathSegments.length === 2 &&
      LANG_COUNTRY_COMBINATIONS.includes(pathSegments[0] ?? "") &&
      pathSegments[1] === "not-found";
    if (isNotFoundPath || isLocaleNotFoundPath) {
      return response;
    }
    // Do not proxy /pdfs/...; let them through so PDFs are served (no redirect to en-BE/not-found)
    if (pathname.startsWith("/pdfs/") || pathname.includes("/pdfs/")) {
      return response;
    }
    // Only call proxy for "old" URLs: first segment is language-only (en, nl, fr), not a full locale (en-BE, etc.)
    if (pathSegments.length >= 1 && LANG_COUNTRY_COMBINATIONS.includes(pathSegments[0] ?? "")) {
      return response;
    }
    // const targetPath = getQverde301Redirect(pathname);
    // if (targetPath) {
    //   const finalRedirectUrl = handleQueryStringPreservation(
    //     targetPath,
    //     originalQueryString,
    //   );
    //   return NextResponse.redirect(
    //     new URL(finalRedirectUrl, redirectBaseUrl),
    //     { status: 301 },
    //   );
    // }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const apiLang = locale?.split("-")[0] || "en";
    const proxyUrl = `${apiBase.replace(/\/$/, "")}/Proxy${pathname}`;
    const incomingUrl = `${pathname}${originalQueryString ? `?${originalQueryString}` : ""}`;
    const apiHeaders = withRequestApiIpHeader(
      {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
        "x-api-lang": apiLang,
      },
      request.headers,
    );
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const proxyResponse = await fetch(proxyUrl, {
        method: "GET",
        headers: apiHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const bodyText = await proxyResponse.text();
      let trimmedBody = bodyText?.trim() ?? "";
      // Strip surrounding double quotes if API returns JSON string (e.g. "\"/en-BE/about-us\"")
      if (trimmedBody.length >= 2 && trimmedBody.startsWith('"') && trimmedBody.endsWith('"')) {
        trimmedBody = trimmedBody.slice(1, -1).trim();
      }
      if (proxyResponse.status === 200 && trimmedBody.length > 0) {
        const baseUrl = (
          process.env.NEXT_PUBLIC_FRONTEND_PROD_URL ||
          process.env.FRONTEND_PROD_URL ||
          redirectBaseUrl
        ).replace(/\/$/, "");
        const redirectPath = trimmedBody.startsWith("/") ? trimmedBody : `/${trimmedBody}`;
        const fullRedirectUrl = `${baseUrl}${redirectPath}`;
        const finalUrl = handleQueryStringPreservation(fullRedirectUrl, originalQueryString);
        return NextResponse.redirect(new URL(finalUrl), { status: 301 });
      }

      if (proxyResponse.status === 404) {
        const localeForNotFound = LANG_TO_DEFAULT_LOCALE[apiLang] || DEFAULT_HOMEPAGE_LOCALE;
        const notFoundPath = `/${localeForNotFound}/not-found`;
        const baseUrl = (
          process.env.NEXT_PUBLIC_FRONTEND_PROD_URL ||
          process.env.FRONTEND_PROD_URL ||
          redirectBaseUrl
        ).replace(/\/$/, "");
        const fullRedirectUrl = `${baseUrl}${notFoundPath}`;
        const finalUrl = handleQueryStringPreservation(fullRedirectUrl, originalQueryString);
        // Keep not-found redirects temporary to prevent stale permanent cache on clients.
        return NextResponse.redirect(new URL(finalUrl), { status: 302 });
      }

      // Else: 200 empty or any other status -> redirect to homepage
      const localeForHomepage = LANG_TO_DEFAULT_LOCALE[apiLang] || DEFAULT_HOMEPAGE_LOCALE;
      const homePath = `/${localeForHomepage}`;
      const finalUrl = handleQueryStringPreservation(homePath, originalQueryString);
      return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), { status: 301 });
    } catch (err) {
      clearTimeout(timeoutId);
      const localeForHomepage = LANG_TO_DEFAULT_LOCALE[apiLang] || DEFAULT_HOMEPAGE_LOCALE;
      const homePath = `/${localeForHomepage}`;
      const finalUrl = handleQueryStringPreservation(homePath, originalQueryString);
      return NextResponse.redirect(new URL(finalUrl, redirectBaseUrl), { status: 301 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|favicon\\.ico|robots\\.txt|sitemap\\.xml|qverde-|ottogusto-).*)",
  ],
};
