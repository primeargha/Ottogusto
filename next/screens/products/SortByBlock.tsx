import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { useBranding } from "@/contexts/BrandingContext";
import { Box } from "@/components/ui/box";
import SmallPriceDropdown from "./SmallPriceDropdown";
import { ProductFilters, UpdateFiltersNavigateOptions } from "@/hooks/useUrlParams";
import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";

interface SortDropdownBlockProps {
  isActive: boolean | string;
  order: "ASC" | "DESC" | "priority";
  currentYear: string | null | undefined;
  updateFilters: (
    newFilters: Partial<ProductFilters>,
    basePath?: string,
    screen?: string,
    outRedirect?: boolean,
    ifWithoutDebounce?: boolean,
    navigateOptions?: UpdateFiltersNavigateOptions,
  ) => void;
  setOrder: (value: "ASC" | "DESC" | "priority") => void;
}

export const SortDropdownBlock = ({
  isActive,
  order,
  currentYear,
  updateFilters,
  setOrder,
}: SortDropdownBlockProps) => {
  const { getLabel } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  const isVisible = isActive || isOpen;

  // ─── Close on scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as unknown as Node;
      if (isOpen && !sortDropdownRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
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

  const handleOptionSelect = useCallback(
    (value: "ASC" | "DESC" | "priority") => {
      setOrder(value);
      setIsOpen(false);
      updateFilters({ order: value, year: currentYear ?? "" }, "/products", "desktop", false, true);
    },
    [currentYear, setOrder, updateFilters],
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      ref={sortDropdownRef as RefObject<View>}
      onClick={handleDropdownClick}
      className="relative h-full cursor-pointer rounded-[6px] border border-color-border-default p-2 base:w-auto gtsm:w-auto"
    >
      <SmallPriceDropdown
        label={getLabel("searchresult_sortby_filter")}
        selectedValue={order}
        value={(() => {
          if (order === "ASC" || order === "DESC" || order === "priority")
            return getLabel("searchresult_sortby_filter");
        })()}
        placeholder="Select Sort"
        property={isOpen ? "open" : "inactive"}
        direction="horizontal"
        isDisabled={!isVisible}
      />

      {isOpen && (
        <OGDropdownTray
          headerLabel={getLabel("searchresult_sortby_filter")}
          hasHeader={true}
          hasFooter={false}
          hasResetButton={false}
          showTitleCloseIcon={false}
          showTopDivider={true}
          modalCloseHandler={() => setIsOpen(false)}
          filterName="sorting"
        >
          {/* Options list */}
          <Box className="flex w-full flex-col gap-space-xs">
            {(
              [
                { value: "priority", label: getLabel("sort_availability") },
                { value: "ASC", label: getLabel("sort_low_high") },
                { value: "DESC", label: getLabel("sort_high_low") },
              ] as { value: "ASC" | "DESC" | "priority"; label: string }[]
            ).map((option) => (
              <OGBrandOption
                key={option.value}
                className="p-space-sm"
                isActive={order === option.value}
                labeltextClass="text-color-text-default"
                hasLabel={true}
                text={option.label}
                onClick={() => handleOptionSelect(option.value)}
                buttonBG={
                  order === option.value
                    ? "bg-color-background-emphasis"
                    : "bg-color-background-default"
                }
              />
            ))}
          </Box>
        </OGDropdownTray>
      )}
    </Box>
  );
};
