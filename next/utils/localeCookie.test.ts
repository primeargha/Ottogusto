import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPostLogoutLocaleFlag,
  clearStalePostLogoutFlagsForPathname,
  getLangCodeFromLocale,
  getLangCodeFromPathname,
  getLocaleFromPathname,
  getPostLogoutRefreshTranslationsLocale,
  getPostLogoutTargetLocale,
  isPostLogoutRedirectPending,
  normalizeLocale,
  persistLocaleForLogout,
  POST_LOGOUT_LOCALE_KEY,
  POST_LOGOUT_REFRESH_TRANSLATIONS_KEY,
  resolveActiveLocale,
  resolveErrorPageHomePath,
} from "./localeCookie";

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("localeCookie", () => {
  it("normalizeLocale validates and normalizes casing", () => {
    expect(normalizeLocale("nl-be")).toBe("nl-BE");
    expect(normalizeLocale("EN-be")).toBe("en-BE");
    expect(normalizeLocale("xx-YY")).toBeNull();
    expect(normalizeLocale(null)).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
  });

  it("resolveActiveLocale prefers the URL param over the pathname", () => {
    expect(
      resolveActiveLocale({
        languageCountryParam: "fr-LU",
        pathname: "/nl-BE/car-parts",
      }),
    ).toBe("fr-LU");
  });

  it("resolveErrorPageHomePath prefers pathname locale and never needs branding lang-only", () => {
    expect(
      resolveErrorPageHomePath({
        pathname: "/en-BE/car-parts/toyota/bad-id",
        preferredLocale: "en",
      }),
    ).toBe("/en-BE");
    expect(
      resolveErrorPageHomePath({
        pathname: "/fr-BE/car-parts",
        preferredLocale: "nl-BE",
      }),
    ).toBe("/fr-BE");
    expect(resolveErrorPageHomePath({ pathname: "/", preferredLocale: "nl-BE" })).toBe("/nl-BE");
    expect(resolveErrorPageHomePath({ pathname: "/", preferredLocale: "en" })).toBe("/en-BE");
  });

  it("resolveActiveLocale falls back to the pathname segment", () => {
    expect(resolveActiveLocale({ pathname: "/de-NL/support" })).toBe("de-NL");
  });

  it("resolveActiveLocale returns null when nothing valid is available", () => {
    expect(resolveActiveLocale({ pathname: "/car-parts" })).toBeNull();
  });

  it("persistLocaleForLogout returns the resolved locale from pathname", () => {
    const storage = createSessionStorageMock();
    const localStorageMock = createSessionStorageMock();
    vi.stubGlobal("sessionStorage", storage);
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("window", { sessionStorage: storage, localStorage: localStorageMock });
    expect(persistLocaleForLogout({ pathname: "/de-BE/profile" })).toBe("de-BE");
    expect(storage.getItem(POST_LOGOUT_LOCALE_KEY)).toBe("de-BE");
    expect(storage.getItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY)).toBe("de-BE");
    vi.unstubAllGlobals();
  });

  describe("post-logout redirect helpers", () => {
    let storage: ReturnType<typeof createSessionStorageMock>;

    beforeEach(() => {
      storage = createSessionStorageMock();
      vi.stubGlobal("sessionStorage", storage);
      vi.stubGlobal("window", { sessionStorage: storage });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("getLocaleFromPathname extracts the locale segment", () => {
      expect(getLocaleFromPathname("/fr-BE/car-parts")).toBe("fr-BE");
      expect(getLocaleFromPathname("/")).toBeNull();
    });

    it("getPostLogoutTargetLocale reads from sessionStorage", () => {
      storage.setItem(POST_LOGOUT_LOCALE_KEY, "fr-be");
      expect(getPostLogoutTargetLocale()).toBe("fr-BE");
    });

    it("isPostLogoutRedirectPending is true when URL locale differs from target", () => {
      storage.setItem(POST_LOGOUT_LOCALE_KEY, "fr-BE");
      expect(isPostLogoutRedirectPending("/en-BE")).toBe(true);
      expect(isPostLogoutRedirectPending("/fr-BE")).toBe(false);
      expect(isPostLogoutRedirectPending("/")).toBe(true);
    });

    it("clearPostLogoutLocaleFlag removes the sessionStorage key", () => {
      storage.setItem(POST_LOGOUT_LOCALE_KEY, "fr-BE");
      clearPostLogoutLocaleFlag();
      expect(getPostLogoutTargetLocale()).toBeNull();
    });
  });

  describe("post-logout translation refresh", () => {
    let storage: ReturnType<typeof createSessionStorageMock>;

    beforeEach(() => {
      storage = createSessionStorageMock();
      vi.stubGlobal("sessionStorage", storage);
      vi.stubGlobal("window", { sessionStorage: storage });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("getLangCodeFromLocale extracts language from full locale", () => {
      expect(getLangCodeFromLocale("de-BE")).toBe("de");
      expect(getLangCodeFromLocale("invalid")).toBeNull();
    });

    it("getLangCodeFromPathname extracts language from URL", () => {
      expect(getLangCodeFromPathname("/de-BE")).toBe("de");
      expect(getLangCodeFromPathname("/")).toBeNull();
    });

    it("getPostLogoutRefreshTranslationsLocale reads refresh flag", () => {
      storage.setItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY, "de-be");
      expect(getPostLogoutRefreshTranslationsLocale()).toBe("de-BE");
    });

    it("clearStalePostLogoutFlagsForPathname clears flags when URL locale differs", () => {
      storage.setItem(POST_LOGOUT_LOCALE_KEY, "de-BE");
      storage.setItem(POST_LOGOUT_REFRESH_TRANSLATIONS_KEY, "de-BE");
      expect(clearStalePostLogoutFlagsForPathname("/en-BE")).toBe(true);
      expect(getPostLogoutTargetLocale()).toBeNull();
      expect(getPostLogoutRefreshTranslationsLocale()).toBeNull();
      expect(clearStalePostLogoutFlagsForPathname("/en-BE")).toBe(false);
    });
  });
});
