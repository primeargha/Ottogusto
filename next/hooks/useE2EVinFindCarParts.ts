"use client";

import { useCallback, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { HERO_CAR_SELECT_EVENT, HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { fetchVinCarsSearch } from "@/hooks/vin";
import { useUrlParams } from "@/hooks/useUrlParams";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/useAuthStore";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { isSearchResultsListingPage, shouldStayOnPathAfterCarApply } from "@/utils/detectPage";
import {
  getVinClientFormatError,
  getVinSearchUnableSelectLabel,
  normalizeVinCarsToCarIds,
  resolveVinCarsSearchFailureUi,
  unwrapVinCarsSearchPayload,
} from "@/utils/e2eVinSearch";
import {
  carIdsForE2EPersistence,
  isE2EMakeModelOnlyResolvedLength,
  persistGarageCarsForApply,
  persistSessionCarsForApply,
  urlCarIdsForE2EApply,
} from "@/utils/newMmeCarApply";
import {
  setE2ESavedCarVin,
  syncE2ESavedCarMakeModelOnlyMeta,
  transferE2ESavedCarMeta,
} from "@/utils/e2eSavedCarMeta";
import {
  clearEditingSearchedCarId,
  getEditingSearchedCarId,
  setSearchedCarVin,
  shouldUseSessionCarHistory,
} from "@/utils/searchedCarIdsSession";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export type E2EVinFindOutcome =
  | { kind: "opened_car_selection" }
  | { kind: "format_error" }
  | { kind: "api_error" }
  | { kind: "navigated"; carIds: string[] }
  | { kind: "prefill_oversized"; carIds: string[] };

/**
 * Homepage / New sidebar Find car parts when VIN field has a value (doc §4.2–§4.3).
 * Empty VIN → caller should open car-selection sidebar instead (or pass allowEmptyOpen).
 *
 * Case 1 length 1–5: persist `carIds[0]`, navigate to car-parts with `vin` + full `carIds`.
 * Case 1 length >5: open sidebar + Make/Model prefill only (CTA disabled).
 */
export function useE2EVinFindCarParts() {
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const params = useParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated, authUser } = useAuthStore();
  const myCarsUserId = (authUser as { id?: string })?.id ?? "anonymous";
  const garageSavedCarsQueryKey = queryKeys.garage.savedCars(myCarsUserId);

  const [isRunning, setIsRunning] = useState(false);

  const setVinNumber = useE2EVinSearchStore((s) => s.setVinNumber);
  const setSidebarVinError = useE2EVinSearchStore((s) => s.setSidebarVinError);
  const setSidebarVinBrandUnsupported = useE2EVinSearchStore(
    (s) => s.setSidebarVinBrandUnsupported,
  );
  const setVinResolvedCarIds = useE2EVinSearchStore((s) => s.setVinResolvedCarIds);
  const clearVinResolvedCarIds = useE2EVinSearchStore((s) => s.clearVinResolvedCarIds);
  const requestMmeClearOnVinFailure = useE2EVinSearchStore((s) => s.requestMmeClearOnVinFailure);
  const { showRightSidebarPanel, showRightSidebarForVinPrefill, hideRightSidebar } =
    useRightSidebarStore();

  const languageCountry =
    (params?.["language-country"] as string | undefined) ||
    pathname?.split("/").filter(Boolean)[0] ||
    "";
  const isListingPage = isSearchResultsListingPage(pathname);
  const searchdataRaw = params?.["searchdata"];
  const searchdataSegment = Array.isArray(searchdataRaw) ? searchdataRaw[0] : searchdataRaw;
  const listingBase = `/${searchdataSegment ?? "search-results"}`;
  const isMmeEnabled = getClientFeatureFlag("new_mme_feature_flag", languageCountry);

  const carApplyDestination = (() => {
    if (isListingPage) return listingBase;
    // Catalog L1–L3, PDP, brand SEO pages: stay on current path (update carIds/vin only).
    if (shouldStayOnPathAfterCarApply(pathname)) {
      const pathOnly = (pathname ?? "").split("?")[0];
      if (pathOnly) return pathOnly;
    }
    if (isMmeEnabled && languageCountry) return Routes.parts(languageCountry);
    return "/search-results";
  })();

  const openSidebarWithVinError = useCallback(
    (vin: string, message: string, options?: { brandUnsupported?: boolean }) => {
      setVinNumber(vin);
      setSidebarVinError(message);
      setSidebarVinBrandUnsupported(Boolean(options?.brandUnsupported));
      clearVinResolvedCarIds();
      showRightSidebarPanel();
    },
    [
      clearVinResolvedCarIds,
      setSidebarVinBrandUnsupported,
      setSidebarVinError,
      setVinNumber,
      showRightSidebarPanel,
    ],
  );

  const navigateVinCatalogSuccess = useCallback(
    async (vin: string, carIds: string[], destinationOverride?: string) => {
      const persistIds = carIdsForE2EPersistence(carIds);
      const urlCarIds = urlCarIdsForE2EApply(carIds);
      if (persistIds.length === 0 || urlCarIds.length === 0) return;

      const sidebar = useRightSidebarStore.getState();
      const editOldCarsApiId =
        sidebar.listingPrefillCarsApiId?.trim() ||
        sidebar.editingCarsApiId?.trim() ||
        getEditingSearchedCarId()?.trim() ||
        null;
      const isEdit = Boolean(editOldCarsApiId);
      const editingMyCarRecordId = sidebar.editingMyCarRecordId?.trim() || null;
      const newCarId = persistIds[0]!;

      if (shouldUseSessionCarHistory(isAuthenticated)) {
        persistSessionCarsForApply(persistIds, isEdit, editOldCarsApiId);
        if (isEdit && editOldCarsApiId && editOldCarsApiId !== newCarId) {
          transferE2ESavedCarMeta(editOldCarsApiId, newCarId);
        }
        syncE2ESavedCarMakeModelOnlyMeta(newCarId, carIds);
        // Dual-write: VIN on session car object + e2e_saved_car_meta.
        setSearchedCarVin(newCarId, vin);
        setE2ESavedCarVin(newCarId, vin);
      }

      if (isAuthenticated) {
        await persistGarageCarsForApply({
          carIds: persistIds,
          isEdit,
          editOldCarsApiId,
          editingMyCarRecordId,
          queryClient,
          garageSavedCarsQueryKey,
          makeModelOnly: isE2EMakeModelOnlyResolvedLength(carIds),
          resolvedCarIdsForName: carIds,
          vin,
        });
      }

      setVinNumber(vin);
      setSidebarVinError(null);
      setSidebarVinBrandUnsupported(false);
      setVinResolvedCarIds(carIds);
      clearEditingSearchedCarId();

      useRightSidebarStore.setState({
        listingPrefillCarsApiId: null,
        editingCarsApiId: null,
        editingMyCarRecordId: null,
        forceEmptySidebar: false,
        vinPrefillCarsApiId: null,
      });

      // Prefer explicit override, else stay on PDP / category / brand SEO path, else catalog hub.
      const pathOnly = (pathname ?? "").split("?")[0] || "";
      const destination =
        destinationOverride?.trim() ||
        (shouldStayOnPathAfterCarApply(pathname) && pathOnly ? pathOnly : carApplyDestination);
      const destinationIsListing = isSearchResultsListingPage(destination);

      updateFilters(
        { carIds: urlCarIds, vin } as Parameters<typeof updateFilters>[0],
        destination,
        "desktop",
        false,
        true,
        destinationIsListing ? { appendAllowedTrackingQueryParams: true } : undefined,
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(HERO_CAR_SELECT_EVENT, { detail: { carId: newCarId } }),
        );
        window.dispatchEvent(new Event(HERO_CARS_REFRESH_EVENT));
      }

      hideRightSidebar();
    },
    [
      carApplyDestination,
      garageSavedCarsQueryKey,
      hideRightSidebar,
      isAuthenticated,
      pathname,
      queryClient,
      setSidebarVinBrandUnsupported,
      setSidebarVinError,
      setVinNumber,
      setVinResolvedCarIds,
      updateFilters,
    ],
  );

  const runVinFindCarParts = useCallback(
    async (
      rawVin: string,
      options?: { destinationOverride?: string; inlineErrors?: boolean },
    ): Promise<E2EVinFindOutcome> => {
      const trimmed = rawVin.trim().toUpperCase();

      if (!trimmed) {
        setSidebarVinError(null);
        setSidebarVinBrandUnsupported(false);
        clearVinResolvedCarIds();
        if (!options?.inlineErrors) showRightSidebarPanel();
        return { kind: "opened_car_selection" };
      }

      // (1) Frontend validation FIRST — never call GET /Vin on format failure.
      const formatError = getVinClientFormatError(trimmed, getLabel);
      if (formatError) {
        if (options?.inlineErrors) {
          setVinNumber(trimmed);
          setSidebarVinBrandUnsupported(false);
          setSidebarVinError(formatError);
          clearVinResolvedCarIds();
          return { kind: "format_error" };
        }
        openSidebarWithVinError(trimmed, formatError);
        return { kind: "format_error" };
      }

      setVinNumber(trimmed);
      setSidebarVinError(null);
      setSidebarVinBrandUnsupported(false);
      setIsRunning(true);

      try {
        // (2) GET /api/Vin/{vinNumber} — shared cache with sidebar live search
        const response = await fetchVinCarsSearch(queryClient, trimmed);
        const payload = unwrapVinCarsSearchPayload(response);
        const carIds = normalizeVinCarsToCarIds(payload.cars);

        // Case 2 — success but cars: []
        if (carIds.length === 0) {
          useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
          requestMmeClearOnVinFailure();
          if (options?.inlineErrors) {
            setSidebarVinBrandUnsupported(false);
            setSidebarVinError(getVinSearchUnableSelectLabel(getLabel));
            clearVinResolvedCarIds();
            return { kind: "api_error" };
          }
          openSidebarWithVinError(trimmed, getVinSearchUnableSelectLabel(getLabel));
          return { kind: "api_error" };
        }

        // Case 1 — length >5: sidebar Make+Model prefill only; CTA stays disabled.
        if (carIds.length > 5) {
          setSidebarVinError(null);
          setSidebarVinBrandUnsupported(false);
          setVinResolvedCarIds(carIds);
          showRightSidebarForVinPrefill(carIds[0]!);
          return { kind: "prefill_oversized", carIds };
        }

        // Case 1 — length 1–5: persist carIds[0], navigate with vin + full carIds.
        await navigateVinCatalogSuccess(trimmed, carIds, options?.destinationOverride);
        return { kind: "navigated", carIds };
      } catch (error) {
        const failure = resolveVinCarsSearchFailureUi(error, getLabel);
        useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
        requestMmeClearOnVinFailure();
        if (options?.inlineErrors) {
          setSidebarVinBrandUnsupported(failure.brandUnsupported);
          setSidebarVinError(failure.message);
          clearVinResolvedCarIds();
          return { kind: "api_error" };
        }
        openSidebarWithVinError(trimmed, failure.message, {
          brandUnsupported: failure.brandUnsupported,
        });
        return { kind: "api_error" };
      } finally {
        setIsRunning(false);
      }
    },
    [
      clearVinResolvedCarIds,
      getLabel,
      navigateVinCatalogSuccess,
      openSidebarWithVinError,
      queryClient,
      requestMmeClearOnVinFailure,
      setSidebarVinBrandUnsupported,
      setSidebarVinError,
      setVinNumber,
      setVinResolvedCarIds,
      showRightSidebarForVinPrefill,
      showRightSidebarPanel,
    ],
  );

  return {
    runVinFindCarParts,
    /** Apply already-resolved sidebar VIN (1–5) → persist + navigate (no second GET if caller has ids). */
    navigateVinCatalogSuccess,
    isVinFindPending: isRunning,
  };
}
