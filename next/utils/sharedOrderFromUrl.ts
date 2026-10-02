import { ApiError } from "@/config/api";
import { getOrderByIdWithoutemail, saveCart } from "@/services/cart";
import type { CartItem } from "@/stores/useCartStore";
import { buildCalculatePayload } from "@/screens/shoppingcart/checkout/utils/calculatePayload";
import { useCartStore } from "@/stores/useCartStore";
import { useTabsStore } from "@/stores/useTabsStore";
import type { OrderCalculateResponse, OrderItem } from "@/type";

/** Skip the next checkout Calculate run after URL shared-order hydrate already called Calculate. */
let skipNextCheckoutCalculateForOrderId: string | null = null;

/** Skip the next cart-page Calculate run after URL shared-order hydrate already called Calculate. */
let skipNextCartPageCalculate = false;

export function markSharedOrderCalculateApplied(orderId: string): void {
  skipNextCheckoutCalculateForOrderId = orderId;
}

export function consumeSharedOrderCalculateSkip(currentCartId: string): boolean {
  if (
    !skipNextCheckoutCalculateForOrderId ||
    skipNextCheckoutCalculateForOrderId !== currentCartId
  ) {
    return false;
  }
  skipNextCheckoutCalculateForOrderId = null;
  return true;
}

export function markSharedOrderCartPageHydrated(): void {
  skipNextCartPageCalculate = true;
}

export function consumeSharedOrderCartPageCalculateSkip(): boolean {
  if (!skipNextCartPageCalculate) return false;
  skipNextCartPageCalculate = false;
  return true;
}

/** Clear cart lines after failed ?orderId= load; keep addresses and other checkout state. */
export function applySharedOrderHydrationFailure(): void {
  const {
    setupdatecart,
    setcartid,
    setTotalPrice,
    setShippingFee,
    setdepositfee,
    setVatPercentage,
    setShippingMethod,
    setcheckoutpending,
    setiscartchanged,
  } = useCartStore.getState();

  setupdatecart([]);
  setcartid("");
  setTotalPrice(0);
  setShippingFee(0);
  setdepositfee(0);
  setVatPercentage(0);
  setShippingMethod("");
  setcheckoutpending(true);
  setiscartchanged(false);
  markSharedOrderCartPageHydrated();
}

export function getLocaleSegmentFromPathname(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "en-BE";
}

export function getPartLineItems(items: OrderItem[] | null | undefined): OrderItem[] {
  return (items ?? []).filter((item) => item?.id && item.type !== "Deposit");
}

export function mergeOrderPartItemsWithLocalCart(
  serverItems: OrderItem[],
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

export function applySharedOrderCalculateResponse(
  data: OrderCalculateResponse,
  orderId: string,
): void {
  const {
    cartitems,
    setcartid,
    setupdatecart,
    setTotalPrice,
    setShippingFee,
    setVatPercentage,
    setShippingMethod,
    setdepositfee,
    setcheckoutpending,
    setiscartchanged,
  } = useCartStore.getState();

  const apiItems = data.items ?? [];
  const partApiItems = apiItems.filter((item) => item.type !== "Deposit");

  const updatedItems = partApiItems.map((apiItem) => {
    const existing = cartitems.find((c) => c.id === apiItem.id);
    return {
      ...(existing ?? {}),
      ...apiItem,
      id: apiItem.id,
    } as CartItem;
  });

  const deposititems = apiItems.filter((item) => item.type === "Deposit");
  const totaldeposit = deposititems.reduce(
    (acc, item) => acc + (Number(item.totalPriceIncVat) || 0),
    0,
  );

  setcartid(orderId);
  setupdatecart(updatedItems);
  setdepositfee(totaldeposit);
  setTotalPrice(data.totalPriceIncVat ?? 0);
  setShippingFee(data.shippingFee ?? 0);
  setVatPercentage(Number(apiItems[0]?.vatPercentage) ?? 0);
  setShippingMethod(data.shippingMethod ?? "");
  setcheckoutpending(true);
  setiscartchanged(false);
}

export function buildCartPageSharedCalculatePayload(
  orderId: string,
  lineItems: Array<{ id: string; quantity: number }>,
): Record<string, unknown> {
  const {
    selectedSavedDeliveryAddress,
    selectedSavedBillingAddress,
    guestDeliveryFormData,
    guestBillingFormData,
    isSameShipping,
  } = useCartStore.getState();

  let shipping = selectedSavedDeliveryAddress ?? guestDeliveryFormData ?? null;
  const billing = selectedSavedBillingAddress ?? guestBillingFormData ?? null;

  if (isSameShipping && guestBillingFormData && !selectedSavedDeliveryAddress) {
    shipping = guestBillingFormData;
  }

  return {
    id: orderId,
    shipping: shipping ?? null,
    billing: billing ?? null,
    items: lineItems,
  };
}

export function buildCheckoutSharedCalculatePayload(
  orderId: string,
  lineItems: Array<{ id: string; quantity: number }>,
  options: {
    activeTab: string;
    isAuthenticated: boolean;
    hasSavedAddresses: boolean;
  },
): Record<string, unknown> {
  const state = useCartStore.getState();
  return buildCalculatePayload({
    activeTab: options.activeTab,
    isAuthenticated: options.isAuthenticated,
    hasSavedAddresses: options.hasSavedAddresses,
    guestBillingFormData: state.guestBillingFormData,
    guestDeliveryFormData: state.guestDeliveryFormData,
    selectedSavedBillingAddress: state.selectedSavedBillingAddress,
    selectedSavedDeliveryAddress: state.selectedSavedDeliveryAddress,
    isSameShipping: state.isSameShipping,
    warehouseAddress: state.warehouseAddress,
    cartid: orderId,
    items: lineItems,
  });
}

export async function hydrateCartFromSharedOrderId(
  orderId: string,
  options: { isCheckout: boolean; isAuthenticated: boolean },
): Promise<void> {
  const order = await getOrderByIdWithoutemail(orderId);
  const partItems = getPartLineItems(order.items);

  if (partItems.length === 0) {
    throw new ApiError(404, "Shared order has no items");
  }

  const localItems = useCartStore.getState().cartitems;
  const mergedItems = mergeOrderPartItemsWithLocalCart(partItems, localItems);

  useCartStore.getState().setcartid(orderId);
  useCartStore.getState().setupdatecart(mergedItems);
  useCartStore.getState().setcheckoutpending(false);

  const lineItems = partItems.map((item) => ({
    id: item.id as string,
    quantity: item.quantity ?? 1,
  }));

  const hasSavedAddresses = (useCartStore.getState().savedBillingAddresses?.length ?? 0) > 0;

  const activeTab = options.isCheckout ? useTabsStore.getState().activeTab : "homeDelivery";

  const payload = options.isCheckout
    ? buildCheckoutSharedCalculatePayload(orderId, lineItems, {
        activeTab,
        isAuthenticated: options.isAuthenticated,
        hasSavedAddresses,
      })
    : buildCartPageSharedCalculatePayload(orderId, lineItems);

  const response = await saveCart(payload as never);
  const data = response.data as OrderCalculateResponse;

  applySharedOrderCalculateResponse(data, orderId);

  markSharedOrderCartPageHydrated();
  if (options.isCheckout) {
    markSharedOrderCalculateApplied(orderId);
  }
}
