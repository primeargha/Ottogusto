"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import SearchContainer from "@/components/SearchContainer";
import CategoryCarSelectionBannerShellPlaceholder from "@/components/CategoryCarSelectionBannerShellPlaceholder";
import {
  appendVehicleContextToHref,
  getVehicleContextFromSearchParams,
} from "@/utils/categorySearchUrl";
import Typography from "@/components/og-components/Typography";
import OGBreadcrumb from "@/components/og-components/OGBreadcrumb";
import { useMmeStore } from "@/stores/useMmeStore";
import { useSearchParams } from "next/navigation";
import { Routes } from "@/config/routes";
import Productnavigation from "@/components/og-components/Productnavigation";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { toSentenceCase } from "@/utils/languageFormating";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

interface CategoryL3DynamicHeaderProps {
  l1Title: string;
  l2Title: string;
  l3Title: string;
  l1Slug: string;
  l2Slug: string;
  partsHref: string;
  languageCountry: string;
  enableNewMmeBanner: boolean;
  onVinInvalidChange?: (invalid: boolean) => void;
}

export default function CategoryL3DynamicHeader({
  l1Title,
  l2Title,
  l3Title,
  l1Slug,
  l2Slug,
  partsHref,
  languageCountry,
  enableNewMmeBanner,
  onVinInvalidChange,
}: CategoryL3DynamicHeaderProps) {
  const searchParams = useSearchParams();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const { getLabel } = useBranding();
  const { searchData } = useMmeStore();
  const [lastMakeModel, setLastMakeModel] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const isMmeFeatureEnabled = isMounted
    ? getClientFeatureFlag("mme_feature_flag")
    : !enableNewMmeBanner;
  const isMobile = useMedia("(max-width: 639px)", false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onVinInvalidChange?.(vinUrlInvalid || carIdsUrlInvalid);
  }, [vinUrlInvalid, carIdsUrlInvalid, onVinInvalidChange]);

  useEffect(() => {
    const make = searchData?.make?.value || "";
    const model = searchData?.model?.value || "";
    if (make) {
      setLastMakeModel([make, model].filter(Boolean).join(" "));
    }
  }, [searchData?.make?.value, searchData?.model?.value]);

  const handleEnterClick = () => {
    const make = searchData?.make?.value || "";
    const model = searchData?.model?.value || "";
    if (make) {
      setLastMakeModel([make, model].filter(Boolean).join(" "));
    }
  };

  const handleSelectCar = () => {
    const make = searchData?.make?.value || "";
    const model = searchData?.model?.value || "";
    if (make) {
      setLastMakeModel([make, model].filter(Boolean).join(" "));
    }
  };

  const displayHeading = lastMakeModel ? `${l3Title} for ${lastMakeModel}` : l3Title;

  const vehicleContext = getVehicleContextFromSearchParams(searchParams, {
    includeCarIds: enableNewMmeBanner,
  });
  const l1Href = appendVehicleContextToHref(
    Routes.categoryL1(languageCountry, l1Slug),
    vehicleContext,
  );
  const l2Href = appendVehicleContextToHref(
    Routes.categoryL2(languageCountry, l1Slug, l2Slug),
    vehicleContext,
  );

  const breadcrumbLinks = [
    {
      label: getLabel("home"),
      href: `/${languageCountry}`,
    },
    {
      label: getLabel("car_parts"),
      href: appendVehicleContextToHref(partsHref, vehicleContext),
    },
    { label: toSentenceCase(l1Title), href: l1Href },
    { label: toSentenceCase(l2Title), href: l2Href },
  ];

  return (
    <>
      {enableNewMmeBanner ? (
        <CategoryCarSelectionBannerShellPlaceholder enableNewMmeBanner />
      ) : (
        isMmeFeatureEnabled && (
          <SearchContainer onEnterClick={handleEnterClick} onSelectCar={handleSelectCar} />
        )
      )}
      <Box className="section-standard">
        <OGBreadcrumb links={breadcrumbLinks} active={toSentenceCase(l3Title)} />
      </Box>
      <Box className="gap-header-to-title gap-title-to-content section-standard">
        <Box className="flex flex-row items-center gap-4">
          {!isMobile && <Productnavigation />}
          <Typography type="h1" className="text-color-text-emphasis typography-heading-01">
            {displayHeading}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
