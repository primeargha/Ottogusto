import React from "react";

import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import resetIcon from "@/assets/og-search/reset.svg";
import { useBranding } from "@/contexts/BrandingContext";
import alert from "@/assets/search/alert.svg";
import MobileSearchModeToggle from "./MobileSearchModeToggle";
import MobileSearchDropdown from "./MobileSearchDropdown";

export default function CarContent() {
  const { getLabel } = useBranding();
  const {
    searchMode,
    setSearchMode,
    searchData,
    searchResults,
    setSearchValue,
    updateSearchData,
    resetSearch,
    setOgSearchModalContent,
    ogSearchModalContent,
    searchValue,
    vinValidation,
  } = useSearchModalStore();

  return (
    <Box
      className={`relative mx-auto mt-20 flex h-[472px] w-[375px] flex-col bg-white px-4 py-6 pt-10 shadow-[0px_2px_20px_10px_rgba(0,0,0,0.05)] ${searchMode === "vin" ? "h-[200px]" : ""}`}
    >
      {/* Search Mode Toggle */}
      <Box className="absolute -top-[2.25rem] left-0 z-10 flex h-[60px] w-[375px] flex-row items-center rounded-[8px] bg-white shadow-[0px_8px_26px_10px_rgba(0,0,0,0.10)]">
        <MobileSearchModeToggle mode={searchMode} onChange={setSearchMode} />
      </Box>

      {/* Search Form */}
      {searchMode === "vehicle" ? (
        <Box className="space-y-4">
          <MobileSearchDropdown
            label="Make"
            placeholder={getLabel("select_make")}
            isVisible={true}
            value={searchData.make?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
          />

          <MobileSearchDropdown
            label="Model"
            placeholder={getLabel("select_model")}
            isVisible={!!searchData.make?.value}
            value={searchData.model?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
          />

          <MobileSearchDropdown
            label="Year"
            placeholder={getLabel("select_year")}
            isVisible={!!searchData.make?.value && !!searchData.model?.value}
            value={searchData.year?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
          />

          <MobileSearchDropdown
            label="Type"
            placeholder={getLabel("select_type")}
            isVisible={
              !!searchData.make?.value && !!searchData.model?.value && !!searchData.year?.value
            }
            value={searchData.type?.value || ""}
            options={searchResults}
            onSearch={setSearchValue}
            onSelect={updateSearchData}
          />

          {/* Reset Button */}
          <Box className="pt-4">
            {/* <Button
              className={`w-full rounded-md bg-transparent px-4 py-2 text-[14px] text-color-primary-main hover:bg-transparent focus:bg-transparent active:bg-transparent ${!searchData.make?.value ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"}`}
              onPress={() => {
                if (!searchData.make?.value) return;
                resetSearch();
              }}
            >
              <Image src={resetIcon} height={20} width={20} alt="reset icon" />
              <Text className="font-inter text-[16px] uppercase leading-[18px] tracking-[0.96px] text-[--brand-traffic-light-green]">
                {getLabel("reset")}
              </Text>
            </Button> */}
          </Box>
        </Box>
      ) : (
        <Box className="w-full">
          <input
            type="text"
            placeholder="Enter your car's VIN identity to search"
            className="w-full p-3 font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body caret-[--brand-traffic-light-green] outline-none placeholder:text-[16px] placeholder:text-color-primary-main placeholder:opacity-30 focus:outline-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {searchMode === "vin" && !vinValidation.isValid && vinValidation.error && (
            <Box className="mt-4 flex w-full flex-row justify-center gap-2">
              <Image src={alert} height={16} width={16} alt="alert" />
              <Text className="font-Overpass text-[16px] font-[400] leading-[18px] text-color-system-error-main">
                {vinValidation.error}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
