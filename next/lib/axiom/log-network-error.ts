import { extractAxiomApiHeaderFields } from "./extract-api-header-fields";

function buildFullApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${apiBase}${path}`;
}

export interface NetworkErrorLogData {
  method: string;
  url: string;
  errorMessage: string;
  durationMs?: number;
  timestamp?: string;
  requestHeaders?: Record<string, string | undefined>;
}

export function logNetworkErrorToAxiom(data: NetworkErrorLogData): void {
  if (process.env.NEXT_PUBLIC_AXIOM_ENABLED !== "true") return;

  const source = typeof window === "undefined" ? "server" : "client";
  const fields: Record<string, unknown> = {
    type: "network_error",
    apiUrl: buildFullApiUrl(data.url),
    method: data.method.toUpperCase(),
    errorMessage: data.errorMessage,
    durationMs: data.durationMs,
    timestamp: data.timestamp ?? new Date().toISOString(),
    source,
    environment: process.env.NODE_ENV || "development",
  };

  const headerFields = extractAxiomApiHeaderFields(data.requestHeaders);
  if (headerFields.apiLang) fields.apiLang = headerFields.apiLang;
  if (headerFields.apiCountry) fields.apiCountry = headerFields.apiCountry;
  if (headerFields.clientIp) fields.clientIp = headerFields.clientIp;
  if (headerFields.hasAuth) fields.hasAuth = headerFields.hasAuth;

  if (typeof window === "undefined") {
    void import("./log-network-error-server").then(({ sendNetworkErrorToAxiomServer }) =>
      sendNetworkErrorToAxiomServer(fields).catch(() => {}),
    );
  } else {
    void import("./log-network-error-client").then(({ sendNetworkErrorToAxiomClient }) =>
      sendNetworkErrorToAxiomClient(fields),
    );
  }
}
