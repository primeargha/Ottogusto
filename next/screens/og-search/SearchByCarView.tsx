"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import SearchDropdown from "./SearchDropdown";
import SearchModeToggle from "./SearchModeToggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import QuickSearchIcon from "@/assets/search/quick-search.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import SearchAreaIcon from "@/assets/search/search-area.svg";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useBranding } from "@/contexts/BrandingContext";
import alert from "@/assets/search/information-square.svg";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useMedia } from "@/hooks/useMedia";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export default function SearchByCarView() {
  const { getLabel } = useBranding();
  const {
    searchMode,
    setSearchMode,
    currentStep,
    searchData,
    searchResults,
    setSearchValue,
    updateSearchData,
    openModal,
    setCurrentStep,
    setIsOgSearch,
    closeModal,
    carByVinResults,
    closeOgSearchModal,
    searchValue,
    addToPreviousSearches,
    vinValidation,
    fetchCarByVin,
    setVinValidation,
    setCarByVinResults,
    setSearchData,
    setFromRoute,
    getMakeModelTypeId,
    setOgSearchModalContent,
    openOgSearchModal,
  } = useSearchModalStore();
  const { updateFilters } = useUrlParams();
  const isMobile = useMedia("(max-width: 639px)");
  const router = useRouter();
  const params = useParams();

  const { openAdvSearch } = useAdvancedSearchStore();

  const handleQuickSearch = () => {
    if (!searchData?.make?.value) {
      return;
    }

    const makeModelTypeId = getMakeModelTypeId();
    updateFilters(
      {
        makeModelTypeId: makeModelTypeId || carByVinResults[0]?.id || null,
        year: searchData?.year?.value || null,
      },
      "/products",
    );
  };

  const handleAdvancedSearch = async () => {
    if (!searchData?.make?.value) {
      return;
    }

    if (
      searchData?.make?.value &&
      searchData?.model?.value &&
      searchData?.year?.value &&
      searchData.type?.value
    ) {
      const { getRouteLocaleString } = await import("@/helpers/UtilityHelper");
      const { Routes } = await import("@/config/routes");

      const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");

      const targetStep = isEngineTrimEnabled ? 5 : 7;
      router.push(`${getRouteLocaleString(Routes.search, params)}manually/?step=${targetStep}`);

      setFromRoute("og-search");

      setIsOgSearch(true);

      setVinValidation({
        isValid: false,
        error: "",
      });
      setCarByVinResults([]);
    }

    if (
      !searchData?.make?.value ||
      !searchData?.model?.value ||
      !searchData?.year?.value ||
      !searchData.type?.value
    ) {
      closeModal();
      openAdvSearch("og-search-by-car");
    }
  };

  const handleSearchByVin = async () => {
    if (!searchValue) {
      setVinValidation({
        isValid: false,
        error: "VIN cannot be empty",
      });
      return;
    }

    if (vinValidation.isValid) {
      setSearchData({
        make: null,
        model: null,
        type: null,
        year: null,
      });
      closeOgSearchModal();
      setCurrentStep(5);
      openModal();
      setIsOgSearch(true);
      await fetchCarByVin(searchValue);
    }
  };

  return (
    <Box className="mt-5 space-y-6 pb-3 between-1280-1599:pb-0">
      <SearchModeToggle mode={searchMode} onChange={setSearchMode} />

      {searchMode === "vehicle" ? (
        <Box className="max-h-[200px]">
          <Box className="grid items-end gap-2 gtsm:grid-cols-4 2xl:grid-cols-6">
            <SearchDropdown
              label={getLabel("make")}
              placeholder={getLabel("select_make")}
              isVisible={true}
              value={searchData.make?.value || ""}
              options={searchResults}
              onSearch={setSearchValue}
              onSelect={updateSearchData}
            />

            {/* <Box className="flex items-center justify-center">
            <div className="h-full w-[1px] bg-gray-200" />
          </Box> */}

            <SearchDropdown
              label={getLabel("model")}
              placeholder={getLabel("select_model")}
              isVisible={!!searchData.make?.value}
              value={searchData.model?.value || ""}
              options={searchResults}
              onSearch={setSearchValue}
              onSelect={updateSearchData}
            />

            <SearchDropdown
              label={getLabel("year")}
              placeholder={getLabel("select_year")}
              isVisible={!!searchData.make?.value && !!searchData.model?.value}
              value={searchData.year?.value || ""}
              options={searchResults}
              onSearch={setSearchValue}
              onSelect={updateSearchData}
            />

            <SearchDropdown
              label={getLabel("type")}
              placeholder={getLabel("select_type")}
              isVisible={
                !!searchData.make?.value && !!searchData.model?.value && !!searchData.year?.value
              }
              value={searchData.type?.value || ""}
              options={searchResults}
              onSearch={setSearchValue}
              onSelect={updateSearchData}
            />
            {/* Button group */}
            <Box className="md:col-span-4 ml:col-span-2 between-1280-1599:col-span-4">
              <Box className="flex flex-row gap-2 md:w-full ml:w-auto">
                <Button
                  className={`flex-row items-center gap-1 rounded-[4px] border border-color-primary-main bg-transparent p-[10px] hover:bg-transparent focus:bg-transparent active:bg-transparent md:flex-1 gtlg:hover:bg-[--hover-green-color] ml:flex-auto ${searchData?.make?.value ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"}`}
                  onPress={handleQuickSearch}
                >
                  <Image src={QuickSearchIcon} alt="Quick Search" width={24} height={24} />
                  <Text className="text-color-primary-main body-regular-sm">
                    {getLabel("quick_search")}
                  </Text>
                </Button>
                <Button
                  className={`flex flex-row items-center gap-1 rounded-[4px] border border-color-primary-main bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main md:flex-1 gtlg:hover:bg-[--hover-text-color] ml:flex-auto ${searchData?.make?.value ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"}`}
                  onPress={handleAdvancedSearch}
                >
                  <Image src={AdvancedSearchIcon} alt="Advanced Search" width={24} height={24} />
                  <Text className="text-[--background-white] body-regular-sm">
                    {getLabel("advanced_search")}
                  </Text>
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="relative h-[220px] w-full flex-row items-center justify-between">
          <Box className="flex w-full flex-col">
            {" "}
            <input
              type="text"
              value={searchValue}
              placeholder={getLabel("search_by_vin")}
              className="flex w-full font-Overpass text-[24px] font-bold leading-[26px] text-color-text-body caret-[--brand-traffic-light-green] outline-none placeholder:text-color-primary-main placeholder:opacity-30 focus:outline-none"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchMode === "vin" && !vinValidation.isValid && vinValidation.error && (
              <Box className="max-w-2/3 mt-[10px] flex flex-row gap-[10px]">
                <Image src={alert} height={16} width={16} alt="alert" className="" />
                <Text className="font-Overpass text-[14px] font-[400] leading-[18px] text-color-text-body">
                  {vinValidation.error}
                </Text>
              </Box>
            )}
          </Box>

          <Button
            onPress={handleSearchByVin}
            disabled={vinValidation.isValid ? false : true}
            className={`flex h-[44px] min-w-[180px] max-w-[180px] items-center justify-center gap-[10px] rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main px-[10px] py-[10px] gtsm:flex-auto gtlg:right-0 ml:right-0 2xl:right-0 2xl:top-[10px] between-1280-1599:right-0 ${vinValidation.isValid ? "opacity-100" : "opacity-30"}`}
          >
            <Image src={SearchAreaIcon} alt="Search" height={24} width={24} />
            <Text className="font-overpass whitespace-nowrap font-medium leading-[22px] text-white base:text-[16px] gtsm:text-[20px]">
              {getLabel("search")}
            </Text>
          </Button>
        </Box>
      )}
    </Box>
  );
}
