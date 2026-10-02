import { useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box } from "../ui/box";

interface CustomTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  headingContent?: React.ReactNode;
  /** PDP compatibility icon: mobile-only top placement + viewport clamping (desktop unchanged) */
  iconAnchorOnMobile?: boolean;
  /** Delay (ms) before showing on hover. Default 0 keeps existing immediate behaviour. */
  showDelayMs?: number;
  /** When false, click does not toggle the tooltip (needed when wrapping links). Default true. */
  openOnClick?: boolean;
  /** Extra classes on the trigger wrapper (e.g. `w-full` for grid cells). */
  className?: string;
  /** Size the tooltip to its content instead of enforcing a 200px min-width. Use for short, single-word content (e.g. names). */
  fitContent?: boolean;
}

const VIEWPORT_PADDING = 12;
const MOBILE_VIEWPORT_PADDING = 16;
const MOBILE_MAX_WIDTH = 639;
const ESTIMATED_TOOLTIP_WIDTH = 280;
const ARROW_EDGE_INSET = 12;
const TOOLTIP_GAP_DESKTOP = 8;
const TOOLTIP_GAP_MOBILE = 10;

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH;
}

function clampHorizontalCenter(x: number, tooltipWidth: number, padding: number): number {
  const halfWidth = tooltipWidth / 2;
  const minX = padding + halfWidth;
  const maxX = window.innerWidth - padding - halfWidth;
  if (minX > maxX) {
    return window.innerWidth / 2;
  }
  return Math.max(minX, Math.min(maxX, x));
}

function clampArrowOffset(arrowOffsetX: number, tooltipWidth: number): number {
  const maxOffset = Math.max(0, tooltipWidth / 2 - ARROW_EDGE_INSET);
  return Math.max(-maxOffset, Math.min(maxOffset, arrowOffsetX));
}

/** Mobile: clamp tooltip left/right edges inside viewport; arrow tracks icon. */
function computeMobileTooltipLeft(
  triggerX: number,
  tooltipWidth: number,
  padding: number,
): { left: number; arrowLeft: number } {
  const available = Math.max(0, window.innerWidth - padding * 2);
  const width = Math.min(Math.max(tooltipWidth, 1), available);
  let left = triggerX - width / 2;
  left = Math.max(padding, Math.min(left, window.innerWidth - padding - width));
  let arrowLeft = triggerX - left;
  arrowLeft = Math.max(ARROW_EDGE_INSET, Math.min(width - ARROW_EDGE_INSET, arrowLeft));
  return { left, arrowLeft };
}

