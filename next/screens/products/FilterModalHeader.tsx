import React from "react";

import { Box } from "@/components/ui/box";
import CancelSquare from "@/assets/search/cancel-square.svg";
import Image from "next/image";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";

export default function FilterModalHeader({ onClose }: { onClose: () => void }) {
  const { getLabel } = useBranding();
  return (
    <Box className="flex flex-row items-center justify-between border-b base:px-[24px] base:pb-[12px] base:pt-[24px]">
      <Box className="flex flex-row items-center gap-[12px]">
        <Typography type="h2" className="text-color-text-body">
          {getLabel("header_category")}
        </Typography>
      </Box>

      {/* Tablet */}
      <button onClick={onClose} className="hidden p-1 gtsm:block">
        <Image src={CancelSquare} alt="Cancel" height={48} width={48} />
      </button>

      {/* Mobile View */}
      <button onClick={onClose} className="block p-1 gtsm:hidden">
        <Image src={CancelSquare} alt="Cancel" height={30} width={30} />
      </button>
    </Box>
  );
}
