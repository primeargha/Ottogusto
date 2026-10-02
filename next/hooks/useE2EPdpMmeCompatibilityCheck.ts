"use client";

import { useEffect, useRef, useState } from "react";
import { checkPartCompatibility } from "@/services/productdetailsservice";

type UseE2EPdpMmeCompatibilityCheckParams = {
  partId: string;
  carId: string | null;
  /** Only relevant for MME (carIds) arrivals — disabled once a VIN result exists. */
  enabled?: boolean | undefined;
};

/**
 * PDP MME (no VIN) two-state compatibility check — `GET /MakeModelType/{carId}/check/{partId}`.
 * Distinct from the VIN three-state flow (`useE2EPdpBannerVinCheck`): MME has no MAY_FIT signal.
 */
export function useE2EPdpMmeCompatibilityCheck({
  partId,
  carId,
  enabled = true,
}: UseE2EPdpMmeCompatibilityCheckParams) {
  const [isChecking, setIsChecking] = useState(false);
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const lastCheckedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmedPartId = partId?.trim() ?? "";
    const trimmedCarId = carId?.trim() ?? "";

    if (!enabled || !trimmedPartId || !trimmedCarId) {
      setIsChecking(false);
      setIsCompatible(null);
      lastCheckedKeyRef.current = null;
      return;
    }

    const checkKey = `${trimmedCarId}:${trimmedPartId}`;
    if (lastCheckedKeyRef.current === checkKey) return;
    lastCheckedKeyRef.current = checkKey;

    let cancelled = false;
    setIsChecking(true);
    setIsCompatible(null);

    checkPartCompatibility(trimmedCarId, trimmedPartId).then((result) => {
      if (cancelled) return;
      setIsCompatible(result.isCompatible);
      setIsChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [carId, enabled, partId]);

  return {
    isChecking,
    isCompatible,
    hasResult: isCompatible !== null,
  };
}
