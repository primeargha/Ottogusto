"use client";
import { Box } from "@/components/ui/box";
import React, { useEffect, useState, useRef } from "react";
import LanguageSelector from "./language-selector";
import { useBranding } from "@/contexts/BrandingContext";
import { FORCE_iPAD } from "@/config/app";
import InfoNLegalSection from "./InfoNLegalSection";
import SocialLinks from "./social-links";
import BrandsAndPartsSection from "./BrandsAndPartsSection";
import { usePathname } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import useIpadDetection from "@/hooks/useIpadDetection";
import {
  useCheckAllBrandsPage,
  useCheckForLandingPage,
  useCheckForRootLandingPage,
} from "@/hooks/appHooks";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import OGClaimtab from "@/components/og-components/OGClaimTab";
import { BackToTop } from "@/app/(public)/[language-country]/car-parts/BackToTop";
import FooterContent from "./FooterContent";
import PaymentCompanyFooter from "./PaymentCompanyFooter";
import FooterContentMobile from "./FooterContentMobile";
import { pathnameIncludesPartsRouteSegment } from "@/config/url-segments";

type Props = {};

type FooterRowAtTheEndProps = {
  noLeftNavSpace?: boolean;
  isIpad: boolean;
  getLabel: (keyname: string) => string | null | undefined;
  bottomNavPadding?: boolean;
};

const FooterRowAtTheEnd = ({
  isIpad,
  getLabel,
  noLeftNavSpace = false,
  bottomNavPadding = true,
}: FooterRowAtTheEndProps) => {
  let contanerClass = `grid grid-cols-2 ${bottomNavPadding ? "pb-0" : ""} md:grid-cols-4 ${isIpad ? "" : "lg:ml-[176px]"} ${isIpad ? "" : "lg:p-0"} px-0 md:px-14`;
  if (noLeftNavSpace) {
    contanerClass = `grid grid-cols-2 pb-24 md:grid-cols-4 ${isIpad ? "" : "lg:p-0"} px-0 md:px-14`;
  }

  return (
    <Box id="footer-row" className="m-0 bg-[--primary-colors-primary-dark] p-[24px]">
      {/* here color needs change */}
      <Box className={`${contanerClass}`}>
        <LanguageSelector />

        {/* For Tablet and Web */}
        <Box className="hidden justify-center text-center text-white body-regular-sm md:col-span-2 md:flex">
          {/* <Box className="font-[var(--font-public-sans)] hidden text-center text-[15px] font-normal leading-tight text-[--background-beige-800] md:col-span-2 md:flex"> */}
          {getLabel("footer_copyright")}
        </Box>

        {getClientFeatureFlag("social_pages_feature_flag") && <SocialLinks getLabel={getLabel} />}

        {/* For Mobile */}
        <Box className="col-span-2 justify-start pt-[24px] text-center font-Overpass text-base font-normal leading-none text-white md:hidden">
          {getLabel("footer_copyright")}
        </Box>
      </Box>
    </Box>
  );
};

// Singleton class to track footer state
class FooterManager {
  private static instance: FooterManager;
  private isMounted: boolean = false;
  private subscribers: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): FooterManager {
    if (!FooterManager.instance) {
      FooterManager.instance = new FooterManager();
    }
    return FooterManager.instance;
  }

  public registerFooter() {
    if (this.isMounted) return false;
    this.isMounted = true;
    this.notifySubscribers();
    return true;
  }

  public unregisterFooter() {
    this.isMounted = false;
    this.notifySubscribers();
  }

  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }
}

const footerManager = FooterManager.getInstance();

