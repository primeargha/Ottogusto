/**
 * Builds the payload for the Calculate API.
 * Used only by the single "run Calculate" path so all triggers use the same contract.
 *
 * Rules:
 * - Guest or logged-in with NO saved addresses: billing/shipping from guest form data.
 * - Logged-in with saved addresses: billing/shipping from selected saved addresses.
 * - If null: warehouse => { billing: null, shipping: null, shippingMethod: "PICKUP" }; home => { billing: null, shipping: null }.
 */

import { Address } from "@/types/profile";

export interface BuildCalculatePayloadParams {
  activeTab: string;
  isAuthenticated: boolean;
  hasSavedAddresses: boolean;
  guestBillingFormData: Partial<Address> | null;
  guestDeliveryFormData: Partial<Address> | null;
  selectedSavedBillingAddress: Address | null;
  selectedSavedDeliveryAddress: Address | null;
  isSameShipping: boolean;
  warehouseAddress: Address | null;
  cartid: string | null;
  items: Array<{ id: string; quantity: number }>;
}

export function buildCalculatePayload(
  params: BuildCalculatePayloadParams,
): Record<string, unknown> {
  const {
    activeTab,
    isAuthenticated,
    hasSavedAddresses,
    guestBillingFormData,
    guestDeliveryFormData,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    isSameShipping,
    warehouseAddress,
    cartid,
    items,
  } = params;

  const isWarehousePickup = activeTab === "warehousePickup";
  const base: Record<string, unknown> = {
    id: cartid ?? null,
    items: items?.map((item) => ({ id: item.id, quantity: item.quantity })) ?? [],
  };

  // Guest or logged-in with NO saved addresses: use guest form data
  if (!isAuthenticated || !hasSavedAddresses) {
    const billing = guestBillingFormData ?? null;
    let shipping = guestDeliveryFormData ?? null;

    // When Same as shipping is enabled and delivery form has not diverged,
    // fall back to billing data for shipping.
    // Commented !shipping check and directly using guestBillingFormData
    if (isSameShipping && guestBillingFormData) {
      shipping = guestBillingFormData;
    }

    if (billing === null && shipping === null) {
      if (isWarehousePickup) {
        return { ...base, billing: null, shipping: null, shippingMethod: "PICKUP" };
      }
      return { ...base, billing: null, shipping: null };
    }
    if (isWarehousePickup) {
      // For warehouse pickup, do not send a shipping address in the payload.
      return { ...base, billing, shipping: null, shippingMethod: "PICKUP" };
    }
    return { ...base, billing, shipping };
  }

  // Logged-in with saved addresses: use selected saved addresses
  const billing = selectedSavedBillingAddress ?? null;
  // For warehouse: shipping may be warehouse address or PICKUP address from API
  const shippingAddress = isWarehousePickup
    ? selectedSavedDeliveryAddress?.shippingMethod === "PICKUP"
      ? selectedSavedDeliveryAddress
      : warehouseAddress
    : isSameShipping
      ? selectedSavedBillingAddress
      : selectedSavedDeliveryAddress;
  const shipping = shippingAddress ?? null;

  if (billing === null && shipping === null) {
    if (isWarehousePickup) {
      return { ...base, billing: null, shipping: null, shippingMethod: "PICKUP" };
    }
    return { ...base, billing: null, shipping: null };
  }
  if (isWarehousePickup) {
    // For warehouse pickup, force shipping to null while keeping the method.
    return { ...base, billing, shipping: null, shippingMethod: "PICKUP" };
  }
  return { ...base, billing, shipping };
}
