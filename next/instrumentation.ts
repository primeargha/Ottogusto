import * as Sentry from "@sentry/nextjs";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { sessionManager } from "./lib/session-manager";

interface RequestMetadata {
  startTime: number;
}

interface AxiosConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: RequestMetadata;
}

interface IncomingRequest {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  url?: string;
}

declare global {
  var __NEXT_AXIOS_INSTANCE__: AxiosInstance | undefined;
}

// Global reference to avoid duplicate instrumentation

declare global {
  var __NEXT_AXIOS_INSTANCE__: AxiosInstance | undefined;
}
const TELEMETRY_ENDPOINT = "/api/telemetry";
const TELEMETRY_TIMEOUT = 60_000; // 5 seconds

export interface TelemetryData {
  sessionId?: string;
  event: string;
  method: string;
  url: string;
  status?: number;
  duration: number;
  timestamp: string;
  environment: string;
  error?: string;
  stack?: string;
  nodeVersion?: string;
  requestPayload?: string;
  responsePayload?: string;
}

export async function sendWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  backoff = 300,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return sendWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export async function sendTelemetry(data: TelemetryData) {
  // Skip telemetry if NEXT_PUBLIC_ENABLE_TELEMETRY=false
  if (process.env.NEXT_PUBLIC_ENABLE_TELEMETRY !== "true") {
    return;
  }

  // Skip telemetry for telemetry endpoints to avoid loops
  if (data.url && data.url.includes(TELEMETRY_ENDPOINT)) {
    return;
  }

  // Get session ID for tracking
  const sessionId = sessionManager.getSessionId();
  sessionManager.updateActivity();

  const telemetryData: TelemetryData = {
    ...data,
    sessionId,
    timestamp: data.timestamp || new Date().toISOString(),
    nodeVersion: data.nodeVersion || process.version,
    environment: data.environment || process.env.NODE_ENV || "development",
  };

  // Use HTTP API for both client and server side
  try {
    // Determine the correct URL based on environment
    const baseUrl =
      typeof window !== "undefined"
        ? "" // Browser: use relative URL
        : `http://localhost:${process.env.PORT || 3000}`; // Server: use full URL

    const url = `${baseUrl}${TELEMETRY_ENDPOINT}`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(telemetryData),
      keepalive: true, // Ensure request completes even if page is closed
    }).catch(() => {}); // Silently fail
  } catch (error) {
    // Log only first character of the error to avoid sensitive data leakage
    const errorChar = error instanceof Error ? error.message.charAt(0) : "Unknown error";
    console.warn(`⚠️ Telemetry failed: ${errorChar}...`);
  }
}

function getAxiosInstance(): AxiosInstance {
  // Return existing instance if already created
  if (global.__NEXT_AXIOS_INSTANCE__) {
    return global.__NEXT_AXIOS_INSTANCE__;
  }

  const instance = axios.create();

  // Store the instance in the global object
  global.__NEXT_AXIOS_INSTANCE__ = instance;

  // Request interceptor
  instance.interceptors.request.use((config) => {
    // Add start time to measure request duration
    (config as AxiosConfigWithMetadata).metadata = { startTime: Date.now() };
    return config;
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { config, status } = response;
      const endTime = Date.now();
      const startTime = (config as AxiosConfigWithMetadata).metadata?.startTime || endTime;
      const duration = endTime - startTime;

      // Send telemetry without awaiting to avoid blocking
      sendTelemetry({
        event: "Instrumentation: api_request",
        method: config.method?.toUpperCase() || "GET",
        url: config.url || "",
        duration,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      }).catch(() => {}); // Silently ignore errors

      return response;
    },
    (error: AxiosError) => {
      const config: AxiosConfigWithMetadata = (error.config || {}) as AxiosConfigWithMetadata;
      const endTime = Date.now();
      const startTime = (config as AxiosConfigWithMetadata).metadata?.startTime || endTime;
      const duration = endTime - startTime;

      // Send telemetry without awaiting to avoid blocking
      sendTelemetry({
        event: "Instrumentation: api_error",
        method: config.method?.toUpperCase() || "GET",
        url: config.url || "",
        status: error.response?.status ?? 0,
        duration,
        error: error.message,
        stack: error.stack ?? "",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      }).catch(() => {}); // Silently ignore errors

      return Promise.reject(error);
    },
  );

  // Store the instance in global to prevent duplicate instrumentation
  return instance;
}

// Export the instrumented axios instance
export const instrumentedAxios = getAxiosInstance();

export async function register() {
  try {
    // await import('./sentry.server.config');
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }

    // Initialize Axios instrumentation
    getAxiosInstance();

    // Send startup telemetry
    sendTelemetry({
      event: "startup",
      method: "INSTRUMENTATION",
      url: "instrumentation",
      duration: 0,
      timestamp: "",
      environment: "",
    }).catch(() => {}); // Silently ignore errors
  } catch (error) {
    console.error("❌ Failed to initialize instrumentation:", error);
    Sentry.captureException(error);
  }
}

export const onRequestError = (
  error: Error & { response?: { status?: number } },
  request: IncomingRequest,
) => {
  // Get session ID for tracking
  const sessionId = sessionManager.getSessionId();
  sessionManager.updateActivity();

  // Send error telemetry to local endpoint
  sendTelemetry({
    sessionId,
    event: "error",
    method: request?.method || "GET",
    url: request?.url || "",
    status: error?.response?.status ?? 0,
    duration: 0, // Not available in error case
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    error: error.message,
    stack: error.stack ?? "",
    nodeVersion: process.version,
  }).catch(() => {}); // Silently ignore errors

  // Still send to Sentry using the original function
  return Sentry.captureRequestError(error, request, {
    routerKind: "app" as const,
    routePath: request.url || "",
    routeType: "route" as const,
  });
};
