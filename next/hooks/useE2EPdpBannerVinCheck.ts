"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ApiError } from "@/config/api";
import { usePartVinCheckMutation } from "@/hooks/vin";
import { useSubmitSupportMutation } from "@/hooks/support";
import { useAuthStore, AuthUserType } from "@/stores/useAuthStore";
import { trackPdpVinVerificationFromResult } from "@/utils/pdpVinVerificationTracking";
import {
  appendVinCompatCache,
  getCachedPartStatus,
  getCachedPartsForVin,
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
  type VinMatchStatus,
  VALID_VIN_REGEX,
} from "@/utils/vinCheck";
import {
  buildPdpPartVinCheckKey,
  isCurrentPdpPartVinCheckKey,
  shouldResetPdpBannerVinCheckOnUrlVinLoss,
} from "@/utils/pdpBannerVinCheckUrl";

export type E2EPdpBannerVinStatus = VinMatchStatus | null;

type UseE2EPdpBannerVinCheckParams = {
  partId: string;
  name?: string | undefined;
  title?: string | undefined;
  oeReference?: string | undefined;
  price?: number | null | undefined;
  /** When false, hook is idle (non-PDP surfaces). */
  enabled?: boolean | undefined;
};

/**
 * PDP New banner part Fit/Maybe/No check (`POST /Vin`).
 * - Auto on load when URL has valid `vin` + partId
 * - Manual via `runPartCheckForVin` on **Add car VIN** (alongside GET /Vin/{vin} car search)
 * Reuses `vin_compatibility_cache` — skip network when (vin, partId) already cached.
 */
