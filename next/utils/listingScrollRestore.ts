const SCROLL_STORAGE_KEY = "listing_scroll_restore";
const PRESERVE_CACHE_KEY = "listing_preserve_parts_cache";
const TTL_MS = 30 * 60 * 1000;

type ListingScrollPayload = {
  urlKey: string;
  y: number;
  itemCount: number;
  savedAt: number;
};

/** Survives React Strict Mode remounts after sessionStorage has been consumed. */
let inflightScroll: { urlKey: string; y: number; itemCount: number } | null = null;
let inflightPreserveCache = false;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function getListingScrollKey(pathname: string | null | undefined, search: string): string {
  const path = pathname ?? "";
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query ? `${path}?${query}` : path;
}

export function markPreservePartsCache(): void {
  inflightPreserveCache = true;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(PRESERVE_CACHE_KEY, "1");
  } catch {
    // ignore quota / private-mode failures
  }
}

/** Read-once: returns true only for a PDP round-trip from the listing. */
export function consumePreservePartsCache(): boolean {
  let flagged = inflightPreserveCache;
  inflightPreserveCache = false;
  if (canUseSessionStorage()) {
    try {
      flagged = flagged || sessionStorage.getItem(PRESERVE_CACHE_KEY) === "1";
      sessionStorage.removeItem(PRESERVE_CACHE_KEY);
    } catch {
      // keep in-memory flag
    }
  }
  return flagged;
}

export function saveListingScroll(payload: { urlKey: string; y: number; itemCount: number }): void {
  if (!payload.urlKey) return;
  const stored: ListingScrollPayload = {
    urlKey: payload.urlKey,
    y: Math.max(0, payload.y),
    itemCount: Math.max(0, payload.itemCount),
    savedAt: Date.now(),
  };
  inflightScroll = { urlKey: stored.urlKey, y: stored.y, itemCount: stored.itemCount };
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore quota / private-mode failures
  }
}

function parsePayload(raw: string | null): ListingScrollPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ListingScrollPayload>;
    if (
      typeof parsed?.urlKey !== "string" ||
      typeof parsed?.y !== "number" ||
      typeof parsed?.itemCount !== "number" ||
      typeof parsed?.savedAt !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed as ListingScrollPayload;
  } catch {
    return null;
  }
}

/** Read-once restore payload for the current listing URL. */
export function consumeListingScroll(urlKey: string): { y: number; itemCount: number } | null {
  if (!urlKey) return null;

  const fromMemory =
    inflightScroll && inflightScroll.urlKey === urlKey
      ? { y: inflightScroll.y, itemCount: inflightScroll.itemCount }
      : null;

  let fromSession: { y: number; itemCount: number } | null = null;
  if (canUseSessionStorage()) {
    try {
      const payload = parsePayload(sessionStorage.getItem(SCROLL_STORAGE_KEY));
      if (payload && payload.urlKey === urlKey) {
        fromSession = { y: payload.y, itemCount: payload.itemCount };
      }
    } catch {
      fromSession = null;
    }
  }

  const result = fromMemory ?? fromSession;
  if (!result) return null;

  inflightScroll = { urlKey, y: result.y, itemCount: result.itemCount };
  return result;
}

export function clearListingScroll(): void {
  inflightScroll = null;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
