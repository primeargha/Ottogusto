import { CURRENT_STORE, getCurrentStoreDisplayName } from "@/config/store-constants";
import { CustomerAddress } from "@/types/ottogusto";
import type { VinMatchStatus } from "@/utils/vinCheck";

export interface GTMItem {
  item_id: string;
  item_name: string;
  affiliation?: string | undefined;
  coupon?: string | undefined;
  currency?: string | undefined;
  discount?: number | undefined;
  index?: number | undefined;
  item_brand?: string | undefined;
  item_category?: string | undefined;
  item_category2?: string | undefined;
  item_category3?: string | undefined;
  item_category4?: string | undefined;
  item_category5?: string | undefined;
  item_list_id?: string | undefined;
  item_list_name?: string | undefined;
  item_variant?: string | undefined;
  location_id?: string | undefined;
  price: number;
  quantity: number;
  [key: string]: unknown;
}

export interface GTMEcommerceEvent {
  event: string;
  ecommerce: {
    currency?: string | undefined;
    value?: number | undefined;
    items: GTMItem[];
    coupon?: string | undefined;
    shipping?: number | undefined;
    tax?: number | undefined;
    transaction_id?: string | undefined;
    affiliation?: string | undefined;
    item_list_id?: string | undefined;
    item_list_name?: string | undefined;
    shipping_tier?: string | undefined;
    payment_type?: string | undefined;
  };
  [key: string]: unknown;
}

/** GA4 item_category1–4; used for SRP list, PDP breadcrumb, and persisted on cart lines. */
export type ViewItemListCategoryContext = {
  item_category: string;
  item_category2: string;
  item_category3: string;
  item_category4: string;
};

interface GTMProductSource {
  id?: string;
  partid?: string;
  title?: string;
  partname?: string;
  name?: string;
  brand?: { name?: string };
  manufacturer?: string;
  manufacturerId?: string;
  category?: { name?: string };
  categories?: string[] | null;
  /** Set when adding to cart (PDP breadcrumb / SRP list context); reused for view_cart, checkout, etc. */
  itemCategoryContext?: ViewItemListCategoryContext;
  priceInclVat?: string | number;
  price?: string | number;
  pricecomp?: string | number;
  quantity?: number;
  vatPercentage?: number;
  status?: string;
}

interface TaxonomyNode {
  id: string;
  parentId: string;
  name: string;
}

const categoryNodeById = new Map<string, TaxonomyNode>();
let taxonomyLoadPromise: Promise<void> | null = null;

export function normalizeGtmCategoryLabel(value: string | undefined | null): string {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

const normalizeUpper = normalizeGtmCategoryLabel;

const sanitizeBrandName = (product: GTMProductSource): string => {
  const candidates = [product.manufacturer, product.brand?.name, product.manufacturerId];
  for (const candidate of candidates) {
    const cleaned = normalizeUpper(candidate);
    if (cleaned) return cleaned;
  }
  return "";
};

/** Same rule as PDP breadcrumb: Parts API `categories[0]` is the canonical category id. */
const getPrimaryCategoryIdFromPartsApi = (categories?: string[] | null): string | null => {
  if (!categories || categories.length === 0) return null;
  const raw = categories[0];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length < 3) return null;
  return trimmed;
};

const buildCategoryLevelIds = (
  categoryId: string | null,
): { l1: string | null; l2: string | null; l3: string | null; l4: string | null } => {
  if (!categoryId) return { l1: null, l2: null, l3: null, l4: null };
  const l1 = categoryId.length >= 3 ? categoryId.slice(0, 3) : null;
  const l2 = categoryId.length >= 6 ? categoryId.slice(0, 6) : null;
  const l3 = categoryId.length >= 9 ? categoryId.slice(0, 9) : null;
  const l4 = categoryId.length >= 12 ? categoryId.slice(0, 12) : null;
  return { l1, l2, l3, l4 };
};

const getCategoryNameById = (id: string | null): string => {
  if (!id) return "";
  return normalizeUpper(categoryNodeById.get(id)?.name);
};

