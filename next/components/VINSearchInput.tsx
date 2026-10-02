"use client";

import React, { useState } from "react";
import { useMmeStore } from "@/stores/useMmeStore";
import { validateVIN } from "@/utils/vinStringValidationCheck";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";

// THIS COMPONENT WILL BE USED FOR VIN SEARCH INPUT
export default function VINSearchInput() {
  const {
    searchValue,
    isSearching,
    carByVinResults,
    vinValidation,
    setSearchValue,
    setVinValidation,
    fetchCarByVin,
  } = useMmeStore();
  const isMobile = useMedia("(max-width: 639px)");
  const [localVinValue, setLocalVinValue] = useState(searchValue);
  const { getLabel } = useBranding();
  // Handle VIN input change with validation
  const handleVinChange = (value: string) => {
    setLocalVinValue(value);
    setSearchValue(value);

    // Real-time validation
    if (value.length > 0) {
      const validation = validateVIN(value);
      setVinValidation(validation);
    } else {
      setVinValidation({ isValid: false, error: "" });
    }
  };

  // Handle VIN search
  const handleVinSearch = async () => {
    if (!localVinValue.trim()) {
      setVinValidation({ isValid: false, error: "VIN cannot be empty" });
      return;
    }

    const validation = validateVIN(localVinValue);
    if (!validation.isValid) {
      setVinValidation(validation);
      return;
    }

    try {
      const result = await fetchCarByVin(localVinValue);
      if (result) {
      } else {
        setVinValidation({ isValid: false, error: "No car found for this VIN" });
      }
    } catch (error) {
      console.error("VIN search error:", error);
      setVinValidation({ isValid: false, error: "Error searching for VIN" });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVinSearch();
    }
  };

  return (
    <div className={`w-full max-w-[450px] space-y-4 ${isMobile ? "mb-6" : ""}`}>
      {/* VIN Input Field */}
      <div className="relative border-l border-color-primary-main pl-3">
        <div className="mb-1">
          <label htmlFor="vin-input" className="block text-gray-700 body-bold-sm">
            {getLabel("vin_number")}
          </label>
        </div>

        <div className="flex gap-2">
          <input
            id="vin-input"
            type="text"
            value={localVinValue}
            onChange={(e) => handleVinChange(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder={getLabel("enter_car_vin_number")}
            className={`flex-1 border-none px-0 py-2 text-sm focus:outline-none ${
              vinValidation.isValid
                ? "border-green-500 focus:ring-green-200"
                : vinValidation.error
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
            }`}
            maxLength={17}
          />
          <button
            onClick={handleVinSearch}
            disabled={isSearching || !localVinValue.trim()}
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSearching ? getLabel("searching") : getLabel("search")}
          </button>
        </div>
      </div>
      {/* Validation Messages */}
      {vinValidation.error && (
        <div className="mt-2 text-sm text-color-system-error-dark">{vinValidation.error}</div>
      )}
      {vinValidation.isValid && (
        <div className="mt-2 text-sm text-green-600">✓ Valid VIN format</div>
      )}

      {/* VIN Search Results */}
      {carByVinResults.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-3 font-semibold text-green-800">Car Found!</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Brand:</span>
              <span className="text-gray-900">{carByVinResults[0]?.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Model:</span>
              <span className="text-gray-900">{carByVinResults[0]?.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Engine:</span>
              <span className="text-gray-900">{carByVinResults[0]?.engine || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">VIN:</span>
              <span className="font-mono text-gray-900">{carByVinResults[0]?.vin}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
