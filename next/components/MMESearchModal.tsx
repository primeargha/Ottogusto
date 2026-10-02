"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { OGButton } from "@/components/og-components/OGButton";
import { useMmeStore } from "@/stores/useMmeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import MMESearchFilter from "./MMESearchFilter";
import VINSearchInput from "./VINSearchInput";
import { X } from "lucide-react-native";
import { useRouter, useParams, usePathname } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useAddUpdateMyCarsToEB } from "@/hooks/garage";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { OGAlert } from "@/components/og-components/OGAlert";
import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import placeHolderImg from "@/assets/placeholdercar.svg";
import { getMMEId } from "@/utils/getMMEId";
import { useMedia } from "@/hooks/useMedia";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { OGCheckboxInput } from "./og-components/OGCheckboxInput";
import ConfirmDuplicateCarModal from "./ConfirmDuplicateCarModal";
import { useConfirmDuplicateCarStore } from "@/stores/useConfirmDuplicateCarStore";
import { useBranding } from "@/contexts/BrandingContext";

export default function MMESearchModal({ refetch, cars }: { refetch?: () => void; cars?: any[] }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { selectedCar } = useSelectedCarStore();
  // ✅ Use SavedCarsContext instead of React Query (prevents duplicate API calls)
  const { savedCars: savedCarListData, refreshSavedCars } = useSavedCars();
  const {
    isMmeModalOpen,
    mmeModalStep,
    entryMmeModalStep,
    searchMode,
    searchData,
    carByVinResults,
    saveCarToGarage,
    closeMmeModal,
    setMmeModalStep,
    setSaveCarToGarage,
    addToPreviousSearches,
    isEB,
    ebMode,
    setIsEB,
    setEbMode,
    isEditFromLandingPage,
    setIsEditFromLandingPage,
    setSelectedSavedCarInLandingPage,
  } = useMmeStore();
  const {
    openModal: openConfirmDuplicateCarModal,
    isOpen: isConfirmDuplicateCarModalOpen,
    closeModal: closeConfirmDuplicateCarModal,
    errorMessage,
    setErrorMessage,
  } = useConfirmDuplicateCarStore();
  const { getLabel, getLocale } = useBranding();
  // Hook for saving car to garage
  const {
    mutate: addUpdateMyCarsToEB,
    mutateAsync: addUpdateMyCarsToEBAsync,
    isPending: isSavingCar,
  } = useAddUpdateMyCarsToEB({
    onSuccess: async (data: any) => {
      if (isConfirmDuplicateCarModalOpen) {
        closeConfirmDuplicateCarModal();
      }
      if (isMmeModalOpen) {
        handleCloseModal();
      }

      // Refresh saved cars and set selected car to first from GET response
      const result = await refreshSavedCars();
      const cars = result?.data?.data;
      if (Array.isArray(cars) && cars.length > 0) {
        setSelectedSavedCarInLandingPage(cars[0]);
      }

      // Call refetch function if provided (for backward compatibility)
      if (refetch) {
        refetch();
      }

      if (isEB && savedCarListData && savedCarListData?.length === 0) {
        // means First Car Add so redirect to "/garage-bay/my-saved-cars/"
        const url = getRouteLocaleString(Routes.mySavedCars, params);
        router.push(url);
      }
    },
    onError: (error: any) => {
      if (
        error?.response?.data?.status === 409 &&
        error?.response?.data?.title === "Duplicate Car"
      ) {
        // if the modal is already open, don't open it again
        if (isConfirmDuplicateCarModalOpen) {
          setErrorMessage(error?.response?.data?.title);
          return;
        }
        if (!isConfirmDuplicateCarModalOpen) {
          setMmeModalStep(3);
          openConfirmDuplicateCarModal();
        }
      }
    },
  });
  const isMobile = useMedia("(max-width: 639px)");
  const isSmallMobile = useMedia("(max-width: 380px)");

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isMmeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMmeModalOpen]);

  // ✅ Use saved cars data from context (no need for local state or useEffect)
  const savedCarsData = savedCarListData || [];

  // ============================================================================
  // SECTION: BUTTON TEXT LOGIC
  // ============================================================================

  // Determine the button text based on authentication, saved cars status, and Engine Bay mode
  const getStep1ButtonText = () => {
    if (isEditFromLandingPage) {
      return getLabel("Edit_car_savechanges");
    }
    // If in Engine Bay edit mode, always show "Select car"
    if (isEB && ebMode === "edit") {
      return getLabel("pick_select_car");
    }

    if (!isAuthenticated) {
      return getLabel("pick_select_car"); // Not authenticated - show "Select car"
    }

    // Authenticated user - check if they have saved cars
    if (savedCarsData.length === 0) {
      return getLabel("pick_select_car"); // No saved cars - show "Select car"
    } else {
      return getLabel("add_car"); // Has saved cars - show "Add car"
    }
  };

  if (!isMmeModalOpen) return null;

  // Get car data for display
  const getCarData = () => {
    if (searchMode === "vin" && carByVinResults.length > 0) {
      return {
        make: carByVinResults[0]?.brand || "",
        model: carByVinResults[0]?.model || "",
        engine: carByVinResults[0]?.engine || "",
        image: carByVinResults[0]?.image || "",
      };
    } else {
      return {
        make: searchData.make?.value || "",
        model: searchData.model?.value || "",
        engine: searchData.engine?.value || "",
        image:
          searchData.engine?.originalData?.image || searchData.model?.originalData?.image || "",
      };
    }
  };

  const carData = getCarData();

  // Format car display string
  const formatCarDisplay = () => {
    const parts = [carData.make, carData.model, carData.engine].filter(Boolean);
    return parts.join(" ").toUpperCase();
  };

  const handleBack = () => {
    if (mmeModalStep <= entryMmeModalStep) {
      handleCloseModal();
      return;
    }
    setMmeModalStep(mmeModalStep - 1);
  };

  const handleEditCar = () => {
    // Switch to manual search mode and go to step 1
    useMmeStore.getState().setSearchMode("manually");
    setMmeModalStep(1);
  };

  const handleEnterVin = () => {
    // Switch to VIN search mode and go to step 1
    useMmeStore.getState().setSearchMode("vin");
    setMmeModalStep(1);
  };

  const handleConfirm = async ({ nameChange }: { nameChange?: string } = {}) => {
    const isConfirmPopupEnabled = getClientFeatureFlag("confirm_car_popup_feature_flag");
    const isEditFlow = isEditFromLandingPage || (isEB && ebMode === "edit");
    const isFromMySavedCarsPage = pathname?.includes("/my-saved-cars");

    // No-confirm mode: skip checkbox dependency and execute action directly.
    if (!isConfirmPopupEnabled) {
      // Get makeModelTypeId using current MME selection
      let makeModelTypeId: string | null = null;
      if (searchData.engine?.key) {
        makeModelTypeId = searchData.engine.key;
      } else if (searchData.model?.key) {
        makeModelTypeId = searchData.model.key;
      } else if (searchData.make?.key) {
        makeModelTypeId = searchData.make.key;
      }

      /** Landing "Other Car" add: has saved cars in slider — stay on landing after save, no catalog redirect */
      const isLandingOtherCarAdd = !isEditFlow && !isEB && (cars?.length ?? 0) > 0;

      const carName = formatCarDisplay();
      const requestBody = {
        makeModelTypeId,
        name: nameChange || carName,
        year: searchData.engine?.originalData?.yearFrom || null,
        isNew: isEditFlow || isFromMySavedCarsPage ? false : true,
        ...(isEditFlow && { id: (selectedCar as any)?.id }),
      };

      if (isAuthenticated && getClientFeatureFlag("saved_car_feature_flag") && makeModelTypeId) {
        if (isLandingOtherCarAdd) {
          try {
            await addUpdateMyCarsToEBAsync(requestBody as any);
            // Success: mutation onSuccess closes modal, refreshSavedCars, setSelectedSavedCarInLandingPage
          } catch {
            // Failure: keep modal open (duplicate 409 is handled in mutation onError)
          }
          return;
        }
        addUpdateMyCarsToEB(requestBody as any);
      }

      // Add flow (e.g. hero with no saved cars): redirect to category catalog; guest path closes after navigation
      if (!isEditFlow) {
        const mmeIdForUrl = getMMEId();
        let url = getRouteLocaleString(Routes.categorySelection, params);
        if (mmeIdForUrl) {
          url += `?makeModelTypeId=${mmeIdForUrl}`;
        }
        router.push(url);
        handleCloseModal();
      }

      return;
    }

    // Add to previous searches
    // addToPreviousSearches();
    // Handle save to garage if checkbox is checked
    if (saveCarToGarage && isAuthenticated && getClientFeatureFlag("saved_car_feature_flag")) {
      try {
        // Get car data from MME store
        const carName = formatCarDisplay();

        // Get the highest level MME ID for saving
        let makeModelTypeId: string | null = null;
        if (searchData.engine?.key) {
          makeModelTypeId = searchData.engine.key;
        } else if (searchData.model?.key) {
          makeModelTypeId = searchData.model.key;
        } else if (searchData.make?.key) {
          makeModelTypeId = searchData.make.key;
        }

        // Only proceed if we have a valid makeModelTypeId
        if (makeModelTypeId) {
          // Prepare request body for garage API
          const requestBody = {
            makeModelTypeId: makeModelTypeId,
            name: isConfirmDuplicateCarModalOpen ? nameChange : carName,
            year: searchData.engine?.originalData?.yearFrom || null, // Include yearFrom from engine data
            isNew: (isEB && ebMode === "edit") || isFromMySavedCarsPage ? false : true, // false for edit mode or my-saved-cars page, true for add mode
            ...(isEB && ebMode === "edit" && { id: (selectedCar as any)?.id }), // Add id for edit mode
          };

          addUpdateMyCarsToEB(requestBody as any);
        } else {
          console.warn("⚠️ No valid makeModelTypeId found for saving car");
        }
      } catch (error) {
        console.error("Error saving car to garage:", error);
      }
    }

    // Close modal and navigate similar to handleFindCarParts logic
    // For both VIN and Manual flows, proceed to categories search page
    if (!isEditFromLandingPage && isEB && getClientFeatureFlag("saved_car_feature_flag")) {
      const url = getRouteLocaleString(Routes.mySavedCars, params);
      router.push(url);
    }
    if (
      (cars && cars?.length <= 0) ||
      !getClientFeatureFlag("saved_car_feature_flag") ||
      (!isEB && (!isAuthenticated || (isAuthenticated && !saveCarToGarage)))
    ) {
      // Get makeModelTypeId and append to URL for categorySelection page
      const makeModelTypeId = getMMEId();
      let url = getRouteLocaleString(Routes.categorySelection, params);

      // Append makeModelTypeId to URL if available
      if (makeModelTypeId) {
        url += `?makeModelTypeId=${makeModelTypeId}`;
      }

      router.push(url);
      handleCloseModal();
    }

    //  handleCloseModal();
  };

  const handleContinue = () => {
    // Check if we have enough data to proceed to confirm step
    const isConfirmPopupEnabled = getClientFeatureFlag("confirm_car_popup_feature_flag");

    if (!isConfirmPopupEnabled && canContinue()) {
      handleConfirm();
      return;
    }

    if (searchMode === "vin" && carByVinResults.length > 0) {
      setMmeModalStep(2);
    } else if (
      searchMode === "manually" &&
      searchData.make &&
      searchData.model &&
      searchData.engine
    ) {
      setMmeModalStep(2);
    }
  };

  const canContinue = () => {
    if (searchMode === "vin") {
      return carByVinResults.length > 0;
    } else {
      return searchData.make && searchData.model && searchData.engine;
    }
  };

  // Enhanced close modal function that resets all states
  const handleCloseModal = () => {
    // Reset search mode to default "manually"
    useMmeStore.getState().setSearchMode("manually");

    // Reset Engine Bay properties to default values
    setIsEB(false);
    setEbMode("add");
    setIsEditFromLandingPage(false);

    // Close the modal
    closeMmeModal();
  };
  const handleSaveAnyway = (name: string) => {
    handleConfirm({ nameChange: name });
    // closeDuplicateCarModal();
    // handleAddEditCarToEB();
  };
  if (mmeModalStep === 3) {
    return <ConfirmDuplicateCarModal onConfirm={handleSaveAnyway} errorMessage={errorMessage} />;
  }
  return (
    <>
      <Box className="">
        <Box
          className={`fixed inset-0 z-[100] flex bg-black bg-opacity-50 ${isMobile ? "" : "items-center justify-center p-4"}`}
        >
          <Box
            className={`z-[10000] flex w-full flex-col bg-color-background-l2 shadow-xl ${isMobile ? "h-[100dvh]" : "max-w-2xl rounded-lg"}`}
          >
            {/* Header */}
            <Box className={`border-b border-dotted border-purple-200 px-6 py-4`}>
              <Box className="flex flex-row items-center justify-between">
                <Text className="text-color-text-body body-bold-lg">
                  {mmeModalStep === 1 && !isEditFromLandingPage
                    ? getLabel("search_by_car")
                    : isEditFromLandingPage
                      ? getLabel("Edit_car_details")
                      : getLabel("confirm_car_details")}
                </Text>

                <button onClick={handleCloseModal} className="">
                  <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
                </button>
              </Box>
            </Box>

            {/* Content */}
            <Box
              className={`px-6 ${
                isMobile
                  ? isSmallMobile
                    ? "min-h-0 flex-1 overflow-y-auto py-6"
                    : "min-h-0 flex-1 overflow-y-auto py-8"
                  : "py-8"
              }`}
            >
              {mmeModalStep === 1 ? (
                // Step 1: Search
                <Box className="space-y-6">
                  {searchMode === "vin" ? <VINSearchInput /> : <MMESearchFilter />}
                </Box>
              ) : (
                // Step 2: Confirm
                <Box
                  className={`flex ${isMobile ? (isSmallMobile ? "" : "space-y-5") : "space-y-6"}`}
                >
                  {/* Car Image Section with Light Beige Background */}
                  <Box
                    className={`flex ${isMobile ? "h-auto min-h-[300px]" : "max-h-[382px] min-h-[380px]"} items-center justify-start gap-3 rounded-lg bg-color-background-l3 p-6`}
                  >
                    <Box className="flex flex-row items-center justify-center">
                      <Box className={`relative ${isMobile ? "h-40 w-40" : "h-full w-48"} `}>
                        {carData.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={carData.image}
                            alt="Car"
                            className="h-full w-full object-cover"
                            style={{
                              clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                            }}
                          />
                        ) : (
                          <Box className="flex h-full w-full items-center justify-center bg-white p-9 clip-top-left-bottom-right-key-features">
                            <Image
                              src={placeHolderImg}
                              alt={searchData.engine?.originalData?.image}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Car Details */}
                    <Box className="mt-4 flex flex-row items-center justify-center">
                      <Text className="text-center text-color-primary-main body-bold-lg">
                        {formatCarDisplay()}
                      </Text>
                    </Box>
                    <Box className="flex w-full flex-col items-center gap-1">
                      <Box className="text-color-text-body body-regular-sm">
                        {getLabel("image_for_reference_only")}.
                      </Box>
                      {getClientFeatureFlag("saved_car_feature_flag") && (
                        <Box className="text-color-text-body body-regular-sm">
                          {getLabel("you_can_still_personalize")}.
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Info alert for unauthenticated users */}
                  {getClientFeatureFlag("saved_car_feature_flag") && !isAuthenticated && (
                    <OGAlert
                      title="Info"
                      // description="You can search for car parts without an account. Sign in to save cars to your garage and access additional features."
                      description={getLabel("Confirmcar_popup_info")}
                      variant="info"
                      className="mx-auto mt-0 max-w-md"
                    />
                  )}

                  {/* Save Car Checkbox - Only show for authenticated users */}
                  {getClientFeatureFlag("saved_car_feature_flag") && !isEB && isAuthenticated && (
                    <Box className="flex h-auto flex-row items-end justify-start gap-1">
                      <OGCheckboxInput
                        selected={saveCarToGarage ? "yes" : "no"}
                        state="default"
                        label={getLabel("save_car_to_my_garage")}
                        onChange={(isSelected) => setSaveCarToGarage(isSelected)}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box
              className={`rounded-b-lg border-t border-color-background-l7 bg-color-background-l2 px-6 base:h-auto gtsm:h-auto ${
                isMobile ? "py-6" : "py-4"
              } flex-shrink-0`}
            >
              <Box
                className={`flex ${isMobile ? "flex-col" : "flex-row"} h-auto items-center justify-end`}
              >
                {mmeModalStep === 1 ? (
                  // Step 1: Simple back/continue layout
                  <Box className={`flex ${isMobile ? "w-full flex-col" : "flex flex-row"} gap-3`}>
                    <OGButton
                      type="outlined"
                      size="medium"
                      onClick={handleBack}
                      className={`${isMobile ? "order-2 min-h-11 w-full" : "order-1"}`}
                    >
                      {getLabel("cancel")}
                    </OGButton>
                    <OGButton
                      type="primary"
                      size="medium"
                      onClick={handleContinue}
                      disabled={!canContinue()}
                      className={`${isMobile ? "order-1 min-h-11 w-full" : "order-2"} text-white`}
                    >
                      {getStep1ButtonText()}
                    </OGButton>
                  </Box>
                ) : (
                  // Step 2: Complex layout with conditional buttons
                  <>
                    {searchMode === "vin" ? (
                      // VIN mode: Cancel on left, Edit car + Confirm car on right
                      <Box className="flex items-center justify-end">
                        <Text
                          className="cursor-pointer font-Overpass text-[14px] font-normal leading-[18px] text-color-text-body hover:text-[--brand-traffic-light-green-2]"
                          // @ts-ignore
                          onClick={handleCloseModal}
                        >
                          {getLabel("cancel")}
                        </Text>
                        <Box className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3`}>
                          <OGButton
                            type="outlined"
                            size="medium"
                            onClick={handleEditCar}
                            className="border-gray-300 bg-white text-gray-700"
                          >
                            {getLabel("edit_car")}
                          </OGButton>
                          <OGButton
                            type="primary"
                            size="medium"
                            onClick={handleConfirm}
                            className="text-white"
                            disabled={isSavingCar}
                          >
                            {isSavingCar
                              ? `${getLabel("saving")}...`
                              : getLabel("search_header_title_for_og_search")}
                          </OGButton>
                        </Box>
                      </Box>
                    ) : (
                      // Manual mode: Enter VIN number on left, Back + Confirm car on right
                      // confirm button block
                      <Box
                        className={`flex ${
                          isMobile
                            ? "flex-col items-center justify-center"
                            : "flex-row items-center justify-between"
                        } h-auto w-full gap-3`}
                      >
                        {isMobile ? (
                          <>
                            {/* Confirm first on mobile */}
                            <OGButton
                              type="primary"
                              size="medium"
                              onClick={handleConfirm}
                              className={`text-white ${isMobile ? "min-h-11 w-full" : ""}`}
                              disabled={isSavingCar}
                            >
                              {isSavingCar
                                ? `${getLabel("saving")}...`
                                : getLabel("search_header_title_for_og_search")}
                            </OGButton>

                            {/* Back second on mobile */}
                            <OGButton
                              type="outlined"
                              size="medium"
                              onClick={handleBack}
                              className={`${isMobile ? "min-h-11 w-full" : ""}`}
                            >
                              {getLabel("back")}
                            </OGButton>

                            {/* Text last on mobile */}
                            {getClientFeatureFlag("vin_feature_flag") ? (
                              <Text
                                className="flex min-h-11 cursor-pointer items-center underline body-regular-sm hover:text-color-primary-main"
                                // @ts-ignore
                                onClick={handleEnterVin}
                              >
                                {getLabel("enter_car_vin_number")}
                              </Text>
                            ) : (
                              ""
                            )}
                          </>
                        ) : (
                          <>
                            {/* Text first on desktop */}
                            {getClientFeatureFlag("vin_feature_flag") ? (
                              <Text
                                className="flex min-h-11 cursor-pointer items-center underline body-regular-sm hover:text-color-primary-main"
                                // @ts-ignore
                                onClick={handleEnterVin}
                              >
                                {getLabel("enter_car_vin_number")}
                              </Text>
                            ) : (
                              <Box></Box>
                            )}

                            {/* Back second on desktop */}
                            <Box className="flex flex-row gap-3">
                              <OGButton
                                type="outlined"
                                size="medium"
                                onClick={handleBack}
                                className={`${isMobile ? "min-h-11 w-full" : ""}`}
                              >
                                {getLabel("back")}
                              </OGButton>

                              {/* Confirm last on desktop */}
                              <OGButton
                                type="primary"
                                size="medium"
                                onClick={handleConfirm}
                                className={`text-white ${isMobile ? "min-h-11 w-full" : ""}`}
                                disabled={isSavingCar}
                              >
                                {isSavingCar
                                  ? `${getLabel("saving")}...`
                                  : getLabel("search_header_title_for_og_search")}
                              </OGButton>
                            </Box>
                          </>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
