// PERF: Removed unused useEffect/useState imports (this is a server component)
import { Suspense } from "react";

import localFont from "next/font/local";
import { LANG_COUNTRY_COMBINATIONS, ROTATION_INTERVAL } from "@/constants";
import { ConfigProvider, ConfigType } from "@/contexts/ConfigContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { getConfig } from "@/services/config";
import { getTranslations } from "@/services/authService";
import dynamic from "next/dynamic";
// PERF: Lazy-load below-fold components — not needed for initial paint
const BottomNavBar = dynamic(() => import("@/screens/landing/bottom-navbar"), { ssr: false });
const FooterLanding = dynamic(() => import("@/screens/landing/footer"), { ssr: false });
import { Box } from "@/components/ui/box";
import GTM, { GTMNoScript } from "@/components/GTM";
import GTMConsentBootstrap from "@/components/GTMConsentBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TypographyProvider } from "@/components/TypographyProvider";
import { ColorProvider } from "@/components/ColorProvider";
import { getCurrentServerStore } from "@/utils/server-store";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import * as Sentry from "@sentry/nextjs";
import { Metadata } from "next";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import HeaderRow from "@/screens/landing/header-row";
import { ErrorTemplate } from "@/components/og-components/ErrorTemplate";
import { OGButton } from "@/components/og-components/OGButton";
import OLDClientLayout from "./OLDClientLayout";
import RedirectManager from "./(public)/RedirectManager";
import CanonicalLink from "./CanonicalLink";
import { ErrorBoundary } from "./ErrorBoundary";
import NotFound from "./not-found";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { isTrustprofileEnabled, TRUSTPROFILE_CONFIG } from "@/config/trustprofile";
import { generateColorCSS, generateTypographyCSS } from "@/utils/server-theme-css";
import { detectPage } from "@/utils/detectPage";
import { stripLandingHeroTranslations } from "@/utils/stripLandingHeroTranslations";

// Function to determine Cookiebot config based on store
const getCookiebotConfig = (): { cbid: string; domain: string } => {
  const store = process.env.STORE || process.env.NEXT_PUBLIC_STORE || "";
  const frontendUrl =
    process.env.FRONTEND_PROD_URL || process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "";

  // QVerde store
  if (store === STORE_IDS.QVERDE || frontendUrl.includes(STORE_IDS.QVERDE)) {
    return {
      cbid: process.env.NEXT_PUBLIC_COOKIEBOT_ID || "c86922c6-efd1-42a3-9553-b5b86d4dd218", // Replace with actual QVerde Cookiebot ID
      domain: "qverde.com",
    };
  }

  // Default: Ottogusto
  return {
    cbid: process.env.NEXT_PUBLIC_COOKIEBOT_ID || "86431247-9b0b-46a1-adf4-c1bb400189cf",
    domain: "ottogusto.com",
  };
};

// Get Cookiebot config at module level for server-side rendering
const COOKIEBOT_CONFIG = getCookiebotConfig();

