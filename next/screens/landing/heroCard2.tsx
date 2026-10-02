"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Box } from "@/components/ui/box";
import { HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import { ROTATION_INTERVAL, SEARCH_CHARACTORS } from "@/constants";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useOERefStore } from "@/stores/useOERefStore";
// import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { useMmeStore } from "@/stores/useMmeStore";
// import SavedCarHeroContainer from "./saved-car-hero-container";
import MMESearchFilter from "@/components/MMESearchFilter";
import VINSearchInput from "@/components/VINSearchInput";
import OERefSearchInput from "@/components/OERefSearchInput";
import MMESearchModal from "@/components/MMESearchModal";
import { useSavedCars } from "@/contexts/SavedCarsContext";
// import useIpadDetection from "@/hooks/useIpadDetection";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { getMMEId } from "@/utils/getMMEId";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { OGButton } from "@/components/og-components/OGButton";
import { getClientFeatureFlag } from "@/utils/theme-utils";
// import { getOeRef } from "@/services/search";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import Typography from "@/components/og-components/Typography";
import Image from "next/image";
import OGClaimtab from "@/components/og-components/OGClaimTab";
import LandingSavedcarsContainer2 from "./LandingSavedcarsContainer2";
import HeroNewCarSelectionCard from "@/components/HeroNewCarSelectionCard";
import NewHeroNewCarSelectionCard from "@/components/NewHeroNewCarSelectionCard";
import NewHeroCarDataCard from "@/components/NewHeroCarDataCard";
import HeroCarDataCard, { type HeroCarDataItem } from "@/components/HeroCarDataCard";
// import MMESearchFilter2 from "@/components/MMESearchFilter2";
import { HERO_BANNER_LABELS } from "@/data/branding/herobanner";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import ModalCross from "./ModalCross";
// import Link from "next/link";
import { useAddUpdateMyCarsToEB } from "@/hooks/garage";
import { normalizeFooterPath } from "./footer/footerLinkUtils";
import { safeNextImageSrc, safeNextLinkHref } from "@/utils/translationDisplayMode";
import Link from "next/link";
import { HERO_CAROUSEL_IMAGE_SEARCH } from "@/screens/landing/heroCarouselImage";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import {
  getSearchedCarIds,
  removeSearchedCarId,
  setEditingSearchedCarId,
  shouldUseSessionCarHistory,
} from "@/utils/searchedCarIdsSession";
import {
  clearE2ESavedCarMeta,
  getE2ESavedCarSiblingCarIds,
  getE2ESavedCarVin,
  normalizeSavedCarVin,
  resolveUrlCarIdsForSavedCar,
} from "@/utils/e2eSavedCarMeta";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { findGarageSiblingCarIdsByCarId, findGarageVinByCarId } from "@/utils/garageCarId";
import { useNewMmeGarageCarsQuery } from "@/hooks/garage";
import { useDeleteCarFromEB } from "@/hooks/garage";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useHeroCarsPanel } from "@/hooks/useHeroCarsPanel";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import HeroSearchPanelSkeleton from "@/components/HeroSearchPanelSkeleton";
import { MOBILE_HERO_SEARCH_PANEL_WRAPPER_CLASS } from "@/components/heroMobileSearchPanelLayout";
import { useUrlParams } from "@/hooks/useUrlParams";

// Use fixed count so server and client render same number of images (avoids hydration mismatch).
// Store-specific hiding of 5th banner for Ottogusto is done inside the component via rotation.
const bannerImgCount = Object.keys(HERO_BANNER_LABELS).length / 4;

const carouselContent: { title: string; subtitle: string; image: string; imageUrl: string }[] = [];
// refernce file
for (let i = 1; i <= bannerImgCount; i++) {
  carouselContent.push({
    title: `hero_title_${i}`,
    subtitle: `hero_body_${i}`,
    image: `landing_page_hero_image_${i}`,
    imageUrl: `hero_url_${i}`,
  });
}

