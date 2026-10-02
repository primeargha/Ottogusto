"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Box } from "@/components/ui/box";
import { OGAlert } from "@/components/og-components/OGAlert";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import Typography from "@/components/og-components/Typography";
import SearchResultsSearchedCarsDropdown, {
  SearchResultsCarIcon,
} from "@/components/SearchResultsSearchedCarsDropdown";
import { WarningCarTick } from "@/components/WarningCarTick";
import VinCheckCircleIcon from "@/components/icons/VinCheckCircleIcon";
import { useBranding } from "@/contexts/BrandingContext";
import { useE2EPdpBannerVinCheck } from "@/hooks/useE2EPdpBannerVinCheck";
import { useE2EVinFindCarParts } from "@/hooks/useE2EVinFindCarParts";
import { useSearchResultsCarBannerModel } from "@/hooks/useSearchResultsCarBannerModel";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { VALID_VIN_REGEX } from "@/utils/vinCheck";
import CategoryCarSelectionBannerSkeleton from "./CategoryCarSelectionBannerSkeleton";

export type NewSearchResultsCarSelectionBannerProps = {
  applyBasePath?: string | undefined;
  /** PDP surface — enables auto part VIN check + Fit/Maybe/No chrome. */
  surface?: "listing" | "pdp" | undefined;
  partId?: string | undefined;
  productName?: string | undefined;
  productTitle?: string | undefined;
  oeReference?: string | undefined;
  price?: number | null | undefined;
};

type BannerChrome = "neutral" | "positive" | "warning" | "skeleton" | "info";

/**
 * E2E VIN flow search banner (`New` prefix). Catalog / L1–L3 / SRP / PDP.
 * Flag off → callers mount the old `SearchResultsCarSelectionBanner` instead.
 */
