"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { getClientFeatureFlag } from "@/utils/theme-utils";

/**
 * Keeps shared E2E VIN UI state aligned with the URL (doc §4.4–§4.5):
 * - `?vin=` present (catalog / L1–L3 / SRP / PDP) → fill VIN field (+ resolved carIds from `carIds`)
 * - no `vin` (homepage, vehicle search, etc.) → clear homepage + sidebar VIN fields
 *   (skipped while the right sidebar is open so Edit can hydrate VIN from saved-car meta/Garage)
 * - If user edited Make/Model/… (`vinUrlHydrationSuppressed`), do not re-fill from stale `?vin=`
 *   until the URL `vin` value actually changes (Find car parts).
 *
 * Mount only under `end_to_end_vin_flow_feature_flag`.
 */
export function useE2EVinUrlSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const languageCountry = pathname?.split("/").filter(Boolean)[0] || "";
  const isE2EEnabled = getClientFeatureFlag("end_to_end_vin_flow_feature_flag", languageCountry);
  const sidebarOpen = useRightSidebarStore((s) => s.showRightSidebar);

  const urlVin = (searchParams?.get("vin") ?? "").trim().toUpperCase();
  const urlCarIdsKey = searchParams?.get("carIds") ?? "";
  const prevUrlVinRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isE2EEnabled) return;

    const store = useE2EVinSearchStore.getState();
    const urlCarIds = parseCarIdsParam(urlCarIdsKey || null);

    // URL `vin` changed (e.g. Find applied a new search) → allow hydration again.
    if (prevUrlVinRef.current !== null && prevUrlVinRef.current !== urlVin) {
      store.setVinUrlHydrationSuppressed(false);
    }
    prevUrlVinRef.current = urlVin;

    if (urlVin) {
      if (store.vinUrlHydrationSuppressed) {
        return;
      }
      const vinChanged = store.vinNumber.trim().toUpperCase() !== urlVin;
      if (vinChanged) {
        store.setVinNumber(urlVin);
        // Only clear errors when the URL VIN value itself changes — not on every
        // searchParams tick. Otherwise Add-car-VIN / Find Case 2 (cars: []) sets
        // sidebarVinError and a later sync (same ?vin=) wipes it.
        store.setSidebarVinError(null);
        store.setSidebarVinBrandUnsupported(false);
        store.setVinResolvedCarIds(urlCarIds);
      }
      // Same URL VIN already in the field: preserve sidebarVinError + resolved ids
      // (Case 2 unable-select must stay visible under the VIN input).
      return;
    }

    // Sidebar open on a page without `?vin=` (e.g. homepage Edit of a VIN-saved car):
    // keep the field — hydrate from saved-car meta/Garage; close effect clears on dismiss.
    if (sidebarOpen) return;

    // Homepage / vehicle-search / any page without `vin` — clear shared VIN UI.
    store.setVinUrlHydrationSuppressed(false);
    if (
      store.vinNumber ||
      store.sidebarVinError ||
      store.sidebarVinBrandUnsupported ||
      store.vinResolvedCarIds.length > 0
    ) {
      store.setVinNumber("");
      store.setSidebarVinError(null);
      store.setSidebarVinBrandUnsupported(false);
      store.clearVinResolvedCarIds();
    }
  }, [isE2EEnabled, pathname, sidebarOpen, urlCarIdsKey, urlVin]);
}
