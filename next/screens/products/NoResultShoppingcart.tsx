"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import useRouter from "@unitools/router";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import noResult from "@/assets/noresultUI.svg";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import Typography from "@/components/og-components/Typography";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export default function NoResultShoppingcart() {
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  return (
    <Box className="mx-auto flex h-full flex-col items-center justify-center gap-6 bg-transparent base:mt-24 base:max-w-[390px] gtsm:mt-32 md:max-w-[500px]">
      <Image
        className={`${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[200px]" : "lg:ml-0"} h-auto`}
        src={noResult}
        alt="no result"
        width={211}
        height={220}
        quality={100}
        priority
      />

      <Typography type="h3" className="w-full text-center text-color-text-body">
        {getLabel("no_products_shoppingcart")}
      </Typography>
      <OGButton
        size="medium"
        type="primary"
        state="default"
        onClick={() => router.push(getRouteLocaleString(Routes.pitStop, params))}
      >
        {getLabel("start_shopping")}
      </OGButton>
    </Box>
  );
}
