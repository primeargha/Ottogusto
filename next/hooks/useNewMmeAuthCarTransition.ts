"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { queryKeys } from "@/lib/query-keys";
import { clearEditingSearchedCarId } from "@/utils/searchedCarIdsSession";

/** Skip one guest `ensureSearchedCarIds` after logout (URL may still hold logged-in car ids). */
export const skipGuestUrlSyncAfterLogoutRef = { current: false };

/** After guest→login, banner replaces stale guest URL `carIds` with first Garage car when loaded. */
export const pendingGarageUrlSyncAfterLoginRef = { current: false };

let authEpoch = 0;
const authEpochListeners = new Set<() => void>();

let modulePrevAuth: boolean | null = null;
let modulePrevUserId: string | null = null;

function subscribeAuthEpoch(listener: () => void) {
  authEpochListeners.add(listener);
  return () => authEpochListeners.delete(listener);
}

function getAuthEpoch() {
  return authEpoch;
}

function bumpAuthEpoch() {
  authEpoch += 1;
  authEpochListeners.forEach((listener) => listener());
}

/**
 * Keeps guest session car history and logged-in Garage lists isolated on auth changes.
 * Safe to call from multiple components — transition runs once per auth flip.
 */
export function useNewMmeAuthCarTransition() {
  const queryClient = useQueryClient();
  const { isAuthenticated, authUser } = useAuthStore();
  const userId = (authUser as { id?: string } | null)?.id ?? null;

  const authEpochSnapshot = useSyncExternalStore(subscribeAuthEpoch, getAuthEpoch, getAuthEpoch);

  useEffect(() => {
    const prevAuth = modulePrevAuth;
    const prevUserId = modulePrevUserId;

    if (prevAuth === null) {
      modulePrevAuth = isAuthenticated;
      modulePrevUserId = userId;
      return;
    }

    const authChanged = prevAuth !== isAuthenticated;
    if (!authChanged) {
      modulePrevUserId = userId;
      return;
    }

    clearEditingSearchedCarId();
    useLandingHeroCarStore.getState().setSelectedCarsApiId(null);

    if (prevAuth && !isAuthenticated) {
      if (prevUserId) {
        queryClient.removeQueries({
          queryKey: queryKeys.garage.savedCars(prevUserId),
        });
      }
      queryClient.removeQueries({
        queryKey: queryKeys.garage.savedCars("anonymous"),
      });
      skipGuestUrlSyncAfterLogoutRef.current = true;
    } else if (!prevAuth && isAuthenticated) {
      pendingGarageUrlSyncAfterLoginRef.current = true;
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.garage.savedCars(userId),
          refetchType: "all",
        });
      }
    }

    modulePrevAuth = isAuthenticated;
    modulePrevUserId = userId;
    bumpAuthEpoch();
  }, [isAuthenticated, queryClient, userId]);

  return { authEpoch: authEpochSnapshot };
}
