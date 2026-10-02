"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";
import TestConfirmData from "./test-confirm-data";
import MMESearchFilter from "@/components/MMESearchFilter";
import slugify from "slugify";

// THIS COMPONENT WILL LOAD IF "searchMode = manual" in useMmeStore
export default function TestManualSearch() {
  const { currentStep, searchData, addToPreviousSearches } = useMmeStore();

  return (
    <div className="space-y-6">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => useMmeStore.getState().setSearchMode("vin")}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Switch to VIN Search
        </button>
      </div>

      {/* MME Selection Interface */}
      <MMESearchFilter />

      {/* Selected Data Display */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">Selected Data:</h4>
        <div className="space-y-1 text-sm">
          <div>Make: {searchData.make?.value || "Not selected"}</div>
          <div>Model: {searchData.model?.value || "Not selected"}</div>
          <div>Engine: {searchData.engine?.value || "Not selected"}</div>
        </div>
      </div>

      {/* if step = 4 */}
      {currentStep === 4 && <TestConfirmData />}

      {/* Find Car Parts Button */}
      {currentStep >= 1 && searchData.make && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Add to previous searches before redirecting
              //@ts-ignore
              addToPreviousSearches();

              const makeModelTypeId =
                searchData.engine?.key || searchData.model?.key || searchData.make?.key;

              // Build URL parts based on completed levels
              const urlParts = [];

              // Add make if selected
              if (searchData.make?.value) {
                //@ts-ignore
                urlParts.push(slugify(searchData.make.value, { lower: true, strict: true }));
              }

              // Add model if selected
              if (searchData.model?.value) {
                //@ts-ignore
                urlParts.push(slugify(searchData.model.value, { lower: true, strict: true }));
              }

              // Add engine if selected
              if (searchData.engine?.value) {
                //@ts-ignore
                urlParts.push(slugify(searchData.engine.value, { lower: true, strict: true }));
              }

              const slugPath = urlParts.join("-");
              const url = `/en-BE/test-mme/${slugPath}/?makeModelTypeId=${makeModelTypeId}&take=10&order=ASC`;
              window.location.href = url;
            }}
            className="w-full rounded-lg bg-teal-600 px-6 py-3 text-white hover:bg-teal-700 disabled:bg-gray-300"
            disabled={!searchData.make}
          >
            Find Car Parts
          </button>
        </div>
      )}
    </div>
  );
}
