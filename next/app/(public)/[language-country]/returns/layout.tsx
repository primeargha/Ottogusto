import { Suspense } from "react";

import { Box } from "@/components/ui/box";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";

const HeaderRowWithNoSSR = dynamic(() => import("@/screens/landing/header-row"), {
  ssr: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto",
  keywords: "",
  description: "",
};

export default function RefundDetailsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box className={`flex min-h-screen w-full flex-col`}>
      {/* <Suspense fallback={<Box className="h-[75px]">Loading...</Box>}>
        <HeaderRowWithNoSSR />
      </Suspense> */}

      {children}
    </Box>
  );
}
