"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { startRippleEffect } from "tailwind-plugin-ripple-effect/start";
import { leftMenuIcons } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import useRouter from "@unitools/router";
import { useParams, usePathname } from "next/navigation";
import { FORCE_iPAD } from "@/config/app";
import { useAuthStore } from "@/stores/useAuthStore";
import { getProfile } from "@/services/authService";
import { useAuth0 } from "@auth0/auth0-react";
import { useModalStore } from "@/stores/useModalStore";
import useIpadDetection from "@/hooks/useIpadDetection";
import { useMedia } from "@/hooks/useMedia";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useRouteStore } from "@/stores/useRouteStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { ALL_PARTS_ROUTE_SEGMENTS } from "@/config/url-segments";

type Props = {};

const LeftNavBar = (props: Props) => {
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { appendToNavigationHistory, navigationHistory } = useRouteStore();
  const isMobile = useMedia("(max-width: 639px)");
  const { isOpen } = useModalStore();
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const isIpad = useIpadDetection();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const [atBottom, setAtBottom] = useState(false);

  const go = (routeCallback: any) => {
    if (params && typeof params["language-country"] === "string") {
      const new_url = routeCallback(params["language-country"]);
      appendToNavigationHistory(new_url);
      return router.push(new_url);
    }
  };

  const checkFromHistory = (url: string) => {
    return navigationHistory[0]?.replace(/^\/..-..\/*/gi, "/") === url ? "active" : "";
  };

  let menuAlreadyHasOneActive = false;
  const ifActive = (url: string): string => {
    const URL_NO_LOCALE = url.replace(/^\/..-..\/*/gi, "/");
    const CURRENT_URL_NO_LOCALE = pathname?.replace(/^\/..-..\/*/gi, "/");
    if (URL_NO_LOCALE === CURRENT_URL_NO_LOCALE) {
      menuAlreadyHasOneActive = true;
      return "active";
    } else if (
      CURRENT_URL_NO_LOCALE?.startsWith(URL_NO_LOCALE) &&
      URL_NO_LOCALE.length > 5 &&
      CURRENT_URL_NO_LOCALE.length > 5
    ) {
      menuAlreadyHasOneActive = true;
      return "active";
    } else if (
      CURRENT_URL_NO_LOCALE?.startsWith("/products/") ||
      ALL_PARTS_ROUTE_SEGMENTS.some(
        (seg) =>
          CURRENT_URL_NO_LOCALE?.startsWith(`/${seg}/`) || CURRENT_URL_NO_LOCALE === `/${seg}`,
      )
    ) {
      // only check history if current route is /products/ or /part/
      return checkFromHistory(URL_NO_LOCALE) ?? "";
    }
    return "";
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]: any) => {
        setAtBottom(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.5,
      },
    );

    footerRef.current = document.querySelector("#footer-row");
    if (footerRef.current) observer.observe(footerRef.current);

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  if (isIpad || !getClientFeatureFlag("show_left_nav_flag")) {
    return <></>;
  }

  return (
    <Box
      ref={sidebarRef as any}
      className={`left_nav relative left-0 right-0 ml-[38px] hidden w-[124px] flex-col items-center justify-center gap-[12px] rounded-lg border-[3px] border-color-secondary-main bg-color-hover-action-primary p-[24px] shadow-[2px_16px_19px_0px_rgba(0,0,0,0.09)] backdrop-blur-[40px] ${isIpad ? "" : "lg:flex"} `}
    >
      {/* <Box className="left_nav top-[calc(251px)] right-0 left-0 animate-fadeIn hidden lg:flex flex-col justify-center gap-[12px] items-center w-[119px] h-[540px] ml-[35px] mt-[0px] relative rounded-lg border-2 bo--brand-traffic-light-green] backdrop-blur-[80px]"> */}
      <Box
        className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.pitStop, params))} flex h-[89px] w-[89px] items-center justify-center`}
        onPointerUp={() => {
          if (isOpen) {
            return;
          }
          go(Routes.pitStop);
        }}
      >
        <Image
          src={leftMenuIcons.pit_stop}
          alt="PIT STOP"
          width={24}
          height={24}
          className="mb-2"
        />
        <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
          {getLabel("nav_home")}
        </Box>
      </Box>

      {/* <Box
        className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.ogSearch, params))} flex h-[89px] w-[89px] items-center justify-center`}
        onPointerUp={() => {
          if (isOpen) {
            return;
          }
          go(Routes.ogSearch);
        }}
      >
        <Image
          src={leftMenuIcons.og_search}
          alt="OG SEARCH"
          width={24}
          height={24}
          className="mb-2"
        />
        <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
          {getLabel("nav_og_search")}
        </Box>
      </Box> */}

      {getClientFeatureFlag("MyGarage_page_feature_flag") &&
        getClientFeatureFlag("saved_car_feature_flag") && (
          <Box
            className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.garageBay, params))} flex h-[89px] w-[89px] items-center justify-center`}
            onPointerUp={() => {
              if (isOpen) {
                return;
              }
              go(Routes.garageBay);
            }}
          >
            <Image
              src={leftMenuIcons.garage_bay}
              alt="GARAGE BAY"
              width={24}
              height={24}
              className="mb-2"
            />
            <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
              {getLabel("nav_garage")}
            </Box>
          </Box>
        )}

      {isAuthenticated && (
        <Box
          className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.profile, params))} flex h-[89px] w-[89px] content-center items-center justify-center`}
          onPointerUp={() => {
            if (isOpen) {
              return;
            }
            // go(isMobile ? "/profile" : "/profile/info");
            if (isMobile) {
              go(Routes.profile);
            } else {
              go(Routes.profileInfo);
            }
          }}
        >
          <Image
            src={leftMenuIcons.profile}
            alt="PROFILE"
            width={24}
            height={24}
            className="mb-2"
          />
          <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
            {getLabel("nav_profile")}
          </Box>
        </Box>
      )}
      {!isAuthenticated && (
        <Box
          className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.profile, params))} flex h-[89px] w-[89px] content-center items-center justify-center`}
          onPointerUp={() => {
            if (isOpen) {
              return;
            }
            openLoginModal(isMobile ? "/profile" : "/profile/info");
            // loginCallback();
          }}
        >
          <Image
            src={leftMenuIcons.profile}
            alt="PROFILE"
            width={24}
            height={24}
            className="mb-2"
          />
          <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
            {getLabel("nav_profile")}
          </Box>
        </Box>
      )}

      <Box
        className={`left_nav_itm ${ifActive(getRouteLocaleString(Routes.driveAssist, params))} flex h-[89px] w-[89px] items-center justify-center`}
        onPointerUp={() => {
          if (isOpen) {
            return;
          }
          go(Routes.driveAssist);
        }}
      >
        <Image
          src={leftMenuIcons.drive_assist}
          alt="DRIVE ASSIST"
          width={24}
          height={24}
          className="mb-2"
        />
        <Box className="text-center font-Overpass text-xs font-bold leading-tight text-white">
          {getLabel("nav_support")}
        </Box>
      </Box>
    </Box>
  );
};

export default LeftNavBar;
