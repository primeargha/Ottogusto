"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box } from "@/components/ui/box";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatTitle, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import type { CategoryNode } from "@/types/categories";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { toSentenceCase } from "@/utils/languageFormating";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { appendCategorySearchQuery, getCarIdsFromSearchParams } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useNavigationVin } from "@/hooks/useNavigationCarIds";

interface CategoryL3GridProps {
  l2Category: CategoryNode;
  locale: string;
}

function getTitle(node: CategoryNode, locale: string): string {
  return node.titles?.[locale] || node.name || "";
}

export default function CategoryL3Grid({ l2Category, locale }: CategoryL3GridProps) {
  const params = useParams();
  const { getLocale, getLabel } = useBranding();
  const searchParams = useSearchParams();
  const navigationVin = useNavigationVin();
  const buildSearchUrl = useCallback(
    (categoryId: string): string => {
      // Active car = URL `carIds` only. Guest session history must not re-attach after deselect.
      const urlCarIds = getCarIdsFromSearchParams(searchParams);
      const manufacturerIds = searchParams?.get("manufacturerIds") ?? null;

      if (
        getClientFeatureFlag("new_mme_feature_flag") &&
        urlCarIds.length > 0 &&
        params?.["language-country"]
      ) {
        return appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
          categoryId,
          carIds: urlCarIds,
          ...(navigationVin ? { vin: navigationVin } : {}),
          ...(manufacturerIds ? { manufacturerIds } : {}),
        });
      }

      return appendCategorySearchQuery(getRouteLocaleString(Routes.viewCategory, params), {
        categoryId,
        ...(manufacturerIds ? { manufacturerIds } : {}),
      });
    },
    [navigationVin, params, searchParams],
  );

  const l3Categories = l2Category.children || [];
  const l2Title = getTitle(l2Category, locale);

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="gap-space-md section-standard">
        <Box className="grid grid-cols-2 grid-gap-listing gtsm:grid-cols-4">
          {l3Categories?.map((l3) => {
            const l3ImgUrl = getCategoryImageUrl(l3.id, { width: 64, quality: 80 });
            return (
              <Link key={l3.id} href={buildSearchUrl(l3.id)}>
                <Box className="group flex min-h-[64px] w-full cursor-pointer flex-row items-center justify-start gap-2 rounded-[6px] border border-color-border-default bg-color-background-default py-1 pl-2 pr-3 transition-all hover:border-color-border-focus active:border-color-border-focus">
                  <Image
                    className="h-14 w-14 lg:h-16 lg:w-16"
                    width={64}
                    height={64}
                    sizes="64px"
                    alt={getTitle(l3, locale)}
                    title={getTitle(l3, locale)}
                    src={l3ImgUrl}
                  />
                  <span className="line-clamp-2 flex-1 text-color-text-emphasis typography-body-02">
                    {formatTitle(getTitle(l3, locale), "en") as any}
                  </span>
                </Box>
              </Link>
            );
          })}
        </Box>

        <Box className="flex items-center justify-center">
          {/* <Link
            href={buildSearchUrl(l2Category.id)}
            className="font-medium text-color-text-link typography-body-02 hover:underline"
          >
            View all {l2Title} parts
          </Link> */}

          <OGButton
            type="ghost"
            size="medium"
            className="text-color-text-brand typography-body-strong-02 between-0-640:w-full"
            href={buildSearchUrl(l2Category.id)}
          >
            {getLabel("CarParts_L2_viewall", {
              category: toSentenceCase(l2Title).toLocaleLowerCase(),
            })}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
