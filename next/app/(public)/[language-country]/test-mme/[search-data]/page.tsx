"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import MMESearchFilter from "@/components/MMESearchFilter";
import Typography from "@/components/og-components/Typography";

// Will Take the mmeId from the url
// reverse prefill the searchData in "useMmeStore", using the mmeId
export default function TestSearchResultPage() {
  const searchParams = useSearchParams();
  const { searchData, generateMmeSearchData, isSearching } = useMmeStore();

  useEffect(() => {
    if (searchParams) {
      const makeModelTypeId = searchParams.get("makeModelTypeId");
      if (makeModelTypeId) {
        generateMmeSearchData(makeModelTypeId);
      }
    }
  }, [searchParams, generateMmeSearchData]);

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <Typography type="h1" className="text-2xl font-bold text-gray-900">
          Test Search Result Page
        </Typography>
        <p className="text-gray-600">
          This page demonstrates backward generation of search data from makeModelTypeId
        </p>
      </div>

      {/* URL Parameters Display */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <Typography type="h4" className="mb-2 font-semibold">
          URL Parameters:
        </Typography>
        <div className="space-y-1 text-sm">
          <div>makeModelTypeId: {searchParams?.get("makeModelTypeId") || "Not provided"}</div>
          <div>take: {searchParams?.get("take") || "Not provided"}</div>
          <div>order: {searchParams?.get("order") || "Not provided"}</div>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-800">Generating search data from ID...</span>
          </div>
        </div>
      )}

      {/* Prefilled MME Search Filter */}
      <div className="rounded-lg border bg-white p-4">
        <Typography type="h4" className="mb-4 font-semibold">
          Prefilled MME Search Filter:
        </Typography>
        <MMESearchFilter />
      </div>

      {/* Generated Search Data Display */}
      <div className="rounded-lg border bg-green-50 p-4">
        <Typography type="h4" className="mb-2 font-semibold text-green-800">
          Generated Search Data:
        </Typography>
        <div className="space-y-1 text-sm">
          <div>Make: {searchData.make?.value || "Not generated"}</div>
          <div>Model: {searchData.model?.value || "Not generated"}</div>
          <div>Engine: {searchData.engine?.value || "Not generated"}</div>
          <div>makeModelTypeId: {searchData.makeModelTypeId || "Not set"}</div>
        </div>
      </div>

      {/* Back to Test Page */}
      <div className="mt-6">
        <button
          onClick={() => window.history.back()}
          className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
        >
          ← Back to Test Page
        </button>
      </div>
    </div>
  );
}
