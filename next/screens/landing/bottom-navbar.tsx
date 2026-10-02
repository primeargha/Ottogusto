"use client";

import { Box } from "@/components/ui/box";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { bottomBarIcons, bottomBarActiveIcons } from "@/constants";
import { useEffect, useState } from "react";
import { FORCE_iPAD } from "@/config/app";
import { useBranding } from "@/contexts/BrandingContext";
import useIpadDetection from "@/hooks/useIpadDetection";
import { useMedia } from "@/hooks/useMedia";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type Props = {};

const BottomNavBar = (props: Props) => {
  const pathname = usePathname(); // Get the current path
  const params = useParams();
  const { getLabel } = useBranding();

  const isIpad = useIpadDetection();
  const isMobile = useMedia("(max-width: 639px)");
  const allNavItems = [
    {
      path: getRouteLocaleString(Routes.pitStop, params),
      label: getLabel("nav_home"),
      icon: bottomBarIcons.pit_stop,
      activeIcon: bottomBarActiveIcons.pit_stop,
    },
    // {
    //   path: getRouteLocaleString(Routes.ogSearch, params),
    //   label: getLabel("nav_og_search"),
    //   icon: bottomBarIcons.og_search,
    //   activeIcon: bottomBarActiveIcons.og_search,
    // },
    {
      path: getRouteLocaleString(Routes.garageBay, params),
      label: getLabel("garage_bay"),
      icon: bottomBarIcons.garage_bay,
      activeIcon: bottomBarActiveIcons.garage_bay,
    },
    {
      path: getRouteLocaleString(Routes.driveAssist, params),
      label: getLabel("nav_support"),
      icon: bottomBarIcons.drive_assist,
      activeIcon: bottomBarActiveIcons.drive_assist,
    },
  ];

  // Filter navItems based on feature flags
  const navItems = allNavItems.filter((item) => {
    // Show garage bay only if both saved_car_feature_flag and MyGarage_page_feature_flag are true
    if (item.path === getRouteLocaleString(Routes.garageBay, params)) {
      const isSavedCarEnabled = getClientFeatureFlag("saved_car_feature_flag") === true;
      const isMyGarageEnabled = getClientFeatureFlag("MyGarage_page_feature_flag") === true;

      return isSavedCarEnabled && isMyGarageEnabled;
    }
    // Show all other items
    return true;
  });
  // Todo: Change the pathname after final ProductDetails page
  const isproductdetailsPage = pathname?.includes("productdetails");

  if (isMobile && isproductdetailsPage) {
    return null;
  }

  if (
    pathname?.includes("/products") ||
    pathname?.includes("/shoppingcart") ||
    pathname?.includes("/part") ||
    pathname?.includes("/order-details") ||
    pathname?.includes("/orders-returns") ||
    pathname?.includes("/checkout-options") ||
    pathname?.includes("/payment-status") ||
    pathname?.includes("/allbrands") ||
    pathname?.includes("/support") ||
    pathname?.includes("/search")
  ) {
    return null;
  }

  const ifActive = (route: string) => {
    return pathname === route;
    return false;
  };

  // check if Flag "mobile_bottom_nav_enabled" is false & if isMobile then return null donot render the bottomnav
  // const isMobile = useMedia("(max-width: 640px)");
  const isMobileBottomNavEnabled = getClientFeatureFlag("mobile_bottom_nav_enabled");
  if (!isMobileBottomNavEnabled) {
    return null;
  }

  return (
    <nav
      className={`fixed bottom-[2%] left-1/2 z-20 flex h-[76px] w-[90%] max-w-[406px] -translate-x-1/2 transform items-center justify-around rounded-lg bg-[var(--color-beige-800)] shadow-[0px_10px_16px_10px_rgba(0,0,0,0.10)] ${pathname === "/garage-bay/my-saved-cars" ? "flex gtlg:hidden" : `${isIpad && pathname !== "/garage-bay/my-saved-cars" ? "" : "lg:hidden"}`} `}
    >
      {navItems?.map((item, index) => {
        const isActive = ifActive(item.path);
        // const isActive =
        //   item.path === "/" ? pathname === item.path : pathname?.startsWith(item.path);
        return (
          <Link href={item.path} key={index}>
            <Box
              className={`width-[clamp(70px,4vw,78px)] flex cursor-pointer flex-col items-center ${
                isActive
                  ? "text-[--brand-traffic-light-green]"
                  : "text-[--brand-traffic-deep-green]"
              }`}
            >
              <Image
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label}
                width={24}
                height={23.104}
                className={`mb-2 ${isActive ? "text-[--brand-traffic-light-green]" : "text-[--brand-traffic-deep-green]"}`}
              />
              <Box
                className={`font-Overpass text-[clamp(8px,3vw,12px)] text-xs font-semibold leading-tight ${
                  isActive
                    ? "text-[--brand-traffic-light-green]"
                    : "text-[--brand-traffic-deep-green]"
                }`}
              >
                {item.label}
              </Box>
            </Box>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
