"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";

interface CompactFooterPoliciesProps {
  className?: string;
  linkClassName?: string;
  orientation?: "horizontal" | "vertical";
  showSeparator?: boolean;
}

export default function CompactFooterPolicies({
  className = "",
  linkClassName = "body-regular-sm text-white no-underline",
  orientation = "vertical",
  showSeparator = false,
}: CompactFooterPoliciesProps) {
  const { getLabel } = useBranding();
  const params = useParams();
  const containerClass =
    orientation === "horizontal"
      ? `flex flex-wrap items-center gap-4 ${className}`
      : `flex flex-col gap-3 ${className}`;

  const Separator = () =>
    showSeparator && orientation === "horizontal" ? <span className="text-white/50">|</span> : null;

  return (
    <Box className={containerClass}>
      <SimplePolicyLink policyType="privacy" className={linkClassName}>
        {getLabel("privacy_policy")}
      </SimplePolicyLink>

      <Separator />

      <SimplePolicyLink policyType="terms" className={linkClassName}>
        {getLabel("terms_n_conditions_head")}
      </SimplePolicyLink>

      <Separator />

      <SimplePolicyLink policyType="shipping" className={linkClassName}>
        {getLabel("shipping_policy")}
      </SimplePolicyLink>

      <Separator />

      <Link href={getRouteLocaleString(Routes.returnPolicy, params)} className={linkClassName}>
        {getLabel("return_policy")}
      </Link>

      <Separator />

      <SimplePolicyLink policyType="cookies" className={linkClassName}>
        {getLabel("cookie_policy")}
      </SimplePolicyLink>
    </Box>
  );
}

// Preset configurations for common use cases
export function FooterPoliciesVertical(props: Omit<CompactFooterPoliciesProps, "orientation">) {
  return <CompactFooterPolicies {...props} orientation="vertical" />;
}

export function FooterPoliciesHorizontal(props: Omit<CompactFooterPoliciesProps, "orientation">) {
  return <CompactFooterPolicies {...props} orientation="horizontal" showSeparator={true} />;
}
