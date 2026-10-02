"use client";

import React from "react";

import BackIcon from "@/assets/search/back.svg";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";

export default function SupportHeaderSection() {
  const { getLabel } = useBranding();
  const router = useRouter();
  return (
    <Box className={`w-full gap-header-to-title`}>
      <Box className="flex flex-row items-center">
        <Typography
          type="h1"
          className="text-color-text-body section-standard typography-heading-01"
          hasBack
        >
          {getLabel("support_header_title")}
        </Typography>
      </Box>
    </Box>
  );
}
