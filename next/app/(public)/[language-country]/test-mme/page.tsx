"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";
import TestVinSearch from "./_components/test-vin-search";
import TestManualSearch from "./_components/test-manual-search";
import TestPreviousSearches from "./_components/test-previous-searches";
import { OGButton } from "@/components/og-components/OGButton";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams, useRouter } from "next/navigation";
import MMESearchModal from "@/components/MMESearchModal";

export default function TestMmePage() {
  const { searchMode, searchData, currentStep, openMmeModal, setSearchMode } = useMmeStore();
  const params = useParams();
  const router = useRouter();

  // Check if MME is fully completed (all 3 levels)
  const isFullyCompleted = searchData.make && searchData.model && searchData.engine;

  // Check if MME is partially completed (at least make is selected)
  const isPartiallyCompleted = searchData.make;

  const handleOpenClick = () => {
    if (isFullyCompleted) {
      // Case 2: Fully completed MME - Open MMESearchModal
      openMmeModal();
    } else if (isPartiallyCompleted) {
      // Case 1: Partially completed MME - Open Category Modal
      const url = getRouteLocaleString(Routes.categoriessearch, params);
      router.push(url);
    }
  };

  return (
    <div className="p-4 pt-20">
      <h1 className="mb-4 text-2xl font-bold">MME Test Page</h1>
      <div className="mb-4">
        <p>
          Current Search Mode: <span className="font-semibold">{searchMode}</span>
        </p>
        <div className="mt-2 flex gap-2">
          <OGButton
            type={searchMode === "manually" ? "primary" : "outlined"}
            size="small"
            onClick={() => setSearchMode("manually")}
          >
            Manual Search
          </OGButton>
          <OGButton
            type={searchMode === "vin" ? "primary" : "outlined"}
            size="small"
            onClick={() => setSearchMode("vin")}
          >
            VIN Search
          </OGButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          {searchMode === "vin" ? <TestVinSearch /> : <TestManualSearch />}

          {/* Open Button */}
          <div className="mt-6">
            <OGButton
              type="primary"
              size="medium"
              onClick={handleOpenClick}
              disabled={!isPartiallyCompleted}
              className="w-full"
            >
              Open
            </OGButton>
            <div className="mt-2 text-xs text-gray-500">
              {isFullyCompleted
                ? "Opens MMESearchModal (fully completed MME)"
                : isPartiallyCompleted
                  ? "Opens Category Modal (partially completed MME)"
                  : "Select at least Make to enable"}
            </div>
          </div>
        </div>

        <div>
          <TestPreviousSearches />
        </div>
      </div>

      {/* MMESearchModal */}
      <MMESearchModal />
    </div>
  );
}
