"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import {
  PrivacyPolicyLink,
  TermsConditionsLink,
  ShippingPolicyLink,
  ReturnPolicyLink,
  CookiePolicyLink,
} from "@/components/PolicyLink";
import { useBranding } from "@/contexts/BrandingContext";
import { mapLocaleToLanguage } from "@/utils/policyUtils";

interface PolicySectionProps {
  title?: string;
  className?: string;
  variant?: "link" | "button" | "both";
  showTitle?: boolean;
  showLanguageIndicator?: boolean;
}

export default function PolicySection({
  title = "Legal Documents",
  className = "",
  variant = "both",
  showTitle = true,
  showLanguageIndicator = true,
}: PolicySectionProps) {
  const { getLocale } = useBranding();
  const locale = getLocale();
  const language = mapLocaleToLanguage(locale);

  return (
    <Box className={`rounded-lg border bg-white p-6 shadow-sm ${className}`}>
      {showTitle && (
        <>
          <Box className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <Text className="text-xl font-semibold text-gray-800">{title}</Text>
            {showLanguageIndicator && (
              <Text className="mt-1 text-sm text-gray-500 sm:mt-0">Language: {language}</Text>
            )}
          </Box>
          <Divider className="mb-6" />
        </>
      )}

      <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Box className="space-y-3">
          <Box>
            <Text className="mb-2 text-sm font-medium text-gray-600">Privacy & Terms</Text>
            <Box className="space-y-2">
              <PrivacyPolicyLink variant={variant} />
              <TermsConditionsLink variant={variant} />
            </Box>
          </Box>
        </Box>

        <Box className="space-y-3">
          <Box>
            <Text className="mb-2 text-sm font-medium text-gray-600">Policies</Text>
            <Box className="space-y-2">
              <ShippingPolicyLink variant={variant} />
              <ReturnPolicyLink variant={variant} />
              <CookiePolicyLink variant={variant} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider className="my-4" />

      <Text className="text-center text-xs text-gray-400">
        Documents are available in multiple languages and will be displayed based on your selected
        language.
      </Text>
    </Box>
  );
}

// Compact version for footer or smaller spaces
export function CompactPolicySection() {
  return (
    <Box className="flex flex-wrap justify-center gap-4 text-sm">
      <PrivacyPolicyLink variant="link" />
      <TermsConditionsLink variant="link" />
      <ShippingPolicyLink variant="link" />
      <ReturnPolicyLink variant="link" />
      <CookiePolicyLink variant="link" />
    </Box>
  );
}
