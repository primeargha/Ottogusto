"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import { useFitmentDetails } from "@/hooks/useFitmentDetails";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE, STORE_IDS } from "@/config/store-constants";
import { parseHtmlToString } from "@/utils/html-parser";
import SkeletonReturnPolicy from "../return-policy/SkeletonReturnPolicy";

export default function FitmentDetailsPage() {
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  const { getLabel } = useBranding();
  const params = useParams();
  const languageCode =
    (params?.["language-country"]?.toString().split("-")[0] ?? "EN").toUpperCase() || "EN";
  const {
    data: htmlContent = "",
    isLoading,
    error,
  } = useFitmentDetails(languageCode, currentStore);
  return (
    <Box
      className={`flex h-full w-full flex-col items-center justify-center gap-6 bg-color-background-default pb-[10px] gap-content-to-footer gap-header-to-title gtlg:px-[38px]`}
    >
      {/* heading */}
      <Box className="flex w-full flex-row items-center section-gutter gap-title-to-content layout-width-text base:gap-3 base:px-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
        <Typography type="h1" className="text-color-text-body typography-heading-01" hasBack>
          {getLabel("fitment_details")}
        </Typography>
      </Box>
      {/*  */}
      {/* Loading state - Reuse SkeletonReturnPolicy since layout is identical */}
      {isLoading && (
        <Box className="layout-width-text base:px-3 gtsm:px-3 gtlg:px-0">
          <SkeletonReturnPolicy />
        </Box>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Box className="flex h-screen w-full items-center justify-center layout-width-text">
          <Box className="flex -translate-y-32 flex-col items-center justify-center gap-4 text-center">
            <Typography type="h1" className="text-color-text-default typography-display-01">
              {getLabel("error_fitment_details")}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Content state - Show actual content */}
      {/* Content state - Show actual content */}
      {!isLoading && !error && htmlContent && (
        <Box className="layout-width-text base:px-3 gtsm:px-3 gtlg:px-0">
          <Box
            className="prose prose-sm"
            // @ts-ignore
            dangerouslySetInnerHTML={{
              __html: parseHtmlToString(htmlContent, currentStore),
            }}
          />
        </Box>
      )}
    </Box>
  );
}
