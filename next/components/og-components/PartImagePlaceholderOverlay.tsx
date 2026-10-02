"use client";

import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";

type PartImagePlaceholderOverlayProps = {
  className?: string;
  compact?: boolean;
};

export function PartImagePlaceholderOverlay({
  className = "",
  compact = false,
}: PartImagePlaceholderOverlayProps) {
  const { getLabel } = useBranding();

  return (
    <Box
      className={`pointer-events-none absolute left-1/2 top-1/2 w-auto -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] rounded-[4px] border border-color-text-muted text-center font-Overpass font-bold text-color-text-muted opacity-70 ${
        compact
          ? "px-1 py-0.5 text-[8px] leading-tight"
          : "inline-flex flex-nowrap whitespace-nowrap px-space-sm py-space-xs text-xs"
      } ${className}`}
    >
      {getLabel("product_noImage_Available")}
    </Box>
  );
}
