import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { headers as nextHeaders } from "next/headers";
import { X_API_KEY } from "./app";
import { headersToRecord } from "@/lib/axiom/extract-api-header-fields";
import { logApiToAxiom } from "@/lib/axiom/log-api-hit";
import { appendApiIpHeader, resolveApiIp } from "@/lib/clientIp";
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

const getLocaleFromSSR = () => {
  try {
    const h = nextHeaders();
    const locale = h.get("x-api-locale");
    return locale;
    // const acceptLang = h.get("accept-language");
    // if (!acceptLang) return null;
    // const [langCode] = acceptLang.split(",");
    // return langCode.trim(); // e.g. "en-US"
  } catch {
    return null;
  }
};

const parseLocale = (locale: string | null) => {
  const defaultLang = "en";
  const defaultCountry = "BE";

  if (!locale) return { lang: defaultLang, country: defaultCountry };

  const parts = locale.split("-");
  return {
    lang: parts[0] || defaultLang,
    country: parts[1] || defaultCountry,
  };
};

export const createApiClient = (context?: {
  isServer?: boolean;
  getToken?: () => string | null;
}): AxiosInstance => {
  const isServer = context?.isServer ?? typeof window === "undefined";

  let locale = "en-EU";

  if (isServer) {
    const ssrLocale = getLocaleFromSSR();
    if (ssrLocale) locale = ssrLocale;
  } else {
    locale = localStorage.getItem("locale") || "en-EU";
  }

  const { lang, country } = parseLocale(locale);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": X_API_KEY || "",
    "X-API-Lang": lang,
  };

  if (country !== "EU") {
    headers["X-API-Country"] = country;
  }

  appendApiIpHeader(headers);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api-dev.ottogusto.com/api",
    headers,
    timeout: 30000,
  });

  api.interceptors.request.use(
    (config) => {
      let token: string | null = null;

      if (context?.getToken) {
        token = context.getToken();
      } else if (!isServer) {
        token = JSON.parse(localStorage["auth-store"] ?? "{}").state?.accessToken || null;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const ip = resolveApiIp();
      if (ip) {
        config.headers["x-api-ip"] = ip;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Add request interceptor to track start time
  api.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: Date.now() };
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      const { config, status } = response;
      const endTime = Date.now();
      const startTime = (config as any)?.metadata?.startTime || endTime;
      const duration = endTime - startTime;

      // Get session ID for tracking
      const sessionId = sessionManager.getSessionId();
      sessionManager.updateActivity();

      // Send success telemetry without awaiting to avoid blocking
      sendTelemetry({
        sessionId,
        event: "Server: api_success",
        method: config.method?.toUpperCase() || "GET",
        url: config.url || "",
        status: response.status,
        duration,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        requestPayload: JSON.stringify((config as any)?.data || {}),
        responsePayload: JSON.stringify(response.data || {}),
      }).catch(() => {});

      logApiToAxiom({
        sessionId,
        event: "api_success",
        method: config.method?.toUpperCase() || "GET",
        url: config.url || "",
        status: response.status,
        duration,
        timestamp: new Date().toISOString(),
        requestHeaders: headersToRecord(config.headers),
        ...((config as any)?.data ? { requestPayload: JSON.stringify((config as any).data) } : {}),
        responsePayload: JSON.stringify(response.data || {}),
      });

      return response;
    },
    (error: AxiosError) => {
      const config = error.config || { url: "", method: "GET" };
      const endTime = Date.now();
      const startTime = (config as any)?.metadata?.startTime || endTime;
      const duration = endTime - startTime;

      // Get session ID for tracking
      const sessionId = sessionManager.getSessionId();
      sessionManager.updateActivity();

      // Send error telemetry without awaiting to avoid blocking
      sendTelemetry({
        sessionId,
        event: "Server: api_error",
        method: (config.method || "GET").toUpperCase(),
        url: config.url || "",
        status: error.response?.status ?? 0,
        duration,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        error: error.message,
        stack: error.stack ?? "",
        requestPayload: (config as any)?.data
          ? (JSON.stringify((config as any).data) as any)
          : undefined,
        responsePayload: error.response?.data
          ? (JSON.stringify(error.response.data) as any)
          : undefined,
      }).catch(() => {});

      logApiToAxiom({
        sessionId,
        event: "api_error",
        method: (config.method || "GET").toUpperCase(),
        url: config.url || "",
        status: error.response?.status ?? 0,
        duration,
        timestamp: new Date().toISOString(),
        requestHeaders: headersToRecord(error.config?.headers),
        ...((config as any)?.data ? { requestPayload: JSON.stringify((config as any).data) } : {}),
        ...(error.response?.data ? { responsePayload: JSON.stringify(error.response.data) } : {}),
      });

      if (error.response?.status === 401 && typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        import("@/stores/useAuthStore").then(({ useAuthStore }) => {
          useAuthStore.getState().logoutUser();
          const landingUrl = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL;
          window.location.href = landingUrl || window.location.origin;
        });
      }
      return Promise.reject(error);
    },
  );

  return api;
};
