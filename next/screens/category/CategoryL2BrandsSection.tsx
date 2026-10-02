"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { OGFeatureMakes } from "@/components/og-components/OGFeatureMakes";
import { useBranding } from "@/contexts/BrandingContext";
import { formatTitle } from "@/helpers/UtilityHelper";

interface CategoryL2BrandsSectionProps {
  l2Title: string;
  l2CategoryId: string;
}

export default function CategoryL2BrandsSection({
  l2Title,
  l2CategoryId,
}: CategoryL2BrandsSectionProps) {
  const { getLabel, getLocale } = useBranding();
  return (
    <Box className="flex flex-col gap-stack section-standard">
      <Box className="h-[1px] w-full bg-color-border-default" />
      <Box className="flex w-full flex-col gap-space-md">
        <Box className="flex flex-col gap-space-xs">
          <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
            {formatTitle(l2Title, getLocale() as any)} {getLabel("Category_Page_topcarbrands")}
          </Typography>
          <Typography className="text-color-text-muted typography-body-02">
            {getLabel("select_your_manufacturer")}
          </Typography>
        </Box>
        <OGFeatureMakes
          viewAllBrands
          showAll={false}
          limit={8}
          hideHeader
          hideTopDivider
          categoryId={l2CategoryId}
          brandLabelType="p"
        />
      </Box>
    </Box>
  );
}
