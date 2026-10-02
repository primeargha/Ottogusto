"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { DEFAULT_LABELS } from "@/data/branding/labels";
import { getLabelUtility, trimObjectKeys } from "@/helpers/UtilityHelper";
import { canShowTranslationKeys, stripShowCodeFromLabels } from "@/utils/translationDisplayMode";
import { useAuthStore } from "@/stores/useAuthStore";
import { useIsRestoring, useQuery, useQueryClient } from "@tanstack/react-query";
import { translationsQueryOptions } from "@/hooks/translations";
import { queryKeys } from "@/lib/query-keys";
import { usePathname } from "next/navigation";
import { detectPage } from "@/utils/detectPage";
import { stripLandingHeroTranslations } from "@/utils/stripLandingHeroTranslations";
import {
  clearPostLogoutRefreshTranslationsFlag,
  clearStalePostLogoutFlagsForPathname,
  getLangCodeFromLocale,
  getLangCodeFromPathname,
  getLocaleFromPathname,
  getPostLogoutRefreshTranslationsLocale,
  isPostLogoutRedirectPending,
} from "@/utils/localeCookie";

const getInitialClientRefetchMarkerKey = (langCode: string) =>
  `translations-initial-client-refetch-done:${langCode}`;

function hasPostLogoutRefreshFlag(): boolean {
  return !!getPostLogoutRefreshTranslationsLocale();
}

type BrandingContextType = {
  getLabel: (keyName: string, replaceKeys?: { [key: string]: string | number }) => any;
  brandName: string;
  logoUrl: string;
  WhiteLabels: any;
  setBranding: (brandName: string, logoUrl: string) => void;
  getLocale: () => string;
  changeLocale: (localeString: string) => void;
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
  initialTranslations?: any;
  initialLang?: string;
}

/**
 * Branding/Labels Provider.
 * Uses initialTranslations when provided (server); otherwise uses React Query (persisted) so refresh does not call the API.
 */
