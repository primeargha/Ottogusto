"use client";

import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import GreenCircleTick from "@/screens/productdetails/GreenCircleTick";
import type { VinCheckUiCase } from "@/utils/vinCheck";
import VinNotFitIcon from "@/screens/shoppingcart/checkout/components/VinNotFitIcon";

interface PdpVinCheckResultBoxesProps {
  uiCase: VinCheckUiCase | null;
  getLabel: (key: string) => string;
}

export function PdpVinCheckResultBoxes({ uiCase, getLabel }: PdpVinCheckResultBoxesProps) {
  if (!uiCase || uiCase === 4) return null;

  if (uiCase === 3) {
    return (
      <Box className="flex w-full flex-row items-center gap-space-sm rounded-[4px] border border-color-border-positive bg-color-background-positive-muted p-space-md">
        <GreenCircleTick className="h-5 w-5 flex-shrink-0 text-color-icon-positive" />
        <Typography className="text-color-border-positive typography-body-strong-02">
          {getLabel("pdp_vin_compatibility_part_compatible")}
        </Typography>
      </Box>
    );
  }

  if (uiCase === 5 || uiCase === 6) {
    return (
      <Box className="flex w-full flex-row items-center gap-space-xs rounded-[4px] border border-color-border-danger bg-color-background-danger-muted p-space-md">
        <VinNotFitIcon className="ml-2 mt-1 h-6 w-6 flex-shrink-0 text-color-icon-danger" />
        <Typography className="mt-0.5 text-color-text-danger typography-body-strong-02">
          {getLabel("pdp_vin_compatibility_part_not_compatible")}
        </Typography>
      </Box>
    );
  }

  return null;
}
