"use client";

import React from "react";
import { useBranding } from "@/contexts/BrandingContext";
import {
  PolicyType,
  getPolicyPdfPathByLocale,
  getPolicyDisplayName,
  mapLocaleToLanguage,
  isPolicyAvailable,
} from "@/utils/policyUtils";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

interface PolicyLinkProps {
  policyType: PolicyType;
  className?: string;
  showDownloadButton?: boolean;
  variant?: "link" | "button" | "both";
  children?: React.ReactNode;
}

export default function PolicyLink({
  policyType,
  className = "",
  showDownloadButton = true,
  variant = "both",
  children,
}: PolicyLinkProps) {
  const { getLocale } = useBranding();
  const locale = getLocale();
  const language = mapLocaleToLanguage(locale);
  const pdfPath = getPolicyPdfPathByLocale(policyType, locale);
  const displayName = getPolicyDisplayName(policyType);
  const isAvailable = isPolicyAvailable(policyType, language);

  const handleViewPdf = () => {
    if (isAvailable) {
      window.open(pdfPath, "_blank");
    }
  };

  const handleDownloadPdf = () => {
    if (isAvailable) {
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = `${displayName.replace(/\s+/g, "_")}_${language}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isAvailable) {
    return (
      <Text className={`text-gray-400 ${className}`}>
        {displayName} (Not available in {language})
      </Text>
    );
  }

  if (variant === "link") {
    return (
      <Text
        className={`cursor-pointer text-blue-600 underline hover:text-blue-800 ${className}`}
        // @ts-ignore
        onClick={handleViewPdf}
      >
        {children || displayName}
      </Text>
    );
  }

  if (variant === "button") {
    return (
      // @ts-ignore
      <Button className={className} onClick={handleViewPdf}>
        {children || `View ${displayName}`}
      </Button>
    );
  }

  // variant === 'both'
  return (
    <Box className={`flex flex-col items-start gap-2 sm:flex-row sm:items-center ${className}`}>
      <Text
        className="cursor-pointer text-blue-600 underline hover:text-blue-800"
        // @ts-ignore
        onClick={handleViewPdf}
      >
        {children || displayName}
      </Text>
      {showDownloadButton && (
        // @ts-ignore
        <Button size="sm" variant="outline" onClick={handleDownloadPdf} className="text-sm">
          Download PDF
        </Button>
      )}
    </Box>
  );
}

// Individual policy components for convenience
export const PrivacyPolicyLink = (props: Omit<PolicyLinkProps, "policyType">) => (
  <PolicyLink policyType="privacy" {...props} />
);

export const TermsConditionsLink = (props: Omit<PolicyLinkProps, "policyType">) => (
  <PolicyLink policyType="terms" {...props} />
);

export const ShippingPolicyLink = (props: Omit<PolicyLinkProps, "policyType">) => (
  <PolicyLink policyType="shipping" {...props} />
);

export const ReturnPolicyLink = (props: Omit<PolicyLinkProps, "policyType">) => (
  <PolicyLink policyType="returns" {...props} />
);

export const CookiePolicyLink = (props: Omit<PolicyLinkProps, "policyType">) => (
  <PolicyLink policyType="cookies" {...props} />
);
