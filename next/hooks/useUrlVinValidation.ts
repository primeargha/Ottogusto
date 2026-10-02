"use client";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useBranding } from "@/contexts/BrandingContext";
import { fetchVinCarsSearch } from "@/hooks/vin";
import {
  getVinClientFormatError,
  normalizeVinCarsToCarIds,
  unwrapVinCarsSearchPayload,
} from "@/utils/e2eVinSearch";
import { getClientFeatureFlag } from "@/utils/theme-utils";

/**
 * Validates a manually-edited `?vin=` URL param (car-parts, L1-L3, search-results,
 * PDP, cart, checkout) with the same format check + `GET /Vin/{vin}` lookup the
 * E2E right sidebar uses. VINs the app itself already resolved (Find car parts /
 * sidebar VIN search) hit the shared `fetchVinCarsSearch` React Query cache, so
 * this does not add a network call on the normal navigate-after-resolve path —
 * only a hand-edited / bookmarked / shared `?vin=` triggers a fresh lookup.
 */
export function useUrlVinValidation(): { invalid: boolean } {
  const searchParams = useSearchParams();
  const vin = searchParams?.get("vin") ?? null;
  const queryClient = useQueryClient();
  const { getLabel } = useBranding();
  const [invalid, setInvalid] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const isE2EVinFlowEnabled = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");
    if (!isE2EVinFlowEnabled || !vin) {
      setInvalid(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const formatError = getVinClientFormatError(vin, getLabel);
    if (formatError) {
      setInvalid(true);
      return;
    }

    setInvalid(false);
    fetchVinCarsSearch(queryClient, vin)
      .then((response) => {
        if (requestIdRef.current !== requestId) return;
        const { cars } = unwrapVinCarsSearchPayload(response);
        const carIds = normalizeVinCarsToCarIds(cars);
        setInvalid(carIds.length === 0);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setInvalid(true);
      });
  }, [vin, queryClient, getLabel]);

  return { invalid };
}
