import { DEFAULT_HOMEPAGE_LOCALE } from "@/config/locale-constants";
import { useRouteStore } from "@/stores/useRouteStore";
import { normalizeLocale } from "@/utils/localeCookie";
import { stripLocalePrefixFromPath } from "@/utils/translationDisplayMode";

/** Locale persisted by OGLanguageSelectionModel (`localStorage.locale`, e.g. `nl-BE`). */
export function getPreferredLocaleFromStorage(): string {
  if (typeof window === "undefined") {
    return DEFAULT_HOMEPAGE_LOCALE;
  }

  return normalizeLocale(localStorage.getItem("locale")) ?? DEFAULT_HOMEPAGE_LOCALE;
}

/** Replace or prepend the locale segment on a path using the stored locale. */
export function applyLocalePrefixToPath(path: string, locale?: string): string {
  const normalizedLocale = normalizeLocale(locale) ?? getPreferredLocaleFromStorage();
  if (!path || path === "#") return path;

  const queryIndex = path.indexOf("?");
  const pathOnly = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const query = queryIndex >= 0 ? path.slice(queryIndex) : "";

  const stripped = stripLocalePrefixFromPath(pathOnly);
  if (!stripped || stripped === "/") {
    return `/${normalizedLocale}${query}`;
  }

  const suffix = stripped.startsWith("/") ? stripped : `/${stripped}`;
  return `/${normalizedLocale}${suffix}${query}`;
}

export function normalizeComparablePath(path: string): string {
  const [pathname = "/", search = ""] = path.split("?");
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const normalizedSearch = search ? `?${search}` : "";
  return `${normalizedPath.toLowerCase()}${normalizedSearch}`;
}

const isValidHistoryEntry = (entry: string | undefined): entry is string => {
  if (!entry) return false;
  const trimmed = entry.trim();
  return trimmed.length > 0 && trimmed !== "/??" && !trimmed.includes("/??");
};

function findHistoryBackTarget(locale: string, currentPath: string): string | null {
  const currentNormalized = normalizeComparablePath(currentPath);
  const history = useRouteStore.getState().navigationHistory;

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (!isValidHistoryEntry(entry)) continue;

    const localized = applyLocalePrefixToPath(entry, locale);
    if (normalizeComparablePath(localized) === currentNormalized) continue;

    return localized;
  }

  return null;
}

/** Remove one history entry that resolves to the path we just navigated to. */
function consumeNavigationHistoryEntry(consumedPath: string, locale: string): void {
  const consumedNormalized = normalizeComparablePath(consumedPath);

  useRouteStore.setState((state) => {
    let removed = false;
    const nextHistory = state.navigationHistory.filter((entry) => {
      if (!isValidHistoryEntry(entry)) return true;

      const entryNormalized = normalizeComparablePath(applyLocalePrefixToPath(entry, locale));
      if (!removed && entryNormalized === consumedNormalized) {
        removed = true;
        return false;
      }

      return true;
    });

    return {
      navigationHistory: nextHistory.length > 0 ? nextHistory : ["/??"],
    };
  });
}

type NavigateBackOptions = {
  locale?: string;
  currentPath: string;
};

/**
 * Walk navigation history for the first route different from the current page,
 * consume it so repeated back clicks keep moving backward, then navigate.
 */
export function navigateBackViaHistory(
  push: (url: string) => void,
  back: () => void,
  options: NavigateBackOptions,
): void {
  const locale = normalizeLocale(options.locale) ?? getPreferredLocaleFromStorage();
  const currentNormalized = normalizeComparablePath(options.currentPath);

  const target = findHistoryBackTarget(locale, options.currentPath);
  if (target) {
    consumeNavigationHistoryEntry(target, locale);
    push(target);
    return;
  }

  const home = `/${locale}`;
  if (normalizeComparablePath(home) !== currentNormalized) {
    push(home);
    return;
  }

  back();
}
