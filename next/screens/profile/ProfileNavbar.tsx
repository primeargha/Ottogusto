"use client";

import React, { useEffect, useState } from "react";

import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ProfileInformationIcon from "@/components/icons/ProfileInformationIcon";
import OrderAndReturnsIcon from "@/components/icons/OrderAndReturnsIcon";
import SavedAddressIcon from "@/components/icons/SavedAddressIcon";
import BackIcon from "@/components/icons/BackIcon";
import { Text } from "@/components/ui/text";
import { AuthUserType, useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import LogoutIcon from "@/components/icons/LogoutIcon";
import RightArrow from "@/components/icons/RightArrow";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useMedia } from "@/hooks/useMedia";
import { useCartStore } from "@/stores/useCartStore";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { persistLocaleForLogout } from "@/utils/localeCookie";

import FallBackProfileIMG from "@/assets/profile/placeholder-profile-image.png";
import OGProfileImage from "@/components/og-components/OGProfileImage";
import { useBranding } from "@/contexts/BrandingContext";
import Productnavigation from "../productdetails/productnavigation";
import Typography from "@/components/og-components/Typography";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { link } from "fs";

type NavLink = {
  key: string;
  name: string;
  icon: React.ReactNode;
  link: string;
  isActive?: boolean;
};

