"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HERO_CAR_SELECT_EVENT, HERO_CARS_REFRESH_EVENT } from "@/constants/heroCars";
import { useCarsFiltersMutation } from "@/hooks/cars";
import { useCarsInitialMakesStore } from "@/stores/useCarsInitialMakesStore";
import { queryKeys } from "@/lib/query-keys";
import {
  carIdsForE2EPersistence,
  isE2EMakeModelOnlyResolvedLength,
  persistGarageCarsForApply,
  persistSessionCarsForApply,
  primaryCarId,
  urlCarIdsForApply,
  urlCarIdsForE2EApply,
} from "@/utils/newMmeCarApply";
import { useE2EVinSearchStore } from "@/stores/useE2EVinSearchStore";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getCarById } from "@/services/cars";
import type { CarsFiltersResponse } from "@/services/cars";
import type { NewMmeOptionsState, NewMmeSelectedState } from "@/stores/useNewMmeStore";
import {
  FIELD_ORDER,
  type VisibleField,
  applyBootstrapPrefillFromCarsResponse,
  buildBootstrapPrefillPayload,
  buildPayload,
  buildVinBootstrapPrefillPayload,
  clearDependentFields,
  emptyMmeSearchText,
  getVisibleMmeFields,
  isMmeBootstrapPrefillComplete,
  isNewMmeApplyCtaEnabled,
  isE2EMmeApplyCtaEnabled,
  shouldE2EPrefillMakeModelOnly,
  toMakeModelOnlySelected,
  looksLikeMmeFilterKey,
  optionsFromCarsFiltersResponse,
  reconcileSelected,
} from "@/lib/newMmeFilters";
import { mergeCarByIdResponsesForNewMmePrefill } from "@/utils/mergeCarByIdResponsesForNewMmePrefill";
import {
  type EditPrefillSnapshot,
  getEditPrefillCache,
  invalidateEditPrefillCache,
  setEditPrefillCache,
} from "@/utils/newMmeEditPrefillCache";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import {
  isE2ESavedCarMakeModelOnly,
  resolveUrlCarIdsForSavedCar,
  setE2ESavedCarVin,
  syncE2ESavedCarMakeModelOnlyMeta,
  transferE2ESavedCarMeta,
} from "@/utils/e2eSavedCarMeta";
import {
  findGarageItemByRecordOrCarId,
  getGarageCarsFromCache,
  isGarageItemMakeModelOnly,
} from "@/utils/garageCarId";
import { Routes } from "@/config/routes";
import { isSearchResultsListingPage, shouldStayOnPathAfterCarApply } from "@/utils/detectPage";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useFilterModalStore } from "@/stores/useFilterModal";
import { useRightSidebarStore } from "@/stores/useRightSidebar";
import {
  clearEditingSearchedCarId,
  getEditingSearchedCarId,
  isSearchedCarIdInSession,
  pushSearchedCarIds,
  replaceSearchedCarId,
  setSearchedCarVin,
  shouldUseSessionCarHistory,
} from "@/utils/searchedCarIdsSession";
import { useAuthStore } from "@/stores/useAuthStore";
import { VALID_VIN_REGEX } from "@/utils/vinCheck";

const emptySelected: NewMmeSelectedState = {
  make: null,
  model: null,
  variant: null,
  body: null,
  engine: null,
  gearBox: null,
  engineCode: null,
  gearBoxCode: null,
};

const emptyOptions: NewMmeOptionsState = {
  makes: [],
  models: [],
  variants: [],
  bodys: [],
  engines: [],
  gearBoxes: [],
  engineCodes: [],
  gearBoxCodes: [],
};

export type UseNewMmeCarFiltersOptions = {
  /** When false, skip API bootstrap until sidebar opens (Edit / Select car). */
  enabled?: boolean;
};