type TooltipCoords = {
  triggerX: number;
  y: number;
  placement: "top" | "bottom";
  gap: number;
  positionMode: "center" | "left";
  /** Center x when positionMode is center */
  x?: number;
  arrowOffsetX?: number;
  /** Left edge when positionMode is left (mobile) */
  left?: number;
  arrowLeft?: number;
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  content,
  children,
  headingContent,
  iconAnchorOnMobile = false,
  showDelayMs = 0,
  openOnClick = true,
  className = "",
  fitContent = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current !== null) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearShowTimeout();
    if (showDelayMs <= 0) {
      setIsVisible(true);
      return;
    }
    showTimeoutRef.current = setTimeout(() => {
      showTimeoutRef.current = null;
      setIsVisible(true);
    }, showDelayMs);
  }, [clearShowTimeout, showDelayMs]);

  const handleMouseLeave = useCallback(() => {
    clearShowTimeout();
    setIsVisible(false);
  }, [clearShowTimeout]);

  useEffect(() => {
    return () => {
      clearShowTimeout();
    };
  }, [clearShowTimeout]);

  useLayoutEffect(() => {
    if (!isVisible || !ref.current) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const element = ref.current;
      if (!element) return;

      const triggerRect = element.getBoundingClientRect();
      const tooltipWidth = Math.max(tooltipRef.current?.offsetWidth ?? 0, ESTIMATED_TOOLTIP_WIDTH);
      const tooltipHeight = tooltipRef.current?.offsetHeight ?? 80;
      const mobile = iconAnchorOnMobile && isMobileViewport();
      const viewportPadding = mobile ? MOBILE_VIEWPORT_PADDING : VIEWPORT_PADDING;

      let placement: "top" | "bottom" = "top";
      const spaceAbove = triggerRect.top;
      const spaceBelow = window.innerHeight - triggerRect.bottom;

      if (!mobile && spaceAbove < tooltipHeight + 20 && spaceBelow > spaceAbove) {
        placement = "bottom";
      }

      const triggerX = triggerRect.left + triggerRect.width / 2;
      const y = triggerRect.top + (placement === "bottom" ? triggerRect.height : 0);
      const gap = mobile ? TOOLTIP_GAP_MOBILE : TOOLTIP_GAP_DESKTOP;

      if (mobile) {
        const { left, arrowLeft } = computeMobileTooltipLeft(
          triggerX,
          tooltipWidth,
          viewportPadding,
        );
        setCoords({
          triggerX,
          y,
          placement,
          gap,
          positionMode: "left",
          left,
          arrowLeft,
        });
        return;
      }

      const tooltipCenterX = clampHorizontalCenter(triggerX, tooltipWidth, viewportPadding);
      const arrowOffsetX = clampArrowOffset(triggerX - tooltipCenterX, tooltipWidth);

      setCoords({
        triggerX,
        y,
        placement,
        gap,
        positionMode: "center",
        x: tooltipCenterX,
        arrowOffsetX,
      });
    };

    updatePosition();
    const frameId1 = requestAnimationFrame(() => {
      updatePosition();
      requestAnimationFrame(updatePosition);
    });

    return () => {
      cancelAnimationFrame(frameId1);
    };
  }, [isVisible, content, headingContent, iconAnchorOnMobile]);

  /* ✅ SCROLL PROTECTION */
  useLayoutEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      clearShowTimeout();
      setIsVisible(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("wheel", handleScroll, true);
    window.addEventListener("touchmove", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("wheel", handleScroll, true);
      window.removeEventListener("touchmove", handleScroll, true);
    };
  }, [clearShowTimeout, isVisible]);
  /* ✅ END SCROLL PROTECTION */

  const isLeftMode = coords?.positionMode === "left";

  return (
    <Box
      ref={ref as any}
      className={
        className
          ? `relative cursor-pointer ${className}`
          : "relative inline-flex w-auto cursor-pointer"
      }
      //@ts-ignore
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={
        openOnClick
          ? (e) => {
              e.stopPropagation();
              clearShowTimeout();
              setIsVisible((prev) => !prev);
            }
          : undefined
      }
    >
      {children}

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              top: coords
                ? coords.placement === "bottom"
                  ? coords.y + coords.gap
                  : coords.y - coords.gap
                : -9999,
              left: isLeftMode ? (coords?.left ?? -9999) : (coords?.x ?? -9999),
              transform: isLeftMode
                ? coords?.placement === "bottom"
                  ? "none"
                  : "translateY(-100%)"
                : coords?.placement === "bottom"
                  ? "translate(-50%, 0%)"
                  : "translate(-50%, -100%)",
              zIndex: 9999,
              visibility: coords ? "visible" : "hidden",
              maxWidth: isLeftMode ? `calc(100vw - ${MOBILE_VIEWPORT_PADDING * 2}px)` : undefined,
            }}
          >
            <Box
              className={
                iconAnchorOnMobile
                  ? "relative w-max min-w-0 max-w-[calc(100vw-32px)] rounded-lg bg-color-background-inverse px-4 py-2 shadow-lg gtsm:min-w-[200px] gtsm:max-w-[min(320px,calc(100vw-24px))]"
                  : fitContent
                    ? "relative w-max min-w-0 max-w-[min(320px,calc(100vw-24px))] rounded-lg bg-color-background-inverse px-4 py-2 shadow-lg"
                    : "relative min-w-[200px] max-w-[min(320px,calc(100vw-24px))] rounded-lg bg-color-background-inverse px-4 py-2 shadow-lg"
              }
            >
              <Box className="flex w-full flex-col">
                {headingContent ? (
                  <Box className="whitespace-normal text-color-text-inverse typography-heading-04">
                    {headingContent}
                  </Box>
                ) : null}

                <Box className="whitespace-normal text-color-text-inverse typography-body-01">
                  {content}
                </Box>
              </Box>

              {coords ? (
                <Box
                  className="absolute h-2 w-2 rotate-45 bg-color-background-inverse"
                  //@ts-ignore
                  style={{
                    left: isLeftMode
                      ? `${coords.arrowLeft ?? ARROW_EDGE_INSET}px`
                      : `calc(50% + ${coords.arrowOffsetX ?? 0}px)`,
                    transform: "translateX(-50%) rotate(45deg)",
                    top: coords.placement === "top" ? "calc(100% - 4px)" : undefined,
                    bottom: coords.placement === "bottom" ? "calc(100% - 4px)" : undefined,
                    borderRadius: "2px",
                    boxShadow: "2px 2px 2px rgba(0,0,0,0.08)",
                  }}
                />
              ) : null}
            </Box>
          </div>,
          document.body,
        )}
    </Box>
  );
};
