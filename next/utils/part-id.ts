/**
 * Guards for GET /Parts/{id} — reject SEO slugs, null literals, and other non-ids
 * before they hit the API (middleware, PDP page, client navigations).
 */

const INVALID_LITERALS = new Set(["null", "undefined", "nan"]);

/** Normalize to a trimmed string or null when not usable as a part id. */
export function normalizePartId(id: string | number | null | undefined): string | null {
  if (id == null) return null;
  const value = String(id).trim();
  if (!value) return null;
  if (INVALID_LITERALS.has(value.toLowerCase())) return null;
  return value;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * True when the value is safe to pass to GET /Parts/{id}.
 * Rejects category/SEO slugs (e.g. spark-plug-glow-plug) and literal "null".
 */
export function isValidPartIdForApi(id: string | number | null | undefined): boolean {
  const normalized = normalizePartId(id);
  if (!normalized) return false;

  if (UUID_RE.test(normalized)) return true;

  // Numeric internal ids
  if (/^\d+$/.test(normalized)) return true;

  // Ids that include digits are not plain word slugs
  if (/\d/.test(normalized)) return true;

  // Hyphenated lowercase-only strings are category/SEO slugs, not part ids
  if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(normalized)) return false;

  // Compact alphanumeric codes without hyphen chains (no multi-word slug shape)
  if (!normalized.includes("-") && /^[a-zA-Z0-9_.]+$/.test(normalized)) return true;

  return false;
}

function partGuardLogPayload(
  rawId: string | number | null | undefined,
  meta?: Record<string, string | undefined>,
) {
  return {
    rawId: rawId == null ? rawId : String(rawId),
    normalized: normalizePartId(rawId),
    ...meta,
  };
}

/** Dev-only: log when a GET /Parts (or related) call is skipped due to invalid id. */
export function logSkippedPartApiCall(
  context: string,
  rawId: string | number | null | undefined,
  meta?: Record<string, string | undefined>,
): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn("[parts-guard] skipped API call", {
    context,
    ...partGuardLogPayload(rawId, meta),
  });
}

/** Dev-only: log when a part-related API call is about to execute (id passed validation). */
export function logPartApiCall(
  context: string,
  rawId: string | number | null | undefined,
  meta?: Record<string, string | undefined>,
): void {
  if (process.env.NODE_ENV !== "development") return;
  console.log("[parts-guard] executing API call", {
    context,
    ...partGuardLogPayload(rawId, meta),
  });
}
