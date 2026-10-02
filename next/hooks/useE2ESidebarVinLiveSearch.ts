"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBranding } from "@/contexts/BrandingContext";
import { fetchVinCarsSearch } from "@/hooks/vin";
import useDebounce from "@/hooks/use-debounce";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import {
  getVinClientFormatError,
  getVinSearchUnableSelectLabel,
  normalizeVinCarsToCarIds,
  resolveVinCarsSearchFailureUi,
  unwrapVinCarsSearchPayload,
} from "@/utils/e2eVinSearch";

/** Debounce for sidebar VIN format check + GET /Vin (doc §4.2 sidebar live). */
export const E2E_SIDEBAR_VIN_LIVE_DEBOUNCE_MS = 450;

/**
 * Right sidebar / drawer only: debounced real-time VIN validation + GET /Vin prefill.
 * Overrides Make/Model (and deeper fields via vin prefill) whenever a valid VIN resolves.
 * Does **not** navigate — user clicks Find / Finish to go to car-parts.
 * Homepage keeps click-to-search (`useE2EVinFindCarParts`).
 *
 * Uses `fetchVinCarsSearch` (shared React Query cache) so Find / Add-car-VIN GET for the same VIN
 * is not duplicated by sidebar live search.
 */
export function useE2ESidebarVinLiveSearch(enabled: boolean) {
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const requestGenRef = useRef(0);
  const lastResolvedVinRef = useRef<string>("");
  /** VIN that already failed GET (Find or live) — skip repeat network until field changes. */
  const lastFailedVinRef = useRef<string>("");
  /** Avoid bumping MME clear nonce repeatedly for the same failed VIN. */
  const lastMmeClearedForVinRef = useRef<string>("");

  const vinNumber = useE2EVinSearchStore((s) => s.vinNumber);
  const setSidebarVinError = useE2EVinSearchStore((s) => s.setSidebarVinError);
  const setSidebarVinBrandUnsupported = useE2EVinSearchStore(
    (s) => s.setSidebarVinBrandUnsupported,
  );
  const setVinResolvedCarIds = useE2EVinSearchStore((s) => s.setVinResolvedCarIds);
  const clearVinResolvedCarIds = useE2EVinSearchStore((s) => s.clearVinResolvedCarIds);
  const requestMmeClearOnVinFailure = useE2EVinSearchStore((s) => s.requestMmeClearOnVinFailure);
  const { showRightSidebarForVinPrefill } = useRightSidebarStore();

  const clearMmeDropdownsForFailedVin = useCallback(
    (vin: string) => {
      if (lastMmeClearedForVinRef.current === vin) return;
      lastMmeClearedForVinRef.current = vin;
      requestMmeClearOnVinFailure();
    },
    [requestMmeClearOnVinFailure],
  );

  const debouncedVin = useDebounce(
    vinNumber.trim().toUpperCase(),
    E2E_SIDEBAR_VIN_LIVE_DEBOUNCE_MS,
  );

  const clearVinPrefill = useCallback(() => {
    if (useRightSidebarStore.getState().vinPrefillCarsApiId != null) {
      useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
    }
  }, []);

  const applyVinPrefillOverride = useCallback(
    (carIds: string[]) => {
      const primary = carIds[0]?.trim();
      if (!primary) return;

      const sidebar = useRightSidebarStore.getState();
      const isEditOpen =
        Boolean(sidebar.listingPrefillCarsApiId?.trim()) ||
        Boolean(sidebar.editingCarsApiId?.trim()) ||
        sidebar.sidebarIntent === "heroSave";

      // Clear then set so Make/Model bootstrap re-runs even when carIds[0] is unchanged.
      useRightSidebarStore.setState({ vinPrefillCarsApiId: null });
      queueMicrotask(() => {
        if (isEditOpen) {
          // Keep listing/hero edit ids + guest editing_searched_car_id so apply stays replace.
          useRightSidebarStore.setState({ vinPrefillCarsApiId: primary });
          return;
        }
        showRightSidebarForVinPrefill(primary);
      });
    },
    [showRightSidebarForVinPrefill],
  );

  useEffect(() => {
    if (!enabled) return;

    const trimmed = debouncedVin;
    const gen = ++requestGenRef.current;
    const store = useE2EVinSearchStore.getState();

    if (!trimmed) {
      lastResolvedVinRef.current = "";
      lastFailedVinRef.current = "";
      lastMmeClearedForVinRef.current = "";
      if (store.sidebarVinError != null) setSidebarVinError(null);
      if (store.sidebarVinBrandUnsupported) setSidebarVinBrandUnsupported(false);
      if (store.vinResolvedCarIds.length > 0) clearVinResolvedCarIds();
      clearVinPrefill();
      return;
    }

    // (1) Frontend validation — never call GET /Vin on format failure.
    const formatError = getVinClientFormatError(trimmed, getLabel);
    if (formatError) {
      lastResolvedVinRef.current = "";
      lastFailedVinRef.current = "";
      if (store.sidebarVinBrandUnsupported) setSidebarVinBrandUnsupported(false);
      if (store.sidebarVinError !== formatError) setSidebarVinError(formatError);
      if (store.vinResolvedCarIds.length > 0) clearVinResolvedCarIds();
      clearVinPrefill();
      // 17-char invalid charset: same MME Reset as 406 / empty cars (keep Make list).
      // Partial length ≠ 17: do not Reset on every keystroke.
      if (trimmed.length === 17) {
        clearMmeDropdownsForFailedVin(trimmed);
      } else {
        lastMmeClearedForVinRef.current = "";
      }
      return;
    }

    if (lastResolvedVinRef.current === trimmed) {
      // Resolved ids may have been cleared (Edit open / hydrate) while lastResolved stuck —
      // fall through and GET again so single-car full prefill + vinPrefill re-apply.
      if (store.vinResolvedCarIds.length > 0 && !store.sidebarVinError) {
        applyVinPrefillOverride(store.vinResolvedCarIds);
        return;
      }
      lastResolvedVinRef.current = "";
    }

    // Find / Add car VIN already resolved this VIN — reuse store ids, skip GET.
    // Do not treat as resolved when a Case 2 / API error is already showing for this VIN.
    const alreadyResolved =
      !store.sidebarVinError &&
      store.vinResolvedCarIds.length > 0 &&
      store.vinNumber.trim().toUpperCase() === trimmed;
    if (alreadyResolved) {
      lastResolvedVinRef.current = trimmed;
      lastFailedVinRef.current = "";
      applyVinPrefillOverride(store.vinResolvedCarIds);
      return;
    }

    // Homepage Find (or prior live) already failed for this VIN and set the sidebar error —
    // do not clear the error or fire a second GET /Vin. Still clear Make→Gearbox once
    // (Edit-car can still show listing prefill under a Case 2 error).
    if (
      lastFailedVinRef.current === trimmed ||
      (store.sidebarVinError && store.vinNumber.trim().toUpperCase() === trimmed)
    ) {
      lastFailedVinRef.current = trimmed;
      clearMmeDropdownsForFailedVin(trimmed);
      return;
    }

    setIsRunning(true);

    void (async () => {
      try {
        const response = await fetchVinCarsSearch(queryClient, trimmed);
        if (gen !== requestGenRef.current) return;

        const payload = unwrapVinCarsSearchPayload(response);
        const carIds = normalizeVinCarsToCarIds(payload.cars);

        if (carIds.length === 0) {
          lastResolvedVinRef.current = "";
          lastFailedVinRef.current = trimmed;
          setSidebarVinBrandUnsupported(false);
          setSidebarVinError(getVinSearchUnableSelectLabel(getLabel));
          if (useE2EVinSearchStore.getState().vinResolvedCarIds.length > 0) {
            clearVinResolvedCarIds();
          }
          clearVinPrefill();
          clearMmeDropdownsForFailedVin(trimmed);
          return;
        }

        lastResolvedVinRef.current = trimmed;
        lastFailedVinRef.current = "";
        lastMmeClearedForVinRef.current = "";
        setSidebarVinBrandUnsupported(false);
        setSidebarVinError(null);
        setVinResolvedCarIds(carIds);
        applyVinPrefillOverride(carIds);
      } catch (error) {
        if (gen !== requestGenRef.current) return;
        lastResolvedVinRef.current = "";
        lastFailedVinRef.current = trimmed;
        const failure = resolveVinCarsSearchFailureUi(error, getLabel);
        setSidebarVinBrandUnsupported(failure.brandUnsupported);
        setSidebarVinError(failure.message);
        if (useE2EVinSearchStore.getState().vinResolvedCarIds.length > 0) {
          clearVinResolvedCarIds();
        }
        clearVinPrefill();
        clearMmeDropdownsForFailedVin(trimmed);
      } finally {
        if (gen === requestGenRef.current) {
          setIsRunning(false);
        }
      }
    })();
  }, [
    applyVinPrefillOverride,
    clearMmeDropdownsForFailedVin,
    clearVinPrefill,
    clearVinResolvedCarIds,
    debouncedVin,
    enabled,
    getLabel,
    queryClient,
    setSidebarVinError,
    setSidebarVinBrandUnsupported,
    setVinResolvedCarIds,
  ]);

  // While the user is still typing (before debounce settles), drop stale resolved ids
  // so the CTA does not stay enabled for a previous VIN.
  useEffect(() => {
    if (!enabled) return;
    const live = vinNumber.trim().toUpperCase();
    if (live !== debouncedVin) {
      if (useE2EVinSearchStore.getState().vinResolvedCarIds.length > 0) {
        clearVinResolvedCarIds();
      }
      lastResolvedVinRef.current = "";
      lastFailedVinRef.current = "";
      lastMmeClearedForVinRef.current = "";
    }
  }, [clearVinResolvedCarIds, debouncedVin, enabled, vinNumber]);

  return {
    isSidebarVinLivePending: isRunning,
  };
}
