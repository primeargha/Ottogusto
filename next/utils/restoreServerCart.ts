import { getCheckCartId, getOrderByIdWithoutemail } from "@/services/cart";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CartItem } from "@/stores/useCartStore";
import { useCartStore } from "@/stores/useCartStore";
import type { GetOrderListItem } from "@/type";
import {
  clearAccountCartSnapshot,
  getAccountCartSnapshot,
  getSnapshotCartSessionStartedAt,
  snapshotMatchesUser,
} from "@/utils/accountCartSession";

let restoreInFlight: Promise<boolean> | null = null;

function mergeServerItemsWithLocal(
  serverItems: NonNullable<GetOrderListItem["items"]>,
  localItems: CartItem[],
): CartItem[] {
  return serverItems.map((apiItem) => {
    const existingItem = localItems.find((e) => e.id === apiItem.id);
    const row = apiItem as Record<string, unknown>;
    return {
      ...apiItem,
      seo: row.seo ?? existingItem?.seo,
      manufacturer: row.manufacturer ?? existingItem?.manufacturer,
      manufacturerId: row.manufacturerId ?? existingItem?.manufacturerId,
    } as unknown as CartItem;
  });
}

export function applyServerCartOrder(
  cart: GetOrderListItem,
  options?: { cartSessionStartedAt?: number | null },
): void {
  const { setcartid, setupdatecart, setiscartchanged, cartitems, touchCartSession } =
    useCartStore.getState();

  const orderId = cart.orderId ?? "";
  if (orderId) {
    setcartid(orderId);
  }

  if (cart.items && cart.items.length > 0) {
    const hasRecommendedPrice = cartitems.some(
      (item) => item.recommendedPriceInclVat !== undefined,
    );
    if (!hasRecommendedPrice) {
      setiscartchanged(true);
    }
    setupdatecart(mergeServerItemsWithLocal(cart.items, cartitems));
  }

  const startedAt = options?.cartSessionStartedAt;
  if (startedAt != null && startedAt > 0) {
    useCartStore.setState({ cartSessionStartedAt: startedAt });
  } else if (cart.items && cart.items.length > 0) {
    touchCartSession();
  }
}

function pickServerCart(
  orders: GetOrderListItem[],
  preferOrderId: string,
): GetOrderListItem | null {
  if (!orders.length) return null;
  const match = orders.find((o) => o.orderId === preferOrderId);
  return match ?? orders[0] ?? null;
}

function syncAuthTokenForApiClient(): boolean {
  const token = useAuthStore.getState().accessToken;
  if (!token || typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem("auth-store");
    const parsed = raw ? JSON.parse(raw) : { state: {} };
    if (parsed.state?.accessToken !== token) {
      parsed.state = { ...(parsed.state ?? {}), accessToken: token };
      localStorage.setItem("auth-store", JSON.stringify(parsed));
    }
  } catch {
    /* still attempt request with zustand token via api fallback */
  }

  return true;
}

/**
 * Restore cart only after the same user logs back in (logout snapshot must match).
 * Guest login or a different account: no restore; snapshot is cleared.
 */
export async function restoreAccountCartOnLogin(authUser: unknown): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const state = useCartStore.getState();
  if (state.try_again) return false;
  if (state.cartid !== "" && state.cartitems.length > 0) return false;

  const snapshot = getAccountCartSnapshot();
  if (!snapshot) return false;

  if (!snapshotMatchesUser(snapshot, authUser)) {
    clearAccountCartSnapshot();
    return false;
  }

  if (!useAuthStore.getState().accessToken) return false;
  if (!syncAuthTokenForApiClient()) return false;

  if (restoreInFlight) return restoreInFlight;

  restoreInFlight = (async () => {
    try {
      let cart: GetOrderListItem | null = null;

      try {
        const orders = await getCheckCartId();
        if (orders?.length) {
          cart = pickServerCart(orders, snapshot.orderId);
        }
      } catch (error) {
        console.error("[restoreAccountCartOnLogin] getCheckCartId", error);
      }

      if (!cart?.items?.length && snapshot.orderId) {
        try {
          const order = await getOrderByIdWithoutemail(snapshot.orderId);
          const row = order as unknown as GetOrderListItem & { id?: string | null };
          if (row && (row.items?.length || row.orderId || row.id)) {
            cart = {
              ...row,
              orderId: row.orderId ?? row.id ?? snapshot.orderId,
            };
          }
        } catch (error) {
          console.error("[restoreAccountCartOnLogin] getOrderById", error);
        }
      }

      if (!cart) return false;

      const sessionStartedAt = getSnapshotCartSessionStartedAt(snapshot, authUser);
      applyServerCartOrder(cart, { cartSessionStartedAt: sessionStartedAt });
      clearAccountCartSnapshot();
      return Boolean(cart.orderId || (cart.items && cart.items.length > 0));
    } finally {
      restoreInFlight = null;
    }
  })();

  return restoreInFlight;
}