// PERF: Cookiebot as server-rendered inline script — deferred via requestIdleCallback/setTimeout
// to match lazyOnload behavior without the client-side next/script component overhead
function CookiebotScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function(){
  function loadCB(){
    try {
      // If Cookiebot is already present (e.g. injected via GTM or another snippet), avoid loading it again
      if (window.Cookiebot || document.getElementById('cookiebot-script')) {
        return;
      }
    } catch (e) {
      // Fail silently — analytics must never break the page
    }
    var _cbq=window._cbq=(window._cbq||[]);
    if(!_cbq.some(function(cb){return cb[0]==='consent'})){
      var s=document.createElement('script');
      s.async=true;s.src='https://consent.cookiebot.com/uc.js';
      s.id='cookiebot-script';
      s.setAttribute('data-cbid','${COOKIEBOT_CONFIG.cbid}');
      s.setAttribute('data-cookieconsent-level','strict');
      s.setAttribute('data-cookieconsent-settings','marketing,preferences,statistics');
      s.setAttribute('data-cookieconsent-lifetime','365');
      s.setAttribute('data-cookieconsent-domain','${COOKIEBOT_CONFIG.domain}');
      document.head.appendChild(s);
    }
  }
  if(typeof requestIdleCallback==='function'){requestIdleCallback(loadCB);}
  else{setTimeout(loadCB,1);}  
})();
        `,
      }}
    />
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

// Self-hosted local TTFs — the exact same per-weight font files next/font/google
// previously fetched from fonts.gstatic.com (not the raw/unsubsetted google/fonts
// GitHub source, which renders differently), so typography is pixel-identical to
// before. No external Google Fonts CDN request at first paint, so there's no
// post-paint font swap. Next.js's font-loader compiler requires each call to be a
// direct top-level const (conditional/ternary calls are rejected at build time), so
// all fonts are loaded unconditionally here; which brand's CSS vars actually get
// consumed is still decided by STORE via generateTypographyCSS/theme.css.
const inter = localFont({
  src: [
    { path: "./fonts/inter/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/inter/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/inter/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/inter/Inter-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-inter",
});

// Ottogusto fonts
const overpass = localFont({
  src: [
    { path: "./fonts/ottogusto/Overpass-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ottogusto/Overpass-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-overpass",
});
const overpassMono = localFont({
  src: [
    { path: "./fonts/ottogusto/OverpassMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ottogusto/OverpassMono-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-overpass-mono",
  fallback: ["Consolas", "Ubuntu Mono", "monospace"],
});
const anton = localFont({
  src: "./fonts/ottogusto/Anton.ttf",
  display: "swap",
  variable: "--font-anton",
  weight: "400",
});

// QVerde fonts
const oswald = localFont({
  src: [
    { path: "./fonts/qverde/Oswald-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/qverde/Oswald-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-oswald",
});
const publicSans = localFont({
  src: [
    { path: "./fonts/qverde/PublicSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/qverde/PublicSans-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-public-sans",
});
const chivoMono = localFont({
  src: [
    { path: "./fonts/qverde/ChivoMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/qverde/ChivoMono-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-chivo-mono",
});

// PERF: Removed force-dynamic — it disabled ALL caching for every route.
// Individual routes that need dynamic behavior should set their own `dynamic` export.
// export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  other: {
    ...Sentry.getTraceData(),
    ...(process.env.STORE == STORE_IDS.OTTOGUSTO && {
      "apple-mobile-web-app-title": "Ottogusto",
    }),
    ...(process.env.STORE == STORE_IDS.QVERDE && {
      "apple-mobile-web-app-title": "Qverde",
    }),
  },
  icons: {
    icon: [
      {
        url:
          process.env.STORE == STORE_IDS.OTTOGUSTO
            ? "/og-favicon/favicon.ico"
            : "/qverde-favicon/favicon.ico",
        type: "image/x-icon",
      },
      ...(process.env.STORE == STORE_IDS.OTTOGUSTO
        ? [
            {
              url: "/og-favicon/favicon-96x96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              url: "/og-favicon/favicon.svg",
              type: "image/svg+xml",
            },
          ]
        : [
            {
              url: "/qverde-favicon/favicon-96x96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              url: "/qverde-favicon/favicon.svg",
              type: "image/svg+xml",
            },
          ]),
    ],
    apple:
      process.env.STORE == STORE_IDS.OTTOGUSTO
        ? "/og-favicon/apple-touch-icon.png"
        : "/qverde-favicon/apple-touch-icon.png",
  },
  manifest:
    process.env.STORE == STORE_IDS.OTTOGUSTO
      ? "/og-favicon/site.webmanifest"
      : "/qverde-favicon/site.webmanifest",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang?: string[] };
}>) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  // Try to get pathname from middleware header, or fall back to x-invoke-path (Next.js internal)
  const pathname = headersList.get("x-current-path") || headersList.get("x-invoke-path") || "";
  const pathWithSearch = headersList.get("x-current-path-with-search") || pathname;

  // ✅ Check if this is a static file path (middleware was skipped)
  // Note: Empty pathname means middleware didn't run (static file request)
  const isStaticFilePath =
    pathname === "" || // Empty pathname means middleware was skipped (static file)
    /^\/(qverde-|ottogusto-|og-favicon|_next\/|api\/)/i.test(pathname) ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|json|webmanifest|xml|txt|css|js|woff|woff2|ttf|eot)$/i.test(
      pathname,
    );

  // For static file paths, skip expensive API calls but still render with providers
  const configApiResponse = isStaticFilePath ? null : await getConfig();
  const config: ConfigType | null = configApiResponse as ConfigType | null;

  // Detect store from URL at server level
  const currentStore = getCurrentServerStore();

  // PERF: Pre-generate theme CSS on the server so it's in the initial HTML (no client-side useEffect needed)
  const serverColorCSS = generateColorCSS(currentStore);
  const serverTypographyCSS = generateTypographyCSS(currentStore);

  // Convert milliseconds to seconds for CSS
  const rotationIntervalSeconds = ROTATION_INTERVAL / 1000;

  const domainURL = new URL(process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "");

  // Extract language from URL path (first segment)
  let lang = pathname.split("/")[1] || "";
  const isInternalDomain = host !== domainURL.host;

  // ✅ Fetch translations ONCE on server-side (skip for static files)
  let translationsData = null as unknown | null;
  const langCode = lang?.split("-")[0] || "en";
  if (!isStaticFilePath) {
    try {
      const translationsResponse = await getTranslations(langCode);
      translationsData = translationsResponse?.data || translationsResponse;
      if (
        translationsData &&
        typeof translationsData === "object" &&
        !Array.isArray(translationsData) &&
        detectPage(pathname) === "product-details"
      ) {
        translationsData = stripLandingHeroTranslations(
          translationsData as Record<string, unknown>,
        );
      }
    } catch (error) {
      console.error("Error fetching translations in layout:", formatHttpClientError(error));
    }
  }

  // Check if the language is in lowercase format (e.g., en-be, fr-be)
  const lowerCaseLang = lang.toLowerCase();
  const matchingLang = LANG_COUNTRY_COMBINATIONS.find((lc) => lc.toLowerCase() === lowerCaseLang);

  // debugger;

  // If it's a valid lowercase locale, perform a 301 redirect to the proper format
  if (matchingLang && matchingLang !== lang) {
    // Preserve any existing query string while normalizing the locale segment
    const [currentPathOnly, currentSearch = ""] = pathWithSearch.split("?");
    const newPath = currentPathOnly?.replace(`/${lang}`, `/${matchingLang}`);
    const newPathWithSearch: string | URL | undefined = currentSearch
      ? `${newPath}?${currentSearch}`
      : newPath;
    const fullUrl = new URL(newPathWithSearch ?? "", domainURL);

    // Use Next.js's permanentRedirect for 301 redirects
    permanentRedirect(fullUrl.toString());
  }

  // If language is not in the list, return not found page
  if (!LANG_COUNTRY_COMBINATIONS.includes(lang) && lang.length > 2) {
    return (
      <html lang="en">
        <head>
          {isInternalDomain && <meta name="robots" content="noindex" />}
          <link
            rel="shortcut icon"
            href={
              process.env.STORE == STORE_IDS.OTTOGUSTO
                ? "/og-favicon/favicon.ico"
                : "/qverde-favicon/favicon.ico"
            }
          />
          <style id="runtime-colors" dangerouslySetInnerHTML={{ __html: serverColorCSS }} />
          <style
            id="typography-variables"
            dangerouslySetInnerHTML={{ __html: serverTypographyCSS }}
          />
          <GTM />
        </head>
        <body>
          <GTMNoScript />
          <ConfigProvider value={config}>
            <StoreProvider currentStore={currentStore}>
              <ColorProvider>
                <ThemeProvider>
                  <ErrorBoundary
                    fallback={
                      <ErrorTemplate
                        title="Something went wrong"
                        description="We're working on fixing this issue. Please try refreshing the page."
                        buttonLabel="Try again"
                        // onButtonClick={() => window.location.replace("/")}
                        imageSrc={null} // You can add a specific error image here if desired
                      />
                    }
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <TypographyProvider>
                        <OLDClientLayout
                          initialTranslations={translationsData}
                          initialLang={langCode}
                        >
                          <Box className="flex w-full flex-col">
                            {/* {children} */}
                            {/* <HeaderRow /> */}
                            {/* OD-1720 FIXED */}
                            <NotFound />
                            <FooterLanding />
                          </Box>
                          <BottomNavBar />
                          <RedirectManager />
                        </OLDClientLayout>
                      </TypographyProvider>
                    </Suspense>
                  </ErrorBoundary>
                </ThemeProvider>
              </ColorProvider>
            </StoreProvider>
          </ConfigProvider>
        </body>
      </html>
    );
  }

  return (
    <html
      lang={lang}
      // PERF/CORRECTNESS: next/font's --font-* variables must be defined on the SAME
      // element as (or an ancestor of) the :root { --font-family-display: var(--font-anton), ... }
      // declaration in the injected typography-variables <style> tag. CSS custom
      // properties resolve var() at the element where they're DECLARED, not where
      // they're later inherited — so if --font-anton only existed on <body> (a
      // descendant of :root), --font-family-display would compute to the
      // guaranteed-invalid value at :root and every element would inherit that
      // broken (empty) value, silently falling back to the inherited body font.
      className={`${inter.variable} ${overpass.variable} ${overpassMono.variable} ${anton.variable} ${oswald.variable} ${publicSans.variable} ${chivoMono.variable}`}
      style={{ "--rotation-interval": `${rotationIntervalSeconds}s` } as React.CSSProperties}
      dir={["ar", "he", "fa"].includes(lang) ? "rtl" : "ltr"}
    >
      <head>
        {isTrustprofileEnabled(currentStore) && (
          <meta name="tp-claim" content={TRUSTPROFILE_CONFIG.claimToken} />
        )}
        {isInternalDomain && <meta name="robots" content="noindex" />}
        <link
          rel="shortcut icon"
          href={
            process.env.STORE == STORE_IDS.OTTOGUSTO
              ? "/og-favicon/favicon.ico"
              : "/qverde-favicon/favicon.ico"
          }
        />
        {/* <CanonicalLink /> */}
        {/* PERF: Fonts are self-hosted local TTFs via next/font/local (see const
           declarations above) — no external Google Fonts CDN request at all, so
           there's no post-paint font swap to cause a flicker. */}
        {/* PERF: Preconnect to CDN for product/category images — saves DNS+TLS for LCP */}
        <link rel="preconnect" href="https://cdn.ottogusto.group" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.ottogusto.group" />
        {/* PERF: Server-rendered theme CSS — eliminates ColorProvider/TypographyProvider useEffect TBT */}
        <style id="runtime-colors" dangerouslySetInnerHTML={{ __html: serverColorCSS }} />
        <style
          id="typography-variables"
          dangerouslySetInnerHTML={{ __html: serverTypographyCSS }}
        />
        <GTMConsentBootstrap />
        <GTM />
        {/* Cookiebot is loaded via GTM now; keep in-app loader disabled to avoid duplicate injection */}
        {/* <CookiebotScript /> */}
      </head>
      <body
        className={`${inter.className} ${overpass.variable} ${overpassMono.variable} ${anton.variable} ${oswald.variable} ${publicSans.variable} ${chivoMono.variable} bg-[--neutral-beige-400]`}
        style={{ display: "flex" }}
        suppressHydrationWarning
      >
        <GTMNoScript />
        <ConfigProvider value={config}>
          <StoreProvider currentStore={currentStore}>
            <ColorProvider>
              <ThemeProvider>
                <ErrorBoundary
                  fallback={
                    <ErrorTemplate
                      title="Something went wrong"
                      description="We're working on fixing this issue. Please try refreshing the page."
                      buttonLabel="Try again"
                      // onButtonClick={() => window.location.replace("/")}
                      imageSrc={null} // You can add a specific error image here if desired
                    />
                  }
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <TypographyProvider>
                      <OLDClientLayout
                        initialTranslations={translationsData}
                        initialLang={langCode}
                      >
                        <Box className="flex w-full flex-col">
                          {children}
                          <FooterLanding />
                        </Box>
                        <BottomNavBar />
                        <RedirectManager />
                      </OLDClientLayout>
                    </TypographyProvider>
                  </Suspense>
                </ErrorBoundary>
              </ThemeProvider>
            </ColorProvider>
          </StoreProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
