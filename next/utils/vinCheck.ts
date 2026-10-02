import type { VinCompatApiStatus } from "./vinCompatibilityCache";

export const VALID_VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export type VinMatchStatus = "FIT" | "MAY_FIT" | "NO_FIT";

export type VinCheckUiCase = 3 | 4 | 5 | 6;

export interface VinCheckItemResult {
  id: string;
  isMatch: VinMatchStatus;
}

export interface VinCheckResult {
  vin: string;
  items: VinCheckItemResult[];
  checkedAt: number;
}

/** Normalizes API values (`Yes`/`Maybe`/`No`) and legacy variants to canonical status. */
export function normalizeVinMatchStatus(value: unknown): VinMatchStatus | null {
  if (value == null || value === "") return null;
  const upper = String(value).trim().toUpperCase();
  const legacy = upper.replace(/-/g, "_");

  if (upper === "YES") return "FIT";
  if (upper === "MAYBE" || upper === "MAY") return "MAY_FIT";
  if (upper === "NO") return "NO_FIT";

  if (legacy === "FIT") return "FIT";
  if (legacy === "MAY_FIT") return "MAY_FIT";
  if (legacy === "NO_FIT") return "NO_FIT";

  return null;
}

/** Maps a single API line: null / missing / empty `isMatch` → unknown → Maybe (Case 7). */
function resolveItemMatchStatus(item: { isMatch?: unknown }): VinMatchStatus {
  if (!("isMatch" in item) || item.isMatch == null || item.isMatch === "") {
    return "MAY_FIT";
  }
  return normalizeVinMatchStatus(item.isMatch) ?? "MAY_FIT";
}

/** Case 7a: VinCheck failed with no usable response — all cart lines are Maybe. */
export function buildAllMayFitItems(cartItemIds: string[]): VinCheckItemResult[] {
  return cartItemIds.map((id) => ({ id, isMatch: "MAY_FIT" }));
}

export function parseVinCheckResponseItems(
  apiItems: Array<{ id?: string; isMatch?: unknown }> | undefined,
  cartItemIds: string[],
): VinCheckItemResult[] {
  const byId = new Map<string, VinMatchStatus>();
  for (const item of apiItems ?? []) {
    if (!item?.id) continue;
    byId.set(item.id, resolveItemMatchStatus(item));
  }

  return cartItemIds.map((id) => ({
    id,
    isMatch: byId.get(id) ?? "MAY_FIT",
  }));
}

export function deriveVinCheckUiCase(items: VinCheckItemResult[]): VinCheckUiCase | null {
  if (!items.length) return null;
  const hasMayFit = items.some((i) => i.isMatch === "MAY_FIT");
  const hasNoFit = items.some((i) => i.isMatch === "NO_FIT");
  const allFit = items.every((i) => i.isMatch === "FIT");

  if (hasNoFit && hasMayFit) return 6;
  if (hasNoFit) return 5;
  if (hasMayFit) return 4;
  if (allFit) return 3;
  return 4;
}

export function getMayFitItems(items: VinCheckItemResult[]): VinCheckItemResult[] {
  return items.filter((i) => i.isMatch === "MAY_FIT");
}

export function getNoFitItems(items: VinCheckItemResult[]): VinCheckItemResult[] {
  return items.filter((i) => i.isMatch === "NO_FIT");
}

export function vinMatchStatusToApiStatus(status: VinMatchStatus): VinCompatApiStatus {
  if (status === "FIT") return "Yes";
  if (status === "NO_FIT") return "No";
  return "Maybe";
}

function toCacheApiStatus(value: unknown): VinCompatApiStatus {
  const normalized = normalizeVinMatchStatus(value);
  if (normalized === "FIT") return "Yes";
  if (normalized === "NO_FIT") return "No";
  return "Maybe";
}

export function formatPdpVinResponseToCache(
  response: { parts?: Record<string, unknown> } | undefined,
): Record<string, VinCompatApiStatus> {
  const result: Record<string, VinCompatApiStatus> = {};
  for (const [partId, status] of Object.entries(response?.parts ?? {})) {
    result[partId] = toCacheApiStatus(status);
  }
  return result;
}

