/** Cart session TTL in sessionStorage (1 day). */
export const CART_SESSION_MS = 24 * 60 * 60 * 1000;

export function getCartSessionRemainingMs(
  cartSessionStartedAt: number | null | undefined,
): number | null {
  if (cartSessionStartedAt == null || cartSessionStartedAt <= 0) return null;
  return Math.max(0, CART_SESSION_MS - (Date.now() - cartSessionStartedAt));
}

export function isCartSessionExpired(cartSessionStartedAt: number | null | undefined): boolean {
  const remaining = getCartSessionRemainingMs(cartSessionStartedAt);
  if (remaining === null) return false;
  return remaining <= 0;
}