export const BrandingProvider = ({
  children,
  initialTranslations,
  initialLang,
}: BrandingProviderProps) => {
  const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
  const [brandName, setBrandName] = useState<string>(siteName);
  const [logoUrl, setLogoUrl] = useState<string>("/default-logo.png");
  const [Locale, setLocale] = useState(initialLang || "en");
  const [userChangedLocale, setUserChangedLocale] = useState(false);
  const [hasLocaleMismatch, setHasLocaleMismatch] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [didInitialBackgroundRefetch, setDidInitialBackgroundRefetch] = useState(false);
  // Start true so SSR and the first client paint match; post-logout refresh runs after hydrate.
  const [postLogoutRefreshDone, setPostLogoutRefreshDone] = useState(true);
  const postLogoutTranslationRefreshStarted = useRef(false);
  const translationPathSyncRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const authUser = useAuthStore((s) => s.authUser);
  const { user: auth0User } = useAuth0();

  const pathname = usePathname();
  // sessionStorage is client-only — do not read until after hydration to avoid text mismatches.
  const redirectPending = isHydrated && isPostLogoutRedirectPending(pathname);
  const postLogoutRefreshLocale = isHydrated ? getPostLogoutRefreshTranslationsLocale() : null;
  const postLogoutTargetLang = isHydrated
    ? getLangCodeFromLocale(postLogoutRefreshLocale) || ""
    : "";

  const langCode = Locale?.split("-")[0] || "en";
  const effectivePostLogoutRefreshDone = !isHydrated || postLogoutRefreshDone;
  const queryLangCode =
    !effectivePostLogoutRefreshDone && postLogoutTargetLang ? postLogoutTargetLang : langCode;

  const isProductDetailsPage = detectPage(pathname || "") === "product-details";
  const showTranslationKeys = useMemo(
    () => canShowTranslationKeys(queryLangCode, authUser, auth0User?.email),
    [queryLangCode, authUser, auth0User?.email],
  );

  const useClientQuery =
    isHydrated &&
    !redirectPending &&
    postLogoutRefreshDone &&
    (!initialTranslations || userChangedLocale || hasLocaleMismatch);

  const { data: translationsData, refetch: refetchTranslations } = useQuery({
    ...translationsQueryOptions(queryLangCode),
    enabled: useClientQuery && !!queryLangCode,
  });
  const initialPayload = initialTranslations?.data ?? initialTranslations;

  const shouldUseSsrPayload =
    effectivePostLogoutRefreshDone && !!initialPayload && !userChangedLocale && !hasLocaleMismatch;

  const WhiteLabels = (() => {
    let labels: Record<string, string>;
    if (shouldUseSsrPayload) {
      labels = trimObjectKeys(initialPayload) as Record<string, string>;
    } else {
      const payload = translationsData?.data ?? translationsData;
      if (payload && typeof payload === "object") {
        labels = trimObjectKeys(payload) as Record<string, string>;
      } else {
        labels = DEFAULT_LABELS.default as Record<string, string>;
      }
    }
    if (isProductDetailsPage) {
      labels = stripLandingHeroTranslations(labels) as Record<string, string>;
    }
    return stripShowCodeFromLabels(labels);
  })();

  // After UI load + correct locale URL: invalidate translation cache and refetch persisted locale.
  useEffect(() => {
    if (postLogoutRefreshDone) return;
    if (!isHydrated) return;
    if (redirectPending) return;
    if (isRestoring) return;
    if (postLogoutTranslationRefreshStarted.current) return;

    const refreshLocale = getPostLogoutRefreshTranslationsLocale();
    if (!refreshLocale) {
      setPostLogoutRefreshDone(true);
      return;
    }
    if (getLocaleFromPathname(pathname) !== refreshLocale) return;

    const lang = getLangCodeFromLocale(refreshLocale);
    if (!lang) {
      clearPostLogoutRefreshTranslationsFlag();
      setPostLogoutRefreshDone(true);
      return;
    }

    postLogoutTranslationRefreshStarted.current = true;

    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        void (async () => {
          setLocale(lang);
          setUserChangedLocale(true);
          setHasLocaleMismatch(true);

          await queryClient.invalidateQueries({ queryKey: queryKeys.translations(lang) });
          queryClient.removeQueries({ queryKey: queryKeys.translations(lang) });

          try {
            await queryClient.fetchQuery(translationsQueryOptions(lang));
          } finally {
            if (!cancelled) {
              clearPostLogoutRefreshTranslationsFlag();
              setPostLogoutRefreshDone(true);
            }
          }
        })();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [postLogoutRefreshDone, isHydrated, redirectPending, pathname, isRestoring, queryClient]);

  useEffect(() => {
    if (!isHydrated) return;

    const flagsCleared = clearStalePostLogoutFlagsForPathname(pathname);
    if (flagsCleared && !postLogoutRefreshDone) {
      setPostLogoutRefreshDone(true);
    }
  }, [pathname, isHydrated, postLogoutRefreshDone]);

  // Keep translation language aligned with the URL locale segment (e.g. /en-BE → "en").
  // Required after cache clear, soft navigation, or when SSR labels are for a different lang.
  useEffect(() => {
    if (!isHydrated) return;
    if (isRestoring) return;
    if (redirectPending) return;
    if (!postLogoutRefreshDone) return;

    const pathLang = getLangCodeFromPathname(pathname);
    if (!pathLang) return;

    const currentLang = (Locale || "").split("-")[0]?.toLowerCase();
    const initialLangCode = (initialLang || "").split("-")[0]?.toLowerCase();
    const pathDiffersFromActive = pathLang !== currentLang;
    const pathDiffersFromSsr = !!initialLangCode && pathLang !== initialLangCode;

    if (!pathDiffersFromActive && !pathDiffersFromSsr) {
      translationPathSyncRef.current = pathLang;
      return;
    }

    if (translationPathSyncRef.current === pathLang) return;
    translationPathSyncRef.current = pathLang;

    if (pathDiffersFromActive) {
      setLocale(pathLang);
    }
    setUserChangedLocale(true);
    setHasLocaleMismatch(true);

    void (async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.translations(pathLang) });
      try {
        await queryClient.fetchQuery(translationsQueryOptions(pathLang));
      } catch {
        /* useQuery will retry when enabled */
      }
    })();
  }, [
    pathname,
    isHydrated,
    isRestoring,
    redirectPending,
    postLogoutRefreshDone,
    Locale,
    initialLang,
    queryClient,
  ]);

  useEffect(() => {
    if (!postLogoutRefreshDone) return;
    if (userChangedLocale || hasLocaleMismatch) return;
    if (initialTranslations && initialLang) {
      setLocale(initialLang);
    }
  }, [
    initialTranslations,
    initialLang,
    postLogoutRefreshDone,
    userChangedLocale,
    hasLocaleMismatch,
  ]);

  useEffect(() => {
    if (!postLogoutRefreshDone) return;
    if (!initialPayload || !langCode) return;
    if (hasLocaleMismatch) return;

    const queryKey = queryKeys.translations(langCode);
    const existing = queryClient.getQueryData(queryKey);
    if (!existing) {
      queryClient.setQueryData(queryKey, { data: initialPayload });
    }
  }, [initialPayload, langCode, queryClient, postLogoutRefreshDone, hasLocaleMismatch]);

  useEffect(() => {
    setIsHydrated(true);
    if (hasPostLogoutRefreshFlag()) {
      setPostLogoutRefreshDone(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isRestoring) return;
    if (redirectPending) return;
    if (!postLogoutRefreshDone) return;
    if (didInitialBackgroundRefetch) return;
    if (!initialPayload) return;
    if (userChangedLocale || hasLocaleMismatch) return;
    if (typeof window === "undefined") return;

    const markerKey = getInitialClientRefetchMarkerKey(queryLangCode);
    if (sessionStorage.getItem(markerKey) === "1") {
      setDidInitialBackgroundRefetch(true);
      return;
    }
    sessionStorage.setItem(markerKey, "1");

    setDidInitialBackgroundRefetch(true);
    void refetchTranslations();
  }, [
    isHydrated,
    isRestoring,
    redirectPending,
    postLogoutRefreshDone,
    didInitialBackgroundRefetch,
    initialPayload,
    userChangedLocale,
    hasLocaleMismatch,
    queryLangCode,
    queryClient,
    refetchTranslations,
  ]);

  const getLocale = (): string => Locale;

  const changeLocale = (localeString: string): void => {
    if (Locale === localeString) return;
    setUserChangedLocale(true);
    setLocale(localeString);
  };

  const setBranding = (name: string, logo: string) => {
    setBrandName(name);
    setLogoUrl(logo);
  };

  const getLabel = (keyName: string, replaceKeys?: { [key: string]: string | number }): any => {
    return getLabelUtility(WhiteLabels, keyName, replaceKeys, showTranslationKeys);
  };

  return (
    <BrandingContext.Provider
      value={{ getLabel, brandName, logoUrl, setBranding, WhiteLabels, getLocale, changeLocale }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
