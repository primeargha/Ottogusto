"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError } from "@/config/api";
import { usePartVinCheckMutation } from "@/hooks/vin";
import { useSubmitSupportMutation } from "@/hooks/support";
import { useAuthStore, AuthUserType } from "@/stores/useAuthStore";
import { trackPdpVinVerificationFromResult } from "@/utils/pdpVinVerificationTracking";
import {
  appendVinCompatCache,
  getCachedPartStatus,
  getCachedPartsForVin,
  getCachedVin,
  setVinCompatCache,
} from "@/utils/vinCompatibilityCache";
import {
  buildMayFitCacheForPartIds,
  buildPdpGuaranteedVinCheckSupportMessage,
  buildVinCheckResultFromCache,
  deriveVinCheckUiCase,
  formatPdpVinResponseToCache,
  mapLocaleToSupportLanguageLabel,
  type VinCheckResult,
  type VinCheckUiCase,
  VALID_VIN_REGEX,
} from "@/utils/vinCheck";

export type PdpVinCheckPhase = "idle" | "verified";

type UsePdpVinCheckParams = {
  partId: string;
  name?: string;
  title?: string;
  oeReference?: string;
  /** Unit / single-quantity price (typically `priceInclVat`). */
  price?: number | null;
};

export function usePdpVinCheck({ partId, name, title, oeReference, price }: UsePdpVinCheckParams) {
  const params = useParams();
  const languageCountry = params?.["language-country"];
  const localeSegment = Array.isArray(languageCountry) ? languageCountry[0] : languageCountry;
  const { authUser, isAuthenticated } = useAuthStore();
  const userdata = authUser as AuthUserType;
  const userEmail = userdata?.email || "";

  const [vinNumber, setVinNumber] = useState("");
  const [phase, setPhase] = useState<PdpVinCheckPhase>("idle");
  const [result, setResult] = useState<VinCheckResult | null>(null);
  const hydratedPartIdRef = useRef<string | null>(null);

  const applyVerifiedResult = useCallback((vin: string, nextResult: VinCheckResult) => {
    setResult(nextResult);
    setPhase("verified");
  }, []);

  const emitVerificationTracking = useCallback(
    (nextResult: VinCheckResult) => {
      trackPdpVinVerificationFromResult(nextResult, partId, isAuthenticated, localeSegment);
    },
    [isAuthenticated, localeSegment, partId],
  );

  const resetVinCheck = useCallback(() => {
    setPhase("idle");
    setResult(null);
  }, []);

  /** Hydrate from cache when this part was already checked for the cached VIN. */
  useEffect(() => {
    if (!partId) return;
    if (hydratedPartIdRef.current === partId) return;

    hydratedPartIdRef.current = partId;

    const cachedVin = getCachedVin();
    if (!cachedVin || !VALID_VIN_REGEX.test(cachedVin)) {
      resetVinCheck();
      setVinNumber("");
      return;
    }

    const cachedStatus = getCachedPartStatus(cachedVin, partId);
    if (!cachedStatus) {
      // VIN known from prior check, but this part is not cached yet —
      // prefill VIN only; leave editable so user can Verify if they want.
      resetVinCheck();
      setVinNumber(cachedVin);
      return;
    }

    const fullCache = getCachedPartsForVin(cachedVin);
    const nextResult = buildVinCheckResultFromCache(cachedVin, [partId], fullCache);
    setVinNumber(cachedVin);
    applyVerifiedResult(cachedVin, nextResult);
  }, [applyVerifiedResult, partId, resetVinCheck]);

  const { mutate: runPartVinCheck, isPending: isVinCheckPending } = usePartVinCheckMutation({
    onSuccess: (data, variables) => {
      const vin = (data?.data?.vinNumber || variables.vinNumber).trim().toUpperCase();
      const partsCache = formatPdpVinResponseToCache(data?.data);
      const existingVin = getCachedVin();
      if (existingVin && existingVin === vin) {
        appendVinCompatCache(vin, partsCache);
      } else {
        setVinCompatCache(vin, partsCache);
      }

      const fullCache = getCachedPartsForVin(vin);
      const nextResult = buildVinCheckResultFromCache(vin, [partId], fullCache);
      applyVerifiedResult(vin, nextResult);
      emitVerificationTracking(nextResult);
    },
    onError: (_error, variables) => {
      if (_error instanceof ApiError && _error.status === 401) return;

      const vin = variables.vinNumber.trim().toUpperCase();
      const partsCache = buildMayFitCacheForPartIds([partId]);
      const existingVin = getCachedVin();
      if (existingVin && existingVin === vin) {
        appendVinCompatCache(vin, partsCache);
      } else {
        setVinCompatCache(vin, partsCache);
      }

      const nextResult = buildVinCheckResultFromCache(vin, [partId], partsCache);
      applyVerifiedResult(vin, nextResult);
      emitVerificationTracking(nextResult);
    },
  });

  const handleVerifyVin = useCallback(() => {
    if (isVinCheckPending) return;
    const trimmed = vinNumber.trim().toUpperCase();
    if (!VALID_VIN_REGEX.test(trimmed) || !partId) return;

    const cachedStatus = getCachedPartStatus(trimmed, partId);
    if (cachedStatus) {
      const fullCache = getCachedPartsForVin(trimmed);
      const nextResult = buildVinCheckResultFromCache(trimmed, [partId], fullCache);
      applyVerifiedResult(trimmed, nextResult);
      emitVerificationTracking(nextResult);
      return;
    }

    runPartVinCheck({ vinNumber: trimmed, partIds: [partId] });
  }, [
    applyVerifiedResult,
    isVinCheckPending,
    emitVerificationTracking,
    partId,
    runPartVinCheck,
    vinNumber,
  ]);

  const handleChangeVin = useCallback(() => {
    resetVinCheck();
  }, [resetVinCheck]);

  const handleVinChange = useCallback(
    (value: string) => {
      setVinNumber(value.toUpperCase());
      if (phase === "verified") {
        resetVinCheck();
      }
    },
    [phase, resetVinCheck],
  );

  const uiCase: VinCheckUiCase | null =
    phase === "verified" && result ? deriveVinCheckUiCase(result.items) : null;

  const isValidVin = VALID_VIN_REGEX.test((vinNumber || "").trim());
  const isInputLocked = phase === "verified";

  const {
    mutate: submitSupport,
    isPending: isSubmittingSupport,
    isSuccess: isSupportSuccess,
    isError: isSupportError,
    reset: resetSupportMutation,
  } = useSubmitSupportMutation();

  const submitMaybeSupport = useCallback(
    (email: string, matchType: "MAY_FIT" | "NO_FIT" = "MAY_FIT") => {
      const trimmedVin = vinNumber.trim().toUpperCase();
      if (!email.trim() || !trimmedVin) return;

      const message = buildPdpGuaranteedVinCheckSupportMessage({
        contact: {
          firstName: userdata?.firstName || "",
          lastName: userdata?.lastName || "",
          email: email.trim(),
        },
        vin: trimmedVin,
        productId: partId,
        ...(name ? { name } : {}),
        ...(title ? { title } : {}),
        ...(oeReference ? { oeReference } : {}),
        ...(price != null ? { price } : {}),
        language: mapLocaleToSupportLanguageLabel(localeSegment),
        isAuthenticated: !!userdata,
        matchType,
      });

      submitSupport({
        firstName: userdata?.firstName || "",
        lastName: userdata?.lastName || "",
        email: email.trim(),
        category: "GuaranteedVinCheck",
        vin: trimmedVin,
        invoiceNumber: null,
        orderId: null,
        message,
        files: null,
        source: "PDP page",
      });
    },
    [localeSegment, name, oeReference, partId, price, submitSupport, title, userdata, vinNumber],
  );

  return {
    vinNumber,
    phase,
    result,
    uiCase,
    isVinCheckPending,
    isValidVin,
    isInputLocked,
    userEmail,
    isSubmittingSupport,
    isSupportSuccess,
    isSupportError,
    resetSupportMutation,
    handleVinChange,
    handleVerifyVin,
    handleChangeVin,
    submitMaybeSupport,
  };
}
