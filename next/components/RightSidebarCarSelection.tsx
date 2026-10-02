"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { CrossIconModal } from "@/components/icons/CrossIconModal";
import CarInfoModalInput from "@/components/CarInfoModalInput";
import { useBranding } from "@/contexts/BrandingContext";
import { useNewMmeCarFilters } from "@/hooks/useNewMmeCarFilters";
import {
  FIELD_CONFIG,
  type VisibleField,
  getNewMmeDropdownLabelClass,
  isMmeFieldEnabled,
  optionsForField,
} from "@/lib/newMmeFilters";
import RightSidebarCarSelectionSkeleton from "@/components/RightSidebarCarSelectionSkeleton";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import type { NewMmeOption } from "@/stores/useNewMmeStore";
import GreenCrossIcon from "@/assets/GreenCrossIcon";
import LeftGreenArrowIcon from "@/components/icons/LeftGreenArrowIcon";
import DeleteCarConfirmModal from "@/components/DeleteCarConfirmModal";
import { useModalStore } from "@/stores/useModalStore";
import { useDeleteCarFromEB } from "@/hooks/garage";
import {
  getEditingSearchedCarId,
  removeSearchedCarId,
  shouldUseSessionCarHistory,
} from "@/utils/searchedCarIdsSession";
import { useHeroCarsPanel } from "@/hooks/useHeroCarsPanel";
import { HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

type RightSidebarCarSelectionProps = {
  isOpen: boolean;
};

export type HeroCarDataItem = {
  id: string;
  carId: string;
  title: string;
  subtitle?: string;
};

type HeroCarDataCardProps = {
  cars: HeroCarDataItem[];
  onOpenOtherCar: () => void;
  onFindCarParts: (carId: string) => void;
  onDeleteCar?: (item: HeroCarDataItem) => void | Promise<void>;
  onEditCar?: (item: HeroCarDataItem) => void;
};

export default function RightSidebarCarSelection({ isOpen }: RightSidebarCarSelectionProps) {
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hideRightSidebar, listingPrefillCarsApiId, editingCarsApiId, editingMyCarRecordId } =
    useRightSidebarStore();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileSheetHeight, setMobileSheetHeight] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [carToDelete, setCarToDelete] = useState<HeroCarDataItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openModal, closeModal } = useModalStore();
  const { isAuthenticated, authUser } = useAuthStore();
  const { mutateAsync: deleteGarageCarAsync } = useDeleteCarFromEB();
  const garageUserId = (authUser as { id?: string } | null)?.id ?? null;
  const { heroCars, isHeroPanelLoading, refreshSessionCarIds } = useHeroCarsPanel();
  const handleDeleteHeroCar = useCallback(
    async (item: HeroCarDataItem) => {
      if (shouldUseSessionCarHistory(isAuthenticated)) {
        removeSearchedCarId(item.id);
        refreshSessionCarIds();
        // Other mounted useHeroCarsPanel() instances (e.g. the home page hero widget)
        // hold their own local copy of the session car list, so nudge them to re-read
        // sessionStorage too — otherwise they only refresh on a full page reload.
        window.dispatchEvent(new Event(HERO_CARS_REFRESH_EVENT));
        return;
      }
      if (!item.id) return;
      await deleteGarageCarAsync(item.id);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.garage.savedCars(garageUserId),
        refetchType: "all",
      });
    },
    [deleteGarageCarAsync, garageUserId, isAuthenticated, queryClient, refreshSessionCarIds],
  );

  const openDeleteModal = (car: HeroCarDataItem) => {
    setCarToDelete(car);
    openModal();
  };

  const closeDeleteModal = () => {
    closeModal();
    setCarToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;
    setIsDeleting(true);
    try {
      await handleDeleteHeroCar(carToDelete);
      closeDeleteModal();
      // Keep outbound nav (header L1–L3, footer, etc.) in sync with cleared selection.
      useLandingHeroCarStore.getState().setSelectedCarsApiId(null);
      const nextParams = new URLSearchParams(searchParams?.toString() || "");
      const hadCarParams = nextParams.has("carIds") || nextParams.has("makeModelTypeId");
      nextParams.delete("carIds");
      nextParams.delete("makeModelTypeId");
      if (hadCarParams && pathname) {
        const query = nextParams.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      }
      hideRightSidebar();
    } catch (err) {
      // Keep the modal open on failure so the user can see it didn't work and retry.
      console.error("Failed to delete car", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Mirrors HeroCarDataCard's `selectedCar` memo: resolve the car object once, then the
  // delete action is just `openDeleteModal(car)`, same as HeroSavedCarSlide's onRequestDelete.
  const currentEditingCar = useMemo<HeroCarDataItem | null>(() => {
    const carApiId =
      editingCarsApiId?.trim() ||
      listingPrefillCarsApiId?.trim() ||
      getEditingSearchedCarId() ||
      "";

    if (shouldUseSessionCarHistory(isAuthenticated)) {
      if (!carApiId) return null;
      return (
        heroCars.find((c) => c.carId === carApiId || c.id === carApiId) ?? {
          id: carApiId,
          carId: carApiId,
          title: "",
        }
      );
    }

    // `editingMyCarRecordId` isn't always populated by the listing/SRP edit flow,
    // so fall back to resolving the garage record id from the already-loaded heroCars list.
    const match = heroCars.find(
      (c) => (carApiId && c.carId === carApiId) || c.id === editingMyCarRecordId?.trim(),
    );
    const recordId = match?.id || editingMyCarRecordId?.trim() || "";
    if (!recordId) return null;
    return match ?? { id: recordId, carId: carApiId, title: "" };
  }, [editingCarsApiId, editingMyCarRecordId, heroCars, isAuthenticated, listingPrefillCarsApiId]);

  const handleRemoveCarClick = () => {
    if (currentEditingCar) openDeleteModal(currentEditingCar);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function updateHeight() {
      setMobileSheetHeight(Math.round(window.innerHeight * 0.82));
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (!isOpen && isHelpModalOpen) {
      setIsHelpModalOpen(false);
    }
  }, [isOpen, isHelpModalOpen]);

  useEffect(() => {
    if (!isHelpModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsHelpModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isHelpModalOpen]);

  const {
    isFeatureEnabled,
    selected,
    options,
    isLoading,
    loadingCarDetails,
    error,
    openDropdown,
    setOpenDropdown,
    searchText,
    setSearchText,
    visibleFields,
    isCtaDisabled,
    handleSelect,
    handleReset,
    handlePrimaryCta,
    isHeroSaveMode,
    isSaving,
    isPrefillLoading,
  } = useNewMmeCarFilters({ enabled: isOpen });

  const getLabelText = useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  const isFieldDisabled = useCallback(
    (field: VisibleField): boolean => {
      if (isPrefillLoading || isLoading || loadingCarDetails) return true;
      return !isMmeFieldEnabled(field, visibleFields, selected);
    },
    [isLoading, isPrefillLoading, loadingCarDetails, selected, visibleFields],
  );

  const dropdownOptions = useCallback(
    (field: VisibleField): NewMmeOption[] => {
      return optionsForField(field, options).filter((option) =>
        option.value.toLowerCase().includes((searchText[field] || "").toLowerCase()),
      );
    },
    [options, searchText],
  );

  // Mobile drawer: measure room around trigger, flip popup up/down, cap height so
  // the list scrolls inside the sheet (desktop sidebar keeps fixed max-h-52).
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const middleAreaRef = useRef<HTMLDivElement | null>(null);
  const [openDropdownDirection, setOpenDropdownDirection] = useState<"up" | "down">("down");
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(208);
  const POPUP_MAX_HEIGHT = 208; // max-h-52
  const POPUP_MIN_HEIGHT = 120;
  const POPUP_GAP = 8;

  const handleTriggerClick = useCallback(
    (field: VisibleField) => {
      const willOpen = openDropdown !== field;
      if (willOpen) {
        const triggerEl = triggerRefs.current[field];
        const containerEl = middleAreaRef.current;
        if (triggerEl && containerEl) {
          const triggerRect = triggerEl.getBoundingClientRect();
          const containerRect = containerEl.getBoundingClientRect();
          const spaceBelow = containerRect.bottom - triggerRect.bottom - POPUP_GAP;
          const spaceAbove = triggerRect.top - containerRect.top - POPUP_GAP;
          const openUp = spaceBelow < POPUP_MAX_HEIGHT && spaceAbove > spaceBelow;
          setOpenDropdownDirection(openUp ? "up" : "down");

          const available = openUp ? spaceAbove : spaceBelow;
          setDropdownMaxHeight(Math.min(POPUP_MAX_HEIGHT, Math.max(available, POPUP_MIN_HEIGHT)));
        } else {
          setOpenDropdownDirection("down");
          setDropdownMaxHeight(POPUP_MAX_HEIGHT);
        }
      }
      setOpenDropdown((prev) => (prev === field ? null : field));
    },
    [openDropdown, setOpenDropdown],
  );

  const renderDropdownOptions = (field: VisibleField, filteredOptions: NewMmeOption[]) => {
    if (filteredOptions.length === 0) {
      return (
        <p className="px-3 py-3 text-xs text-color-text-body">
          {getLabelText("new_mme_no_data", "No data")}
        </p>
      );
    }

    return filteredOptions.map((option) => (
      <button
        key={option.key}
        type="button"
        className="flex w-full items-center gap-2 border-b border-color-background-emphasis p-2 text-left text-sm last:border-b-0 hover:bg-[#e3e9e7]"
        onClick={() => void handleSelect(field, option.key)}
      >
        {selected[field] === option.key ? (
          <span className="text-color-border-focus">✓</span>
        ) : (
          <span className="inline-block w-3" />
        )}
        {option.value}
      </button>
    ));
  };

  const renderDropdownSearch = (
    field: VisibleField,
    config: (typeof FIELD_CONFIG)[VisibleField],
  ) => (
    <input
      value={searchText[field] || ""}
      onChange={(e) => setSearchText((prev) => ({ ...prev, [field]: e.target.value }))}
      placeholder={getLabelText(config.labelKey, config.fallbackLabel)}
      className="w-full rounded border border-color-background-emphasis p-2 text-sm focus:outline-none focus:ring-1 focus:ring-color-border-focus"
    />
  );

  const isEditCarHeader = isHeroSaveMode || Boolean(listingPrefillCarsApiId?.trim());
  const headerTitle = isEditCarHeader
    ? getLabelText("edit_car", "Edit Car")
    : getLabelText("homepage_select_your_car_mme_modal_title", "Car Selection");
  //
  if (!isFeatureEnabled) {
    return null;
  }

  return (
    <Box className="flex h-full min-h-0 w-full flex-col">
      <Box className="flex w-full flex-shrink-0 flex-row items-center justify-between border-b border-color-border-default pb-4">
        <Box className="flex flex-row items-center justify-start gap-space-xs">
          <OGButton type="ghost" onClick={hideRightSidebar}>
            <GreenCrossIcon className="h-[24px] w-[24px] text-button-ghost-icon" />
          </OGButton>
          <Typography className="text-center text-color-text-emphasis typography-heading-03">
            {headerTitle}
          </Typography>
        </Box>
        {/* <button>{getLabelText("reset", "Reset")}</button> */}

        {isEditCarHeader ? (
          <OGButton
            type="ghost"
            className="text-color-primary-default whitespace-nowrap text-right text-sm font-medium"
            size="medium"
            onClick={handleRemoveCarClick}
            disabled={isLoading || loadingCarDetails || isPrefillLoading}
          >
            {getLabelText("vehicle_remove_car", "Remove Car")}
          </OGButton>
        ) : (
          <OGButton
            type="ghost"
            className="text-color-primary-default min-w-[3rem] text-right text-sm font-medium"
            onClick={() => void handleReset()}
            disabled={isLoading || loadingCarDetails || isPrefillLoading}
          >
            {getLabelText("reset", "Reset")}
          </OGButton>
        )}
      </Box>

      <Box
        ref={middleAreaRef as React.RefObject<any>}
        className="base:custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden py-4 base:overflow-y-auto base:overscroll-contain gtsm:overflow-y-hidden"
      >
        {isPrefillLoading ? (
          <RightSidebarCarSelectionSkeleton />
        ) : (
          visibleFields.map((field) => {
            const config = FIELD_CONFIG[field];
            const selectedValue = selected[field];
            const selectedOption = optionsForField(field, options).find(
              (opt) => opt.key === selectedValue,
            );
            const disabled = isFieldDisabled(field);
            const filteredOptions = dropdownOptions(field);
            const hasSelection = Boolean(selectedValue && selectedOption);

            return (
              <div key={field} className="relative">
                <button
                  ref={(el) => {
                    triggerRefs.current[field] = el;
                  }}
                  type="button"
                  disabled={disabled}
                  className={`flex w-full items-center justify-between rounded-md border bg-color-background-default px-3 py-3 text-left ${
                    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  } ${!selectedOption?.value && !disabled && "border-color-border-focus"}`}
                  onClick={() => handleTriggerClick(field)}
                >
                  <span className={getNewMmeDropdownLabelClass(hasSelection, "sm")}>
                    {selectedOption?.value ||
                      getLabelText(config.placeholderKey, config.fallbackPlaceholder)}
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-color-text-body transition-transform duration-200 ${
                      openDropdown === field ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openDropdown === field && !disabled && (
                  <>
                    <div
                      className="fixed inset-0 z-[1] base:fixed base:inset-0 gtsm:absolute gtsm:-m-[9999px]"
                      aria-hidden
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div
                      className={`absolute left-0 right-0 z-[62] flex max-h-56 flex-col overflow-hidden rounded-md border border-color-background-emphasis bg-[#dee4e2] shadow-lg base:flex gtsm:hidden ${
                        openDropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"
                      }`}
                      // style={{
                      //   maxHeight: dropdownMaxHeight,
                      //   WebkitOverflowScrolling: "touch",
                      //   touchAction: "pan-y",
                      // }}
                    >
                      <div className="shrink-0 border-b border-color-background-emphasis bg-[#dee4e2] p-2">
                        {renderDropdownSearch(field, config)}
                      </div>
                      <div
                        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          touchAction: "pan-y",
                        }}
                      >
                        {renderDropdownOptions(field, filteredOptions)}
                      </div>
                    </div>
                    <div
                      className={`custom-scrollbar absolute left-0 right-0 z-[62] hidden max-h-56 overflow-y-scroll rounded-md border border-color-background-emphasis bg-[#dee4e2] shadow-lg gtsm:block ${
                        openDropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"
                      }`}
                    >
                      <div className="sticky top-0 border-b border-color-background-emphasis bg-[#dee4e2] p-2">
                        {renderDropdownSearch(field, config)}
                      </div>
                      {renderDropdownOptions(field, filteredOptions)}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}

        {error && !isPrefillLoading && <p className="text-xs text-red-600">{error}</p>}
      </Box>

      <Box className="flex-shrink-0 border-t border-color-border-default pt-4">
        {isPrefillLoading ? (
          <Box
            className="animate-pulse h-10 w-full rounded-md bg-color-background-emphasis"
            aria-hidden
          />
        ) : (
          <Box className="flex w-full flex-col items-center justify-start gap-space-xs">
            <OGButton
              type="primary"
              className="w-full"
              disabled={isCtaDisabled}
              onClick={handlePrimaryCta}
            >
              {isLoading || loadingCarDetails || isSaving ? (
                `${getLabelText("loading", "Loading")}...`
              ) : isHeroSaveMode ? (
                getLabelText("save", "Save")
              ) : isCtaDisabled ? (
                getLabelText(
                  "mme_cta_select_vehicle_details_to_proceed",
                  "Finish selecting vehicle",
                )
              ) : (
                <>
                  <span className="gtsm:hidden">
                    {getLabelText("find_car_parts", "Find car parts")}
                  </span>
                  <span className="hidden gtsm:inline">
                    {getLabelText("find_car_parts", "Find car parts")}
                  </span>
                </>
              )}
            </OGButton>

            <OGButton type="ghost" className="w-full" onClick={() => setIsHelpModalOpen(true)}>
              {getLabel("cant_find_your_car")}
            </OGButton>
          </Box>
        )}
      </Box>

      {isMounted &&
        isHelpModalOpen &&
        createPortal(
          <Box data-right-sidebar-help-modal className="fixed inset-0 z-[70]">
            <Box
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsHelpModalOpen(false)}
            />

            <Box
              style={
                {
                  ...(mobileSheetHeight !== null
                    ? { maxHeight: mobileSheetHeight, minHeight: mobileSheetHeight }
                    : {}),
                } as any
              }
              className="absolute bottom-0 left-0 right-0 flex w-full flex-col gap-space-md overflow-hidden rounded-t-3xl border border-[--humburger-white] bg-color-background-default px-space-xs pb-[calc(20px+env(safe-area-inset-bottom))] pt-space-xs shadow-lg base:flex gtsm:hidden"
              //@ts-ignore
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Box className="flex w-full shrink-0 items-center justify-center p-space-2xs">
                <Box className="h-1 w-16 rounded-lg bg-color-icon-default" />
              </Box>

              <Box className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <Box className="flex h-11 max-h-11 w-full shrink-0 flex-row items-center border-b border-color-border-default">
                  <Box className="flex flex-row items-center gap-space-xs px-space-2xs base:mb-2 gtsm:mb-0">
                    <Box
                      className="cursor-pointer p-[10px]"
                      //@ts-ignore
                      onClick={() => setIsHelpModalOpen(false)}
                    >
                      <LeftGreenArrowIcon className="h-6 w-6 text-button-ghost-icon" />
                    </Box>
                    <Typography className="text-color-text-emphasis typography-heading-04">
                      {getLabel("car_info_modal")}
                    </Typography>
                  </Box>
                </Box>

                <CarInfoModalInput
                  variant="drawer"
                  onSuccess={() => setIsHelpModalOpen(false)}
                  className="min-h-0 w-full flex-1"
                />
              </Box>
            </Box>

            <Box className="absolute inset-0 hidden items-center justify-center p-4 gtsm:flex">
              <Box
                className="relative w-full max-w-xl overflow-hidden rounded-[8px] bg-color-background-default shadow-xl"
                //@ts-ignore
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Box className="flex w-full flex-row items-center justify-between border-b border-color-border-default px-6 py-4">
                  <Typography className="text-color-text-emphasis typography-heading-03">
                    {getLabel("car_info_modal")}
                  </Typography>
                  <Box
                    className="cursor-pointer rounded-md bg-color-background-default p-2 hover:bg-color-background-emphasis"
                    //@ts-ignore
                    onClick={() => setIsHelpModalOpen(false)}
                  >
                    <CrossIconModal className="h-6 w-6 text-color-text-emphasis" />
                  </Box>
                </Box>
                <Box className="flex w-full justify-center">
                  <CarInfoModalInput
                    onSuccess={() => setIsHelpModalOpen(false)}
                    className="w-full max-w-full gtsm:w-full gtlg:w-full"
                  />
                </Box>
              </Box>
            </Box>
          </Box>,
          document.body,
        )}

      <DeleteCarConfirmModal
        isOpen={Boolean(carToDelete)}
        isDeleting={isDeleting}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