const FooterLanding = (props: Props) => {
  const [canRender, setCanRender] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const tillTablet = useMedia("(max-width: 1023px)");
  const isMobile = useMedia("(max-width: 719px)");
  const isProductFilterPageDesktop = useMedia("(min-width: 1200px)");
  const isIpad = useIpadDetection();
  const ifLanding = useCheckForLandingPage();
  const isLandingPage = useCheckForRootLandingPage() || ifLanding;
  const isAllBrandsPage = useCheckAllBrandsPage();
  // const [isLandingPage, setisLandingPage] = useState(false);
  const pathname = usePathname();
  // const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();
  const [openAccordions, setOpenAccordions] = React.useState<string[]>([]);
  // First-visit modal open is owned by OGLanguageSelectionModel (IP bootstrap).
  // Do not open the selector from the footer — that raced IP detection and
  // forced the modal for NL/FR/unknown users who should skip it.
  const isGarageBayPage = pathname?.includes("garage-bay");
  const isProductFilterPage = pathname?.includes("products");
  const partdetailspage = pathname?.includes("part");
  const shoppingcartpage = pathname?.includes("shoppingcart");
  const checkoutpage = pathname?.includes("checkout");
  // TRAILING SLASH FIX
  const orderDetailsPage = pathname?.includes("/order-details");
  // TRAILING SLASH FIX
  const orderReturnsPage = pathname?.includes("/orders-returns");
  // TRAILING SLASH FIX
  const profilePage = pathname?.includes("/profile");
  // TRAILING SLASH FIX
  const savedAddressesPage = pathname?.includes("/saved-addresses");
  const supportPage = pathname?.includes("support");
  const isAboutUs = pathname?.includes("about-us");
  const mobileOgSearch = pathname?.includes("/og-search/");
  const mobileNewOgSearch = pathname?.includes("/manually");
  // TRAILING SLASH FIX
  const mobileNewOgSearchVinPage = pathname?.includes("/search/vin-number");
  const mobileOGSearchPageVin_Manually =
    pathname?.includes("/search") && !pathname?.includes("/search-results");
  const isCategorySelection = pathnameIncludesPartsRouteSegment(pathname);

  // OD-1265
  // if (isCategorySelection) {
  //   return null;
  // }

  // if (isMobile && mobileOGSearchPageVin_Manually) {
  //   return null;
  // }
  // if (!isMobile && mobileOGSearchPageVin_Manually) {
  //   return null;
  // }

  // Use effect to handle footer registration
  useEffect(() => {
    // Try to register this footer instance
    const isFirstInstance = footerManager.registerFooter();
    setCanRender(isFirstInstance);

    // Subscribe to changes in case another footer mounts/unmounts
    const unsubscribe = footerManager.subscribe(() => {
      setCanRender(footerManager === FooterManager.getInstance() && !footerManager["isMounted"]);
    });

    return () => {
      footerManager.unregisterFooter();
      unsubscribe();
    };
  }, []);

  // Don't render if this isn't the active footer instance
  if (!canRender) {
    return null;
  }

  if (isGarageBayPage && tillTablet) {
    return null;
  }

  // if (tillTablet && partdetailspage) {
  //   return null;
  // }

  if (isMobile && orderDetailsPage) {
    return null;
  }
  if (isMobile && orderReturnsPage) {
    return null;
  }
  if (isMobile && savedAddressesPage) {
    return null;
  }
  if (isMobile && profilePage) {
    return null;
  }

  if (isMobile && mobileOgSearch) {
    return null;
  }
  if (isMobile && mobileNewOgSearch) {
    return null;
  }
  if (isMobile && mobileNewOgSearchVinPage) {
    return null;
  }
  if (!isMobile && mobileNewOgSearch) {
    return null;
  }

  // if (tillTablet && checkoutpage) {
  //   return null;
  // }

  if (isProductFilterPage && !isProductFilterPageDesktop) {
    return null;
  }

  return (
    <Box
      ref={footerRef as any}
      className="flex items-center justify-center overflow-x-hidden"
      id="footer"
      data-footer-instance
    >
      {getClientFeatureFlag("footer_PopularLinks_feature_flag") &&
        getClientFeatureFlag("featured_makes_feature_flag") &&
        isAllBrandsPage && (
          <Box className={`pb-[46px] pt-[60px] base:mx-3 gtsm:mx-[36px]`}>
            <BrandsAndPartsSection />
            <Box className="my-[20px] h-[0px] border border-white opacity-30"></Box>

            <InfoNLegalSection />
          </Box>
        )}
      <Box className="flex w-full flex-col items-center justify-center">
        <Box className="flex w-full items-center justify-center border border-color-border-emphasis bg-color-background-emphasis">
          <OGClaimtab itemsCount={4} />
        </Box>
        <BackToTop />
      </Box>

      <Box
        className={`flex w-full items-center justify-center bg-color-background-emphasis ${!isMobile && "pb-space-3xl pt-space-xl"} ${isIpad || !getClientFeatureFlag("show_left_nav_flag") ? "lg:mx-[38px]" : "lg:ml-[200px]"} base:mx-3 gtsm:mx-[36px]`}
      >
        {getClientFeatureFlag("footer_PopularLinks_feature_flag") &&
          getClientFeatureFlag("featured_makes_feature_flag") &&
          isLandingPage &&
          !supportPage && (
            <>
              <BrandsAndPartsSection />
              <Box className="my-[20px] h-[0px] border border-white opacity-30" />
            </>
          )}

        {/* <InfoNLegalSection /> */}
        {isMobile ? (
          <FooterContentMobile
            openAccordions={openAccordions}
            setOpenAccordions={setOpenAccordions}
          />
        ) : (
          <FooterContent />
        )}
      </Box>

      {/* Divider Line above footer */}
      {/* <Box className="h-[0px] max-w-full border border-white opacity-50"></Box> */}

      {/* Footer row at the end */}
      {/* <FooterRowAtTheEnd
        isIpad={isIpad}
        getLabel={getLabel}
        noLeftNavSpace={isAboutUs || supportPage}
        bottomNavPadding={isAllBrandsPage ? false : true} // for allbrands page no bottom nav so no padding
      /> */}

      {/* <InfoNLegalSection /> */}
      <Box
        className={`flex w-full items-center justify-center bg-footer-background ${isMobile && "px-3 pt-3"}`}
      >
        <PaymentCompanyFooter />
      </Box>
    </Box>
  );
};

export default FooterLanding;
export { FooterRowAtTheEnd };
