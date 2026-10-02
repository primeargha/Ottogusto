"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import Typography from "@/components/og-components/Typography";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { useCarsFiltersMutation } from "@/hooks/cars";
import { useCarsInitialMakesStore } from "@/stores/useCarsInitialMakesStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getCarById } from "@/services/cars";
import type { CarsFiltersResponse } from "@/services/cars";
import type {
  NewMmeOption,
  NewMmeOptionsState,
  NewMmeSelectedState,
} from "@/stores/useNewMmeStore";
import {
  FIELD_CONFIG,
  FIELD_ORDER,
  VisibleField,
  buildPayload,
  clearDependentFields,
  emptyMmeSearchText,
  getNewMmeDropdownLabelClass,
  getVisibleMmeFields,
  isMmeFieldEnabled,
  isNewMmeApplyCtaEnabled,
  optionsForField,
  optionsFromCarsFiltersResponse,
  reconcileSelected,
} from "@/lib/newMmeFilters";
import { mergeCarByIdResponsesForNewMmePrefill } from "@/utils/mergeCarByIdResponsesForNewMmePrefill";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import RightIconCategoryAccordion from "@/components/og-components/OGCategoriesSearcBlock/RightIconCategoryAccordion";
import { useFilterModalStore } from "@/stores/useFilterModal";

const emptySelected: NewMmeSelectedState = {
  make: null,
  model: null,
  variant: null,
  body: null,
  engine: null,
  gearBox: null,
  engineCode: null,
  gearBoxCode: null,
};

const emptyOptions: NewMmeOptionsState = {
  makes: [],
  models: [],
  variants: [],
  bodys: [],
  engines: [],
  gearBoxes: [],
  engineCodes: [],
  gearBoxCodes: [],
};

const emptySearchText = emptyMmeSearchText();

/** Reset dropdown UI when URL has no `carIds` (e.g. after OE-ref search clears the param). */
function resetLocalVehicleSelection(
  setSelected: React.Dispatch<React.SetStateAction<NewMmeSelectedState>>,
  setCarIds: React.Dispatch<React.SetStateAction<string[]>>,
  setHasCarIdsProperty: React.Dispatch<React.SetStateAction<boolean>>,
  setOpenDropdown: React.Dispatch<React.SetStateAction<VisibleField | null>>,
  setSearchText: React.Dispatch<React.SetStateAction<Record<VisibleField, string>>>,
) {
  setSelected(emptySelected);
  setCarIds([]);
  setHasCarIdsProperty(false);
  setOpenDropdown(null);
  setSearchText(emptySearchText);
}

