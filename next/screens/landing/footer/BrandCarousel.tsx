"use client";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import CardHoverArrow from "@/public/assets/icons/card-hover-arrow.svg";
import LeftArrow from "@/public/assets/icons/left-arrow.svg";
import RightArrow from "@/public/assets/icons/right-arrow.svg";
import { Text } from "@/components/ui/text";
import { boolean } from "zod";
import { useBranding } from "@/contexts/BrandingContext";

// TODO: Replace stubs with actual component imports once they are created
const SavedCars = ({ item, isLastItem }: { item: any; isLastItem: boolean }) => (
  <Box>
    <Text>{item?.name || "Saved Car"}</Text>
  </Box>
);
const DefaultSearchCard = ({ item }: { item: any }) => (
  <Box>
    <Text>{item?.name || "Search Card"}</Text>
  </Box>
);
const BlurOverlay = () => (
  <Box className="h-full w-16 bg-gradient-to-l from-white to-transparent" />
);

type Props = {};

interface CarouselConfig {
  itemsPerView: {
    desktop: number;
    mobile: number;
  };
  isFooter?: boolean;
  isSavedCar?: boolean;
  containerClassName?: string;
  cardClassName?: string;
  breakpoint?: number; // px value for mobile/desktop switch
  renderCard?: (item: any) => React.ReactNode;
}

