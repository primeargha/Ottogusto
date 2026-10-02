"use client";
import PreviousSearchCarousel from "./previous-search-carousel";
import { usePathname, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMmeStore } from "@/stores/useMmeStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { Box } from "@/components/ui/box";
import { useEffect, useRef } from "react";
import { migrateLegacyPreviousSearchesOnce } from "@/utils/previousSearchSync";

export default function PreviousSearchClientContainer() {
  const { previousSearches, prependPreviousSearchEntry } = useMmeStore();
  const migratedRef = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const params = useParams();
  const languageCountrySegment = Array.isArray(params?.["language-country"])
    ? params["language-country"][0]
    : (params?.["language-country"] as string | undefined);

  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    migrateLegacyPreviousSearchesOnce(prependPreviousSearchEntry);
  }, [prependPreviousSearchEntry]);

  const carouselConfig = {
    isPreviousSearch: true,
    itemsPerView: {
      desktop: 5,
      mobile: 2,
    },
    containerClassName: `${getClientFeatureFlag("show_left_nav_flag", languageCountrySegment) ? "lg:ml-[220px]" : "lg:pl-[36px]"} bg-color-background-default gap-header-to-title section-standard relative`,
    cardClassName: "w-[280px] flex-shrink-0", // Fixed width instead of percentage
    breakpoint: 992,
  };

  // Hide for guests [OD-357] or when home previous-search flag is off for this market
  if (
    !isAuthenticated ||
    !getClientFeatureFlag("home_previous_search_feature_flag", languageCountrySegment)
  ) {
    return null;
  }
  // Todo: Change the pathname after final ProductDetails page
  if (
    pathname?.includes("/garage-bay") ||
    pathname?.includes("/products") ||
    pathname?.includes("productdetails") ||
    pathname?.includes("part") ||
    pathname?.includes("shoppingcart")
  ) {
    return null;
  }

  return (
    <>
      {pathname === "/garage-bay/my-saved-cars" || pathname === "/garage-bay/my-saved-car" ? (
        <></>
      ) : (
        <Box className="flex w-full flex-col gap-stack">
          <PreviousSearchCarousel items={previousSearches} config={carouselConfig} />
          {previousSearches?.length > 0 && (
            <Box className="section-standard">
              <Box className="h-[1px] w-full bg-color-border-default" />
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
