import type { Category } from "@/type";
import { CATEGORY_CACHE_TTL_MS } from "@/constants";
import { isNestedCategoryTreeUsable } from "@/lib/nested-categories-tree";
import { clearNestedCategoriesIdbCache } from "./nested-categories-idb-cache";

const STORAGE_PREFIX = "og-nested-categories-navigation-v3";
/** Invalidate using shared category TTL. */
export const NESTED_CATEGORIES_BROWSER_CACHE_MAX_AGE_MS = CATEGORY_CACHE_TTL_MS;

type StoredPayload = {
  savedAt: number;
  data: Category[];
};

function normalizeLocaleKey(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9-]/g, "");
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length >= 2) {
    const lang = parts[0];
    if (!lang) return "en-BE";
    return `${lang.toLowerCase()}-${parts.slice(1).join("-").toUpperCase()}`;
  }
  if (parts.length === 1 && parts[0] && /^[a-z]{2}$/i.test(parts[0])) {
    const lang = parts[0].toLowerCase();
    const region = DEFAULT_REGION_BY_LANG[lang] ?? "BE";
    return `${lang}-${region}`;
  }
  return "en-BE";
}

/** When `locale` in localStorage is only a language code (e.g. `nl`), align cache bucket with storefront routes. */
const DEFAULT_REGION_BY_LANG: Record<string, string> = {
  en: "BE",
  nl: "BE",
  fr: "BE",
  de: "BE",
};

/**
 * Locale key for category cache + React Query.
 * Order (critical after language switch):
 * 1. **Pathname** first segment — always matches visible URL (`/nl-BE/...`), so read/write use the same key on reload.
 * 2. `language-country` from `useParams` — can lag URL right after `router.navigate`.
 * 3. `locale` in localStorage — may still be previous language until sync effects run.
 */
export function getCategoryCacheLocaleKey(languageCountryFromParams?: string | null): string {
  if (typeof window !== "undefined") {
    try {
      const seg = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
      if (seg.includes("-") && seg.length >= 5) {
        return normalizeLocaleKey(seg);
      }
    } catch {
      /* ignore */
    }
  }
  if (languageCountryFromParams) {
    return normalizeLocaleKey(languageCountryFromParams);
  }
  if (typeof window === "undefined") {
    return "ssr";
  }
  try {
    const fromLs = localStorage.getItem("locale");
    if (fromLs) return normalizeLocaleKey(fromLs);
  } catch {
    /* ignore */
  }
  return "en-BE";
}

function storageKey(localeKey: string): string {
  const safe = localeKey.replace(/[^a-zA-Z0-9-]/g, "") || "en-BE";
  return `${STORAGE_PREFIX}:${safe}`;
}

/**
 * Synchronous read of the nested category tree for the given locale key.
 * Used so reload skips 1+N Category API calls until TTL expires or locale bucket changes.
 */
export function readNestedCategoriesBrowserCache(localeKey: string): Category[] | null {
  if (typeof window === "undefined") return null;
  try {
    const key = storageKey(localeKey);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (!parsed?.savedAt || !Array.isArray(parsed.data)) return null;
    if (Date.now() - parsed.savedAt > NESTED_CATEGORIES_BROWSER_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    if (!isNestedCategoryTreeUsable(parsed.data)) {
      localStorage.removeItem(key);
      return null;
    }
    return JSON.parse(JSON.stringify(parsed.data)) as Category[];
  } catch {
    try {
      localStorage.removeItem(storageKey(localeKey));
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function writeNestedCategoriesBrowserCache(data: Category[], localeKey: string): void {
  if (typeof window === "undefined" || !localeKey || !isNestedCategoryTreeUsable(data)) return;
  try {
    const payload: StoredPayload = { savedAt: Date.now(), data };
    localStorage.setItem(storageKey(localeKey), JSON.stringify(payload));
  } catch {
    /* quota or private mode */
  }
}

export function clearNestedCategoriesBrowserCache(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${STORAGE_PREFIX}:`)) keys.push(k);
    }
    for (const k of keys) {
      localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
  void clearNestedCategoriesIdbCache();
}
