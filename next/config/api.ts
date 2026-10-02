import { useAuthStore } from "@/stores/useAuthStore";
import { X_API_KEY } from "./app";
import { logApiToAxiom } from "@/lib/axiom/log-api-hit";
import { appendApiIpHeader } from "@/lib/clientIp";
import { sendTelemetry } from "../instrumentation";
import { sessionManager } from "../lib/session-manager";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_LANG = "en";
const ONE_HOUR = 60 * 60;

const getCountryCode = () => {
  if (typeof window === "undefined") return "BE";
  try {
    const locale = localStorage.getItem("locale");
    if (locale) {
      const parts = locale.split("-");
      return parts.length > 1 ? parts[1] : "BE";
    }
  } catch {}
  return "BE";
};

const getServerLangCode = (defaultLang = DEFAULT_LANG) => {
  try {
    const { headers } = require("next/headers");
    const pathname = headers().get("x-current-path") || "";
    const lang = pathname.split("/")[1];
    if (lang?.length === 2) return lang;
  } catch {}
  return defaultLang;
};

const getClientLangCode = (defaultLang = DEFAULT_LANG) => {
  try {
    const locale = localStorage.getItem("locale");
    if (locale) return locale.split("-")[0];
  } catch {}
  return defaultLang;
};

const getLangCode = (defaultLang = DEFAULT_LANG) =>
  typeof window === "undefined" ? getServerLangCode(defaultLang) : getClientLangCode(defaultLang);

const buildHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": X_API_KEY || "--no-key--",
    "X-API-Lang": DEFAULT_LANG,
  };

  if (typeof window !== "undefined") {
    const country = getCountryCode();
    const lang = getLangCode();

    if (country && country !== "BE") headers["X-API-Country"] = country;
    if (lang) headers["X-API-Lang"] = lang;

    const token =
      useAuthStore.getState().accessToken ||
      JSON.parse(localStorage["auth-store"] ?? "{}").state?.accessToken ||
      null;

    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  appendApiIpHeader(headers);

  return headers;
};

const apiFetch = async <T>(
  url: string,
  options: {
    method?: string;
    params?: any;
    body?: any;
  } = {},
): Promise<T> => {
  const method = options.method || "GET";
  const headers = buildHeaders();
  const startTime = Date.now();

  let fullUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api-dev.ottogusto.com/api"}${url}`;

  if (options.params) {
    const query = new URLSearchParams(options.params).toString();
    fullUrl += `?${query}`;
  }

  const isGet = method === "GET";
  const isAuthed = Boolean(headers.Authorization);

  try {
    // const response = await fetch(fullUrl, {
    //   method,
    //   headers,
    //   body: options.body ? JSON.stringify(options.body) : undefined,
    //   ...(isGet && !isAuthed
    //     ? { next: { revalidate: ONE_HOUR } }
    //     : { cache: "no-store" }),
    // });

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: options.body ? (JSON.stringify(options.body) as any) : undefined,
      next: { revalidate: ONE_HOUR },
      // ...(isGet && !isAuthed
      //   ? { next: { revalidate: ONE_HOUR } }
      //   : { cache: "no-store" }),
    });

    const duration = Date.now() - startTime;
    // 204 No Content (e.g. DELETE) has no body - response.json() would throw
    const text = await response.text();
    let data: any = {};
    if (text && response.status !== 204) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
    }

    /**
     * 🔍 Detect cache vs network
     * (available on server; client will be undefined → treated as network)
     */
    const cacheHeader =
      typeof window === "undefined" ? response.headers.get("x-nextjs-cache") : null;

    const isCached = cacheHeader === "HIT" || cacheHeader === "STALE";

    // Get session ID for tracking
    const sessionId = sessionManager.getSessionId();
    sessionManager.updateActivity();

    sendTelemetry({
      sessionId,
      event: response.ok
        ? isCached
          ? "api_success_cached"
          : "api_success_network"
        : isCached
          ? "api_error_cached"
          : "api_error_network",
      method,
      url,
      status: response.status,
      duration,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      // cache: cacheHeader ?? "NONE",
      requestPayload: options.body ? (JSON.stringify(options.body) as any) : undefined,
      responsePayload: JSON.stringify(data),
    }).catch(() => {});

    logApiToAxiom({
      sessionId,
      event: response.ok ? "api_success" : "api_error",
      method,
      url,
      status: response.status,
      duration,
      timestamp: new Date().toISOString(),
      requestHeaders: headers,
      ...(options.body ? { requestPayload: JSON.stringify(options.body) } : {}),
      responsePayload: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        useAuthStore.getState().logoutUser();
        const landingUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL;
        window.location.href = landingUrl || window.location.origin;
      }

      throw new ApiError(response.status, data?.message || "API Error", data);
    }

    return { data } as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || "Network Error");
  }
};

export const apiClient = {
  get: <T>(url: string, params?: any) => apiFetch<T>(url, { method: "GET", params }),

  post: <T>(url: string, data: any) => apiFetch<T>(url, { method: "POST", body: data }),

  put: <T>(url: string, data: any) => apiFetch<T>(url, { method: "PUT", body: data }),

  delete: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};

export default apiClient;
