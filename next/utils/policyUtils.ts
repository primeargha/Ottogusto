import { type StoreId, CURRENT_STORE, STORE_IDS, isValidStoreId } from "@/config/store-constants";

export type PolicyType = "privacy" | "terms" | "shipping" | "returns" | "cookies";

export interface PolicyDocument {
  type: PolicyType;
  name: string;
  folderName: string;
  displayName: string;
}

const STORE_PDF_SUFFIX: Record<StoreId, string> = {
  [STORE_IDS.OTTOGUSTO]: "OG",
  [STORE_IDS.QVERDE]: "QV",
};

/**
 * Base policy config (no store suffix); name/folderName are derived as baseName + suffix
 */
const POLICY_BASE: Record<PolicyType, { type: PolicyType; baseName: string; displayName: string }> =
  {
    privacy: {
      type: "privacy",
      baseName: "PrivacyPolicy",
      displayName: "Privacy Policy",
    },
    terms: {
      type: "terms",
      baseName: "TermsConditions",
      displayName: "Terms & Conditions",
    },
    shipping: {
      type: "shipping",
      baseName: "ShippingPolicy",
      displayName: "Shipping Policy",
    },
    returns: {
      type: "returns",
      baseName: "ReturnPolicy",
      displayName: "Return Policy",
    },
    cookies: {
      type: "cookies",
      baseName: "CookiePolicy",
      displayName: "Cookie Policy",
    },
  };

/**
 * Get policy documents for a store; name and folderName use store suffix (OG or QV).
 */
export function getPolicyDocuments(store?: StoreId): Record<PolicyType, PolicyDocument> {
  const storeId = store ?? CURRENT_STORE;
  const suffix =
    storeId && isValidStoreId(storeId)
      ? STORE_PDF_SUFFIX[storeId]
      : STORE_PDF_SUFFIX[STORE_IDS.OTTOGUSTO];

  const result = {} as Record<PolicyType, PolicyDocument>;
  for (const type of Object.keys(POLICY_BASE) as PolicyType[]) {
    const base = POLICY_BASE[type];
    const name = base.baseName + suffix;
    result[type] = {
      type: base.type,
      name,
      folderName: name,
      displayName: base.displayName,
    };
  }
  return result;
}

/**
 *  Current-store policy documents (used by path builders and display helpers)
 */
export const POLICY_DOCUMENTS: Record<PolicyType, PolicyDocument> = getPolicyDocuments();

export const SUPPORTED_LANGUAGES = ["EN", "FR", "NL", "DE"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const POLICY_LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  EN: "English",
  FR: "Français",
  NL: "Nederlands",
  DE: "Deutsch",
};

/** Policies without a PDF for specific languages (client has not provided the file). */
const POLICY_UNAVAILABLE_BY_LANGUAGE: Partial<Record<PolicyType, readonly SupportedLanguage[]>> = {
  shipping: ["DE"],
};

export const mapLocaleToLanguage = (locale: string): SupportedLanguage => {
  const normalizedLocale = locale.toUpperCase();

  if (
    normalizedLocale.includes("EN") ||
    normalizedLocale.includes("GB") ||
    normalizedLocale.includes("US")
  ) {
    return "EN";
  }
  if (normalizedLocale.includes("FR")) {
    return "FR";
  }
  if (normalizedLocale.includes("DE")) {
    return "DE";
  }
  if (normalizedLocale.includes("NL") || normalizedLocale.includes("BE")) {
    return "NL";
  }

  return "EN";
};

export const getPolicyPdfPath = (policyType: PolicyType, language: SupportedLanguage): string => {
  const policy = POLICY_DOCUMENTS[policyType];
  return `/pdfs/${policy.folderName}/${policy.name}_${language}.pdf`;
};

export const getPolicyPdfPathByLocale = (policyType: PolicyType, locale: string): string => {
  const language = mapLocaleToLanguage(locale);
  return getPolicyPdfPath(policyType, language);
};

export const isPolicyAvailable = (policyType: PolicyType, language: SupportedLanguage): boolean => {
  if (!SUPPORTED_LANGUAGES.includes(language) || !(policyType in POLICY_DOCUMENTS)) {
    return false;
  }
  const unavailable = POLICY_UNAVAILABLE_BY_LANGUAGE[policyType];
  return !unavailable?.includes(language);
};

export const getAllPolicyTypes = (): PolicyType[] => {
  return Object.keys(POLICY_DOCUMENTS) as PolicyType[];
};

export const getPolicyDisplayName = (policyType: PolicyType): string => {
  return POLICY_DOCUMENTS[policyType]?.displayName || policyType;
};
