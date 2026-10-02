"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";

export default function DesignSystemPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Check if user is accessing from production URL
    const isProductionUrl =
      window.location.hostname === "ottogusto.com" && !window.location.hostname?.includes("dev");

    if (isProductionUrl) {
      const route = getRouteLocaleString(Routes.pitStop, params);
      router.push(route);
    } else {
      // Redirect to the default Ottogusto design system page for dev/staging
      const defaultRoute = (locale: string) => `/${locale}/design-system/og/`;
      const route = getRouteLocaleString(defaultRoute, params);
      router.replace(route);
    }
  }, [router, params]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-color-text-body typography-heading-02">Redirecting...</div>
        <div className="text-color-text-placeholder typography-body-02">
          Please wait while we redirect you to the appropriate page.
        </div>
      </div>
    </div>
  );
}
