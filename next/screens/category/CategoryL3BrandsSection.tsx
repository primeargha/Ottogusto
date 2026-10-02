"use client";

import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { OGFeatureMakes } from "@/components/og-components/OGFeatureMakes";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { formatTitle } from "@/helpers/UtilityHelper";

interface CategoryL3BrandsSectionProps {
  l3Title: string;
  l3CategoryId: string;
}

export default function CategoryL3BrandsSection({
  l3Title,
  l3CategoryId,
}: CategoryL3BrandsSectionProps) {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();

  return (
    <Box className="flex flex-col gap-stack section-standard">
      {/* <Box className="h-[1px] w-full bg-color-border-default" /> */}

      <Box className="">
        <Box className="h-[1px] w-full bg-color-border-default" />
      </Box>
      {/* {!isMobile && (
      )} */}

      <Box className="flex w-full flex-col gap-space-md">
        <Box className="flex w-full flex-col gap-space-xs">
          <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
            {formatTitle(l3Title, getLocale() as any)} {getLabel("Category_Page_topcarbrands")}
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
          categoryId={l3CategoryId}
          brandLabelType="p"
        />
      </Box>
    </Box>
  );
}
