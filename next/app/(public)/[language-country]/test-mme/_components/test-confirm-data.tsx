"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";

export default function TestConfirmData() {
  const { searchData, carByVinResults, addToPreviousSearches } = useMmeStore();

  // Get the car data from either manual search or VIN search
  const carData = searchData.make?.value
    ? {
        make: searchData.make.value,
        model: searchData.model?.value || "",
        engine: searchData.engine?.value || "",
      }
    : {
        make: carByVinResults[0]?.brand || "",
        model: carByVinResults[0]?.model || "",
        engine: carByVinResults[0]?.engine || "",
      };

  // Format the final combination display
  const formatCarDisplay = () => {
    const { make, model, engine } = carData;
    if (!make) return "No car data available";

    // Format: BMW_320i_Petrol_184HP_1998cc_[2019-2022]
    return `${make}_${model}_${engine}`.replace(/\s+/g, "_");
  };

  const handleConfirm = () => {
    // Add to previous searches
    //@ts-ignore
    addToPreviousSearches();

    // TODO: Navigate to search results page or perform search
    alert("Car confirmed! This would navigate to search results.");
  };

  const handleBack = () => {
    // Go back to previous step
    useMmeStore.getState().setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-blue-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-blue-800">Confirm Your Car</h3>

        {/* Car Data Display */}
        <div className="mb-6 space-y-3">
          <div className="rounded bg-white p-4">
            <h4 className="mb-2 font-semibold">Selected Car Details:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Make:</span> {carData.make || "Not selected"}
              </div>
              <div>
                <span className="font-medium">Model:</span> {carData.model || "Not selected"}
              </div>
              <div>
                <span className="font-medium">Engine:</span> {carData.engine || "Not selected"}
              </div>
            </div>
          </div>

          {/* Final Combination Display */}
          <div className="rounded bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-green-800">Final Combination:</h4>
            <div className="font-mono text-lg font-bold text-green-700">{formatCarDisplay()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-green-500 px-6 py-2 text-white hover:bg-green-600"
          >
            Confirm & Search
          </button>
        </div>
      </div>

      {/* Debug Information */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">Debug Info:</h4>
        <div className="space-y-1 text-xs">
          <div>Search Data: {JSON.stringify(searchData, null, 2)}</div>
          <div>VIN Results: {JSON.stringify(carByVinResults, null, 2)}</div>
        </div>
      </div>
    </div>
  );
}
