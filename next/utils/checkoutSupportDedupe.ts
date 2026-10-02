/** Normalizes VAT/VIN for stable localStorage dedupe keys. */
export function normalizeSupportDedupeValue(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function getVatPendingSupportSentKey(cartId: string, vatNumber: string): string {
  return `vat_pending_freshdesk_ticket_sent:${cartId}:${normalizeSupportDedupeValue(vatNumber)}`;
}

export function getVatPendingSupportInflightKey(cartId: string, vatNumber: string): string {
  return `vat_pending_freshdesk_ticket_inflight:${cartId}:${normalizeSupportDedupeValue(vatNumber)}`;
}

export function getVinPartQuerySupportSentKey(cartId: string, vin: string): string {
  return `vin_partquery_support_sent:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

export function getVinPartQuerySupportInflightKey(cartId: string, vin: string): string {
  return `vin_partquery_support_inflight:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

export function getVinMayFitSupportSentKey(cartId: string, vin: string): string {
  return `vin_mayfit_support_sent:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

export function getVinMayFitSupportInflightKey(cartId: string, vin: string): string {
  return `vin_mayfit_support_inflight:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

export function getGuaranteedVinCheckSupportSentKey(cartId: string, vin: string): string {
  return `vin_guaranteed_support_sent:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

export function getGuaranteedVinCheckSupportInflightKey(cartId: string, vin: string): string {
  return `vin_guaranteed_support_inflight:${cartId}:${normalizeSupportDedupeValue(vin)}`;
}

/** Clears VIN-related support dedupe keys for one cart + VIN (legacy + current keys). */
export function clearVinSupportDedupeForCartAndVin(cartId: string, vin: string): void {
  if (typeof window === "undefined" || !cartId || !vin.trim()) return;

  try {
    const keys = [
      getVinPartQuerySupportSentKey(cartId, vin),
      getVinPartQuerySupportInflightKey(cartId, vin),
      getVinMayFitSupportSentKey(cartId, vin),
      getVinMayFitSupportInflightKey(cartId, vin),
      getGuaranteedVinCheckSupportSentKey(cartId, vin),
      getGuaranteedVinCheckSupportInflightKey(cartId, vin),
    ];
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore localStorage errors.
  }
}

const checkoutSupportDedupePrefixes = (cartId: string) => [
  `vat_pending_freshdesk_ticket_sent:${cartId}`,
  `vat_pending_freshdesk_ticket_inflight:${cartId}`,
  `vin_partquery_support_sent:${cartId}`,
  `vin_partquery_support_inflight:${cartId}`,
  `vin_mayfit_support_sent:${cartId}`,
  `vin_mayfit_support_inflight:${cartId}`,
  `vin_guaranteed_support_sent:${cartId}`,
  `vin_guaranteed_support_inflight:${cartId}`,
];

/** Clears scoped and legacy cart-level support dedupe keys for one cart. */
export function clearAllCheckoutSupportDedupeForCart(cartId: string): void {
  if (typeof window === "undefined" || !cartId) return;

  try {
    const prefixes = checkoutSupportDedupePrefixes(cartId);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}:`))) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore localStorage errors.
  }
}

/** Clears VAT pending support dedupe for a specific cart + VAT (allows re-ticket on re-pending). */
export function clearVatPendingSupportDedupe(cartId: string, vatNumber: string): void {
  if (typeof window === "undefined" || !cartId || !vatNumber.trim()) return;

  try {
    localStorage.removeItem(getVatPendingSupportSentKey(cartId, vatNumber));
    localStorage.removeItem(getVatPendingSupportInflightKey(cartId, vatNumber));
  } catch {
    // Ignore localStorage errors.
  }
}
