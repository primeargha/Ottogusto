import { useState, useRef, useEffect, useCallback } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
  AccordionContentText,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { ChevronUpIcon, ChevronDownIcon } from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import { debounce } from "@/utils/debounce";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useFilterStore } from "@/stores/useFilter";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";

export default function PriceMeter({ data }: { data: any }) {
  const debouncedFnRef = useRef<any>(null);
  const { updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const isDesktop = useMedia("(min-width: 1200px)");
  const { minPrice, maxPrice, setMinPrice, setMaxPrice, defaultPriceRange } = useFilterStore();
  const { getLabel } = useBranding();
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const sliderRectRef = useRef<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const [sliderWidth, setSliderWidth] = useState<number>(0);

  // Initialize the debounced function once using useRef
  useEffect(() => {
    //@ts-ignore
    debouncedFnRef.current = debounce(async (newMin: number | null, newMax: number | null) => {
      // Get current year from URL to preserve it
      const currentUrl = new URLSearchParams(window.location.search);
      const currentYear = currentUrl.get("year");

      // Only call updateFilters when values actually change
      updateFilters(
        {
          minPrice: newMin,
          maxPrice: newMax,
          year: currentYear, // Preserve year from URL
        },
        "/products",
      );
    }, 1000);

    return () => {
      debouncedFnRef.current?.cancel();
    };
  }, [updateFilters]);

  // Handle resize
  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;

    let frameId: number | null = null;

    const measure = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        if (!sliderRef.current) return;
        setSliderWidth(sliderRef.current.offsetWidth);
      });
    };

    measure();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(element);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", measure);
      }
    };
  }, []);

  // Calculate slider value based on position
  const calculateValue = useCallback(
    (clientX: number): number => {
      const sliderRect = sliderRectRef.current || sliderRef.current?.getBoundingClientRect();
      if (!sliderRect) return 0;

      // Protect against invalid defaultPriceRange values
      const safeMin =
        typeof defaultPriceRange.min === "number" && !isNaN(defaultPriceRange.min)
          ? defaultPriceRange.min
          : 0;
      const safeMax =
        typeof defaultPriceRange.max === "number" && !isNaN(defaultPriceRange.max)
          ? defaultPriceRange.max
          : 50000;

      const position = Math.max(0, Math.min(clientX - sliderRect.left, sliderRect.width));
      const percentage = position / sliderRect.width;
      return safeMin + percentage * (safeMax - safeMin);
    },
    [defaultPriceRange],
  );

  const getHandlePosition = (value: number | null): string => {
    if (value === null) return "0%";

    // Protect against invalid defaultPriceRange values
    const safeMin =
      typeof defaultPriceRange.min === "number" && !isNaN(defaultPriceRange.min)
        ? defaultPriceRange.min
        : 0;
    const safeMax =
      typeof defaultPriceRange.max === "number" && !isNaN(defaultPriceRange.max)
        ? defaultPriceRange.max
        : 50000;

    // Avoid division by zero
    if (safeMax === safeMin) return "0%";

    const percentage = ((value - safeMin) / (safeMax - safeMin)) * 100;
    return `${Math.min(100, Math.max(0, percentage))}%`;
  };

  // Handle movement with improved precision
  const handleMove = useCallback(
    (clientX: number) => {
      const rawValue = calculateValue(clientX);
      const value = Math.round(rawValue);

      // Protect against invalid defaultPriceRange values
      const safeMin =
        typeof defaultPriceRange.min === "number" && !isNaN(defaultPriceRange.min)
          ? defaultPriceRange.min
          : 0;
      const safeMax =
        typeof defaultPriceRange.max === "number" && !isNaN(defaultPriceRange.max)
          ? defaultPriceRange.max
          : 50000;

      if (isDragging === "min") {
        const newValue = Math.min(value, (maxPrice ?? safeMax) - 1);
        const boundedValue = Math.max(safeMin, newValue);
        if (boundedValue !== minPrice) {
          setMinPrice(boundedValue);
        }
      } else if (isDragging === "max") {
        const newValue = Math.max(value, (minPrice ?? safeMin) + 1);
        const boundedValue = Math.min(safeMax, newValue);
        if (boundedValue !== maxPrice) {
          setMaxPrice(boundedValue);
        }
      }
    },
    [isDragging, minPrice, maxPrice, calculateValue, defaultPriceRange, setMinPrice, setMaxPrice],
  );

  // Update prices when dragging stops - trigger URL update
  useEffect(() => {
    if (!isDragging && debouncedFnRef.current) {
      // Only update if we have valid prices (not null)
      if (minPrice !== null && maxPrice !== null) {
        debouncedFnRef.current(minPrice, maxPrice);
      }
    }
  }, [isDragging, minPrice, maxPrice]);

  // Cancel debounced function when prices are reset to null
  useEffect(() => {
    if (minPrice === null || maxPrice === null) {
      if (debouncedFnRef.current?.cancel) {
        debouncedFnRef.current.cancel();
      }
    }
  }, [minPrice, maxPrice]);

  // Handle events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const clientX = e?.touches[0]?.clientX;
      if (clientX !== undefined) {
        handleMove(clientX);
      }
    };

    const handleEnd = () => setIsDragging(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  const handleStart = (type: "min" | "max") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (sliderRef.current) {
      sliderRectRef.current = sliderRef.current.getBoundingClientRect();
    }
    setIsDragging(type);
  };

  useEffect(() => {
    if (!isDragging) {
      sliderRectRef.current = null;
    }
  }, [isDragging]);

  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="w-full"
      defaultValue={["a"]}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0 py-3">
            {({ isExpanded }: { isExpanded: boolean }) => (
              <>
                <AccordionTitleText className="text-start">{getLabel("price")}</AccordionTitleText>
                {isExpanded ? (
                  <AccordionIcon as={ChevronUpIcon} />
                ) : (
                  <AccordionIcon as={ChevronDownIcon} />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <Divider />
        <AccordionContent className="mt-[18px] gap-6 pl-[5px] pr-[5px]">
          <Box className="relative h-6 w-full px-0" ref={sliderRef as any}>
            <Box className="absolute top-1/2 h-1 w-full -translate-y-1/2 transform rounded-sm bg-[--primary-colors-disabled]">
              <Box
                className="absolute h-1 bg-[--Primary-Colors-Main]"
                //@ts-ignore
                style={{
                  left: getHandlePosition(minPrice),
                  right: `calc(100% - ${getHandlePosition(maxPrice)})`,
                }}
              />
            </Box>
            <Box
              className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 transform cursor-pointer rounded-full bg-[--Primary-Colors-Main] shadow"
              //@ts-ignore
              style={{
                left: getHandlePosition(minPrice),
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
              }}
              onMouseDown={handleStart("min")}
              //@ts-ignore
              onTouchStart={handleStart("min")}
            />
            <Box
              className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 transform cursor-pointer rounded-full bg-[--Primary-Colors-Main] shadow"
              //@ts-ignore
              style={{
                left: getHandlePosition(maxPrice),
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
              }}
              onMouseDown={handleStart("max")}
              //@ts-ignore
              onTouchStart={handleStart("max")}
            />
          </Box>
          <AccordionContentText className="w-full px-0">
            <Box className="flex flex-row justify-between">
              <Box className="flex h-10 w-20 items-center justify-center rounded border px-2 py-2">
                <Box className="h-auto w-auto leading-4">{minPrice} €</Box>
              </Box>
              <Box className="flex h-10 w-20 items-center justify-center rounded border px-2 py-2">
                <Box className="h-auto w-auto leading-4">{maxPrice} €</Box>
              </Box>
            </Box>
          </AccordionContentText>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
