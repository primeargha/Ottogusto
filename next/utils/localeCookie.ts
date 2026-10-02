import { DEFAULT_HOMEPAGE_LOCALE, LANG_COUNTRY_COMBINATIONS } from "@/config/locale-constants";

export const POST_LOGOUT_LOCALE_KEY = "postLogoutLocale";
/** Set on logout; BrandingProvider invalidates + refetches translations for this locale. */
export const POST_LOGOUT_REFRESH_TRANSLATIONS_KEY = "postLogoutRefreshTranslations";

export type ResolveLocaleOptions = {
  languageCountryParam?: string | null | undefined;
  pathname?: string | null | undefined;
};

/** Validate/normalize a candidate against supported full locales (e.g. "nl-be" -> "nl-BE"). */
export function normalizeLocale(candidate?: string | null): string | null {
  if (!candidate) return null;
  const lower = candidate.trim().toLowerCase();
  return LANG_COUNTRY_COMBINATIONS.find((lc) => lc.toLowerCase() === lower) ?? null;
}

/**
 * Resolve the user's active full locale in priority order:
 * URL param -> pathname segment -> localStorage.
 * Returns null when no valid locale can be determined.
 */
export function resolveActiveLocale(options: ResolveLocaleOptions = {}): string | null {
  const fromParam = normalizeLocale(options.languageCountryParam);
  if (fromParam) return fromParam;

  const pathSegment = options.pathname?.split("/").filter(Boolean)[0] ?? null;
  const fromPath = normalizeLocale(pathSegment);
  if (fromPath) return fromPath;

  if (typeof window !== "undefined") {
    const fromStorage = normalizeLocale(localStorage.getItem("locale"));
    if (fromStorage) return fromStorage;
  }

  return null;
}

/**
 * Persist the active locale before Auth0 logout.
 * Auth0 returns to the whitelisted base URL; OLDClientLayout reads `postLogoutLocale`
 * from sessionStorage and redirects to the correct locale homepage.
 */
export function persistLocaleForLogout(options: ResolveLocaleOptions = {}): string {
  const locale = resolveActiveLocale(options) ?? DEFAULT_HOMEPAGE_LOCALE;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("locale", locale);
      sessionStorage.setItem(POST_LOGOUT_LOCALE_KEY, locale);
      sessionStorage.setItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY, locale);
    } catch {}
  }

  // Lazy require to avoid circular imports at module load time.
  try {
    const { useLandingPageDataStore } = require("@/stores/useLandingPageDataStore");
    useLandingPageDataStore.getState().setLocale(locale);
  } catch {}

  return locale;
}

/** Extract the locale segment from a pathname (e.g. "/fr-BE/car-parts" -> "fr-BE"). */
export function getLocaleFromPathname(pathname: string | null | undefined): string | null {
  const segment = pathname?.split("/").filter(Boolean)[0] ?? null;
  return normalizeLocale(segment);
}

/**
 * Homepage path for 404/403 "Back to home" (and similar).
 * Prefer URL / storage locale — never clear localStorage (that logs users out and wipes guest car/VIN meta).
 * Branding `getLocale()` often returns a lang code ("en") which is not a full combo.
 */
export function resolveErrorPageHomePath(
  options: {
    pathname?: string | null | undefined;
    /** Optional full locale hint (e.g. landing store). Lang-only values are ignored. */
    preferredLocale?: string | null | undefined;
  } = {},
): string {
  const locale =
    resolveActiveLocale({ pathname: options.pathname }) ??
    normalizeLocale(options.preferredLocale) ??
    DEFAULT_HOMEPAGE_LOCALE;
  return `/${locale}`;
}

/** Read the post-logout target locale from sessionStorage, if set. */
export function getPostLogoutTargetLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeLocale(sessionStorage.getItem(POST_LOGOUT_LOCALE_KEY));
  } catch {
    return null;
  }
}

/** True while the URL locale does not yet match the post-logout target. */
export function isPostLogoutRedirectPending(pathname: string | null | undefined): boolean {
  const target = getPostLogoutTargetLocale();
  if (!target) return false;
  const current = getLocaleFromPathname(pathname);
  return current !== target;
}

/** Clear the post-logout redirect flag after navigation completes. */
export function clearPostLogoutLocaleFlag(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(POST_LOGOUT_LOCALE_KEY);
  } catch {}
}

export function getPostLogoutRefreshTranslationsLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeLocale(sessionStorage.getItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY));
  } catch {
    return null;
  }
}

export function clearPostLogoutRefreshTranslationsFlag(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY);
  } catch {}
}

/** Remove all post-logout session flags (redirect + translation refresh). */
export function clearAllPostLogoutLocaleFlags(): void {
  clearPostLogoutLocaleFlag();
  clearPostLogoutRefreshTranslationsFlag();
}

/**
 * After cache clear or navigation to a different locale than the post-logout target,
 * drop stale session flags so BrandingProvider can load translations for the URL locale.
 * Returns true when any flag was cleared.
 */
export function clearStalePostLogoutFlagsForPathname(pathname: string | null | undefined): boolean {
  const pathLocale = getLocaleFromPathname(pathname);
  if (!pathLocale) return false;

  let cleared = false;
  const redirectTarget = getPostLogoutTargetLocale();
  if (redirectTarget && redirectTarget !== pathLocale) {
    clearPostLogoutLocaleFlag();
    cleared = true;
  }

  const refreshTarget = getPostLogoutRefreshTranslationsLocale();
  if (refreshTarget && refreshTarget !== pathLocale) {
    clearPostLogoutRefreshTranslationsFlag();
    cleared = true;
  }

  return cleared;
}

/** Language code from a full locale (e.g. "de-BE" -> "de"). */
export function getLangCodeFromLocale(locale: string | null | undefined): string | null {
  const normalized = normalizeLocale(locale);
  if (!normalized) return null;
  const lang = normalized.split("-")[0]?.toLowerCase();
  return lang || null;
}

/** Language code from the URL locale segment (e.g. "/de-BE/..." -> "de"). */
export function getLangCodeFromPathname(pathname: string | null | undefined): string | null {
  return getLangCodeFromLocale(getLocaleFromPathname(pathname));
}
