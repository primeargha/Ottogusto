// PriceMeterDropdownBlock.tsx

"use client";

import { Box } from "@/components/ui/box";
import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SmallPriceDropdown from "./SmallPriceDropdown";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { ProductFilters, UpdateFiltersNavigateOptions } from "@/hooks/useUrlParams";
import PriceMeterNew2 from "./PriceMeterNew2";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";

interface PriceMeterDropdownBlockProps {
  isActive: boolean | string;
  currentYear: string | null | undefined;
  priceFromLastAPICall: (type: "min" | "max") => number;
  updateFilters: (
    newFilters: Partial<ProductFilters>,
    basePath?: string,
    screen?: string,
    outRedirect?: boolean,
    ifWithoutDebounce?: boolean,
    navigateOptions?: UpdateFiltersNavigateOptions,
  ) => void;
  setMinPrice: (val: number | null) => void;
  setMaxPrice: (val: number | null) => void;
}

export const PriceMeterDropdownBlock = ({
  isActive,
  currentYear,
  priceFromLastAPICall,
  updateFilters,
  setMinPrice,
  setMaxPrice,
}: PriceMeterDropdownBlockProps) => {
  const { getLabel } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const priceMeterDropdownRef = useRef<HTMLDivElement | null>(null);

  const [pendingMin, setPendingMin] = useState<number | null>(null);
  const [pendingMax, setPendingMax] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const isVisible = isActive || isOpen;
  const isDraggingRef = useRef(false);

  // ─── Sync pending values when dropdown opens ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setPendingMin(priceFromLastAPICall("min"));
      setPendingMax(priceFromLastAPICall("max"));
    }
  }, [isOpen, priceFromLastAPICall]);

  const isInputFocusedRef = useRef(false);

  // ─── Close on scroll ──────────────────────────────────────────────────────
  // ─── Close on scroll (guarded by input focus) ─────────────────────────────
  useEffect(() => {
    function isInputInsideDropdownFocused() {
      if (isInputFocusedRef.current) return true;
      // Fallback: DOM truth for the race where focusin hasn't fired yet
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      const tag = active.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && !active.isContentEditable) return false;
      // On mobile the panel is portaled — check [data-dropdown-panel] instead of ref
      return (
        !!active.closest("[data-dropdown-panel]") ||
        !!priceMeterDropdownRef.current?.contains(active)
      );
    }

    function handleScroll() {
      if (isOpen && !isDraggingRef.current && !isInputInsideDropdownFocused()) {
        setIsOpen(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // ─── Track input focus (covers both inline desktop and portaled mobile) ────
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (
          target.closest("[data-dropdown-panel]") ||
          priceMeterDropdownRef.current?.contains(target)
        ) {
          isInputFocusedRef.current = true;
        }
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (
          target.closest("[data-dropdown-panel]") ||
          priceMeterDropdownRef.current?.contains(target)
        ) {
          setTimeout(() => {
            isInputFocusedRef.current = false;
          }, 300);
        }
      }
    };

    // Attach to document — catches inputs in the portal (body) AND inline
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen]);

  useEffect(() => {
    const container = priceMeterDropdownRef.current;
    if (!container || !isOpen) return;

    const handleFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") {
        isInputFocusedRef.current = true;
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") {
        // Small delay — on Android, focusout fires before the scroll settles
        setTimeout(() => {
          isInputFocusedRef.current = false;
        }, 300);
      }
    };

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);
    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen]);
  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If a drag just ended, swallow this click and reset the flag
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        return;
      }

      const target = event.target as unknown as Node;

      // if (
      //   (event.target as HTMLElement)?.closest?.("#range-slider-price") ||
      //   (event.target as HTMLElement)?.closest?.(".range-slider") ||
      //   (event.target as HTMLElement)?.classList?.contains("range-slider__thumb") ||
      //   (event.target as HTMLElement)?.classList?.contains("range-slider__range")
      // ) {
      //   return;
      // }

      if (isOpen && !priceMeterDropdownRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    // ── Track drag start on any slider element ──────────────────────────────
    const handleMouseDown = (event: MouseEvent) => {
      const el = event.target as HTMLElement;
      if (
        el?.closest?.("#range-slider-price") ||
        el?.closest?.(".range-slider") ||
        el?.classList?.contains("range-slider__thumb") ||
        el?.classList?.contains("range-slider__range")
      ) {
        isDraggingRef.current = true;
      }
    };

    // ── Clear drag flag on mouseup anywhere ────────────────────────────────
    // We use a short timeout so this runs *after* any click event that fires
    // on the same release (click fires before the next event loop tick's cleanup)
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        // Keep the flag true just long enough for handleClickOutside to read it,
        // then clear it so normal outside-clicks work again
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 0);
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleDropdownClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isVisible) return;
      setIsOpen((prev) => !prev);
    },
    [isVisible],
  );

  const handlePriceChange = useCallback((val: [number, number]) => {
    setPendingMin(val[0]);
    setPendingMax(val[1]);
  }, []);

  // Add these refs to store initial values on open
  const initialMinRef = useRef<number | null>(null);
  const initialMaxRef = useRef<number | null>(null);

  // ─── Sync pending values when dropdown opens ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const min = priceFromLastAPICall("min");
      const max = priceFromLastAPICall("max");
      setPendingMin(min);
      setPendingMax(max);
      // Capture initial values for reset
      initialMinRef.current = min;
      initialMaxRef.current = max;
    }
  }, [isOpen, priceFromLastAPICall]);

  const handleReset = useCallback(() => {
    const min = initialMinRef.current;
    const max = initialMaxRef.current;
    setPendingMin(min);
    setPendingMax(max);
    setMinPrice(null);
    setMaxPrice(null);
    setResetKey((prev) => prev + 1); // ← forces PriceMeterNew2 to remount
    updateFilters({ year: currentYear ?? "" }, "/products");
  }, [currentYear, setMinPrice, setMaxPrice, updateFilters]);

  const handleSave = useCallback(() => {
    if (pendingMin === null || pendingMax === null) return;
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    updateFilters(
      { minPrice: pendingMin, maxPrice: pendingMax, year: currentYear ?? "" },
      "/products",
    );
    setIsOpen(false);
  }, [currentYear, pendingMin, pendingMax, setMinPrice, setMaxPrice, updateFilters]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      ref={priceMeterDropdownRef as RefObject<View & HTMLDivElement>}
      onClick={handleDropdownClick}
      className={`relative h-full cursor-pointer rounded-[6px] border border-color-border-default p-2 gtsm:w-auto gtlg:w-auto ${isOpen ? "z-[60] overflow-visible" : ""}`}
    >
      <SmallPriceDropdown
        label={getLabel("price")}
        selectedValue=""
        value={getLabel("price")}
        placeholder={getLabel("price")}
        property={isOpen ? "open" : "inactive"}
        direction="horizontal"
        isDisabled={!isVisible}
        // onDropdownClick={handleDropdownClick}
      />

      {isOpen && (
        <OGDropdownTray
          headerLabel={getLabel("price")}
          hasHeader={true}
          hasFooter={false}
          hasResetButton={true}
          showTitleCloseIcon={true}
          showTopDivider={true}
          modalCloseHandler={() => setIsOpen(false)}
          resetHandler={handleReset}
          filterName="price"
        >
          {/* Main content + custom footer */}
          <Box className="flex w-full flex-col gap-space-xs">
            {/* Price slider */}
            <Box className="h-auto gap-space-2xs overflow-y-auto py-space-md scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
              <PriceMeterNew2
                min={priceFromLastAPICall("min")}
                max={priceFromLastAPICall("max")}
                onChange={handlePriceChange}
                key={resetKey}
              />
            </Box>

            {/* Footer — always Reset + Save, no pending toggle */}
            <Box className="flex w-full flex-col gap-[10px]">
              <Box className="h-[1px] w-full border-t border-color-border-default" />
              <Box className="flex w-full flex-row gap-[4px]">
                <OGButton type="outlined" size="small" className="w-full" onClick={handleReset}>
                  {getLabel("filter_reset")}
                </OGButton>
                <OGButton type="primary" size="small" className="w-full" onClick={handleSave}>
                  {getLabel("filter_save")}
                </OGButton>
              </Box>
            </Box>
          </Box>
        </OGDropdownTray>
      )}
    </Box>
  );
};
