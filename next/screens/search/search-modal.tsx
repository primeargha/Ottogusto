"use client";

import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";
import SearchHeader from "./search-header";
import SearchModeButtons from "./search-mode-buttons";
import SearchFooter from "./search-footer";
// import SearchStepper from "./search-stepper";
import SearchInput from "./search-input";
import SearchItemsContainer from "./search-items-container";
import { useEffect, useRef, useState } from "react";
import SearchByVehicleFinalStep from "./search-by-vehicle-final-step";
// import SearchStepperTablet from "./search-stepper-tablet";
import SearchModeDesktopButtons from "./search-mode-desktop-buttons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// import SearchStepperDesktop from "./search-stepper-desktop";
import { Text } from "@/components/ui/text";
import QuickSearchIcon from "@/assets/search/quick-search.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
// import checkIcon from "@/assets/search/checkmark.svg";
import SearchArea from "@/assets/search/search-area.svg";
import { useBranding } from "@/contexts/BrandingContext";
// import { ScrollView } from "@/components/ui/scroll-view";
import ActiveByCar from "@/assets/search/by-car-btn-icon.svg";
import { useAddUpdateMyCarsToEB, useGetMySavedCarsQuery } from "@/hooks/garage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import formatEditSearchData from "@/utils/formatEditSearchData";
import EditCar from "@/assets/eb-panel/white-pencil-edit-icon.svg";
// import Modal from "@/components/Modal";
import { useModalStore } from "@/stores/useModalStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
// import {
//   FormControl,
//   FormControlError,
//   FormControlErrorText,
//   FormControlLabel,
//   FormControlLabelText,
// } from "@/components/ui/form-control";
// import { Input, InputField } from "@/components/ui/input";
import ConfirmDuplicateCarModal from "@/components/ConfirmDuplicateCarModal";
import { useConfirmDuplicateCarStore } from "@/stores/useConfirmDuplicateCarStore";
import { useToast, Toast, ToastDescription } from "@/components/ui/toast";
import { OGButton } from "@/components/og-components/OGButton";
import OGStepper from "@/components/og-components/OGStepper";
import { useCheckForMysavedCarsPage } from "@/hooks/appHooks";
import { useRouter } from "next/navigation";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useMedia } from "@/hooks/useMedia";

// Define the schema for car name validation
const carNameSchema = z.object({
  carName: z.string().min(1, "Car name is required"),
});

type CarNameFormData = z.infer<typeof carNameSchema>;

