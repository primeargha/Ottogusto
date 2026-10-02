"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import CardHoverArrow from "@/public/assets/icons/card-hover-arrow.svg";
import LeftArrow from "@/public/assets/icons/left-arrow.svg";
import RightArrow from "@/public/assets/icons/right-arrow.svg";
import Image from "next/image";
import { getTimeAgo } from "@/utils/timeAgo";
import SavedCars from "../og-search/SavedCars";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { heroSection } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { PreviousSearchDataInterface, useMmeStore } from "@/stores/useMmeStore";
import { useCheckForMysavedCarsPage } from "@/hooks/appHooks";
import { useCategories } from "@/contexts/CategoriesContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useParams, usePathname } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { getMMEId } from "@/utils/getMMEId";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";
import {
  buildLegacyMmeCarLabel,
  buildSearchResultsDisplayTitle,
  resolveCategoryDisplayName,
  resolveCategoryNameFromLegacyParts,
} from "@/utils/searchResultsDisplayTitle";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import Typography from "@/components/og-components/Typography";
import { Spinner } from "@/components/ui/spinner";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const DefaultSearchCard = ({
  item,
  isEngineBay = false,
  onMarkFavorite,
  activeIndex = 0,
}: {
  item: PreviousSearchDataInterface;
  isEngineBay?: boolean | undefined;
  onMarkFavorite?: any;
  activeIndex: number;
}) => {
  // debugger;
  const { getLocale, getLabel } = useBranding();
  const isMySavedCarsPage = useCheckForMysavedCarsPage();
  const { setPreviousSearchActiveIndex } = useLandingPageDataStore();
  const { updateFilters } = useUrlParams();
  const { carByVinResults, setSearchData, setCarByVinResults, previousSearches, searchData } =
    useMmeStore();
  const { data: categoryNestedData, isPending } = useCategories();
  const { filteredList, selectedCategories, setSelectedCategories } = useAdvancedSearchStore();
  const { appendToSelectedCategories, nestedMasterCategoryList } = useCategorySearchStore();

  const getTitleString = () => {
    const categoryName =
      resolveCategoryDisplayName(categoryNestedData ?? [], item.categoryId, getLocale()) ??
      resolveCategoryNameFromLegacyParts(categoryNestedData ?? [], item.parts, getLocale());

    const carLabel =
      item.carLabel?.trim() ||
      buildLegacyMmeCarLabel(
        item.mmytData?.make?.value ?? item.make,
        item.mmytData?.model?.value ?? item.model,
      ) ||
      null;

    return buildSearchResultsDisplayTitle({
      carLabel: carLabel || null,
      categoryName,
      oeReference: item.OERef ?? null,
      getLabel,
    }).title;
  };

  const truncateText = (text?: string | null, limit = 45): string => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const handleClick = (selectedItem: PreviousSearchDataInterface) => {
    setPreviousSearchActiveIndex(activeIndex);

    if (selectedItem.OERef) {
      updateFilters(
        {
          oeReference: selectedItem.OERef || "",
        },
        "/products",
        "",
        true,
      );
      return;
    }

    const categoryId =
      selectedItem.categoryId ??
      pickPrimaryCategoryId(
        Array.isArray(selectedItem.parts)
          ? selectedItem.parts.map((itm: { id?: string }) => itm.id)
          : [(selectedItem.parts as { id?: string } | null)?.id],
      );

    if (selectedItem.carIds?.length) {
      updateFilters(
        {
          carIds: selectedItem.carIds,
          ...(categoryId ? { categoryId } : {}),
        },
        "/products",
        "",
        true,
      );
      return;
    }

    if (selectedItem.makeModelTypeId) {
      updateFilters(
        {
          makeModelTypeId: selectedItem.makeModelTypeId,
          ...(categoryId ? { categoryId } : {}),
        },
        "/products",
        "",
        true,
      );
      return;
    }

    if (selectedItem.mmytData?.make?.value) {
      setSearchData(selectedItem.mmytData);
    } else {
      setCarByVinResults([selectedItem as any]);
    }

    updateFilters(
      {
        makeModelTypeId: getMMEId(selectedItem?.mmytData) || carByVinResults[0]?.id,
        ...(categoryId ? { categoryId } : {}),
      },
      "/products",
      "",
      true,
    );
  };

  if (!item) {
    return;
  }

  if (isPending) {
    return (
      <Box className="h-[10dvh] w-full content-center items-center justify-center">
        <Spinner size="large" color="#0a4932" />
        <></>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => {
        handleClick(item);
      }}
      className="group relative flex h-[130px] w-full cursor-pointer flex-col px-4 md:min-w-[180px]"
    >
      <Box className="absolute left-0 top-0 h-full w-[2px] flex-shrink-0 bg-color-text-body" />

      <Box className="flex h-full w-full flex-col justify-between">
        <Box className="fle h-full items-start justify-between">
          <Box className="flex items-start">
            {(getTitleString()?.length || 0) > 60 ? (
              <CustomTooltip content={getTitleString() || ""}>
                <Text className="line-clamp-2 text-color-text-body transition-colors body-bold-md group-hover:text-color-primary-main">
                  {truncateText(getTitleString() || "", 60)}
                </Text>
              </CustomTooltip>
            ) : (
              <Text className="line-clamp-2 text-color-text-body transition-colors body-bold-md group-hover:text-color-primary-main">
                {getTitleString()}
              </Text>
            )}
          </Box>

          <Text className="mt-1 text-color-accent-dark body-bold-sm">
            {getTimeAgo(item.timeAgo, getLabel)}
          </Text>
        </Box>

        <Box className="relative flex items-center justify-end">
          <Image
            src={CardHoverArrow}
            alt="hover-arrow"
            height={24}
            width={24}
            className="-ml-[8px] flex-shrink-0 translate-y-[8px] transform opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100"
          />
        </Box>
      </Box>
    </Box>
  );
};