const fetchCategoryPayload = async (parentId?: string): Promise<any[]> => {
  const query = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";
  const response = await fetch(`/api/Category${query}`, { credentials: "include" });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

/** Register node and any nested `children` (L3, L4, …) from a single API payload. */
const registerTaxonomyNodeDeep = (node: any): void => {
  const id = String(node?.id || "");
  if (!id) return;
  categoryNodeById.set(id, {
    id,
    parentId: String(node?.parentId || "root"),
    name: String(node?.name || ""),
  });
  if (Array.isArray(node?.children)) {
    for (const child of node.children) {
      registerTaxonomyNodeDeep(child);
    }
  }
};

const loadCategoryTaxonomy = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  if (categoryNodeById.size > 0) return;
  if (taxonomyLoadPromise) return taxonomyLoadPromise;

  taxonomyLoadPromise = (async () => {
    const l1Payload = await fetchCategoryPayload();
    for (const node of l1Payload) {
      registerTaxonomyNodeDeep(node);
    }

    await Promise.all(
      l1Payload.map(async (l1: any) => {
        const l1Id = String(l1?.id || "");
        if (!l1Id) return;
        const underL1 = await fetchCategoryPayload(l1Id);
        for (const node of underL1) {
          registerTaxonomyNodeDeep(node);
        }
      }),
    );
  })()
    .catch(() => {
      // Keep GTM resilient; events should not fail if taxonomy fetch fails.
    })
    .finally(() => {
      taxonomyLoadPromise = null;
    });

  return taxonomyLoadPromise;
};

const resolveCategoryTaxonomy = (product: GTMProductSource) => {
  // Fire-and-forget taxonomy warmup so future events get full hierarchy.
  if (typeof window !== "undefined" && categoryNodeById.size === 0 && !taxonomyLoadPromise) {
    void loadCategoryTaxonomy();
  }

  const primaryCategoryId = getPrimaryCategoryIdFromPartsApi(product.categories);
  if (!primaryCategoryId) {
    return {
      item_category: "",
      item_category2: "",
      item_category3: "",
      item_category4: "",
    };
  }

  const { l1, l2, l3, l4 } = buildCategoryLevelIds(primaryCategoryId);
  const fallbackCategory = normalizeUpper(product.category?.name);
  const l1Name = getCategoryNameById(l1) || fallbackCategory || "";
  const l2Name = getCategoryNameById(l2) || fallbackCategory || "";
  const l3Name = getCategoryNameById(l3) || fallbackCategory || "";
  const l4Resolved = l4 ? getCategoryNameById(l4) : "";
  const l4Name = l4 ? l4Resolved || l3Name || fallbackCategory || "" : l3Name || "";

  return {
    item_category: l1Name,
    item_category2: l2Name,
    item_category3: l3Name,
    item_category4: l4Name,
  };
};

// Helper function to check if Cookiebot consent is given
export const hasCookiebotConsent = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if Cookiebot is loaded and consent is given
  if (window.Cookiebot && window.Cookiebot.consent) {
    const consent = window.Cookiebot.consent;

    const hasMarketingConsent = consent.marketing === true;

    return hasMarketingConsent;
  }

  // Fallback: check for Cookiebot consent cookie
  const cookiebotConsent = document.cookie
    .split("; ")
    .find((row) => row.startsWith("CookieConsent="));

  if (cookiebotConsent) {
    try {
      const parts = cookiebotConsent.split("=");
      if (parts.length < 2) return false;
      const consentValue = parts[1];
      if (!consentValue) return false;
      const consentData = JSON.parse(decodeURIComponent(consentValue));

      const hasMarketingConsent = consentData.marketing === true;

      return hasMarketingConsent;
    } catch (e) {
      return false;
    }
  }

  return false;
};

// Helper function to wait for consent and then execute callback
export const waitForConsentAndExecute = (
  callback: () => void,
  maxWaitTime: number = 5000,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const startTime = Date.now();

  const checkConsent = () => {
    const elapsed = Date.now() - startTime;

    if (hasCookiebotConsent()) {
      callback();
      return;
    }

    if (elapsed > maxWaitTime) {
      callback();
      return;
    }

    // Check again in 100ms

    setTimeout(checkConsent, 100);
  };

  checkConsent();
};

