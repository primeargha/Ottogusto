import { isAxiosError } from "axios";

const MAX_DETAIL_LEN = 200;
const MAX_GENERIC_LEN = 500;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/**
 * One-line, log-safe summary. Never includes axios config, request sockets, or headers.
 */
export function formatHttpClientError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    let detail = "";
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const d = data as Record<string, unknown>;
      const piece = d.detail ?? d.title ?? d.message;
      if (typeof piece === "string") detail = truncate(piece, MAX_DETAIL_LEN);
    } else if (typeof data === "string") {
      detail = truncate(data, MAX_DETAIL_LEN);
    }
    const parts = [
      error.message,
      status != null ? `status=${status}` : null,
      error.code ? `code=${error.code}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    return parts.join(" | ");
  }
  if (error instanceof Error) {
    return truncate(error.message, MAX_GENERIC_LEN);
  }
  return truncate(String(error), MAX_GENERIC_LEN);
}

/** Expected missing resource for part pages — safe to omit from console. */
export function isExpectedPartApiNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}
