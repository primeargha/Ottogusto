import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import BrandsDropdown from "./BrandsDropdown";
import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";

const TYPE_OPTIONS = [
  { value: "OEM", labelKey: "product_tag_oem" },
  { value: "OES", labelKey: "product_tag_oes" },
  { value: "AMS", labelKey: "product_tag_ams" },
] as const;

type TypeValue = "OEM" | "OES" | "AMS";

const TypeDropdown = ({ isActive, type, currentYear, updateFilters, setType }) => {
  const { getLabel } = useBranding();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingSelected, setPendingSelected] = useState<TypeValue[]>([]);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);

  const hasSelection = pendingSelected.length > 0;

  // ─── Close on scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleScroll() {
      if (isExpanded) setIsExpanded(false);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded]);

  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!isExpanded || !target) return;
      if (typeDropdownRef.current?.contains(target)) return;
      if (target.closest("[data-dropdown-panel]")) return;
      setIsExpanded(false);
    };
    if (isExpanded) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOptionSelect = useCallback((value: TypeValue) => {
    setPendingSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const handleReset = useCallback(() => {
    setPendingSelected([]); // clears selections, does NOT close modal
  }, []);

  const handleSave = useCallback(() => {
    const payload = pendingSelected;
    updateFilters(
      { manufacturerTypes: payload, year: currentYear ?? "" },
      "/products",
      "desktop",
      false,
      true,
    );
    setIsExpanded(false);
  }, [currentYear, pendingSelected, updateFilters]);

  const handleShowAll = useCallback(() => {
    setPendingSelected([]);
    updateFilters(
      { manufacturerTypes: "", year: currentYear ?? "" },
      "/products",
      "desktop",
      false,
      true,
    );
    setIsExpanded(false);
  }, [currentYear, updateFilters]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      ref={typeDropdownRef as RefObject<View & HTMLDivElement>}
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`relative h-full cursor-pointer rounded-[6px] border border-color-border-default p-2 gtsm:w-auto gtlg:w-auto ${isExpanded ? "z-[60] overflow-visible" : ""}`}
    >
      <BrandsDropdown
        label={getLabel("sort_type")}
        value=""
        placeholder={getLabel("sort_type")}
        property={isExpanded ? "open" : "inactive"}
        direction="horizontal"
        isDisabled={false}
      />

      {isExpanded && (
        <OGDropdownTray
          headerLabel={getLabel("sort_type")}
          hasHeader={true}
          hasFooter={true}
          hasResetButton={true}
          showTitleCloseIcon={true}
          showTopDivider={true}
          showBottomBorder={true}
          hasPendingSelection={hasSelection}
          modalCloseHandler={handleShowAll}
          resetHandler={handleReset}
          saveHandler={handleSave}
          hasFooterResetButton={hasSelection ? true : false}
          hasFooterSaveButton={true}
          filterName="type"
          // handleShowAll={handleShowAll}
        >
          {/* Options list */}
          <Box className="flex w-full flex-col gap-space-xs">
            {TYPE_OPTIONS.map((option) => (
              <OGBrandOption
                key={option.value}
                className="p-space-sm"
                isActive={pendingSelected.includes(option.value)}
                labeltextClass="text-color-text-default"
                hasLabel={true}
                text={getLabel(option.labelKey)}
                onClick={() => handleOptionSelect(option.value)}
                buttonBG={
                  pendingSelected.includes(option.value)
                    ? "bg-color-background-emphasis"
                    : "bg-color-background-default"
                }
              />
            ))}
          </Box>

          {/* Show All button — only when no selection, replaces the tray footer */}
          {/* {!hasSelection && (
            <Box className="flex w-full flex-col gap-[10px]">
              <Box className="h-[1px] w-full border-t border-color-border-default" />
              <OGButton
                type="outlined"
                size="small"
                className="w-full py-[10px]"
                onClick={handleShowAll}
              >
                {getLabel("filter_show_all_products")}
              </OGButton>
            </Box>
          )} */}
        </OGDropdownTray>
      )}
    </Box>
  );
};

export default TypeDropdown;