export function useE2EPdpBannerVinCheck({
  partId,
  name,
  title,
  oeReference,
  price,
  enabled = true,
}: UseE2EPdpBannerVinCheckParams) {
  const searchParams = useSearchParams();
  const params = useParams();
  const languageCountry = params?.["language-country"];
  const localeSegment = Array.isArray(languageCountry) ? languageCountry[0] : languageCountry;
  const { authUser, isAuthenticated } = useAuthStore();
  const userdata = authUser as AuthUserType;
  const userEmail = userdata?.email || "";

  const urlVin = (searchParams?.get("vin")?.trim().toUpperCase() ?? "") || null;
  const hasValidUrlVin = Boolean(urlVin && VALID_VIN_REGEX.test(urlVin));

  const [phase, setPhase] = useState<"idle" | "loading" | "verified">("idle");
  const [result, setResult] = useState<VinCheckResult | null>(null);
  /** VIN that drove the latest part-check (URL or Add car VIN), for chrome before URL updates. */
  const [checkedVin, setCheckedVin] = useState<string | null>(null);
  const lastCheckedKeyRef = useRef<string | null>(null);
  const maybeSupportSentKeyRef = useRef<string | null>(null);
  /** Tracks prior URL `vin` so BACK (lose vin) can reset without wiping mid-Add. */
  const prevUrlVinRef = useRef<string | null>(null);

  const applyVerifiedResult = useCallback((vin: string, nextResult: VinCheckResult) => {
    setCheckedVin(vin);
    setResult(nextResult);
    setPhase("verified");
  }, []);

  const emitVerificationTracking = useCallback(
    (nextResult: VinCheckResult) => {
      trackPdpVinVerificationFromResult(nextResult, partId, isAuthenticated, localeSegment);
    },
    [isAuthenticated, localeSegment, partId],
  );

  const clearPartCheckState = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setCheckedVin(null);
    lastCheckedKeyRef.current = null;
    maybeSupportSentKeyRef.current = null;
  }, []);

  const { mutate: runPartVinCheck, isPending: isVinCheckPending } = usePartVinCheckMutation({
    onSuccess: (data, variables) => {
      const vin = (data?.data?.vinNumber || variables.vinNumber).trim().toUpperCase();
      const checkedPartId = variables.partIds[0]?.trim();
      if (!vin || !checkedPartId) return;
      // Browser BACK (or clear) invalidated this check — do not re-apply Fit chrome.
      if (!isCurrentPdpPartVinCheckKey(lastCheckedKeyRef.current, vin, checkedPartId)) return;

      const partsCache = formatPdpVinResponseToCache(data?.data);
      const existing = getCachedPartsForVin(vin);
      if (Object.keys(existing).length > 0) {
        appendVinCompatCache(vin, partsCache);
      } else {
        setVinCompatCache(vin, partsCache);
      }
      const fullCache = getCachedPartsForVin(vin);
      const nextResult = buildVinCheckResultFromCache(vin, [checkedPartId], fullCache);
      applyVerifiedResult(vin, nextResult);
      emitVerificationTracking(nextResult);
    },
    onError: (_error, variables) => {
      if (_error instanceof ApiError && _error.status === 401) {
        setPhase("idle");
        setResult(null);
        return;
      }
      const vin = variables.vinNumber.trim().toUpperCase();
      const checkedPartId = variables.partIds[0]?.trim();
      if (!vin || !checkedPartId) return;
      if (!isCurrentPdpPartVinCheckKey(lastCheckedKeyRef.current, vin, checkedPartId)) return;

      const partsCache = buildMayFitCacheForPartIds([checkedPartId]);
      const existing = getCachedPartsForVin(vin);
      if (Object.keys(existing).length > 0) {
        appendVinCompatCache(vin, partsCache);
      } else {
        setVinCompatCache(vin, partsCache);
      }
      const nextResult = buildVinCheckResultFromCache(vin, [checkedPartId], partsCache);
      applyVerifiedResult(vin, nextResult);
      emitVerificationTracking(nextResult);
    },
  });

  const runPartCheckForVin = useCallback(
    (rawVin: string) => {
      if (!enabled) return;
      const trimmedPartId = partId?.trim() ?? "";
      const vin = rawVin.trim().toUpperCase();
      if (!trimmedPartId || !VALID_VIN_REGEX.test(vin)) return;

      const checkKey = buildPdpPartVinCheckKey(vin, trimmedPartId);
      lastCheckedKeyRef.current = checkKey;

      const cachedStatus = getCachedPartStatus(vin, trimmedPartId);
      if (cachedStatus) {
        const fullCache = getCachedPartsForVin(vin);
        const nextResult = buildVinCheckResultFromCache(vin, [trimmedPartId], fullCache);
        applyVerifiedResult(vin, nextResult);
        emitVerificationTracking(nextResult);
        return;
      }

      setPhase("loading");
      setResult(null);
      setCheckedVin(vin);
      runPartVinCheck({ vinNumber: vin, partIds: [trimmedPartId] });
    },
    [applyVerifiedResult, emitVerificationTracking, enabled, partId, runPartVinCheck],
  );

  /** Auto part check when PDP URL already has `vin`; reset when URL loses `vin` (BACK). */
  useEffect(() => {
    if (!enabled) {
      clearPartCheckState();
      prevUrlVinRef.current = urlVin;
      return;
    }

    const trimmedPartId = partId?.trim() ?? "";
    if (!trimmedPartId) {
      clearPartCheckState();
      prevUrlVinRef.current = urlVin;
      return;
    }

    const previousUrlVin = prevUrlVinRef.current;
    prevUrlVinRef.current = urlVin;

    if (!hasValidUrlVin || !urlVin) {
      if (shouldResetPdpBannerVinCheckOnUrlVinLoss(previousUrlVin, urlVin)) {
        // URL lost vin (browser BACK / deselect / car switch cleared vin) → MME chrome.
        clearPartCheckState();
      }
      // Else: keep last Add-car-VIN result until URL gains vin — do not wipe mid-check.
      return;
    }

    const checkKey = buildPdpPartVinCheckKey(urlVin, trimmedPartId);
    if (lastCheckedKeyRef.current === checkKey) return;
    lastCheckedKeyRef.current = checkKey;

    const cachedStatus = getCachedPartStatus(urlVin, trimmedPartId);
    if (cachedStatus) {
      const fullCache = getCachedPartsForVin(urlVin);
      const nextResult = buildVinCheckResultFromCache(urlVin, [trimmedPartId], fullCache);
      applyVerifiedResult(urlVin, nextResult);
      emitVerificationTracking(nextResult);
      return;
    }

    setPhase("loading");
    setResult(null);
    setCheckedVin(urlVin);
    runPartVinCheck({ vinNumber: urlVin, partIds: [trimmedPartId] });
  }, [
    applyVerifiedResult,
    clearPartCheckState,
    emitVerificationTracking,
    enabled,
    hasValidUrlVin,
    partId,
    runPartVinCheck,
    urlVin,
  ]);

  const uiCase: VinCheckUiCase | null =
    phase === "verified" && result ? deriveVinCheckUiCase(result.items) : null;

  const partStatus: E2EPdpBannerVinStatus =
    phase === "verified" && result?.items[0] ? result.items[0].isMatch : null;

  const displayVin = (urlVin || checkedVin || "").trim().toUpperCase() || null;
  const hasFitResult = phase === "verified" && partStatus != null;

  const {
    mutate: submitSupport,
    isPending: isSubmittingSupport,
    isSuccess: isSupportSuccess,
    isError: isSupportError,
    reset: resetSupportMutation,
  } = useSubmitSupportMutation();

  // New VIN check (edit VIN / Add car VIN) → re-enable guest Request CTA; keep typed email.
  useEffect(() => {
    resetSupportMutation();
  }, [displayVin, partId, resetSupportMutation]);

  useEffect(() => {
    if (phase === "loading") {
      resetSupportMutation();
    }
  }, [phase, resetSupportMutation]);

  /** Logged-in: auto Freshdesk ticket on MAY_FIT / NO_FIT (auth email). */
  useEffect(() => {
    if (!enabled || !isAuthenticated || !userEmail.trim()) return;
    if ((partStatus !== "MAY_FIT" && partStatus !== "NO_FIT") || !displayVin || !partId) return;

    const supportKey = `${displayVin}:${partId}:${partStatus}:${userEmail.trim().toLowerCase()}`;
    if (maybeSupportSentKeyRef.current === supportKey) return;
    maybeSupportSentKeyRef.current = supportKey;

    const message = buildPdpGuaranteedVinCheckSupportMessage({
      contact: {
        firstName: userdata?.firstName || "",
        lastName: userdata?.lastName || "",
        email: userEmail.trim(),
      },
      vin: displayVin,
      productId: partId,
      ...(name ? { name } : {}),
      ...(title ? { title } : {}),
      ...(oeReference ? { oeReference } : {}),
      ...(price != null ? { price } : {}),
      language: mapLocaleToSupportLanguageLabel(localeSegment),
      isAuthenticated: true,
      matchType: partStatus,
    });

    submitSupport({
      firstName: userdata?.firstName || "",
      lastName: userdata?.lastName || "",
      email: userEmail.trim(),
      category: "GuaranteedVinCheck",
      vin: displayVin,
      invoiceNumber: null,
      orderId: null,
      message,
      files: null,
      source: "PDP page",
    });
  }, [
    displayVin,
    enabled,
    isAuthenticated,
    localeSegment,
    name,
    oeReference,
    partId,
    partStatus,
    price,
    submitSupport,
    title,
    userEmail,
    userdata?.firstName,
    userdata?.lastName,
  ]);

  /** Guest: manual email + Request Information → same GuaranteedVinCheck Support API. */
  const submitGuestSupport = useCallback(
    (email: string) => {
      const trimmedEmail = email.trim();
      if (
        !enabled ||
        isAuthenticated ||
        !trimmedEmail ||
        !displayVin ||
        !partId ||
        (partStatus !== "MAY_FIT" && partStatus !== "NO_FIT")
      ) {
        return;
      }

      const message = buildPdpGuaranteedVinCheckSupportMessage({
        contact: {
          firstName: "",
          lastName: "",
          email: trimmedEmail,
        },
        vin: displayVin,
        productId: partId,
        ...(name ? { name } : {}),
        ...(title ? { title } : {}),
        ...(oeReference ? { oeReference } : {}),
        ...(price != null ? { price } : {}),
        language: mapLocaleToSupportLanguageLabel(localeSegment),
        isAuthenticated: false,
        matchType: partStatus,
      });

      submitSupport({
        firstName: "",
        lastName: "",
        email: trimmedEmail,
        category: "GuaranteedVinCheck",
        vin: displayVin,
        invoiceNumber: null,
        orderId: null,
        message,
        files: null,
        source: "PDP page",
      });
    },
    [
      displayVin,
      enabled,
      isAuthenticated,
      localeSegment,
      name,
      oeReference,
      partId,
      partStatus,
      price,
      submitSupport,
      title,
    ],
  );

  const isChecking = enabled && (phase === "loading" || isVinCheckPending);
  const needsGuestSupportEmail =
    enabled &&
    !isAuthenticated &&
    hasFitResult &&
    (partStatus === "MAY_FIT" || partStatus === "NO_FIT");

  return {
    urlVin,
    hasValidUrlVin,
    displayVin,
    hasFitResult,
    isChecking,
    phase,
    partStatus,
    uiCase,
    result,
    isAuthenticated,
    needsGuestSupportEmail,
    isSubmittingSupport,
    isSupportSuccess,
    isSupportError,
    resetSupportMutation,
    submitGuestSupport,
    /** Call on Add car VIN — `POST /Vin` part Fit check (cache-aware). */
    runPartCheckForVin,
  };
}
