"use client";

import React from "react";
import { Box } from "@/components/ui/box";

/** Placeholder dropdown rows while edit flow prefills from GET /Cars/{id}. */
export default function RightSidebarCarSelectionSkeleton() {
  return (
    <Box className="flex flex-col gap-3" aria-busy aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          className="animate-pulse h-12 w-full shrink-0 rounded-md bg-color-background-emphasis"
        />
      ))}
    </Box>
  );
}
