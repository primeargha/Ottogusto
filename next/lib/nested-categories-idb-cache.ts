import type { Category } from "@/type";
import { isNestedCategoryTreeUsable } from "@/lib/nested-categories-tree";

/** Same TTL as `NESTED_CATEGORIES_BROWSER_CACHE_MAX_AGE_MS` (avoid importing browser-cache → circular). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "og-nested-categories";
const DB_VERSION = 1;
const STORE = "trees";

type Row = { savedAt: number; data: Category[] };

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("indexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error("indexedDB open failed"));
      };
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
    });
  }
  return dbPromise;
}

/** Large locale trees (e.g. NL) exceed localStorage quota; IDB survives reload. */
export async function readNestedCategoriesIdbCache(localeKey: string): Promise<Category[] | null> {
  if (!localeKey || typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      let resolved: Category[] | null = null;
      const tx = db.transaction(STORE, "readonly");
      tx.onerror = () => resolve(null);
      tx.oncomplete = () => resolve(resolved);
      const r = tx.objectStore(STORE).get(localeKey);
      r.onerror = () => {
        resolved = null;
      };
      r.onsuccess = () => {
        const row = r.result as Row | undefined;
        if (!row?.savedAt || !Array.isArray(row.data) || row.data.length === 0) {
          resolved = null;
          return;
        }
        if (Date.now() - row.savedAt > CACHE_TTL_MS) {
          void deleteNestedCategoriesIdbKey(localeKey);
          resolved = null;
          return;
        }
        if (!isNestedCategoryTreeUsable(row.data)) {
          void deleteNestedCategoriesIdbKey(localeKey);
          resolved = null;
          return;
        }
        resolved = JSON.parse(JSON.stringify(row.data)) as Category[];
      };
    });
  } catch {
    return null;
  }
}

export async function writeNestedCategoriesIdbCache(
  data: Category[],
  localeKey: string,
): Promise<void> {
  if (!localeKey || typeof indexedDB === "undefined" || !isNestedCategoryTreeUsable(data)) return;
  try {
    const db = await openDb();
    const row: Row = { savedAt: Date.now(), data };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
      tx.objectStore(STORE).put(row, localeKey);
    });
  } catch {
    /* private mode / blocked idb */
  }
}

async function deleteNestedCategoriesIdbKey(localeKey: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
      const del = tx.objectStore(STORE).delete(localeKey);
      del.onerror = () => reject(del.error);
    });
  } catch {
    /* ignore */
  }
}

export async function clearNestedCategoriesIdbCache(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
      tx.objectStore(STORE).clear();
    });
  } catch {
    /* ignore */
  }
  dbPromise = null;
}