export default function NewSearchResultsCarSelectionBanner({
  applyBasePath,
  surface = "listing",
  partId = "",
  productName,
  productTitle,
  oeReference,
  price,
}: NewSearchResultsCarSelectionBannerProps) {
  const { getLabel } = useBranding();
  const isPdp = surface === "pdp";
  const params = useParams();
  const languageCountryParam = params?.["language-country"];
  const languageCountrySegment = Array.isArray(languageCountryParam)
    ? languageCountryParam[0]
    : languageCountryParam;

  const model = useSearchResultsCarBannerModel({ applyBasePath });
  const {
    listingBase,
    pathname,
    urlVin,
    hasUrlCar,
    primaryCarId,
    hasDropdownOptions,
    labelOptions,
    selectedLabelLoading,
    setDropdownOpen,
    showRightSidebarPanel,
    showRightSidebarForNewCar,
    handleDropdownSelect,
    handleDeselectCar,
    handleEditCar,
  } = model;

  const {
    isChecking,
    partStatus,
    hasFitResult,
    runPartCheckForVin,
    needsGuestSupportEmail,
    isSubmittingSupport,
    isSupportSuccess,
    isSupportError,
    resetSupportMutation,
    submitGuestSupport,
  } = useE2EPdpBannerVinCheck({
    partId,
    name: productName,
    title: productTitle,
    oeReference,
    price,
    enabled: isPdp && Boolean(partId?.trim()),
  });

  const { runVinFindCarParts, isVinFindPending } = useE2EVinFindCarParts();

  /**
   * MME arrival (carIds, no VIN): always show green “most likely compatible” + Add car VIN.
   * Do not drive banner chrome from MakeModelType check (404 / not-compatible → orange was wrong UX).
   * Confirmed Fit / Maybe / No only after VIN → POST /Vin (PDP only).
   */
  const isMmeArrival = isPdp && hasUrlCar && !urlVin;

  const [draftVin, setDraftVin] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailError, setGuestEmailError] = useState<string | undefined>();

  // After VIN re-check: keep email, clear field validation + rely on hook reset for CTA.
  useEffect(() => {
    setGuestEmailError(undefined);
  }, [urlVin]);

  const getLabelText = useCallback(
    (key: string, fallback: string) => {
      const translated = getLabel(key);
      if (!translated || translated === key) return fallback;
      return translated;
    },
    [getLabel],
  );

  /** PDP VIN result chrome only — listing (car-parts / L1–L3 / SRP) keeps neutral/positive by car. */
  const chrome: BannerChrome = useMemo(() => {
    if (isPdp && isChecking) return "skeleton";
    if (isPdp && hasFitResult && partStatus === "FIT") return "positive";
    if (isPdp && hasFitResult && partStatus === "MAY_FIT") return "info";
    if (isPdp && hasFitResult && partStatus === "NO_FIT") return "warning";
    if (hasUrlCar) return "positive";
    return "neutral";
  }, [hasFitResult, hasUrlCar, isChecking, isPdp, partStatus]);

  const borderClasses =
    chrome === "warning"
      ? "border-t border-b border-color-border-warning"
      : chrome === "info"
        ? "border-t border-b border-color-border-info"
        : chrome === "positive" || chrome === "skeleton"
          ? "border-t border-b border-color-border-positive"
          : "border-t border-b border-color-border-emphasis";

  const backgroundClasses =
    chrome === "warning"
      ? "bg-color-background-warning-muted"
      : chrome === "info"
        ? "bg-color-background-info-muted"
        : chrome === "positive" || chrome === "skeleton"
          ? "bg-color-background-positive-muted"
          : "bg-color-background-emphasis";

  const headline = useMemo(() => {
    // PDP Fit / Maybe / No headlines (guest + logged-in). BG chrome unchanged.
    if (isPdp && hasFitResult && partStatus === "FIT") {
      // Figma FIT: same long shipping copy as `pdp_vin_may_fit_message`.
      return getLabelText(
        "pdp_vin_fit_message",
        "Product compatible with selected car. We'll contact you before shipping if any issues arise.",
      );
    }
    if (isPdp && hasFitResult && partStatus === "MAY_FIT") {
      return getLabelText(
        "pdp_vin_compatibility_expert_verification_required",
        "Our experts will verify the compatibility. Enter your email and we'll contact you in 3 business hours.",
      );
    }
    if (isPdp && hasFitResult && partStatus === "NO_FIT") {
      return getLabelText("pdp_vin_not_fit_message", "Product not compatible with selected car.");
    }
    if (isMmeArrival) {
      return getLabelText(
        "pdp_mme_may_fit_message",
        "Product most likely compatible with selected car. Enter VIN for fitment check.",
      );
    }
    if (hasUrlCar) {
      // PDP: urlVin can go true before the Fit/Maybe/No check resolves (car switch, re-check).
      // Avoid flashing the listing-only "Showing products compatible with" copy during that gap
      // — the skeleton below covers the `isChecking` window, this covers the render before it flips.
      if (isPdp) {
        return getLabelText(
          "pdp_mme_may_fit_message",
          "Product most likely compatible with selected car. Enter VIN for fitment check.",
        );
      }
      return getLabelText("vehicle_compatible_label", "Showing products compatible with");
    }
    return isPdp
      ? getLabelText("pdp_identify_your_vehicle", "Identify your vehicle to verify compatibility")
      : getLabelText("identify_your_vehicle", "Identify your vehicle to view compatible products");
  }, [getLabelText, hasFitResult, hasUrlCar, isMmeArrival, isPdp, partStatus]);

  const isPdpMaybeOrNo =
    isPdp && hasFitResult && (partStatus === "MAY_FIT" || partStatus === "NO_FIT");

  /** Always show URL VIN when present (incl. guest Maybe/No — under the car dropdown). */
  const showVinReadOnly = Boolean(urlVin);
  /** FIT / no-result: VIN chip inline beside dropdown. Maybe/No: under dropdown (mockups). */
  const showVinInline = showVinReadOnly && !isPdpMaybeOrNo;
  const showVinUnderDropdown = showVinReadOnly && isPdpMaybeOrNo;
  /** Enter VIN + Add car VIN — PDP only, and only when URL has no `vin` (doc §4.6 / §5). */
  const showVinEntry = isPdp && !urlVin && !needsGuestSupportEmail;

  /**
   * PDP Maybe/No: always show MME car dropdown + Edit (even when `carIds`/history is empty —
   * e.g. VIN part check NO_FIT after car search failed). Keep listing/FIT gating unchanged.
   */
  const showCarDropdown = isPdpMaybeOrNo || hasUrlCar || hasDropdownOptions;
  const showEditCar = isPdpMaybeOrNo || Boolean(hasUrlCar && primaryCarId);
  const handlePdpEditCar = () => {
    if (primaryCarId) {
      handleEditCar();
      return;
    }

    // Doc §4.4: Edit with `?vin=` opens sidebar with VIN + Make/Model from VIN resolve.
    // Do NOT use Add-new-car (`showRightSidebarForNewCar`) — that clears VIN / suppresses URL hydrate.
    if (urlVin) {
      const store = useE2EVinSearchStore.getState();
      store.setVinUrlHydrationSuppressed(false);
      const trimmedVin = urlVin.trim().toUpperCase();
      const sameVin = store.vinNumber.trim().toUpperCase() === trimmedVin;
      if (!sameVin) {
        store.setVinNumber(trimmedVin);
        store.setSidebarVinError(null);
        store.setSidebarVinBrandUnsupported(false);
      } else if (!store.vinNumber.trim()) {
        store.setVinNumber(trimmedVin);
      }
      // Force sidebar live GET /Vin so Make/Model (or Case 2) refreshes for this open.
      store.clearVinResolvedCarIds();
      showRightSidebarPanel();
      return;
    }

    showRightSidebarForNewCar();
  };

  const addCarVinLabel = getLabelText("compatibleCar_addCarVin", "Add car VIN");

  const handleAddCarVin = () => {
    const trimmed = draftVin.trim().toUpperCase();
    if (!trimmed || !VALID_VIN_REGEX.test(trimmed)) return;

    const destination = (pathname ?? listingBase).split("?")[0] || listingBase;

    // Do NOT reflect `vin` in the URL here — writing it before car resolution
    // resolves would make every page's useUrlVinValidation() re-check the same
    // VIN and hard-404 the whole page on a no-match/unsupported-brand result,
    // instead of the recoverable inline sidebar error runVinFindCarParts already
    // shows for that case. On success, navigateVinCatalogSuccess writes `vin`
    // (+ carIds) to the URL itself.
    setDraftVin("");

    // (1) Part Fit/Maybe/No — POST /Vin { vinNumber, partIds } (cache-aware). Drives banner chrome.
    runPartCheckForVin(trimmed);

    // (2) Car search — GET /Vin/{vin} (same as homepage). Errors → sidebar with VIN prefilled.
    void runVinFindCarParts(trimmed, {
      destinationOverride: destination,
    });
  };

  const validateGuestEmail = (value: string): boolean => {
    if (!value.trim()) {
      setGuestEmailError(getLabel("email_required"));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      setGuestEmailError(getLabel("email_invalid_errormessage"));
      return false;
    }
    setGuestEmailError(undefined);
    return true;
  };

  const handleRequestInformation = () => {
    if (!validateGuestEmail(guestEmail)) return;
    resetSupportMutation();
    submitGuestSupport(guestEmail);
  };

  const draftVinValid = VALID_VIN_REGEX.test(draftVin.trim().toUpperCase());
  const vinReadOnlyChip =
    showVinReadOnly && urlVin ? (
      <Box className="flex shrink-0 flex-row items-center gap-space-xs">
        {chrome === "warning" || chrome === "info" ? (
          <>
            <Typography className="text-color-text-default typography-body-strong-02">
              {getLabelText("banner_vin_label", "VIN")}:
            </Typography>
            <Typography className="text-color-text-default typography-body-02">{urlVin}</Typography>
            <VinCheckCircleIcon
              className={
                chrome === "info"
                  ? "h-5 w-5 shrink-0 text-color-icon-info"
                  : "h-5 w-5 shrink-0 text-color-icon-emphasis"
              }
            />
          </>
        ) : (
          <>
            <Typography className="text-color-text-positive typography-body-01">
              {getLabelText("banner_vin_label", "VIN")}: {urlVin}
            </Typography>
            <VinCheckCircleIcon className="h-5 w-5 shrink-0 text-color-icon-positive" />
          </>
        )}
      </Box>
    ) : null;

  const vinEntryRow = showVinEntry ? (
    <Box className="flex min-w-0 flex-1 flex-row items-center gap-space-sm gtsm:w-full">
      <Box className="min-w-[100px] flex-1 base:max-w-[197px] gtsm:max-w-[257px]">
        <OGTextInput
          value={draftVin}
          onChange={(v) => setDraftVin(String(v).toUpperCase())}
          placeholder={getLabelText("pdp_enter_vin_label", "Enter VIN")}
          maxLength={17}
          className="w-full base:max-w-[197px] gtsm:max-w-[257px]"
        />
      </Box>
      <OGButton
        type="outlined"
        className="shrink-0 whitespace-nowrap"
        disabled={!draftVinValid || isVinFindPending || isChecking}
        onClick={handleAddCarVin}
      >
        {addCarVinLabel}
      </OGButton>
    </Box>
  ) : null;

  /** Email + CTA only — success/error alerts render on the line below so they do not stretch this row.
   * `items-start` (not center): keep Request Information aligned with the input when the email
   * error message grows the left column height.
   */
  const guestSupportRow = needsGuestSupportEmail ? (
    <Box className="flex min-w-0 flex-1 flex-row items-start gap-space-sm base:w-full base:justify-between gtsm:justify-start">
      <Box className="min-w-0 flex-1 base:max-w-[197px] gtsm:max-w-none gtlg:max-w-[318px]">
        <OGTextInput
          value={guestEmail}
          onChange={(v) => {
            setGuestEmail(String(v));
            setGuestEmailError(undefined);
            resetSupportMutation();
          }}
          placeholder={getLabelText("enter_email_address", "Enter email address")}
          state={guestEmailError ? "error" : "default"}
          error={guestEmailError}
          className="w-full"
        />
      </Box>
      <OGButton
        type="outlined"
        className="h-auto shrink-0 self-start whitespace-nowrap"
        disabled={isSubmittingSupport || isSupportSuccess}
        isLoading={isSubmittingSupport}
        onClick={handleRequestInformation}
      >
        {getLabelText("request_information", "Request Information")}
      </OGButton>
    </Box>
  ) : null;

  const guestSupportFeedback =
    isPdp && needsGuestSupportEmail && (isSupportSuccess || isSupportError) ? (
      <Box className="w-full">
        {isSupportSuccess ? (
          <OGAlert
            variant="transparent"
            title=""
            paddingClasses="px-0"
            description={getLabelText(
              "vin_verification_success_title",
              "Message sent! We'll get back to you within 3 business hours with a clear answer.",
            )}
          />
        ) : null}
        {isSupportError ? (
          <OGAlert
            variant="error"
            title=""
            paddingClasses="px-0"
            description={getLabelText(
              "vin_verification_error_title",
              "Vin number not found. Please check and try again.",
            )}
          />
        ) : null}
      </Box>
    ) : null;

  if (!getClientFeatureFlag("new_mme_feature_flag", languageCountrySegment)) {
    return null;
  }

  if (!hasUrlCar && !hasDropdownOptions && !urlVin) {
    const selectCarLabel = getLabelText("pick_select_car", "Select car");
    // Catalog/SRP: Select car only. PDP: Select car + empty VIN + Add car VIN (doc §5).
    return (
      <div className={`sdadv w-full ${borderClasses} ${backgroundClasses}`}>
        <Box className="flex flex-col justify-start gap-4 py-4 section-standard gtsm:flex-col gtsm:py-6">
          <Box className="flex flex-row items-start gap-space-xl">
            <SearchResultsCarIcon compatible={false} className="base:hidden gtsm:block" />
            <Box className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2">
              <Typography className="text-color-text-emphasis typography-heading-04">
                {headline}
              </Typography>
              <Box className="flex w-full flex-col items-stretch gap-2 gtsm:flex-row gtsm:items-center">
                <OGButton
                  type="outlined"
                  className="shrink-0 base:w-full gtsm:w-auto"
                  onClick={showRightSidebarPanel}
                >
                  {selectCarLabel}
                </OGButton>
                {isPdp && showVinEntry && (
                  <Box className="flex w-full flex-row items-center gap-space-sm gtsm:w-auto">
                    <Box className="gtsm:max-w-[257px]shrink-0 w-full base:max-w-[197px]">
                      <OGTextInput
                        value={draftVin}
                        onChange={(v) => setDraftVin(String(v).toUpperCase())}
                        placeholder={getLabelText("pdp_enter_vin_label", "Enter VIN")}
                        maxLength={17}
                        className="w-full base:max-w-[197px] gtsm:max-w-[257px]"
                      />
                    </Box>
                    <OGButton
                      type="outlined"
                      className="shrink-0"
                      disabled={!draftVinValid || isVinFindPending || isChecking}
                      onClick={handleAddCarVin}
                    >
                      {addCarVinLabel}
                    </OGButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    );
  }

  const iconCompatible = chrome !== "warning" && chrome !== "info" && hasUrlCar;

  return (
    <div
      className={`w-full transition-colors duration-300 ease-in-out ${borderClasses} ${backgroundClasses}`}
    >
      {isPdp && isChecking ? (
        <CategoryCarSelectionBannerSkeleton />
      ) : (
        <Box className="flex min-h-[120px] flex-col gap-4 py-4 section-standard gtsm:flex-row gtsm:items-center gtsm:gap-8 gtsm:py-space-xl">
          <div className="base:hidden gtsm:block">
            {chrome === "warning" || chrome === "info" ? (
              <span
                style={{
                  color:
                    chrome === "info"
                      ? "var(--color-border-info, #0077A8)"
                      : "var(--color-border-warning, #C46215)",
                }}
              >
                <WarningCarTick className="h-20 w-20" />
              </span>
            ) : (
              <SearchResultsCarIcon compatible={iconCompatible} />
            )}
          </div>

          <Box className="flex min-w-0 flex-1 flex-col gap-space-xs">
            <Typography className="text-color-text-emphasis typography-heading-04">
              {headline}
            </Typography>

            {/* fix here */}
            <Box
              className={`flex w-full flex-col items-stretch base:gap-space-xs gtsm:flex-col gtsm:items-start gtsm:gap-space-xs gtlg:flex-row ${
                guestSupportRow ? "gtlg:items-start" : "gtlg:items-center"
              } gtlg:gap-space-sm`}
            >
              {showCarDropdown && (
                <Box
                  className={`flex min-w-0 gap-space-xs gtsm:w-full gtlg:w-auto ${
                    // Guest support row: keep dropdown+VIN stacked so VIN sits under the dropdown
                    // while the outer gtlg row stays flex-row (dropdown | email | Request).
                    needsGuestSupportEmail
                      ? "flex-col"
                      : showCarDropdown
                        ? "base:flex-col gtsm:flex-col gtlg:flex-row"
                        : "gtsm:flex-col gtlg:flex-col"
                  }`}
                >
                  <Box className="flex items-center gap-space-sm base:w-full base:flex-row base:justify-between gtsm:flex-row gtsm:justify-start">
                    <SearchResultsSearchedCarsDropdown
                      options={labelOptions}
                      selectedCarId={hasUrlCar ? primaryCarId : null}
                      onSelectCar={handleDropdownSelect}
                      onAddNewCar={showRightSidebarForNewCar}
                      onDeselectCar={handleDeselectCar}
                      onDropdownOpenChange={setDropdownOpen}
                      labelsLoading={selectedLabelLoading}
                      // Maybe/No: keep interactive so “Add new car” works with empty history.
                      disabled={labelOptions.length === 0 && !isPdpMaybeOrNo}
                    />
                    {showEditCar && (
                      <OGButton
                        className="text-color-primary-default shrink-0 text-sm font-medium base:flex gtsm:flex gtlg:hidden"
                        onClick={handlePdpEditCar}
                        type="ghost"
                      >
                        {getLabelText("edit_car", "Edit car")}
                      </OGButton>
                    )}
                  </Box>

                  {showVinUnderDropdown ? (
                    <div
                      className={
                        needsGuestSupportEmail
                          ? // Guest: under-dropdown VIN only on gtlg; gtsm places it below email row.
                            "base:hidden gtsm:hidden gtlg:flex"
                          : "base:hidden gtsm:flex"
                      }
                    >
                      {vinReadOnlyChip}
                    </div>
                  ) : null}
                </Box>
              )}

              <div className="base:hidden gtsm:flex">{showVinInline ? vinReadOnlyChip : null}</div>

              {vinEntryRow}
              {guestSupportRow}

              {/* gtsm guest support: VIN below email / Request Information (tablet mockup). */}
              {showVinUnderDropdown && needsGuestSupportEmail ? (
                <div className="base:hidden gtsm:flex gtlg:hidden">{vinReadOnlyChip}</div>
              ) : null}
            </Box>

            {guestSupportFeedback}

            <div className="base:flex gtsm:hidden">{vinReadOnlyChip}</div>
          </Box>

          {showEditCar && (
            <OGButton
              className="text-color-primary-default shrink-0 whitespace-nowrap base:hidden gtsm:self-center gtlg:ml-4 gtlg:flex"
              onClick={handlePdpEditCar}
              type="ghost"
            >
              {getLabelText("edit_car", "Edit car")}
            </OGButton>
          )}
        </Box>
      )}
    </div>
  );
}
