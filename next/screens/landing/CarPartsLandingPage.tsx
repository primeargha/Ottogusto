"use client";
import { Box } from "@/components/ui/box";
import React, { useEffect, useState, useRef } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getMMEId } from "@/utils/getMMEId";
import { useSearchParams, useParams } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import Typography from "@/components/og-components/Typography";
import { BrowseByCategory2 } from "@/screens/landing/browse-by-category-2";
import SearchContainer from "@/components/SearchContainer";
import CategoryCarSelectionBannerShellPlaceholder from "@/components/CategoryCarSelectionBannerShellPlaceholder";
import OGBreadcrumb from "@/components/og-components/OGBreadcrumb";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { isOttogusto } from "@/config/store-constants";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

const CarPartsLandingPage = () => {
  const { getLabel } = useBranding();
  // const { updateFilters } = useUrlParams();
  // const { SelectedCategoriesId } = useCategorySearchStore();
  const searchParams = useSearchParams();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const params = useParams();
  const languageCountry = (params?.["language-country"] as string) ?? "";
  const lang = languageCountry?.split("-")[0] ?? "en";
  const partsLabel =
    lang === "fr"
      ? "Pièces Auto"
      : lang === "nl"
        ? "Auto Onderdelen"
        : lang === "de"
          ? "Autoteile"
          : "Car Parts";
  const breadcrumbLinks = [
    // { label: "Home", href: `/${languageCountry}` },
    {
      label: getLabel("home"),
      href: `/${languageCountry}`,
    },
  ];
  const { generateMmeSearchData, selectedSavedCarInLandingPage, searchData } = useMmeStore();
  const [isMounted, setIsMounted] = useState(false);
  const isNewMmeFeatureEnabled = isMounted ? getClientFeatureFlag("new_mme_feature_flag") : false;
  const enableNewMmeBanner = !isMounted || isNewMmeFeatureEnabled;
  const isMmeFeatureEnabled = isMounted
    ? getClientFeatureFlag("mme_feature_flag")
    : !enableNewMmeBanner;
  // lastMakeModel stores the last confirmed Make + Model (only updated on Enter click)
  const [lastMakeModel, setLastMakeModel] = useState<string>("");
  const hasInitialized = useRef(false);
  const lastProcessedMakeModelTypeId = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle makeModelTypeId URL parameter on page load
  useEffect(() => {
    const makeModelTypeId = searchParams?.get("makeModelTypeId");
    if (makeModelTypeId) {
      // Generate MME search data from the URL parameter
      generateMmeSearchData(makeModelTypeId);
    }
  }, [searchParams, generateMmeSearchData]);

  useEffect(() => {
    const makeModelTypeId = searchParams?.get("makeModelTypeId") || null;

    // Only process if makeModelTypeId actually changed
    if (makeModelTypeId !== lastProcessedMakeModelTypeId.current) {
      lastProcessedMakeModelTypeId.current = makeModelTypeId;

      if (makeModelTypeId) {
        // Check if searchData matches the URL makeModelTypeId before updating heading
        // Note: searchData might not be updated yet if generateMmeSearchData is still running
        const currentSearchDataMMEId = getMMEId(searchData);
        if (currentSearchDataMMEId === makeModelTypeId && searchData?.make?.value) {
          // Update heading when URL makeModelTypeId changes and searchData matches
          const make = searchData.make?.value || "";
          const model = searchData.model?.value || "";
          const parts = [make, model].filter(Boolean);
          if (parts.length > 0) {
            setLastMakeModel(parts.join(" "));
          }
        }
      } else {
        // Clear heading when makeModelTypeId is removed from URL
        setLastMakeModel("");
        lastProcessedMakeModelTypeId.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams (URL), not searchData - intentionally excluded per requirements

  useEffect(() => {
    const makeModelTypeId = searchParams?.get("makeModelTypeId") || null;

    // Only update heading if:
    // 1. URL has makeModelTypeId
    // 2. searchData matches the URL makeModelTypeId
    // 3. We haven't already processed this makeModelTypeId (to avoid duplicate updates)
    if (makeModelTypeId && makeModelTypeId === lastProcessedMakeModelTypeId.current) {
      const currentSearchDataMMEId = getMMEId(searchData);
      if (currentSearchDataMMEId === makeModelTypeId && searchData?.make?.value) {
        // Update heading when searchData matches the current URL makeModelTypeId
        const make = searchData.make?.value || "";
        const model = searchData.model?.value || "";
        const parts = [make, model].filter(Boolean);
        if (parts.length > 0) {
          setLastMakeModel(parts.join(" "));
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData?.make?.value, searchData?.model?.value, searchData?.engine?.value]); // Only update when searchData changes, but only if it matches URL

  useEffect(() => {
    // Only initialize once when searchData becomes available (fallback for initial load)
    if (!hasInitialized.current && searchData?.make?.value) {
      const make = searchData.make?.value || "";
      const model = searchData.model?.value || "";
      const parts = [make, model].filter(Boolean);
      if (parts.length > 0) {
        setLastMakeModel(parts.join(" "));
        hasInitialized.current = true;
      }
    }
  }, [searchData?.make?.value, searchData?.model?.value]);

  // Handler for Enter button click from SearchContainer
  const handleEnterClick = () => {
    const make = searchData?.make?.value || "";
    const model = searchData?.model?.value || "";

    // Only update lastMakeModel if we have at least Make
    if (make) {
      // Format: "{Make}" or "{Make} {Model}"
      const parts = [make, model].filter(Boolean);
      setLastMakeModel(parts.join(" "));
    }
  };

  // Handler for Select car button click from SavedCarDropdownComponent
  const handleSelectCar = () => {
    const make = searchData?.make?.value || "";
    const model = searchData?.model?.value || "";

    // Only update lastMakeModel if we have at least Make
    if (make) {
      // Format: "{Make}" or "{Make} {Model}"
      const parts = [make, model].filter(Boolean);
      setLastMakeModel(parts.join(" "));
    }
  };

  // Determine the display heading
  const displayHeading = lastMakeModel
    ? `${getLabel("category_results_page_title")} ${lastMakeModel}`.trim()
    : getLabel("what_kind_of_parts");

  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }

  return (
    <Box className={`bg-color-background-default`}>
      {/* SearchContainer at the top */}
      {enableNewMmeBanner ? (
        <CategoryCarSelectionBannerShellPlaceholder enableNewMmeBanner />
      ) : (
        isMmeFeatureEnabled && (
          <SearchContainer onEnterClick={handleEnterClick} onSelectCar={handleSelectCar} />
        )
      )}
      <Box className="flex w-full flex-col gap-content-to-footer base:gap-6 gtsm:gap-6 gtlg:gap-8">
        <Box className="section-standard">
          <OGBreadcrumb links={breadcrumbLinks} active={getLabel("car_parts")} />
        </Box>
        <Box className="section-standard">
          <Typography type="h1" className="text-color-text-emphasis typography-heading-01" hasBack>
            {displayHeading}
          </Typography>
        </Box>
        <Box className="section-standard">
          <p className="leading-relaxed text-color-text-muted typography-body-02">
            {getLabel("car_parts_landing_description")}
          </p>
        </Box>
        <BrowseByCategory2 />
      </Box>
    </Box>
  );
};

export default CarPartsLandingPage;
