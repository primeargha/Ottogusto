"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import { useReturnPolicy } from "@/hooks/return-policy";
import SkeletonReturnPolicy from "./SkeletonReturnPolicy";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE, STORE_IDS } from "@/config/store-constants";

import { parseHtmlToString } from "@/utils/html-parser";
import { useEffect } from "react";

export default function ReturnPolicy() {
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  const { getLabel } = useBranding();
  const params = useParams();
  const languageCode = (
    params?.["language-country"]?.toString().split("-")[0] ?? "EN"
  ).toUpperCase();
  const { data: htmlContent = "", isLoading, error } = useReturnPolicy(languageCode, currentStore);
  useEffect(() => {
    if (!isLoading && htmlContent) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isLoading, htmlContent]);
  const htmlDecode = (str: string) => {
    return new DOMParser().parseFromString(str, "text/html").documentElement.textContent;
  };
  let htmlContentDynamic = htmlContent;

  // Ottogusto CDN Files are html document instead of raw html
  if (process.env.NEXT_PUBLIC_STORE === STORE_IDS.OTTOGUSTO) {
    htmlContentDynamic = new DOMParser().parseFromString(htmlContent, "text/html").body.innerHTML;
    htmlContentDynamic = htmlDecode(htmlContentDynamic);
  }

  return (
    <Box
      className={`flex h-full w-full flex-col gap-6 bg-color-background-default pb-[10px] gap-content-to-footer gap-header-to-title gtlg:px-[38px]`}
    >
      {/* heading */}
      <Box className="flex w-full flex-row items-center base:gap-3 base:px-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
        {/* <Productnavigation /> */}
        <Typography
          type="h1"
          className="text-color-text-body typography-heading-01"
          isOverrideBackButton
          hasBack
        >
          {getLabel("return_policy")}
        </Typography>
      </Box>

      {/* Loading state - Show skeleton */}
      {isLoading && (
        <Box className="base:px-3 gtsm:px-3 gtlg:px-0">
          <SkeletonReturnPolicy />
        </Box>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Box className="flex h-screen w-full items-center justify-center">
          <Box className="flex -translate-y-32 flex-col items-center justify-center gap-4 text-center">
            <Typography type="h1" className="text-color-text-default typography-display-01">
              {getLabel("error_loading_policy")}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Content state - Show actual content */}
      {!isLoading &&
        !error &&
        htmlContent &&
        (() => {
          const content = parseHtmlToString(htmlContent, currentStore);

          return (
            <Box className="base:px-3 gtsm:px-3 gtlg:px-0">
              <Box
                className="prose prose-sm"
                // @ts-ignore
                dangerouslySetInnerHTML={{ __html: htmlContentDynamic }}
              />
            </Box>
          );
        })()}
    </Box>
  );
}