interface CarouselConfig {
  isPlain?: boolean;
  itemsPerView: {
    desktop: number;
    mobile: number;
  };
  isSavedCar?: boolean;
  isHeroCart?: boolean;
  isEngineBay?: boolean;
  isFAQ?: boolean;
  containerClassName?: string;
  cardClassName?: string;
  breakpoint?: number; // px value for mobile/desktop switch
  renderCard?: (item: any) => React.ReactNode;
  isPreviousSearch?: boolean;
  handleSelectCar?: (item: object, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; // Accept function as a prop
  selectedCar?: object | null;
}

const BlurOverlay = () => (
  <Box
    className="pointer-events-none absolute right-0 top-0 h-full w-[130px] bg-gradient-to-l from-[--background-white] to-transparent"
    style={{
      backdropFilter: "blur(10px)",
      WebkitMask:
        "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,1) 100%)",
      mask: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,1) 100%)",
      boxShadow: "inset 0 0 20px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,255,0.3)",
    }}
  />
);
const BlurOverlayEB = () => (
  <Box
    className="pointer-events-none absolute bottom-0 right-[-12px] z-50 min-h-[254px] w-[180px] rounded-r-md bg-gradient-to-l from-[--background-white] to-transparent"
    style={{
      backdropFilter: "blur(10px)",
      WebkitMask:
        "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,1) 100%)",
      mask: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,1) 100%)",
      boxShadow: "inset 0 0 20px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,255,0.3)",
    }}
  />
);

