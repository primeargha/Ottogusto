"use client";

import { usePathname } from "next/navigation";
import { Box } from "./ui/box";

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAllBrandsPage = pathname?.includes("/allbrands") || false;

  return <Box className={isAllBrandsPage ? "bg-color-background-default" : ""}>{children}</Box>;
}