const BrandCarousel = ({
  items,
  // @ts-ignore
  config = {
    isFooter: true,
    itemsPerView: { desktop: 5, mobile: 2 },
    isSavedCar: false,
    containerClassName: "",
    cardClassName: "w-[45%] flex-shrink-0 lg:w-[19%]",
    breakpoint: 992,
    renderCard: undefined,
  },
}: {
  items: any[];
  config?: CarouselConfig;
}) => {
  const { getLabel } = useBranding();
  const [currentIndex, setCurrentIndex] = useState<any>(0);
  const [transformValue, setTransformValue] = useState("translateX(0)");
  const [isMounted, setIsMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<any>(0);
  const [touchEnd, setTouchEnd] = useState<any>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState<any>(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const checkScreenSize = () => {
        setIsDesktop(window.innerWidth >= (config.breakpoint ?? 992));
      };
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, [config.breakpoint]);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      const cardWidth = 280; // Fixed card width in pixels
      const containerWidth = window.innerWidth;
      const pixelMove = currentIndex * cardWidth;
      setTransformValue(`translateX(-${pixelMove}px)`);
    }
  }, [currentIndex, isMounted]);

  if (items.length === 0) return null;

  const itemsPerView = {
    desktop: 5,
    mobile: 2,
  };

  const isFirstSlide = currentIndex === 0;

  const isRightArrowDisabled = () => {
    if (typeof window !== "undefined" && isMounted) {
      const cardLeftWidth = config?.isSavedCar ? 1200 : 220; // Fixed card left width in pixels
      const cardWidth = config?.isSavedCar ? 400 : 280; // Fixed card width in pixels
      const containerWidth = window.innerWidth;
      const visibleWidth = containerWidth - (window.innerWidth >= 992 ? cardLeftWidth : 0); // Account for desktop sidebar
      const currentVisibleItems = Math.floor(visibleWidth / cardWidth);

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
    //@ts-ignore
    setStartX(e.targetTouches[0].clientX);
    setPrevTranslate(currentTranslate);
    //@ts-ignore
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    //@ts-ignore
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - startX;
    const cardWidth = 280; // Fixed card width in pixels

    // Convert pixel movement to card positions
    const newTranslate = prevTranslate + diff;

    // Calculate bounds
    const maxTranslate = 0;
    const minTranslate = -(items.length - (isDesktop ? 5 : 2)) * cardWidth;

    // Apply bounds with smooth edge resistance
    let boundedTranslate = newTranslate;
    if (boundedTranslate > maxTranslate) {
      boundedTranslate = maxTranslate / 2;
    } else if (boundedTranslate < minTranslate) {
      boundedTranslate = minTranslate + (newTranslate - minTranslate) / 2;
    }

    setCurrentTranslate(boundedTranslate);
    setTransformValue(`translateX(${boundedTranslate}px)`);
    setTouchEnd(currentX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const cardWidth = 280; // Fixed card width in pixels

    // Snap to nearest card
    const snapPoint = Math.round(currentTranslate / cardWidth) * cardWidth;

    // Apply bounds
    const maxTranslate = 0;
    const minTranslate = -(items.length - (isDesktop ? 5 : 2)) * cardWidth;
    const boundedSnapPoint = Math.max(Math.min(snapPoint, maxTranslate), minTranslate);

    setCurrentTranslate(boundedSnapPoint);
    setTransformValue(`translateX(${boundedSnapPoint}px)`);
    setCurrentIndex(Math.abs(Math.round(boundedSnapPoint / cardWidth)));
  };

  return (
    <>
      {items && items.length > 0 && (
        <Box className={config.containerClassName || ""}>
          <Box
            className={`"relative w-full px-2 ${config?.isSavedCar ? "py-2" : "bg-[var(--color-beige-800)] py-4"}`}
          >
            {!config?.isSavedCar && (
              <Box className="mb-[48px] px-4">
                <Text className="justify-start font-Overpass text-2xl font-bold leading-relaxed text-color-text-body">
                  {getLabel("previous_search_title")}
                </Text>
                <Text className="justify-center font-Overpass text-base font-normal leading-none text-emerald-950">
                  {getLabel("previous_search_subtitle")}
                </Text>
              </Box>
            )}

            <Box className="">
              {/* Show arrows only on desktop */}
              {/* Navigation arrows with higher z-index */}
              {isMounted && isDesktop && (
                <>
                  {/*Excluding Saved cars first and last arrow will execute as it is*/}
                  {!config?.isSavedCar && (
                    <>
                      <Pressable
                        onPress={handlePrev}
                        disabled={isFirstSlide}
                        className={`absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
                          isFirstSlide ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      >
                        <Image
                          src={LeftArrow}
                          alt="left arrow"
                          title="Previous"
                          height={30}
                          width={30}
                        />
                      </Pressable>

                      <Pressable
                        onPress={handleNext}
                        disabled={isRightArrowDisabled()}
                        className={`absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
                          isRightArrowDisabled()
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <Image
                          src={RightArrow}
                          alt="right arrow"
                          title="Next"
                          height={30}
                          width={30}
                        />
                      </Pressable>
                    </>
                  )}

                  {/*Left Array hide only for first element/box for Saved Cars only*/}
                  {config?.isSavedCar && (
                    <>
                      {!isFirstSlide && (
                        <Pressable
                          onPress={handlePrev}
                          disabled={isFirstSlide}
                          className={`absolute left-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
                            isFirstSlide ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                          }`}
                        >
                          <Image
                            src={LeftArrow}
                            alt="left arrow"
                            title="Previous"
                            height={30}
                            width={30}
                          />
                        </Pressable>
                      )}

                      {/*Right Array hide only element last element/box execution for Saved Cars only*/}
                      {!isRightArrowDisabled() && (
                        <Pressable
                          onPress={handleNext}
                          disabled={isRightArrowDisabled()}
                          className={`absolute right-[-1.5rem] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
                            isRightArrowDisabled()
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <Image
                            src={RightArrow}
                            alt="right arrow"
                            title="Next"
                            height={30}
                            width={30}
                          />
                        </Pressable>
                      )}
                    </>
                  )}
                </>
              )}

              <Box className="relative overflow-hidden px-4">
                {/* Blur overlay with medium z-index */}

                {/* Cards container with lowest z-index */}
                <Box
                  className="relative z-10 flex flex-row transition-all duration-300 ease-out"
                  // @ts-ignore
                  style={{
                    transform: transformValue,
                    touchAction: "none",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                  // @ts-ignore
                  onTouchStart={handleTouchStart}
                  // @ts-ignore
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {items?.map((item, index) => (
                    <Box key={index} className={config.cardClassName || ""}>
                      {config.isFooter && (
                        <Box>
                          <pre>{JSON.stringify(item, null, 2)}</pre>
                        </Box>
                      )}
                      {config.renderCard ? (
                        config.renderCard(item)
                      ) : config?.isSavedCar ? ( // ✅ Corrected access to `isSavedCar`
                        <SavedCars item={item} isLastItem={index === items.length - 1} />
                      ) : (
                        <DefaultSearchCard item={item} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {!isRightArrowDisabled() && (
              <Box className="absolute right-0 top-0 z-20 hidden h-full lg:block">
                <BlurOverlay />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default BrandCarousel;