export function formatCheckoutVinResponseToCache(
  apiItems: Array<{ id?: string; isMatch?: unknown }> | undefined,
  partIds: string[],
): Record<string, VinCompatApiStatus> {
  const byId = new Map<string, VinCompatApiStatus>();
  for (const item of apiItems ?? []) {
    if (!item?.id) continue;
    byId.set(item.id, toCacheApiStatus(item.isMatch));
  }

  const result: Record<string, VinCompatApiStatus> = {};
  for (const id of partIds) {
    result[id] = byId.get(id) ?? "Maybe";
  }
  return result;
}

export function buildVinCheckResultFromCache(
  vin: string,
  partIds: string[],
  cacheParts: Record<string, VinCompatApiStatus>,
): VinCheckResult {
  return {
    vin: vin.trim().toUpperCase(),
    items: partIds.map((id) => ({
      id,
      isMatch: normalizeVinMatchStatus(cacheParts[id]) ?? "MAY_FIT",
    })),
    checkedAt: Date.now(),
  };
}

export function buildMayFitCacheForPartIds(partIds: string[]): Record<string, VinCompatApiStatus> {
  return Object.fromEntries(partIds.map((id) => [id, "Maybe" as const]));
}

export const GUARANTEED_VIN_CHECK_MAIN_MESSAGE =
  "MAY FIT – need confirmation for the products to confirm if these OE refs are matching with the provided VIN.";

export const GUARANTEED_VIN_CHECK_NO_FIT_MESSAGE =
  "NO FIT – these products do not match the provided VIN, please assist the customer with compatible alternatives or further verification.";

/** Leading breaks create visual gap below Freshdesk auto header (payload fields). */
export function formatCheckoutSupportMessage(body: string): string {
  return `<br /><br />${body.trim().replace(/\n/g, "<br />")}`;
}

function formatSupportContactHeader(
  contact: { firstName: string; lastName: string; email: string },
  isAuthenticated: boolean,
): string {
  if (isAuthenticated) {
    return `FirstName: ${contact.firstName},
LastName: ${contact.lastName},
Email: ${contact.email},`;
  }

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  return `Name: ${fullName},
Email: ${contact.email},`;
}

export type GuaranteedVinCheckSupportMessageParams = {
  contact: { firstName: string; lastName: string; email: string };
  orderId: string;
  vin: string;
  mayFitItems: VinCheckItemResult[];
  cartItems: Array<{ id: string; partname?: string; name?: string; oeReference?: string }>;
  isAuthenticated?: boolean;
  matchType?: "MAY_FIT" | "NO_FIT";
  /** Display label for Freshdesk, e.g. English / French / Dutch / German. */
  language?: string;
};

export type PdpGuaranteedVinCheckSupportMessageParams = {
  contact: { firstName: string; lastName: string; email: string };
  vin: string;
  productId: string;
  name?: string;
  title?: string;
  oeReference?: string;
  /** Unit / single-quantity price (typically `priceInclVat`). */
  price?: number | null;
  /** Display label for Freshdesk, e.g. English / French / Dutch / German. */
  language: string;
  isAuthenticated?: boolean;
  matchType?: "MAY_FIT" | "NO_FIT";
};

/** Locale language code → English display name for PDP GuaranteedVinCheck support message. */
const SUPPORT_LANGUAGE_BY_CODE: Record<string, string> = {
  en: "English",
  fr: "French",
  nl: "Dutch",
  de: "German",
};

/**
 * Map URL locale (`en`, `en-BE`, …) to support-message language label.
 * Unknown codes fall back to English.
 */
export function mapLocaleToSupportLanguageLabel(localeOrLang: string | null | undefined): string {
  const raw = String(localeOrLang ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return SUPPORT_LANGUAGE_BY_CODE.en!;
  const lang = raw.split("-")[0] || raw;
  return SUPPORT_LANGUAGE_BY_CODE[lang] ?? SUPPORT_LANGUAGE_BY_CODE.en!;
}

function formatPdpSupportPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(Number(price))) return "—";
  return String(price);
}

