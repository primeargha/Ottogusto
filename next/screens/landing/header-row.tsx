"use client";
// tsrafce
// PERF: Removed static lottie-react import — lottie-web is dynamically imported below
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { ChevronDownIcon, Icon, LockIcon } from "@/components/ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "@/screens/landing/hamburger-menu";

// PERF: Lazy-load lottie-web and animation JSON to reduce initial bundle (~250KB+ savings)
// import cart from "../../data/animations/cart.json";
// import carWithFullUpDown from "../../data/animations/shutter with car full up down.json";
// import lottie from "lottie-web";
import { useEffect, useRef, useState } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import HamburgerButton from "./hamburger-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import useIpadDetection from "@/hooks/useIpadDetection";
import { useMedia } from "@/hooks/useMedia";
import { useCartStore } from "@/stores/useCartStore";
import garagePic from "@/assets/Ottogusto/warehouse.svg";
import { Pressable } from "@/components/ui/pressable";
import userIconOttogusto from "@/assets/Ottogusto/account_circle.svg";
import ottogustoLogo from "@/assets/Ottogusto/Vector.svg";
import ottogustoMobile from "@/assets/Ottogusto/macroicon.svg";
import qverdeLogoDesktop from "@/assets/Qverde/qverdeDesktopLogo.svg";
import qverdeLogoMobile from "@/assets/Qverde/Vectormobile.svg";
import cartIconOttogusto from "@/assets/Ottogusto/shopping_cart.svg";
import cartIconQverde from "@/assets/Qverde/shopping_cart.svg";
import userQverdeIcon from "@/assets/Qverde/account_circle.svg";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useRibbonStore } from "@/stores/useRibbonStore";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { persistLocaleForLogout } from "@/utils/localeCookie";
import { getCheckCartId } from "@/services/cart";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import HeaderRowLangBlock from "./header-row-lang-block";
import { OGHeaderButton } from "@/components/og-components/OGHeaderButton";
import { useSupportStore } from "@/stores/useSupportStore";
import RibbonContent, { RibbonLinkItem } from "./RibbonContent";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { RIBBON_LINKS_LABELS } from "@/data/branding/ribbonLinks";
import { OrderItem } from "@/type";
import OGHeaderSearchLinks from "../productdetails/OGHeaderSearchLinks";
import useScrollDirection from "@/hooks/hideShowScroll";
import RightSidebar from "./rightsidebar";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";

type Props = {};