export default function PreviousSearchCarousel({
  items,
  config = {
    itemsPerView: { desktop: 5, mobile: 2 },
    isPlain: false,
    isSavedCar: false,
    isHeroCart: false,
    isEngineBay: false,
    isFAQ: false,
    containerClassName: "",
    cardClassName: "w-[45%] flex-shrink-0 lg:w-[19%]",
    breakpoint: 992,
    renderCard: () => undefined,
    isPreviousSearch: false, // Default value
  },
  onMarkFavorite,
  handleSelectCar,
  selectedCar,
}: {
  items: any[];
  config?: CarouselConfig;
  handleSelectCar?: () => void;
  selectedCar?: object | null;
  onMarkFavorite?: (callback: any) => void;
}) {
  const { getLabel } = useBranding();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [transformValue, setTransformValue] = useState("translateX(0)");
  const [isMounted, setIsMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | undefined>(0);
  const [touchEnd, setTouchEnd] = useState<number | undefined>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState<any | undefined>(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  // Desktop-only arrow visibility is handled purely with the `lg:` (992px)
  // Tailwind breakpoint on the arrow wrappers below, matching the default
  // `config.breakpoint` — no JS media-query hook, no resize listener, no
  // post-mount flash.
  const pathname = usePathname();
  const params = useParams();
  // TRAILING SLASH FIX
  const savedCardsPath = pathname?.includes("/garage-bay/my-saved-cars");
  const OGSearchPath = pathname?.includes("/og-search");
  const isHomepagePrevSearch = pathname?.match(getRouteLocaleString(Routes.pitStop, params));
  // Add Embla carousel setup
  const options: EmblaOptionsType = {
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    dragFree: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  // Layout effect (not a passive effect) so `isMounted` flips before the
  // browser paints — arrows/overlays that gate on it appear in the first
  // frame instead of popping in a beat after mount.
  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      const isMobile = window.innerWidth < 768;
      const cardWidth =
        config?.isHeroCart && isMobile ? 240 : config?.isHeroCart && !isMobile ? 500 : 280; // Fixed card width in pixels
      const containerWidth = window.innerWidth;
      const pixelMove = currentIndex * cardWidth;
      setTransformValue(`translateX(-${pixelMove}px)`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isMounted]);

  if (!items || items.length === 0) return null;

  const itemsPerView = {
    desktop: 5,
    mobile: 2,
  };

  const isScrollNeeded = () => {
    if (typeof window !== "undefined" && isMounted) {
      const isMobile = window.innerWidth < 768;
      const cardLeftWidth = config?.isPlain
        ? getWidowWidth(window.innerWidth)
        : config?.isSavedCar && !config?.isHeroCart
          ? 1200
          : config?.isSavedCar && config?.isHeroCart && isMobile
            ? 240
            : config?.isSavedCar && config?.isHeroCart && !isMobile
              ? getWidowWidthSavedCar(window.innerWidth)
              : 220;

      const cardWidth = config?.isPlain
        ? 42
        : config?.isSavedCar && !config?.isHeroCart
          ? 400
          : config?.isSavedCar && config?.isHeroCart
            ? 500
            : 280;

      const containerWidth = window.innerWidth;
      let visibleWidth = containerWidth - (window.innerWidth >= 992 ? cardLeftWidth : 0);

      // Calculate total content width
      const totalContentWidth = items.length * cardWidth;

      // Return true if content width is greater than visible width
      return totalContentWidth > visibleWidth;
    }
    return false;
  };

  const isFirstSlide = currentIndex === 0;

  const getWidowWidth = (width: number) => {
    if (width > 1600) {
      return 850;
    }
    if (width > 1400 && width <= 1600) {
      return 650;
    }
    if (width > 1280 && width <= 1400) {
      return 450;
    }
    if (width > 1200 && width <= 1280) {
      return 300;
    }
    if (width > 1024 && width <= 1200) {
      return 250;
    }
    if (width > 992 && width <= 1024) {
      return 150;
    }
    return 150;
  };

  const getWidowWidthSavedCar = (width: number) => {
    if (width >= 3000) {
      return 2300;
    }
    if (width >= 2800 && width < 3000) {
      return 2000;
    }
    if (width >= 2500 && width < 2800) {
      return 1800;
    }
    if (width >= 2100 && width < 2500) {
      return 1500;
    }
    if (width >= 1920 && width < 2100) {
      return 1150;
    }
    if (width >= 1500 && width < 1920) {
      return 1000;
    }
    if (width >= 1024 && width < 1500) {
      return 522;
    }
    if (width >= 992 && width < 1024) {
      return 450;
    }
    if (width >= 768 && width < 992) {
      return 522;
    }
    return 522;
  };

  const isRightArrowDisabled = () => {
    // don't show the arrow for 1 or 2 items
    if (items.length <= 2) {
      return true;
    }

    if (typeof window !== "undefined" && isMounted) {
      const isMobile = window.innerWidth < 768; // Example breakpoint for mobile
      const cardLeftWidth = config?.isPlain
        ? getWidowWidth(window.innerWidth)
        : config?.isSavedCar && !config?.isHeroCart
          ? 1200
          : config?.isSavedCar && config?.isHeroCart && isMobile
            ? 240
            : config?.isSavedCar && config?.isHeroCart && !isMobile
              ? getWidowWidthSavedCar(window.innerWidth) //522
              : 220; // Fixed card left width in pixels
      const cardWidth = config?.isPlain
        ? 42
        : config?.isSavedCar && !config?.isHeroCart
          ? 400
          : config?.isSavedCar && config?.isHeroCart
            ? 500
            : 280; // Fixed card width in pixels
      const containerWidth = window.innerWidth;
      let visibleWidth = containerWidth - (window.innerWidth >= 992 ? cardLeftWidth : 0);

      // Ensure visibleWidth is at least cardWidth to avoid division errors
      config?.isSavedCar && config?.isHeroCart && isMobile
        ? (visibleWidth = Math.max(visibleWidth, cardWidth))
        : visibleWidth;

      let currentVisibleItems = Math.floor(visibleWidth / cardWidth);

      // Ensure at least 1 item is always visible
      config?.isSavedCar && config?.isHeroCart && isMobile
        ? (currentVisibleItems = Math.max(currentVisibleItems, 1))
        : currentVisibleItems;
      // Check if the last set of items is fully visible
      return currentIndex + currentVisibleItems >= items.length;
    }
    return false;
  };

  const handleNext = () => {
    if (typeof window !== "undefined" && isMounted) {
      const isMobile = window.innerWidth < 992;
      const itemsToShow = isMobile ? itemsPerView.mobile : itemsPerView.desktop;

      // Only allow next if the last card won't be fully visible after the move
      if (!isRightArrowDisabled()) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.targetTouches[0]?.clientX);
    setPrevTranslate(currentTranslate);
    setTouchStart(e.targetTouches[0]?.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX: any = e.targetTouches[0]?.clientX;
    const diff = currentX - startX;

    const isMobile = window.innerWidth < 768;
    const cardLeftWidth = config?.isPlain
      ? getWidowWidth(window.innerWidth)
      : config?.isSavedCar && !config?.isHeroCart
        ? 1200
        : config?.isSavedCar && config?.isHeroCart && isMobile
          ? 240
          : config?.isSavedCar && config?.isHeroCart && !isMobile
            ? getWidowWidthSavedCar(window.innerWidth)
            : 220;

    const cardWidth = config?.isPlain
      ? 42
      : config?.isSavedCar && !config?.isHeroCart
        ? 400
        : config?.isSavedCar && config?.isHeroCart
          ? 500
          : 280;

    const containerWidth = window.innerWidth;
    let visibleWidth = containerWidth - (window.innerWidth >= 992 ? cardLeftWidth : 0);

    // Only apply max visible width logic for saved cars/hero cart
    if (config?.isSavedCar && config?.isHeroCart && isMobile) {
      visibleWidth = Math.max(visibleWidth, cardWidth);
    }

    // Calculate maximum scroll based on total content width minus visible width
    const maxScroll = -(items.length * cardWidth - visibleWidth);

    // Calculate new position
    let newTranslate = prevTranslate + diff;

    // Apply bounds with smooth edge resistance
    if (newTranslate > 0) {
      newTranslate = newTranslate * 0.2; // Resistance when pulling past start
    } else if (newTranslate < maxScroll) {
      newTranslate = maxScroll + (newTranslate - maxScroll) * 0.2; // Resistance when pulling past end
    }

    setCurrentTranslate(newTranslate);
    setTransformValue(`translateX(${newTranslate}px)`);
    setTouchEnd(currentX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    const isMobile = window.innerWidth < 768;
    const cardLeftWidth = config?.isPlain
      ? getWidowWidth(window.innerWidth)
      : config?.isSavedCar && !config?.isHeroCart
        ? 1200
        : config?.isSavedCar && config?.isHeroCart && isMobile
          ? 240
          : config?.isSavedCar && config?.isHeroCart && !isMobile
            ? getWidowWidthSavedCar(window.innerWidth)
            : 220;

    const cardWidth = config?.isPlain
      ? 42
      : config?.isSavedCar && !config?.isHeroCart
        ? 400
        : config?.isSavedCar && config?.isHeroCart
          ? 500
          : 280;

    const containerWidth = window.innerWidth;
    let visibleWidth = containerWidth - (window.innerWidth >= 992 ? cardLeftWidth : 0);

    if (config?.isSavedCar && config?.isHeroCart && isMobile) {
      visibleWidth = Math.max(visibleWidth, cardWidth);
    }

    // Calculate maximum scroll based on total content width minus visible width
    const maxScroll = -(items.length * cardWidth - visibleWidth);

    // Apply bounds without snapping to specific cards
    let finalTranslate = currentTranslate;
    if (finalTranslate > 0) {
      finalTranslate = 0;
    } else if (finalTranslate < maxScroll) {
      finalTranslate = maxScroll;
    }

    setCurrentTranslate(finalTranslate);
    setTransformValue(`translateX(${finalTranslate}px)`);

    // Only update currentIndex for saved cars/hero cart
    if (config?.isSavedCar || config?.isHeroCart) {
      setCurrentIndex(Math.abs(Math.floor(finalTranslate / cardWidth)));
    }
  };

  // Previous-search carousel: mobile gets a plain native-scroll list (no
  // arrows/drag JS), desktop gets the shared arrows+drag-transform carousel
  // further below. Both shapes render unconditionally and CSS (`md:`, the
  // same 768px breakpoint the old JS check used) decides which is visible —
  // this used to be a `typeof window !== "undefined" && window.innerWidth <
  // 768` render-time check, which is always `false` during SSR (no
  // `window`) but `true` on the client's very first render for mobile
  // visitors: a genuine hydration mismatch, since it picked between two
  // structurally different JSX trees rather than just toggling a class.
  // React would then discard/replace the mismatched subtree — a much bigger
  // shift than a simple visibility toggle. Rendering both trees up front (as
  // already done for the header logo and hero carousel elsewhere in this
  // codebase) removes the mismatch entirely.
  if (config.isPreviousSearch) {
    return (
      <>
        {items && items.length > 0 && (
          <>
            {/* Mobile: plain native overflow-x-scroll, no arrows, no drag JS */}
            <Box className={`block md:hidden ${config.containerClassName}`}>
              <Box
                className={`relative w-full px-2 ${config?.isSavedCar ? "py-2" : "bg-color-background-default py-6"}`}
              >
                {!config?.isSavedCar && (
                  <Box className="mb-10 flex flex-col gap-3 px-6">
                    <Typography
                      type="h2"
                      className="justify-start text-color-text-emphasis typography-heading-02"
                    >
                      {getLabel("previous_search_title")}
                    </Typography>
                  </Box>
                )}

                <Box className="overflow-hidden overflow-x-scroll" ref={emblaRef as any}>
                  <Box className="flex flex-row">
                    {items?.map((item, index) => (
                      <Box
                        key={index}
                        className={`${config.cardClassName} min-w-0`} // Add min-w-0 to prevent flex item growth
                      >
                        {config.renderCard ? (
                          config.renderCard(item)
                        ) : config?.isSavedCar ? (
                          <SavedCars
                            item={item}
                            isLastItem={index === items.length - 1}
                            isHeroCart={config?.isHeroCart || false}
                          />
                        ) : (
                          <DefaultSearchCard
                            item={item}
                            activeIndex={index}
                            isEngineBay={config?.isEngineBay}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {!config?.isHeroCart && (
                  <Box className="absolute right-0 top-0 z-20 hidden h-full lg:block">
                    <BlurOverlay />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Desktop: arrows + drag-transform carousel */}
            <Box className={`hidden md:block ${config.containerClassName}`}>
              <Box
                className={`relative w-full px-2 ${config?.isSavedCar ? "py-0" : "rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis py-6"}`}
              >
                {!config?.isSavedCar && (
                  <Box className="mb-10 flex flex-col gap-3 px-6">
                    <Typography
                      type="h2"
                      className="justify-start text-color-text-body typography-heading-02"
                    >
                      {getLabel("previous_search_title")}
                    </Typography>
                  </Box>
                )}

                <Box className="relative">
                  {!isFirstSlide && (
                    <Pressable
                      onPress={handlePrev}
                      disabled={isFirstSlide}
                      className="absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 cursor-pointer"
                    >
                      <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
                    </Pressable>
                  )}

                  {!isRightArrowDisabled() && (
                    <Pressable
                      onPress={handleNext}
                      disabled={isRightArrowDisabled()}
                      className="absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 cursor-pointer"
                    >
                      <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
                    </Pressable>
                  )}

                  <Box
                    className={`relative h-full overflow-hidden ${isHomepagePrevSearch ? "overflow-x-scroll scrollbar-hide" : ""} ${OGSearchPath ? "overflow-x-scroll scrollbar-hide" : ""} ${savedCardsPath ? "custom-scrollbar overflow-x-auto" : ""} px-4`}
                  >
                    <Box
                      className="relative z-10 flex flex-row transition-all duration-300 ease-out"
                      //@ts-ignore
                      style={{
                        transform: transformValue,
                        touchAction: "none",
                        cursor: isDragging ? "grabbing" : "grab",
                      }}
                      //@ts-ignore
                      onTouchStart={handleTouchStart}
                      //@ts-ignore
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {items?.map((item, index) => (
                        //@ts-ignore
                        <Box key={item.id || index} className={config.cardClassName}>
                          {config.renderCard ? (
                            config.renderCard(item)
                          ) : config?.isSavedCar ? (
                            <SavedCars
                              item={item}
                              isLastItem={index === items.length - 1}
                              isHeroCart={config?.isHeroCart || false}
                              isEngineBay={config?.isEngineBay || false}
                              index={index}
                              {...(handleSelectCar ? { handleSelectCar } : {})}
                              selectedCar={selectedCar || null}
                            />
                          ) : (
                            <DefaultSearchCard
                              item={item}
                              activeIndex={index}
                              isEngineBay={config?.isEngineBay || false}
                              onMarkFavorite={onMarkFavorite}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {!isRightArrowDisabled() && !config?.isHeroCart && (
                  <Box
                    className={`absolute right-0 top-0 z-20 hidden h-full ${config?.isEngineBay ? "sm:block" : "lg:block"}`}
                  >
                    <BlurOverlay />
                  </Box>
                )}
                {savedCardsPath && <BlurOverlayEB />}
              </Box>
            </Box>
          </>
        )}
      </>
    );
  }

  // For FAQ Catagories on Mobile view
  if (config.isFAQ) {
    return (
      <>
        {items && items.length > 0 && (
          //@ts-ignore
          <Box className={config.containerClassName}>
            <Box className={`"relative w-full`}>
              <Box className="pr-4">
                {/* Show arrows only on desktop */}
                {/* Navigation arrows with higher z-index */}
                {isMounted && (
                  <>
                    {/*Excluding Saved cars first and last arrow will execute as it is*/}
                    {config?.isPlain && (
                      <>
                        <Pressable
                          onPress={handlePrev}
                          disabled={isFirstSlide}
                          className={`absolute left-[0rem] top-[calc(50%-8px)] z-30 hidden -translate-y-1/2 lg:block ${
                            isFirstSlide
                              ? "scale-0 cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
                        </Pressable>

                        <Pressable
                          onPress={handleNext}
                          disabled={isRightArrowDisabled()}
                          className={`absolute right-[-1.5rem] top-[calc(50%-8px)] z-30 hidden -translate-y-1/2 lg:block ${
                            isRightArrowDisabled()
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
                        </Pressable>
                      </>
                    )}
                  </>
                )}

                <Box className="relative overflow-hidden">
                  {/* Blur overlay with medium z-index */}

                  {/* Cards container with lowest z-index */}
                  <Box
                    className="relative z-10 flex flex-row transition-all duration-300 ease-out"
                    //@ts-ignore
                    style={{
                      transform: transformValue,
                      touchAction: "none",
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    //@ts-ignore
                    onTouchStart={handleTouchStart}
                    //@ts-ignore
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {items?.map((item, index) => (
                      //@ts-ignore
                      <Box key={index} className={config.cardClassName}>
                        {config.isPlain && <>{config.renderCard && config.renderCard(item)}</>}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </>
    );
  }

  // For Footer brands
  if (config.isPlain) {
    // debugger;
    return (
      <>
        {items && items.length > 0 && (
          //@ts-ignore
          <Box className={config.containerClassName}>
            <Box className={`"relative w-full`}>
              <Box className="pr-4">
                {isMounted && (
                  <>
                    {/*Excluding Saved cars first and last arrow will execute as it is*/}
                    {config?.isPlain && (
                      <>
                        <Pressable
                          onPress={handlePrev}
                          disabled={isFirstSlide}
                          className={`absolute left-[0rem] top-[calc(50%-8px)] z-30 -translate-y-1/2 ${
                            isFirstSlide
                              ? "scale-0 cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
                        </Pressable>

                        <Pressable
                          onPress={handleNext}
                          disabled={isRightArrowDisabled()}
                          className={`absolute right-[-1.5rem] top-[calc(50%-8px)] z-30 -translate-y-1/2 ${
                            isRightArrowDisabled()
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
                        </Pressable>
                      </>
                    )}
                  </>
                )}

                <Box className="relative ml-0 h-auto overflow-hidden overflow-x-auto px-4 scrollbar-hide">
                  {/* Cards container with lowest z-index */}
                  <Box
                    className="relative z-10 flex flex-row transition-all duration-300 ease-out"
                    //@ts-ignore
                    style={{
                      transform: transformValue,
                      touchAction: "none",
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    //@ts-ignore
                    onTouchStart={handleTouchStart}
                    //@ts-ignore
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {items?.map((item, index) => (
                      //@ts-ignore
                      <Box key={index} className={config.cardClassName}>
                        {config.isPlain && <>{config.renderCard && config.renderCard(item)}</>}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </>
    );
  }

  // return <>MobileHeroSaved Cars here</>
  return (
    <>
      {items && items.length > 0 && (
        <Box className={`${config.containerClassName}`}>
          <Box
            className={`relative w-full px-2 ${config?.isSavedCar ? "py-0" : "rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis py-6"}`}
          >
            {!config?.isSavedCar && (
              <Box className="mb-10 flex flex-col gap-3 px-6">
                <Typography
                  type="h2"
                  className="justify-start text-color-text-body typography-heading-02"
                >
                  {getLabel("previous_search_title")}
                </Typography>
                {/* <Text className="justify-start text-color-text-body body-regular-sm">
                  {getLabel("previous_search_subtitle")}
                </Text> */}
              </Box>
            )}

            <Box className="relative">
              {/* Show arrows only on desktop */}
              {/* Navigation arrows with higher z-index */}
              {isMounted && (
                <>
                  {/*Excluding Saved cars first and last arrow will execute as it is*/}
                  {!config?.isSavedCar && (
                    <>
                      {!isFirstSlide && (
                        <Pressable
                          onPress={handlePrev}
                          disabled={isFirstSlide}
                          className={`absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 cursor-pointer ${config?.isHeroCart ? "" : "hidden lg:block"}`}
                        >
                          <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
                        </Pressable>
                      )}

                      {!isRightArrowDisabled() && (
                        <Pressable
                          onPress={handleNext}
                          disabled={isRightArrowDisabled()}
                          className={`absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 cursor-pointer ${config?.isHeroCart ? "" : "hidden lg:block"}`}
                        >
                          <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
                        </Pressable>
                      )}
                    </>
                  )}

                  {config?.isSavedCar && config?.isHeroCart && items.length > 1 && (
                    <>
                      <Pressable
                        onPress={handlePrev}
                        aria-disabled={isFirstSlide}
                        className={`absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 ${
                          isFirstSlide ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <Image
                          src={isFirstSlide ? heroSection.arrow : LeftArrow}
                          alt="left-arrow"
                          height={30}
                          width={30}
                        />
                      </Pressable>

                      <Pressable
                        onPress={handleNext}
                        aria-disabled={isRightArrowDisabled()}
                        className={`absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 ${
                          isRightArrowDisabled() ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <Image
                          src={isRightArrowDisabled() ? heroSection.arrow : RightArrow}
                          alt="right-arrow"
                          height={30}
                          width={30}
                          className={`${isRightArrowDisabled() ? "mb-3 rotate-180" : ""}`}
                        />
                      </Pressable>
                    </>
                  )}

                  {/*Left Array hide only for first element/box for Saved Cars only*/}
                  {config?.isSavedCar && !config?.isHeroCart && !config?.isEngineBay && (
                    <>
                      {!isFirstSlide && (
                        <Pressable
                          onPress={handlePrev}
                          disabled={isFirstSlide}
                          className={`absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 hidden -translate-y-1/2 lg:block ${
                            isFirstSlide ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                          }`}
                        >
                          <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
                        </Pressable>
                      )}

                      {/*Right Array hide only element last element/box execution for Saved Cars only*/}
                      {!isRightArrowDisabled() && (
                        <Pressable
                          onPress={handleNext}
                          disabled={isRightArrowDisabled()}
                          className={`absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 hidden -translate-y-1/2 lg:block ${
                            isRightArrowDisabled()
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
                        </Pressable>
                      )}
                    </>
                  )}
                </>
              )}

              <Box
                className={`relative h-full overflow-hidden ${isHomepagePrevSearch ? "overflow-x-scroll scrollbar-hide" : ""} ${OGSearchPath ? "overflow-x-scroll scrollbar-hide" : ""} ${savedCardsPath ? "custom-scrollbar overflow-x-auto" : ""} px-4 ${config?.isSavedCar && !config?.isHeroCart && isFirstSlide ? "pl-0" : ""}`}
              >
                {/* Blur overlay with medium z-index */}

                {/* Cards container with lowest z-index */}
                <Box
                  className={`relative z-10 flex flex-row transition-all ${config?.isHeroCart ? "duration-[1500ms]" : "duration-300"} ease-out`}
                  //@ts-ignore
                  style={{
                    transform: transformValue,
                    touchAction: "none",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                  {...(!config?.isHeroCart && {
                    onTouchStart: handleTouchStart,
                    onTouchMove: handleTouchMove,
                    onTouchEnd: handleTouchEnd,
                  })}
                >
                  {items?.map((item, index) => (
                    //@ts-ignore
                    <Box key={item.id || index} className={config.cardClassName}>
                      {config.renderCard ? (
                        config.renderCard(item)
                      ) : config?.isSavedCar ? ( // ✅ Corrected access to `isSavedCar`
                        <SavedCars
                          // This one is for SavedCars slider on Landing page and OGSearch
                          item={item}
                          isLastItem={index === items.length - 1}
                          isHeroCart={config?.isHeroCart || false}
                          isEngineBay={config?.isEngineBay || false}
                          index={index}
                          {...(handleSelectCar ? { handleSelectCar } : {})} // Only pass if it exists
                          selectedCar={selectedCar || null}
                          // onMarkFavorite={onMarkFavorite}
                        />
                      ) : (
                        <DefaultSearchCard
                          // This is for previousSearch slider
                          item={item}
                          activeIndex={index}
                          isEngineBay={config?.isEngineBay || false}
                          onMarkFavorite={onMarkFavorite}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {!isRightArrowDisabled() && !config?.isHeroCart && (
              <Box
                className={`absolute right-0 top-0 z-20 hidden h-full ${config?.isEngineBay ? "sm:block" : "lg:block"}`}
              >
                <BlurOverlay />
              </Box>
            )}
            {savedCardsPath && <BlurOverlayEB />}
          </Box>
        </Box>
      )}
    </>
  );
}
