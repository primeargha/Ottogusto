"use client";
import React, { useState, useRef, useEffect } from "react";

import Image from "next/image";
import { Box } from "@/components/ui/box";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAlMB9p0lL0kAAAAASUVORK5CYII=";

export interface ProductImagesInterface {
  order?: number;
  url?: string;
  label?: string;
  type?: string;
}

const OGImageCarousal = ({
  data,
  productTitle,
  className,
  serverMainImage,
}: {
  data: ProductImagesInterface[];
  productTitle?: string;
  className?: string;
  /** Server-rendered LCP image; client main image takes over after interaction. */
  serverMainImage?: React.ReactNode;
}) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [titleimage, settitleimage] = useState(data[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Magnifier states
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const imageRectRef = useRef<DOMRect | null>(null);

  // Mobile modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Pinch-to-zoom states
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const modalImageRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const scrollMeasureFrame = useRef<number | null>(null);

  const [thumbnailsReady, setThumbnailsReady] = useState(false);
  const [useClientMain, setUseClientMain] = useState(!serverMainImage);

  useEffect(() => {
    const id = requestAnimationFrame(() => setThumbnailsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const enableClientMain = () => {
    if (!useClientMain) setUseClientMain(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));

    if (scrollContainerRef.current) {
      const itemWidth = 68;
      scrollContainerRef.current.scrollLeft -= itemWidth;
    }
  };

  const checkScrollPosition = () => {
    if (scrollMeasureFrame.current !== null) {
      return;
    }

    scrollMeasureFrame.current = requestAnimationFrame(() => {
      scrollMeasureFrame.current = null;
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    });
  };

  // Magnifier mouse handlers (mouse events don't fire on touch-only mobile devices;
  // visibility on mobile/tablet viewports is additionally suppressed via CSS below)
  const handleMouseEnter = () => {
    if (imageRef.current) {
      imageRectRef.current = imageRef.current.getBoundingClientRect();
    }
    setShowMagnifier(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    if (!imageRectRef.current) {
      imageRectRef.current = imageRef.current.getBoundingClientRect();
    }

    const rect = imageRectRef.current;
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMagnifierPosition({ x: e.clientX, y: e.clientY });
    setImagePosition({ x: xPercent, y: yPercent });
  };

  const handleMouseLeave = () => {
    imageRectRef.current = null;
    setShowMagnifier(false);
  };

  const handleWheel = () => {
    imageRectRef.current = null;
    setShowMagnifier(false);
  };

  // Handle image click for mobile/tablet (checked on demand to avoid a layout-shifting
  // state update on mount; matches the base/gtsm CSS breakpoint used elsewhere: < 1024px)
  const handleImageClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsModalOpen(true);
    }
  };

  // Reset zoom and pan
  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetZoom();
  };

  // Get distance between two touch points
  const getDistance = (touches: TouchList) => {
    const touch1: any = touches[0];
    const touch2: any = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      const distance = getDistance(e?.touches as any);
      setLastDistance(distance);
    } else if (e.touches.length === 1) {
      // Single touch for dragging
      isDragging.current = true;
      lastPos.current = {
        x: e.touches[0]?.clientX as any,
        y: e.touches[0]?.clientY as any,
      };

      // Double tap detection
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        if (scale === 1) {
          setScale(2.5);
        } else {
          resetZoom();
        }
      }
      setLastTap(now);
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const distance = getDistance(e.touches as any);
      if (lastDistance > 0) {
        const delta = distance - lastDistance;
        const newScale = Math.min(Math.max(1, scale + delta * 0.01), 5);
        setScale(newScale);
      }
      setLastDistance(distance);
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      // Pan when zoomed
      e.preventDefault();
      const deltaX = (e.touches[0]?.clientX as any) - lastPos.current.x;
      const deltaY = (e.touches[0]?.clientY as any) - lastPos.current.y;

      setTranslateX((prev) => prev + deltaX);
      setTranslateY((prev) => prev + deltaY);

      lastPos.current = {
        x: e.touches[0]?.clientX as any,
        y: e.touches[0]?.clientY as any,
      };
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setLastDistance(0);
    isDragging.current = false;
  };

  // Check if device is tablet (mobile is now handled purely via CSS breakpoints
  // so it no longer causes a re-render/layout-shift on mount)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsTablet(width >= 640 && width < 1024);
    };

    handleResize(); // run once on mount

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    checkScrollPosition();

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
        if (scrollMeasureFrame.current !== null) {
          cancelAnimationFrame(scrollMeasureFrame.current);
          scrollMeasureFrame.current = null;
        }
      };
    }

    return () => {
      if (scrollMeasureFrame.current !== null) {
        cancelAnimationFrame(scrollMeasureFrame.current);
        scrollMeasureFrame.current = null;
      }
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      <Box
        className={`mx-auto flex-row gap-3 base:max-h-[240px] base:min-h-[239px] base:w-full gtsm:h-[432px] gtsm:max-h-[433px] gtlg:flex gtlg:max-h-[395px] gtlg:min-h-[394px] gtlg:max-w-[400px] ${className}`}
      >
        <Box className="flex flex-col items-center justify-between gap-3 bg-transparent base:w-[98px] gtlg:w-[85px]">
          <Box
            ref={scrollContainerRef as any}
            className="relative z-0 flex flex-1 flex-col gap-3 overflow-x-auto"
            style={
              {
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
              } as any
            }
            onScroll={checkScrollPosition}
          >
            {/* PERF: Removed <style jsx global> — scrollbar hiding is already handled by
               scrollbar-hide class and scrollbarWidth: "none" inline style above */}

            {thumbnailsReady &&
              data?.map((thumb, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSelectedIndex(index);
                    settitleimage(thumb);
                    enableClientMain();
                  }}
                  className={`h-[67px] w-[67px] flex-shrink-0 cursor-pointer border-2 ${
                    index === currentIndex ? "border-color-border-focus" : "border-transparent"
                  } rounded-0 transition-all`}
                >
                  {thumb?.url && (
                    <Image
                      src={thumb.url}
                      alt={thumb.label || `Thumbnail ${index}`}
                      className="h-full w-full object-cover"
                      width={67}
                      height={67}
                      quality={80}
                    />
                  )}
                </Box>
              ))}
          </Box>
        </Box>
        {/* Main image display with magnifier */}
        <Box className="relative flex overflow-hidden bg-color-background-none base:mx-auto base:w-full base:items-center base:justify-center gtsm:mx-auto gtsm:items-start gtsm:justify-start gtlg:flex">
          <Box
            className={`relative h-[240px] max-h-[241px] w-full cursor-pointer gtsm:h-[432px] gtsm:max-h-[433px] gtsm:cursor-crosshair gtlg:h-auto`}
            ref={imageRef as any}
            //@ts-ignore
            onMouseEnter={() => {
              enableClientMain();
              handleMouseEnter();
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onClick={() => {
              enableClientMain();
              handleImageClick();
            }}
          >
            {serverMainImage && !useClientMain ? (
              <Box className="relative h-full w-full">{serverMainImage}</Box>
            ) : null}
            {useClientMain && titleimage?.url ? (
              <Image
                src={titleimage.url}
                title={`${titleimage?.label ?? ""} ${productTitle ?? ""}`.trim()}
                alt={`${titleimage?.label ?? ""} ${productTitle ?? ""}`.trim() || "Product image"}
                className="h-full w-full object-contain"
                width={400}
                height={400}
                quality={75}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                priority={!serverMainImage}
                fetchPriority={serverMainImage ? "auto" : "high"}
              />
            ) : null}
          </Box>

          {/* Magnifier lens - only on desktop (hidden below the gtlg breakpoint via CSS,
              not JS state, so no layout shift is triggered on mount) */}
          {showMagnifier && !isTablet && (
            <Box
              className="pointer-events-none fixed z-50 hidden rounded-full border border-gray-300 shadow-2xl gtlg:block"
              style={
                {
                  width: "230px",
                  height: "230px",
                  left: `${magnifierPosition.x - 115}px`,
                  top: `${magnifierPosition.y - 115}px`,
                  backgroundImage: `url(${titleimage?.url})`,
                  backgroundSize: "450%",
                  backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                  backgroundRepeat: "no-repeat",
                } as any
              }
            />
          )}
        </Box>
      </Box>

      {/* Mobile/Tablet Modal with Pinch-to-Zoom (isModalOpen is only ever set to true
          for mobile/tablet viewports, in handleImageClick) */}
      {isModalOpen && (
        <Box
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
          style={
            {
              backdropFilter: "blur(4px)",
            } as any
          }
          onClick={closeModal}
        >
          <Box
            ref={modalImageRef as any}
            onTouchStart={handleTouchStart as any}
            onTouchMove={handleTouchMove as any}
            onTouchEnd={handleTouchEnd}
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={
              {
                touchAction: "none",
              } as any
            }
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                transition: isDragging.current ? "none" : "transform 0.3s ease-out",
              }}
            >
              <Image
                src={`${titleimage?.url}`}
                title={`${titleimage?.label} ${productTitle}`}
                alt={`${titleimage?.label} ${productTitle}`}
                className="h-auto max-h-[98vh] w-auto max-w-[98vw] object-contain"
                width={1200}
                height={1200}
                quality={85}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-80 text-2xl font-bold text-black transition-all hover:bg-opacity-100"
            >
              ×
            </button>

            {/* Zoom indicator - shows current zoom level */}
            {scale > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white bg-opacity-80 px-4 py-2 text-sm font-medium text-black">
                {Math.round(scale * 100)}%
              </div>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default OGImageCarousal;
