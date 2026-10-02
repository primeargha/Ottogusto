"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchedCarLabels } from "@/hooks/useSearchedCarLabels";
import {
  useNewMmeAuthCarTransition,
  skipGuestUrlSyncAfterLogoutRef,
  pendingGarageUrlSyncAfterLoginRef,
} from "@/hooks/useNewMmeAuthCarTransition";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { buildNewMmeCarListIds } from "@/utils/newMmeCarListSource";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";
import {
  clearEditingSearchedCarId,
  clearGuestSelectionClearedFlag,
  getSearchedCarIds,
  isGuestSelectionCleared,
  markGuestSelectionCleared,
  removeSearchedCarId,
  setEditingSearchedCarId,
  shouldUseSessionCarHistory,
  syncGuestSessionFromUrlCarIds,
} from "@/utils/searchedCarIdsSession";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { useNewMmeGarageCarsQuery } from "@/hooks/garage";
import {
  findGarageRecordIdByCarId,
  findGarageSiblingCarIdsByCarId,
  findGarageVinByCarId,
  formatGarageItemDisplayLabel,
  hasGarageDisplayNames,
} from "@/utils/garageCarId";
import {
  getE2ESavedCarSiblingCarIds,
  getE2ESavedCarVin,
  normalizeSavedCarVin,
  resolveUrlCarIdsForSavedCar,
} from "@/utils/e2eSavedCarMeta";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";

export type UseSearchResultsCarBannerModelArgs = {
  applyBasePath?: string | undefined;
};

/**
 * Shared guest/garage/URL car-selection state for old + New search banners.
 */
