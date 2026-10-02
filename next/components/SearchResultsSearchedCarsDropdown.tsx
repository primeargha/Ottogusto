"use client";

import React, { useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { SearchedCarLabelOption } from "@/hooks/useSearchedCarLabels";
import carLogogreen from "@/assets/car_check.svg";
import Greencar, { Graycar } from "./Graycar";
import { GreenCarTick } from "./GreenCarTick";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";

export type SearchResultsSearchedCarsDropdownProps = {
  options: SearchedCarLabelOption[];
  selectedCarId: string | null;
  onSelectCar: (carId: string) => void;
  onAddNewCar: () => void;
  onDeselectCar?: () => void;
  onDropdownOpenChange?: (open: boolean) => void;
  labelsLoading?: boolean;
  disabled?: boolean;
};

/**
 * SRP recent-cars dropdown — UI parity with `SavedCarDropdownComponent` (search, list, checkmark).
 * Uses Cars API `carIds` instead of Garage `makeModelTypeId`.
 */
export default function SearchResultsSearchedCarsDropdown({
  options,
  selectedCarId,
  onSelectCar,
  onAddNewCar,
  onDeselectCar,
  onDropdownOpenChange,
  labelsLoading = false,
  disabled = false,
}: SearchResultsSearchedCarsDropdownProps) {
  const { getLabel } = useBranding();
  const [openDropdown, setOpenDropdownState] = useState(false);
  const [searchText, setSearchText] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const setDropdownOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setOpenDropdownState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      onDropdownOpenChange?.(value);
      return value;
    });
  };

  useClickOutside(menuRef, () => setDropdownOpen(false));

  const getLabelText = (key: string, fallback: string) => {
    const translated = getLabel(key);
    if (!translated || translated === key) return fallback;
    return translated;
  };

  const searchLower = searchText.trim().toLowerCase();
  const filteredOptions = searchLower
    ? options.filter(
        (o) => o.label.toLowerCase().includes(searchLower) || o.id.includes(searchLower),
      )
    : options;

  const selectedOption = selectedCarId ? options.find((o) => o.id === selectedCarId) : undefined;

  const selectedOptionLoading = labelsLoading || selectedOption?.isLoading === true;
  const displayText = selectedOptionLoading
    ? `${getLabelText("loading", "Loading")}...`
    : (selectedOption?.label ?? getLabelText("pick_select_car", "Select car"));

  const handleCarSelect = (carId: string) => {
    if (disabled || carId === selectedCarId) {
      setDropdownOpen(false);
      return;
    }
    onSelectCar(carId);
    setDropdownOpen(false);
  };

  return (
    <Box className="relative flex min-w-0 flex-col gap-2 gtsm:w-full gtlg:min-w-[360px] gtlg:max-w-[360px]">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setDropdownOpen((v) => !v)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDropdownOpen((v) => !v);
          }
        }}
        className={`flex w-full items-center justify-between rounded border border-gray-300 bg-white p-3 gtsm:w-full gtlg:min-w-[360px] gtlg:max-w-[360px] ${
          disabled
            ? selectedOptionLoading
              ? "cursor-not-allowed"
              : "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }`}
        aria-disabled={disabled}
        aria-expanded={openDropdown}
        aria-busy={selectedOptionLoading || undefined}
        aria-label={selectedOptionLoading ? displayText : undefined}
        aria-haspopup="listbox"
      >
        {selectedOptionLoading ? (
          <span className="animate-pulse inline-block h-4 w-32 max-w-[70%] rounded-sm bg-color-background-emphasis" />
        ) : (
          <span className="truncate text-sm text-color-text-default">{displayText}</span>
        )}
        <Box className="flex flex-row items-center">
          <Box className="mx-[2px] h-5 w-[1px] bg-color-border-default xs:mx-[6px]" />
          <ChevronDownIcon
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
              openDropdown ? "rotate-180" : ""
            }`}
          />
        </Box>
      </div>

      {openDropdown && !disabled && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setDropdownOpen(false)} />
          <div
            ref={menuRef}
            className="custom-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border bg-[#dee4e2]"
            role="listbox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 border-b bg-[#dee4e2] p-2">
              <input
                type="text"
                placeholder={getLabelText("search", "Search...")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                onAddNewCar();
              }}
              className="w-full cursor-pointer border-b border-l-0 border-r-0 border-t-0 p-2 text-left hover:bg-[#e3e9e7]"
            >
              <span className="text-sm font-medium">
                {getLabelText("add_new_car_to_eb_btn", "Add new car")}
              </span>
            </button>

            {/* Deselect Car */}
            {selectedCarId && onDeselectCar && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onDeselectCar();
                }}
                className="w-full cursor-pointer border-b border-l-0 border-r-0 border-t-0 p-2 text-left hover:bg-[#e3e9e7]"
              >
                <span className="text-sm font-medium">
                  {getLabelText("vehicle_selector_deselect_car", "Deselect Car")}
                </span>
              </button>
            )}

            {filteredOptions.length > 0 && (
              <div className="border-b last:border-b-0">
                <div className="bg-gray-50 p-2 font-semibold text-gray-700">
                  {getLabelText("most_recent", "Most Recent")}
                </div>
                {filteredOptions.map((car) => {
                  const isRowLoading = car.isLoading === true;
                  return (
                    <div
                      key={car.id}
                      role="option"
                      aria-selected={selectedCarId === car.id}
                      aria-busy={isRowLoading}
                      onClick={() => !isRowLoading && handleCarSelect(car.id)}
                      className={
                        isRowLoading
                          ? "cursor-default p-2 pl-6"
                          : "cursor-pointer p-2 pl-6 hover:bg-[#e3e9e7]"
                      }
                    >
                      <div className="flex items-center">
                        {selectedCarId === car.id && !isRowLoading && (
                          <span className="mr-2 text-green-600">✓</span>
                        )}
                        {isRowLoading ? (
                          <div
                            className="animate-pulse h-4 w-48 max-w-full rounded bg-color-background-emphasis"
                            aria-hidden
                          />
                        ) : (
                          <span className="text-sm">{car.label}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredOptions.length === 0 && !options.some((o) => o.isLoading) && (
              <p className="px-3 py-3 text-xs text-color-text-body">
                {getLabelText("new_mme_no_data", "No data")}
              </p>
            )}
          </div>
        </>
      )}
    </Box>
  );
}

/** Green car icon used in State B banner (matches SavedCarDropdownComponent). */
export function SearchResultsCarIcon({
  compatible,
  className,
}: {
  compatible: boolean;
  className?: string;
}) {
  return compatible ? (
    <GreenCarTick className={`h-20 w-20 ${className ?? "text-color-icon-positive"}`} />
  ) : (
    <Graycar className={`h-20 w-20 ${className ? "text-color-icon-emphasis" : ""}`} />
  );
}
