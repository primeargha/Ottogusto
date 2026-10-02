"use client";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthStore } from "@/stores/useAuthStore";
import ArrowRight from "@/assets/checkout-options/arrow-right.svg";
import React, { useEffect } from "react";
import { OGButton } from "@/components/og-components/OGButton";
import Image from "next/image";
import { useMedia } from "@/hooks/useMedia";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useCheckoutHref, useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";
export default function CheckoutOptions() {
  const router = useRouter();
  const pathname = usePathname();
  const shoppingCartHref = useShoppingCartHref();
  const checkoutHref = useCheckoutHref();
  const { getLabel } = useBranding();
  const { openLoginModal, isAuthenticated } = useAuthStore();
  const { cartitems } = useCartStore();
  const isMobile = useMedia("(max-width: 639px)");
  useEffect(() => {
    if (isAuthenticated && cartitems?.length > 0) {
      router.push(checkoutHref);
    }
    if (cartitems?.length === 0) {
      router.push(shoppingCartHref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  return (
    <Box className="relative h-full w-full bg-eb-panel-hero-image bg-cover bg-center bg-no-repeat base:block base:px-[24px] base:pt-[139px] gtsm:px-[60px] gtsm:pt-[225px] ml:flex ml:flex-row ml:items-center ml:justify-center ml:px-0 ml:pt-0">
      <Box className="absolute inset-0 bg-[--background-white] opacity-70" />
      <Box className="flex flex-col items-center gap-[24px] base:w-full ml:mx-auto ml:max-w-[1112px]">
        {/* Main heading */}
        <Text className="font-Anton font-normal text-color-text-body base:text-[28px] base:leading-[40px] gtsm:text-[44px] gtsm:leading-[52px] ml:text-[72px] ml:leading-[84px]">
          {getLabel("checkout_before_road")}
        </Text>
        {/* Sub heading */}
        <Text className="font-Overpass font-normal text-color-text-body base:text-[16px] base:leading-[18px] gtsm:text-[18px] gtsm:leading-[20px] ml:text-[24px] ml:leading-[26px]">
          {getLabel("checkout_pit_stop")}
        </Text>

        {/* Points */}

        <Box className="flex flex-col gap-[18px]">
          <Box className="flex flex-row gap-[18px]">
            <Text className="font-Overpass font-bold text-color-text-body base:text-[16px] base:leading-[18px]">
              ✔
            </Text>

            <Text className="font-bold text-color-text-body base:text-[14px] base:leading-[16px] ml:text-[16px] ml:leading-[18px]">
              {getLabel("checkout_speed_title")}
              {!isMobile && ":"}
              {!isMobile && (
                <Text className="font-Overpass font-normal text-color-text-body base:text-[14px] base:leading-[16px] ml:text-[16px] ml:leading-[18px]">
                  {" "}
                  {getLabel("checkout_speed_desc")}
                </Text>
              )}
            </Text>
          </Box>
          <Box className="flex flex-row gap-[18px]">
            <Text className="font-Overpass font-bold text-color-text-body base:text-[16px] base:leading-[18px]">
              ✔
            </Text>

            <Text className="font-bold text-color-text-body base:text-[14px] base:leading-[16px] ml:text-[16px] ml:leading-[18px]">
              {getLabel("checkout_garage_title")}
              {!isMobile && ":"}
              {!isMobile && (
                <Text className="font-Overpass font-normal text-color-text-body base:text-[14px] base:leading-[16px] ml:text-[16px] ml:leading-[18px]">
                  {" "}
                  {getLabel("checkout_garage_desc")}
                </Text>
              )}
            </Text>
          </Box>
        </Box>

        {/* Buttons */}
        <Box className="flex items-center gap-[24px] base:flex-col gtsm:flex-row">
          <OGButton
            type="primary"
            size="large"
            rightcomp={<Image src={ArrowRight} alt="arrow-right" height={20} width={20} />}
            className="base:w-[207px] gtsm:w-auto"
            onClick={() => {
              openLoginModal(pathname ?? undefined);
            }}
          >
            {getLabel("checkout_login_register")}
          </OGButton>
          <OGButton
            onClick={() => {
              router.push(checkoutHref);
            }}
            type="outlined"
            size="large"
            className="base:w-[207px] gtsm:w-auto"
          >
            {getLabel("checkout_continue_guest")}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
