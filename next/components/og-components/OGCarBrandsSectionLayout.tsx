// components/OGLayoutXL.tsx
import React from "react";
import { Box } from "../ui/box";
import clsx from "clsx"; // optional but recommended for merging classes
import { useMedia } from "@/hooks/useMedia";

interface OGLayoutXLProps {
  children: React.ReactNode;
  className?: string;
}

export default function OGCarBrandsSectionLayout({ children, className }: OGLayoutXLProps) {
  const isMobile = useMedia("(max-width: 639px)");
  return (
    <Box className={clsx(`box-border h-auto base:py-0 gtsm:py-0 gtlg:py-0`, className)}>
      {children}
    </Box>
  );
}
