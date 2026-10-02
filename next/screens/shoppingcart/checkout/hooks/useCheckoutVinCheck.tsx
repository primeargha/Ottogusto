"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/config/api";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";
import { useVinCheckMutation } from "@/hooks/cart";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useTabsStore } from "@/stores/useTabsStore";
import { clearVinSupportDedupeForCartAndVin } from "@/utils/checkoutSupportDedupe";
import {
  appendVinCompatCache,
  areAllPartsCached,
  getCachedPartsForVin,
  getCachedVin,
  getUncachedPartIds,
  setVinCompatCache,
} from "@/utils/vinCompatibilityCache";
import {
  buildMayFitCacheForPartIds,
  buildVinCheckResultFromCache,
  deriveVinCheckUiCase,
  formatCheckoutVinResponseToCache,
  type VinCheckResult,
  type VinCheckUiCase,
  VALID_VIN_REGEX,
} from "@/utils/vinCheck";
import { trackVinVerification } from "@/utils/gtm";
import { buildVinCheckPayload } from "../utils/buildVinCheckPayload";
import type { OrderVinCheckPayload } from "@/type";

export type VinCheckPhase = "idle" | "verified";

export type VinCheckSupportState = {
  verified: boolean;
  result: VinCheckResult | null;
};

function parseCartItemIdsKey(key: string): Map<string, number> {
  const map = new Map<string, number>();
  if (!key) return map;
  for (const part of key.split(",")) {
    const [id, qty] = part.split(":");
    if (id) map.set(id, Number(qty) || 1);
  }
  return map;
}

