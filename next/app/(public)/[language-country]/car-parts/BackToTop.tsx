import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import React from "react";

export function BackToTop() {
  const { getLabel } = useBranding();
  const handleBackToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Box
      onClick={handleBackToTop}
      className="flex h-auto w-full cursor-pointer items-center justify-center bg-color-background-disabled py-4"
    >
      <Typography className="text-color-text-default button-button-01">
        {getLabel("back_to_top")}
      </Typography>
    </Box>
  );
}