export function buildPdpGuaranteedVinCheckSupportMessage({
  contact,
  vin,
  productId,
  name,
  title,
  oeReference,
  price,
  language,
  isAuthenticated = false,
  matchType = "MAY_FIT",
}: PdpGuaranteedVinCheckSupportMessageParams): string {
  const oeRef = oeReference?.trim() || "—";
  const nameLabel = name?.trim() || "—";
  const titleLabel = title?.trim() || "—";
  const idLabel = String(productId ?? "").trim() || "—";
  const priceLabel = formatPdpSupportPrice(price);
  const languageLabel = language?.trim() || mapLocaleToSupportLanguageLabel("en");

  const sectionLabel = matchType === "NO_FIT" ? "No Fit Items" : "May Fit Items";
  const mainMessage =
    matchType === "NO_FIT"
      ? GUARANTEED_VIN_CHECK_NO_FIT_MESSAGE
      : GUARANTEED_VIN_CHECK_MAIN_MESSAGE;

  const finalMessage = `${formatSupportContactHeader(contact, isAuthenticated)}
OrderID: null,

Category: GuaranteedVinCheck,
language: ${languageLabel},
VIN: ${vin},
Source: PDP page.

${sectionLabel}:
- id: ${idLabel}, name: ${nameLabel}, title: ${titleLabel}, oeRef: ${oeRef}, price: ${priceLabel}

Message: ${mainMessage}`;

  return formatCheckoutSupportMessage(finalMessage);
}

export function buildGuaranteedVinCheckSupportMessage({
  contact,
  orderId,
  vin,
  mayFitItems,
  cartItems,
  isAuthenticated = false,
  matchType = "MAY_FIT",
  language,
}: GuaranteedVinCheckSupportMessageParams): string {
  const itemLines = mayFitItems.map((item) => {
    const cartLine = cartItems.find((c) => c.id === item.id);
    const label = cartLine?.partname || cartLine?.name || item.id;
    const oeRef = cartLine?.oeReference?.trim() || "—";
    return `- ${label} — OE Ref: ${oeRef}`;
  });

  const sectionLabel = matchType === "NO_FIT" ? "No Fit Items" : "May Fit Items";
  const mainMessage =
    matchType === "NO_FIT"
      ? GUARANTEED_VIN_CHECK_NO_FIT_MESSAGE
      : GUARANTEED_VIN_CHECK_MAIN_MESSAGE;
  const languageLabel = language?.trim() || mapLocaleToSupportLanguageLabel("en");

  const finalMessage = `${formatSupportContactHeader(contact, isAuthenticated)}
OrderID: ${orderId},

Category: GuaranteedVinCheck,
language: ${languageLabel},
VIN: ${vin},
Source: Checkout page.

${sectionLabel}:
${itemLines.join("\n")}

Message: ${mainMessage}`;

  return formatCheckoutSupportMessage(finalMessage);
}

export const PART_QUERY_UNVERIFIED_MESSAGE =
  "Part Query Message: Customer has not clicked on Verify VIN ( VINCheck CTA ).";

/** Checkout VIN API flow: VIN entered, Verify not clicked, Order and pay. */
export function buildCheckoutVinApiUnverifiedMessage(vin: string): string {
  return `Customer entered VIN ${vin} but did not click Verify VIN before placing the order. Please verify vehicle compatibility manually.`;
}

/** Checkout manual VIN flow (flag off): VIN entered, Order and pay. */
export function buildCheckoutManualVinFlowMessage(vin: string): string {
  return `Customer requested VIN compatibility verification through the Manual VIN Flow. Please verify vehicle compatibility for VIN ${vin}.`;
}

export const CHECKOUT_VIN_API_FLOW_SUPPORT_SOURCE = "Checkout VIN API Flow";
export const CHECKOUT_MANUAL_VIN_FLOW_SUPPORT_SOURCE = "Checkout Manual VIN Flow";
export const PDP_MANUAL_VIN_VERIFICATION_SUPPORT_SOURCE = "PDP manual VIN Verification";

export type CheckoutPartQueryVinFlow = "vin_api_unverified" | "manual_vin";

export type PartQueryUnverifiedCartItem = {
  id: string;
  partname?: string;
  name?: string;
  title?: string;
  oeReference?: string;
  price?: number;
  unitPriceIncVat?: string | number;
  quantity?: number;
};

