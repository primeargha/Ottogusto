"use client";
import { useRouter, usePathname } from "next/navigation";
import notFoundImg from "@/assets/screen_search_desktop.svg";
import FooterLanding from "./landing/footer";
import { useBranding } from "@/contexts/BrandingContext";
import { ErrorTemplate } from "@/components/og-components/ErrorTemplate";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { resolveErrorPageHomePath } from "@/utils/localeCookie";
import { useEffect } from "react";

// screen_search_desktop.svg

export default function NotFoundclient() {
  const router = useRouter();
  const pathname = usePathname();
  const { getLabel } = useBranding();

  useEffect(() => {
    // When this 404 is from [searchdata] (/locale/one-segment), set store so ErrorTemplate shows header.
    // Keep this in effect to avoid persist writes during SSR render.
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    const isSearchDataNotFound =
      segments.length === 2 && /^((?:key)|[a-z]{2})-[A-Z]{2}$/i.test(segments[0] ?? "");
    useLandingPageDataStore.getState().setIsSearchDataNotFound(isSearchDataNotFound);
  }, [pathname]);

  return (
    <>
      {/* <HeaderRow /> */}
      {/* OD-1720 fix*/}
      <ErrorTemplate
        title={getLabel("404_page_title")}
        description={getLabel("404_page_description")}
        buttonLabel={getLabel("404_page_backToHome")}
        imageSrc={notFoundImg}
        onButtonClick={() => {
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
            console.error("not-found-client error", error);
            window.location.href = resolveErrorPageHomePath({ pathname });
          }
        }}
      />
      <FooterLanding />
    </>
  );
}