// Helper function to push events to dataLayer
export const pushToDataLayer = (eventData: Record<string, unknown>) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    // Always push to dataLayer - let GTM handle consent checking
    window.dataLayer.push(eventData);
  } else {
  }
};

// Helper function to push events to dataLayer with consent check
export const pushToDataLayerWithConsent = (eventData: Record<string, unknown>) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    // Check consent before pushing to dataLayer
    if (!hasCookiebotConsent()) {
      return;
    }

    window.dataLayer.push(eventData);
  } else {
  }
};

export const clearEcommerce = () => {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ ecommerce: null });
  } else {
  }
};

export function applyViewItemListCategoryContext(
  items: GTMItem[],
  ctx: ViewItemListCategoryContext | null | undefined,
): GTMItem[] {
  if (!ctx) return items;
  const hasListContext = [
    ctx.item_category,
    ctx.item_category2,
    ctx.item_category3,
    ctx.item_category4,
  ].some((s) => s.length > 0);
  if (!hasListContext) return items;
  return items.map((item) => ({
    ...item,
    item_category: ctx.item_category,
    item_category2: ctx.item_category2,
    item_category3: ctx.item_category3,
    item_category4: ctx.item_category4,
  }));
}

// View Item List Event (for search results, category pages)
export const trackViewItemList = (items: GTMItem[], listName: string, listId?: string) => {
  clearEcommerce();

  const eventData: GTMEcommerceEvent = {
    event: "view_item_list",
    ecommerce: {
      item_list_id: listId || "search_results",
      item_list_name: listName,
      items: items.slice(0, 10),
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// View Item Event (for product detail pages)
export const trackViewItem = (item: GTMItem, currency: string = "EUR") => {
  clearEcommerce();

  const eventData: GTMEcommerceEvent = {
    event: "view_item",
    ecommerce: {
      currency,
      value: item.price * item.quantity,
      items: [item],
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// Add to Cart Event
export const trackAddToCart = (items: GTMItem[], currency: string = "EUR") => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "add_to_cart",
    ecommerce: {
      currency,
      value: totalValue,
      items,
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// Remove from Cart Event
export const trackRemoveFromCart = (items: GTMItem[], currency: string = "EUR") => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "remove_from_cart",
    ecommerce: {
      currency,
      value: totalValue,
      items,
    },
  };

  pushToDataLayer(eventData);
};

// View Cart Event
export const trackViewCart = (items: GTMItem[], currency: string = "EUR") => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "view_cart",
    ecommerce: {
      currency,
      value: totalValue,
      items,
    },
  };

  pushToDataLayer(eventData);
};

// Begin Checkout Event
export const trackBeginCheckout = (items: GTMItem[], currency: string = "EUR", coupon?: string) => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "begin_checkout",
    ecommerce: {
      currency,
      value: totalValue,
      coupon: coupon || undefined,
      items,
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// Add Shipping Info Event
export const trackAddShippingInfo = (
  items: GTMItem[],
  shippingTier: string,
  currency: string = "EUR",
  coupon?: string,
  billingAddress?: CustomerAddress,
  shippingAddress?: CustomerAddress,
) => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent & {
    billing?: CustomerAddress | undefined;
    shipping?: CustomerAddress | undefined;
  } = {
    event: "add_shipping_info",
    ecommerce: {
      currency,
      value: totalValue,
      coupon: coupon || undefined,
      items,
      shipping_tier: shippingTier,
    },
    billing: billingAddress || undefined,
    shipping: shippingAddress || undefined,
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// Add Payment Info Event
export const trackAddPaymentInfo = (
  items: GTMItem[],
  paymentType: string,
  currency: string = "EUR",
  coupon?: string,
) => {
  clearEcommerce();

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "add_payment_info",
    ecommerce: {
      currency,
      value: totalValue,
      coupon: coupon || undefined,
      items,
      payment_type: paymentType,
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// Purchase Event
export const trackPurchase = (
  transactionId: string,
  items: GTMItem[],
  currency: string = "EUR",
  value?: number,
  tax?: number,
  shipping?: number,
  coupon?: string,
  affiliation?: string,
) => {
  clearEcommerce();

  const calculatedValue = value || items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const eventData: GTMEcommerceEvent = {
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId,
      value: calculatedValue,
      tax: tax ?? undefined,
      shipping: shipping ?? undefined,
      currency,
      coupon: coupon || undefined,
      affiliation: affiliation || getCurrentStoreDisplayName(),
      items,
    },
  };

  // Always push to dataLayer - let GTM handle consent
  pushToDataLayer(eventData);
};

// VIN form success event (support ticket created successfully)
export const trackVinFormSuccess = () => {
  pushToDataLayer({
    event: "vin_form_success",
  });
};

export type VinVerificationCustomerType = "guest" | "logged_in";

export type TrackPdpVinVerificationParams = {
  productId: string;
  vinVerificationResult: VinMatchStatus;
  customerType: VinVerificationCustomerType;
  locale?: string | null | undefined;
};

/** Resolve locale for GA4 (URL segment preferred, then localStorage, then default). */
export function getGtmLocale(localeFromUrl?: string | null): string {
  if (localeFromUrl?.trim()) return localeFromUrl.trim();
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("locale");
      if (stored?.trim()) return stored.trim();
    } catch {
      // ignore quota / privacy mode
    }
  }
  return "en-BE";
}

/** PDP VIN compatibility check completed — push GA4 event to dataLayer. */
export const trackPdpVinVerification = ({
  productId,
  vinVerificationResult,
  customerType,
  locale,
}: TrackPdpVinVerificationParams) => {
  const trimmedProductId = productId.trim();
  if (!trimmedProductId) return;

  pushToDataLayer({
    event: "vin_verification",
    vin_verification_result: vinVerificationResult,
    product_id: trimmedProductId,
    customer_type: customerType,
    store: CURRENT_STORE,
    locale: getGtmLocale(locale),
  });
};

// Checkout legacy hook — unchanged (fires vin_form_success on Verify click).
export const trackVinVerification = () => {
  trackVinFormSuccess();
};

// Support form success event (support request submitted successfully)
export const trackSupportFormSuccess = () => {
  pushToDataLayer({
    event: "support_form_success",
  });
};

// Product Not Found form success event (request submitted successfully)
export const trackProductNotFoundFormSuccess = () => {
  pushToDataLayer({
    event: "product_not_found_form_success",
  });
};

// Helper function to convert product data to GTM item format
export const convertProductToGTMItem = (
  product: GTMProductSource,
  quantity: number = 1,
  index?: number,
  /** When set, overrides cart-stored / resolved taxonomy for this conversion only. */
  itemCategoryContext?: ViewItemListCategoryContext,
): GTMItem => {
  const fromCart = product.itemCategoryContext;
  const taxonomy =
    itemCategoryContext !== undefined
      ? itemCategoryContext
      : fromCart !== undefined
        ? fromCart
        : resolveCategoryTaxonomy(product);

  const gtmItem = {
    item_id: product.id || product.partid || "",
    item_name: product.title || product.partname || product.name || "",
    item_brand: sanitizeBrandName(product),
    item_category: taxonomy.item_category,
    item_category2: taxonomy.item_category2,
    item_category3: taxonomy.item_category3,
    item_category4: taxonomy.item_category4,
    price: parseFloat((product.priceInclVat || product.price || product.pricecomp || 0).toString()),
    quantity,
    currency: "EUR",
    index: index ?? undefined,
  };

  return gtmItem;
};

// Helper function to convert cart items to GTM items
export const convertCartItemsToGTMItems = (cartItems: GTMProductSource[]): GTMItem[] => {
  const gtmItems = (cartItems || [])?.map((item, index) =>
    convertProductToGTMItem(item, item.quantity, index),
  );
  return gtmItems;
};