const HeaderRow = (props: Props) => {
  const { getLabel } = useBranding();
  const { locale } = useLandingPageDataStore();
  const params = useParams();
  const languageCountrySegment = Array.isArray(params?.["language-country"])
    ? params["language-country"][0]
    : (params?.["language-country"] as string | undefined);
  const isMobile = useMedia("(max-width: 639px)");
  const {
    user,
    isAuthenticated,
    loginWithPopup,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
  } = useAuth0();
  const {
    logoutUser,
    authUser,
    openLoginModal,
    resetRedirectToAfterLogin,
    isAuthenticated: checkauthentication,
  } = useAuthStore();
  const router = useRouter();
  const { resetEB, resetSearch, resetOgSearch } = useSearchModalStore();
  const { clearRecentlyViewedProducts } = useRecentlyViewedProductStore();
  const { resetCurrentFormState } = useSupportStore();
  const { openLanguageSelector, getLanguageCountryString } = useLandingPageDataStore();
  const { showRibbon, hideRibbon } = useRibbonStore();
  const [onClient, setonClient] = useState(false);
  // use this for store determination
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  const { showRightSidebarPanel } = useRightSidebarStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeskTopMenuOpen, setisDeskTopMenuOpen] = useState(false);
  const pathname = usePathname();
  const shoppingCartHref = useShoppingCartHref();
  const isIpad = useIpadDetection();
  const menuRef = useRef(null);
  const engineBayRef = useRef<HTMLDivElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const cartAnimationRef = useRef<any>(null); // Store animation instance
  const engineBayAnimationRef = useRef<any>(null); // Store animation instance
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  const { showRightSidebar, hideRightSidebar } = useRightSidebarStore();
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
  useEffect(() => {
    async function checkCart() {
      if (checkauthentication && cartid === "") {
        const result = await getCheckCartId();
        if (result && result.length > 0) {
          const cart = result[0];
          setcartid(cart?.orderId ?? "");
          const hasRecommendedPrice = cartitems.some(
            (item) => item.recommendedPriceInclVat !== undefined,
          );
          if (!hasRecommendedPrice && cart?.items && cart?.items.length > 0) {
            setiscartchanged(true);
          }
          const mergedItems = (cart?.items ?? []).map((apiItem: any) => {
            const existingItem = cartitems.find((e) => e.id === apiItem.id);
            return {
              ...apiItem,
              seo: apiItem.seo ?? existingItem?.seo,
              manufacturer: apiItem.manufacturer ?? existingItem?.manufacturer,
              manufacturerId: apiItem.manufacturerId ?? existingItem?.manufacturerId,
            };
          });
          setupdatecart(mergedItems);
        }
      }
    }
    checkCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkauthentication]);

  useEffect(() => {
    const handleFocus = async () => {
      // Only sync cart from server if authenticated and has a cart
      if (checkauthentication && cartid !== "" && !try_again) {
        try {
          const result = await getCheckCartId();
          if (result && result.length > 0) {
            // Server has cart data - sync it
            const cart = result[0];

            if (cart?.orderId === cartid && cart.items && cart.items.length > 0) {
              const hasMatch = cartitems.some(
                (item1) =>
                  cart.items &&
                  cart.items.some(
                    (item2: OrderItem) =>
                      item1.id === item2.id && item1.quantity === item2.quantity,
                  ),
              );
              if (!hasMatch) {
                setiscartchanged(true);
              }
            } else {
              setcartid(cart?.orderId ?? "");
              // Preserve seo from existing cart items so product links use correct slug
              const mergedItems = (cart?.items ?? []).map((apiItem: any) => {
                const existingItem = cartitems.find((e) => e.id === apiItem.id);
                return {
                  ...apiItem,
                  seo: apiItem.seo ?? existingItem?.seo,
                  manufacturer: apiItem.manufacturer ?? existingItem?.manufacturer,
                  manufacturerId: apiItem.manufacturerId ?? existingItem?.manufacturerId,
                };
              });
              setupdatecart(mergedItems);
              if (cart?.items && cart?.items.length > 0) {
                setiscartchanged(true);
              }
            }
          }
        } catch (error) {
          // On error, don't reset cart - just log the error
          console.error("Error checking cart on focus:", error);
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //@ts-ignore
  const totalQuantity = cartitems?.reduce((acc, item) => acc + item?.quantity, 0) || 0;
  const toggleMenu = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setIsMenuOpen((prev) => !prev);
    }, 30);
  };
  useEffect(() => {
    if (isMenuOpen) {
      setTimeout(() => {
        setShouldRenderMenu(true);
        setIsAnimating(false);
      }, 20);
    } else {
      setShouldRenderMenu(false);
    }
  }, [isMenuOpen]);

  // Modify the existing useEffect for animation setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      setonClient(true);
    }
  }, []); // Only run once on mount

  // PERF: Initialize lottie animations lazily — dynamic import reduces initial JS bundle
  useEffect(() => {
    if (!onClient) return;

    let cartAnim: any = null;
    let engineAnim: any = null;
    let cancelled = false;

    const initializeAnimations = async () => {
      try {
        const [lottieModule, cartData, carData] = await Promise.all([
          import("lottie-web"),
          import("../../data/animations/cart.json"),
          import("../../data/animations/shutter with car full up down.json"),
        ]);
        if (cancelled) return;
        const lottie = lottieModule.default;

        // Initialize cart animation
        if (cartRef.current && cartRef.current.innerHTML.length < 10) {
          cartAnim = lottie.loadAnimation({
            container: cartRef.current,
            renderer: "svg",
            loop: !isMobile,
            autoplay: isMobile,
            animationData: cartData.default || cartData,
          });
          cartAnimationRef.current = cartAnim;

          if (isMobile && cartAnim) {
            cartAnim.addEventListener("complete", () => {
              cartAnim?.stop();
            });
          }
        }

        // Initialize engine bay animation
        if (engineBayRef.current && engineBayRef.current.innerHTML.length < 10) {
          engineAnim = lottie.loadAnimation({
            container: engineBayRef.current,
            renderer: "svg",
            loop: true,
            autoplay: false,
            animationData: carData.default || carData,
          });
          engineBayAnimationRef.current = engineAnim;
        }
      } catch (error) {
        console.error("Error loading lottie animations:", error);
      }
    };

    const timer = setTimeout(initializeAnimations, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (cartAnimationRef.current) {
        cartAnimationRef.current.destroy();
        cartAnimationRef.current = null;
      }
      if (engineBayAnimationRef.current) {
        engineBayAnimationRef.current.destroy();
        engineBayAnimationRef.current = null;
      }
    };
  }, [onClient, isMobile, pathname]); // Dependencies for animation initialization

  const showHeader: boolean = useScrollDirection();
  // Add useEffect to handle cart count changes
  useEffect(() => {
    if (isMobile && cartAnimationRef.current && onClient) {
      try {
        cartAnimationRef.current.play();
      } catch (error) {
        console.error("Error playing cart animation:", error);
      }
    }
  }, [cartCount, isMobile, onClient]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any)?.contains(event.target as Node)) {
        setisDeskTopMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setisDeskTopMenuOpen(false);
  }, [pathname]);

  // ✅ Close menu when scrolling
  useEffect(() => {
    function handleScroll() {
      if (isDeskTopMenuOpen) {
        setisDeskTopMenuOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDeskTopMenuOpen]);

  // TODO: Remove this after testing
  // Add useEffect for dummy count changes

  // Return null if path contains /search
  // if (pathname?.includes("/search") && !pathname?.includes("/search-results")) {
  //   return null;
  // }

  const handleCheckoutPage = () => {
    return router.push(shoppingCartHref);
  };

  const ribbonLinkList: RibbonLinkItem[] = [];

  const ribbonLinkCount = Object.keys(RIBBON_LINKS_LABELS).length / 2;

  for (let i = 1; i <= ribbonLinkCount; i++) {
    const index = String(i).padStart(2, "0"); // 👈 KEY FIX
    ribbonLinkList.push({
      text: `ribbon_url_${index}`,
      link: `ribbon_url_redirect_${index}`,
    });
  }

  // edit here
  return (
    <Box id="site-header-sticky" className="sticky left-0 right-0 top-0 z-50 w-full flex-col">
      {/* yellow ribbon section */}
      <RibbonContent showRibbon={showRibbon} hideRibbon={hideRibbon} ribbonLinks={ribbonLinkList} />

      {/* header section */}
      <Box className="bg-header-background base:h-[56px] gtsm:h-[64px] gtlg:h-[64px]">
        <Box className="flex h-full flex-row items-center justify-between header-padding-v section-standard">
          {/* Left section */}

          {/* Center section - Logo (only visible on lg screens) */}
          <Box
            className={`flex h-full w-[55%] flex-row items-center gap-space-xs base:justify-between gtsm:justify-start gtlg:justify-start`}
          >
            <Box
              onClick={toggleMenu}
              className="flex w-auto cursor-pointer items-center justify-center rounded-radius-medium bg-header-action-bg-default p-2 hover:bg-header-action-bg-hover"
            >
              <HamburgerButton
                onHeader={true}
                isOpen={isMenuOpen}
                isIpad={isIpad}
                toggleMenu={toggleMenu}
              />
            </Box>
            <Box className="flex flex-row gap-4">
              <Link
                className="flex w-auto"
                title={getLabel(
                  currentStore === STORE_IDS.OTTOGUSTO ? STORE_IDS.OTTOGUSTO : STORE_IDS.QVERDE,
                )}
                href={getRouteLocaleString(Routes.pitStop, params)}
              >
                <Box
                  className={`cursor-pointer bg-center bg-no-repeat ${currentStore === STORE_IDS.OTTOGUSTO ? "base:h-9 base:w-9 base:px-1 base:pb-1 base:pt-1 gtsm:h-[40px] gtsm:w-[154px] gtsm:px-[6px] gtsm:pb-0 gtsm:pt-2 gtlg:h-[40px] gtlg:w-[154px]" : "base:h-10 base:w-[42px] base:px-1 base:py-1 gtsm:h-10 gtsm:w-[106px] gtsm:px-[6px] gtsm:py-2 gtlg:h-10 gtlg:w-[106px] gtlg:p-[6px]"}`}
                  onClick={() => router.push(getRouteLocaleString(Routes.pitStop, params))}
                >
                  {currentStore === STORE_IDS.OTTOGUSTO ? (
                    <>
                      <Image
                        src={ottogustoMobile}
                        alt="Logo"
                        className="block h-full w-full bg-contain gtsm:hidden"
                      />
                      <Image
                        src={ottogustoLogo}
                        alt="Logo"
                        className="hidden h-full w-full bg-contain gtsm:block"
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={qverdeLogoMobile}
                        alt="Logo"
                        className="block h-full w-full bg-contain gtsm:hidden"
                      />
                      <Image
                        src={qverdeLogoDesktop}
                        alt="Logo"
                        className="hidden h-full w-full bg-contain gtsm:block"
                      />
                    </>
                  )}
                </Box>
              </Link>

              {/* rightside trigger button(dev use only) */}
              {/* <Box
                className="flex min-h-5 w-6 cursor-pointer items-center justify-center rounded-lg border border-color-text-danger bg-header-background p-1 text-center hover:bg-transparent"
                onClick={showRightSidebarPanel}
              ></Box> */}
            </Box>
          </Box>

          {/* Right section */}
          <Box className="flex w-auto items-center">
            <Box className="relative flex flex-row items-center gap-2">
              <>
                {/* flag block */}
                {getClientFeatureFlag("header_countrylanguage_flag", languageCountrySegment) && (
                  <Box className="hidden gtsm:block">
                    <HeaderRowLangBlock />
                  </Box>
                )}

                {/* garage page button */}
                {getClientFeatureFlag("MyGarage_page_feature_flag", languageCountrySegment) &&
                  getClientFeatureFlag("saved_car_feature_flag", languageCountrySegment) && (
                    <Box className="base:hidden gtsm:flex gtsm:min-w-[130px] gtsm:max-w-[138px] gtlg:flex gtlg:min-w-[130px] gtlg:max-w-[138px]">
                      <Button
                        className="relative flex w-full flex-row items-center gap-2 overflow-hidden bg-header-background p-2 text-white hover:bg-header-background"
                        // variant="outline"
                        onPress={() => {
                          return router.push(getRouteLocaleString(Routes.garageBay, params));
                        }}
                      >
                        {/* <div ref={engineBayRef} className="h-[24px] w-[24px]" /> */}
                        <Image src={garagePic} alt="Garage" height={24} width={24} />
                        <Box className="w-auto text-nowrap pt-1 text-white body-medium-sm ml:flex">
                          {getLabel("header_garage")}
                        </Box>
                        {/* <span className="absolute -z-10 block h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--hover-green-color] transition-all duration-700" /> */}
                      </Button>
                    </Box>
                  )}

                {/* login button */}
                {!isAuthenticated ? (
                  <>
                    <Box className="gtsm:max-w-auto base:min-w-6 gtsm:flex gtsm:min-w-[84px] gtlg:min-w-[84px]">
                      <OGHeaderButton
                        className=""
                        state="enabled"
                        buttonIcon={
                          currentStore === STORE_IDS.OTTOGUSTO ? userIconOttogusto : userQverdeIcon
                        }
                        labeltextClass="text-header-action-text"
                        hasNotificationDot={!isMobile ? false : true}
                        hasLabel={!isMobile ? true : false}
                        text={getLabel("header_login")}
                        onClick={() => {
                          openLoginModal(pathname ?? undefined);
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  <Menu
                    // placement="bottom"
                    offset={5}
                    ref={menuRef}
                    disabledKeys={["Settings"]}
                    isOpen={isDeskTopMenuOpen}
                    className="bg-white base:mr-0 gtsm:min-w-[200px] gtlg:min-w-[200px]"
                    trigger={({ ...triggerProps }) => {
                      return (
                        <Box className="flex items-center justify-center">
                          <Button
                            {...triggerProps}
                            onPress={() => {
                              setisDeskTopMenuOpen(true);
                            }}
                            className="relative w-auto overflow-hidden bg-header-action-bg-default p-0 hover:bg-header-action-bg-hover"
                          >
                            <OGHeaderButton
                              state="enabled"
                              buttonIcon={
                                currentStore === STORE_IDS.OTTOGUSTO
                                  ? userIconOttogusto
                                  : userQverdeIcon
                              }
                              labeltextClass="text-header-action-text"
                              hasLabel={false}
                            />
                          </Button>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem
                      key="Profile"
                      textValue={getLabel("nav_profile")}
                      onPress={() => {
                        router.push(
                          isMobile
                            ? getRouteLocaleString(Routes.profile, params)
                            : getRouteLocaleString(Routes.profileInfo, params),
                        );
                      }}
                      className="rounded-t-md"
                    >
                      {/* @ts-ignore */}
                      {({ pressed }: { pressed: boolean }) => {
                        return (
                          <>
                            <Image
                              src={
                                pressed
                                  ? "/assets/icons/l-nav/profile.svg"
                                  : "/assets/icons/user.svg"
                              }
                              height={20}
                              width={20}
                              className="mr-2"
                              alt="Profile"
                              title="Profile"
                            />
                            <MenuItemLabel
                              size="sm"
                              className={`font-inter text-lg font-medium capitalize ${pressed ? "text-white" : "text-[--Text-green]"}`}
                            >
                              {getLabel("header_profile")}
                            </MenuItemLabel>
                          </>
                        );
                      }}
                    </MenuItem>
                    {getClientFeatureFlag("header_countrylanguage_flag", languageCountrySegment) &&
                      isMobile && (
                        <MenuItem
                          key="Language"
                          textValue="Language"
                          onPress={() => {
                            setisDeskTopMenuOpen(false);
                            openLanguageSelector();
                          }}
                        >
                          {/* @ts-ignore */}
                          {({ pressed }: { pressed: boolean }) => {
                            return (
                              <>
                                <Image
                                  src={"/assets/icons/language-square.svg"}
                                  height={20}
                                  width={20}
                                  className={`mr-2 ${pressed ? "brightness-200 contrast-200 grayscale invert" : ""}`}
                                  alt="Profile"
                                  title="Language"
                                />
                                <MenuItemLabel
                                  size="sm"
                                  className={`font-inter text-lg font-medium ${pressed ? "text-white" : "text-[--Text-green]"}`}
                                >
                                  {getLabel("header_language")}
                                  {getLanguageCountryString()}
                                </MenuItemLabel>
                                <Icon
                                  className={`ml-2 mr-[-5px] mt-1 ${pressed ? "brightness-200 contrast-200 grayscale invert" : ""}`}
                                  as={ChevronDownIcon}
                                  height={24}
                                  width={24}
                                />
                              </>
                            );
                          }}
                        </MenuItem>
                      )}

                    <MenuItem
                      key="Orders"
                      textValue="Orders"
                      className="lg:flex"
                      onPress={() => {
                        router.push(getRouteLocaleString(Routes.orderReturns, params));
                      }}
                    >
                      {/* @ts-ignore */}
                      {({ pressed }: { pressed: boolean }) => {
                        return (
                          <>
                            <Image
                              src={"/assets/icons/orders.svg"}
                              height={20}
                              width={20}
                              className={`mr-2 ${pressed ? "brightness-200 contrast-200 grayscale invert" : ""}`}
                              alt="Orders"
                              title="Orders"
                            />
                            <MenuItemLabel
                              className={`font-inter text-lg font-medium ${pressed ? "text-white" : "text-[--Text-green]"}`}
                              size="sm"
                            >
                              {getLabel("header_orders")}
                            </MenuItemLabel>
                          </>
                        );
                      }}
                    </MenuItem>
                    <MenuItem
                      key="Logout"
                      textValue="Logout"
                      onPress={() => {
                        // setAuth(false);
                        persistLocaleForLogout({
                          languageCountryParam: (params as Record<string, string>)?.[
                            "language-country"
                          ],
                          pathname,
                        });
                        logoutUser();
                        resetCart();
                        resetCurrentFormState();
                        clearRecentlyViewedProducts();
                        // resetEB();
                        // resetSearch();
                        // resetOgSearch();
                        logout({
                          //@ts-ignore
                          logoutParams: {
                            returnTo:
                              process.env.NODE_ENV === "development"
                                ? process.env.NEXT_PUBLIC_FRONTEND_DEV_URL
                                : process.env.NEXT_PUBLIC_FRONTEND_PROD_URL,
                          },
                        });

                        // logout({
                        //   openUrl: (url) => {
                        //     logoutUser();
                        //     if (typeof window !== "undefined") {
                        //       if (process.env.NODE_ENV === "development") {
                        //         window.location.replace(process.env.NEXT_PUBLIC_FRONTEND_DEV_URL!);
                        //       } else {
                        //         window.location.replace(process.env.NEXT_PUBLIC_FRONTEND_PROD_URL!);
                        //       }
                        //     }
                        //   },
                        // });
                      }}
                      className="rounded-b-md"
                    >
                      {/* @ts-ignore */}
                      {({ pressed }: { pressed: boolean }) => {
                        return (
                          <>
                            <Image
                              src={"/assets/icons/logout.svg"}
                              height={20}
                              width={20}
                              className={`mr-2 ${pressed ? "brightness-200 contrast-200 grayscale invert" : ""}`}
                              alt="Logout"
                              title="Logout"
                            />
                            <MenuItemLabel
                              className={`font-inter text-lg font-medium ${pressed ? "text-white" : "text-[--Text-green]"}`}
                              size="sm"
                            >
                              {getLabel("header_logout")}
                            </MenuItemLabel>
                          </>
                        );
                      }}
                    </MenuItem>
                  </Menu>
                )}
              </>
              {/* cart header button */}
              <OGHeaderButton
                className=""
                state="enabled"
                buttonIcon={
                  currentStore === STORE_IDS.OTTOGUSTO ? cartIconOttogusto : cartIconQverde
                }
                labeltextClass="text-header-action-text"
                hasCounter={totalQuantity > 0 ? true : false}
                countData={totalQuantity}
                hasLabel={false}
                onClick={handleCheckoutPage}
              />
            </Box>
          </Box>
        </Box>

        {/* Ensure menu opens only after animation completes */}
        {shouldRenderMenu && <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}

        <RightSidebar />
      </Box>

      <Box
        className={`flex w-full items-center justify-center border-b border-t border-color-header-divider bg-header-background py-2 transition-transform duration-300 ease-in-out will-change-transform`}
      >
        <OGHeaderSearchLinks />
      </Box>
    </Box>
  );
};

export default HeaderRow;
