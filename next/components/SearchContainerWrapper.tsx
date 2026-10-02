"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";
import SearchContainer from "./SearchContainer";
import { usePathname, useSearchParams } from "next/navigation";
import { detectPage } from "@/utils/detectPage";
import { useUrlParams } from "@/hooks/useUrlParams";
import { checkPartCompatibility } from "@/services/productdetailsservice";
import { useBranding } from "@/contexts/BrandingContext";
import { askConfirmation } from "@/utils/confirmation";
import { getClientFeatureFlag } from "@/utils/theme-utils";

interface SearchContainerWrapperProps {
  matchingcars?: any;
  onEnterClick?: () => void;
  onSelectCar?: () => void;
  tempData?: any;
  partId?: string;
}

export default function SearchContainerWrapper({
  matchingcars,
  onEnterClick,
  onSelectCar,
  tempData,
  partId,
}: SearchContainerWrapperProps) {
  const pathname = usePathname();
  const { updateFilters } = useUrlParams();
  const { getLabel } = useBranding();
  // Detect the current page type using the centralized detectPage function
  const currentPageType = React.useMemo(() => {
    if (!pathname) return "search-results";
    const pageType = detectPage(pathname);

    return pageType;
  }, [pathname]);

  const searchParams = useSearchParams();
  const makeModelTypeIdFromUrl = searchParams?.get("makeModelTypeId");
  const { searchData } = useMmeStore();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Feature flags (client-side) — deferred to after mount to prevent hydration mismatch
  const enableIncompatibilityCheck =
    isMounted && getClientFeatureFlag("Notcompatibilepop_up_feature_flag");
  const isMmeFeatureEnabled = isMounted ? getClientFeatureFlag("mme_feature_flag") : true;
  const showSelectedCarComponentOnPDP = isMounted
    ? currentPageType === "product-details"
      ? getClientFeatureFlag("selected_car_componentPDP_feature_flag")
      : true
    : true;

  // Track if modal has been shown to prevent multiple popups
  const hasShownModalRef = React.useRef(false);

  // Track the current makeModelTypeId being checked to ignore stale results
  const currentCheckRef = React.useRef<string | null>(null);

  // Determine if the selected car is incompatible
  const [isIncompatible, setIsIncompatible] = React.useState<boolean>(false);

  // Track if compatibility check is in progress to prevent popup during check
  const [isCheckingCompatibility, setIsCheckingCompatibility] = React.useState<boolean>(false);

  // ✅ Only check compatibility API if makeModelTypeId exists in URL
  // If no makeModelTypeId, set isIncompatible = false (green background)
  React.useEffect(() => {
    // Reset modal flag and incompatible state when makeModelTypeId changes
    hasShownModalRef.current = false;
    setIsIncompatible(false); // Reset to false immediately to prevent stale state issues
    setIsCheckingCompatibility(true); // Mark that we're checking

    // If feature flag disables compatibility check, skip API and popup entirely
    if (!enableIncompatibilityCheck) {
      setIsIncompatible(false);
      setIsCheckingCompatibility(false);
      currentCheckRef.current = null;
      return;
    }

    // If no makeModelTypeId in URL, don't check compatibility - set to compatible (green)
    if (!makeModelTypeIdFromUrl) {
      setIsIncompatible(false);
      setIsCheckingCompatibility(false);
      currentCheckRef.current = null;
      return;
    }

    // Store the current makeModelTypeId we're checking
    const currentMakeModelTypeId = makeModelTypeIdFromUrl;
    currentCheckRef.current = currentMakeModelTypeId;

    // Only check compatibility if makeModelTypeId exists
    const checkCompatibility = async () => {
      const result = await checkPartCompatibility(currentMakeModelTypeId, partId || "");

      // Only update state if this is still the current check (makeModelTypeId hasn't changed)
      if (currentCheckRef.current === currentMakeModelTypeId) {
        const incompatible = !result.isCompatible;

        setIsIncompatible(incompatible);
        setIsCheckingCompatibility(false); // Mark check as complete

        // ✅ Single source of truth: Show popup directly from API response
        if (incompatible && currentPageType === "product-details" && !hasShownModalRef.current) {
          hasShownModalRef.current = true;

          // Show confirmation modal with primary and secondary actions
          askConfirmation(
            getLabel("mismatch_vehicle_title") || "Vehicle Not Compatible",
            getLabel("mismatch_vehicle_pdp_body") ||
              "The selected vehicle is not compatible with this product. Would you like to view compatible products?",
            "confirm",
            // Primary Action: "View Compatible Products" - redirect to /products with makeModelTypeId
            () => {
              updateFilters(
                {
                  makeModelTypeId: currentMakeModelTypeId,
                },
                "/products",
              );
            },
            // Secondary Action: "Stay on Page" - dismiss modal (no callback needed, modal closes automatically)
            undefined,
            // Secondary button text
            getLabel("action_stay_on_page") || "Stay on Page",
            // Primary button text
            getLabel("action_view_compatible_products") || "View Compatible Products",
          );
        } else if (!incompatible) {
          // If compatible, ensure modal flag is reset (in case it was set from previous incompatible car)
          hasShownModalRef.current = false;
        }
      } else {
      }
    };
    checkCompatibility();
  }, [
    makeModelTypeIdFromUrl,
    partId,
    currentPageType,
    updateFilters,
    getLabel,
    enableIncompatibilityCheck,
  ]);

  return (
    <>
      {showSelectedCarComponentOnPDP && isMmeFeatureEnabled && (
        <SearchContainer
          isIncompatible={isIncompatible}
          onEnterClick={onEnterClick ?? (() => {})}
          onSelectCar={onSelectCar ?? (() => {})}
          tempData={tempData}
        />
      )}
    </>
  );
}
