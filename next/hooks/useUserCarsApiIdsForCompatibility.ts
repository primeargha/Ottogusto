"use client";

import { useEffect, useMemo, useState } from "react";
import { useNewMmeGarageCarsQuery } from "@/hooks/garage";
import { useNewMmeAuthCarTransition } from "@/hooks/useNewMmeAuthCarTransition";
import { useAuthStore } from "@/stores/useAuthStore";
import { getSearchedCarIds, shouldUseSessionCarHistory } from "@/utils/searchedCarIdsSession";

/**
 * Cars API ids for PDP saved-car compatibility (logged-in garage `carId` or guest session).
 */
export function useUserCarsApiIdsForCompatibility(): string[] {
  const [isMounted, setIsMounted] = useState(false);
  const [sessionCarIds, setSessionCarIds] = useState<string[]>([]);
  const { isAuthenticated } = useAuthStore();
  const { data: garageCars } = useNewMmeGarageCarsQuery();
  const { authEpoch } = useNewMmeAuthCarTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const syncSessionIds = () => {
      if (shouldUseSessionCarHistory(isAuthenticated)) {
        setSessionCarIds(getSearchedCarIds());
      } else {
        setSessionCarIds([]);
      }
    };

    syncSessionIds();

    const onFocus = () => syncSessionIds();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isMounted, isAuthenticated, authEpoch]);

  return useMemo(() => {
    if (!isMounted) return [];

    if (isAuthenticated && Array.isArray(garageCars)) {
      return garageCars.map((row) => row.carId?.trim()).filter((id): id is string => Boolean(id));
    }

    if (shouldUseSessionCarHistory(isAuthenticated)) {
      return sessionCarIds;
    }

    return [];
  }, [isMounted, isAuthenticated, garageCars, sessionCarIds]);
}