// debugger;
type HeroCard2Props = {
  isMmeFeatureEnabled: boolean;
};

const HeroCard2 = ({ isMmeFeatureEnabled }: HeroCard2Props) => {
  const params = useParams();
  const MARKETING_QR_SESSION_KEY = "marketing_qr_modal_seen";
  const { getLabel, getLocale } = useBranding();
  const { isAuthenticated, authUser } = useAuthStore();
  const { clearSelectedCategories } = useCategorySearchStore();
  const { openOERefSearch } = useOERefStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [shouldSearchOeRef, setShouldSearchOeRef] = useState(false);
  const { openModal, resetSearch, setIsOgSearch } = useSearchModalStore();
  // ✅ Use SavedCarsContext instead of React Query (prevents duplicate API calls)
  const { savedCars: savedCarsDataFromContext, refreshSavedCars } = useSavedCars();
  // Format savedCarsData to match the expected structure (with .data property)
  const savedCarsData = savedCarsDataFromContext ? { data: savedCarsDataFromContext } : null;
  const {
    searchMode,
    setSearchMode,
    resetSearch: resetMmeSearch,
    searchData,
    partrefnumberwithoutsavedcar,
    setpartrefnumberdatawithoutsavedcar,
    setpartrefnumberwithoutsavedcar,
    partrefnumberdatawithoutsavedcar,
    resetpartrefnumberwithoutsavedcar,
    selectedSavedCarInLandingPage,
    setSelectedSavedCarInLandingPage,
  } = useMmeStore();
  // const { savedCarsData } = useSavedCarsStore();
  const router = useRouter();
  const { showRightSidebarForNewCar, showRightSidebarForHeroEdit } = useRightSidebarStore();
  const { updateFilters } = useUrlParams();
  const { locale } = useLandingPageDataStore();
  const currentLocale =
    (params as Record<string, string>)?.["language-country"] ?? locale ?? getLocale() ?? "en-BE";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [marketingApiError, setMarketingApiError] = useState<string | null>(null);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const { mutate: addUpdateMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: () => {
      refreshSavedCars();
    },
    onError: (error: any) => {
      console.error("Error saving car to garage from landing page:", error);
    },
  });

  const marketingInvalidEmailMessage =
    getLabel("marketingqr_email_inputerror") || "Please enter a valid email address";

  const marketingSchema = z.object({
    email: z.string().email(marketingInvalidEmailMessage),
    marketingConsent: z.boolean().default(false),
  });

  type MarketingFormValues = z.infer<typeof marketingSchema>;

  const {
    register: registerMarketing,
    handleSubmit: handleMarketingFormSubmit,
    formState: { errors: marketingErrors, isSubmitting: isMarketingSubmitting },
    reset: resetMarketingForm,
    watch: watchMarketingForm,
    trigger: triggerMarketingForm,
  } = useForm<MarketingFormValues>({
    resolver: zodResolver(marketingSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      marketingConsent: false,
    },
  });

  const marketingEmailValue = watchMarketingForm("email");
  const marketingConsentValue = watchMarketingForm("marketingConsent");

  const isMarketingEmailValid = marketingSchema.shape.email.safeParse(marketingEmailValue).success;

  const prevMarketingConsentRef = useRef<boolean>(marketingConsentValue);
  useEffect(() => {
    // If user checks consent while the email is still empty/invalid,
    // force validation so the email error shows immediately.
    if (!prevMarketingConsentRef.current && marketingConsentValue) {
      void triggerMarketingForm("email");
    }
    prevMarketingConsentRef.current = marketingConsentValue;
  }, [marketingConsentValue, triggerMarketingForm]);
  const partrefnumbernull = () => {
    setpartrefnumberdatawithoutsavedcar(null);
    setpartrefnumberwithoutsavedcar(null);
  };
  // Handler functions for the search interface
  const handleClearAll = () => {
    resetMmeSearch();
    if (searchMode === "oeRef") {
      resetpartrefnumberwithoutsavedcar();
    }
  };

  // Clear search data when landing on hero card (fresh search)
  useEffect(() => {
    resetMmeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFindCarParts = async () => {
    // Check if MME is fully completed (all 3 levels)
    const isFullyCompleted = searchData.make && searchData.model && searchData.engine;

    // Clear previously selected categories
    clearSelectedCategories();

    // Check if MME is partially completed (at least make is selected)
    const isPartiallyCompleted = searchData.make;

    if (searchMode === "vin" || searchMode === "manually") {
      if (isFullyCompleted) {
        const shouldShowConfirmCarPopup = getClientFeatureFlag("confirm_car_popup_feature_flag");

        if (shouldShowConfirmCarPopup) {
          // Case 2A: Fully completed MME - Open confirmation modal
          useMmeStore.getState().openMmeModal();
        } else {
          // Case 2B: Fully completed MME - Skip popup, keep redirect flow, and save car for authenticated users
          const makeModelTypeId = getMMEId(searchData);

          if (
            isAuthenticated &&
            getClientFeatureFlag("saved_car_feature_flag") &&
            makeModelTypeId
          ) {
            const carName =
              `${searchData.make?.value} ${searchData.model?.value} ${searchData.engine?.value}`.trim();

            const requestBody = {
              makeModelTypeId,
              name: carName,
              year: searchData.engine?.originalData?.yearFrom || null,
              isNew: true,
            };

            addUpdateMyCarsToEB(requestBody as any);
          }

          const url = getRouteLocaleString(Routes.categorySelection, params);
          const urlWithParams = makeModelTypeId ? `${url}?makeModelTypeId=${makeModelTypeId}` : url;
          router.push(urlWithParams);
        }
      } else if (isPartiallyCompleted) {
        // Case 1: Partially completed MME - Open Category Modal
        const url = getRouteLocaleString(Routes.categorySelection, params);
        const makeModelTypeId = getMMEId(searchData);
        const urlWithParams = makeModelTypeId ? `${url}?makeModelTypeId=${makeModelTypeId}` : url;
        router.push(urlWithParams);
      }
    } else if (searchMode === "oeRef") {
      // const response = await getOeRef(partrefnumberwithoutsavedcar);
      // setpartrefnumberdatawithoutsavedcar(response.data)
      setShouldSearchOeRef(true);
      // TODO: Implement OE Reference search functionality
    }
  };

  const handleCarSelection = (car: any) => {
    setSelectedSavedCarInLandingPage(car);
  };

  const handleSearch = (mode: "manually" | "vin" | "oeRef") => {
    setSearchMode(mode);
    if (mode === "oeRef") {
      resetpartrefnumberwithoutsavedcar();
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();
  const garageUserId = (authUser as { id?: string } | null)?.id ?? null;
  const { heroCars, isHeroPanelLoading, refreshSessionCarIds } = useHeroCarsPanel();
  const { data: garageCars = [] } = useNewMmeGarageCarsQuery();
  const { mutateAsync: deleteGarageCarAsync } = useDeleteCarFromEB();

  useEffect(() => {
    if (heroCars.length === 0) {
      useLandingHeroCarStore.getState().setSelectedCarsApiId(null);
    }
  }, [heroCars.length]);

  const handleOtherCar = useCallback(() => {
    showRightSidebarForNewCar();
  }, [showRightSidebarForNewCar]);

  const handleFindCarPartsByCarId = useCallback(
    (carId: string) => {
      if (!carId) return;
      const locale = params?.["language-country"] as string | undefined;
      const destination =
        getClientFeatureFlag("new_mme_feature_flag") && locale
          ? Routes.parts(locale)
          : "/search-results";
      const e2eVinFlow = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");
      const usesSession = shouldUseSessionCarHistory(isAuthenticated);
      // Same VIN source as banner dropdown / useNavigationVin (meta or Garage by carId).
      const savedVin = e2eVinFlow
        ? normalizeSavedCarVin(
            usesSession ? getE2ESavedCarVin(carId) : findGarageVinByCarId(garageCars, carId),
          )
        : null;
      const urlCarIds = e2eVinFlow
        ? resolveUrlCarIdsForSavedCar(carId, {
            getSiblingCarIds: (id) =>
              usesSession
                ? getE2ESavedCarSiblingCarIds(id)
                : findGarageSiblingCarIdsByCarId(garageCars, id),
          })
        : [carId];
      updateFilters(
        {
          carIds: urlCarIds,
          ...(e2eVinFlow ? { vin: savedVin } : {}),
        } as Parameters<typeof updateFilters>[0],
        destination,
        "desktop",
        false,
        true,
      );
    },
    [garageCars, isAuthenticated, params, updateFilters],
  );

  const handleDeleteHeroCar = useCallback(
    async (item: HeroCarDataItem) => {
      if (shouldUseSessionCarHistory(isAuthenticated)) {
        removeSearchedCarId(item.id);
        refreshSessionCarIds();
        // nudge other mounted useHeroCarsPanel() instances to re-read sessionStorage too
        window.dispatchEvent(new Event(HERO_CARS_REFRESH_EVENT));
        return;
      }
      if (!item.id) return;
      try {
        await deleteGarageCarAsync(item.id);
        clearE2ESavedCarMeta(item.carId || item.id);
        void queryClient.invalidateQueries({
          queryKey: queryKeys.garage.savedCars(garageUserId),
          refetchType: "all",
        });
      } catch {
        // Garage delete may fail until backend is ready.
      }
    },
    [deleteGarageCarAsync, garageUserId, isAuthenticated, queryClient, refreshSessionCarIds],
  );

  const handleEditHeroCar = useCallback(
    (item: HeroCarDataItem) => {
      const carsApiId = item.carId || item.id;
      if (shouldUseSessionCarHistory(isAuthenticated)) {
        setEditingSearchedCarId(carsApiId);
      }
      // Seed VIN before sidebar open so filters defer Cars-by-id and wait for GET /Vin.
      // Prefer meta/Garage by carId (same as Find / banner) — card `item.vin` can be stale.
      if (getClientFeatureFlag("end_to_end_vin_flow_feature_flag")) {
        const savedVin = normalizeSavedCarVin(
          shouldUseSessionCarHistory(isAuthenticated)
            ? getE2ESavedCarVin(carsApiId) || item.vin
            : item.vin,
        );
        const vinStore = useE2EVinSearchStore.getState();
        if (savedVin) {
          vinStore.setVinNumber(savedVin);
          vinStore.setSidebarVinError(null);
          vinStore.setSidebarVinBrandUnsupported(false);
          vinStore.clearVinResolvedCarIds();
        }
      }
      showRightSidebarForHeroEdit({
        carsApiId,
        myCarRecordId: item.id,
      });
    },
    [isAuthenticated, showRightSidebarForHeroEdit],
  );

  const clearMarketingQueryFlag = useCallback(() => {
    if (!searchParams?.has("marketingqr")) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("marketingqr");
    const safePathname = pathname || "/";
    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${safePathname}?${nextQuery}` : safePathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMarketingQr = searchParams?.get("marketingqr") === "1";
    if (!isMarketingQr) return;

    const hasSeenModal = sessionStorage.getItem(MARKETING_QR_SESSION_KEY) === "1";
    if (hasSeenModal) {
      clearMarketingQueryFlag();
      return;
    }

    setShowMarketingModal(true);
    clearMarketingQueryFlag();
  }, [MARKETING_QR_SESSION_KEY, clearMarketingQueryFlag, searchParams]);

  useEffect(() => {
    // iOS Safari auto-zooms inputs with small font sizes.
    // We keep a safe font-size only on iOS devices to avoid "stuck zoom" UX issues.
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    setIsIOSSafari(isIOS);
  }, []);

  useEffect(() => {
    if (!showMarketingModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showMarketingModal]);

  const closeMarketingModal = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(MARKETING_QR_SESSION_KEY, "1");
    }
    setShowMarketingModal(false);
    setMarketingApiError(null);
    resetMarketingForm();
  };

  const onMarketingSubmit = async (values: MarketingFormValues) => {
    setMarketingApiError(null);

    try {
      // eslint-disable-next-line no-console

      const response = await fetch("/api/marketing/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          marketingConsent: values.marketingConsent,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Marketing signup failed");
      }
      // Close only after successful API call.
      closeMarketingModal();
    } catch (error: any) {
      setMarketingApiError(error?.message || "Marketing signup failed");
    }
  };

  // PERF/LCP: only mount slide 0 until after first paint; avoids competing downloads for slides 2–5.
  const [carouselSlidesReady, setCarouselSlidesReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setCarouselSlidesReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!carouselSlidesReady) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselContent.length);
    }, 15_000);

    return () => clearInterval(interval);
  }, [carouselSlidesReady]);

  // Always render the "new MME" hero search panel (Image 2 gap):
  // - Prevent initial "image-only" paint when flags/hasMounted haven't resolved yet.
  // - Avoid mounting legacy MME UI on first load.
  const showSavedCars = false;
  const isNewMmeFeatureEnabled = true;
  const showHeroSearchColumn = true;
  const localeForFlags =
    (params as Record<string, string> | null)?.["language-country"] ?? undefined;
  const isE2EVinFlowEnabled = getClientFeatureFlag(
    "end_to_end_vin_flow_feature_flag",
    localeForFlags,
  );
  // E2E empty state (VIN + select car) is taller than the saved-car slider. While loading we don't
  // yet know heroCars.length, but if E2E flow is on, assume the taller layout so the skeleton isn't
  // capped at 259px and then jumps taller once cars load in as empty.
  const expectTallHeroPanel = isE2EVinFlowEnabled && (isHeroPanelLoading || heroCars.length === 0);

  return (
    <Box
      className={`h-full w-full flex-col base:gap-0 base:py-3 gtsm:flex gtsm:gap-6 gtsm:py-10 gtlg:gap-6 gtlg:py-10`}
    >
      <Box className="h-full flex-col items-center gap-10 justify-self-center gtsm:items-start">
        {showSavedCars ? (
          // <SavedCarHeroContainer />
          <LandingSavedcarsContainer2
            data={savedCarsData?.data ?? []}
            onCarSelect={handleCarSelection}
            selectedCar={selectedSavedCarInLandingPage}
          />
        ) : (
          <>
            {/* this is the parent block — E2E card is taller (VIN + or); allow auto height */}
            <Box
              className={`flex w-full flex-col gap-3 base:items-stretch gtsm:flex-row gtsm:items-stretch gtsm:justify-start gtsm:gap-6 gtlg:flex-row gtlg:gap-6 ${
                expectTallHeroPanel
                  ? "gtsm:h-auto gtsm:max-h-none gtlg:h-auto gtlg:max-h-none"
                  : "gtsm:h-[259px] gtsm:max-h-[259px] gtlg:h-[259px] gtlg:max-h-[259px]"
              }`}
            >
              <Box
                className={`base:order-2 base:flex base:w-full base:flex-col gtsm:order-1 gtsm:h-full gtsm:min-h-0 gtsm:w-[440px] gtsm:min-w-[440px] gtsm:max-w-[440px] gtsm:basis-0 gtlg:order-1 ${MOBILE_HERO_SEARCH_PANEL_WRAPPER_CLASS}`}
              >
                {isHeroPanelLoading ? (
                  <HeroSearchPanelSkeleton showVin={isE2EVinFlowEnabled} />
                ) : isE2EVinFlowEnabled ? (
                  heroCars.length > 0 ? (
                    <NewHeroCarDataCard
                      cars={heroCars}
                      onOpenOtherCar={handleOtherCar}
                      onFindCarParts={handleFindCarPartsByCarId}
                      onDeleteCar={handleDeleteHeroCar}
                      onEditCar={handleEditHeroCar}
                    />
                  ) : (
                    <NewHeroNewCarSelectionCard />
                  )
                ) : heroCars.length > 0 ? (
                  <HeroCarDataCard
                    cars={heroCars}
                    onOpenOtherCar={handleOtherCar}
                    onFindCarParts={handleFindCarPartsByCarId}
                    onDeleteCar={handleDeleteHeroCar}
                    onEditCar={handleEditHeroCar}
                  />
                ) : (
                  <HeroNewCarSelectionCard />
                )}
              </Box>

              {/* This is the picture block — match parent height (stretch when E2E card is taller) */}
              <Box
                className={`relative base:order-1 base:max-h-[170px] base:min-h-[170px] base:w-full base:pb-2 gtsm:order-2 gtsm:max-w-full gtsm:flex-1 gtsm:pb-0 gtlg:order-2 gtlg:flex-1 gtlg:pb-0 ${
                  expectTallHeroPanel
                    ? "gtsm:h-auto gtsm:max-h-none gtsm:min-h-0 gtlg:h-auto gtlg:max-h-none gtlg:min-h-0"
                    : "gtsm:h-[259px] gtsm:max-h-[259px] gtsm:min-h-[259px] gtlg:h-[259px] gtlg:max-h-[259px] gtlg:min-h-[259px]"
                }`}
              >
                <Box
                  className={`relative flex h-full min-h-0 w-full flex-col items-start justify-end overflow-hidden base:max-h-[170px] base:min-h-[170px] base:py-4 base:pl-4 gtsm:py-0 gtsm:pl-0 gtlg:py-0 gtlg:pl-0 ${
                    expectTallHeroPanel
                      ? "gtsm:h-full gtsm:max-h-none gtsm:min-h-0 gtlg:h-full gtlg:max-h-none gtlg:min-h-0"
                      : "gtsm:h-[259px] gtsm:max-h-[259px] gtsm:min-h-[259px] gtlg:h-[259px] gtlg:max-h-[259px] gtlg:min-h-[259px]"
                  }`}
                >
                  {/* Carousel Images Container */}
                  <Box className="absolute inset-0 cursor-pointer">
                    {carouselContent.map((node, index) => {
                      if (index > 0 && !carouselSlidesReady) return null;
                      // const imageUrl = getLabel(node.imageUrl);
                      const rawUrl = getLabel(node.imageUrl, { locale: currentLocale });
                      const href = normalizeFooterPath(rawUrl, currentLocale);
                      return (
                        <Box
                          key={index}
                          className="absolute inset-0 z-[1] cursor-pointer transition-transform duration-700 ease-in-out"
                          style={{
                            transform: `translateX(${(index - currentIndex) * 100}%)`,
                          }}
                          // onClick={() => {
                          //   const url = getLabel(node.imageUrl);
                          //   if (url) window.open(url, "_blank", "noopener,noreferrer");
                          // }}
                        >
                          <Link href={safeNextLinkHref(href)} key={index}>
                            <Image
                              src={`${safeNextImageSrc(getLabel(node.image))}${HERO_CAROUSEL_IMAGE_SEARCH}`}
                              alt={getLabel(node.subtitle)}
                              fill
                              priority={index === 0}
                              fetchPriority={index === 0 ? "high" : "auto"}
                              className="cursor-pointer object-cover object-center opacity-100"
                              sizes="(max-width: 639px) 100vw, 736px"
                            />
                          </Link>
                        </Box>
                      );
                    })}
                    <Box className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
                    <Box className="border-3 absolute bottom-[-1px] right-[-1px] z-[10] border-color-border-default bg-color-border-default [clip-path:polygon(0_100%,100%_100%,100%_0)] base:h-[66px] base:w-[108px] gtsm:h-[48px] gtsm:w-[80px] gtlg:h-[48px] gtlg:w-[80px]" />
                  </Box>

                  {/* Foreground Content — Figma: padding 24px 120px 24px 32px, gap 8px */}
                  <Box className="relative z-10 flex w-full flex-col items-start justify-end gap-2 base:pb-0 gtsm:p-6 gtsm:pl-8 gtsm:pr-[120px] gtlg:p-6 gtlg:pl-8 gtlg:pr-[120px]">
                    <Typography className="text-color-text-inverse typography-heading-02">
                      {getLabel(
                        carouselContent[currentIndex % carouselContent.length]?.title ??
                          "hero_title_1",
                      )}
                    </Typography>

                    <Typography className="text-color-text-inverse typography-subtitle-01">
                      {getLabel(
                        carouselContent[currentIndex % carouselContent.length]?.subtitle ??
                          "hero_body_1",
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Box
        className={`hidden max-h-[80px] min-h-20 w-full items-center justify-center rounded-md border border-color-border-emphasis bg-color-background-emphasis md:block gtlg:flex`}
      >
        <OGClaimtab itemsCount={4} />
      </Box>

      {/* MMESearchModal */}
      <MMESearchModal cars={savedCarsData?.data ?? []} />
      {showMarketingModal && (
        <Box className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <Box
            // @ts-ignore
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] overflow-hidden rounded-[8px] bg-color-background-default shadow-xl"
          >
            <Box className="flex flex-row items-center justify-between border-b border-color-border-default px-6 py-4">
              <Typography className="typography-heading-05 text-color-text-body">
                {getLabel("marketing_modal_title")}
              </Typography>
              <button type="button" onClick={closeMarketingModal} aria-label="Close modal">
                <ModalCross className="text-color-icon-emphasis" />
              </button>
            </Box>
            <Box className="flex flex-col gap-5 px-6 py-8">
              <Typography className="text-color-text-default typography-body-02">
                {getLabel("marketing_modal_body")}
              </Typography>
              <Box className="flex w-full flex-col gap-3">
                <input
                  type="email"
                  {...registerMarketing("email")}
                  placeholder={getLabel("marketingqr_email_input")}
                  className="h-[42px] w-full rounded-[4px] border border-color-border-default px-[10px] text-[14px] outline-none focus:border-color-border-focus"
                  style={isIOSSafari ? { fontSize: "16px", lineHeight: "18px" } : undefined}
                />
                {marketingErrors.email?.message ? (
                  <Typography className="mt-[6px] font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main [font-feature-settings:'liga'_off,'clig'_off]">
                    {marketingErrors.email?.message}
                  </Typography>
                ) : null}

                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" {...registerMarketing("marketingConsent")} />
                  <Typography className="typography-body-03 text-color-text-default">
                    {getLabel("marketingqr_email_checkbox")}
                  </Typography>
                </label>

                {marketingApiError ? (
                  <Typography className="mt-[6px] font-Overpass text-[16px] font-normal leading-[18px] text-color-system-error-main [font-feature-settings:'liga'_off,'clig'_off]">
                    {`Error connecting to the server, please try again later.`}
                  </Typography>
                ) : null}
              </Box>
            </Box>
            <Box className="flex w-full flex-row items-center justify-between border border-t-color-border-default p-6">
              <Box></Box>
              <OGButton
                onClick={handleMarketingFormSubmit(onMarketingSubmit)}
                disabled={isMarketingSubmitting || !isMarketingEmailValid}
                className="px-4"
              >
                {getLabel("marketing_modal_cta")}
              </OGButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HeroCard2;
