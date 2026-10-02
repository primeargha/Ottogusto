"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatTitle, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import type { CategoryNode } from "@/types/categories";
import { OGButton } from "@/components/og-components/OGButton";
import { truncateLabel } from "@/utils/languageFormating";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { appendCategorySearchQuery, getCarIdsFromSearchParams } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useNavigationVin } from "@/hooks/useNavigationCarIds";

interface CategoryL2SectionProps {
  l1Category: CategoryNode;
}

function getTitle(node: CategoryNode, locale: string): string {
  const title = node.titles?.[locale] || node.name || "";
  return title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryL2Section({ l1Category }: CategoryL2SectionProps) {
  const { getLocale, getLabel } = useBranding();
  const locale = getLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const navigationVin = useNavigationVin();
  const l2Categories = l1Category.children || [];
  const [selectedL2, setSelectedL2] = useState<CategoryNode | null>(l2Categories[0] || null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLDivElement>(null);
  const tabSectionRef = useRef<HTMLDivElement>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);

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

  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const runSmoothScroll = useCallback((targetY: number) => {
    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }
    const startY = window.scrollY;
    const diff = targetY - startY;
    const duration = 600;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (elapsed < duration) {
        scrollAnimationFrameRef.current = requestAnimationFrame(step);
      }
    };
    scrollAnimationFrameRef.current = requestAnimationFrame(step);
  }, []);

  const scrollToTabs = useCallback(() => {
    requestAnimationFrame(() => {
      if (tabSectionRef.current) {
        const stickyHeader = document.getElementById("site-header-sticky");
        const headerHeight = stickyHeader?.getBoundingClientRect().height ?? 108;
        const scrollGap = 16;
        const rect = tabSectionRef.current.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - (headerHeight + scrollGap);
        runSmoothScroll(targetY);
      }
    });
  }, [runSmoothScroll]);

  useEffect(() => {
    if (!selectedTabRef.current || !tabContainerRef.current) return;
    const container = tabContainerRef.current;
    const tab = selectedTabRef.current;
    const scrollLeft = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [selectedL2?.id]);

  const handleL2TabClick = (l2: CategoryNode) => {
    setSelectedL2(l2);
    scrollToTabs();
  };
  const truncateLabel = (text: string, limit = 15) => {
    return {
      text: text.slice(0, limit),
      truncated: text.length > limit,
    };
  };

  return (
    <Box className="flex w-full flex-col gap-stack">
      {/* L2 Cards Grid */}
      <Box className="section-standard">
        <Box className="grid grid-cols-3 grid-gap-listing base:grid-cols-2 gtsm:grid-cols-4 gtlg:grid-cols-5">
          {l2Categories.map((l2) => {
            const fullText = formatTitle(getTitle(l2, locale), "en") as string;
            const { text, truncated } = truncateLabel(fullText);
            const imgUrl = getCategoryImageUrl(l2.id, { height: 140, quality: 80 });
            return (
              <Pressable
                key={l2.id}
                onPress={() => handleL2TabClick(l2)}
                className={`flex h-[72px] max-h-[72px] flex-row items-start gap-2 rounded-[6px] border bg-color-background-default px-2 py-1 hover:border-color-border-focus hover:bg-color-background-default base:w-full base:max-w-full gtsm:w-full gtsm:max-w-full gtlg:w-full gtlg:max-w-full ${
                  selectedL2?.id === l2.id
                    ? "border-2 border-color-border-default"
                    : "border-color-border-emphasis"
                }`}
              >
                <Box className="flex h-16 max-h-16 w-auto items-center justify-center py-3">
                  <Image
                    height={64}
                    width={64}
                    alt={getTitle(l2, locale)}
                    title={getTitle(l2, locale)}
                    src={imgUrl}
                    unoptimized
                  />
                </Box>
                <Box className="flex min-h-[64px] items-center justify-center border-color-border-emphasis py-4">
                  {truncated ? (
                    <CustomTooltip content={fullText}>
                      <Typography className="line-clamp-2 text-start text-color-text-default typography-button-01">
                        {text}...
                      </Typography>
                    </CustomTooltip>
                  ) : (
                    <Typography className="line-clamp-2 text-start text-color-text-default typography-button-01">
                      {text}
                    </Typography>
                  )}
                </Box>
              </Pressable>
            );
          })}
        </Box>
      </Box>

      {/* L2 Tabs + L3 Grid */}
      {selectedL2 && (
        <Box ref={tabSectionRef as any} className="flex w-full flex-col gap-4">
          {/* Tab bar */}
          <Box className="section-standard">
            <Box
              ref={tabContainerRef as any}
              className="overflow-x-hidden scroll-smooth border-b border-color-border-default scrollbar-hide"
            >
              <Box className="flex w-full flex-row gap-2 p-0">
                {l2Categories.map((l2) => {
                  const isActive = selectedL2.id === l2.id;
                  return (
                    <Pressable
                      key={l2.id}
                      onPress={() => handleL2TabClick(l2)}
                      ref={isActive ? (selectedTabRef as React.RefObject<any>) : null}
                      className={`flex-shrink-0 px-4 py-3 ${
                        isActive ? "border-b-2 border-color-border-focus" : ""
                      }`}
                    >
                      <Typography
                        className={`whitespace-nowrap typography-body-strong-01 hover:text-color-text-brand ${
                          isActive ? "font-semibold text-color-text-brand" : "text-color-text-muted"
                        }`}
                      >
                        {formatTitle(getTitle(l2, locale), "en") as any}
                      </Typography>
                    </Pressable>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* L3 cards grid */}
          <Box className="gap-space-md section-standard">
            <Box className="grid grid-cols-2 grid-gap-listing gtsm:grid-cols-4">
              {(selectedL2.children || []).map((l3) => {
                const l3ImgUrl = getCategoryImageUrl(l3.id, { width: 64, quality: 80 });
                return (
                  <Link key={l3.id} href={buildSearchUrl(l3.id)}>
                    <Box className="group flex min-h-[64px] w-full cursor-pointer flex-row items-center justify-start gap-2 rounded-[6px] border border-color-border-default bg-color-background-default py-1 pl-2 pr-3 transition-all hover:border-color-border-focus active:border-color-border-focus">
                      <Image
                        className="h-14 w-14 lg:h-16 lg:w-16"
                        width={64}
                        height={64}
                        alt={getTitle(l3, locale)}
                        title={getTitle(l3, locale)}
                        src={l3ImgUrl}
                        unoptimized
                      />
                      <span className="line-clamp-2 flex-1 text-color-text-emphasis typography-body-02">
                        {formatTitle(getTitle(l3, locale), "en") as any}
                      </span>
                    </Box>
                  </Link>
                );
              })}
            </Box>

            {/* View all link */}
            <Box className="flex items-center justify-center">
              <OGButton
                type="ghost"
                size="medium"
                className="text-color-text-brand typography-body-strong-02 between-0-640:w-full"
                href={buildSearchUrl(selectedL2.id)}
              >
                {getLabel("CarParts_L2_viewall", {
                  category: formatTitle(getTitle(selectedL2, locale), "en").toLocaleLowerCase(),
                })}
              </OGButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
