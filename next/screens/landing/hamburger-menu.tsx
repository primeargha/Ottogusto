"use client";

import { useEffect, useRef } from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import Link from "next/link";
import { hamburgerMenuIcons } from "@/constants";
import { View } from "react-native";
import HamburgerButton from "./hamburger-button";
import userIconOttogusto from "@/assets/Ottogusto/account_circle.svg";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import userQverdeIcon from "@/assets/Qverde/account_circle.svg";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { persistLocaleForLogout } from "@/utils/localeCookie";
import { Routes } from "@/config/routes";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { buildPartsCatalogUrl } from "@/utils/categorySearchUrl";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import qverdeLogoDesktop from "@/assets/Qverde/qverdeDesktopLogo.svg";
import ottogustoLogo from "@/assets/ottogusto-logo.svg";
// import OGHeaderSearchLinks from "../productdetails/OGHeaderSearchLinks";
import { OGHeaderButton } from "@/components/og-components/OGHeaderButton";
import UserLogo from "@/assets/UserLogo";
import { OGSidebarButton } from "@/components/og-components/OGSidebarButton";
import Typography from "@/components/og-components/Typography";
import CategoryIcon from "@/assets/CategoryIcon";
import AboutUsIcon from "@/assets/AboutUsIcon";
import ContactChatIcon from "@/assets/ContactChatIcon";
import LangButtonPopUp from "./footer/LangButtonPopup";
import OrdersIcon from "@/assets/OrdersIcon";
import SavedAddressIcon from "@/assets/SavedAddresses";
import CarBrandsIcon from "@/assets/CarBrandsIcon";
import { useMedia } from "@/hooks/useMedia";
import LogoutIcon from "@/assets/LogoutIcon";
import { useCartStore } from "@/stores/useCartStore";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { useSupportStore } from "@/stores/useSupportStore";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import {
  pathnameIncludesManufacturersRouteSegment,
  pathnameIncludesPartsRouteSegment,
} from "@/config/url-segments";
import ManufacturerIcon from "@/assets/ManufacturerIcon";

type MobileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuRef = useRef<View | null>(null); // ✅ Use View instead of HTMLDivElement
  const { isAuthenticated, logoutUser, authUser, openLoginModal, resetRedirectToAfterLogin } =
    useAuthStore();

  const { logout } = useAuth0();
  const { resetCurrentFormState } = useSupportStore();
  const {
    cartCount,
    cartitems,
    resetCart,
    cartid,
    setcartid,
    setupdatecart,
    try_again,
    settry_again,
    setiscartchanged,
  } = useCartStore();
  const handleLanguageSelector = () => {
    openLanguageSelector();
  };
  const pathname = usePathname();
  const { clearRecentlyViewedProducts } = useRecentlyViewedProductStore();
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const languageCountry = (params?.["language-country"] as string) ?? "";
  const isMobile = useMedia("(max-width: 639px)");
  const {
    locale,
    setLocale,
    getLanguageCountryStringHeader,
    getFlag,
    openLanguageSelector,
    getCountryLanguageLabel,
  } = useLandingPageDataStore();

  // const { , authUser, openLoginModal, resetRedirectToAfterLogin } = useAuthStore();
  const isSavedCarEnabled = getClientFeatureFlag("saved_car_feature_flag") === true;
  const isMyGarageEnabled = getClientFeatureFlag("MyGarage_page_feature_flag") === true;
  const isFeaturedMakesEnabled = getClientFeatureFlag("featured_makes_feature_flag") === true;
  const isManufacturerPageEnabled = getClientFeatureFlag("manufacturer_hamburger_nav") === true;
  const isGarageFeatureEnabled = isSavedCarEnabled && isMyGarageEnabled;
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  // Detect clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current) {
        const menuElement = menuRef.current as unknown as HTMLElement;
        if (!menuElement.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown); // 👈 add this
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown); // 👈 and this
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);
  const isProfileActive = pathname?.startsWith("/profile") || pathname?.includes("/profile/info");

  return (
    <>
      {/* Background Overlay (closes menu on click) */}
      {isMenuOpen && <Box className="fixed inset-0 z-[55] h-full w-full bg-black bg-opacity-50" />}

      {/* Mobile Menu */}
      <Box
        ref={menuRef}
        className={`fixed left-0 top-0 z-[60] flex h-dvh flex-col items-start justify-between overflow-hidden border border-[--humburger-white] bg-color-background-default px-space-md pb-space-md shadow-lg transition-all duration-300 base:w-[78%] gtsm:min-w-[400px] gtsm:max-w-[400px] gtlg:min-w-[400px] gtlg:max-w-[400px] ${
          isMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/*  */}
        {/* Scrollable Menu Content */}
        <Box className="flex h-full w-full flex-col gap-space-md bg-color-background-default">
          {/* Header (Non-Scrollable) */}
          <Box className="flex w-full flex-col gap-space-xs">
            <Box
              className={`flex w-full flex-shrink-0 flex-row items-center justify-between ${currentStore === STORE_IDS.OTTOGUSTO ? "gap-2" : "gap-0"} pt-space-lg`}
            >
              <Box className="px-[6px] py-2">
                <Link
                  title={getLabel(
                    currentStore === STORE_IDS.OTTOGUSTO ? STORE_IDS.OTTOGUSTO : STORE_IDS.QVERDE,
                  )}
                  href={getRouteLocaleString(Routes.pitStop, params)}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  {/*  */}
                  <Image
                    className={`mt-2 h-[34.42px] w-[140px] bg-contain`}
                    src={currentStore === STORE_IDS.OTTOGUSTO ? ottogustoLogo : qverdeLogoDesktop}
                    alt="logo"
                  />
                </Link>
              </Box>
              <HamburgerButton
                onHeader={false}
                isOpen={isMenuOpen}
                toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
              />
            </Box>

            {/* Divider */}
            {/* <Box className="flex w-full">
              <OGHeaderSearchLinks setIsMenuOpen={setIsMenuOpen} />
            </Box> */}
          </Box>

          <Box className="flex w-full flex-col gap-space-md">
            {isAuthenticated ? (
              <>
                <OGSidebarButton
                  className=""
                  isActive={pathname?.includes("/profile/info") ?? false}
                  sideBarIcons={
                    <UserLogo className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                  }
                  labeltextClass="text-color-text-default"
                  hasNotificationDot={false}
                  hasLabel={true}
                  text={getLabel("support_label_account")}
                  onClick={() => {
                    router.push(
                      isMobile
                        ? getRouteLocaleString(Routes.profile, params)
                        : getRouteLocaleString(Routes.profileInfo, params),
                    );
                    setIsMenuOpen(false);
                  }}
                  buttonBG="bg-color-background-default"
                />

                <OGSidebarButton
                  className=""
                  isActive={pathname?.includes("/orders") ?? false}
                  sideBarIcons={
                    <OrdersIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                  }
                  labeltextClass="text-color-text-default"
                  hasNotificationDot={false}
                  hasLabel={true}
                  text={getLabel("orders_and_returns_head")}
                  onClick={() => {
                    router.push(getRouteLocaleString(Routes.orderReturns, params));
                    setIsMenuOpen(false);
                  }}
                  buttonBG="bg-color-background-default"
                />
                <OGSidebarButton
                  className=""
                  isActive={pathname?.includes("/saved-addresses") ?? false}
                  sideBarIcons={
                    <SavedAddressIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                  }
                  labeltextClass="text-color-text-default"
                  hasNotificationDot={false}
                  hasLabel={true}
                  text={getLabel("saved_addresses")}
                  onClick={() => {
                    router.push(getRouteLocaleString(Routes.savedAddress, params));
                    setIsMenuOpen(false);
                  }}
                  buttonBG="bg-color-background-default"
                />
              </>
            ) : (
              <OGSidebarButton
                className=""
                state="enabled"
                sideBarIcons={
                  <UserLogo className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                }
                labeltextClass="text-color-text-default"
                hasNotificationDot={true}
                hasLabel={true}
                text={getLabel("header_login")}
                onClick={() => {
                  openLoginModal(pathname ?? undefined);
                  setIsMenuOpen(false);
                }}
                buttonBG="bg-color-background-default"
              />
            )}
            {/* {!isAuthenticated && (
            )} */}
            <Box className="h-[1px] w-full border border-color-border-default" />
            <Box className="flex w-full flex-col gap-space-sm">
              <Typography className="text-color-text-disabled typography-overline">
                {getLabel("hamburgermenu_searchby")}
              </Typography>
              <OGSidebarButton
                className=""
                isActive={pathnameIncludesPartsRouteSegment(pathname)}
                sideBarIcons={
                  <CategoryIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                }
                labeltextClass="text-color-text-default"
                hasNotificationDot={false}
                hasLabel={true}
                text={getLabel("root_category_title")}
                onClick={() => {
                  const locale = languageCountry || (params?.["language-country"] as string);
                  const destination =
                    isNewMmeEnabled && navigationCarIds.length > 0 && locale
                      ? buildPartsCatalogUrl(locale, navigationCarIds, navigationVin)
                      : getRouteLocaleString(Routes.parts, params);
                  router.push(destination);
                  setIsMenuOpen(false);
                }}
                buttonBG="bg-color-background-emphasis"
              />
              {isManufacturerPageEnabled && (
                <Link
                  href={getRouteLocaleString(Routes.manufacturers, params)}
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <OGSidebarButton
                    className=""
                    isActive={pathnameIncludesManufacturersRouteSegment(pathname, languageCountry)}
                    sideBarIcons={
                      <ManufacturerIcon className="h-6 w-6 text-color-icon-default group-hover:text-color-icon-emphasis" />
                    }
                    labeltextClass="text-color-text-default"
                    hasNotificationDot={false}
                    hasLabel={true}
                    text={getLabel("all_part_brand_manufacturers")}
                    buttonBG="bg-color-background-emphasis"
                  />
                </Link>
              )}
              {isFeaturedMakesEnabled && (
                <OGSidebarButton
                  className=""
                  isActive={pathname?.includes("/allbrands") ?? false}
                  sideBarIcons={
                    <CarBrandsIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
                  }
                  labeltextClass="text-color-text-default"
                  hasNotificationDot={false}
                  hasLabel={true}
                  text={getLabel("our_brands_your_trust")}
                  onClick={() => {
                    router.push(getRouteLocaleString(Routes.allbrands, params));
                    setIsMenuOpen(false);
                  }}
                  buttonBG="bg-color-background-default"
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box className="flex w-full flex-col gap-space-md">
          <Box></Box>
          <Box className="h-[1px] w-full border border-color-border-default" />

          <Box className="flex w-full flex-col gap-space-xs">
            {" "}
            <OGSidebarButton
              className=""
              isActive={pathname?.includes("/about-us") ?? false}
              sideBarIcons={
                <AboutUsIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
              }
              labeltextClass="text-color-text-default"
              hasNotificationDot={false}
              hasLabel={true}
              text={getLabel("about_us")}
              onClick={() => {
                router.push(getRouteLocaleString(Routes.aboutUs, params));
                setIsMenuOpen(false);
              }}
              buttonBG="bg-color-background-default"
            />
            <OGSidebarButton
              className=""
              isActive={pathname?.includes("/support") ?? false}
              sideBarIcons={
                <ContactChatIcon className="text-color-icon-default group-hover:text-color-icon-emphasis" />
              }
              labeltextClass="text-color-text-default"
              hasNotificationDot={false}
              hasLabel={true}
              text={getLabel("contact_us")}
              onClick={() => {
                router.push(getRouteLocaleString(Routes.support, params));
                setIsMenuOpen(false);
              }}
              buttonBG="bg-color-background-default"
            />
            {/* <LangButtonPopUp className="w-full" /> */}
            <OGSidebarButton
              className=""
              state="enabled"
              buttonIcon={getFlag()}
              labeltextClass="text-color-text-default"
              hasNotificationDot={false}
              hasLabel={true}
              text={getCountryLanguageLabel()}
              onClick={() => {
                openLanguageSelector();
                setIsMenuOpen(false);
              }}
              buttonBG="bg-color-background-default"
            />
            {isAuthenticated && (
              <OGSidebarButton
                className=""
                state="enabled"
                sideBarIcons={<LogoutIcon className="text-color-icon-danger" />}
                labeltextClass="text-color-text-default"
                hasNotificationDot={false}
                hasLabel={true}
                text={getLabel("header_logout")}
                onClick={() => {
                  persistLocaleForLogout({
                    languageCountryParam: languageCountry || undefined,
                    pathname,
                  });
                  logoutUser();
                  resetCart();
                  resetCurrentFormState();
                  clearRecentlyViewedProducts();
                  setIsMenuOpen(false);
                  logout({
                    //@ts-ignore
                    logoutParams: {
                      returnTo:
                        process.env.NODE_ENV === "development"
                          ? process.env.NEXT_PUBLIC_FRONTEND_DEV_URL
                          : process.env.NEXT_PUBLIC_FRONTEND_PROD_URL,
                    },
                  });
                }}
                buttonBG="bg-color-background-emphasis"
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MobileMenu;
