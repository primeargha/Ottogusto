"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteChangeHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    // Log for debugging

    // Check if paths don't match
    if (window.location.pathname !== pathname) {
      // Direct window location assignment
      window.location.href = window.location.pathname;
    }
  }, [pathname]);

  return <>{children}</>;
}
