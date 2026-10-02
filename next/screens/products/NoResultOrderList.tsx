"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import useRouter from "@unitools/router";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import noResult from "../../public/assets/products/noordercartoon.png";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";

export default function NoResultOrderList() {
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  return (
    <Box className="mx-auto flex h-full flex-col items-center justify-center gap-[24px] bg-transparent base:max-w-[390px] ml:max-w-[404px]">
      <Image
        className="ml-[230px] w-full"
        src={noResult}
        alt="no result"
        width={211}
        height={220}
        quality={100}
        priority
      />

      <Text className="text-center font-Anton text-[22px] font-normal leading-[28px] text-[--black]">
        {getLabel("no_orders_placed")}
      </Text>
      <OGButton
        size="medium"
        type="primary"
        state="default"
        onClick={() => router.push(getRouteLocaleString(Routes.pitStop, params))}
      >
        {getLabel("start_shopping_Noorder")}
      </OGButton>
    </Box>
  );
}
