"use client";

import React from "react";
import { ErrorTemplate } from "./ErrorTemplate";
import { Box } from "../ui/box";
import { useBranding } from "@/contexts/BrandingContext";

export function DefaultErrorFallback() {
  const { getLabel } = useBranding();

  return (
    <Box className="flex w-full flex-col">
      <ErrorTemplate
        title={getLabel("error_page_title") || "Something went wrong!"}
        description={getLabel("we_are_looking_to_fix") || "Something went wrong!"}
        buttonLabel={getLabel("error_page_retry") || "Go to Home"}
        onButtonClick={() => (window.location.href = "/")}
        imageSrc={null}
      />
    </Box>
  );
}
