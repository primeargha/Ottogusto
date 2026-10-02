"use client";

import React from "react";
import { OGButton } from "@/components/og-components/OGButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranding } from "@/contexts/BrandingContext";
import { useCarsFiltersMutation } from "@/hooks/cars";
import { useCarsInitialMakesStore } from "@/stores/useCarsInitialMakesStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import {
  useNewMmeStore,
  type NewMmeOption,
  type NewMmeSelectedState,
} from "@/stores/useNewMmeStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import {
  FIELD_CONFIG,
  FIELD_ORDER,
  VisibleField,
  buildPayload,
  clearDependentFields,
  emptyMmeSearchText,
  emptyPayload,
  getNewMmeDropdownLabelClass,
  getVisibleMmeFields,
  isMmeFieldEnabled,
  isNewMmeApplyCtaEnabled,
  optionsForField,
  optionsFromCarsFiltersResponse,
  reconcileSelected,
} from "@/lib/newMmeFilters";

interface NewMmeSearchProps {
  className?: string;
}

export default function NewMmeSearch({ className = "" }: NewMmeSearchProps) {
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const {
    selected,
    options,
    carIds,
    isLoading,
    error,
    setLoading,
    setError,
    setSelected,
    reset,
    applyFiltersResponse,
  } = useNewMmeStore();

  const { mutateAsync: fetchCarsFilters } = useCarsFiltersMutation();
  const [openDropdown, setOpenDropdown] = React.useState<VisibleField | null>(null);
  const [searchText, setSearchText] =
    React.useState<Record<VisibleField, string>>(emptyMmeSearchText());

  const isFeatureEnabled = getClientFeatureFlag("new_mme_feature_flag");

  const getLabelText = React.useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  const runFilters = React.useCallback(
    async (
      selectedInput: NewMmeSelectedState,
      preserveCandidates?: Partial<NewMmeSelectedState>,
    ) => {
      let workingSelected = { ...selectedInput };
      let workingOptions = options;

      for (let i = 0; i < FIELD_ORDER.length; i++) {
        const response = await fetchCarsFilters(buildPayload(workingSelected, workingOptions));
        const responseData = response.data;

        workingOptions = optionsFromCarsFiltersResponse(responseData);
        applyFiltersResponse(responseData);
        const nextSelected = reconcileSelected(workingSelected, responseData, preserveCandidates);
        setSelected(nextSelected);

        if (JSON.stringify(nextSelected) === JSON.stringify(workingSelected)) {
          break;
        }

        workingSelected = nextSelected;
      }
    },
    [applyFiltersResponse, fetchCarsFilters, options, setSelected],
  );

  React.useEffect(() => {
    if (!isFeatureEnabled) return;
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      setError(null);
      reset();
      try {
        const responseData = await useCarsInitialMakesStore.getState().ensureInitialMakes();
        if (!mounted) return;
        applyFiltersResponse(responseData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load car filters");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    initialize();
    return () => {
      mounted = false;
    };
  }, [applyFiltersResponse, isFeatureEnabled, reset, setError, setLoading]);

  const handleSelect = async (field: VisibleField, value: string) => {
    const previousSelected = { ...selected };
    const nextSelected = clearDependentFields({ ...selected, [field]: value }, field);

    setSelected(nextSelected);
    setOpenDropdown(null);
    setLoading(true);
    setError(null);

    try {
      await runFilters(nextSelected, previousSelected);
    } catch (err: any) {
      setError(err?.message || "Failed to load car filters");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!canApplyCarSearch) return;
    updateFilters(
      {
        carIds,
      } as any,
      "/search-results",
      "desktop",
      false,
      true,
    );
  };

  const visibleFields: VisibleField[] = React.useMemo(
    () => getVisibleMmeFields(selected, options),
    [options, selected],
  );

  const canApplyCarSearch = React.useMemo(
    () => isNewMmeApplyCtaEnabled(carIds, visibleFields, selected, options),
    [carIds, options, selected, visibleFields],
  );

  const dropdownOptions = React.useCallback(
    (field: VisibleField): NewMmeOption[] => {
      return optionsForField(field, options).filter((option) =>
        option.value.toLowerCase().includes((searchText[field] || "").toLowerCase()),
      );
    },
    [options, searchText],
  );

  const isFieldDisabled = React.useCallback(
    (field: VisibleField): boolean => {
      if (isLoading) return true;
      return !isMmeFieldEnabled(field, visibleFields, selected);
    },
    [isLoading, selected, visibleFields],
  );

  if (!isFeatureEnabled) return null;

  return (
    <div className={`gap-content-to-footer section-standard ${className}`}>
      <div className="mx-auto w-full max-w-[420px] rounded-md border border-color-background-emphasis bg-color-background-default p-4">
        <h3 className="font-anton mb-3 text-2xl uppercase leading-6 text-color-text-emphasis">
          {getLabelText("new_mme_section_title", "NEW MME")}
        </h3>

        {isLoading && options.makes.length === 0 && (
          <div
            className="mb-3 flex flex-col gap-2"
            aria-busy="true"
            aria-label={getLabelText("loading", "Loading")}
          >
            <Skeleton className="h-10 w-full rounded-md border border-color-background-emphasis" />
            <Skeleton className="h-10 w-full rounded-md border border-color-background-emphasis" />
            <Skeleton className="h-10 w-full rounded-md border border-color-background-emphasis" />
          </div>
        )}

        <div className="space-y-2">
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
                  className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left ${
                    index === 0 ? "border-color-border-focus" : "border-color-background-emphasis"
                  } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} bg-color-background-default`}
                  onClick={() => setOpenDropdown((prev) => (prev === field ? null : field))}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold ${
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
                    className={`h-4 w-4 text-color-text-body transition-transform duration-200 ${
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
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border border-color-background-emphasis bg-[#dee4e2]">
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
                        <p className="px-3 py-3 text-xs text-color-text-body">
                          {getLabelText("new_mme_no_data", "No data")}
                        </p>
                      ) : (
                        filteredOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            className="flex w-full items-center gap-2 border-b border-color-background-emphasis p-2 text-left text-sm last:border-b-0 hover:bg-[#e3e9e7]"
                            onClick={() => handleSelect(field, option.key)}
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
        </div>

        <OGButton
          type="primary"
          className="mt-4 w-full"
          disabled={!canApplyCarSearch || isLoading}
          onClick={handleSearch}
        >
          {isLoading
            ? `${getLabelText("loading", "Loading")}...`
            : getLabelText("find_car_parts", "Find car parts")}
        </OGButton>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
