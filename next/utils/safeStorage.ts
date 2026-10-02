import { createJSONStorage } from "zustand/middleware";

/**
 * Quota- and availability-safe wrapper for browser Storage (localStorage / sessionStorage).
 *
 * Why:
 *  - Safari (especially private mode) and devices with full storage throw
 *    `QuotaExceededError` from `setItem`.
 *  - Some browsers may also throw on `getItem` access in restricted contexts.
 *  - These exceptions otherwise bubble up through Zustand's `persist` middleware
 *    and crash the React tree (caught by the layout error boundary).
 *
 * Behavior:
 *  - All read/write/remove calls are wrapped in try/catch.
 *  - On any failure (or if the underlying storage is unavailable), reads/writes
 *    transparently fall back to an in-memory map keyed by storage instance,
 *    keeping the app functional for the current session.
 *  - The on-disk format is unchanged (same JSON serialization via
 *    `createJSONStorage`), so persisted data shape and key names are identical.
 *
 * Usage:
 *   storage: createSafeJSONStorage(() => localStorage)
 *   storage: createSafeJSONStorage(() => sessionStorage)
 */

type MemoryBucket = Map<string, string>;

const memoryBuckets = new WeakMap<object, MemoryBucket>();
const fallbackKey = {} as object; // shared fallback when real storage is unavailable

let warnedQuota = false;
function warnQuotaOnce(error: unknown) {
  if (warnedQuota) return;
  warnedQuota = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[safeStorage] Browser storage write failed (quota or availability). Falling back to in-memory storage for this session.",
    error,
  );
}

function getBucket(storageObj: object | null): MemoryBucket {
  const key = storageObj ?? fallbackKey;
  let bucket = memoryBuckets.get(key);
  if (!bucket) {
    bucket = new Map();
    memoryBuckets.set(key, bucket);
  }
  return bucket;
}

function tryGetStorage(getStorage: () => Storage): Storage | null {
  try {
    return getStorage();
  } catch {
    return null;
  }
}

/**
 * Returns a `Storage`-shaped object whose mutating operations never throw.
 * Reads always try the real storage first; writes try the real storage and on
 * failure write to a per-storage in-memory bucket. Reads also consult the
 * in-memory bucket so values written during a degraded session survive.
 */
export function createSafeStorage(getStorage: () => Storage): Storage {
  return {
    get length() {
      const real = tryGetStorage(getStorage);
      try {
        return real ? real.length : getBucket(real).size;
      } catch {
        return getBucket(real).size;
      }
    },
    key(index: number) {
      const real = tryGetStorage(getStorage);
      try {
        if (real) return real.key(index);
      } catch {
        /* fall through */
      }
      const bucket = getBucket(real);
      const keys = Array.from(bucket.keys());
      return keys[index] ?? null;
    },
    getItem(name: string) {
      const real = tryGetStorage(getStorage);
      try {
        const value = real ? real.getItem(name) : null;
        if (value !== null) return value;
      } catch {
        /* fall through */
      }
      const bucket = getBucket(real);
      return bucket.has(name) ? (bucket.get(name) ?? null) : null;
    },
    setItem(name: string, value: string) {
      const real = tryGetStorage(getStorage);
      try {
        if (real) {
          real.setItem(name, value);
          return;
        }
      } catch (error) {
        warnQuotaOnce(error);
      }
      getBucket(real).set(name, value);
    },
    removeItem(name: string) {
      const real = tryGetStorage(getStorage);
      try {
        if (real) real.removeItem(name);
      } catch {
        /* ignore */
      }
      getBucket(real).delete(name);
    },
    clear() {
      const real = tryGetStorage(getStorage);
      try {
        if (real) real.clear();
      } catch {
        /* ignore */
      }
      getBucket(real).clear();
    },
  };
}

/**
 * Drop-in replacement for `createJSONStorage(() => localStorage|sessionStorage)`
 * that never throws on quota / unavailability errors.
 */
export function createSafeJSONStorage(getStorage: () => Storage) {
  return createJSONStorage(() => createSafeStorage(getStorage));
}