export const SearchModal = () => {
  const { getLabel } = useBranding();
  const router = useRouter();
  const { updateFilters } = useUrlParams();
  const queryClient = useQueryClient();
  const scrollListRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen,
    closeModal,
    searchMode,
    setSearchMode,
    searchValue,
    currentStep,
    searchResults,
    updateSearchData,
    setSearchValue,
    searchData,
    fetchSearchResults,
    setCurrentStep,
    setStep,
    isOgSearch,
    setIsCarVerified,
    carByVinResults,
    addToPreviousSearches,
    vinValidation,
    fetchCarByVin,
    setSearchData,
    setVinValidation,
    isEB,
    ebMode,
    resetSearch,
    fromRoute,
    setEbMode,
    getMakeModelTypeId,
    setOgSearchModalContent,
    openOgSearchModal,
    setIsOgSearch,
  } = useSearchModalStore();
  const {
    isOpen: isDuplicateCarModalOpen,
    openModal: openDuplicateCarModal,
    closeModal: closeDuplicateCarModal,
  } = useModalStore();
  const { selectedCar, setSelectedCar } = useSelectedCarStore();
  const { data: savedCarsData, refetch } = useGetMySavedCarsQuery();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CarNameFormData>({
    resolver: zodResolver(carNameSchema),
    defaultValues: {
      carName: "",
    },
    mode: "onChange",
  });

  const { isAdvSearchOpen, openAdvSearch, closeAdvSearch } = useAdvancedSearchStore();
  const {
    openModal: openConfirmDuplicateCarModal,
    isOpen: isConfirmDuplicateCarModalOpen,
    closeModal: closeConfirmDuplicateCarModal,
    errorMessage,
    setErrorMessage,
  } = useConfirmDuplicateCarStore();

  // Add the brands query
  // const { data: brands } = useGetBrandsQuery(currentStep);
  const isMySavedCarsPage = useCheckForMysavedCarsPage();
  const [toastId, setToastId] = useState("");
  const toast = useToast();
  const successMsg = getLabel("car_saved_engine_bay");
  // const { } = usesave

  const isMobile = useMedia("(max-width: 639px)");

  const {
    mutate: addUpdateMyCarsToEB,
    isPending: isAddingUpdateMyCarsToEB,
    status: savingState,
    reset: resetAddUpdateStatus,
  } = useAddUpdateMyCarsToEB({
    onSuccess: (result: any) => {
      // TODO: show success message
      // Disabled this feature for OD-389
      // if (!isMySavedCarsPage) {
      //   showToast(successMsg, "success");
      // }
      if (fromRoute === "garage-bay") {
        // [OD-355]
        closeModal();
        resetSearch();
      }
      setErrorMessage(null);
      closeConfirmDuplicateCarModal();
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      if (fromRoute === "og-search" || fromRoute === "saved-cars") {
        setEbMode("edit");
        // setCurrentStep(1); // don't move to step1 as per Swadheen over call
      }
      // Will reset the mutation state
      // resetAddUpdateStatus();
    },
    onError: (error: any) => {
      if (error === undefined) {
        if (!isMySavedCarsPage) {
          // Disabled this feature for OD-389
          // showToast(
          //   getLabel("car_saved_engine_bay") || "Your car saved successfully.",
          //   "success",
          // );
        }
        // resetAddUpdateStatus();
        return;
      }

      if (
        error?.response?.data?.status === 409 &&
        error?.response?.data?.title === "Duplicate Car"
      ) {
        if (searchMode === "vin") {
          // Show error toast for VIN search mode
          const errorMessage = "A car with this VIN already exists in your Engine Bay";
          showToast(errorMessage, "error");
        } else {
          // if the modal is already open, don't open it again
          if (isConfirmDuplicateCarModalOpen) {
            setErrorMessage(error?.response?.data?.title);
            return;
          }

          openConfirmDuplicateCarModal();
        }
      }
    },
  });

  // Add this function to show error toast
  const showToast = (message: string, type: "error" | "info" | "success" | "warning") => {
    const newId = (Math.random() * 1000000).toFixed(0);
    setToastId(newId);

    // Check if window exists and set placement based on window width
    const placement =
      typeof window !== "undefined" && window.innerWidth > 992 ? "top right" : "top";

    let className = "";
    switch (type) {
      case "error":
        className = "bg-[--System-Colors-Error-Main]";
        break;

      case "warning":
        className = "bg-orange-500";
        break;

      case "success":
        className = "bg-green-500";
        break;
      case "info":
        className = "bg-sky-700";
        break;

      default:
        break;
    }
    toast.show({
      id: newId,
      placement: placement,
      duration: 5000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            nativeID={uniqueToastId}
            className={`h-fit w-[308px] rounded-[4px] ${className} 2xl:top-10`}
          >
            {/* @ts-ignore */}
            <ToastDescription className="font-Overpass text-[16px] font-normal leading-[18px] text-[--Brand-Pure-White]">
              {message}
            </ToastDescription>
          </Toast>
        );
      },
    });
  };

  // whenever step changes, fetch the search results
  useEffect(() => {
    fetchSearchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Auto-focus the search input when step changes
  useEffect(() => {
    if (searchInputRef.current && currentStep !== 5) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [currentStep, isOpen]);

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
        // Add more cases as needed
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
        // Add more cases as needed
        default:
          return "";
      }
    } else {
      return getLabel("og_search_ask_vin_sub");
    }
  };

  // when anyone type in the input field for search..
  const handleInputChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSaveAnyway = (name: string) => {
    handleAddEditCarToEB({ carName: name });
    // closeDuplicateCarModal();
    // handleAddEditCarToEB();
  };

  // when anyone click on Search Items..
  const handleItemClick = (item: { key: string; value: string }) => {
    if (scrollListRef.current) {
      let list = scrollListRef.current;
      list.scrollTo(0, 0);
    }
    updateSearchData(item);
    setSearchValue("");
  };

  const handleQuickSearch = () => {
    const makeModelTypeId = getMakeModelTypeId();

    // addToPreviousSearches(); // not required anymore
    updateFilters(
      {
        makeModelTypeId: makeModelTypeId || carByVinResults[0]?.id || null,
        year: searchData?.year?.value || null,
      },
      "/products",
    );
    // router.push(`/products`);
    setTimeout(() => {
      closeModal();
    }, 2000);
    // addToPreviousSearchesFromAdvSearchStore({
    //   make: searchData.make,
    //   model: searchData.model,
    //   year: searchData.year,
    //   type: searchData.type,
    // }, `Car parts for ${searchData.make?.value} ${searchData.model?.value} ${searchData.year?.value} ${searchData.type?.value}`);
  };

  const handleAdvancedSearch = () => {
    if (searchMode === "vehicle") {
      if (!searchData.make?.value) {
        return;
      }
    } else {
      if (carByVinResults.length === 0) {
        return;
      }
    }
    // Implement advanced search logic
    closeModal();
    if (isMobile) {
      setOgSearchModalContent("category");
      openOgSearchModal();
      setIsOgSearch(true);
    } else {
      openAdvSearch();
    }

    // store the previous search data
    // addToPreviousSearches();
  };

  const handleAddEditCarToEB = (obj?: { carName?: string }) => {
    // update here
    if (searchMode === "vehicle") {
      if (
        !searchData.make?.value ||
        !searchData.model?.value ||
        !searchData.year?.value ||
        !searchData.type?.value
      ) {
        return;
      }
    } else {
      if (carByVinResults.length === 0) {
        return;
      }
    }
    if (ebMode === "add") {
      if (searchMode === "vehicle") {
        const carInfo = searchData;

        // const stringifiedCarInfo = JSON.stringify(carInfo);

        let requestBody;
        if (
          fromRoute === "search-by-car" ||
          fromRoute === "saved-cars" ||
          fromRoute === "og-search"
        ) {
          requestBody = {
            year: carInfo?.year?.value || null,
            makeModelTypeId: carInfo?.type?.key || null,
            name: obj?.carName || null,
            isNew: true,
          };
        } else if (fromRoute === "garage-bay") {
          requestBody = {
            year: carInfo?.year?.value || null,
            makeModelTypeId: carInfo?.type?.key || null,
            name: obj?.carName || null,
            isNew: false,
          };
        }
        addUpdateMyCarsToEB(requestBody);
      } else {
        const carInfo = {
          ...carByVinResults[0],
        };

        // const stringifiedCarInfo = JSON.stringify(carInfo);

        let requestBody;
        if (
          fromRoute === "search-by-car" ||
          fromRoute === "og-search" ||
          fromRoute === "saved-cars"
        ) {
          requestBody = {
            year: carInfo?.year || carInfo?.yearFrom || null,
            type: carInfo?.type || null,
            makeModelTypeId: carInfo?.id || null,
            vin: searchValue,

            isNew: true,
          };
        } else if (fromRoute === "garage-bay") {
          requestBody = {
            year: carInfo?.year || carInfo?.yearFrom || null,
            type: carInfo?.type || null,
            makeModelTypeId: carInfo?.id || null,
            vin: searchValue,
            isNew: false,
          };
        }

        addUpdateMyCarsToEB(requestBody);
      }
    } else {
      // EDIT MODE EB
      if (searchMode === "vehicle") {
        const carInfo = searchData;

        // const stringifiedCarInfo = JSON.stringify(carInfo);

        const requestBody = {
          id: selectedCar?.id,
          year: carInfo?.year?.value || null,
          makeModelTypeId: carInfo?.type?.key || null,
        };

        const rsp = addUpdateMyCarsToEB(requestBody as any);
        closeModal();
        showToast(`${getLabel("eb_car_updated")}`, "success");
        // queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
        refetch();
        // Updates the selected Car with updated data
        setTimeout(() => {
          const updateCar = savedCarsData?.data.find((n) => n.id === selectedCar?.id || null);
          setSelectedCar(updateCar as any);
        }, 500);
      } else {
        const carInfo = {
          ...carByVinResults[0],
        };

        // const stringifiedCarInfo = JSON.stringify(carInfo);

        const requestBody = {
          id: selectedCar?.id,
          year: carInfo?.year || null,
          makeModelTypeId: carInfo?.id || null,
          vin: searchValue,
        };

        addUpdateMyCarsToEB(requestBody as any);
        closeModal();
        showToast(`${getLabel("eb_car_updated")}`, "success");
      }
    }
  };

  const handleSearchByVin = async () => {
    // empty check
    if (searchValue.length === 0) {
      // setCurrentStep(currentStep);
      // set error message
      setVinValidation({
        isValid: false,
        error: "VIN is required",
      });
      return;
    }

    // Implement search by vin logic
    if (vinValidation.isValid) {
      const carData = await fetchCarByVin(searchValue);
      setCurrentStep(5); // final step
      // clear search data only if it is OG search, if NOT OG search the first check of already existi Search Data
      if (isOgSearch) {
        setSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      }

      if (
        !isOgSearch &&
        !searchData.make?.value &&
        !searchData.model?.value &&
        !searchData.year?.value &&
        !searchData.type?.value
      ) {
        setSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      }
    }
  };

  const isAddToEBDisabled = () => {
    if (searchMode === "vehicle") {
      return (
        !searchData.make?.value ||
        !searchData.model?.value ||
        !searchData.year?.value ||
        !searchData.type?.value
      );
    } else {
      return carByVinResults.length === 0;
    }
  };

  useEffect(() => {
    if (isEB && ebMode === "edit") {
      // Call the function and handle the result properly
      (async () => {
        try {
          const formattedSearchData = await formatEditSearchData(selectedCar as any);

          // Set the formatted search data to the state
          setSearchData(formattedSearchData);

          // If we have VIN in the data, set search mode to VIN
          if (selectedCar?.vin) {
            // setSearchMode("vin");
            setSearchMode("vehicle");
            setCurrentStep(1);
            // setSearchValue(selectedCar.vin);
            // // Prepare car data without VIN for results display
            // const carWithoutVin = {
            //   ...selectedCar,
            //   vin: null
            // };
            // setCarByVinResults([carWithoutVin]);
          } else {
            // Otherwise, set to vehicle search mode
            // setIsEB(true);
            // setEbMode("edit");
            setSearchMode("vehicle");
            setCurrentStep(1); // Go directly to the final step to show the car info
          }
        } catch (error) {
          // Reset to default state on error
          setSearchMode("vehicle");
          setCurrentStep(1);
          setSearchData({
            make: null,
            model: null,
            year: null,
            type: null,
          });
        }
      })();
    } else {
      // ADD MODE EB
      setSearchMode("vehicle");
      setCurrentStep(1);
      setSearchData({
        make: null,
        model: null,
        year: null,
        type: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar, isEB]);

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4) {
      // when ever they are viewing or into these steps change the verification status
      setIsCarVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const renderDesktopActionButton = () => {
    if (isEB) {
      return (
        <Box className="mr-3 flex w-full flex-row items-center justify-center gap-4">
          <Button
            className={`flex w-[98%] flex-row items-center gap-1 rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main ${
              isAddToEBDisabled() ? "opacity-30" : "opacity-100"
            }`}
            onPress={() => handleAddEditCarToEB()}
          >
            {ebMode === "add" ? (
              <Image src={ActiveByCar} alt="Add new car to EB" width={20} height={20} />
            ) : (
              <Image src={EditCar} alt="Edit car in EB" width={20} height={20} />
            )}
            <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-[--background-white]">
              {ebMode === "add"
                ? getLabel("add_new_car_to_eb_btn")
                : getLabel("edit_car_in_eb_btn")}
            </Text>
          </Button>
        </Box>
      );
    }
    if (isOgSearch) {
      return (
        <Box className="mr-3 w-full">
          <Button
            className="flex w-[98%] flex-row items-center gap-1 rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main"
            onPress={handleAdvancedSearch}
          >
            <Text className="font-Overpass text-[20px] font-[500] leading-[22px] text-[--background-white]">
              {getLabel("select_category")}
            </Text>
          </Button>
        </Box>
      );
    }

    if (searchMode === "vehicle") {
      return (
        <Box className="flex flex-row gap-[16px]">
          <OGButton
            type="outlined"
            size="medium"
            disabled={!searchData?.make?.value}
            leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" width={20} height={20} />}
            className="flex-1 p-[12px] font-Overpass text-[16px] font-normal leading-[18px]"
            // leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" width={24} height={24} />}
            onClick={handleQuickSearch}
          >
            {getLabel("quick_search")}
          </OGButton>

          <OGButton
            onClick={handleAdvancedSearch}
            disabled={!searchData?.make?.value}
            leftcomp={
              <Image src={AdvancedSearchIcon} alt="Advanced Search" width={20} height={20} />
            }
            className="flex-1 p-[12px] font-Overpass text-[16px] font-normal leading-[18px]"
          >
            {getLabel("advanced_search")}
          </OGButton>
        </Box>
      );
    }

    // Default case: VIN search mode
    return (
      <Box className="flex flex-row gap-4">
        <Button
          className={`flex flex-row items-center gap-1 rounded-[4px] border border-[--brand-piston-green] bg-transparent p-[10px] hover:bg-transparent focus:bg-transparent active:bg-transparent gtlg:hover:bg-[--hover-green-color] ${carByVinResults.length > 0 ? "opacity-100" : "opacity-30"}`}
          onPress={handleQuickSearch}
          disabled={carByVinResults.length === 0}
        >
          <Image src={QuickSearchIcon} alt="Quick Search" width={24} height={24} />
          <Text className="font-Overpass text-[20px] font-[500] leading-[22px] text-color-primary-main">
            {getLabel("quick_search")}
          </Text>
        </Button>
        <Button
          className={`flex flex-row items-center gap-1 rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main gtlg:hover:bg-[--hover-text-color] ${carByVinResults.length > 0 ? "opacity-100" : "opacity-30"}`}
          onPress={handleAdvancedSearch}
          disabled={carByVinResults.length === 0}
        >
          <Image src={AdvancedSearchIcon} alt="Advanced Search" width={24} height={24} />
          <Text className="font-Overpass text-[20px] font-[500] leading-[22px] text-[--background-white]">
            {getLabel("advanced_search")}
          </Text>
        </Button>
      </Box>
    );
  };

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 z-50 flex h-[100dvh] flex-row items-start justify-center bg-black/50">
      <Box className="flex w-full flex-row items-center justify-center base:h-full gtsm:pl-[24px] gtsm:pr-[24px]">
        <Box className="w-full bg-color-background-l2 base:h-[100dvh] gtsm:mx-auto gtsm:h-[965px] gtsm:max-w-[1222px] gtsm:rounded-[8px] gtlg:h-[760px] 2xl:max-w-[1400px]">
          {/* Header No Change Needed*/}
          <SearchHeader onClose={closeModal} />

          {/* Search Mode Buttons for Mobile and Tablet */}
          {!isOgSearch && (
            <SearchModeButtons currentMode={searchMode} onModeChange={setSearchMode} />
          )}
          {/* Scrollable Content Area for Mobile and Tablet */}
          <Box className="h-full w-full bg-color-background-l2 base:px-[12px] gtsm:px-[24px] gtlg:hidden">
            {/* Previous Step Tracker and Search Components will go here */}
            <Box className="custom-scrollbar h-full overflow-y-auto overflow-x-hidden">
              {/* Here is the Previous Tracker and Edit Each step component */}
              {searchMode === "vehicle" ? (
                <>
                  <OGStepper />

                  {/* Search Input Components */}
                  {currentStep !== 5 && (
                    <Box className="flex flex-col base:gap-14 gtsm:gap-8 gtlg:gap-5">
                      <Box className="w-full py-3">
                        <SearchInput
                          label={getInputLabel()}
                          placeholder={getInputPlaceholder()}
                          value={searchValue}
                          onChange={handleInputChange}
                          ref={searchInputRef}
                        />
                      </Box>

                      {/* Here is the Search Items Container and This should be scrollable for infinite scroll */}
                      <SearchItemsContainer items={searchResults} onItemClick={handleItemClick} />
                    </Box>
                  )}

                  {/* Here is the Final Step for Search By Vehicle */}
                  {currentStep === 5 && (
                    <SearchByVehicleFinalStep
                      handleAddEditCarToEB={handleAddEditCarToEB}
                      savingState={savingState}
                      pendingState={isAddingUpdateMyCarsToEB}
                      resetSavedState={resetAddUpdateStatus}
                    />
                  )}
                </>
              ) : (
                <>
                  {currentStep === 5 && carByVinResults.length > 0 ? (
                    <SearchByVehicleFinalStep
                      handleAddEditCarToEB={handleAddEditCarToEB}
                      savingState={savingState}
                      pendingState={isAddingUpdateMyCarsToEB}
                      resetSavedState={resetAddUpdateStatus}
                    />
                  ) : (
                    <Box className="flex w-full flex-col">
                      <SearchInput
                        label={getInputLabel()}
                        placeholder={getInputPlaceholder()}
                        value={searchValue}
                        onChange={handleInputChange}
                        ref={searchInputRef}
                      />

                      <Box className="flex w-full flex-row justify-center">
                        <Button
                          className={`flex h-[44px] w-[150px] flex-row items-center gap-3 rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main ${
                            vinValidation.isValid ? "opacity-100" : "opacity-30"
                          }`}
                          onPress={handleSearchByVin}
                          disabled={!vinValidation.isValid}
                        >
                          <Image src={SearchArea} alt="Advanced Search" width={24} height={24} />
                          <Text className="font-Overpass text-[16px] font-[700] text-[--background-white]">
                            {getLabel("lookup_VIN")}
                          </Text>
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Desktop Layout */}
          <Box className="hidden h-full gtlg:flex gtlg:flex-row">
            {/* Left Column */}
            <Box className="h-full flex-1">
              {/* Back Button */}

              {/* Search Mode Buttons - Horizontal */}
              <>
                {/* Back button is not required as per new designs */}
                {!isOgSearch && (
                  <Box className="relative flex flex-row items-center justify-center">
                    <SearchModeDesktopButtons
                      currentMode={searchMode}
                      onModeChange={setSearchMode}
                    />
                  </Box>
                )}
              </>

              {/* Search Input and Results */}
              <Box className={`${currentStep === 5 ? "h-full" : "h-full"} flex-1 overflow-hidden`}>
                {searchMode === "vehicle" ? (
                  <Box className="custom-scrollbar flex h-full flex-col gap-[24px] overflow-y-auto">
                    {currentStep !== 5 && (
                      <>
                        <SearchInput
                          label={getInputLabel()}
                          placeholder={getInputPlaceholder()}
                          value={searchValue}
                          onChange={handleInputChange}
                          ref={searchInputRef}
                        />
                        <SearchItemsContainer items={searchResults} onItemClick={handleItemClick} />
                      </>
                    )}
                    {currentStep === 5 && (
                      <SearchByVehicleFinalStep
                        handleAddEditCarToEB={handleAddEditCarToEB}
                        savingState={savingState}
                        pendingState={isAddingUpdateMyCarsToEB}
                        resetSavedState={resetAddUpdateStatus}
                      />
                    )}
                  </Box>
                ) : (
                  <>
                    {/* IF VIN SEARCH and search RESULT is there */}
                    {currentStep === 5 && carByVinResults.length > 0 ? (
                      <SearchByVehicleFinalStep
                        handleAddEditCarToEB={handleAddEditCarToEB}
                        savingState={savingState}
                        pendingState={isAddingUpdateMyCarsToEB}
                        resetSavedState={resetAddUpdateStatus}
                      />
                    ) : (
                      <>
                        <SearchInput
                          label={getInputLabel()}
                          placeholder={getInputPlaceholder()}
                          value={searchValue}
                          onChange={handleInputChange}
                          ref={searchInputRef}
                        />

                        <Box className="mt-[24px] w-full flex-row justify-center base:hidden gtlg:flex">
                          {searchData.make?.value ||
                          searchData.model?.value ||
                          searchData.type?.value ||
                          searchData.year?.value ? (
                            <Button
                              className={`flex h-auto w-auto flex-row items-center gap-[12px] rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[12px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main ${
                                vinValidation.isValid ? "opacity-100" : "opacity-30"
                              }`}
                              onPress={handleSearchByVin}
                              disabled={!vinValidation.isValid}
                            >
                              <Image
                                src={SearchArea}
                                alt="Advanced Search"
                                width={20}
                                height={20}
                              />
                              <Text className="font-Overpass text-[16px] font-[400] leading-[18px] text-[--Brand-Pure-White]">
                                {getLabel("lookup_VIN")}
                              </Text>
                            </Button>
                          ) : (
                            <Button
                              className={`flex h-auto w-auto flex-row items-center gap-[12px] rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main p-[10px] hover:bg-color-primary-main focus:bg-color-primary-main active:bg-color-primary-main ${
                                vinValidation.isValid ? "opacity-100" : "opacity-30"
                              }`}
                              onPress={handleSearchByVin}
                              disabled={!vinValidation.isValid}
                            >
                              <Image
                                src={SearchArea}
                                alt="Advanced Search"
                                width={20}
                                height={20}
                              />
                              <Text className="font-Overpass text-[16px] font-[400] leading-[18px] text-[--Brand-Pure-White]">
                                {getLabel("lookup_VIN")}
                              </Text>
                            </Button>
                          )}
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* Divider */}
            <Box className="w-px bg-gray-200" />

            {/* Right Column */}
            <Box className="flex w-[450px] flex-col justify-between py-8 pl-2">
              {/* Step Indicator */}
              <Box className="">
                <OGStepper />
              </Box>

              {/* Action Buttons */}
              {renderDesktopActionButton()}
            </Box>
          </Box>

          {/* Footer for Mobile and Tablet */}
          <SearchFooter
            onQuickSearch={handleQuickSearch}
            onAdvancedSearch={handleAdvancedSearch}
            onSearchByVin={handleSearchByVin}
            handleAddEditCarToEB={handleAddEditCarToEB}
            isAddEditCarToEBDisabled={isAddToEBDisabled()}
          />
        </Box>
      </Box>
      <ConfirmDuplicateCarModal onConfirm={handleSaveAnyway} errorMessage={errorMessage} />
    </Box>
  );
};
