import { extractAxiomApiHeaderFields } from "./extract-api-header-fields";

export interface ApiHitLogData {
  method: string;
  url: string;
  duration: number;
  timestamp?: string;
  status?: number;
  requestPayload?: string;
  responsePayload?: string;
  event?: string;
  sessionId?: string;
  requestHeaders?: Record<string, string | undefined>;
}

const MAX_PAYLOAD_LENGTH = 2000;

function truncatePayload(payload?: string): string | undefined {
  if (!payload) return undefined;
  if (payload.length <= MAX_PAYLOAD_LENGTH) return payload;
  return `${payload.slice(0, MAX_PAYLOAD_LENGTH)}...[truncated]`;
}

function shouldLogRequestPayload(method: string): boolean {
  return ["POST", "PUT", "PATCH"].includes(method.toUpperCase());
}

function buildFullApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${apiBase}${path}`;
}

export function logApiToAxiom(data: ApiHitLogData): void {
  if (process.env.NEXT_PUBLIC_AXIOM_ENABLED !== "true") return;

  const method = data.method.toUpperCase();
  const source = typeof window === "undefined" ? "server" : "client";

  const fields: Record<string, unknown> = {
    type: "backend_api_hit",
    apiUrl: buildFullApiUrl(data.url),
    method,
    durationMs: data.duration,
    timestamp: data.timestamp ?? new Date().toISOString(),
    source,
    status: data.status,
    event: data.event,
    sessionId: data.sessionId,
    environment: process.env.NODE_ENV || "development",
  };

  if (shouldLogRequestPayload(method) && data.requestPayload) {
    fields.requestPayload = truncatePayload(data.requestPayload);
  }

  if (data.responsePayload) {
    fields.responsePayload = truncatePayload(data.responsePayload);
  }

  const headerFields = extractAxiomApiHeaderFields(data.requestHeaders);
  if (headerFields.apiLang) fields.apiLang = headerFields.apiLang;
  if (headerFields.apiCountry) fields.apiCountry = headerFields.apiCountry;
  if (headerFields.clientIp) fields.clientIp = headerFields.clientIp;
  if (headerFields.hasAuth) fields.hasAuth = headerFields.hasAuth;

  if (typeof window === "undefined") {
    void import("./log-api-hit-server").then(({ sendApiHitToAxiomServer }) =>
      sendApiHitToAxiomServer(fields).catch(() => {}),
    );
  } else {
    void import("./log-api-hit-client").then(({ sendApiHitToAxiomClient }) =>
      sendApiHitToAxiomClient(fields),
    );
  }
}