export function useSearchResultsCarBannerModel({
  applyBasePath,
}: UseSearchResultsCarBannerModelArgs = {}) {
  const { isAuthenticated } = useAuthStore();
  const usesSession = shouldUseSessionCarHistory(isAuthenticated);
  const { authEpoch } = useNewMmeAuthCarTransition();
  const { data: garageCars = [], isPending: isGarageCarsPending } = useNewMmeGarageCarsQuery();
  const { showRightSidebarPanel, showRightSidebarForListingEdit, showRightSidebarForNewCar } =
    useRightSidebarStore();
  const { updateFilters } = useUrlParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchdataRaw = params?.["searchdata"];
  const searchdataSegment = Array.isArray(searchdataRaw) ? searchdataRaw[0] : searchdataRaw;
  const listingBaseFromRoute = `/${searchdataSegment ?? "search-results"}`;
  const listingBase = applyBasePath?.trim() || listingBaseFromRoute;

  const urlCarIds = useMemo(
    () => parseCarIdsParam(searchParams?.get("carIds") ?? null),
    [searchParams],
  );
  const { invalid: carIdsUrlInvalid, isValidating: carIdsUrlValidating } = useUrlCarIdsValidation();
  const urlVin = useMemo(() => {
    const raw = searchParams?.get("vin")?.trim().toUpperCase() ?? "";
    return raw || null;
  }, [searchParams]);
  const hasUrlCar = urlCarIds.length > 0;
  const primaryCarId = urlCarIds[0] ?? "";

  const [sessionIds, setSessionIds] = useState<string[]>([]);
  /** sessionStorage read happens post-mount (avoids hydration mismatch) — track readiness for skeleton gating. */
  const [sessionIdsReady, setSessionIdsReady] = useState(false);

  useEffect(() => {
    if (!usesSession) {
      setSessionIds([]);
      setSessionIdsReady(true);
      return;
    }
    setSessionIds(getSearchedCarIds());
    setSessionIdsReady(true);
  }, [searchParams, usesSession, isAuthenticated, authEpoch]);

  const garageCarIds = useMemo(
    () => garageCars.map((row) => row.carId?.trim()).filter((id): id is string => Boolean(id)),
    [garageCars],
  );

  const garageRowByCarId = useMemo(() => {
    const map = new Map<string, (typeof garageCars)[number]>();
    for (const row of garageCars) {
      const carId = row.carId?.trim();
      if (!carId) continue;
      map.set(carId, row);
    }
    return map;
  }, [garageCars]);

  const dropdownIds = useMemo(
    () => buildNewMmeCarListIds(usesSession, sessionIds, garageCarIds),
    [garageCarIds, sessionIds, usesSession],
  );

  const hasDropdownOptions = dropdownIds.length > 0;
  /**
   * True only while we don't yet know if the dropdown will end up populated (session ids read /
   * garage cars query still resolving) and the URL doesn't already pin a car — this is the window
   * where the banner would otherwise flash from "no car" to "car selection" layout (CLS).
   */
  const isBannerLoading =
    !hasUrlCar && !hasDropdownOptions && (usesSession ? !sessionIdsReady : isGarageCarsPending);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabelIds = useMemo(
    () => (hasUrlCar && primaryCarId ? [primaryCarId] : []),
    [hasUrlCar, primaryCarId],
  );

  const otherDropdownIds = useMemo(() => {
    if (!dropdownOpen) return [];
    return dropdownIds.filter((id) => id !== primaryCarId);
  }, [dropdownIds, dropdownOpen, primaryCarId]);

  const { data: selectedLabels = [], isLoading: selectedLabelsLoading } = useSearchedCarLabels(
    selectedLabelIds,
    selectedLabelIds.length > 0,
  );

  const { data: menuLabels = [] } = useSearchedCarLabels(
    otherDropdownIds,
    dropdownOpen && otherDropdownIds.length > 0,
  );

  const labelOptions = useMemo(() => {
    const byId = new Map<string, (typeof selectedLabels)[number]>();
    for (const row of [...selectedLabels, ...menuLabels]) {
      byId.set(row.id, row);
    }
    return dropdownIds.map((id) => {
      const fromCars = byId.get(id);
      if (fromCars) {
        if (fromCars.isLoading) return fromCars;
        if (fromCars.label) return fromCars;
      }
      const garageRow = !usesSession ? garageRowByCarId.get(id) : undefined;
      if (garageRow && hasGarageDisplayNames(garageRow)) {
        return { id, label: formatGarageItemDisplayLabel(garageRow), isLoading: false };
      }
      return { id, label: "", isLoading: true };
    });
  }, [dropdownIds, garageRowByCarId, menuLabels, selectedLabels, usesSession]);

  const selectedLabelLoading =
    selectedLabelIds.length > 0 &&
    (selectedLabelsLoading || labelOptions.find((o) => o.id === primaryCarId)?.isLoading === true);

  useEffect(() => {
    if (!hasUrlCar || !usesSession) return;
    if (skipGuestUrlSyncAfterLogoutRef.current) {
      skipGuestUrlSyncAfterLogoutRef.current = false;
      return;
    }
    // Wait for GET /Cars/{id} — never persist hand-edited invalid ids into guest history.
    if (carIdsUrlValidating) return;
    if (carIdsUrlInvalid) {
      for (const id of urlCarIds) {
        removeSearchedCarId(id);
      }
      setSessionIds(getSearchedCarIds());
      return;
    }
    syncGuestSessionFromUrlCarIds(urlCarIds, {
      e2eSingleSave: getClientFeatureFlag("end_to_end_vin_flow_feature_flag"),
    });
    setSessionIds(getSearchedCarIds());
  }, [hasUrlCar, usesSession, urlCarIds, carIdsUrlInvalid, carIdsUrlValidating]);

  const heroCarsApiId = useLandingHeroCarStore((s) => s.selectedCarsApiId);
  useEffect(() => {
    if (!usesSession || hasUrlCar) return;
    if (isGuestSelectionCleared()) return;
    const heroId = heroCarsApiId?.trim();
    if (!heroId) return;

    updateFilters(
      { carIds: [heroId] } as Parameters<typeof updateFilters>[0],
      listingBase,
      "desktop",
      false,
      true,
      { appendAllowedTrackingQueryParams: true },
    );
  }, [usesSession, hasUrlCar, heroCarsApiId, listingBase, updateFilters]);

  useEffect(() => {
    if (!pendingGarageUrlSyncAfterLoginRef.current) return;
    if (!isAuthenticated || usesSession) return;
    if (!hasUrlCar) {
      pendingGarageUrlSyncAfterLoginRef.current = false;
      return;
    }
    if (garageCarIds.length === 0) {
      if (isGarageCarsPending) return;
      pendingGarageUrlSyncAfterLoginRef.current = false;
      return;
    }

    pendingGarageUrlSyncAfterLoginRef.current = false;
    const firstGarageCarId = garageCarIds[0];
    if (!firstGarageCarId || primaryCarId === firstGarageCarId) return;

    updateFilters(
      { carIds: [firstGarageCarId] } as Parameters<typeof updateFilters>[0],
      listingBase,
      "desktop",
      false,
      true,
      { appendAllowedTrackingQueryParams: true },
    );
  }, [
    garageCarIds,
    hasUrlCar,
    isAuthenticated,
    isGarageCarsPending,
    listingBase,
    primaryCarId,
    updateFilters,
    usesSession,
  ]);

  const isE2EVinFlow = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");

  const handleDropdownSelect = useCallback(
    (carId: string) => {
      if (!carId) return;
      if (usesSession) {
        clearGuestSelectionClearedFlag();
        useLandingHeroCarStore.getState().setSelectedCarsApiId(carId);
      }
      // E2E: restore VIN + full sibling carIds (2–5) when this saved car was multi-resolve.
      const savedVin = isE2EVinFlow
        ? usesSession
          ? getE2ESavedCarVin(carId)
          : findGarageVinByCarId(garageCars, carId)
        : null;
      const urlCarIds = isE2EVinFlow
        ? resolveUrlCarIdsForSavedCar(carId, {
            getSiblingCarIds: (id) =>
              usesSession
                ? getE2ESavedCarSiblingCarIds(id)
                : findGarageSiblingCarIdsByCarId(garageCars, id),
          })
        : [carId];
      updateFilters(
        {
          carIds: urlCarIds,
          ...(isE2EVinFlow ? { vin: savedVin } : {}),
        } as Parameters<typeof updateFilters>[0],
        listingBase,
        "desktop",
        false,
        true,
        { appendAllowedTrackingQueryParams: true },
      );
    },
    [garageCars, isE2EVinFlow, listingBase, updateFilters, usesSession],
  );

  const handleDeselectCar = useCallback(() => {
    if (!hasUrlCar || !pathname) return;
    useLandingHeroCarStore.getState().setSelectedCarsApiId(null);
    if (usesSession) {
      markGuestSelectionCleared();
      clearEditingSearchedCarId();
    }
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    nextParams.delete("carIds");
    nextParams.delete("makeModelTypeId");
    if (isE2EVinFlow) nextParams.delete("vin");
    const query = nextParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }, [hasUrlCar, isE2EVinFlow, pathname, router, searchParams, usesSession]);

  const myCarRecordIdForPrimary = useMemo(() => {
    if (!isAuthenticated || !primaryCarId) return undefined;
    return findGarageRecordIdByCarId(garageCars, primaryCarId);
  }, [garageCars, isAuthenticated, primaryCarId]);

  const handleEditCar = useCallback(() => {
    if (!primaryCarId) return;
    if (usesSession) {
      setEditingSearchedCarId(primaryCarId);
    }
    // Seed VIN before open so filters defer Cars-by-id (GET /Vin path, same as typing).
    if (isE2EVinFlow) {
      const savedVin =
        normalizeSavedCarVin(urlVin) ||
        (usesSession
          ? getE2ESavedCarVin(primaryCarId)
          : findGarageVinByCarId(garageCars, primaryCarId));
      const vinStore = useE2EVinSearchStore.getState();
      if (savedVin) {
        vinStore.setVinNumber(savedVin);
        vinStore.setSidebarVinError(null);
        vinStore.setSidebarVinBrandUnsupported(false);
        vinStore.clearVinResolvedCarIds();
      }
    }
    showRightSidebarForListingEdit({
      carsApiId: primaryCarId,
      ...(myCarRecordIdForPrimary ? { myCarRecordId: myCarRecordIdForPrimary } : {}),
    });
  }, [
    garageCars,
    isE2EVinFlow,
    myCarRecordIdForPrimary,
    primaryCarId,
    showRightSidebarForListingEdit,
    urlVin,
    usesSession,
  ]);

  return {
    listingBase,
    pathname,
    urlCarIds,
    urlVin,
    hasUrlCar,
    primaryCarId,
    dropdownIds,
    hasDropdownOptions,
    isBannerLoading,
    labelOptions,
    selectedLabelLoading,
    setDropdownOpen,
    showRightSidebarPanel,
    showRightSidebarForNewCar,
    handleDropdownSelect,
    handleDeselectCar,
    handleEditCar,
  };
}
