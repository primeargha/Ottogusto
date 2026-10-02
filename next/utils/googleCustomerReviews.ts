import type { OrderCalculateResponse } from "@/type";
import { getInstockInformation } from "@/services/productdetailsservice";

export type DeliveryKey = "small" | "medium" | "large";

/** Upper bound business days per delivery tier (matches branding delivery_type_* labels). */
export const DELIVERY_MAX_BUSINESS_DAYS: Record<DeliveryKey, number> = {
  small: 3,
  medium: 7,
  large: 14,
};

const DELIVERY_KEY_RANK: Record<DeliveryKey, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

export function isDeliveryKey(value: string | null | undefined): value is DeliveryKey {
  return value === "small" || value === "medium" || value === "large";
}

export function getMaxDeliveryKey(keys: DeliveryKey[]): DeliveryKey {
  if (keys.length === 0) return "large";
  return keys.reduce((max, key) => (DELIVERY_KEY_RANK[key] > DELIVERY_KEY_RANK[max] ? key : max));
}

export function addBusinessDays(start: Date, businessDays: number): Date {
  const result = new Date(start);
  let remaining = businessDays;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

/** Format as YYYY-MM-DD (local calendar date) for Google Customer Reviews. */
export function formatGcrDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getEstimatedDeliveryDate(
  maxDeliveryKey: DeliveryKey,
  orderCreateDate?: string | null,
): string {
  const base = orderCreateDate ? new Date(orderCreateDate) : new Date();
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const days = DELIVERY_MAX_BUSINESS_DAYS[maxDeliveryKey];
  return formatGcrDate(addBusinessDays(safeBase, days));
}

export function getDeliveryCountryFromOrder(order: OrderCalculateResponse): string | null {
  const raw = order.shipping?.country ?? order.billing?.country;
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (code.length !== 2 || code === "ZZ") return null;
  return code;
}

export function isValidGcrEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Language codes Google accepts for the opt-in dialog, from the supported-language
 * table in the survey opt-in integration guide.
 *
 * Dutch is the one deviation: Google's table prints `ml` for "Dutch", but `ml` is
 * Malayalam. We send `nl` instead — if Google does not recognise it, the documented
 * behaviour is to fall back to the browser language, which is Dutch anyway.
 */
const GCR_SUPPORTED_LANGS = new Set([
  "af",
  "ar",
  "cs",
  "da",
  "de",
  "en",
  "es",
  "fil",
  "ga",
  "id",
  "it",
  "ja",
  "ms",
  "nl",
  "no",
  "pl",
  "ru",
  "sv",
  "tr",
]);

/**
 * Maps a route locale (e.g. `en-BE`) to a Google Customer Reviews `lang` code.
 *
 * Returns null when there is no supported match, so the caller can omit
 * `window.___gcfg` entirely and let Google pick the language from the browser —
 * a better outcome than sending a code Google silently ignores.
 */
export function mapLanguageCountryToGcrLang(languageCountry?: string | null): string | null {
  if (!languageCountry) return null;
  const parts = languageCountry.split("-");
  const lang = (parts[0] ?? "").toLowerCase();
  const country = (parts[1] ?? "").toUpperCase();

  // `key` is the staff translation-key debug pseudo-locale, not a real language.
  if (lang === "key") return "en";

  if (lang === "en") {
    if (country === "GB" || country === "US" || country === "AU") return `en-${country}`;
    return "en";
  }
  if (lang === "pt") return country === "BR" ? "pt-BR" : "pt-PT";
  if (lang === "zh") return country === "TW" ? "zh-TW" : "zh-CN";
  if (lang === "es") return country === "MX" || country === "AR" ? "es-419" : "es";

  return GCR_SUPPORTED_LANGS.has(lang) ? lang : null;
}

export async function getMaxDeliveryKeyForProductIds(
  productIds: Array<string | undefined | null>,
): Promise<DeliveryKey> {
  const keys: DeliveryKey[] = [];

  await Promise.all(
    productIds.map(async (id) => {
      if (!id) return;
      try {
        const response = await getInstockInformation(id);
        const deliveryTime = response.data?.deliveryTime;
        if (isDeliveryKey(deliveryTime)) keys.push(deliveryTime);
      } catch {
        // Skip failed stock lookups; fall back to large tier below.
      }
    }),
  );

  return getMaxDeliveryKey(keys);
}

export function parseMerchantIdFromEnv(): number | null {
  const raw = process.env.NEXT_PUBLIC_MERCHANT_ID;
  if (!raw) return null;
  const id = Number.parseInt(raw.replace(/"/g, ""), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}