export type PartQueryUnverifiedSupportMessageParams = {
  contact: { firstName: string; lastName: string; email: string };
  orderId: string;
  vin: string;
  cartItems?: PartQueryUnverifiedCartItem[];
  isAuthenticated?: boolean;
  /** Display label for Freshdesk (English / French / …). */
  language?: string;
  /** When omitted, defaults to vin_api_unverified message for backward compatibility. */
  flow?: CheckoutPartQueryVinFlow;
  /** Overrides Source line + should match payload.source. */
  source?: string;
};

export type PdpManualVinSupportMessageParams = {
  contact: { firstName: string; lastName: string; email: string };
  vin: string;
  productTitle: string;
  language: string;
  isAuthenticated?: boolean;
  /** Prefill body from `compatibility_verify_vin_prefill_message` (with product title already substituted). */
  productMessage: string;
};

function formatPartQueryCartItemLine(item: PartQueryUnverifiedCartItem): string {
  const idLabel = String(item.id ?? "").trim() || "—";
  const nameLabel = item.partname?.trim() || item.name?.trim() || "—";
  const titleLabel = item.title?.trim() || "—";
  const oeRef = item.oeReference?.trim() || "—";
  const unitPrice =
    item.price != null && !Number.isNaN(Number(item.price))
      ? Number(item.price)
      : item.unitPriceIncVat != null && !Number.isNaN(Number(item.unitPriceIncVat))
        ? Number(item.unitPriceIncVat)
        : null;
  const priceLabel = formatPdpSupportPrice(unitPrice);
  const quantityLabel =
    item.quantity != null && !Number.isNaN(Number(item.quantity)) ? String(item.quantity) : "—";
  return `- id: ${idLabel}, name: ${nameLabel}, title: ${titleLabel}, oeRef: ${oeRef}, price: ${priceLabel}, quantity: ${quantityLabel}`;
}

export function buildPartQueryUnverifiedSupportMessage({
  contact,
  orderId,
  vin,
  cartItems = [],
  isAuthenticated = false,
  language,
  flow = "vin_api_unverified",
  source,
}: PartQueryUnverifiedSupportMessageParams): string {
  const itemLines =
    cartItems.length > 0
      ? cartItems.map(formatPartQueryCartItemLine).join("\n")
      : "- (no cart items)";

  const languageLabel = language?.trim() || mapLocaleToSupportLanguageLabel("en");
  const sourceLabel =
    source?.trim() ||
    (flow === "manual_vin"
      ? CHECKOUT_MANUAL_VIN_FLOW_SUPPORT_SOURCE
      : CHECKOUT_VIN_API_FLOW_SUPPORT_SOURCE);

  const trailingMessage =
    flow === "manual_vin"
      ? buildCheckoutManualVinFlowMessage(vin)
      : buildCheckoutVinApiUnverifiedMessage(vin);

  const finalMessage = `${formatSupportContactHeader(contact, isAuthenticated)}
OrderID: ${orderId},

Category: PartQuery,
language: ${languageLabel},
VIN: ${vin},
Source: ${sourceLabel}.

Items:
${itemLines}

Message: ${trailingMessage}`;

  return formatCheckoutSupportMessage(finalMessage);
}

/** PDP manual VIN flow (checkout_vin_api_flow_feature_flag = false) Support message. */
export function buildPdpManualVinSupportMessage({
  contact,
  vin,
  productTitle,
  language,
  isAuthenticated = false,
  productMessage,
}: PdpManualVinSupportMessageParams): string {
  const languageLabel = language?.trim() || mapLocaleToSupportLanguageLabel("en");
  const titleLabel = productTitle?.trim() || "—";
  const body = productMessage?.trim() || `VIN compatibility check for ${titleLabel}.`;

  const finalMessage = `${formatSupportContactHeader(contact, isAuthenticated)}
OrderID: null,

Category: PartQuery,
language: ${languageLabel},
VIN: ${vin},
Source: ${PDP_MANUAL_VIN_VERIFICATION_SUPPORT_SOURCE}.

Message: ${body}`;

  return formatCheckoutSupportMessage(finalMessage);
}
