export type AxiomApiHeaderFields = {
  apiLang?: string;
  apiCountry?: string;
  clientIp?: string;
  hasAuth?: boolean;
};

function getHeaderValue(
  headers: Record<string, string | undefined>,
  name: string,
): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target && value) return value;
  }
  return undefined;
}

/** Extract safe, alert-friendly fields from outbound API request headers. */
export function extractAxiomApiHeaderFields(
  headers?: Record<string, string | undefined>,
): AxiomApiHeaderFields {
  if (!headers) return {};

  const fields: AxiomApiHeaderFields = {};

  const apiLang = getHeaderValue(headers, "X-API-Lang");
  if (apiLang) fields.apiLang = apiLang;

  const apiCountry = getHeaderValue(headers, "X-API-Country");
  if (apiCountry) fields.apiCountry = apiCountry;

  const clientIp = getHeaderValue(headers, "x-api-ip");
  if (clientIp) fields.clientIp = clientIp;

  if (getHeaderValue(headers, "Authorization")) {
    fields.hasAuth = true;
  }

  return fields;
}

/** Normalize Axios / fetch header objects to a plain record. */
export function headersToRecord(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== "object") return {};

  const record = headers as Record<string, unknown>;

  if (typeof record.forEach === "function") {
    const out: Record<string, string> = {};
    (record as { forEach: (fn: (value: string, key: string) => void) => void }).forEach(
      (value, key) => {
        if (value != null) out[key] = String(value);
      },
    );
    return out;
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value != null) out[key] = String(value);
  }
  return out;
}