export default function SearchResultsNewMmeSidebar() {
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const params = useParams();
  const searchParams = useSearchParams();
  const searchdataRaw = params?.["searchdata"];
  const searchdataSegment = Array.isArray(searchdataRaw) ? searchdataRaw[0] : searchdataRaw;
  const listingBase = `/${searchdataSegment ?? "search-results"}`;

  const isFeatureEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const carIdList = useMemo(
    () => parseCarIdsParam(searchParams?.get("carIds") ?? null),
    [searchParams],
  );

  const [selected, setSelected] = useState<NewMmeSelectedState>(emptySelected);
  const [options, setOptions] = useState<NewMmeOptionsState>(emptyOptions);
  const [carIds, setCarIds] = useState<string[]>([]);
  const [hasCarIdsProperty, setHasCarIdsProperty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<VisibleField | null>(null);
  const [searchText, setSearchText] = useState<Record<VisibleField, string>>(emptyMmeSearchText());
  const [isExpanded, setIsExpanded] = useState(true);
  /** False until the user changes a filter after load/apply; controls Find car parts enablement. */
  const [findCarPartsDirty, setFindCarPartsDirty] = useState(false);
  const rightIconRef = useRef<any>(null);

  const { mutateAsync: fetchCarsFilters } = useCarsFiltersMutation();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const getLabelText = useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  const initKey = carIdList.join(",");
  const urlHasCarIds = initKey !== "";
  const oeReferenceKey = searchParams?.get("oeReference")?.trim() ?? "";

  const applyResponseOptionsAndCarIds = useCallback(
    (response: CarsFiltersResponse, options?: { persistCarIdsWithoutResponse?: boolean }) => {
      setOptions(optionsFromCarsFiltersResponse(response));
      setCarIds((prev) => {
        if (Array.isArray(response.carIds)) return response.carIds;
        return options?.persistCarIdsWithoutResponse ? prev : [];
      });
      setHasCarIdsProperty(Object.prototype.hasOwnProperty.call(response, "carIds"));
    },
    [],
  );

  const runFilters = useCallback(
    async (
      selectedInput: NewMmeSelectedState,
      preserveCandidates?: Partial<NewMmeSelectedState>,
    ) => {
      let workingSelected = { ...selectedInput };
      let workingOptions = optionsRef.current;

      for (let i = 0; i < FIELD_ORDER.length; i++) {
        const response = await fetchCarsFilters(buildPayload(workingSelected, workingOptions));
        const responseData = response.data;

        workingOptions = optionsFromCarsFiltersResponse(responseData);

        applyResponseOptionsAndCarIds(responseData, {
          persistCarIdsWithoutResponse: urlHasCarIds,
        });
        const nextSelected = reconcileSelected(workingSelected, responseData, preserveCandidates);
        setSelected(nextSelected);

        if (JSON.stringify(nextSelected) === JSON.stringify(workingSelected)) {
          break;
        }

        workingSelected = nextSelected;
      }
    },
    [applyResponseOptionsAndCarIds, fetchCarsFilters, urlHasCarIds],
  );

  const runFiltersRef = useRef(runFilters);
  runFiltersRef.current = runFilters;

  const carsBatchQuery = useQuery({
    queryKey: ["cars", "prefill-batch", initKey] as const,
    queryFn: async () => {
      const results = await Promise.all(carIdList.map((id) => getCarById(id)));
      return results.map((r) => r.data);
    },
    enabled: isFeatureEnabled && carIdList.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const allSuccess = carsBatchQuery.isSuccess && Boolean(carsBatchQuery.data?.length);
  const carsData = carsBatchQuery.data ?? null;
  const anyError = carsBatchQuery.isError;

  /** URL has carIds: batch GET in flight before bootstrap — disable all fields + CTA. */
  const loadingCarDetails = useMemo(
    () =>
      carIdList.length > 0 && (carsBatchQuery.isPending || carsBatchQuery.isLoading) && !anyError,
    [carIdList.length, carsBatchQuery.isPending, carsBatchQuery.isLoading, anyError],
  );

  const getLabelRef = useRef(getLabel);
  getLabelRef.current = getLabel;

  useEffect(() => {
    if (!isFeatureEnabled) {
      setSelected(emptySelected);
      setOptions(emptyOptions);
      setCarIds([]);
      setHasCarIdsProperty(false);
      setError(null);
      setFindCarPartsDirty(false);
    }
  }, [isFeatureEnabled]);

  useEffect(() => {
    setFindCarPartsDirty(false);
  }, [initKey]);

  /** No URL carIds: single POST /Cars (empty payload) on load. Deps avoid BrandingContext getLabel churn. */
  useEffect(() => {
    if (!isFeatureEnabled) return;
    if (initKey !== "") return;

    let cancelled = false;
    const runEmptyBootstrap = async () => {
      resetLocalVehicleSelection(
        setSelected,
        setCarIds,
        setHasCarIdsProperty,
        setOpenDropdown,
        setSearchText,
      );
      setError(null);
      setIsLoading(true);
      try {
        const responseData = await useCarsInitialMakesStore.getState().ensureInitialMakes();
        if (cancelled) return;
        applyResponseOptionsAndCarIds(responseData, { persistCarIdsWithoutResponse: false });
        setSelected(reconcileSelected(emptySelected, responseData));
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load car filters");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void runEmptyBootstrap();
    return () => {
      cancelled = true;
    };
  }, [applyResponseOptionsAndCarIds, initKey, isFeatureEnabled, oeReferenceKey]);

  /** URL has carIds: GET by id batch, then POST /Cars (merge or empty). */
  useEffect(() => {
    if (!isFeatureEnabled) return;
    if (initKey === "") return;

    if (anyError) {
      const gl = getLabelRef.current("error_loading_car_filters");
      setError(gl && gl !== "error_loading_car_filters" ? gl : "Could not load vehicle details");
      return;
    }

    if (!allSuccess || !carsData) {
      return;
    }

    let cancelled = false;

    const bootstrapFromCars = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const mergedSelected = mergeCarByIdResponsesForNewMmePrefill(carsData);
        if (cancelled) return;

        const hasAnyMergedKey = Object.values(mergedSelected).some((v) => v != null);
        if (hasAnyMergedKey) {
          await runFiltersRef.current(mergedSelected);
        } else {
          const responseData = await useCarsInitialMakesStore.getState().ensureInitialMakes();
          if (cancelled) return;
          applyResponseOptionsAndCarIds(responseData, { persistCarIdsWithoutResponse: true });
          setSelected(reconcileSelected(emptySelected, responseData));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load car filters");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapFromCars();
    return () => {
      cancelled = true;
    };
  }, [allSuccess, anyError, applyResponseOptionsAndCarIds, carsData, initKey, isFeatureEnabled]);

  const visibleFields: VisibleField[] = useMemo(
    () => getVisibleMmeFields(selected, options),
    [options, selected],
  );

  const canApplyCarSearch = useMemo(
    () => isNewMmeApplyCtaEnabled(carIds, visibleFields, selected, options),
    [carIds, options, selected, visibleFields],
  );

  const handleSelect = async (field: VisibleField, value: string) => {
    setFindCarPartsDirty(true);
    const previousSelected = { ...selected };
    const nextSelected = clearDependentFields({ ...selected, [field]: value }, field);

    setSelected(nextSelected);
    setOpenDropdown(null);
    setIsLoading(true);
    setError(null);

    try {
      await runFilters(nextSelected, previousSelected);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load car filters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCarIds = () => {
    if (!canApplyCarSearch) return;
    setFindCarPartsDirty(false);
    updateFilters(
      { carIds } as Parameters<typeof updateFilters>[0],
      listingBase,
      "desktop",
      false,
      true,
      { appendAllowedTrackingQueryParams: true },
    );
    if (useFilterModalStore.getState().isOpen) {
      useFilterModalStore.getState().closeModal();
    }
  };

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      rightIconRef.current?.setExpandedState?.(next);
      return next;
    });
  }, []);

  const dropdownOptions = useCallback(
    (field: VisibleField): NewMmeOption[] => {
      return optionsForField(field, options).filter((option) =>
        option.value.toLowerCase().includes((searchText[field] || "").toLowerCase()),
      );
    },
    [options, searchText],
  );

  const isFieldDisabled = useCallback(
    (field: VisibleField): boolean => {
      if (isLoading || loadingCarDetails) return true;
      return !isMmeFieldEnabled(field, visibleFields, selected);
    },
    [isLoading, loadingCarDetails, selected, visibleFields],
  );

  if (!isFeatureEnabled) {
    return null;
  }

  return (
    <Box className="flex w-full flex-col">
      <Box
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        //@ts-ignore
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleExpand();
          }
        }}
        className="flex w-full cursor-pointer flex-row items-center justify-between"
      >
        <Typography className="text-color-text-emphasis typography-heading-03">
          {getLabelText("new_mme_section_title", "NEW MME")}
        </Typography>
        <RightIconCategoryAccordion
          ref={rightIconRef}
          defaultExpanded={isExpanded}
          onPress={toggleExpand}
        />
      </Box>
      {/* {isExpanded && (
        <Typography className="mt-1 text-xs text-color-text-body">
          {getLabelText(
            "identify_your_vehicle_subtitle",
            "Select your vehicle to view compatible products",
          )}
        </Typography>
      )} */}

      {isExpanded && (
        <Box className="mt-3 flex flex-col gap-2">
          {visibleFields.map((field, index) => {
            const config = FIELD_CONFIG[field];
            const selectedValue = selected[field];
            const selectedOption = optionsForField(field, options).find(
              (opt) => opt.key === selectedValue,
            );
            const disabled = isFieldDisabled(field);
            const filteredOptions = dropdownOptions(field);
            const hasSelection = Boolean(selectedValue && selectedOption);

            return (
              <div key={field} className="relative">
                <button
                  type="button"
                  disabled={disabled}
                  className={`flex w-full items-center justify-between rounded border px-2 py-2 text-left ${
                    index === 0 ? "border-color-border-focus" : "border-color-background-emphasis"
                  } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} bg-color-background-default`}
                  onClick={() => setOpenDropdown((prev) => (prev === field ? null : field))}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                        selectedValue
                          ? "bg-color-border-focus text-white"
                          : "bg-color-background-l6 text-color-text-body"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={getNewMmeDropdownLabelClass(hasSelection, "xs")}>
                      {selectedOption?.value ||
                        getLabelText(config.placeholderKey, config.fallbackPlaceholder)}
                    </span>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 text-color-text-body transition-transform duration-200 ${
                      openDropdown === field ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openDropdown === field && !disabled && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded border border-color-background-emphasis bg-[#dee4e2]">
                      <div className="sticky top-0 border-b border-color-background-emphasis bg-[#dee4e2] p-2">
                        <input
                          value={searchText[field] || ""}
                          onChange={(e) =>
                            setSearchText((prev) => ({ ...prev, [field]: e.target.value }))
                          }
                          placeholder={getLabelText(config.labelKey, config.fallbackLabel)}
                          className="w-full rounded border border-color-background-emphasis p-2 text-sm focus:outline-none focus:ring-1 focus:ring-color-border-focus"
                        />
                      </div>
                      {filteredOptions.length === 0 ? (
                        <Typography className="px-3 py-3 text-xs text-color-text-body">
                          {getLabelText("new_mme_no_data", "No data")}
                        </Typography>
                      ) : (
                        filteredOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            className="flex w-full items-center gap-2 border-b border-color-background-emphasis p-2 text-left text-sm last:border-b-0 hover:bg-[#e3e9e7]"
                            onClick={() => void handleSelect(field, option.key)}
                          >
                            {selected[field] === option.key ? (
                              <span className="text-color-border-focus">✓</span>
                            ) : (
                              <span className="inline-block w-3" />
                            )}
                            {option.value}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <OGButton
            type="primary"
            className="mt-2 w-full"
            disabled={!canApplyCarSearch || isLoading || loadingCarDetails || !findCarPartsDirty}
            onClick={handleApplyCarIds}
          >
            {isLoading || loadingCarDetails
              ? `${getLabelText("loading", "Loading")}...`
              : getLabelText("find_car_parts", "Find car parts")}
          </OGButton>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </Box>
      )}

      <Divider className="my-3" />
    </Box>
  );
}
