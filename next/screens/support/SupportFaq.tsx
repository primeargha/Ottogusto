import React from "react";

import { Box } from "@/components/ui/box";
import FaqSection from "../landing/faq";

export default function SupportFaq({ isSupportPage }: { isSupportPage: boolean }) {
  return (
    <Box className="w-full">
      <FaqSection isSupportPage={isSupportPage} />
    </Box>
  );
}
