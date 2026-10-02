import React, { useEffect, useRef, useCallback } from "react";

import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { OGButton } from "@/components/og-components/OGButton";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import Image from "next/image";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useMedia } from "@/hooks/useMedia";
import isEqual from "fast-deep-equal";
import { useBranding } from "@/contexts/BrandingContext";
import MobileSearchDropdown from "../og-search/MobileSearchDropdown";

const MMYTFilter = React.memo(
  ({
    getMMYT,
    prefillDone,
    onSaveSuccess,
  }: {
    getMMYT?: () => void;
    prefillDone?: boolean;
    onSaveSuccess?: () => void;
  }) => {
    const isDesktop = useMedia("(min-width: 1200px)");
    const {
      searchData,
      searchResults,
      setSearchValue,
      updateSearchData,
      getMakeModelTypeId,
      carByVinResults,
    } = useSearchModalStore();
    const { updateFilters } = useUrlParams();
    const { getLabel } = useBranding();

    const initialSearchDataRef = useRef(searchData);
    const hasSetInitialRef = useRef(false);

    // Set initial reference after prefill is done, only once
    useEffect(() => {
      if (prefillDone && !hasSetInitialRef.current) {
        initialSearchDataRef.current = searchData;
        hasSetInitialRef.current = true;
      }

      // Reset when prefill is not done (modal reopened)
      if (!prefillDone) {
        hasSetInitialRef.current = false;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefillDone]); // Remove searchData from dependencies

    const isChanged = !isEqual(searchData, initialSearchDataRef.current);

    // Only consider it truly changed if prefill is done AND initial ref is set AND data actually differs
    const isTrulyChanged = prefillDone && hasSetInitialRef.current && isChanged;

    const handleFilterProductsByMMYT = useCallback(async () => {
      const makeModelTypeId = getMakeModelTypeId();

      const filtersToUpdate = {
        makeModelTypeId: makeModelTypeId || carByVinResults[0]?.id || null,
        year: searchData?.year?.value || null,
      };

      try {
        updateFilters(filtersToUpdate, "/products", undefined, true);
      } catch (error) {
        console.error("🔧 updateFilters call failed:", error);
      }

      if (isDesktop && getMMYT) {
        getMMYT();
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    }, [
      getMakeModelTypeId,
      updateFilters,
      carByVinResults,
      searchData,
      isDesktop,
      getMMYT,
      onSaveSuccess,
    ]);

    return (
      <Box className="mb-[24px] flex w-full flex-col gap-[24px] base:mt-[24px] base:min-h-[252px] ml:mt-0 ml:h-auto">
        <Box className="h-full w-full">
          <MobileSearchDropdown
            label={getLabel("make")}
            placeholder={getLabel("add_make")}
            isVisible={true}
            value={searchData.make?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
            classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px]"
            step={1}
          />

          <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

          <MobileSearchDropdown
            label={getLabel("model")}
            placeholder={getLabel("add_model")}
            isVisible={!!searchData.make?.value}
            value={searchData.model?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
            classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px]"
            step={2}
          />

          <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

          <MobileSearchDropdown
            label={getLabel("year")}
            placeholder={getLabel("add_year")}
            isVisible={!!searchData.make?.value && !!searchData.model?.value}
            value={searchData.year?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
            classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px]"
            step={3}
          />

          <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

          <MobileSearchDropdown
            label={getLabel("type")}
            placeholder={getLabel("add_type")}
            isVisible={
              !!searchData.make?.value && !!searchData.model?.value && !!searchData.year?.value
            }
            value={searchData.type?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
            classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px]"
            step={4}
          />
        </Box>

        <OGButton
          onClick={handleFilterProductsByMMYT}
          className="w-full ml:flex"
          leftcomp={<Image src={AdvancedSearchIcon} alt="Save" height={20} width={20} />}
          disabled={!searchData.make?.value || !isTrulyChanged}
        >
          {getLabel("save")}
        </OGButton>
      </Box>
    );
  },
);

MMYTFilter.displayName = "MMYTFilter";

export default MMYTFilter;
