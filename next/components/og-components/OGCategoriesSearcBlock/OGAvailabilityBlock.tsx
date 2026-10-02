import { Box } from "@/components/ui/box";
import Typography from "../Typography";
import RightIconCategoryAccordion from "./RightIconCategoryAccordion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { OGCheckbox } from "../OGCheckbox";
import { DEFAULT_AVAILABILITY_FILTER_KEYS } from "@/constants";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAvailabilityUrlIntentStore } from "@/stores/useAvailabilityUrlIntentStore";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useBranding } from "@/contexts/BrandingContext";

type AvailabilityOption = { key: string; value: string };

interface AvailabilityProps {
  options?: AvailabilityOption[];
  title?: string;
  state?: "expanded" | "collapsed";
  onChange?: (selected: AvailabilityOption[]) => void;
}

const AVAILABILITY_OPTION_LABELS: Record<
  (typeof DEFAULT_AVAILABILITY_FILTER_KEYS)[number],
  string
> = {
  InStock: "",
  BackOrder: "",
  OnRequest: "",
  EndofLife: "",
};

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
  if (!hasAvailabilityParam && absentMeansNull) {
    return [];
  }
  if (hasAvailabilityParam && raw?.trim() === "") {
    return [];
  }
  if (!hasAvailabilityParam || !raw?.trim()) {
    return [...optionList];
  }
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
  const [isExpanded, setIsExpanded] = useState(state === "expanded");
  const [selectedOptions, setSelectedOptions] = useState<AvailabilityOption[]>(() => [...options]);
  const { updateFilters } = useUrlParams();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const RightIconRef = useRef<any>(null);
  const initialUrlSyncDoneRef = useRef(false);
  const { getLabel, getLocale } = useBranding();
  useEffect(() => {
    if (initialUrlSyncDoneRef.current) return;
    initialUrlSyncDoneRef.current = true;

    useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(false);

    const hasAvail = searchParams?.has("availability") ?? false;
    const raw = searchParams?.get("availability") ?? null;
    const nextSelected = selectionFromUrlParam(raw, hasAvail, false, options);
    setSelectedOptions(nextSelected);

    const payload = toAvailabilityPayload(nextSelected);
    const urlNorm = !hasAvail ? "" : raw?.trim() === "" ? "" : normalizeAvailabilityKeys(raw);
    const payloadNorm = payload?.length ? [...payload].sort().join(",") : "";

    if (urlNorm !== payloadNorm) {
      updateFilters({ availability: payload }, "/products", "desktop", false, true);
    }
  }, [options, searchParams, updateFilters]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const newState = !prev;
      if (RightIconRef.current) {
        RightIconRef.current.setExpandedState(newState);
      }
      return newState;
    });
  }, []);

  const handleCheckboxChange = (checked: boolean, option: AvailabilityOption) => {
    let updated: AvailabilityOption[];

    if (checked) {
      updated = [...selectedOptions, option];
    } else {
      updated = selectedOptions.filter((item) => item.key !== option.key);
    }

    setSelectedOptions(updated);
    onChange?.(updated);

    const payload = toAvailabilityPayload(updated);
    if (updated.length === 0) {
      useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(true);
    } else {
      useAvailabilityUrlIntentStore.getState().setAbsentAvailabilityMeansNull(false);
    }
    queryClient.removeQueries({ queryKey: queryKeys.products.partsPrefix() });
    updateFilters({ availability: payload }, "/products");
  };

  return (
    <Box className="flex w-full flex-col">
      {/* Header */}
      <Box
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        //@ts-ignore
        onKeyDown={(e: any) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleExpand();
          }
        }}
        className="flex w-full cursor-pointer flex-row items-center justify-between"
      >
        <Typography className="text-color-text-emphasis typography-heading-03">{title}</Typography>

        <RightIconCategoryAccordion
          ref={RightIconRef}
          defaultExpanded={isExpanded}
          onPress={toggleExpand}
        />
      </Box>

      {/* Options */}
      {isExpanded && (
        <Box className="mt-2 flex flex-col gap-2">
          {options.map((option) => (
            <OGCheckbox
              key={option.key}
              label={getLabel(option.value)}
              value={option}
              selected={selectedOptions.some((s) => s.key === option.key)}
              onChange={(checked: boolean) => handleCheckboxChange(checked, option)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

OGAvailabilityBlock.displayName = "OGAvailabilityBlock";

export default OGAvailabilityBlock;
