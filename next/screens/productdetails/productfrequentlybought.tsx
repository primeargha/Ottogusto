"use client";
import React, { useRef } from "react";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";
import OGRecentCard from "./OGRecentCard";
import { CartItem } from "@/stores/useCartStore";

// Static data of length 10
const staticProducts = Array.from({ length: 10 });

const Productfrequentlybought = ({ products }: { products: CartItem[] }) => {
  const { getLabel } = useBranding();

  return (
    <Box className="flex h-auto w-full flex-col gap-space-md">
      {/* Title */}

      <Box className="flex w-full flex-col gap-space-xs">
        <Typography className="text-color-text-emphasis typography-heading-03">
          {getLabel("recently_viewed")}
        </Typography>
        <Typography className="text-color-text-muted typography-body-02">
          {getLabel("recently_viewed_subtitle")}
        </Typography>
      </Box>

      {/* for mobiles carousal */}
      <Box className="relative w-full overflow-x-auto base:flex gtsm:flex gtlg:hidden">
        <Box className="flex h-auto snap-x snap-mandatory flex-row scroll-smooth grid-gap-listing [&::-webkit-scrollbar]:hidden">
          {products?.map((product: CartItem) => (
            <Box
              key={product.id}
              className="h-auto flex-shrink-0 cursor-pointer snap-start rounded-[8px] border border-color-border-default transition-all"
            >
              <OGRecentCard product={product} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Static cards (max 4) for gtsm and desktops */}
      <Box className="w-full bg-transparent base:hidden gtsm:hidden gtlg:flex">
        <Box className="grid w-full grid-cols-4 gap-6">
          {products?.slice(0, 4)?.map((product: CartItem) => (
            <Box
              key={product.id}
              className="h-auto cursor-pointer rounded-[8px] border border-color-border-default transition-all"
            >
              <OGRecentCard product={product} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Productfrequentlybought;
