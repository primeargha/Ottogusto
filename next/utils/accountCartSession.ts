import { CART_SESSION_MS, isCartSessionExpired } from "@/utils/cartSession";

export const ACCOUNT_CART_SNAPSHOT_KEY = "account_cart_snapshot";

export interface AccountCartSnapshot {
  userId: string | null;
  email: string | null;
  orderId: string;
  cartSessionStartedAt: number | null;
  savedAt: number;
  /** @deprecated Legacy single key — still matched for older snapshots */
  userKey?: string;
}

export type NormalizedAuthProfile = {
  id: string | null;
  email: string | null;
};

/** Unwrap profile from auth store / API ({ id, email } or nested { data: { … } }). */
export function normalizeAuthProfile(authUser: unknown): NormalizedAuthProfile | null {
  if (!authUser || typeof authUser !== "object") return null;

  let user = authUser as Record<string, unknown>;
  if (user.data && typeof user.data === "object" && !user.id && !user.email) {
    user = user.data as Record<string, unknown>;
  }

  const id = user.id != null && user.id !== "" ? String(user.id) : null;
  const email =
    typeof user.email === "string" && user.email.trim() ? user.email.trim().toLowerCase() : null;

  if (!id && !email) return null;
  return { id, email };
}

export function saveAccountCartSnapshot(
  authUser: unknown,
  orderId: string,
  cartSessionStartedAt: number | null,
): void {
  if (typeof window === "undefined" || !orderId) return;

  const profile = normalizeAuthProfile(authUser);
  if (!profile) return;

  const payload: AccountCartSnapshot = {
    userId: profile.id,
    email: profile.email,
    orderId,
    cartSessionStartedAt,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(ACCOUNT_CART_SNAPSHOT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
}

export function getAccountCartSnapshot(): AccountCartSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ACCOUNT_CART_SNAPSHOT_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as AccountCartSnapshot;
    if (!data?.orderId) {
      clearAccountCartSnapshot();
      return null;
    }

    const hasIdentity = Boolean(data.userId || data.email || data.userKey);
    if (!hasIdentity) {
      clearAccountCartSnapshot();
      return null;
    }

    if (Date.now() - (data.savedAt ?? 0) > CART_SESSION_MS) {
      clearAccountCartSnapshot();
      return null;
    }

    return data;
  } catch {
    clearAccountCartSnapshot();
    return null;
  }
}

export function clearAccountCartSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCOUNT_CART_SNAPSHOT_KEY);
  } catch {
    /* ignore */
  }
}

/** True only when the logged-in user is the same account that logged out with a cart. */
export function snapshotMatchesUser(snapshot: AccountCartSnapshot, authUser: unknown): boolean {
  const profile = normalizeAuthProfile(authUser);
  if (!profile) return false;

  if (snapshot.userId && profile.id && snapshot.userId === profile.id) {
    return true;
  }

  if (snapshot.email && profile.email && snapshot.email === profile.email) {
    return true;
  }

  if (snapshot.userKey) {
    if (profile.id && snapshot.userKey === profile.id) return true;
    if (profile.email && snapshot.userKey === profile.email) return true;
  }

  return false;
}

export function getSnapshotCartSessionStartedAt(
  snapshot: AccountCartSnapshot | null,
  authUser: unknown,
): number | null {
  if (!snapshot || !snapshotMatchesUser(snapshot, authUser)) return null;
  if (isCartSessionExpired(snapshot.cartSessionStartedAt)) return null;
  return snapshot.cartSessionStartedAt;
}
