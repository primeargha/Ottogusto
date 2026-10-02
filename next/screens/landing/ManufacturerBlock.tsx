"use client";

import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { useState } from "react";
import Image from "next/image";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useManufacturersQuery } from "@/hooks/manufacturers";
import { Routes } from "@/config/routes";
import { pathnameIncludesManufacturersRouteSegment } from "@/config/url-segments";
import { appendVehicleContextToHref } from "@/utils/categorySearchUrl";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import OGManufacturerSkeleton, {
  HOME_MANUFACTURER_VISIBLE_COUNT,
  LIST_MANUFACTURER_GRID_CLASS,
  ManufacturerGridHeightShell,
  MANUFACTURER_GRID_CLASS,
} from "@/components/og-components/OGManufacturerSkeleton";
import OGBreadcrumb from "@/components/og-components/OGBreadcrumb";
import { slugifyManufacturerForPdp } from "@/utils/legacyPartPdp";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { shouldNofollowBreadcrumbHref } from "@/utils/seoUrlParams";
import { unwrapManufacturerList, type ManufacturerListItem } from "@/services/products";

type ManufacturerBlockProps = {
  /** SSR list from `GET /Manufacturer` — brand `<Link>`s appear in the initial HTML for crawlers. */
  initialManufacturers?: ManufacturerListItem[] | undefined;
  /**
   * SSR map: manufacturer id → brand landing **or** search-results href when
   * `GET /Category?brandId=` is empty (so hover/crawlers never see empty landings).
   */
  brandHrefById?: Record<string, string> | undefined;
};

const ITEMS_PER_ROW_DESKTOP = 9;
const INITIAL_VISIBLE_ROWS = 2;

// On desktop: 9 × 2 = 18 items initially visible
// On mobile : 4 × 3 = 12 items initially visible
// We render the first 18 items at all breakpoints to avoid a useMedia hook
// (which would cause a SSR/hydration mismatch). Items at indexes 12–17 are
// then hidden on mobile via Tailwind responsive classes, so mobile shows
// exactly 12 (3 rows of 4) while desktop still shows 18 (2 rows of 9).
const INITIAL_VISIBLE_ITEMS = ITEMS_PER_ROW_DESKTOP * INITIAL_VISIBLE_ROWS; // 18
const INITIAL_VISIBLE_ITEMS_MOBILE = 12;

