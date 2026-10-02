"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { HeroCarDataItem } from "@/components/HeroCarDataCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { getSearchedCarIds, shouldUseSessionCarHistory } from "@/utils/searchedCarIdsSession";
import { useSearchedCarLabels } from "@/hooks/useSearchedCarLabels";
import { useNewMmeGarageCarsQuery } from "@/hooks/garage";
import { useNewMmeAuthCarTransition } from "@/hooks/useNewMmeAuthCarTransition";
import { queryKeys } from "@/lib/query-keys";
import {
  formatGarageItemDisplayLabel,
  garageItemToHeroShape,
  getGarageItemVin,
  hasGarageDisplayNames,
} from "@/utils/garageCarId";
import { getE2ESavedCarVin } from "@/utils/e2eSavedCarMeta";
import { HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export function useHeroCarsPanel() {
  const queryClient = useQueryClient();
  const { isAuthenticated, authUser } = useAuthStore();
  const usesSession = shouldUseSessionCarHistory(isAuthenticated);
  const userId = (authUser as { id?: string } | null)?.id ?? null;
  const { authEpoch } = useNewMmeAuthCarTransition();

  const [hasMounted, setHasMounted] = useState(false);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [sessionCarIds, setSessionCarIds] = useState<string[]>([]);

  const { data: garageCars = [], isPending: isGarageCarsPending } = useNewMmeGarageCarsQuery();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setSessionHydrated(false);
    setSessionCarIds(usesSession ? getSearchedCarIds() : []);
    setSessionHydrated(true);
  }, [hasMounted, usesSession, isAuthenticated, authEpoch]);

  useEffect(() => {
    if (!hasMounted) return;

    const onRefresh = () => {
      if (usesSession) {
        setSessionCarIds(getSearchedCarIds());
      } else if (isAuthenticated) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.garage.savedCars(userId),
          refetchType: "all",
        });
      }
    };

    window.addEventListener(HERO_CARS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(HERO_CARS_REFRESH_EVENT, onRefresh);
  }, [hasMounted, isAuthenticated, queryClient, usesSession, userId]);

  const sessionLabelsQueryEnabled = hasMounted && usesSession && sessionCarIds.length > 0;
  const { data: sessionLabelOptions = [], isPending: isSessionLabelsPending } =
    useSearchedCarLabels(sessionCarIds, sessionLabelsQueryEnabled);

  const garageCarIds = useMemo(
    () => garageCars.map((row) => row.carId?.trim()).filter((id): id is string => Boolean(id)),
    [garageCars],
  );

  const garageLabelsQueryEnabled = hasMounted && !usesSession && garageCarIds.length > 0;
  const { data: garageLabelOptions = [], isPending: isGarageLabelsPending } = useSearchedCarLabels(
    garageCarIds,
    garageLabelsQueryEnabled,
  );

  const heroCars: HeroCarDataItem[] = useMemo(() => {
    const e2eVinFlow = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");

    if (usesSession) {
      return sessionCarIds.map((id) => {
        const label = sessionLabelOptions.find((o) => o.id === id)?.label ?? id;
        const [title, ...rest] = label.split(" ");
        const vin = e2eVinFlow ? getE2ESavedCarVin(id) : null;
        return {
          id,
          carId: id,
          title: title || label,
          subtitle: rest.join(" "),
          ...(vin ? { vin } : {}),
        };
      });
    }

    if (!isAuthenticated) {
      return [];
    }

    return garageCars.map((row) => {
      const vin = e2eVinFlow ? getGarageItemVin(row) : null;
      if (hasGarageDisplayNames(row)) {
        return {
          ...garageItemToHeroShape(row),
          ...(vin ? { vin } : {}),
        };
      }
      const carId = row.carId?.trim() || "";
      const label =
        garageLabelOptions.find((o) => o.id === carId)?.label ?? formatGarageItemDisplayLabel(row);
      const [title, ...rest] = label.split(" ");
      return {
        id: row.id?.trim() || carId,
        carId,
        title: title || label || carId,
        subtitle: rest.join(" ").trim(),
        ...(vin ? { vin } : {}),
      };
    });
  }, [
    usesSession,
    isAuthenticated,
    garageCars,
    garageLabelOptions,
    sessionCarIds,
    sessionLabelOptions,
  ]);

  const isHeroPanelLoading =
    !hasMounted ||
    !sessionHydrated ||
    (usesSession && sessionCarIds.length > 0 && isSessionLabelsPending) ||
    (!usesSession &&
      isAuthenticated &&
      (isGarageCarsPending || (garageCarIds.length > 0 && isGarageLabelsPending)));

  const refreshSessionCarIds = useCallback(() => {
    setSessionCarIds(usesSession ? getSearchedCarIds() : []);
  }, [usesSession]);

  return {
    heroCars,
    isHeroPanelLoading,
    hasMounted,
    sessionCarIds,
    usesSession,
    refreshSessionCarIds,
  };
}
