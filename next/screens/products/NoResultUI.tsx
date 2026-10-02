import React from "react";

import { Box } from "@/components/ui/box";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import { useParams, useRouter } from "next/navigation";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useOgSearchTabStore } from "@/stores/useOgSearchTabStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import Typography from "@/components/og-components/Typography";
import noResult from "../../public/assets/products/no-result2.png";

export default function NoResultUI() {
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  const { setActiveTab } = useOgSearchTabStore();
  const { openOgSearchModal, setIsOgSearch } = useSearchModalStore();

  const go = (routeCallback: any) => {
    if (params && typeof params["language-country"] === "string") {
      return router.push(routeCallback(params["language-country"]));
    }
  };
  // here is the problem
  return (
    <Box className="flex h-auto flex-col items-center justify-center bg-transparent base:w-full">
      <Box className="mt-5 flex flex-col items-center justify-center gap-6 gtsm:max-w-[404px]">
        <Image
          className="w-[211px] object-cover"
          src={noResult}
          alt="no result"
          height={220}
          width={211}
          quality={100}
          priority
        />

        <Typography type="h2" className="text-center text-color-text-body">
          {getLabel("no_products_found")}
        </Typography>
        <OGButton
          size="medium"
          type="primary"
          state="default"
          onClick={() => {
            const locale = getRouteLocaleString(Routes.support, params);
            // Navigate to support page with "Part Query" category pre-selected
            router.push(`${locale}/part-query`);
          }}
        >
          {getLabel("ask_support")}
        </OGButton>
        <Text className="text-center text-color-text-body body-regular-sm">
          {getLabel("no_products_found_desc")}{" "}
          <Text
            //@ts-ignore
            onClick={() => {
              router.push(`${getRouteLocaleString(Routes.pitStop, params)}#browse-by-category`);
              // need to scroll to the category selection of pit stop page.

              // debugger;
              // router.back();
              // openOgSearchModal();
              // // set isOgSearch to true
              // setIsOgSearch(true);
              // go(Routes.categoriessearch);
              // setActiveTab("category");
            }}
            className="cursor-pointer text-color-text-body underline body-regular-sm"
          >
            {getLabel("no_products_found_desc_link_to_og_search")}
          </Text>
          {/* plz fix here Himashu da (OD-919)*/}
        </Text>
      </Box>
    </Box>
  );
}
