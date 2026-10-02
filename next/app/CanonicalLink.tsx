"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Renders a canonical link tag based on the current pathname.
 * Works in the App Router by using `usePathname` from `next/navigation`.
 */
export default function CanonicalLink() {
  const pathname: any = usePathname() || "/";
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

  const base = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL?.replace(/\/$/, "") || "";
  const canonicalUrl = `${base}${cleanPath !== "/" ? cleanPath : ""}`;

  return <link rel="canonical" href={canonicalUrl} />;
}
