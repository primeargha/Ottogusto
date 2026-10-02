import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Box } from "@/components/ui/box";
import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { useBranding } from "@/contexts/BrandingContext";
import BrandsDropdown from "./BrandsDropdown";
import Typography from "@/components/og-components/Typography";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";
import { SearchIcon } from "lucide-react-native";
import { OGSearchInput } from "@/components/og-components/SearchInputHeader/OGSearchInput";
import CrossIcon from "../productdetails/CrossIcon";

type Manufacturer = {
  id: string;
  name: string;
  type: string;
  image?: string;
};
type ManufacturerWithCount = Manufacturer & {
  count?: number;
};

interface BrandsDropdownBlockProps {
  dropdownBrands: ManufacturerWithCount[] | undefined;
  selectedManufacturerIds: string[];
  selectedManufacturerIdsRef: React.MutableRefObject<string[]>;
  brandsCountLabel: string;
  isBrandsActive: boolean | string;
  currentYear: string | null | undefined;
  updateFilters: (
    filters: {
      manufacturerIds: string[] | null;
      year: string;
    },
    path: string,
    device: string,
    arg1: boolean,
    arg2: boolean,
  ) => void;
}

export const BrandsDropdownBlock = ({
  dropdownBrands,
  selectedManufacturerIds,
  selectedManufacturerIdsRef,
  brandsCountLabel,
  isBrandsActive,
  currentYear,
  updateFilters,
}: BrandsDropdownBlockProps) => {
  const { getLabel } = useBranding();
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [pendingManufacturerIds, setPendingManufacturerIds] = useState<string[]>([]);
  const [brandSearchText, setBrandSearchText] = useState("");
  const brandsDropdownRef = useRef<HTMLDivElement | null>(null);
  const isInputFocusedRef = useRef(false); // ← add this
  const isBrandsVisible = isBrandsActive || isBrandsOpen;

  const filteredBrands = dropdownBrands?.filter((item: ManufacturerWithCount) =>
    item.name.toLowerCase().includes(brandSearchText.toLowerCase()),
  );

  const compareByCountThenName = (a: ManufacturerWithCount, b: ManufacturerWithCount) => {
    const ac = a.count ?? 0;
    const bc = b.count ?? 0;
    if (bc !== ac) return bc - ac;
    const nameCmp = a.name.localeCompare(b.name);
    if (nameCmp !== 0) return nameCmp;
    return String(a.id).localeCompare(String(b.id));
  };

  // Landing (no pending ticks): keep count-based order from products.tsx dropdownBrands.
  // While selecting: pin pending choices to top, then count order for the rest.
  const displayBrands =
    pendingManufacturerIds.length === 0
      ? filteredBrands
      : [...(filteredBrands ?? [])].sort((a, b) => {
          const aSelected = pendingManufacturerIds.includes(a.id);
          const bSelected = pendingManufacturerIds.includes(b.id);

          if (aSelected !== bSelected) {
            return aSelected ? -1 : 1;
          }

          if (aSelected && bSelected) {
            return pendingManufacturerIds.indexOf(a.id) - pendingManufacturerIds.indexOf(b.id);
          }

          return compareByCountThenName(a, b);
        });

  // ─── Track input focus (scoped to portal panel) ───────────────────────────
  useEffect(() => {
    if (!isBrandsOpen) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        target.closest("[data-dropdown-panel]")
      ) {
        isInputFocusedRef.current = true;
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        target.closest("[data-dropdown-panel]")
      ) {
        // Delay — on Android focusout fires before keyboard-dismiss scroll settles
        setTimeout(() => {
          isInputFocusedRef.current = false;
        }, 300);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [isBrandsOpen]);

  // ─── Close on scroll (guarded by input focus) ─────────────────────────────
  useEffect(() => {
    function isInputInsidePanelFocused() {
      if (isInputFocusedRef.current) return true;
      // Fallback: DOM truth for the race where focusin hasn't fired yet
      // but the keyboard scroll has already started
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      const tag = active.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && !active.isContentEditable) return false;
      return !!active.closest("[data-dropdown-panel]");
    }

    function handleScroll() {
      if (isBrandsOpen && !isInputInsidePanelFocused()) {
        setBrandSearchText("");
        setIsBrandsOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBrandsOpen]);

  useEffect(() => {
    if (isBrandsOpen) {
      setPendingManufacturerIds(selectedManufacturerIdsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrandsOpen]);

  // NOTE: A previous `handlePointerDownOutside` mousedown listener was removed.
  // Despite its name it actually closed the dropdown when the click happened
  // INSIDE the trigger (its target check was inverted). That meant a tap on
  // the label fired both this listener (setIsBrandsOpen(false) via mousedown)
  // AND the trigger's onClick (setIsBrandsOpen(prev => !prev) via click) on
  // the same gesture. With React 18 auto-batching, the functional updater
  // read the just-queued `false` and flipped it back to `true`, producing the
  // visible close-then-reopen flicker. The trigger's onClick already toggles,
  // and `handleClickOutside` below already handles real outside-clicks, so
  // this effect was redundant.

  const clearBrandSearch = useCallback(() => {
    setBrandSearchText("");
  }, []);

  const handleBrandsDropdownClick = () => {
    setIsBrandsOpen((prev) => !prev);
  };

  const toggleManufacturerById = useCallback((id: string) => {
    setPendingManufacturerIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as unknown as Node;
      if (isBrandsOpen && !brandsDropdownRef.current?.contains(target)) {
        setIsBrandsOpen(false);
      }
    };
    if (isBrandsOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isBrandsOpen]);

  const resetManufacturers = useCallback(() => {
    setPendingManufacturerIds([]);
    selectedManufacturerIdsRef.current = [];
    updateFilters(
      {
        manufacturerIds: null,
        year: currentYear ?? "",
      },
      "/products",
      "desktop",
      false,
      true,
    );
    // Clears URL + pending (like Show all); tray stays open so user can pick again or Save/Close.
  }, [currentYear, selectedManufacturerIdsRef, updateFilters]);

  const saveManufacturers = useCallback(() => {
    const currentSorted = [...selectedManufacturerIds].sort();
    const pendingSorted = [...pendingManufacturerIds].sort();
    const hasChanged =
      currentSorted.length !== pendingSorted.length ||
      currentSorted.some((id, idx) => id !== pendingSorted[idx]);

    if (!hasChanged) {
      setBrandSearchText("");
      setIsBrandsOpen(false);
      return;
    }

    updateFilters(
      {
        manufacturerIds: pendingManufacturerIds.length > 0 ? pendingManufacturerIds : null,
        year: currentYear ?? "",
      },
      "/products",
      "desktop",
      false,
      true,
    );

    setBrandSearchText("");
    setIsBrandsOpen(false);
  }, [currentYear, pendingManufacturerIds, selectedManufacturerIds, updateFilters]);

  return (
    <Box
      ref={brandsDropdownRef as RefObject<View & HTMLDivElement>}
      onClick={handleBrandsDropdownClick}
      className={`relative h-full cursor-pointer rounded-[6px] border border-color-border-default p-2 gtsm:w-auto gtlg:w-auto ${isBrandsOpen ? "z-[60] overflow-visible" : ""}`}
    >
      <BrandsDropdown
        label={brandsCountLabel}
        value=""
        placeholder={brandsCountLabel}
        property={isBrandsOpen ? "open" : "inactive"}
        direction="horizontal"
        isDisabled={!isBrandsVisible}
        // onDropdownClick={handleBrandsDropdownClick}
      />
      {/*  */}
      {isBrandsOpen && (
        <OGDropdownTray
          headerLabel={getLabel("Brands")}
          hasHeader={true}
          hasFooter={true}
          hasResetButton={true}
          showTitleCloseIcon={true}
          showTopDivider={true}
          showBottomBorder={true}
          hasPendingSelection={pendingManufacturerIds.length > 0}
          modalCloseHandler={() => {
            setBrandSearchText("");
            setIsBrandsOpen(false);
          }}
          resetHandler={resetManufacturers}
          saveHandler={saveManufacturers}
          hasFooterResetButton={pendingManufacturerIds.length > 0 ? true : false}
          hasFooterSaveButton={true}
          filterName="brands"
        >
          {/* Search input */}

          <OGSearchInput
            value={brandSearchText}
            onChange={setBrandSearchText}
            placeholder={getLabel("PART_BRAND_MANUFACTURER_PLACEHOLDER") ?? "Search brands..."}
            //   autoFocus
            iconPosition="right"
            className="bg-color-header-searchbar-bg gtsm:shrink-0"
            {...(brandSearchText.length > 0 ? { onIconClick: clearBrandSearch } : {})}
            icon={
              brandSearchText?.length > 0 ? (
                <CrossIcon className="pointer-events-none text-color-icon-default" width={15} />
              ) : (
                <SearchIcon className="h-4 w-4 text-color-icon-default" />
              )
            }
          />

          {/* Brand list */}
          <Box className="overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 base:max-h-[350px] base:gap-space-2xs gtsm:max-h-none gtsm:min-h-0 gtsm:flex-1">
            {displayBrands?.map((item: ManufacturerWithCount) => (
              <OGBrandOption
                key={item.id}
                className=""
                isActive={pendingManufacturerIds.includes(item.id)}
                labeltextClass="text-color-text-default"
                hasLabel={true}
                text={
                  typeof item.count === "number" && item.count > 0
                    ? `${item.name} (${item.count})`
                    : item.name
                }
                onClick={() => toggleManufacturerById(item.id)}
                buttonBG={
                  pendingManufacturerIds.includes(item.id)
                    ? "bg-color-background-emphasis"
                    : "bg-color-background-default"
                }
              />
            ))}
            {filteredBrands?.length === 0 && (
              <Box className="px-3 py-4 text-center">
                <Typography className="text-color-text-default opacity-50 typography-body-02">
                  {getLabel("filter_search_no_match") ?? "No brands found"}
                </Typography>
              </Box>
            )}
          </Box>
        </OGDropdownTray>
      )}
    </Box>
  );
};
