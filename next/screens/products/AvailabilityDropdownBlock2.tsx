import { Box } from "@/components/ui/box";

import { memo, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { DEFAULT_AVAILABILITY_FILTER_KEYS } from "@/constants";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAvailabilityUrlIntentStore } from "@/stores/useAvailabilityUrlIntentStore";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useBranding } from "@/contexts/BrandingContext";
import BrandsDropdown from "./BrandsDropdown";
import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { OGButton } from "@/components/og-components/OGButton";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";

type AvailabilityOption = { key: string; value: string };

interface AvailabilityProps {
  options?: AvailabilityOption[];
  title?: string;
  state?: "expanded" | "collapsed";
  onChange?: (selected: AvailabilityOption[]) => void;
}

const DEFAULT_OPTIONS: AvailabilityOption[] = DEFAULT_AVAILABILITY_FILTER_KEYS.map((key) => ({
  key,
  value: key,
}));

function normalizeAvailabilityKeys(raw: string | null): string {
  if (!raw?.trim()) return "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

function selectionFromUrlParam(
  raw: string | null,
  hasAvailabilityParam: boolean,
  absentMeansNull: boolean,
  optionList: AvailabilityOption[],
): AvailabilityOption[] {
  if (!hasAvailabilityParam && absentMeansNull) return [];
  if (hasAvailabilityParam && raw?.trim() === "") return [];
  // For this dropdown: if param is missing, treat as "no selection" (not "all selected").
  if (!hasAvailabilityParam) return [];
  if (!raw?.trim()) return [];
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const picked = optionList.filter((o) => keys.includes(o.key));
  return picked.length > 0 ? picked : [...optionList];
}

function toAvailabilityPayload(selected: AvailabilityOption[]): string[] | null {
  if (selected.length === 0) return null;
  return selected.map((o) => o.key);
}

const OGAvailabilityBlock = memo((props: AvailabilityProps) => {
  const { options = DEFAULT_OPTIONS, title, state = "collapsed", onChange } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<AvailabilityOption[]>(() => []);
  const [pendingSelectedOptions, setPendingSelectedOptions] = useState<AvailabilityOption[]>(
    () => [],
  );

  const { updateFilters } = useUrlParams();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialUrlSyncDoneRef = useRef(false);
  const { getLabel } = useBranding();
  const availabilityDropdownRef = useRef<HTMLDivElement | null>(null);

  // ─── Initial URL sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (initialUrlSyncDoneRef.current) return;
    initialUrlSyncDoneRef.current = true;

    useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(false);

    const hasAvail = searchParams?.has("availability") ?? false;
    const raw = searchParams?.get("availability") ?? null;
    const nextSelected = selectionFromUrlParam(raw, hasAvail, false, options);
    setSelectedOptions(nextSelected);
    setPendingSelectedOptions(nextSelected);

    const payload = toAvailabilityPayload(nextSelected);
    const urlNorm = !hasAvail ? "" : raw?.trim() === "" ? "" : normalizeAvailabilityKeys(raw);
    const payloadNorm = payload?.length ? [...payload].sort().join(",") : "";

    if (urlNorm !== payloadNorm) {
      updateFilters({ availability: payload }, "/products", "desktop", false, true);
    }
  }, [options, searchParams, updateFilters]);

  // ─── Close on scroll (desktop only) ───────────────────────────────────────
  // On mobile the tray is a portaled bottom sheet. Swiping the sheet (or
  // overscrolling a short options list) can chain-scroll the page behind and
  // fire `window` scroll — that must NOT dismiss the filter.
  useEffect(() => {
    if (!isExpanded) return;

    const isMobileViewport = () => window.matchMedia("(max-width: 639.98px)").matches;

    function handleScroll() {
      if (isMobileViewport()) return;
      setIsExpanded(false);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded]);

  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!isExpanded || !target) return;
      // Trigger chip
      if (availabilityDropdownRef.current?.contains(target)) return;
      // Mobile tray is portaled to <body> — treat it as inside
      if (target.closest("[data-dropdown-panel]")) return;
      setIsExpanded(false);
    };
    if (isExpanded) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleBrandsDropdownClick = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCheckboxChange = (checked: boolean, option: AvailabilityOption) => {
    setPendingSelectedOptions((prev) =>
      checked ? [...prev, option] : prev.filter((item) => item.key !== option.key),
    );
  };

  const resetAvailability = useCallback(() => {
    setPendingSelectedOptions([]); // clears selections, does NOT close modal
  }, []);

  const saveAvailability = useCallback(() => {
    setSelectedOptions(pendingSelectedOptions);
    onChange?.(pendingSelectedOptions);

    const payload = toAvailabilityPayload(pendingSelectedOptions);

    if (pendingSelectedOptions.length === 0) {
      useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(true);
    } else {
      useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(false);
    }

    queryClient.removeQueries({ queryKey: queryKeys.products.partsPrefix() });
    updateFilters({ availability: payload }, "/products");
    setIsExpanded(false);
  }, [onChange, pendingSelectedOptions, queryClient, updateFilters]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      onClick={handleBrandsDropdownClick}
      ref={availabilityDropdownRef as RefObject<View & HTMLDivElement>}
      className={`relative h-full cursor-pointer rounded-[6px] border border-color-border-default p-2 gtsm:w-full gtsm:max-w-[145px] gtlg:w-auto ${isExpanded ? "z-[60] overflow-visible" : ""}`}
    >
      <BrandsDropdown
        label={getLabel("sort_availability")}
        value=""
        placeholder={getLabel("sort_availability")}
        property={isExpanded ? "open" : "inactive"}
        direction="horizontal"
        isDisabled={false}
      />

      {isExpanded && (
        <OGDropdownTray
          headerLabel={getLabel("sort_availability")}
          hasHeader={true}
          hasFooter={true}
          hasResetButton={true}
          showTitleCloseIcon={true}
          showTopDivider={true}
          showBottomBorder={true}
          hasPendingSelection={pendingSelectedOptions.length > 0}
          modalCloseHandler={() => setIsExpanded(false)}
          resetHandler={resetAvailability}
          saveHandler={saveAvailability}
          hasFooterResetButton={pendingSelectedOptions.length > 0 ? true : false}
          hasFooterSaveButton={true}
          filterName="availability"
        >
          {/* Options list */}
          <Box className="flex w-full flex-col gap-space-xs">
            {options.map((option) => (
              <OGBrandOption
                key={option.key}
                className=""
                isActive={pendingSelectedOptions.some((s) => s.key === option.key)}
                labeltextClass="text-color-text-default"
                hasLabel={true}
                text={getLabel(option.value)}
                onClick={() =>
                  handleCheckboxChange(
                    !pendingSelectedOptions.some((s) => s.key === option.key),
                    option,
                  )
                }
                buttonBG={
                  pendingSelectedOptions.some((s) => s.key === option.key)
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
});

OGAvailabilityBlock.displayName = "OGAvailabilityBlock";

export default OGAvailabilityBlock;
