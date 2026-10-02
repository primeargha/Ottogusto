"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import OGBreadcrumb from "@/components/og-components/OGBreadcrumb";
import { Box } from "@/components/ui/box";
import SearchContainer from "@/components/SearchContainer";
import CategoryCarSelectionBannerShellPlaceholder from "@/components/CategoryCarSelectionBannerShellPlaceholder";
import { useBranding } from "@/contexts/BrandingContext";
import { Routes } from "@/config/routes";
import { formatTitle } from "@/helpers/UtilityHelper";
import type { ManufacturerBySlug } from "@/services/products";
import {
  appendVehicleContextToHref,
  getVehicleContextFromSearchParams,
} from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { toSentenceCase } from "@/utils/languageFormating";

type Props = {
  brand: ManufacturerBySlug;
  languageCountry: string;
  brandSlug: string;
  l3Title: string;
  l3Description: string;
  enableNewMmeBanner: boolean;
  children: React.ReactNode;
};

/**
 * Car Part Brand × L3 shell (OD-2433).
 * Manufacturer id for Parts / View-all SRP comes from `brand.id` (slug API), not the URL.
 * Vehicle context = optional `carIds` / `vin` only.
 * Body copy = L3 category description only (`GET /Category/{id}`), not brand + SEO template.
 */
export default function CarPartBrandL3Page({
  brand,
  languageCountry,
  brandSlug,
  l3Title,
  l3Description,
  enableNewMmeBanner,
  children,
}: Props) {
  const { getLabel, getLocale } = useBranding();
  const lang = languageCountry.split("-")[0] || "en";
  const locale = (getLocale() as string) || lang;
  const searchParams = useSearchParams();
  const listHref = Routes.manufacturers(languageCountry).replace(/\/$/, "");
  const brandHref = Routes.carPartBrand(languageCountry, brandSlug);
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();

  const [isMounted, setIsMounted] = useState(false);
  const isMmeFeatureEnabled = isMounted
    ? getClientFeatureFlag("mme_feature_flag")
    : !enableNewMmeBanner;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const vehicleContext = getVehicleContextFromSearchParams(searchParams, {
    includeCarIds: enableNewMmeBanner,
  });

  const breadcrumbLinks = [
    { label: getLabel("home"), href: `/${languageCountry}` },
    {
      label: getLabel("car_part_brands"),
      href: appendVehicleContextToHref(listHref, vehicleContext),
    },
    {
      label: toSentenceCase(brand.name, locale as string),
      href: appendVehicleContextToHref(brandHref, vehicleContext),
    },
  ];

  const h1Text = `${brand.name} ${formatTitle(l3Title, locale as "en" | "fr" | "nl")}`.trim();
  const bodyDescription = l3Description.trim();

  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }

  return (
    <Box className="flex w-full flex-col bg-color-background-default">
      {enableNewMmeBanner ? (
        <CategoryCarSelectionBannerShellPlaceholder enableNewMmeBanner />
      ) : (
        isMmeFeatureEnabled && <SearchContainer />
      )}

      <Box className="flex w-full flex-col gap-content-to-footer base:gap-6 gtsm:gap-6 gtlg:gap-8">
        <Box className="section-standard">
          <OGBreadcrumb
            links={breadcrumbLinks}
            active={formatTitle(l3Title, locale as "en" | "fr" | "nl")}
          />
        </Box>

        <Box className="flex flex-col gap-space-md section-standard">
          <Box className="flex flex-row items-center gap-title-to-content">
            {/* {brand.image ? (
              <Box className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-color-border-emphasis bg-color-background-emphasis gtsm:h-16 gtsm:w-16">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain p-2"
                  unoptimized
                  priority
                />
              </Box>
            ) : null} */}
            <Typography
              type="h1"
              className="text-color-text-emphasis typography-heading-01"
              hasBack
            >
              {h1Text}
            </Typography>
          </Box>
          {bodyDescription ? (
            <Typography className="text-color-text-muted typography-body-01" type="p">
              {bodyDescription}
            </Typography>
          ) : null}
        </Box>

        {children}
      </Box>
    </Box>
  );
}
