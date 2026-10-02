"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErrorTemplate } from "@/components/og-components/ErrorTemplate";
import HeaderRow from "./landing/header-row";
import FooterLanding from "./landing/footer";
import { useBranding } from "@/contexts/BrandingContext";
import notFoundImg from "@/assets/screen_search_desktop.svg"; // Reusing 404 image as per plan
import { resolveErrorPageHomePath } from "@/utils/localeCookie";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";

export default function ForbiddenClient() {
  const router = useRouter();
  const pathname = usePathname();
  // Using BrandingContext for localization if available, otherwise falling back
  const { getLabel } = useBranding();

  const handleBackToHome = () => {
    try {
      // Never localStorage.clear() — that wiped auth-store + guest e2e_saved_car_meta.
      const storeLocale = useLandingPageDataStore.getState().locale;
      router.push(
        resolveErrorPageHomePath({
          pathname,
          preferredLocale: storeLocale,
        }),
      );
    } catch (error) {
      console.error("forbidden-client error", error);
      window.location.href = resolveErrorPageHomePath({ pathname });
    }
  };

  return (
    <>
      <HeaderRow />
      <ErrorTemplate
        title={getLabel("403_page_title") || "Access Denied"}
        description={
          getLabel("403_page_description") || "You do not have permission to access this page."
        }
        buttonLabel={getLabel("403_page_backToHome") || "Back to Home"}
        imageSrc={notFoundImg}
        onButtonClick={handleBackToHome}
      />
      <FooterLanding />
    </>
  );
}
