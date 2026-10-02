"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import Typography from "@/components/og-components/Typography";
import { CrossIconModal } from "@/components/icons/CrossIconModal";
import CarInfoModalInput from "@/components/CarInfoModalInput";
import NewVinBrandUnsupportedSupportForm from "@/components/NewVinBrandUnsupportedSupportForm";
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
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useE2EVinFindCarParts } from "@/hooks/useE2EVinFindCarParts";
import { useE2ESidebarVinLiveSearch } from "@/hooks/useE2ESidebarVinLiveSearch";
import { useE2EVinUrlSync } from "@/hooks/useE2EVinUrlSync";
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
import {
  clearE2ESavedCarMeta,
  getE2ESavedCarVin,
  normalizeSavedCarVin,
} from "@/utils/e2eSavedCarMeta";
import {
  getVinSearchUnableSelectLabel,
  normalizeVinCarsToCarIds,
  resolveVinCarsSearchFailureUi,
  unwrapVinCarsSearchPayload,
} from "@/utils/e2eVinSearch";
import { fetchVinCarsSearch } from "@/hooks/vin";
import { useHeroCarsPanel } from "@/hooks/useHeroCarsPanel";
import { HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { shouldStayOnPathAfterCarApply } from "@/utils/detectPage";
import VinCheckCircleIcon from "./icons/VinCheckCircleIcon";
import { OGAlert } from "./og-components/OGAlert";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type NewRightSidebarCarSelectionProps = {
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

/**
 * E2E VIN flow copy of `RightSidebarCarSelection` (`New` prefix).
 * Desktop right sidebar + mobile drawer content when `end_to_end_vin_flow_feature_flag` is on.
 * Original component is unchanged and shown when the flag is off.
 */
export default function NewRightSidebarCarSelection({ isOpen }: NewRightSidebarCarSelectionProps) {
  useE2EVinUrlSync();
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    hideRightSidebar,
    listingPrefillCarsApiId,
    editingCarsApiId,
    editingMyCarRecordId,
    sidebarIntent,
  } = useRightSidebarStore();
  const vinNumber = useE2EVinSearchStore((s) => s.vinNumber);
  const setVinNumber = useE2EVinSearchStore((s) => s.setVinNumber);
  const sidebarVinError = useE2EVinSearchStore((s) => s.sidebarVinError);
  const setSidebarVinError = useE2EVinSearchStore((s) => s.setSidebarVinError);
  const sidebarVinBrandUnsupported = useE2EVinSearchStore((s) => s.sidebarVinBrandUnsupported);
  const setSidebarVinBrandUnsupported = useE2EVinSearchStore(
    (s) => s.setSidebarVinBrandUnsupported,
  );
  const vinResolvedCarIds = useE2EVinSearchStore((s) => s.vinResolvedCarIds);
  const clearVinResolvedCarIds = useE2EVinSearchStore((s) => s.clearVinResolvedCarIds);
  const clearVinForVehicleSearchEdit = useE2EVinSearchStore((s) => s.clearVinForVehicleSearchEdit);
  const setVinResolvedCarIds = useE2EVinSearchStore((s) => s.setVinResolvedCarIds);
  const setVinUrlHydrationSuppressed = useE2EVinSearchStore((s) => s.setVinUrlHydrationSuppressed);
  const mmeClearOnVinFailureNonce = useE2EVinSearchStore((s) => s.mmeClearOnVinFailureNonce);
  const { runVinFindCarParts, navigateVinCatalogSuccess, isVinFindPending } =
    useE2EVinFindCarParts();
  const { isSidebarVinLivePending } = useE2ESidebarVinLiveSearch(isOpen);
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
      clearE2ESavedCarMeta(item.carId || item.id);
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
      const hadVehicleParams =
        nextParams.has("carIds") || nextParams.has("makeModelTypeId") || nextParams.has("vin");
      nextParams.delete("carIds");
      nextParams.delete("makeModelTypeId");
      // Remove Car deletes the vehicle context — VIN search marker must go with carIds (doc §3.5 / §7).
      nextParams.delete("vin");
      if (hadVehicleParams && pathname) {
        const query = nextParams.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      }
      // Clear shared VIN UI so sidebar/banner do not keep a stale VIN after URL strip.
      setVinNumber("");
      setSidebarVinError(null);
      setSidebarVinBrandUnsupported(false);
      clearVinResolvedCarIds();
      setVinUrlHydrationSuppressed(false);
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

  // Sidebar close without Find:
  // - no `vin` in URL → clear VIN (typed-but-not-applied must not stick)
  // - URL still has `vin` → restore VIN from URL (user abandoned MME edit that cleared the field)
  useEffect(() => {
    if (isOpen) return;
    const urlVin = (searchParams?.get("vin") ?? "").trim().toUpperCase();
    if (!urlVin) {
      setVinNumber("");
      setSidebarVinError(null);
      clearVinResolvedCarIds();
      setVinUrlHydrationSuppressed(false);
      useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
      return;
    }

    const urlCarIds = parseCarIdsParam(searchParams?.get("carIds") ?? null);
    setVinUrlHydrationSuppressed(false);
    setVinNumber(urlVin);
    setSidebarVinError(null);
    setVinResolvedCarIds(urlCarIds);
  }, [
    clearVinResolvedCarIds,
    isOpen,
    searchParams,
    setSidebarVinError,
    setVinNumber,
    setVinResolvedCarIds,
    setVinUrlHydrationSuppressed,
  ]);

  // Edit only: hydrate VIN from URL, else from saved-car meta/Garage (homepage edit has no ?vin=).
  // Prefer GET /Vin/{vin} (same as typing) → vinPrefill → POST /Cars {vin}; skip GET /Cars/{id} flood.
  // Add new car / Other car use forceEmpty — skip. Do not copy URL `carIds` into vinResolved.
  const editVinHydratedForOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      editVinHydratedForOpenRef.current = false;
      return;
    }

    if (useRightSidebarStore.getState().forceEmptySidebar) return;

    const isListingOrHeroEdit =
      Boolean(listingPrefillCarsApiId?.trim()) ||
      Boolean(editingCarsApiId?.trim()) ||
      sidebarIntent === "heroSave";
    if (!isListingOrHeroEdit) return;

    const urlVin = (searchParams?.get("vin") ?? "").trim().toUpperCase();
    const editCarApiId =
      listingPrefillCarsApiId?.trim() ||
      editingCarsApiId?.trim() ||
      getEditingSearchedCarId() ||
      "";
    const savedVinFromHero = normalizeSavedCarVin(
      heroCars.find((c) => c.carId === editCarApiId || c.id === editCarApiId)?.vin,
    );
    const savedVinFromGuest =
      !urlVin && editCarApiId && shouldUseSessionCarHistory(isAuthenticated)
        ? getE2ESavedCarVin(editCarApiId)
        : null;
    const hydrateVin = urlVin || savedVinFromHero || savedVinFromGuest || "";

    if (!hydrateVin) {
      // Wait for Garage → heroCars before concluding there is no saved VIN.
      if (!urlVin && isAuthenticated && isHeroPanelLoading) return;
      editVinHydratedForOpenRef.current = true;
      return;
    }

    const store = useE2EVinSearchStore.getState();
    const sameVin = store.vinNumber.trim().toUpperCase() === hydrateVin;

    // Later searchParams ticks (e.g. ?vin= written by Add car VIN): never wipe Case 2 error.
    if (editVinHydratedForOpenRef.current) {
      if (sameVin && store.sidebarVinError) return;
      return;
    }
    editVinHydratedForOpenRef.current = true;

    setVinUrlHydrationSuppressed(false);

    if (sameVin && store.sidebarVinError) {
      return;
    }

    if (!sameVin) {
      setVinNumber(hydrateVin);
      setSidebarVinError(null);
      setSidebarVinBrandUnsupported(false);
    }
    // Drop stale resolved ids — re-resolve via GET /Vin (shared cache with live typing).
    clearVinResolvedCarIds();
    useRightSidebarStore.setState({ vinPrefillCarsApiId: null });

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchVinCarsSearch(queryClient, hydrateVin);
        if (cancelled) return;

        const payload = unwrapVinCarsSearchPayload(response);
        const carIds = normalizeVinCarsToCarIds(payload.cars);

        if (carIds.length === 0) {
          setSidebarVinBrandUnsupported(false);
          setSidebarVinError(getVinSearchUnableSelectLabel(getLabel));
          clearVinResolvedCarIds();
          return;
        }

        const primary = carIds[0]!;
        setSidebarVinBrandUnsupported(false);
        setSidebarVinError(null);
        setVinResolvedCarIds(carIds);
        // Keep edit ids; only set vinPrefill so filters use POST /Cars {vin} (not GET /Cars/{id}).
        useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
        queueMicrotask(() => {
          if (cancelled) return;
          useRightSidebarStore.setState({ vinPrefillCarsApiId: primary });
        });
      } catch (error) {
        if (cancelled) return;
        const failure = resolveVinCarsSearchFailureUi(error, getLabel);
        setSidebarVinBrandUnsupported(failure.brandUnsupported);
        setSidebarVinError(failure.message);
        clearVinResolvedCarIds();
        useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    clearVinResolvedCarIds,
    editingCarsApiId,
    getLabel,
    heroCars,
    isAuthenticated,
    isHeroPanelLoading,
    isOpen,
    listingPrefillCarsApiId,
    queryClient,
    searchParams,
    setSidebarVinBrandUnsupported,
    setSidebarVinError,
    setVinNumber,
    setVinResolvedCarIds,
    setVinUrlHydrationSuppressed,
    sidebarIntent,
  ]);

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

  // Case 2 / API failure (empty cars, 400/406/500): clear Make→Gearbox prefills.
  // Only when the failure nonce *increases* — not when `handleReset` identity changes after
  // a later Case 1 vinPrefill (that was wiping Make/Model on successful VIN after an error).
  const lastMmeClearNonceRef = useRef(0);
  useEffect(() => {
    if (!isOpen || mmeClearOnVinFailureNonce === 0) return;
    if (lastMmeClearNonceRef.current === mmeClearOnVinFailureNonce) return;
    lastMmeClearNonceRef.current = mmeClearOnVinFailureNonce;
    // VIN prefill wins over skipSidebarPrefill in useNewMmeCarFilters — drop it first.
    useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
    void handleReset();
  }, [handleReset, isOpen, mmeClearOnVinFailureNonce]);

  const getLabelText = useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  const isE2EVinFlowEnabled = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");

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
        onClick={() => {
          // Any MME change while VIN was set → clear VIN (URL updates only on Find).
          clearVinForVehicleSearchEdit();
          useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
          void handleSelect(field, option.key);
        }}
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

  const handleVinChange = (value: string) => {
    const next = value.toUpperCase();
    const wasCleared = vinNumber.trim().length > 0 && next.trim().length === 0;
    setVinNumber(next);
    // Errors / resolved ids refresh after debounce (live search). Clear error while editing.
    if (sidebarVinError) setSidebarVinError(null);
    if (sidebarVinBrandUnsupported) setSidebarVinBrandUnsupported(false);
    clearVinResolvedCarIds();

    // Cleared VIN → drop VIN-driven Make/Model/… in the sidebar only (URL unchanged).
    if (wasCleared) {
      useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
      void handleReset();
    }
  };

  const handleE2EReset = () => {
    setVinNumber("");
    setSidebarVinError(null);
    setSidebarVinBrandUnsupported(false);
    clearVinResolvedCarIds();
    useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
    void handleReset();
  };

  /**
   * Empty VIN → MME Find / Finish (search-by-car).
   * VIN filled + live-resolved 1–5 → navigate with vin + carIds (override already prefills Make+Model).
   * VIN filled but not yet resolved → run full Find path (validate + API + navigate).
   * On PDP / category SEO only: pass current path so we never bounce to the car-parts hub.
   * Homepage / other: omit override → navigate to car-parts catalog as usual.
   */
  const handleE2EPrimaryCta = useCallback(() => {
    const trimmed = vinNumber.trim().toUpperCase();
    const pathOnly = (pathname ?? "").split("?")[0] || "";
    const stayOnPathDestination = shouldStayOnPathAfterCarApply(pathname)
      ? pathOnly || undefined
      : undefined;

    if (!trimmed) {
      handlePrimaryCta();
      return;
    }
    if (sidebarVinError) return;
    if (vinResolvedCarIds.length >= 1 && vinResolvedCarIds.length <= 5) {
      void navigateVinCatalogSuccess(trimmed, vinResolvedCarIds, stayOnPathDestination);
      return;
    }
    void runVinFindCarParts(
      trimmed,
      stayOnPathDestination ? { destinationOverride: stayOnPathDestination } : undefined,
    );
  }, [
    handlePrimaryCta,
    navigateVinCatalogSuccess,
    pathname,
    runVinFindCarParts,
    sidebarVinError,
    vinNumber,
    vinResolvedCarIds,
  ]);

  const vinFieldHasValue = vinNumber.trim().length > 0;
  const vinLiveResolvedOk =
    !sidebarVinError && vinResolvedCarIds.length >= 1 && vinResolvedCarIds.length <= 5;

  /** VIN path: enable when live resolve gave 1–5 ids. Vehicle path: existing MME CTA. */
  const isE2ECtaDisabled = vinFieldHasValue
    ? !vinLiveResolvedOk ||
      isVinFindPending ||
      isSidebarVinLivePending ||
      vinResolvedCarIds.length > 5
    : isCtaDisabled || isVinFindPending || isSidebarVinLivePending;

  const isEditCarHeader = isHeroSaveMode || Boolean(listingPrefillCarsApiId?.trim());
  const headerTitle = isEditCarHeader
    ? getLabelText("edit_car", "Edit Car")
    : getLabelText("homepage_select_your_car_mme_modal_title", "Car Selection");
  const knowYourVin = getLabelText("homepage_vin_search_title", "Know your VIN?");
  const vinPlaceholder = getLabelText("homepage_vin_search_input_placeholder", "Enter your VIN");
  const orLabel = getLabelText("homepage_vin_mme_selection_seperator", "or");
  const supportSeparatorLabel = getLabelText("vin_brand_unsupported_support_separator", "Support");
  const vehicleSelectionLabel = getLabelText(
    "sidepanel_vin_mme_selection_separator",
    "Vehicle selection",
  );

  const vinSuccessfullyChecked = getLabelText(
    "vehicle_selection_vin_successfully_checked",
    "VIN successfully checked",
  );
  const vinCompatibilityMessage = getLabelText(
    "vehicle_selection_vin_matches_multiple_vehicles_info",
    "Your VIN matches multiple vehicles. Please provide additional vehicle details to find the correct parts.",
  );
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
            className="text-color-primary-default min-w-[3rem] text-right text-sm font-medium underline"
            onClick={handleE2EReset}
            disabled={isLoading || loadingCarDetails || isPrefillLoading}
          >
            {getLabelText("reset", "Reset")}
          </OGButton>
        )}
      </Box>

      <Box
        ref={middleAreaRef as React.RefObject<any>}
        className="base:custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden py-4 base:overflow-y-auto base:overscroll-contain gtsm:overflow-y-auto"
      >
        <Box className="flex w-full flex-col gap-space-xs">
          <Typography className="text-color-text-muted typography-body-02">
            {knowYourVin}
          </Typography>
          <OGTextInput
            value={vinNumber}
            onChange={handleVinChange}
            placeholder={vinPlaceholder}
            maxLength={17}
            autoComplete="off"
            className="bg-white"
            error={sidebarVinError || undefined}
            state={sidebarVinError ? "error" : "default"}
          />
          {!sidebarVinError && vinResolvedCarIds.length >= 1 && (
            <Box className="flex flex-row gap-space-sm">
              <VinCheckCircleIcon className="h-5 w-5 shrink-0 text-color-icon-visited" />
              <Typography className="text-color-text-default typography-body-02">
                {vinSuccessfullyChecked}
              </Typography>
            </Box>
          )}
        </Box>

        {vinResolvedCarIds.length > 1 && (
          <Box className="flex w-full flex-row items-center gap-space-md py-space-2xs">
            <OGAlert variant="info" title="" description={vinCompatibilityMessage} />
          </Box>
        )}

        <Box className="flex w-full flex-row items-center gap-space-md py-space-md">
          <Box className="h-px flex-1 bg-color-border-default" />
          <Typography className="shrink-0 text-color-text-muted typography-body-02">
            {orLabel}
          </Typography>
          <Box className="h-px flex-1 bg-color-border-default" />
        </Box>

        {sidebarVinBrandUnsupported ? (
          <NewVinBrandUnsupportedSupportForm
            vinNumber={vinNumber}
            onSuccess={hideRightSidebar}
            className="w-full"
          />
        ) : (
          <>
            <Typography className="text-color-text-muted typography-body-02">
              {vehicleSelectionLabel}
            </Typography>

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
          </>
        )}
      </Box>

      {!sidebarVinBrandUnsupported && (
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
                disabled={isE2ECtaDisabled}
                isLoading={isVinFindPending}
                onClick={handleE2EPrimaryCta}
              >
                {isVinFindPending || isLoading || loadingCarDetails || isSaving ? (
                  `${getLabelText("loading", "Loading")}...`
                ) : isHeroSaveMode ? (
                  getLabelText("save", "Save")
                ) : isE2ECtaDisabled ? (
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

              {!isE2EVinFlowEnabled ? (
                <OGButton type="ghost" className="w-full" onClick={() => setIsHelpModalOpen(true)}>
                  {getLabel("cant_find_your_car")}
                </OGButton>
              ) : null}
            </Box>
          )}
        </Box>
      )}

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