export default function ProfileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { logout } = useAuth0();
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();
  const { resetEB, resetSearch, resetOgSearch } = useSearchModalStore();
  const { resetCart } = useCartStore();
  const navLinks: NavLink[] = [
    {
      key: "profile-information",
      name: getLabel("profile_info_title"),
      icon: (
        <ProfileInformationIcon
          height={20}
          width={20}
          className={`text-color-text-body group-hover:text-color-text-on-dark`}
        />
      ),
      link: getRouteLocaleString(Routes.profileInfo, params),
      isActive: pathname?.includes("/profile/info") ?? false,
    },
    {
      key: "orders-returns",
      name: getLabel("orders_and_returns_head"),
      icon: (
        <OrderAndReturnsIcon
          height={20}
          width={20}
          className={`group-hover:text-color-text-on-dark`}
        />
      ),
      link: getRouteLocaleString(Routes.orderReturns, params), // "/profile/orders-returns",
      isActive: pathname?.includes("/profile/orders-returns") ?? false,
    },
    {
      key: "saved-addresses",
      name: getLabel("saved_addresses"),
      icon: (
        <SavedAddressIcon
          height={20}
          width={20}
          className="text-color-text-body group-hover:text-color-text-on-dark"
        />
      ),
      link: getRouteLocaleString(Routes.savedAddress, params), //"/profile/saved-addresses",
      isActive: pathname?.includes("/profile/saved-addresses") ?? false,
    },
  ];
  const { authUser, profilePicture, logoutUser } = useAuthStore();

  if (
    pathname?.includes("/profile/info") ||
    pathname?.includes("/profile/saved-addresses") ||
    pathname?.includes("/profile/orders-returns") ||
    pathname?.includes("/order-details")
  ) {
    if (isMobile) {
      return null;
    }
  }

  return (
    <Box
      className={`relative h-auto w-full bg-transparent pb-[40px] gap-header-to-title base:pl-3 base:pr-3 gtsm:max-w-[360px] gtsm:pl-4 gtsm:pr-0 gtlg:px-0`}
    >
      {/* For tab and Desktop Heading */}
      <Box className="base:hidden gtsm:mb-4 gtsm:flex">
        <Typography type="h1" className="text-color-text-body typography-heading-01">
          {getLabel("my_profile")}
        </Typography>
      </Box>

      <Box className="flex w-full items-start justify-center">
        <Box
          //@ts-ignore
          onPress={() => router.back()}
          className="mb-4 flex flex-row items-center bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtsm:hidden"
        >
          <Productnavigation />
          <Text className="ml-1 mt-[2px] text-color-text-body body-medium-md">
            {getLabel("back")}
          </Text>
        </Box>
      </Box>
      {/* sprint-21 related changes md:shadow-[0px_8px_26px_10px_rgba(0,0,0,0.10)] */}
      <Card className="flex w-full flex-col items-center rounded-[6px] border border-color-border-default bg-color-background-default p-0 base:h-auto base:shadow-none md:h-full">
        {/* Profile Image */}
        {/* Profile Image Container */}
        <Box className="relative mb-2 mt-6 flex h-[114px] w-[120px] flex-row items-center justify-center rounded-[4px] border border-color-background-l8">
          {/* Gray background with clipped corners - adjusted right bottom clip */}
          <Box className="absolute inset-0 bg-color-background-l3" />

          {/* Profile Image */}
          <Box className="relative h-[90px] w-[90px] overflow-hidden">
            <OGProfileImage
              src={profilePicture ?? ""}
              alt="Profile picture"
              className="object-cover"
              height={96}
              width={96}
              priority={true}
            />
          </Box>
        </Box>

        <Box className="max-w-full break-words px-3">
          <Text className="text-color-text-body body-bold-lg">
            {/* {authUser?.firstName && authUser?.lastName
              ? `${authUser?.firstName ?? ""} ${authUser?.lastName ?? ""}`
              : ""} */}
            {authUser && (authUser as AuthUserType)?.firstName
              ? `${(authUser as AuthUserType)?.firstName ?? ""} ${(authUser as AuthUserType)?.lastName ?? ""}`
              : ""}
          </Text>
        </Box>

        {/* Navigation Buttons */}
        <Box className="mt-8 flex w-full flex-col items-start gap-2 focus:outline-none base:px-5 md:px-[31px]">
          {navLinks?.map((link) => (
            <Box
              key={link.key}
              className={`group flex w-full flex-row items-center justify-start rounded-[8px] bg-transparent p-[24px] focus:outline-none active:bg-transparent active:outline-none md:cursor-pointer ${
                link.isActive
                  ? "md:bg-color-background-brand-emphasis"
                  : "bg-color-background-default hover:bg-color-background-visited-emphasis"
              }`}
              //@ts-ignore
              onClick={() => {
                router.push(link.link);
              }}
            >
              <Box className="min-w-[200px]">
                <Text className="flex flex-row items-center gap-4">
                  {React.cloneElement(link.icon as React.ReactElement, {
                    className: link.isActive
                      ? "text-color-text-on-dark"
                      : "text-color-text-body group-hover:text-color-text-on-dark",
                    height: 20,
                    width: 20,
                  })}
                  {/* TODO: no font */}
                  <Typography
                    className={`body-medium-md ${
                      link.isActive
                        ? "text-color-text-on-dark"
                        : "text-color-text-body group-hover:text-color-text-on-dark"
                    }`}
                  >
                    {link.name}
                  </Typography>
                </Text>
              </Box>
            </Box>
          ))}
          <Box
            // className={`flex w-full flex-row items-center justify-between border-y border-[#E4E7E9] bg-transparent p-[24px] hover:bg-transparent focus:bg-transparent active:bg-transparent md:hidden`}
            className={`flex w-full flex-row items-center justify-start bg-transparent p-[24px] hover:bg-transparent focus:bg-transparent active:bg-transparent md:hidden`}
            // @ts-ignore
            onClick={() => {
              persistLocaleForLogout({
                languageCountryParam: (params as Record<string, string>)?.["language-country"],
                pathname,
              });
              logoutUser();
              resetCart();
              logout({
                logoutParams: {
                  returnTo:
                    process.env.NODE_ENV === "development"
                      ? process.env.NEXT_PUBLIC_FRONTEND_DEV_URL
                      : process.env.NEXT_PUBLIC_FRONTEND_PROD_URL,
                },
              } as {
                logoutParams: {
                  returnTo: string;
                };
              });
            }}
          >
            <Box className="min-w-[200px]">
              <Text className="flex flex-row items-center gap-4">
                <Image src="/assets/profile/logout.svg" alt="Logout" height={20} width={20} />
                {/* TODO: font missing */}
                <Text className="text-color-text-body typography-body-01">
                  {getLabel("header_logout")}
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
