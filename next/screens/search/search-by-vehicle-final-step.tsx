import React, { forwardRef, useEffect, useRef, useState } from "react";

import Image from "next/image";
import FinalStepCar from "@/assets/search/final-step-car.png";
import InformationSquare from "@/assets/search/information-square.svg";
import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import CarVerifiedIcon from "@/assets/og-search/checkmark-badge.svg";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthStore } from "@/stores/useAuthStore";
import { OGAlert } from "@/components/og-components/OGAlert";
import { OGButton } from "@/components/og-components/OGButton";
import CheckmarkBadgeTwo from "@/components/icons/CheckmarkBadgeTwo";
import Typography from "@/components/og-components/Typography";
// import { InfoCircle } from "lucide-react";

type EBSaveButtonProps = {
  pendingState: boolean;
  handleAddEditCarToEB: () => void;
  savedState: string | boolean;
  resetSavedState: () => void;
};

const EBSaveButton = forwardRef<HTMLButtonElement, EBSaveButtonProps>(
  ({ pendingState, handleAddEditCarToEB, savedState, resetSavedState }, ref) => {
    const { getLabel } = useBranding();
    const { carHash, setCarHash, getCarDataMMYTorVIN } = useSearchModalStore();

    useEffect(() => {
      const currentCarhash = getCarDataMMYTorVIN();
      if (currentCarhash !== carHash) {
        // reset saved state
        setCarHash(currentCarhash);
        resetSavedState();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // For Saved state
    if (savedState === "success") {
      return (
        <OGButton
          type="primary"
          size="medium"
          className="cursor-not-allowed base:mb-[12px] xs:mb-[24px]"
          leftcomp={<CheckmarkBadgeTwo />}
        >
          {getLabel("eb_new_car_btn_saved_state")}
        </OGButton>
      );
    }
    return (
      <>
        <OGButton
          ref={ref as any}
          type={pendingState ? "primary" : "outlined"}
          disabled={pendingState}
          size="medium"
          onClick={handleAddEditCarToEB}
          // className="inline-flex items-center justify-center"
          // className="base:mb-[12px] xs:mb-[24px]"
        >
          <Text className="font-Overpass font-[500] leading-[22px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
            {pendingState
              ? getLabel("eb_save_new_car_btn_saving_state")
              : getLabel("eb_save_new_car_btn")}{" "}
          </Text>
        </OGButton>
      </>
    );
  },
);

export default function SearchByVehicleFinalStep({
  handleAddEditCarToEB,
  pendingState,
  savingState,
  resetSavedState,
}: {
  handleAddEditCarToEB: () => void;
  pendingState: boolean;
  savingState: string | boolean;
  resetSavedState: () => void;
}) {
  const { getLabel } = useBranding();
  const { isAuthenticated } = useAuthStore();
  const {
    searchData,
    setSearchMode,
    isOgSearch,
    setIsCarVerified,
    isCarVerified,
    closeModal,
    carByVinResults,
    searchValue,
    resetSearch,
    vinValidation,
    closeOgSearchModal,
    setSearchData,
    setCurrentStep,
    setIsOgSearch,
    isEB,
  } = useSearchModalStore();
  const { openAdvSearch } = useAdvancedSearchStore();

  const handleChangeSearchMode = () => {
    setSearchMode("vin");
    closeOgSearchModal();

    //
    if (isOgSearch) {
      setCurrentStep(1);
      setIsOgSearch(false);
      // NOTE: no need to clear when not in OG search
      setSearchData({
        make: null,
        model: null,
        type: null,
        year: null,
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

    setIsCarVerified(false);
  };

  const handleVerifyWithMMYT = () => {
    setSearchMode("vehicle");
    resetSearch();
  };

  const handleYes = () => {
    setIsCarVerified(true);
  };

  return (
    <>
      {/* FOR only VIN SEARCH */}
      {vinValidation.isValid &&
      carByVinResults.length > 0 &&
      !searchData.make?.value &&
      !searchData.model?.value &&
      !searchData.type?.value &&
      !searchData.year?.value ? (
        <>
          <Box
            className={
              !isOgSearch
                ? `custom-scrollbar mx-auto flex w-full items-center gtlg:overflow-y-scroll`
                : "custom-scrollbar mx-auto flex w-full items-center gtlg:overflow-y-scroll"
            }
          >
            {/* Title */}
            <Typography
              type="h2"
              className="text-centertext-color-text-body mb-[12px] min-h-[38px]"
            >
              {getLabel("is_this_your_car")}
            </Typography>

            {/* Car Details */}
            <Box className="mb-[24px] min-h-[58px] text-center font-Overpass font-bold text-[--Primary-Colors-Main] [font-feature-settings:'liga'_off,'clig'_off] base:text-[20px] gtsm:text-[24px] gtsm:leading-[26px]">
              {carByVinResults[0]?.brand} {carByVinResults[0]?.model} {carByVinResults[0]?.type}{" "}
              {carByVinResults[0]?.year}
            </Box>

            {/* Buttons */}
            {isCarVerified ? (
              <Box className="mb-[24px] flex flex-row items-center justify-center gap-[10px] rounded-[4px] bg-[--Primary-Colors-Main] p-[12px]">
                <CheckmarkBadgeTwo />
                <Text className="mt-[4px] font-Overpass text-[20px] font-[500] leading-[22px] text-[--Brand-Pure-White]">
                  Verified
                </Text>
              </Box>
            ) : (
              <Box className="mx-auto mb-[24px] flex w-full max-w-md flex-row gap-3">
                <OGButton
                  onClick={handleYes}
                  type="outlined"
                  size="medium"
                  className="inline-flex items-center justify-center"
                >
                  <Text className="font-Overpass font-[500] leading-[20px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("yes")}
                  </Text>
                </OGButton>
                <OGButton
                  onClick={handleVerifyWithMMYT}
                  type="outlined"
                  size="medium"
                  className="flex-1"
                >
                  <Text className="font-Overpass font-[500] leading-[20px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("no_verify_with_vin_mmyt")}
                  </Text>
                </OGButton>
              </Box>
            )}

            {/* Car Image */}

            <Image
              src={FinalStepCar}
              alt="Alfa Romeo Car"
              className="mx-[51p.5x] my-[12px] object-contain"
              height={161}
              width={263}
            />

            {/* Image Caption */}
            <Box className="mb-[24px] min-h-[26px] text-center font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body [font-feature-settings:'liga'_off,'clig'_off]">
              {isEB
                ? getLabel("image_for_ref_only_caption_for_eb")
                : getLabel("image_for_ref_only_caption_for_search_by_car")}
            </Box>

            {/* Add to save car list */}
            {isAuthenticated && !isEB && (
              <EBSaveButton
                pendingState={pendingState}
                savedState={savingState}
                handleAddEditCarToEB={handleAddEditCarToEB}
                resetSavedState={resetSavedState}
              />
            )}

            {/* Info Box */}
            {!isEB && (
              <OGAlert
                iconSize={24}
                variant="info"
                title={getLabel("engine_bay_pro_tip")}
                description={getLabel("engine_bay_pro_tip_desc")}
                className="base:min-h-[84px] gtsm:min-h-0"
              />
            )}
          </Box>
        </>
      ) : carByVinResults.length > 0 &&
        (searchData.make?.value ||
          searchData.model?.value ||
          searchData.type?.value ||
          searchData.year?.value) ? (
        <>
          <Box
            className={
              !isOgSearch
                ? `custom-scrollbar mx-auto flex w-full flex-col items-center gtlg:overflow-y-scroll`
                : "custom-scrollbar mx-auto flex w-full flex-col items-center gtlg:overflow-y-scroll"
            }
          >
            {/* Title */}
            <Typography
              type="h2"
              className="mb-[12px] min-h-[38px] text-center text-color-text-body"
            >
              {getLabel("is_this_your_car")}
            </Typography>

            {/* Car Details */}
            <Box className="mb-[24px] min-h-[58px] text-center font-Overpass font-bold text-[--Primary-Colors-Main] [font-feature-settings:'liga'_off,'clig'_off] base:text-[20px] gtsm:text-[24px] gtsm:leading-[26px]">
              {carByVinResults[0]?.brand} {carByVinResults[0]?.model} {carByVinResults[0]?.type}{" "}
              {carByVinResults[0]?.year}
            </Box>

            {/* Buttons */}
            {isCarVerified ? (
              <Box className="mb-[24px] flex flex-row items-center justify-center gap-[10px] rounded-[4px] bg-[--Primary-Colors-Main] p-[12px]">
                <CheckmarkBadgeTwo />
                <Text className="mt-[4px] font-Overpass text-[20px] font-[500] leading-[22px] text-[--Brand-Pure-White]">
                  Verified
                </Text>
              </Box>
            ) : (
              <Box className="mx-auto mb-[24px] flex min-h-[44px] w-full max-w-md flex-row gap-3">
                <OGButton
                  onClick={handleYes}
                  type="outlined"
                  size="medium"
                  className="inline-flex items-center justify-center"
                >
                  <Text className="font-Overpass font-[500] leading-[22px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("yes")}
                  </Text>
                </OGButton>
                <OGButton
                  onClick={handleVerifyWithMMYT}
                  type="outlined"
                  size="medium"
                  className="flex-1"
                >
                  <Text className="font-Overpass font-[500] leading-[22px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("no_verify_with_vin_mmyt")}
                  </Text>
                </OGButton>
              </Box>
            )}

            {/* Car Image */}

            <Image
              src={FinalStepCar}
              alt="Alfa Romeo Car"
              className="mt-8 w-full object-contain"
              // height={161}
              // width={263}
            />

            {/* Image Caption */}
            <Box className="mb-[24px] min-h-[36px] text-center font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body [font-feature-settings:'liga'_off,'clig'_off]">
              {isEB
                ? getLabel("image_for_ref_only_caption_for_eb")
                : getLabel("image_for_ref_only_caption_for_search_by_car")}
            </Box>

            {/* Add to save car list */}
            {isAuthenticated && !isEB && (
              <EBSaveButton
                pendingState={pendingState}
                savedState={savingState}
                handleAddEditCarToEB={handleAddEditCarToEB}
                resetSavedState={resetSavedState}
              />
            )}

            {/* Info Box */}
            {!isEB && (
              <OGAlert
                iconSize={24}
                variant="info"
                title={getLabel("engine_bay_pro_tip")}
                description={getLabel("engine_bay_pro_tip_desc")}
                className="base:min-h-[84px] gtsm:min-h-0"
              />
            )}
          </Box>
        </>
      ) : (
        <>
          <Box
            className={
              !isOgSearch
                ? `custom-scrollbar mx-auto flex min-h-max w-full flex-col items-center gtlg:overflow-y-scroll`
                : "mx-auto flex min-h-max w-full flex-col items-center"
            }
          >
            {/* Title */}
            <Typography type="h2" className="mb-[12px] text-center text-color-text-body">
              {getLabel("is_this_your_car")}
            </Typography>

            {/* Car Details */}
            <Box className="mb-[24px] min-h-[58px] text-center font-Overpass font-bold text-[--Primary-Colors-Main] [font-feature-settings:'liga'_off,'clig'_off] base:text-[20px] gtsm:text-[24px] gtsm:leading-[26px]">
              {searchData?.make?.value} {searchData?.model?.value} {searchData?.type?.value}{" "}
              {searchData?.year?.value}
            </Box>

            {/* Buttons */}
            {isCarVerified ? (
              <Box className="flex min-h-[44px] flex-row items-center gap-[10px] rounded-[4px] bg-[--Primary-Colors-Main] p-[12px]">
                <CheckmarkBadgeTwo />
                <Text className="font-Overpass text-[18px] font-[500] leading-[20px] text-[--Brand-Pure-White]">
                  Verified
                </Text>
              </Box>
            ) : (
              <Box className="mx-auto mb-[24px] flex min-h-[44px] w-full max-w-md flex-row gap-3">
                <OGButton
                  onClick={handleYes}
                  type="outlined"
                  size="medium"
                  className="inline-flex items-center justify-center"
                >
                  <Text className="font-Overpass font-[500] leading-[22px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("yes")}
                  </Text>
                </OGButton>
                <OGButton
                  onClick={handleChangeSearchMode}
                  type="outlined"
                  size="medium"
                  className="flex-1"
                >
                  <Text className="font-Overpass font-[500] leading-[22px] text-[--Primary-Colors-Main] base:text-[18px] gtsm:text-[20px]">
                    {getLabel("no_verify_with_vin_no")}
                  </Text>
                </OGButton>
              </Box>
            )}

            {/* Car Image */}

            <Image
              src={FinalStepCar}
              alt="Alfa Romeo Car"
              className="mt-4 object-contain"
              height={161}
              width={263}
            />

            {/* Image Caption */}
            <Box className="mb-[24px] min-h-[36px] text-center font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body [font-feature-settings:'liga'_off,'clig'_off]">
              {isEB
                ? getLabel("image_for_ref_only_caption_for_eb")
                : getLabel("image_for_ref_only_caption_for_search_by_car")}
            </Box>

            {/* Add to save car list */}
            {isAuthenticated && !isEB && (
              <EBSaveButton
                pendingState={pendingState}
                savedState={savingState}
                handleAddEditCarToEB={handleAddEditCarToEB}
                resetSavedState={resetSavedState}
              />
            )}

            {/* Info Box */}
            {!isAuthenticated && !isEB && (
              <OGAlert
                iconSize={24}
                variant="info"
                title={getLabel("engine_bay_pro_tip")}
                description={getLabel("engine_bay_pro_tip_desc")}
                className="base:min-h-[84px] gtsm:min-h-0"
              />
            )}
          </Box>
        </>
      )}
    </>
  );
}
