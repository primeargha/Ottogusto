// Example usage:
import { apiClient, ApiError } from "@/config/api";
import { cache } from "react";
import { unstable_cache } from "next/cache";

import type { GetTranslationsResponse } from "@/type";
import type { AuthUserType } from "@/stores/useAuthStore";
import { TRANSLATION_KEYS_LANG } from "@/utils/translationDisplayMode";

// TODO: replace with types from api docs
interface AuthResponse {
  // code?: string;
  // state?: string;
  // email?: string;
  data?: AuthUserType;
}

// ✅ Valid language codes (ISO 639-1) + pseudo "key" locale
const VALID_LANG_CODES = ["en", "nl", "fr", "de", "es", "it", "pt", "pl", TRANSLATION_KEYS_LANG];
const loggedTranslationWarnings = new Set<string>();

const warnTranslationOnce = (key: string, message: string) => {
  if (loggedTranslationWarnings.has(key)) return;
  loggedTranslationWarnings.add(key);
  console.warn(message);
};

// ✅ Validate and normalize language code
const validateLangCode = (lang: string): string => {
  // Extract just the language part if it contains country (e.g., "en-BE" -> "en")
  const langOnly = lang?.split("-")[0]?.toLowerCase() || "en";

  if (langOnly === TRANSLATION_KEYS_LANG) {
    return TRANSLATION_KEYS_LANG;
  }

  // Validate it's a proper 2-letter language code
  if (!langOnly || langOnly.length !== 2 || !/^[a-z]{2}$/.test(langOnly)) {
    warnTranslationOnce(
      `invalid:${lang}`,
      `[Translations] Invalid language code "${lang}", defaulting to "en"`,
    );
    return "en";
  }

  // Check if it's a known language code
  if (!VALID_LANG_CODES.includes(langOnly)) {
    warnTranslationOnce(
      `unknown:${langOnly}`,
      `[Translations] Unknown language code "${langOnly}", defaulting to "en"`,
    );
    return "en";
  }

  return langOnly;
};

//  will call for react query - query
// ActivateUser (Not in use Auth0 is creating and activating profile directly in backend)
const postAuthDetails = async (data: unknown) => {
  try {
    const user = await apiClient.post<AuthResponse>(`/User`, data);
    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

const getProfile = async (data?: unknown) => {
  try {
    const profile = await apiClient.get<AuthUserType>(`/Profile`);
    return profile;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

// ✅ In-memory cache for translations (1 hour)
type TranslationsApiResponse = { data: GetTranslationsResponse };
const translationsCache = new Map<string, { data: TranslationsApiResponse; timestamp: number }>();
const translationsPendingPromises = new Map<string, Promise<TranslationsApiResponse>>();
const TRANSLATIONS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const fetchTranslationsApi = async (validLang: string): Promise<TranslationsApiResponse> => {
  if (validLang !== TRANSLATION_KEYS_LANG) {
    return apiClient.get<TranslationsApiResponse>(`/Translations/${validLang}`);
  }
  try {
    return await apiClient.get<TranslationsApiResponse>(`/Translations/${TRANSLATION_KEYS_LANG}`);
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn(
        `[Translations] GET /Translations/${TRANSLATION_KEYS_LANG} failed, falling back to en`,
      );
    }
    return apiClient.get<TranslationsApiResponse>("/Translations/en");
  }
};

const getTranslationsCached = cache(async (lang: string): Promise<TranslationsApiResponse> => {
  const validLang = validateLangCode(lang);
  try {
    return await fetchTranslationsApi(validLang);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
});

// ✅ Server-only: cache translations across requests so normal refresh does not call the API
const TRANSLATIONS_REVALIDATE_SECONDS = 60 * 60; // 1 hour
const getTranslationsServerCached = (validLang: string) =>
  unstable_cache(
    async (): Promise<TranslationsApiResponse> => {
      try {
        return await fetchTranslationsApi(validLang);
      } catch (error) {
        if (error instanceof ApiError) {
          console.error(`Error ${error.status}: ${error.message}`);
        }
        throw error;
      }
    },
    ["translations", validLang],
    { revalidate: TRANSLATIONS_REVALIDATE_SECONDS },
  )();

/** GET /api/Translations/{lang}. Path: lang (required). Returns { data: GetTranslationsResponse }. */
export const getTranslations = async (lang: string): Promise<{ data: GetTranslationsResponse }> => {
  const validLang = validateLangCode(lang);
  const now = Date.now();

  // Check in-memory cache first
  const cached = translationsCache.get(validLang);
  if (cached && now - cached.timestamp < TRANSLATIONS_CACHE_DURATION) {
    return cached.data;
  }

  // ✅ If a request for this language is already in progress, wait for it
  const pendingPromise = translationsPendingPromises.get(validLang);
  if (pendingPromise) {
    return pendingPromise;
  }

  // Server: use Next.js cache so translations survive across requests (no API call on normal refresh)
  if (typeof window === "undefined") {
    const result = await getTranslationsServerCached(validLang);
    translationsCache.set(validLang, { data: result, timestamp: now });
    return result;
  }

  // Client-side: call with request deduplication
  const promise = fetchTranslationsApi(validLang)
    .then((response) => {
      translationsCache.set(validLang, { data: response, timestamp: Date.now() });
      translationsPendingPromises.delete(validLang);
      return response;
    })
    .catch((error) => {
      translationsPendingPromises.delete(validLang);
      if (error instanceof ApiError) {
        console.error(`Error ${error.status}: ${error.message}`);
      }
      throw error;
    });

  translationsPendingPromises.set(validLang, promise);
  return promise;
};
// const getTranslations = async (lang: string) => {
//   const isProd = process.env.NODE_ENV === "production";
//   const baseRoute = isProd
//     ? `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}/`
//     : `${process.env.NEXT_PUBLIC_FRONTEND_DEV_URL}/`;

//   try {
//     const response = await fetch(`${baseRoute}api/translation/${lang}`, {
//       next: { revalidate: 3600 }, // ISR - revalidate every 1 hour
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch translations: ${response.statusText}`);
//     }

//     const translations = await response.json();
//     return {data: translations};
//   } catch (error) {
//     console.error("Error fetching translations:", error);
//     throw error;
//   }
// };

export { getProfile, postAuthDetails };
