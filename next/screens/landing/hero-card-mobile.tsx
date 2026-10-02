"use client";

import { Box } from "@/components/ui/box";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import { ROTATION_INTERVAL, SEARCH_CHARACTORS } from "@/constants";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import FullScreenModal from "../oe-search/mobile-modal";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import SavedCarHeroMobileContainer from "./saved-car-hero-mobile-container";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useRouter, useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { getMMEId } from "@/utils/getMMEId";
import MMESearchModal from "@/components/MMESearchModal";
import { useMmeStore } from "@/stores/useMmeStore";
import MMESearchFilter from "@/components/MMESearchFilter";
import VINSearchInput from "@/components/VINSearchInput";
import OERefSearchInput from "@/components/OERefSearchInput";
import { OGButton } from "@/components/og-components/OGButton";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useMedia } from "@/hooks/useMedia";
import LandingSavedcarsContainer from "./LandingSavedcarsContainer2";
import HeroNewCarSelectionCard from "@/components/HeroNewCarSelectionCard";
import HeroCarDataCard, { type HeroCarDataItem } from "@/components/HeroCarDataCard";
import HeroSearchPanelSkeleton from "@/components/HeroSearchPanelSkeleton";
import { MOBILE_HERO_SEARCH_PANEL_HEIGHT } from "@/components/heroMobileSearchPanelLayout";
import { useHeroCarsPanel } from "@/hooks/useHeroCarsPanel";
import Typography from "@/components/og-components/Typography";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import { useUrlParams } from "@/hooks/useUrlParams";
import {
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
import { useDeleteCarFromEB, useNewMmeGarageCarsQuery } from "@/hooks/garage";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";

const ROTATING_WORDS = [
  "hero_t2_dyn_1",
  "hero_t2_dyn_2",
  "hero_t2_dyn_3",
  "hero_t2_dyn_4",
  "hero_t2_dyn_5",
];
const ROTATING_WORDS_LOGGEDIN = [
  "hero_t2_dyn_1_loggedin",
  "hero_t2_dyn_2_loggedin",
  "hero_t2_dyn_3_loggedin",
  "hero_t2_dyn_4_loggedin",
  "hero_t2_dyn_5_loggedin",
];

const HeroCardMobile = () => {
  const { getLabel } = useBranding();
  const { isAuthenticated, authUser } = useAuthStore();
  const { clearSelectedCategories } = useCategorySearchStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0); // Add this state
  const { openModal, resetSearch, setIsOgSearch } = useSearchModalStore();
  const [isOpen, setIsOpen] = useState(false);
  // ✅ Use SavedCarsContext instead of React Query (prevents duplicate API calls)
  const { savedCars: savedCarsDataFromContext } = useSavedCars();
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
  const router = useRouter();
  const params = useParams();
  // const { savedCarsData } = useSavedCarsStore();
  // Always use new hero search panel on mobile (matches desktop); avoids old MME flash before mount.
  const isNewMmeFeatureEnabled = true;
  const { showRightSidebarForNewCar, showRightSidebarForHeroEdit } = useRightSidebarStore();
  const { updateFilters } = useUrlParams();
  const queryClient = useQueryClient();
  const garageUserId = (authUser as { id?: string } | null)?.id ?? null;
  const { heroCars, isHeroPanelLoading, refreshSessionCarIds } = useHeroCarsPanel();
  const { data: garageCars = [] } = useNewMmeGarageCarsQuery();
  const { mutateAsync: deleteGarageCarAsync } = useDeleteCarFromEB();

  const handleOtherCar = () => showRightSidebarForNewCar();
  const handleFindCarPartsByCarId = (carId: string) => {
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
  };
  const handleDeleteHeroCar = async (item: HeroCarDataItem) => {
    if (shouldUseSessionCarHistory(isAuthenticated)) {
      removeSearchedCarId(item.id);
      refreshSessionCarIds();
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
  };
  const handleEditHeroCar = (item: HeroCarDataItem) => {
    const carsApiId = item.carId || item.id;
    if (shouldUseSessionCarHistory(isAuthenticated)) {
      setEditingSearchedCarId(carsApiId);
    }
    if (getClientFeatureFlag("end_to_end_vin_flow_feature_flag")) {
      // Prefer meta by carId (same as Find / banner) — card `item.vin` can be stale.
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
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentWordIndex(0);
      setAnimationKey((prev) => prev + 1); // Increment key to force animation restart
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      }, ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleCarSelection = (car: any) => {
    setSelectedSavedCarInLandingPage(car);
  };

  const renderLoggedOutContent = () => (
    <Box className="absolute top-0 flex h-[120px] w-full flex-col items-center justify-center text-center">
      <Typography
        type="h2"
        className="absolute top-[18px] items-center justify-center text-center text-white"
      >
        {getLabel("hero_t2_loggedout")}
      </Typography>

      <Box className="absolute top-[66px] h-[54px] w-[211px] items-center justify-center overflow-hidden bg-transparent text-center">
        {/* Container box */}
        <Box className="h-full w-fit bg-transparent">
          {/* Animated green background */}
          <Box
            key={animationKey}
            className="h-full w-fit animate-expandWidth whitespace-nowrap bg-color-primary-main pr-1"
          >
            {/* Text content */}

            <Box className="ml-[4px] items-center justify-center overflow-hidden text-center font-Anton text-[44px] font-normal leading-[52px] text-[--color-highway-400m]">
              {ROTATING_WORDS[currentWordIndex] && getLabel(ROTATING_WORDS[currentWordIndex])}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderLoggedInContent = () => (
    <Box className="absolute left-0 top-4 flex h-auto w-full flex-col items-center justify-center text-center">
      <Typography type="h2" className="mb-1 text-color-text-on-brand">
        {/* @ts-ignore */}
        {authUser?.firstName // @ts-ignore
          ? `${getLabel("hero_loggedin_welcome", { username: authUser?.firstName })}!`
          : `${getLabel("welcome")}!`}
      </Typography>
      {/* other texts */}
      {/* <Box className="mb-1 font-Anton text-[44px] font-normal leading-[52px] text-white">
        {getLabel("hero_t2_loggedin")}
      </Box>
      <Box className="flex h-[54px] w-[211px] items-center justify-center bg-transparent">
        <Box className="flex h-full w-fit animate-expandWidth items-center justify-center whitespace-nowrap bg-[--brand-racing-green] pr-1">
          <Box className="ml-[4px] font-Anton text-[44px] font-normal leading-[52px] text-[--brand-highway-yellow]">
            {getLabel(ROTATING_WORDS_LOGGEDIN[currentWordIndex])}
          </Box>
        </Box>
      </Box> */}
    </Box>
  );
  const isMobile = useMedia("(max-width: 639px)");
  const isSmallMobile = useMedia("(max-width: 380px)");

  return (
    <Box className="absolute top-0 animate-fadeIn justify-self-center sm:block md:hidden">
      <Box className="relative h-full w-[372px]">
        {isAuthenticated ? renderLoggedInContent() : renderLoggedOutContent()}
        {/* Full-Screen Modal */}
        {isOpen && <FullScreenModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
        <>
          {getClientFeatureFlag("saved_car_feature_flag") &&
          !isNewMmeFeatureEnabled &&
          isAuthenticated &&
          savedCarsData?.data &&
          savedCarsData?.data.length > 0 ? (
            <Box className="absolute top-[70px] w-full">
              <LandingSavedcarsContainer
                data={savedCarsData?.data}
                onCarSelect={handleCarSelection}
                selectedCar={selectedSavedCarInLandingPage}
              />
            </Box>
          ) : null}
          {/* Sprint 35 search panel renders in heroCard2 (in-flow below hero image); this overlay was mispositioned. */}
        </>
      </Box>
      <MMESearchModal cars={savedCarsData?.data || []} />
    </Box>
  );
};

export default HeroCardMobile;
