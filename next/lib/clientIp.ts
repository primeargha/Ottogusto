export const CLIENT_IP_STORAGE_KEY = "x-api-ip";

const IPAPI_URL = "https://ipapi.co/json/";

let memoryCachedIp: string | null = null;
let ipApiFetchPromise: Promise<IpApiPayload | null> | null = null;

type IpApiPayload = {
  ip?: string;
  /** ISO 3166-1 alpha-2, e.g. "NL", "BE" */
  country_code?: string;
  languages?: string;
};

/** Extract client IP from proxy / edge request headers (middleware-safe). */
export function getRequestIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const existing = headers.get("x-api-ip")?.trim();
  if (existing) return existing;

  return null;
}

export function getStoredClientIp(): string | null {
  if (memoryCachedIp) return memoryCachedIp;
  if (typeof window === "undefined") return null;

  try {
    memoryCachedIp = localStorage.getItem(CLIENT_IP_STORAGE_KEY);
    return memoryCachedIp;
  } catch {
    return null;
  }
}

export function setStoredClientIp(ip: string): void {
  const trimmed = ip.trim();
  if (!trimmed) return;

  memoryCachedIp = trimmed;
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CLIENT_IP_STORAGE_KEY, trimmed);
  } catch {
    // ignore quota / privacy mode
  }
}

async function fetchIpApiPayload(): Promise<IpApiPayload | null> {
  if (!ipApiFetchPromise) {
    ipApiFetchPromise = (async () => {
      try {
        const response = await fetch(IPAPI_URL);
        if (!response.ok) return null;
        const data = (await response.json()) as IpApiPayload;
        if (data?.ip) setStoredClientIp(data.ip);
        return data;
      } catch {
        return null;
      }
    })();
  }

  return ipApiFetchPromise;
}

/** Client-only: resolve and persist public IP (reuses in-flight fetch). */
export async function ensureClientIp(): Promise<string | null> {
  const stored = getStoredClientIp();
  if (stored) return stored;

  const data = await fetchIpApiPayload();
  return data?.ip?.trim() ?? null;
}

/** Client-only: preferred locale hint from ipapi (first language tag). */
export async function fetchIpApiPreferredLanguage(): Promise<string | null> {
  const data = await fetchIpApiPayload();
  const raw = data?.languages?.split(",")[0]?.trim();
  return raw || null;
}

/** Client-only: ISO country code from ipapi (reuses in-flight fetch). */
export async function fetchIpApiCountryCode(): Promise<string | null> {
  const data = await fetchIpApiPayload();
  const code = data?.country_code?.trim();
  return code || null;
}

/** Server components / SSR API calls — IP forwarded by middleware. */
export function getServerClientIp(): string | null {
  try {
    const { headers } = require("next/headers") as typeof import("next/headers");
    const h = headers();
    return h.get("x-api-ip")?.trim() || getRequestIp(h) || null;
  } catch {
    return null;
  }
}

/** Resolve IP for the current runtime (browser vs server). */
export function resolveApiIp(): string | null {
  return typeof window === "undefined" ? getServerClientIp() : getStoredClientIp();
}

/** Mutates headers map when IP is known. */
export function appendApiIpHeader(headers: Record<string, string>): void {
  const ip = resolveApiIp();
  if (ip) headers["x-api-ip"] = ip;
}

/** Build headers for middleware edge fetches to the backend API. */
export function withRequestApiIpHeader(
  base: Record<string, string>,
  requestHeaders: Headers,
): Record<string, string> {
  const ip = getRequestIp(requestHeaders);
  if (!ip) return base;
  return { ...base, "x-api-ip": ip };
}
