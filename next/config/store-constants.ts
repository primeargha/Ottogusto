// Store identifiers - centralized source of truth
// All store name references should use these constants instead of hardcoded strings
export const STORE_IDS = {
  OTTOGUSTO: "ottogusto",
  QVERDE: "qverde",
} as const;

// Store display names (for UI, GTM, etc.)
export const STORE_DISPLAY_NAMES = {
  [STORE_IDS.OTTOGUSTO]: "Ottogusto",
  [STORE_IDS.QVERDE]: "Qverde",
} as const;

// Type derived from the constants
export type StoreId = (typeof STORE_IDS)[keyof typeof STORE_IDS];

// Current store from ENV (runtime)
export const CURRENT_STORE: StoreId =
  (process.env.NEXT_PUBLIC_STORE as StoreId) ||
  (process.env.STORE as StoreId) ||
  STORE_IDS.OTTOGUSTO;

// Default store for fallbacks
export const DEFAULT_STORE: StoreId = STORE_IDS.OTTOGUSTO;

// Helper to check if a given store ID matches the current store
export function isStore(storeId: StoreId): boolean {
  return CURRENT_STORE === storeId;
}

// Convenience helpers for common store checks
export function isOttogusto(): boolean {
  return CURRENT_STORE === STORE_IDS.OTTOGUSTO;
}

export function isQverde(): boolean {
  return CURRENT_STORE === STORE_IDS.QVERDE;
}

// Helper to validate if a string is a valid store ID
export function isValidStoreId(value: string): value is StoreId {
  return Object.values(STORE_IDS).includes(value as StoreId);
}

// Get store ID from string with fallback to default
export function getStoreIdOrDefault(value: string | undefined | null): StoreId {
  if (value && isValidStoreId(value)) {
    return value;
  }
  return DEFAULT_STORE;
}

// Get store display name from store ID
export function getStoreDisplayName(storeId?: StoreId | string): string {
  if (storeId && isValidStoreId(storeId)) {
    return STORE_DISPLAY_NAMES[storeId];
  }
  return STORE_DISPLAY_NAMES[DEFAULT_STORE];
}

// Get current store display name
export function getCurrentStoreDisplayName(): string {
  return STORE_DISPLAY_NAMES[CURRENT_STORE];
}
