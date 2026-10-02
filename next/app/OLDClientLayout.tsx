"use client";
import { AUTH_0 } from "@/config/app";
import React, { useEffect, useState } from "react";
import StyledJsxRegistry from "./registry";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Auth0Provider } from "@auth0/auth0-react";
import Provider from "@/providers";
import useRouter from "@unitools/router";
import { usePathname } from "next/navigation";
import MarketingConsentModal from "./MarketingConsentModal";

// PERF: Lazy-load modals — they are only shown on user interaction, not needed in initial bundle
import dynamic from "next/dynamic";
import CartSessionHydrator from "@/components/CartSessionHydrator";
import PostLogoutLocaleGate from "@/components/PostLogoutLocaleGate";
import { ensureClientIp } from "@/lib/clientIp";
const SearchModal = dynamic(
  () => import("@/screens/search/search-modal").then((m) => m.SearchModal),
  { ssr: false },
);
const AdvancedSearchModal = dynamic(
  () => import("@/screens/advanced-search/adv-search-modal").then((m) => m.AdvancedSearchModal),
  { ssr: false },
);
const OgSearchModal = dynamic(
  () => import("@/screens/og-search/OgSearchModal").then((m) => m.OgSearchModal),
  { ssr: false },
);
const EditAddressModal = dynamic(
  () => import("@/screens/profile/EditAddressModal").then((m) => m.EditAddressModal),
  { ssr: false },
);
const FilterModal = dynamic(() => import("@/screens/products/FilterModal"), { ssr: false });
const OERefNumber = dynamic(() => import("@/screens/oe-search/oe-ref-number"), { ssr: false });
const OGLanguageSelectionModel = dynamic(
  () => import("@/components/og-components/OGLanguageSelectionModel"),
  { ssr: false },
);
const OGConfirmation = dynamic(
  () => import("@/components/og-components/OGConfirmation").then((m) => m.OGConfirmation),
  { ssr: false },
);

type Props = {
  children: React.ReactNode;
  // ✅ Optional - won't break existing usage
  initialTranslations?: any;
  initialLang?: string;
};

const OLDClientLayout = (props: Props) => {
  const { children, initialTranslations, initialLang } = props;
  const router = useRouter();
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  // const params = useParams()
  const RESTRICTED_ROUTES = ["shoppingcart", "checkout", "payment", "order-confirmation"];

  // PERF: Initialize with AUTH_0.REDIRECT_URI so children render during SSR.
  // Previously null → {origin && (...)} blocked ALL server-side rendering of page content.
  const [origin, setOrigin] = useState<string>(AUTH_0.REDIRECT_URI || "");
  // const useIsRestrictedRoute = () => {
  //   const lastSegment = pathname?.split("/").filter(Boolean).at(-1);
  //   return RESTRICTED_ROUTES.includes(lastSegment ?? "");
  // };
  // const isRestricted = useIsRestrictedRoute();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem("locale") && pathname === "/") {
      router.push(`/${localStorage.getItem("locale")}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    void ensureClientIp();
  }, []);

  return (
    <Provider>
      <PostLogoutLocaleGate>
        <StyledJsxRegistry
          initialTranslations={initialTranslations}
          initialLang={initialLang || "en"}
        >
          <GluestackUIProvider mode="light">
            {origin && (
              <Auth0Provider
                key={origin}
                domain={AUTH_0.DOMAIN || ""}
                clientId={AUTH_0.CLIENT_ID || ""}
                skipRedirectCallback
                cacheLocation="localstorage"
                useRefreshTokens={true}
                authorizationParams={{
                  redirect_uri: `${origin}`,
                  scope: `openid profile email offline_access`,
                }}
              >
                <>
                  <CartSessionHydrator />
                  {children}
                  <SearchModal />
                  <AdvancedSearchModal />
                  <OgSearchModal onModalClose={() => {}} />
                  <EditAddressModal />
                  <FilterModal />
                  <OERefNumber style={{ width: "1024px", height: "136px" }} />
                  <MarketingConsentModal />
                  <OGLanguageSelectionModel />
                  <OGConfirmation />
                </>
              </Auth0Provider>
            )}
          </GluestackUIProvider>
        </StyledJsxRegistry>
      </PostLogoutLocaleGate>
    </Provider>
  );
};

export default OLDClientLayout;
