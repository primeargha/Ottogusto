"use client";

import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";

import { useEffect } from "react";
import OgSearchHeader from "./OgSearchHeader";
import OgSearchFooter from "./OgSearchFooter";
import OgSearchBody from "./OgSearchBody";
import { useBranding } from "@/contexts/BrandingContext";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { usePathname } from "next/navigation";
import { useRouteStore } from "@/stores/useRouteStore";
import useRouter from "@unitools/router";

interface OgSearchModalProps {
  onModalClose: () => void;
}

export const OgSearchModal = (props: OgSearchModalProps) => {
  const { onModalClose } = props;
  const { getLabel } = useBranding();
  const {
    isOgSearchModalOpen,
    closeOgSearchModal,
    searchMode,
    setSearchMode,
    searchValue,
    currentStep,
    searchResults,
    updateSearchData,
    setSearchValue,
    searchData,
    setSearchResults,
    fetchSearchResults,
    setCurrentStep,
    setStep,
    isOgSearch,
    openModal,
    setIsOgSearch,
    addToPreviousSearches,
    vinValidation,
    fetchCarByVin,
    setVinValidation,
    closeModal,
    setCarByVinResults,
    setSearchData,
    ogSearchModalContent,
    setFromRoute,
    getMakeModelTypeId,
    carByVinResults,
  } = useSearchModalStore();
  const { updateFilters } = useUrlParams();
  const pathname = usePathname();

  const { openAdvSearch } = useAdvancedSearchStore();

  useEffect(() => {
    fetchSearchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const getCurrentStepValue = () => {
    switch (currentStep) {
      case 1:
        return searchData.make || "";
      case 2:
        return searchData.model || "";
      case 3:
        return searchData.year || "";
      case 4:
        return searchData.type || "";
      default:
        return "";
    }
  };

  const getInputLabel = () => {
    if (searchMode === "vehicle") {
      switch (currentStep) {
        case 1:
          return getLabel("og_search_make_of_your_car");
        case 2:
          return getLabel("og_search_model_of_your_car");
        case 3:
          return getLabel("og_search_year_of_your_car");
        case 4:
          return getLabel("og_search_type_of_your_car");
        default:
          return "";
      }
    } else {
      return getLabel("og_search_ask_vin");
    }
  };

  const getInputPlaceholder = () => {
    if (searchMode === "vehicle") {
      switch (currentStep) {
        case 1:
          return getLabel("og_search_make_of_your_car_sub");
        case 2:
          return getLabel("og_search_model_of_your_car_sub");
        case 3:
          return getLabel("og_search_year_of_your_car_sub");
        case 4:
          return getLabel("og_search_type_of_your_car_sub");
        default:
          return "";
      }
    } else {
      return `Enter your car's VIN identity`;
    }
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
  };

  const handleItemClick = (item: { key: string; value: string }) => {
    updateSearchData(item);
    setSearchValue("");
  };

  const setOldStoreSearchData = useSearchModalStore((s) => s.setSearchData);
  const router = useRouter();
  const { navigationHistory } = useRouteStore.getState();

  const handleCloseModal = () => {
    if (pathname?.includes("search/categories")) {
      if (onModalClose) {
        onModalClose();
      }
      closeOgSearchModal();
      const lastItem: any = navigationHistory[0];
      router.push(lastItem);
      return;
    }

    if (onModalClose) {
      onModalClose();
    }
    closeOgSearchModal();
  };

  const handleQuickSearch = () => {
    if (!searchData.make?.value) return;

    executeQuickSearch();
  };

  const executeQuickSearch = () => {
    if (!searchData.make?.value) return;

    setOldStoreSearchData({
      make: searchData.make,
      model: searchData.model,
      year: searchData.year,
      type: searchData.type,
      cc: searchData.cc,
      fuel: searchData.fuel,
      hp: searchData.hp,
      body: searchData.body,
      doors: searchData.doors,
      variant: searchData.variant,
    });

    const isFromVinSearch = pathname?.includes("vin-number");

    let makeModelTypeId: string | null = null;

    if (isFromVinSearch && carByVinResults && carByVinResults.length > 0) {
      makeModelTypeId = carByVinResults[0]?.makeModelTypeId || null;
    } else {
      makeModelTypeId = getMakeModelTypeId();
    }

    updateFilters({
      makeModelTypeId,
      year: searchData.year?.value || null,
      cc: searchData.cc || undefined || null,
      fuel: searchData.fuel || undefined || null,
      hp: searchData.hp || undefined || null,
      body: searchData.body || undefined || null,
      doors: searchData.doors || undefined || null,
      variant: searchData.variant || undefined || null,
    });
    closeModal();
    if (onModalClose) {
      onModalClose();
    }
    closeOgSearchModal();
  };

  const handleAdvancedSearch = () => {
    if (!searchData?.make?.value) {
      return;
    }

    if (
      searchData?.make?.value &&
      searchData?.model?.value &&
      searchData?.year?.value &&
      searchData.type?.value
    ) {
      closeOgSearchModal();
      setCurrentStep(5);
      setFromRoute("og-search");
      openModal();
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
      closeOgSearchModal();
      openAdvSearch();
    }
  };

  const handleSearchByVin = async () => {
    // if empty
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

  if (!isOgSearchModalOpen) return null;

  return (
    <Box className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 md:hidden">
      <Box className="w-full base:h-full">
        <Box className="h-full w-full bg-color-background-l2">
          {/* Header No Change Needed*/}
          <OgSearchHeader onClose={handleCloseModal} />

          {/* Here goes the mobile UI for search by make, model, year, type, with radio button to choose search by car or vin  */}
          <Box className="h-full w-full">
            <OgSearchBody />
          </Box>
          {ogSearchModalContent !== "saved" && ogSearchModalContent !== "oe" && (
            <OgSearchFooter
              onQuickSearch={handleQuickSearch}
              onAdvancedSearch={handleAdvancedSearch}
              onSearchByVin={handleSearchByVin}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
