import { useMemo } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import {
  PolicyType,
  SupportedLanguage,
  getPolicyPdfPathByLocale,
  getPolicyDisplayName,
  mapLocaleToLanguage,
  isPolicyAvailable,
  getAllPolicyTypes,
  POLICY_DOCUMENTS,
} from "@/utils/policyUtils";

export interface PolicyDocument {
  type: PolicyType;
  displayName: string;
  pdfPath: string;
  isAvailable: boolean;
  language: SupportedLanguage;
  locale: string;
}

export interface UsePolicyDocumentsReturn {
  policies: PolicyDocument[];
  currentLanguage: SupportedLanguage;
  currentLocale: string;
  getPolicy: (type: PolicyType) => PolicyDocument | undefined;
  downloadPolicy: (type: PolicyType) => void;
  viewPolicy: (type: PolicyType) => void;
  isLanguageSupported: boolean;
}

export function usePolicyDocuments(): UsePolicyDocumentsReturn {
  const { getLocale } = useBranding();
  const locale = getLocale();
  const language = mapLocaleToLanguage(locale);

  const policies = useMemo(() => {
    return getAllPolicyTypes()?.map(
      (type): PolicyDocument => ({
        type,
        displayName: getPolicyDisplayName(type),
        pdfPath: getPolicyPdfPathByLocale(type, locale),
        isAvailable: isPolicyAvailable(type, language),
        language,
        locale,
      }),
    );
  }, [locale, language]);

  const getPolicy = (type: PolicyType): PolicyDocument | undefined => {
    return policies.find((policy) => policy.type === type);
  };

  const downloadPolicy = (type: PolicyType) => {
    const policy = getPolicy(type);
    if (policy && policy.isAvailable) {
      const link = document.createElement("a");
      link.href = policy.pdfPath;
      link.download = `${policy.displayName.replace(/\s+/g, "_")}_${policy.language}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const viewPolicy = (type: PolicyType) => {
    const policy = getPolicy(type);
    if (policy && policy.isAvailable) {
      window.open(policy.pdfPath, "_blank");
    }
  };

  const isLanguageSupported = language !== "EN" || locale.toUpperCase().includes("EN");

  return {
    policies,
    currentLanguage: language,
    currentLocale: locale,
    getPolicy,
    downloadPolicy,
    viewPolicy,
    isLanguageSupported,
  };
}