const ManufacturerBlock = ({ initialManufacturers, brandHrefById }: ManufacturerBlockProps) => {
  const [showAll, setShowAll] = useState(false);
  // Only treat SSR as authoritative when it actually returned brands; empty/failed SSR
  // must still allow the client query (homepage + list).
  const hasSsrList = (initialManufacturers?.length ?? 0) > 0;
  const { data, isLoading, isError, isFetching, isPending } = useManufacturersQuery({
    enabled: !hasSsrList,
  });
  const params = useParams();

  const manufacturers = (hasSsrList ? initialManufacturers! : unwrapManufacturerList(data))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const pathname = usePathname();
  const languageCountry = (params?.["language-country"] as string) ?? "";
  const manufacturerPage = pathnameIncludesManufacturersRouteSegment(pathname, languageCountry);
  const { getLabel } = useBranding();
  const breadcrumbLinks = [{ label: getLabel("home"), href: `/${languageCountry}` }];
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();

  const visibleManufacturers = manufacturerPage
    ? manufacturers
    : showAll
      ? manufacturers
      : manufacturers.slice(0, INITIAL_VISIBLE_ITEMS);

  const gridClass = manufacturerPage ? LIST_MANUFACTURER_GRID_CLASS : MANUFACTURER_GRID_CLASS;

  const skeletonCount = manufacturerPage
    ? Math.max(manufacturers.length, HOME_MANUFACTURER_VISIBLE_COUNT, 27)
    : HOME_MANUFACTURER_VISIBLE_COUNT;

  // Mobile needs the button whenever total > 12; desktop only when total > 18.
  // When desktop already shows everything (total ≤ 18) we still render the
  // button for mobile and hide it on desktop via `gtsm:hidden`.
  const mobileShowMore =
    !manufacturerPage &&
    !isLoading &&
    !isError &&
    manufacturers.length > INITIAL_VISIBLE_ITEMS_MOBILE;
  const desktopShowMore =
    !manufacturerPage && !isLoading && !isError && manufacturers.length > INITIAL_VISIBLE_ITEMS;
  const showMoreButton = mobileShowMore || desktopShowMore;

  const gridContent = (() => {
    // Avoid `!isFetched` — with PersistQueryClient + refetchOnMount:false it can stay false
    // and leave the homepage on skeleton forever.
    const showSkeleton =
      !hasSsrList &&
      manufacturers.length === 0 &&
      !isError &&
      (isPending || isLoading || isFetching);
    if (showSkeleton) {
      return <OGManufacturerSkeleton count={skeletonCount} gridClass={gridClass} />;
    }

    if (isError) {
      return (
        <ManufacturerGridHeightShell gridClass={gridClass}>
          <Typography className="text-color-text-default typography-body-02">
            {getLabel("categories_loading_failed_text") || "Failed to load manufacturers."}
          </Typography>
        </ManufacturerGridHeightShell>
      );
    }

    if (manufacturers.length === 0) {
      return (
        <ManufacturerGridHeightShell gridClass={gridClass}>
          <Typography className="text-color-text-default typography-body-02">
            {getLabel("manufacturer_unavailable")}
          </Typography>
        </ManufacturerGridHeightShell>
      );
    }

    return (
      <>
        {/* ─── 2. Grid: 4-col mobile, 6-col tablet, 9-col desktop ─────────── */}
        <Box className={gridClass}>
          {visibleManufacturers.map((item, idx) => {
            // Items 12–17 are part of the desktop initial view (rows 2 of 9)
            // but exceed the mobile initial view (3 rows of 4 = 12). Hide
            // them on mobile until "Show More" is pressed.
            const hideOnMobile =
              !manufacturerPage && !showAll && idx >= INITIAL_VISIBLE_ITEMS_MOBILE;
            const brandSlug = slugifyManufacturerForPdp(item.name);
            // Prefer SSR href (landing or SRP); fallback keeps prior landing path.
            const brandPath =
              brandHrefById?.[item.id] ?? Routes.carPartBrand(languageCountry, brandSlug);
            const href =
              navigationCarIds.length > 0
                ? appendVehicleContextToHref(brandPath, {
                    carIds: navigationCarIds,
                    vin: navigationVin,
                  })
                : brandPath;
            return (
              <CustomTooltip
                key={item.id}
                content={item.name}
                openOnClick={false}
                fitContent
                className={`w-full ${hideOnMobile ? "base:hidden gtsm:flex" : "flex"}`}
              >
                <Link
                  href={href}
                  rel={shouldNofollowBreadcrumbHref(href) ? "nofollow" : undefined}
                  className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-color-border-emphasis bg-color-background-emphasis hover:border hover:border-color-border-focus"
                  aria-label={`View parts by ${item.name}`}
                >
                  {item?.image ? (
                    <Box className="relative h-[60%] w-[60%]">
                      <Image
                        src={item?.image}
                        alt={item?.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </Box>
                  ) : (
                    <Typography className="px-2 text-center text-sm font-semibold text-color-text-default">
                      {item?.name}
                    </Typography>
                  )}
                </Link>
              </CustomTooltip>
            );
          })}
        </Box>

        {showMoreButton && (
          <Box
            className={`w-full items-center justify-center ${desktopShowMore ? "flex" : "base:flex gtsm:hidden"}`}
          >
            <OGButton
              type="ghost"
              className="self-center text-button-ghost-text"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {getLabel(
                showAll
                  ? "homepage_shop_by_manufacturer_show_less"
                  : "homepage_shop_by_manufacturer_show_more",
              )}
            </OGButton>
          </Box>
        )}
      </>
    );
  })();

  return (
    <Box
      className={
        manufacturerPage
          ? "flex w-full flex-col bg-color-background-default gap-content-to-footer base:gap-6 gtsm:gap-6 gtlg:gap-8"
          : `flex flex-col gap-8 bg-color-background-default`
      }
    >
      {manufacturerPage && (
        <Box className="section-standard">
          <OGBreadcrumb links={breadcrumbLinks} active={getLabel("car_part_brands")} />
        </Box>
      )}
      {manufacturerPage ? (
        <Box className="section-standard">
          <Typography className="text-color-text-emphasis typography-heading-01" type="h1" hasBack>
            {getLabel("car_part_brands")}
          </Typography>
        </Box>
      ) : (
        <Typography className="text-color-text-emphasis typography-heading-02" type="h2">
          {getLabel("shop_by_manufacturer_title")}
        </Typography>
      )}
      {manufacturerPage && (
        <Box className="section-standard">
          <Typography className="text-color-text-muted typography-body-01" type="p">
            {getLabel("car_part_brands_description")}
          </Typography>
        </Box>
      )}
      {manufacturerPage ? (
        <Box className="flex flex-col gap-content-to-footer section-standard">{gridContent}</Box>
      ) : (
        gridContent
      )}
    </Box>
  );
};

export default ManufacturerBlock;