export function useNewMmeCarFilters(options: UseNewMmeCarFiltersOptions = {}) {
  const { enabled = true } = options;
  const { isAuthenticated, authUser } = useAuthStore();
  const myCarsUserId = (authUser as { id?: string })?.id ?? "anonymous";
  const { updateFilters } = useUrlParams();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchdataRaw = params?.["searchdata"];
  const searchdataSegment = Array.isArray(searchdataRaw) ? searchdataRaw[0] : searchdataRaw;
  const listingBase = `/${searchdataSegment ?? "search-results"}`;
  const isListingPage = isSearchResultsListingPage(pathname);
  const languageCountry =
    (params?.["language-country"] as string | undefined) ||
    pathname?.split("/").filter(Boolean)[0] ||
    "";

  const isFeatureEnabled = getClientFeatureFlag("new_mme_feature_flag", languageCountry);
  const isE2EVinFlowEnabled = getClientFeatureFlag(
    "end_to_end_vin_flow_feature_flag",
    languageCountry,
  );

  const carApplyDestination = useMemo(() => {
    if (isListingPage) return listingBase;
    // Catalog L1–L3, PDP, brand SEO pages: stay on current path (update carIds/vin only).
    if (shouldStayOnPathAfterCarApply(pathname)) {
      const pathOnly = (pathname ?? "").split("?")[0];
      if (pathOnly) return pathOnly;
    }
    if (isFeatureEnabled && languageCountry) return Routes.parts(languageCountry);
    return "/search-results";
  }, [isFeatureEnabled, isListingPage, languageCountry, listingBase, pathname]);
  const listingHydratedKeyRef = useRef<string | null>(null);
  /** Bumped on Reset / sidebar close so in-flight GET/POST prefill cannot repopulate the form. */
  const bootstrapGenerationRef = useRef(0);
  /** Edit flow: after first hydrate or Reset, never auto-prefill from GET /Cars/{id} again this open. */
  const editSidebarPrefillLockedRef = useRef(false);

  const sidebarIntent = useRightSidebarStore((s) => s.sidebarIntent);
  const editingCarsApiId = useRightSidebarStore((s) => s.editingCarsApiId);
  const editingMyCarRecordId = useRightSidebarStore((s) => s.editingMyCarRecordId);
  const listingPrefillCarsApiId = useRightSidebarStore((s) => s.listingPrefillCarsApiId);
  const forceEmptySidebar = useRightSidebarStore((s) => s.forceEmptySidebar);
  const vinPrefillCarsApiId = useRightSidebarStore((s) => s.vinPrefillCarsApiId);
  const vinResolvedCarIds = useE2EVinSearchStore((s) => s.vinResolvedCarIds);
  const sidebarVinNumber = useE2EVinSearchStore((s) => s.vinNumber);
  const sidebarVinError = useE2EVinSearchStore((s) => s.sidebarVinError);
  const sidebarVinBrandUnsupported = useE2EVinSearchStore((s) => s.sidebarVinBrandUnsupported);
  const isHeroSaveMode = sidebarIntent === "heroSave";

  const urlCarIdList = useMemo(
    () => parseCarIdsParam(searchParams?.get("carIds") ?? null),
    [searchParams],
  );
  const urlVin = useMemo(
    () => (searchParams?.get("vin") ?? "").trim().toUpperCase(),
    [searchParams],
  );

  const isActive = isFeatureEnabled && enabled;
  /** After Reset — skip URL/edit prefill until user changes a field or sidebar closes. */
  const [skipSidebarPrefill, setSkipSidebarPrefill] = useState(false);

  const isSidebarEditFlow = useMemo(() => {
    if (forceEmptySidebar) return false;
    if (isHeroSaveMode) return true;
    return Boolean(listingPrefillCarsApiId?.trim() || editingCarsApiId?.trim());
  }, [editingCarsApiId, forceEmptySidebar, isHeroSaveMode, listingPrefillCarsApiId]);

  /**
   * Edit + saved/URL VIN: wait for GET /Vin → vinPrefill (then POST /Cars {vin}).
   * Avoid GET /Cars/{id} + progressive POSTs on first open. Fall back to Cars-by-id only
   * after Case 2 unable-select; keep deferring on 406 brand-unsupported (no MME).
   */
  const deferEditCarsPrefillForVin = useMemo(() => {
    if (!isE2EVinFlowEnabled || !isSidebarEditFlow) return false;
    const vin = sidebarVinNumber.trim().toUpperCase();
    if (vin.length !== 17 || !VALID_VIN_REGEX.test(vin)) return false;
    if (vinPrefillCarsApiId?.trim()) return false;
    if (sidebarVinBrandUnsupported) return true;
    if (sidebarVinError) return false;
    return true;
  }, [
    isE2EVinFlowEnabled,
    isSidebarEditFlow,
    sidebarVinBrandUnsupported,
    sidebarVinError,
    sidebarVinNumber,
    vinPrefillCarsApiId,
  ]);

  /** GET /Cars/{id} prefill id — only for explicit Edit / hero Save, never passive URL warm-up. */
  const editPrefillCarId = useMemo(() => {
    if (skipSidebarPrefill || forceEmptySidebar) return null;
    if (!isSidebarEditFlow && !isHeroSaveMode) return null;
    const fromStore = listingPrefillCarsApiId?.trim() || editingCarsApiId?.trim() || null;
    if (fromStore) return fromStore;
    if (shouldUseSessionCarHistory(isAuthenticated)) {
      return getEditingSearchedCarId()?.trim() || null;
    }
    return null;
  }, [
    editingCarsApiId,
    forceEmptySidebar,
    isAuthenticated,
    isHeroSaveMode,
    isSidebarEditFlow,
    listingPrefillCarsApiId,
    skipSidebarPrefill,
  ]);

  const prefillCarIds = useMemo(() => {
    if (forceEmptySidebar) return [];
    // E2E VIN live/Find prefill always wins — even after Reset cleared URL/edit prefill.
    const vinId = vinPrefillCarsApiId?.trim();
    if (vinId) return [vinId];
    if (skipSidebarPrefill) return [];
    // Edit with VIN context: wait for GET /Vin → vinPrefill (skip Cars-by-id flood).
    if (deferEditCarsPrefillForVin) return [];
    // E2E: URL has vin + carIds → Make+Model from carIds[0] only while sidebar VIN still matches URL.
    // If user clears the VIN field, do not re-hydrate Make/Model from URL (URL itself stays).
    const fieldVin = sidebarVinNumber.trim().toUpperCase();
    if (isE2EVinFlowEnabled && urlVin && urlCarIdList[0] && fieldVin === urlVin) {
      return [urlCarIdList[0]];
    }
    if (isHeroSaveMode) {
      const id = editPrefillCarId || urlCarIdList[0] || "";
      return id ? [id] : [];
    }
    if (editPrefillCarId) return [editPrefillCarId];
    return [];
  }, [
    deferEditCarsPrefillForVin,
    editPrefillCarId,
    forceEmptySidebar,
    isE2EVinFlowEnabled,
    isHeroSaveMode,
    sidebarVinNumber,
    skipSidebarPrefill,
    urlCarIdList,
    urlVin,
    vinPrefillCarsApiId,
  ]);

  /** Find car parts opened from Edit car (SRP, catalog hub, etc.) — replace old car on apply, not push. */
  const getEditOldCarsApiId = useCallback(() => {
    if (forceEmptySidebar) return null;
    return (
      listingPrefillCarsApiId?.trim() ||
      editingCarsApiId?.trim() ||
      getEditingSearchedCarId()?.trim() ||
      null
    );
  }, [editingCarsApiId, forceEmptySidebar, listingPrefillCarsApiId]);

  const [selected, setSelected] = useState<NewMmeSelectedState>(emptySelected);
  const [filterOptions, setFilterOptions] = useState<NewMmeOptionsState>(emptyOptions);
  const [carIds, setCarIds] = useState<string[]>([]);
  const [hasCarIdsProperty, setHasCarIdsProperty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<VisibleField | null>(null);
  const [searchText, setSearchText] = useState<Record<VisibleField, string>>(emptyMmeSearchText());
  const [findCarPartsDirty, setFindCarPartsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  /** Covers GET /Cars/{id} + POST /api/Cars bootstrap without a gap between phases. */
  const [isEditPrefillActive, setIsEditPrefillActive] = useState(false);
  /**
   * When true, skip POST /Cars {vin} and fall back to GET /Cars/{id} + POST (parity path).
   * Reset when initKey / bootstrap VIN changes.
   */
  const [vinCarsBootstrapFailed, setVinCarsBootstrapFailed] = useState(false);

  const queryClient = useQueryClient();
  const garageSavedCarsQueryKey = queryKeys.garage.savedCars(myCarsUserId);
  const { mutateAsync: fetchCarsFilters } = useCarsFiltersMutation();
  const isGarageApplyInFlightRef = useRef(false);
  const filterOptionsRef = useRef(filterOptions);
  filterOptionsRef.current = filterOptions;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const carIdsRef = useRef(carIds);
  carIdsRef.current = carIds;
  const hasCarIdsPropertyRef = useRef(hasCarIdsProperty);
  hasCarIdsPropertyRef.current = hasCarIdsProperty;

  /** True when this open restored edit prefill from in-memory cache (skip GET/POST). */
  const [editPrefillServedFromCache, setEditPrefillServedFromCache] = useState(false);

  const cloneOptionsState = useCallback((options: NewMmeOptionsState): NewMmeOptionsState => {
    return {
      makes: [...options.makes],
      models: [...options.models],
      variants: [...options.variants],
      bodys: [...options.bodys],
      engines: [...options.engines],
      gearBoxes: [...options.gearBoxes],
      engineCodes: [...options.engineCodes],
      gearBoxCodes: [...options.gearBoxCodes],
    };
  }, []);

  const applyEditPrefillSnapshot = useCallback((snapshot: EditPrefillSnapshot) => {
    filterOptionsRef.current = snapshot.options;
    setFilterOptions(snapshot.options);
    setSelected(snapshot.selected);
    selectedRef.current = snapshot.selected;
    setCarIds(snapshot.carIds);
    carIdsRef.current = snapshot.carIds;
    setHasCarIdsProperty(snapshot.hasCarIdsProperty);
    hasCarIdsPropertyRef.current = snapshot.hasCarIdsProperty;
  }, []);

  const persistEditPrefillCacheForCarId = useCallback(
    (carId: string) => {
      const trimmed = carId.trim();
      if (!trimmed) return;
      if (!isMmeBootstrapPrefillComplete(selectedRef.current, filterOptionsRef.current)) return;
      setEditPrefillCache(trimmed, {
        selected: { ...selectedRef.current },
        options: cloneOptionsState(filterOptionsRef.current),
        carIds: [...carIdsRef.current],
        hasCarIdsProperty: hasCarIdsPropertyRef.current,
      });
    },
    [cloneOptionsState],
  );

  const initKey = prefillCarIds.join(",");
  const urlHasCarIds = urlCarIdList.length > 0;
  /**
   * Prefill depth follows the *active* carIds source (not a stale URL during VIN override):
   * - VIN prefill active → 1 resolved id = full deep; 2+ (incl. >5) = Make+Model only
   * - Else Edit/open → URL carIds multi (2–5) = Make+Model only
   * - Else logged-in → Garage `name === "makeModelOnly"`
   * - Else guest → `e2e_saved_car_meta` localStorage for that carsApiId
   */
  const e2eMakeModelOnlyPrefill = useMemo(() => {
    if (!isE2EVinFlowEnabled) return false;
    if (vinPrefillCarsApiId?.trim()) {
      const n = vinResolvedCarIds.map((id) => String(id).trim()).filter(Boolean).length;
      // Doc §3.5 / §4.2: VIN resolve length 1 → full deep; 2+ → Make+Model only.
      // n===0 (resolve in flight / ids cleared) must NOT strip — that was stopping at Model.
      return n >= 2;
    }
    if (shouldE2EPrefillMakeModelOnly(urlCarIdList)) return true;

    const metaCarId =
      editingCarsApiId?.trim() ||
      listingPrefillCarsApiId?.trim() ||
      getEditingSearchedCarId() ||
      null;

    if (isAuthenticated) {
      const garageRow = findGarageItemByRecordOrCarId(
        getGarageCarsFromCache(queryClient, garageSavedCarsQueryKey),
        editingMyCarRecordId,
        metaCarId,
      );
      return isGarageItemMakeModelOnly(garageRow);
    }

    return isE2ESavedCarMakeModelOnly(metaCarId);
  }, [
    editingCarsApiId,
    editingMyCarRecordId,
    garageSavedCarsQueryKey,
    isAuthenticated,
    isE2EVinFlowEnabled,
    listingPrefillCarsApiId,
    queryClient,
    urlCarIdList,
    vinPrefillCarsApiId,
    vinResolvedCarIds,
  ]);

  /**
   * Optimization only: first Cars hydrate may use POST /Cars { vin } when this hydrate is
   * VIN-driven (live/Find vinPrefill or URL ?vin= warm-up with matching field).
   * Edit-without-VIN and progressive field changes never use this.
   */
  const vinForCarsBootstrap = useMemo(() => {
    if (!isE2EVinFlowEnabled || prefillCarIds.length === 0) return null;
    const vin = sidebarVinNumber.trim().toUpperCase();
    if (vin.length !== 17 || !VALID_VIN_REGEX.test(vin)) return null;

    const fromVinPrefill = Boolean(vinPrefillCarsApiId?.trim());
    const fromUrlVinWarm =
      !skipSidebarPrefill && Boolean(urlVin) && urlVin === vin && urlCarIdList.length > 0;

    if (!fromVinPrefill && !fromUrlVinWarm) return null;
    return vin;
  }, [
    isE2EVinFlowEnabled,
    prefillCarIds.length,
    sidebarVinNumber,
    skipSidebarPrefill,
    urlCarIdList.length,
    urlVin,
    vinPrefillCarsApiId,
  ]);

  const useVinCarsBootstrap = Boolean(vinForCarsBootstrap) && !vinCarsBootstrapFailed;

  const oeReferenceKey = searchParams?.get("oeReference")?.trim() ?? "";

  const visibleFields: VisibleField[] = useMemo(
    () => getVisibleMmeFields(selected, filterOptions),
    [selected, filterOptions],
  );

  const canApplyCarSearch = useMemo(() => {
    if (isE2EVinFlowEnabled) {
      // E2E §2: carIds length 1–5 enables CTA (no need to finish gearbox/etc.).
      return isE2EMmeApplyCtaEnabled(carIds);
    }
    return isNewMmeApplyCtaEnabled(carIds, visibleFields, selected, filterOptions);
  }, [carIds, filterOptions, isE2EVinFlowEnabled, selected, visibleFields]);

  const applyResponseOptionsAndCarIds = useCallback(
    (response: CarsFiltersResponse, opts?: { persistCarIdsWithoutResponse?: boolean }) => {
      const nextOptions = optionsFromCarsFiltersResponse(response);
      filterOptionsRef.current = nextOptions;
      setFilterOptions(nextOptions);
      setCarIds((prev) => {
        if (Array.isArray(response.carIds)) return response.carIds;
        return opts?.persistCarIdsWithoutResponse ? prev : [];
      });
      setHasCarIdsProperty(Object.prototype.hasOwnProperty.call(response, "carIds"));
    },
    [],
  );

  const runFilters = useCallback(
    async (
      selectedInput: NewMmeSelectedState,
      preserveCandidates?: Partial<NewMmeSelectedState>,
      bootstrapGeneration?: number,
    ): Promise<NewMmeSelectedState> => {
      let workingSelected = { ...selectedInput };
      let workingOptions = filterOptionsRef.current;

      for (let i = 0; i < FIELD_ORDER.length; i++) {
        if (
          bootstrapGeneration !== undefined &&
          bootstrapGenerationRef.current !== bootstrapGeneration
        ) {
          return workingSelected;
        }

        const response = await fetchCarsFilters(buildPayload(workingSelected, workingOptions));
        const responseData = response.data;

        if (
          bootstrapGeneration !== undefined &&
          bootstrapGenerationRef.current !== bootstrapGeneration
        ) {
          return workingSelected;
        }

        workingOptions = optionsFromCarsFiltersResponse(responseData);
        filterOptionsRef.current = workingOptions;

        const editOldId = getEditOldCarsApiId();
        applyResponseOptionsAndCarIds(responseData, {
          persistCarIdsWithoutResponse: urlHasCarIds && !editOldId,
        });
        const nextSelected = reconcileSelected(workingSelected, responseData, preserveCandidates);
        setSelected(nextSelected);
        selectedRef.current = nextSelected;

        if (JSON.stringify(nextSelected) === JSON.stringify(workingSelected)) {
          return nextSelected;
        }

        workingSelected = nextSelected;
      }

      return workingSelected;
    },
    [applyResponseOptionsAndCarIds, fetchCarsFilters, getEditOldCarsApiId, urlHasCarIds],
  );

  const runFiltersRef = useRef(runFilters);
  runFiltersRef.current = runFilters;

  const runBootstrapPrefillOnce = useCallback(
    async (
      mergedSelected: NewMmeSelectedState,
      bootstrapGeneration?: number,
    ): Promise<NewMmeSelectedState> => {
      if (
        bootstrapGeneration !== undefined &&
        bootstrapGenerationRef.current !== bootstrapGeneration
      ) {
        return mergedSelected;
      }

      const response = await fetchCarsFilters(
        buildBootstrapPrefillPayload(mergedSelected, filterOptionsRef.current),
      );
      const responseData = response.data;

      if (
        bootstrapGeneration !== undefined &&
        bootstrapGenerationRef.current !== bootstrapGeneration
      ) {
        return mergedSelected;
      }

      const editOldId = getEditOldCarsApiId();
      applyResponseOptionsAndCarIds(responseData, {
        persistCarIdsWithoutResponse: urlHasCarIds && !editOldId,
      });

      const { selected: nextSelected } = applyBootstrapPrefillFromCarsResponse(
        mergedSelected,
        responseData,
        mergedSelected,
      );
      setSelected(nextSelected);
      selectedRef.current = nextSelected;
      return nextSelected;
    },
    [applyResponseOptionsAndCarIds, fetchCarsFilters, getEditOldCarsApiId, urlHasCarIds],
  );

  const runBootstrapPrefillOnceRef = useRef(runBootstrapPrefillOnce);
  runBootstrapPrefillOnceRef.current = runBootstrapPrefillOnce;

  const carsBatchQuery = useQuery({
    queryKey: ["cars", "prefill-batch", initKey] as const,
    queryFn: async () => {
      const results = await Promise.all(
        prefillCarIds.map((id) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.cars.byId(id),
            queryFn: async () => {
              const response = await getCarById(id);
              return response.data;
            },
            staleTime: 5 * 60 * 1000,
          }),
        ),
      );
      return results;
    },
    // Skip GET /Cars/{id} when VIN first-hydrate POST /Cars {vin} is eligible.
    enabled:
      isActive && prefillCarIds.length > 0 && !editPrefillServedFromCache && !useVinCarsBootstrap,
    staleTime: 5 * 60 * 1000,
  });

  const allSuccess = carsBatchQuery.isSuccess && Boolean(carsBatchQuery.data?.length);
  const carsData = carsBatchQuery.data ?? null;
  const anyError = carsBatchQuery.isError;

  const loadingCarDetails = useMemo(
    () =>
      !editPrefillServedFromCache &&
      prefillCarIds.length > 0 &&
      // Disabled queries stay `isPending` in RQ v5 with no data — that must not block VIN hydrate UI.
      !useVinCarsBootstrap &&
      carsBatchQuery.isFetching &&
      !anyError,
    [
      anyError,
      carsBatchQuery.isFetching,
      editPrefillServedFromCache,
      prefillCarIds.length,
      useVinCarsBootstrap,
    ],
  );

  const resetLocalState = useCallback(() => {
    setSelected(emptySelected);
    filterOptionsRef.current = emptyOptions;
    setFilterOptions(emptyOptions);
    setCarIds([]);
    setHasCarIdsProperty(false);
    setOpenDropdown(null);
    setSearchText(emptyMmeSearchText());
    setFindCarPartsDirty(false);
  }, []);

  useEffect(() => {
    if (!forceEmptySidebar || !isActive) return;

    bootstrapGenerationRef.current += 1;
    listingHydratedKeyRef.current = null;
    setIsEditPrefillActive(false);
    resetLocalState();

    void queryClient.cancelQueries({ queryKey: ["cars", "prefill-batch"] });
    queryClient.removeQueries({ queryKey: ["cars", "prefill-batch"] });
  }, [forceEmptySidebar, isActive, queryClient, resetLocalState]);

  useLayoutEffect(() => {
    if (!isActive) {
      setEditPrefillServedFromCache(false);
      return;
    }
    if (skipSidebarPrefill || !isSidebarEditFlow || prefillCarIds.length !== 1) {
      setEditPrefillServedFromCache(false);
      return;
    }
    // VIN-context edit: never restore deep Cars cache — hydrate via GET /Vin + POST /Cars {vin}.
    const fieldVin = sidebarVinNumber.trim().toUpperCase();
    if (isE2EVinFlowEnabled && fieldVin.length === 17 && VALID_VIN_REGEX.test(fieldVin)) {
      setEditPrefillServedFromCache(false);
      return;
    }
    // Multi-id URL / makeModelOnly meta: never restore a deep-field cache — always Make+Model bootstrap.
    if (e2eMakeModelOnlyPrefill) {
      setEditPrefillServedFromCache(false);
      return;
    }
    const carId = prefillCarIds[0]!;
    const cached = getEditPrefillCache(carId);
    if (cached && isMmeBootstrapPrefillComplete(cached.selected, cached.options)) {
      applyEditPrefillSnapshot(cached);
      listingHydratedKeyRef.current = initKey;
      editSidebarPrefillLockedRef.current = true;
      setEditPrefillServedFromCache(true);
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }
    setEditPrefillServedFromCache(false);
  }, [
    applyEditPrefillSnapshot,
    e2eMakeModelOnlyPrefill,
    initKey,
    isActive,
    isE2EVinFlowEnabled,
    isSidebarEditFlow,
    prefillCarIds,
    sidebarVinNumber,
    skipSidebarPrefill,
  ]);

  useLayoutEffect(() => {
    if (!isActive || prefillCarIds.length === 0 || !isSidebarEditFlow) {
      setIsEditPrefillActive(false);
      return;
    }
    if (editPrefillServedFromCache) {
      setIsEditPrefillActive(false);
      return;
    }
    if (
      listingHydratedKeyRef.current === initKey &&
      isMmeBootstrapPrefillComplete(selectedRef.current, filterOptionsRef.current)
    ) {
      setIsEditPrefillActive(false);
      return;
    }
    setIsEditPrefillActive(true);
  }, [editPrefillServedFromCache, isActive, initKey, isSidebarEditFlow, prefillCarIds.length]);

  useEffect(() => {
    if (listingHydratedKeyRef.current !== initKey) {
      listingHydratedKeyRef.current = null;
    }
  }, [initKey]);

  /**
   * Switching edit target (homepage slider car A → car B) while the sidebar stays mounted:
   * cancel in-flight bootstrap and clear loading locks so the next car can hydrate.
   * Skip while Reset / VIN-clear (`skipSidebarPrefill`) — that bump was aborting
   * `handleReset`'s initial-makes apply and leaving Make/Model as "No data".
   */
  useEffect(() => {
    if (!isActive) return;
    if (skipSidebarPrefill) return;
    bootstrapGenerationRef.current += 1;
    listingHydratedKeyRef.current = null;
    editSidebarPrefillLockedRef.current = false;
    setIsEditPrefillActive(false);
    setIsLoading(false);
  }, [initKey, isActive, skipSidebarPrefill]);

  // VIN override / makeModelOnly meta can flip depth while prefill id stays the same — force re-bootstrap.
  useEffect(() => {
    if (skipSidebarPrefill) return;
    bootstrapGenerationRef.current += 1;
    listingHydratedKeyRef.current = null;
    editSidebarPrefillLockedRef.current = false;
    setEditPrefillServedFromCache(false);
    setIsEditPrefillActive(false);
    setIsLoading(false);
  }, [e2eMakeModelOnlyPrefill, skipSidebarPrefill]);

  useEffect(() => {
    if (!isActive) return;
    setFindCarPartsDirty(false);
  }, [initKey, isActive]);

  useEffect(() => {
    if (isActive) return;
    bootstrapGenerationRef.current += 1;
    listingHydratedKeyRef.current = null;
    editSidebarPrefillLockedRef.current = false;
    setSkipSidebarPrefill(false);
    setIsEditPrefillActive(false);
    setIsLoading(false);
    setEditPrefillServedFromCache(false);
    resetLocalState();
    void queryClient.cancelQueries({ queryKey: ["cars", "prefill-batch"] });
  }, [isActive, queryClient, resetLocalState]);

  // Doc §4.2: successful VIN after Case 2 / Reset must override vehicle fields again.
  // handleReset sets skipSidebarPrefill + may lock edit prefill — unlock when vinPrefill arrives.
  useEffect(() => {
    if (!vinPrefillCarsApiId?.trim()) return;
    setSkipSidebarPrefill(false);
    editSidebarPrefillLockedRef.current = false;
  }, [vinPrefillCarsApiId]);

  useEffect(() => {
    if (!isActive || !isSidebarEditFlow) return;
    if (prefillCarIds.length === 0) return;
    if (listingHydratedKeyRef.current !== initKey) return;
    if (isMmeBootstrapPrefillComplete(selected, filterOptions)) {
      editSidebarPrefillLockedRef.current = true;
    }
  }, [filterOptions, initKey, isActive, isSidebarEditFlow, prefillCarIds.length, selected]);

  useEffect(() => {
    if (!listingPrefillCarsApiId?.trim()) return;
    if (isMmeBootstrapPrefillComplete(selected, filterOptions)) return;
    if (editSidebarPrefillLockedRef.current) return;
    listingHydratedKeyRef.current = null;
  }, [filterOptions, listingPrefillCarsApiId, selected]);

  useEffect(() => {
    if (!isFeatureEnabled) {
      resetLocalState();
      setError(null);
    }
  }, [isFeatureEnabled, resetLocalState]);

  useEffect(() => {
    if (!isActive) return;
    if (prefillCarIds.length > 0) return;
    // Edit + VIN-clear/Reset: still load the full Make list (skipSidebarPrefill).
    if ((isSidebarEditFlow || editPrefillCarId) && !skipSidebarPrefill) return;

    let cancelled = false;
    const generationAtStart = bootstrapGenerationRef.current;

    const runEmptyBootstrap = async () => {
      // handleReset may already have applied initial makes; don't wipe them.
      if (skipSidebarPrefill && (filterOptionsRef.current.makes?.length ?? 0) > 0) {
        return;
      }
      resetLocalState();
      setError(null);
      setIsLoading(true);
      try {
        const responseData = await useCarsInitialMakesStore.getState().ensureInitialMakes();
        if (cancelled || useRightSidebarStore.getState().vinPrefillCarsApiId?.trim()) return;
        if (bootstrapGenerationRef.current !== generationAtStart) return;
        applyResponseOptionsAndCarIds(responseData, { persistCarIdsWithoutResponse: false });
        setSelected(reconcileSelected(emptySelected, responseData));
      } catch (err: unknown) {
        if (
          !cancelled &&
          !useRightSidebarStore.getState().vinPrefillCarsApiId?.trim() &&
          bootstrapGenerationRef.current === generationAtStart
        ) {
          setError(err instanceof Error ? err.message : "Failed to load car filters");
        }
      } finally {
        if (
          !cancelled &&
          !useRightSidebarStore.getState().vinPrefillCarsApiId?.trim() &&
          bootstrapGenerationRef.current === generationAtStart
        ) {
          setIsLoading(false);
        }
      }
    };

    void runEmptyBootstrap();
    return () => {
      cancelled = true;
    };
  }, [
    applyResponseOptionsAndCarIds,
    editPrefillCarId,
    isActive,
    isSidebarEditFlow,
    oeReferenceKey,
    prefillCarIds.length,
    resetLocalState,
    skipSidebarPrefill,
  ]);

  useEffect(() => {
    setVinCarsBootstrapFailed(false);
  }, [initKey, vinForCarsBootstrap]);

  useEffect(() => {
    if (!isActive) return;
    if (!useVinCarsBootstrap || !vinForCarsBootstrap) return;
    if (prefillCarIds.length === 0) return;
    if (editPrefillServedFromCache) {
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }
    if (isSidebarEditFlow && editSidebarPrefillLockedRef.current) {
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }

    if (
      listingHydratedKeyRef.current === initKey &&
      isMmeBootstrapPrefillComplete(selectedRef.current, filterOptionsRef.current)
    ) {
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const generationAtStart = bootstrapGenerationRef.current;

    const bootstrapFromVin = async () => {
      setError(null);
      setIsLoading(true);
      if (isSidebarEditFlow) {
        setIsEditPrefillActive(true);
      }
      let fellBackToGetCars = false;
      try {
        const response = await fetchCarsFilters(
          buildVinBootstrapPrefillPayload(vinForCarsBootstrap),
        );
        if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;

        const responseData = response.data;
        const editOldId = getEditOldCarsApiId();
        applyResponseOptionsAndCarIds(responseData, {
          persistCarIdsWithoutResponse: urlHasCarIds && !editOldId,
        });

        let finalSelected = applyBootstrapPrefillFromCarsResponse(
          emptySelected,
          responseData,
        ).selected;
        setSelected(finalSelected);
        selectedRef.current = finalSelected;

        // Multi-id / makeModelOnly: VIN response may deep-fill — strip, then POST without vin
        // so progressive carIds/options match the existing GET→POST path.
        if (e2eMakeModelOnlyPrefill) {
          finalSelected = toMakeModelOnlySelected(finalSelected);
          setSelected(finalSelected);
          selectedRef.current = finalSelected;

          finalSelected = await runBootstrapPrefillOnceRef.current(
            finalSelected,
            generationAtStart,
          );
          if (!isMmeBootstrapPrefillComplete(finalSelected, filterOptionsRef.current)) {
            finalSelected = await runFiltersRef.current(
              finalSelected,
              finalSelected,
              generationAtStart,
            );
          }
          if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;
          finalSelected = toMakeModelOnlySelected(finalSelected);
          setSelected(finalSelected);
          selectedRef.current = finalSelected;
        } else {
          // Single-car VIN → full progressive (doc §4.2). POST /Cars {vin} often only
          // settles make+model; always continue progressive POSTs for body/engine/….
          finalSelected = await runFiltersRef.current(
            finalSelected,
            finalSelected,
            generationAtStart,
          );
        }

        if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;

        if (isMmeBootstrapPrefillComplete(finalSelected, filterOptionsRef.current)) {
          listingHydratedKeyRef.current = initKey;
          if (isSidebarEditFlow) {
            editSidebarPrefillLockedRef.current = true;
          }
          if (prefillCarIds.length === 1 && !e2eMakeModelOnlyPrefill) {
            persistEditPrefillCacheForCarId(prefillCarIds[0]!);
          }
        }
      } catch (err: unknown) {
        if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;
        // Fall back to GET /Cars/{id} + POST — no product behaviour change on VIN Cars failure.
        fellBackToGetCars = true;
        setVinCarsBootstrapFailed(true);
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[useNewMmeCarFilters] POST /Cars {vin} failed; falling back to GET /Cars/{id}",
            err,
          );
        }
      } finally {
        if (bootstrapGenerationRef.current === generationAtStart && !fellBackToGetCars) {
          setIsLoading(false);
          setIsEditPrefillActive(false);
        }
      }
    };

    void bootstrapFromVin();
    return () => {
      cancelled = true;
    };
  }, [
    applyResponseOptionsAndCarIds,
    e2eMakeModelOnlyPrefill,
    editPrefillServedFromCache,
    fetchCarsFilters,
    getEditOldCarsApiId,
    initKey,
    isActive,
    isSidebarEditFlow,
    persistEditPrefillCacheForCarId,
    prefillCarIds,
    urlHasCarIds,
    useVinCarsBootstrap,
    vinForCarsBootstrap,
  ]);

  useEffect(() => {
    if (!isActive) return;
    if (prefillCarIds.length === 0) return;
    if (useVinCarsBootstrap) return;
    if (editPrefillServedFromCache) {
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }
    if (isSidebarEditFlow && editSidebarPrefillLockedRef.current) {
      // Prefill already applied for this open — never leave the skeleton stuck.
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }

    if (anyError) {
      setError("Could not load vehicle details");
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }

    if (!allSuccess || !carsData) {
      return;
    }

    if (
      listingHydratedKeyRef.current === initKey &&
      isMmeBootstrapPrefillComplete(selectedRef.current, filterOptionsRef.current)
    ) {
      setIsEditPrefillActive(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const generationAtStart = bootstrapGenerationRef.current;

    const bootstrapFromCars = async () => {
      setError(null);
      setIsLoading(true);
      if (isSidebarEditFlow) {
        setIsEditPrefillActive(true);
      }
      try {
        let mergedSelected = mergeCarByIdResponsesForNewMmePrefill(carsData);
        // Multi carIds URL: only Make+Model (shared super-set); strip body/engine/… before POST.
        if (e2eMakeModelOnlyPrefill) {
          mergedSelected = toMakeModelOnlySelected(mergedSelected);
        }
        if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;

        const hasAnyMergedKey = Object.values(mergedSelected).some((v) => v != null);
        let finalSelected: NewMmeSelectedState = emptySelected;

        if (hasAnyMergedKey) {
          const preserve = mergedSelected;
          const canTrySinglePost =
            looksLikeMmeFilterKey(mergedSelected.make) &&
            looksLikeMmeFilterKey(mergedSelected.model);

          if (canTrySinglePost) {
            finalSelected = await runBootstrapPrefillOnceRef.current(
              mergedSelected,
              generationAtStart,
            );
            if (!e2eMakeModelOnlyPrefill) {
              // Full deep (single car): always continue progressive POSTs past make+model.
              finalSelected = await runFiltersRef.current(
                finalSelected,
                preserve,
                generationAtStart,
              );
            } else if (!isMmeBootstrapPrefillComplete(finalSelected, filterOptionsRef.current)) {
              finalSelected = await runFiltersRef.current(
                finalSelected,
                preserve,
                generationAtStart,
              );
            }
          } else {
            finalSelected = await runFiltersRef.current(
              mergedSelected,
              preserve,
              generationAtStart,
            );
          }
        } else {
          const responseData = await useCarsInitialMakesStore.getState().ensureInitialMakes();
          if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;
          applyResponseOptionsAndCarIds(responseData, { persistCarIdsWithoutResponse: true });
          finalSelected = reconcileSelected(emptySelected, responseData);
          setSelected(finalSelected);
        }

        if (cancelled || bootstrapGenerationRef.current !== generationAtStart) return;

        // reconcileSelected may auto-pick singleton body/engine — strip again for multi-id.
        if (e2eMakeModelOnlyPrefill) {
          finalSelected = toMakeModelOnlySelected(finalSelected);
          setSelected(finalSelected);
          selectedRef.current = finalSelected;
        }

        if (isMmeBootstrapPrefillComplete(finalSelected, filterOptionsRef.current)) {
          listingHydratedKeyRef.current = initKey;
          if (isSidebarEditFlow) {
            editSidebarPrefillLockedRef.current = true;
          }
          if (prefillCarIds.length === 1 && !e2eMakeModelOnlyPrefill) {
            persistEditPrefillCacheForCarId(prefillCarIds[0]!);
          }
        }
      } catch (err: unknown) {
        if (!cancelled && bootstrapGenerationRef.current === generationAtStart) {
          setError(err instanceof Error ? err.message : "Failed to load car filters");
        }
      } finally {
        // Always release skeleton when this generation is still current (incl. cancelled
        // re-entry that shares the same generation before initKey bump).
        if (bootstrapGenerationRef.current === generationAtStart) {
          setIsLoading(false);
          setIsEditPrefillActive(false);
        }
      }
    };

    void bootstrapFromCars();
    return () => {
      cancelled = true;
    };
  }, [
    allSuccess,
    anyError,
    applyResponseOptionsAndCarIds,
    carsData,
    e2eMakeModelOnlyPrefill,
    initKey,
    isActive,
    isSidebarEditFlow,
    editPrefillServedFromCache,
    persistEditPrefillCacheForCarId,
    prefillCarIds,
    useVinCarsBootstrap,
  ]);

  const handleSelect = useCallback(
    async (field: VisibleField, value: string) => {
      if (isSidebarEditFlow) {
        invalidateEditPrefillCache(editPrefillCarId || prefillCarIds[0]);
      } else {
        setSkipSidebarPrefill(false);
      }
      setFindCarPartsDirty(true);
      const previousSelected = { ...selected };
      const nextSelected = clearDependentFields({ ...selected, [field]: value }, field);
      const isEditFlow = Boolean(getEditOldCarsApiId());

      setSelected(nextSelected);
      setOpenDropdown(null);
      setIsLoading(true);
      setError(null);

      try {
        await runFilters(nextSelected, isEditFlow ? undefined : previousSelected);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load car filters");
      } finally {
        setIsLoading(false);
      }
    },
    [editPrefillCarId, getEditOldCarsApiId, isSidebarEditFlow, prefillCarIds, runFilters, selected],
  );

  const handleReset = useCallback(async () => {
    invalidateEditPrefillCache(editPrefillCarId || prefillCarIds[0]);
    bootstrapGenerationRef.current += 1;
    listingHydratedKeyRef.current = null;
    setIsEditPrefillActive(false);
    if (isSidebarEditFlow) {
      editSidebarPrefillLockedRef.current = true;
    }
    setSkipSidebarPrefill(true);
    resetLocalState();
    setError(null);
    setIsLoading(true);

    await queryClient.cancelQueries({ queryKey: ["cars", "prefill-batch"] });
    queryClient.removeQueries({ queryKey: ["cars", "prefill-batch"] });

    const vinHydrateTookOver = () =>
      Boolean(useRightSidebarStore.getState().vinPrefillCarsApiId?.trim());

    try {
      const store = useCarsInitialMakesStore.getState();
      const responseData = store.response ?? (await store.ensureInitialMakes());
      // initKey / makeModelOnly effects may bump generation after VIN-clear; still apply
      // the full Make list unless a newer VIN hydrate took over.
      if (vinHydrateTookOver()) return;
      applyResponseOptionsAndCarIds(responseData, { persistCarIdsWithoutResponse: false });
      setSelected(reconcileSelected(emptySelected, responseData));
    } catch (err: unknown) {
      if (!vinHydrateTookOver()) {
        setError(err instanceof Error ? err.message : "Failed to load car filters");
      }
    } finally {
      if (!vinHydrateTookOver()) {
        setIsLoading(false);
      }
    }
  }, [
    applyResponseOptionsAndCarIds,
    editPrefillCarId,
    isSidebarEditFlow,
    prefillCarIds,
    queryClient,
    resetLocalState,
  ]);

  const applyExistingSessionCar = useCallback(
    (carId: string, oldCarsApiId?: string | null) => {
      const trimmed = carId.trim();
      if (!trimmed) return;

      if (oldCarsApiId && oldCarsApiId.trim() && oldCarsApiId.trim() !== trimmed) {
        replaceSearchedCarId(oldCarsApiId.trim(), trimmed);
      } else {
        pushSearchedCarIds([trimmed]);
      }
      clearEditingSearchedCarId();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(HERO_CAR_SELECT_EVENT, { detail: { carId: trimmed } }),
        );
        window.dispatchEvent(new Event(HERO_CARS_REFRESH_EVENT));
      }

      useRightSidebarStore.setState({
        listingPrefillCarsApiId: null,
        editingCarsApiId: null,
        editingMyCarRecordId: null,
        forceEmptySidebar: false,
      });

      if (trimmed) {
        const urlIds = isE2EVinFlowEnabled ? resolveUrlCarIdsForSavedCar(trimmed) : [trimmed];
        updateFilters(
          {
            carIds: urlIds,
            ...(isE2EVinFlowEnabled ? { vin: null } : {}),
          } as Parameters<typeof updateFilters>[0],
          carApplyDestination,
          "desktop",
          false,
          true,
          isListingPage ? { appendAllowedTrackingQueryParams: true } : undefined,
        );
      }

      useRightSidebarStore.getState().hideRightSidebar();
    },
    [carApplyDestination, isE2EVinFlowEnabled, isListingPage, updateFilters],
  );

  const handleSave = useCallback(async () => {
    if (!canApplyCarSearch) return;
    setSkipSidebarPrefill(false);

    const newCarId = carIds[0]!;
    const oldCarsApiId =
      editingCarsApiId?.trim() || getEditingSearchedCarId() || prefillCarIds[0] || null;

    invalidateEditPrefillCache(oldCarsApiId);
    invalidateEditPrefillCache(newCarId);

    setIsSaving(true);
    setError(null);

    try {
      if (shouldUseSessionCarHistory(isAuthenticated)) {
        const isEditSave = Boolean(oldCarsApiId?.trim());
        if (!isEditSave && isSearchedCarIdInSession(newCarId)) {
          persistSessionCarsForApply(carIds, false, null);
          if (isE2EVinFlowEnabled) {
            syncE2ESavedCarMakeModelOnlyMeta(newCarId, carIds);
          }
          applyExistingSessionCar(newCarId, undefined);
          if (isE2EVinFlowEnabled) {
            setSearchedCarVin(newCarId, null);
            setE2ESavedCarVin(newCarId, null);
          }
          return;
        }
        if (isEditSave && isSearchedCarIdInSession(newCarId)) {
          if (isE2EVinFlowEnabled) {
            if (oldCarsApiId?.trim() && oldCarsApiId.trim() !== newCarId) {
              transferE2ESavedCarMeta(oldCarsApiId, newCarId);
            }
            syncE2ESavedCarMakeModelOnlyMeta(newCarId, carIds);
          }
          applyExistingSessionCar(newCarId, oldCarsApiId);
          if (isE2EVinFlowEnabled) {
            // Clear after replace so moved VIN from old id is not kept on vehicle Save.
            setSearchedCarVin(newCarId, null);
            setE2ESavedCarVin(newCarId, null);
          }
          return;
        }
        persistSessionCarsForApply(carIds, isEditSave, oldCarsApiId);
        if (isE2EVinFlowEnabled) {
          if (isEditSave && oldCarsApiId?.trim() && oldCarsApiId.trim() !== newCarId) {
            transferE2ESavedCarMeta(oldCarsApiId, newCarId);
          }
          syncE2ESavedCarMakeModelOnlyMeta(newCarId, carIds);
          // Hero Save without VIN field → search-by-car; clear stored VIN context.
          setSearchedCarVin(newCarId, null);
          setE2ESavedCarVin(newCarId, null);
        }
      } else if (isAuthenticated) {
        const isEditSave = Boolean(oldCarsApiId?.trim());
        await persistGarageCarsForApply({
          carIds: isE2EVinFlowEnabled ? carIdsForE2EPersistence(carIds) : carIds,
          isEdit: isEditSave,
          editOldCarsApiId: oldCarsApiId,
          editingMyCarRecordId,
          queryClient,
          garageSavedCarsQueryKey,
          ...(isE2EVinFlowEnabled
            ? {
                makeModelOnly: isE2EMakeModelOnlyResolvedLength(carIds),
                resolvedCarIdsForName: carIds,
                vin: null,
              }
            : {}),
        });
      }

      const saveUrlCarIds = isE2EVinFlowEnabled
        ? urlCarIdsForE2EApply(carIds)
        : urlCarIdsForApply(carIds, Boolean(oldCarsApiId?.trim()));
      if (saveUrlCarIds.length > 0) {
        updateFilters(
          { carIds: saveUrlCarIds } as Parameters<typeof updateFilters>[0],
          carApplyDestination,
          "desktop",
          false,
          true,
          isListingPage ? { appendAllowedTrackingQueryParams: true } : undefined,
        );
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(HERO_CARS_REFRESH_EVENT));
      }
      useRightSidebarStore.getState().hideRightSidebar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save car");
    } finally {
      setIsSaving(false);
    }
  }, [
    applyExistingSessionCar,
    carIds,
    editingCarsApiId,
    editingMyCarRecordId,
    canApplyCarSearch,
    isAuthenticated,
    carApplyDestination,
    isListingPage,
    isE2EVinFlowEnabled,
    prefillCarIds,
    updateFilters,
    garageSavedCarsQueryKey,
    queryClient,
  ]);

  const handleFindCarParts = useCallback(async () => {
    if (!canApplyCarSearch || isGarageApplyInFlightRef.current) return;
    setSkipSidebarPrefill(false);
    setFindCarPartsDirty(false);

    const newCarId = primaryCarId(carIds);
    const editOldCarsApiId = getEditOldCarsApiId();
    const isEditApply = Boolean(editOldCarsApiId);
    /** E2E vehicle apply: persist only [0]; URL may carry 1–5 ids; never put `vin` (doc §4.4). */
    const persistCarIds = isE2EVinFlowEnabled ? carIdsForE2EPersistence(carIds) : carIds;
    const urlCarIds = isE2EVinFlowEnabled
      ? urlCarIdsForE2EApply(carIds)
      : urlCarIdsForApply(carIds, isEditApply);

    invalidateEditPrefillCache(editOldCarsApiId);
    invalidateEditPrefillCache(newCarId);

    if (shouldUseSessionCarHistory(isAuthenticated) && persistCarIds.length > 0) {
      if (!isEditApply && isSearchedCarIdInSession(newCarId)) {
        persistSessionCarsForApply(persistCarIds, false, null);
        if (!isE2EVinFlowEnabled) {
          applyExistingSessionCar(newCarId, undefined);
          return;
        }
      } else if (isEditApply && isSearchedCarIdInSession(newCarId)) {
        if (isE2EVinFlowEnabled) {
          persistSessionCarsForApply(persistCarIds, true, editOldCarsApiId);
        } else {
          applyExistingSessionCar(newCarId, editOldCarsApiId);
          return;
        }
      } else {
        persistSessionCarsForApply(persistCarIds, isEditApply, editOldCarsApiId);
      }
    }

    if (isAuthenticated && persistCarIds.length > 0) {
      isGarageApplyInFlightRef.current = true;
      try {
        await persistGarageCarsForApply({
          carIds: persistCarIds,
          isEdit: isEditApply,
          editOldCarsApiId,
          editingMyCarRecordId,
          queryClient,
          garageSavedCarsQueryKey,
          ...(isE2EVinFlowEnabled
            ? {
                makeModelOnly: isE2EMakeModelOnlyResolvedLength(carIds),
                resolvedCarIdsForName: carIds,
                vin: null,
              }
            : {}),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save car");
        return;
      } finally {
        isGarageApplyInFlightRef.current = false;
      }
    }

    // Guest only — logged-in uses Garage `name` / `vin`.
    if (isE2EVinFlowEnabled && persistCarIds[0] && shouldUseSessionCarHistory(isAuthenticated)) {
      if (isEditApply && editOldCarsApiId?.trim() && editOldCarsApiId.trim() !== persistCarIds[0]) {
        transferE2ESavedCarMeta(editOldCarsApiId, persistCarIds[0]);
      }
      syncE2ESavedCarMakeModelOnlyMeta(persistCarIds[0], carIds);
      // Search-by-car apply — clear any VIN attached from a prior VIN search.
      setSearchedCarVin(persistCarIds[0], null);
      setE2ESavedCarVin(persistCarIds[0], null);
    }

    if (isE2EVinFlowEnabled) {
      useE2EVinSearchStore.getState().setVinNumber("");
      useE2EVinSearchStore.getState().setSidebarVinError(null);
      useE2EVinSearchStore.getState().clearVinResolvedCarIds();
    }

    useRightSidebarStore.setState({
      listingPrefillCarsApiId: null,
      editingCarsApiId: null,
      editingMyCarRecordId: null,
      forceEmptySidebar: false,
      ...(isE2EVinFlowEnabled ? { vinPrefillCarsApiId: null } : {}),
    });
    clearEditingSearchedCarId();

    if (urlCarIds.length === 0) return;

    updateFilters(
      (isE2EVinFlowEnabled
        ? { carIds: urlCarIds, vin: null }
        : { carIds: urlCarIds }) as Parameters<typeof updateFilters>[0],
      carApplyDestination,
      "desktop",
      false,
      true,
      isListingPage ? { appendAllowedTrackingQueryParams: true } : undefined,
    );
    if (isListingPage && useFilterModalStore.getState().isOpen) {
      useFilterModalStore.getState().closeModal();
    }
    useRightSidebarStore.getState().hideRightSidebar();
  }, [
    applyExistingSessionCar,
    carIds,
    carApplyDestination,
    editingMyCarRecordId,
    canApplyCarSearch,
    garageSavedCarsQueryKey,
    getEditOldCarsApiId,
    isAuthenticated,
    isE2EVinFlowEnabled,
    isListingPage,
    queryClient,
    updateFilters,
  ]);

  const handlePrimaryCta = useCallback(() => {
    if (isHeroSaveMode) {
      void handleSave();
    } else {
      void handleFindCarParts();
    }
  }, [handleFindCarParts, handleSave, isHeroSaveMode]);

  const isCtaDisabled = useMemo(() => {
    if (isSaving || isEditPrefillActive || !canApplyCarSearch || isLoading || loadingCarDetails)
      return true;
    if (isHeroSaveMode) return false;
    if (urlHasCarIds && !findCarPartsDirty) return true;
    return false;
  }, [
    canApplyCarSearch,
    findCarPartsDirty,
    isEditPrefillActive,
    isHeroSaveMode,
    isLoading,
    isSaving,
    loadingCarDetails,
    urlHasCarIds,
  ]);

  const isVinPrefillFlow =
    !forceEmptySidebar &&
    (Boolean(vinPrefillCarsApiId?.trim()) ||
      (isE2EVinFlowEnabled && Boolean(urlVin) && urlCarIdList.length > 0));

  const isPrefillLoading =
    (isHeroSaveMode && isEditPrefillActive) ||
    (enabled && isSidebarEditFlow && (isEditPrefillActive || isLoading || loadingCarDetails)) ||
    (enabled && isVinPrefillFlow && (isLoading || loadingCarDetails));

  return {
    isFeatureEnabled,
    isActive,
    selected,
    options: filterOptions,
    carIds,
    hasCarIdsProperty,
    canApplyCarSearch,
    isLoading,
    loadingCarDetails,
    error,
    openDropdown,
    setOpenDropdown,
    searchText,
    setSearchText,
    visibleFields,
    isCtaDisabled,
    isListingPage,
    isHeroSaveMode,
    isSaveMode: isHeroSaveMode,
    isSaving,
    isPrefillLoading,
    sidebarIntent,
    handleSelect,
    handleReset,
    handlePrimaryCta,
    handleApply: handlePrimaryCta,
  };
}
