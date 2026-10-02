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
import Productnavigation from "@/components/og-components/Productnavigation";
import { useMmeStore } from "@/stores/useMmeStore";
import { useSearchParams } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { toSentenceCase } from "@/utils/languageFormating";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

interface CategoryL1ClientShellProps {
  l1Title: string;
  partsLabel: string;
  partsHref: string;
  languageCountry: string;
  enableNewMmeBanner: boolean;
  children: React.ReactNode;
}

export default function CategoryL1ClientShell({
  l1Title,
  partsLabel,
  partsHref,
  languageCountry,
  enableNewMmeBanner,
  children,
}: CategoryL1ClientShellProps) {
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const displayHeading = lastMakeModel ? `${l1Title} for ${lastMakeModel}` : l1Title;

  const vehicleContext = getVehicleContextFromSearchParams(searchParams, {
    includeCarIds: enableNewMmeBanner,
  });

  const breadcrumbLinks = [
    {
      label: getLabel("home"),
      href: `/${languageCountry}`,
    },
    {
      label: getLabel("car_parts"),
      href: appendVehicleContextToHref(partsHref, vehicleContext),
    },
  ];

  const isMobile = useMedia("(max-width: 639px)", false);

  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }

  return (
    <Box className="bg-color-background-default">
      {enableNewMmeBanner ? (
        <CategoryCarSelectionBannerShellPlaceholder enableNewMmeBanner />
      ) : (
        isMmeFeatureEnabled && (
          <SearchContainer onEnterClick={handleEnterClick} onSelectCar={handleSelectCar} />
        )
      )}
      <Box className="flex w-full flex-col">
        <Box className="section-standard">
          <OGBreadcrumb links={breadcrumbLinks} active={toSentenceCase(l1Title)} />
        </Box>

        <Box className="flex flex-col gap-content-to-footer">
          <Box className="gap-header-to-title gap-title-to-content section-standard">
            <Box className="flex flex-row items-center gap-4">
              {!isMobile && <Productnavigation />}
              <Typography type="h1" className="text-color-text-emphasis typography-heading-01">
                {displayHeading}
              </Typography>
            </Box>
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
