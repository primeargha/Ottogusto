"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { usePolicyDocuments } from "@/hooks/usePolicyDocuments";
import {
  PolicyType,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  POLICY_LANGUAGE_LABELS,
  getPolicyPdfPath,
} from "@/utils/policyUtils";

interface PolicyViewerProps {
  policyType: PolicyType;
  className?: string;
  showLanguageSelector?: boolean;
}

export default function PolicyViewer({
  policyType,
  className = "",
  showLanguageSelector = false,
}: PolicyViewerProps) {
  const { getPolicy, downloadPolicy, viewPolicy, currentLanguage } = usePolicyDocuments();

  const policy = getPolicy(policyType);

  if (!policy) {
    return <Text className="text-gray-400">Policy not available</Text>;
  }

  const handleViewInNewTab = () => {
    viewPolicy(policyType);
  };

  const handleDownload = () => {
    downloadPolicy(policyType);
  };

  const handleViewLanguage = (language: SupportedLanguage) => {
    const pdfPath = getPolicyPdfPath(policyType, language);
    window.open(pdfPath, "_blank");
  };

  return (
    <Box className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <Box className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Text className="text-lg font-semibold text-gray-800">{policy.displayName}</Text>
        <Text className="mt-1 text-sm text-gray-500 sm:mt-0">Current: {currentLanguage}</Text>
      </Box>

      <Box className="space-y-3">
        <Box className="flex flex-wrap gap-2">
          {/* @ts-ignore */}
          <Button onClick={handleViewInNewTab} className="flex-1 sm:flex-none">
            View PDF
          </Button>
          {/* @ts-ignore */}
          <Button variant="outline" onClick={handleDownload} className="flex-1 sm:flex-none">
            Download PDF
          </Button>
        </Box>

        {showLanguageSelector && (
          <Box>
            <Text className="mb-2 text-sm font-medium text-gray-600">View in other languages:</Text>
            <Box className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES?.map((lang) => (
                <Button
                  key={lang}
                  size="sm"
                  // @ts-ignore
                  variant={lang === currentLanguage ? "default" : "outline"}
                  onClick={() => handleViewLanguage(lang)}
                  className="text-xs"
                >
                  {POLICY_LANGUAGE_LABELS[lang]}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Simple policy link that opens in new tab
export function SimplePolicyLink({
  policyType,
  children,
  className = "",
}: {
  policyType: PolicyType;
  children?: React.ReactNode;
  className?: string;
}) {
  const { getPolicy, viewPolicy } = usePolicyDocuments();
  const policy = getPolicy(policyType);

  if (!policy?.isAvailable) {
    return null;
  }

  // Use provided className if given, otherwise use minimal default styling
  const finalClassName = className
    ? `cursor-pointer ${className}`
    : "cursor-pointer text-blue-600 underline hover:text-blue-800";

  return (
    // @ts-ignore
    <Text className={finalClassName} onClick={() => viewPolicy(policyType)}>
      {children || policy.displayName}
    </Text>
  );
}

// Hook for managing multiple policy viewers
export function usePolicyViewer() {
  const { viewPolicy, downloadPolicy } = usePolicyDocuments();

  const openPolicy = (policyType: PolicyType) => {
    viewPolicy(policyType);
  };

  const downloadPolicyDocument = (policyType: PolicyType) => {
    downloadPolicy(policyType);
  };

  return {
    openPolicy,
    downloadPolicyDocument,
  };
}
