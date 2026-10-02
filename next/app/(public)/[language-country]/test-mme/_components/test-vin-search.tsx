"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";
import TestConfirmData from "./test-confirm-data";
import VINSearchInput from "@/components/VINSearchInput";
import slugify from "slugify";

// THIS COMPONENT WILL LOAD IF "searchMode = vin" in useMmeStore
export default function TestVinSearch() {
  const { currentStep, carByVinResults, addToPreviousSearches } = useMmeStore();

  return (
    <div className="space-y-6">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => useMmeStore.getState().setSearchMode("manually")}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Switch to Manual Search
        </button>
      </div>

      {/* VIN Search Input */}
      {currentStep < 4 && <VINSearchInput />}

      {/* if step = 4 */}
      {currentStep === 4 && <TestConfirmData />}

      {/* Find Car Parts Button */}
      {carByVinResults.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Add to previous searches before redirecting
              //@ts-ignore
              addToPreviousSearches();

              const makeModelTypeId = carByVinResults[0]?.id || "00000000000000000";

              // Build URL parts based on available VIN data
              const urlParts = [];

              // Add brand if available
              if (carByVinResults[0]?.brand) {
                //@ts-ignore
                urlParts.push(slugify(carByVinResults[0].brand, { lower: true, strict: true }));
              }

              // Add model if available
              if (carByVinResults[0]?.model) {
                //@ts-ignore
                urlParts.push(slugify(carByVinResults[0].model, { lower: true, strict: true }));
              }

              // Add engine if available
              if (carByVinResults[0]?.engine) {
                //@ts-ignore
                urlParts.push(slugify(carByVinResults[0].engine, { lower: true, strict: true }));
              }

              const slugPath = urlParts.join("-");
              const url = `/en-BE/test-mme/${slugPath}/?makeModelTypeId=${makeModelTypeId}&take=10&order=ASC`;
              window.location.href = url;
            }}
            className="w-full rounded-lg bg-teal-600 px-6 py-3 text-white hover:bg-teal-700"
          >
            Find Car Parts
          </button>
        </div>
      )}
    </div>
  );
}