export function useCheckoutVinCheck(options?: { enabled?: boolean }) {
  /** When false, skip VinCheck API / cache hydrate (pre–VIN-check Support-only checkout). Default true preserves current behavior. */
  const enabled = options?.enabled ?? true;
  const router = useRouter();
  const shoppingCartHref = useShoppingCartHref();
  const { isAuthenticated } = useAuthStore();
  const activeTab = useTabsStore((state) => state.activeTab);
  const {
    cartid,
    cartitems,
    savedBillingAddresses,
    guestBillingFormData,
    guestDeliveryFormData,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    isSameShipping,
    warehouseAddress,
    removeItem,
    setiscartchanged,
  } = useCartStore();

  const [vinNumber, setVinNumber] = useState("");
  const [vinError, setVinError] = useState(false);
  const [phase, setPhase] = useState<VinCheckPhase>("idle");
  const [result, setResult] = useState<VinCheckResult | null>(null);
  const cartSnapshotRef = useRef<string>("");
  const vinCheckSupportRef = useRef<VinCheckSupportState>({ verified: false, result: null });
  const hasHydratedFromCacheRef = useRef(false);
  const pendingHydrationFetchRef = useRef(false);

  const syncVinCheckSupportState = useCallback((next: VinCheckSupportState) => {
    vinCheckSupportRef.current = next;
  }, []);

  const getVinCheckSupportState = useCallback((): VinCheckSupportState => {
    return vinCheckSupportRef.current;
  }, []);

  const hasSavedAddresses = (savedBillingAddresses?.length ?? 0) > 0;

  const partCartItems = useMemo(() => (cartitems ?? []).filter((item) => item.id), [cartitems]);

  const cartItemIdsKey = useMemo(
    () => partCartItems.map((i) => `${i.id}:${i.quantity}`).join(","),
    [partCartItems],
  );

  const uiCase: VinCheckUiCase | null = useMemo(() => {
    if (phase !== "verified" || !result) return null;
    return deriveVinCheckUiCase(result.items);
  }, [phase, result]);

  const applyVerifiedResult = useCallback(
    (vin: string, nextResult: VinCheckResult) => {
      clearVinSupportDedupeForCartAndVin(cartid, vin);
      syncVinCheckSupportState({ verified: true, result: nextResult });
      setResult(nextResult);
      setPhase("verified");
    },
    [cartid, syncVinCheckSupportState],
  );

  const resetVinCheck = useCallback(() => {
    syncVinCheckSupportState({ verified: false, result: null });
    setPhase("idle");
    setResult(null);
  }, [syncVinCheckSupportState]);

  const persistCacheFromApiResponse = useCallback(
    (
      vin: string,
      requestedIds: string[],
      apiItems: Array<{ id?: string; isMatch?: unknown }> | undefined,
    ) => {
      const normalizedVin = vin.trim().toUpperCase();
      const apiCache = formatCheckoutVinResponseToCache(apiItems, requestedIds);
      const existingVin = getCachedVin();

      if (!existingVin || existingVin !== normalizedVin) {
        setVinCompatCache(normalizedVin, apiCache);
      } else {
        appendVinCompatCache(normalizedVin, apiCache);
      }
    },
    [],
  );

  const buildMergedResultFromCache = useCallback(
    (vin: string, partIds: string[]): VinCheckResult => {
      const normalizedVin = vin.trim().toUpperCase();
      const fullCache = getCachedPartsForVin(normalizedVin);
      return buildVinCheckResultFromCache(normalizedVin, partIds, fullCache);
    },
    [],
  );

  const { mutate: runVinCheck, isPending: isVinCheckPending } = useVinCheckMutation({
    onSuccess: (data, variables) => {
      const vin = variables.vinNumber.trim().toUpperCase();
      const requestedIds = (variables.items ?? [])
        .map((item) => item.id)
        .filter(Boolean) as string[];
      persistCacheFromApiResponse(vin, requestedIds, data?.data?.items);

      const allIds = partCartItems.map((i) => i.id);
      const merged = buildMergedResultFromCache(vin, allIds);
      applyVerifiedResult(vin, merged);
      pendingHydrationFetchRef.current = false;
    },
    onError: (error, variables) => {
      if (error instanceof ApiError && error.status === 401) return;

      const vin = variables.vinNumber.trim().toUpperCase();
      const requestedIds = (variables.items ?? [])
        .map((item) => item.id)
        .filter(Boolean) as string[];
      const errorCache = buildMayFitCacheForPartIds(requestedIds);
      const existingVin = getCachedVin();

      if (!existingVin || existingVin !== vin) {
        setVinCompatCache(vin, errorCache);
      } else {
        appendVinCompatCache(vin, errorCache);
      }

      const allIds = partCartItems.map((i) => i.id);
      const merged = buildMergedResultFromCache(vin, allIds);
      applyVerifiedResult(vin, merged);
      pendingHydrationFetchRef.current = false;
    },
  });

  const runVinCheckForPartIds = useCallback(
    (vin: string, partIds: string[]) => {
      if (!partIds.length || !VALID_VIN_REGEX.test(vin.trim())) return;

      const itemsToCheck = partCartItems
        .filter((item) => partIds.includes(item.id))
        .map((item) => ({ id: item.id, quantity: item.quantity ?? 1 }));

      if (!itemsToCheck.length) return;

      const payload = buildVinCheckPayload({
        activeTab,
        isAuthenticated,
        hasSavedAddresses,
        guestBillingFormData,
        guestDeliveryFormData,
        selectedSavedBillingAddress,
        selectedSavedDeliveryAddress,
        isSameShipping,
        warehouseAddress,
        cartid: cartid || null,
        items: itemsToCheck,
        vinNumber: vin.trim(),
      });

      runVinCheck(payload as unknown as OrderVinCheckPayload);
    },
    [
      activeTab,
      cartid,
      guestBillingFormData,
      guestDeliveryFormData,
      hasSavedAddresses,
      isAuthenticated,
      isSameShipping,
      partCartItems,
      runVinCheck,
      selectedSavedBillingAddress,
      selectedSavedDeliveryAddress,
      warehouseAddress,
    ],
  );

  useEffect(() => {
    if (!enabled) {
      hasHydratedFromCacheRef.current = true;
      return;
    }
    if (hasHydratedFromCacheRef.current || !partCartItems.length) return;

    const cachedVin = getCachedVin();
    if (!cachedVin) {
      hasHydratedFromCacheRef.current = true;
      return;
    }

    const partIds = partCartItems.map((i) => i.id);
    setVinNumber(cachedVin);
    hasHydratedFromCacheRef.current = true;

    const uncached = getUncachedPartIds(cachedVin, partIds);
    if (!uncached.length) {
      const merged = buildMergedResultFromCache(cachedVin, partIds);
      applyVerifiedResult(cachedVin, merged);
      return;
    }

    pendingHydrationFetchRef.current = true;
    runVinCheckForPartIds(cachedVin, uncached);
  }, [
    applyVerifiedResult,
    buildMergedResultFromCache,
    enabled,
    partCartItems,
    runVinCheckForPartIds,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (phase !== "verified") {
      cartSnapshotRef.current = cartItemIdsKey;
      return;
    }

    const prevKey = cartSnapshotRef.current;
    if (!prevKey || prevKey === cartItemIdsKey) {
      cartSnapshotRef.current = cartItemIdsKey;
      return;
    }

    if (!partCartItems.length) {
      resetVinCheck();
      cartSnapshotRef.current = cartItemIdsKey;
      return;
    }

    const prevMap = parseCartItemIdsKey(prevKey);
    const nextMap = parseCartItemIdsKey(cartItemIdsKey);
    const currentVin = vinNumber.trim().toUpperCase();

    let hasNewOrIncreased = false;
    for (const [id, qty] of nextMap) {
      if (!prevMap.has(id) || qty > (prevMap.get(id) ?? 0)) {
        hasNewOrIncreased = true;
        break;
      }
    }

    if (hasNewOrIncreased && VALID_VIN_REGEX.test(currentVin)) {
      const partIds = partCartItems.map((i) => i.id);
      const uncached = getUncachedPartIds(currentVin, partIds);
      if (uncached.length > 0) {
        runVinCheckForPartIds(currentVin, uncached);
      } else if (areAllPartsCached(currentVin, partIds)) {
        const merged = buildMergedResultFromCache(currentVin, partIds);
        setResult(merged);
        syncVinCheckSupportState({ verified: true, result: merged });
      }
    } else {
      const cartIds = new Set(partCartItems.map((i) => i.id));
      setResult((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => cartIds.has(i.id)) } : null,
      );
    }

    cartSnapshotRef.current = cartItemIdsKey;
  }, [
    buildMergedResultFromCache,
    cartItemIdsKey,
    enabled,
    partCartItems,
    phase,
    resetVinCheck,
    runVinCheckForPartIds,
    syncVinCheckSupportState,
    vinNumber,
  ]);

  const handleVinChange = useCallback(
    (value: string) => {
      setVinNumber(value.toUpperCase());
      if (phase === "verified") {
        resetVinCheck();
      }
    },
    [phase, resetVinCheck],
  );

  const handleVinError = useCallback((hasError: boolean) => {
    setVinError(hasError);
  }, []);

  const handleVerifyVin = useCallback(() => {
    if (!enabled) return;
    const trimmed = vinNumber.trim().toUpperCase();
    if (!VALID_VIN_REGEX.test(trimmed) || !partCartItems.length) return;

    // Count each verification attempt for GTM/GA4 (same event as previous manual VIN check)
    trackVinVerification();

    const allIds = partCartItems.map((i) => i.id);
    const uncached = getUncachedPartIds(trimmed, allIds);

    if (!uncached.length) {
      const merged = buildMergedResultFromCache(trimmed, allIds);
      applyVerifiedResult(trimmed, merged);
      return;
    }

    runVinCheckForPartIds(trimmed, uncached);
  }, [
    applyVerifiedResult,
    buildMergedResultFromCache,
    enabled,
    partCartItems,
    runVinCheckForPartIds,
    vinNumber,
  ]);

  const handleChangeVin = useCallback(() => {
    resetVinCheck();
  }, [resetVinCheck]);

  const handleRemoveNoFitItem = useCallback(
    (itemId: string) => {
      const willBeEmpty = partCartItems.length === 1 && partCartItems[0]?.id === itemId;

      removeItem(itemId);
      setiscartchanged(true);
      setResult((prev) => {
        const next = prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null;
        if (next) {
          syncVinCheckSupportState({ verified: true, result: next });
        }
        return next;
      });

      if (willBeEmpty) {
        resetVinCheck();
        router.push(shoppingCartHref);
      }
    },
    [
      partCartItems,
      removeItem,
      resetVinCheck,
      router,
      shoppingCartHref,
      setiscartchanged,
      syncVinCheckSupportState,
    ],
  );

  const isValidVin = VALID_VIN_REGEX.test((vinNumber || "").trim());
  const isInputLocked = phase === "verified";

  return {
    vinNumber,
    vinError,
    phase,
    result,
    uiCase,
    isVinCheckPending,
    isValidVin,
    isInputLocked,
    handleVinChange,
    handleVinError,
    handleVerifyVin,
    handleChangeVin,
    handleRemoveNoFitItem,
    resetVinCheck,
    getVinCheckSupportState,
  };
}
