import type { MakeModelTypeBrandItem } from "@/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { debouncedSearch } from "@/utils/debounce";
import { validateVIN, VinValidationResult } from "@/utils/vinStringValidationCheck";
// Lazy import to avoid circular dependency: useMmeStore → UtilityHelper → advancedSearchService → config/api → useAuthStore → useCartStore → useMmeStore
const flattenTree = <T extends Record<string, any>>(
  arr: T[],
  childKey: keyof T = "children" as keyof T,
) =>
  (
    require("@/helpers/UtilityHelper")
      .flattenTree as (typeof import("@/helpers/UtilityHelper"))["flattenTree"]
  )(arr, childKey);
import slugify from "slugify";
import { getCarById } from "@/services/cars";
import { formatCarDisplayLabel } from "@/utils/formatCarDisplayLabel";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { previousSearchSignatureFromEntry } from "@/utils/previousSearchSync";
// Lazy accessor to avoid circular dependency: useMmeStore → useCategorySearchStore → UtilityHelper → advancedSearchService → config/api → stores → useMmeStore
const getCategorySearchStore = () => require("./useCategorySearchStore").useCategorySearchStore;

type SearchMode = "vin" | "manually" | "oeRef";

// SavedCar Interface
interface SavedCar {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  typeId: string;
  typeName: string;
  engineId: string;
  engineName: string;
  id: string;
  name: string;
  year: number;
  makeModelTypeId: string;
  isFavorite: boolean;
  isNew: boolean;
  picture: string;
  /** Cars API id (new MME). Present on garage API rows. */
  carId?: string | null;
  data?: { carId?: string | null } | null;
}

// MME Search Data Interface
interface SearchData {
  makeModelTypeId?: string;
  make: { key: string; value: string; originalData?: any } | null;
  model: { key: string; value: string; originalData?: any } | null;
  engine: { key: string; value: string; originalData?: any } | null;
  oeReference?: undefined | any;
}

// Updated Previous Search Data Interface for MME
export interface PreviousSearchDataInterface {
  make: string;
  model: string;
  engine: string;
  timeAgo: string;
  OERef?: string | null;
  /** @deprecated legacy multi-select; prefer categoryId */
  parts?: object | null;
  categoryId?: string | null;
  carIds?: string[];
  carLabel?: string | null;
  title?: string | null;
  subtitle?: string | null;
  makeModelTypeId?: string | undefined;
  mmytData: any;
}

interface SearchResult {
  key: string;
  value: string;
  children?: Array<{
    key: string;
    value: string;
    originalData?: any;
  }>;
  originalData?: any;
}

// In-memory cache for MME search data - cleared when MME Enter is clicked
type MmeSearchDataCache = { searchData: SearchData; slug: string };
let mmeSearchDataCache: Map<string, MmeSearchDataCache> = new Map();

export const clearMmeApiCache = () => {
  mmeSearchDataCache.clear();
};

interface MmeStore {
  // State
  isOpen: boolean;
  isSearching: boolean;
  searchMode: SearchMode;
  currentStep: number; // 1-Make, 2-Model, 3-Engine, 4-Confirm Step
  searchData: SearchData;
  oeReference?: string | null | undefined;
  searchValue: string;
  searchResults: SearchResult[];
  previousSearches: PreviousSearchDataInterface[];
  carByVinResults: any[];
  vinValidation: VinValidationResult;

  // Modal State
  isMmeModalOpen: boolean;
  mmeModalStep: number; // 1-Search, 2-Confirm
  entryMmeModalStep: number; // remembers the step at which the modal was opened
  saveCarToGarage: boolean;
  partrefnumberwithoutsavedcar: string | null;
  partRefNumberWithOutSavedCar: string | null;
  partrefnumberdatawithoutsavedcar: any;
  selectedSavedCarInLandingPage: SavedCar | null;
  isEditFromLandingPage: boolean;
  // Engine Bay State
  isEB: boolean;
  ebMode: "add" | "edit";

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setSearchMode: (mode: SearchMode) => void;
  setCurrentStep: (step: number) => void;
  setSearchData: (data: SearchData) => void;
  setOeReference: (val?: string | null) => void;
  clearOeReference: () => void;
  setSearchValue: (value: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setCarByVinResults: (results: any[]) => void;
  setVinValidation: (vinValidation: VinValidationResult) => void;

  // Modal Actions
  openMmeModal: (step?: number) => void;
  closeMmeModal: () => void;
  setMmeModalStep: (step: number) => void;
  setSaveCarToGarage: (save: boolean) => void;

  // Engine Bay Actions
  setIsEB: (isEB: boolean) => void;
  setEbMode: (mode: "add" | "edit") => void;

  // API Integration
  fetchBrands: () => Promise<void>;
  fetchModels: (makeId: string) => Promise<void>;
  fetchEngines: (modelId: string) => Promise<void>;
  fetchCarByVin: (value: string) => Promise<any | null>;

  // Search Logic
  updateSearchData: (data: { key: string; value: string }, originalData?: any) => Promise<void>;
  setStep: (step: number) => Promise<void>;
  fetchSearchResults: () => Promise<void>;

  // Backward Generation
  generateMmeSearchData: (makeModelTypeId: string) => Promise<any>;
  clearMmeApiCache: () => void;

  // Previous Searches
  addToPreviousSearches: (params: {
    carIds?: string | string[];
    makeModelTypeId?: string;
    oeReference?: string;
    categoryId?: string;
  }) => void;
  prependPreviousSearchEntry: (entry: PreviousSearchDataInterface) => void;
  returnMmeSearchData: (makeModelTypeId: string) => Promise<any>;
  getCarDataMME: () => any;
  setpartrefnumberwithoutsavedcar: (partrefnumberwithoutsavedcar: string | null) => void;
  setPartRefNumberWithoutSavedCar: (partrefnumberdatawithoutsavedcar: any) => void;
  setpartrefnumberdatawithoutsavedcar: (partrefnumberdatawithoutsavedcar: any) => void;
  setSelectedSavedCarInLandingPage: (car: SavedCar | null) => void;
  setIsEditFromLandingPage: (value: boolean) => void;
  // Reset Functions
  resetSearch: () => void;
  resetVinSearch: () => void;
  resetOeRefSearch: () => void;
  clearPreviousSearches: () => void;
  resetpartrefnumberwithoutsavedcar: () => void;
}

export const useMmeStore = create<MmeStore>()(
  persist(
    (set, get) => ({
      // Initial State
      isOpen: false,
      isSearching: false,
      searchMode: "manually",
      currentStep: 1,
      searchData: {
        make: null,
        model: null,
        engine: null,
      },
      oeReference: undefined,
      searchValue: "",
      partrefnumberwithoutsavedcar: null,
      partRefNumberWithOutSavedCar: null,
      partrefnumberdatawithoutsavedcar: null,
      selectedSavedCarInLandingPage: null,
      isEditFromLandingPage: false,
      searchResults: [],
      previousSearches: [],
      carByVinResults: [],
      vinValidation: {
        isValid: false,
        error: "",
      },

      // Modal State
      isMmeModalOpen: false,
      mmeModalStep: 1,
      entryMmeModalStep: 1,
      saveCarToGarage: true,

      // Engine Bay State
      isEB: false,
      ebMode: "add",

      // Basic Actions
      openModal: () => {
        set({ isOpen: true });
        get().fetchSearchResults();
      },

      closeModal: () => set({ isOpen: false }),

      setSearchMode: (mode: SearchMode) => {
        if (mode === "vin") {
          get().resetVinSearch();
        } else if (mode === "oeRef") {
          get().resetOeRefSearch();
        } else {
          get().resetSearch();
        }
        set({ searchMode: mode });
      },

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setSearchData: (data: SearchData) => {
        set({ searchData: data });
      },
      setOeReference: (val?: string | null) => {
        set({ oeReference: val });
      },
      clearOeReference: () => {
        set({
          oeReference: undefined,
        });
      },
      setpartrefnumberwithoutsavedcar: (partrefnumberwithoutsavedcar: string | null) => {
        set({ partrefnumberwithoutsavedcar: partrefnumberwithoutsavedcar });
      },
      setPartRefNumberWithoutSavedCar: (partrefnumberdatawithoutsavedcar: any) => {
        set({ partRefNumberWithOutSavedCar: partrefnumberdatawithoutsavedcar });
      },
      setpartrefnumberdatawithoutsavedcar: (partrefnumberdatawithoutsavedcar: any) => {
        set({ partrefnumberdatawithoutsavedcar: partrefnumberdatawithoutsavedcar });
      },
      setSelectedSavedCarInLandingPage: (car: SavedCar | null) => {
        set({ selectedSavedCarInLandingPage: car });
      },
      setIsEditFromLandingPage: (value: boolean) => {
        set({ isEditFromLandingPage: value });
      },
      setSearchValue: (value: string) => set({ searchValue: value }),

      setSearchResults: (results: SearchResult[]) => set({ searchResults: results }),

      setIsSearching: (isSearching: boolean) => set({ isSearching }),

      setCarByVinResults: (results: any[]) => set({ carByVinResults: results }),

      setVinValidation: (vinValidation: VinValidationResult) => set({ vinValidation }),

      resetpartrefnumberwithoutsavedcar: () => {
        set({ partrefnumberwithoutsavedcar: null });
        set({ partrefnumberdatawithoutsavedcar: null });
        set({ partRefNumberWithOutSavedCar: null });
      },

      // API Integration
      // ✅ Optimized: Uses cached getBrands() - won't make duplicate API calls
      fetchBrands: async () => {
        const { searchResults } = get();

        // ✅ Skip if we already have brands loaded in searchResults
        if (searchResults && searchResults.length > 0) {
          return;
        }

        try {
          set({ isSearching: true });
          const { getBrands } = await import("@/services/search");
          const response = await getBrands(); // ✅ This is cached for 24 hours
          let results: any[] = [];

          if (response && response.data && response.data.length > 0) {
            results = response.data?.map((brand: MakeModelTypeBrandItem) => ({
              key: brand.id,
              value: brand.brand ?? "",
            }));
          }
          set({ searchResults: results });
        } catch (error) {
          console.error("Error fetching brands:", error);
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false });
        }
      },

      fetchModels: async (makeId: string) => {
        try {
          set({ isSearching: true });
          const { getModalTypes } = await import("@/services/search");
          const response = await getModalTypes(makeId);

          if (response && response.data.length > 0) {
            // Group by model name
            const groupedModels = response.data.reduce((acc: any, item: any) => {
              if (!acc[item.model]) {
                acc[item.model] = [];
              }
              acc[item.model].push(item);
              return acc;
            }, {});

            // Convert to search results format - show model name as header, variants as children
            const results = Object.keys(groupedModels)
              ?.map((modelName) => {
                const firstItem = groupedModels[modelName][0];
                // console.log(modelName,"firstItem>>>>>>");

                return {
                  key: modelName, // Use model name as key for grouping
                  value: modelName, // Show just the model name as header
                  originalData: firstItem,
                  children: groupedModels[modelName]?.map((item: any) => ({
                    key: item.id,
                    value: `${item.model} ${item.type || ""}`.trim(),
                    originalData: item,
                  })),
                };
              })
              .sort((a, b) => a.value.localeCompare(b.value));
            set({ searchResults: results });
          } else {
            set({ searchResults: [] });
          }
        } catch (error) {
          console.error("Error fetching models:", error);
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false });
        }
      },

      fetchEngines: async (modelId: string) => {
        try {
          set({ isSearching: true });
          const { getEngines } = await import("@/services/search");
          const response = await getEngines(modelId);

          if (response && response.data && response.data.length > 0) {
            // Group engines by fuel type
            const groupedEngines = response.data.reduce(
              (acc: Record<string, MakeModelTypeBrandItem[]>, engine: MakeModelTypeBrandItem) => {
                const fuelType = engine.fuel ?? "Other";
                if (!acc[fuelType]) {
                  acc[fuelType] = [];
                }
                acc[fuelType].push(engine);
                return acc;
              },
              {},
            );

            // Convert to hierarchical search results format
            const results = Object.keys(groupedEngines)?.map((fuelType) => {
              const enginesInGroup = groupedEngines[fuelType];

              return {
                key: fuelType, // Use fuel type as key for grouping
                value: fuelType, // Show fuel type as category header
                children:
                  enginesInGroup?.map((engine: MakeModelTypeBrandItem) => {
                    // Use the engine property directly from API response
                    const engineDisplay = engine.engine ?? "Engine not specified";

                    return {
                      key: engine.id,
                      value: engineDisplay,
                      originalData: engine,
                    };
                  }) ?? [],
              };
            });

            set({ searchResults: results });
          } else {
            set({ searchResults: [] });
          }
        } catch (error) {
          console.error("Error fetching engines:", error);
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false });
        }
      },

      fetchCarByVin: async (value: string) => {
        if (!value) {
          set({
            vinValidation: {
              isValid: false,
              error: "VIN cannot be empty",
            },
          });
          return null;
        }

        set({ isSearching: true });
        try {
          const { getCarByVin } = await import("@/services/search");
          const response = await getCarByVin(value);
          set({ isSearching: false });

          if (response && Object.keys(response.data).length > 0) {
            const data = {
              brand: response.data.brandName,
              model: response.data.modelName,
              engine: response.data.engineName || "",
              vin: response.data.vin,
              id: response.data.makeModelTypeId,
            };
            set({ carByVinResults: [data] });
            return data;
          } else {
            set({ carByVinResults: [] });
            return null;
          }
        } catch (error) {
          console.error("Error in fetchCarByVin:", error);
          set({ isSearching: false });
          set({ carByVinResults: [] });
          return null;
        }
      },

      // Search Logic
      updateSearchData: async (data: { key: string; value: string }, originalData?: any) => {
        const { currentStep, searchData } = get();
        const newSearchData = { ...searchData };

        switch (currentStep) {
          case 1: // Make selection
            set({ isSearching: true });

            // Check if make value is actually changing
            const previousMakeValue = searchData.make?.value;
            const newMakeValue = data.value;
            const isMakeValueChanged = String(previousMakeValue) !== String(newMakeValue);

            newSearchData.make = data;

            // Only clear subsequent values if the make value actually changed
            if (isMakeValueChanged) {
              newSearchData.model = null;
              newSearchData.engine = null;
            }

            set({ currentStep: 2 });
            set({ searchData: newSearchData });
            set({ searchResults: [] });

            // Fetch models for the selected make
            await get().fetchModels(data.key);
            break;

          case 2: // Model selection
            set({ isSearching: true });

            // Check if model value is actually changing
            const previousModelValue = searchData.model?.value;
            const newModelValue = data.value;
            const isModelValueChanged = String(previousModelValue) !== String(newModelValue);

            // Store the model data with the correct key (modelId) and value (model + type)
            newSearchData.model = {
              key: data.key, // This will be the modelId
              value: data.value, // This will be "model + type"
              originalData: originalData,
            };

            // Only clear subsequent values if the model value actually changed
            if (isModelValueChanged) {
              newSearchData.engine = null;
            }

            set({ currentStep: 3 });
            set({ searchData: newSearchData });
            set({ searchResults: [] });

            // Fetch engines for the selected model
            await get().fetchEngines(data.key);
            break;

          case 3: // Engine selection
            newSearchData.engine = data;
            set({ searchData: newSearchData });
            set({ currentStep: 4 });
            break;
        }
      },

      setStep: async (step: number) => {
        const { searchData, currentStep } = get();

        set({ currentStep: step });
        set({ searchValue: "" }); // Clear search value for all steps

        // ✅ Always clear searchResults when switching to a different step
        // This ensures we fetch fresh data for the correct step
        const isStepChanging = currentStep !== step;
        if (isStepChanging) {
          set({ searchResults: [] });
        }

        switch (step) {
          case 1:
            // ✅ Don't fetch brands here - components handle it via BrandsContext
            // Components will populate searchResults from BrandsContext after setStep completes
            break;

          case 2:
            if (searchData.make?.key) {
              // ✅ Always fetch models for the selected make when opening step 2
              // This ensures correct models are shown even if searchResults had data from a different step
              await get().fetchModels(searchData.make.key);
            } else {
              // Clear searchResults if no make is selected
              set({ searchResults: [] });
            }
            break;

          case 3:
            if (searchData.model?.key) {
              // ✅ Always fetch engines for the selected model when opening step 3
              // This ensures correct engines are shown even if searchResults had data from a different step
              await get().fetchEngines(searchData.model.key);
            } else {
              // Clear searchResults if no model is selected
              set({ searchResults: [] });
            }
            break;
        }
      },

      fetchSearchResults: async () => {
        const { currentStep, searchResults } = get();

        if (currentStep === 1 && searchResults?.length === 0) {
          await get().fetchBrands();
        }
      },

      // Backward Generation
      generateMmeSearchData: async (makeModelTypeId: string) => {
        // Return cached result when available - avoids API calls on filter changes
        const cached = mmeSearchDataCache.get(makeModelTypeId);
        if (cached) {
          set({ searchData: cached.searchData });
          return cached.slug;
        }

        try {
          set({ isSearching: true });

          // Step 1: Find the last non-zero position to determine which level user completed
          let lastNonZeroPosition = -1;
          for (let i = 0; i < makeModelTypeId.length; i++) {
            if (makeModelTypeId[i] !== "0") {
              lastNonZeroPosition = i;
            }
          }

          // Step 2: Determine which level was completed based on last non-zero position
          let completedLevel = 0;
          if (lastNonZeroPosition >= 0 && lastNonZeroPosition <= 2) {
            // Position 0-2: Level 1 (Brand/Make) - BBB000000000000000
            completedLevel = 1;
          } else if (
            (lastNonZeroPosition >= 3 && lastNonZeroPosition <= 8) ||
            (lastNonZeroPosition >= 3 && lastNonZeroPosition <= 10)
          ) {
            // Position 3-10: Level 2 (Model) - BBBMMMTTT00000000
            completedLevel = 2;
          } else if (lastNonZeroPosition >= 11) {
            // Position 11+: Level 3 (Engine) - BBBMMMTTTYYEEEVVV
            completedLevel = 3;
          }

          // Step 3: Extract IDs based on completed level
          let makeId = "";
          let modelId = "";
          let modelIdWithYear = "";
          let engineId = "";

          if (completedLevel >= 1) {
            makeId = makeModelTypeId.substring(0, 3); // BBB
          }
          if (completedLevel >= 2) {
            modelId = makeModelTypeId.substring(3, 9); // MMMTTT
            modelIdWithYear = makeModelTypeId.substring(3, 11); // MMMTTTYY
          }
          if (completedLevel >= 3) {
            engineId = makeModelTypeId.substring(9, 17); // YYEEEVVV
          }

          // Step 4: Create actual usable IDs by concatenating with zeros
          const actualMakeId = makeId + "00000000000000"; // makeId + 14 zeros
          const actualModelId = makeId + modelId + "00000000"; // makeId + modelId + 8 zeros
          const actualModelIdWithYear = makeId + modelIdWithYear + "000000"; // makeId + modelIdWithYear + 6 zeros
          const actualEngineId = makeModelTypeId; // Full ID for engine

          // Step 5: Generate search data by calling APIs in sequence
          const { getBrands, getModalTypes, getEngines } = await import("@/services/search");
          const newSearchData: SearchData = {
            makeModelTypeId: makeModelTypeId,
            make: null,
            model: null,
            engine: null,
          };
          let makeData: any = "";
          let modelData: any = "";
          let engineData: any = "";
          // Step 5a: Get Make data
          if (makeId && makeId !== "000") {
            const brandsResponse = await getBrands();
            if (brandsResponse?.data) {
              makeData = brandsResponse.data.find(
                (brand: MakeModelTypeBrandItem) => brand.id === actualMakeId,
              );
              if (makeData) {
                newSearchData.make = {
                  key: actualMakeId,
                  value: makeData.brand ?? "",
                  originalData: makeData,
                };
              }
            }
          }

          // Step 5b: Get Model data
          if (modelId && newSearchData.make?.key) {
            const modelsResponse = await getModalTypes(actualMakeId);
            if (modelsResponse?.data) {
              // Group models by model name (same logic as fetchModels)
              const groupedModels = modelsResponse.data.reduce((acc: any, item: any) => {
                if (!acc[item.model]) {
                  acc[item.model] = [];
                }
                acc[item.model].push(item);
                return acc;
              }, {});

              // Try to find model by ID first (actualModelId)
              modelData = modelsResponse.data.find((model: any) => model.id === actualModelId);

              // If not found, try with actualModelIdWithYear as fallback
              if (!modelData) {
                modelData = modelsResponse.data.find(
                  (model: any) => model.id === actualModelIdWithYear,
                );
              }

              // If still not found, try to find by model name within grouped data
              if (!modelData) {
                // Look through each grouped model to find a match
                for (const [modelName, modelVariants] of Object.entries(groupedModels)) {
                  const variants = modelVariants as any[];

                  // Try to find a variant that matches either actualModelId or actualModelIdWithYear
                  const matchingVariant = variants.find(
                    (variant: any) =>
                      variant.id === actualModelId || variant.id === actualModelIdWithYear,
                  );

                  if (matchingVariant) {
                    modelData = matchingVariant;

                    break;
                  }
                }
              }

              if (modelData) {
                newSearchData.model = {
                  key: modelData.id, // Use the actual ID that was found
                  value: `${modelData.model} ${modelData.type || ""}`.trim(),
                  originalData: modelData,
                };
              } else {
              }
            }
          }

          // Step 5c: Get Engine data
          if (engineId && newSearchData.model?.key) {
            const enginesResponse = await getEngines(actualModelId);
            if (enginesResponse?.data) {
              engineData = enginesResponse.data.find(
                (engine: MakeModelTypeBrandItem) => engine.id === actualEngineId,
              );
              if (engineData) {
                // Use the engine property directly from API response (same as fetchEngines)
                const engineDisplay = engineData.engine ?? "Engine not specified";

                newSearchData.engine = {
                  key: actualEngineId,
                  value: engineDisplay,
                  originalData: engineData,
                };
              }
            }
          }

          // Step 6: Update store with generated data
          set({ searchData: newSearchData });
          // Step 7: Set appropriate step based on completed level
          if (completedLevel === 3) {
            set({ currentStep: 4 }); // All levels completed
          } else if (completedLevel === 2) {
            set({ currentStep: 3 }); // Up to model level
          } else if (completedLevel === 1) {
            set({ currentStep: 2 }); // Up to make level
          } else {
            set({ currentStep: 1 }); // No data found
          }

          const slug = `${slugify(
            [makeData?.brand, modelData?.model, modelData?.type?.replaceAll("+", "plus")]
              .filter(Boolean)
              .join("-"),
            {
              strict: true,
              trim: true,
            },
          )}`;

          mmeSearchDataCache.set(makeModelTypeId, { searchData: newSearchData, slug });
          set({ isSearching: false });
          return slug;
        } catch (error) {
          console.error("❌ Error generating MME search data:", error);
          set({ isSearching: false });
          set({ searchData: { make: null, model: null, engine: null } });
          set({ currentStep: 1 });
        }
      },

      clearMmeApiCache: () => {
        mmeSearchDataCache.clear();
      },

      prependPreviousSearchEntry: (entry: PreviousSearchDataInterface) => {
        const { previousSearches } = get();
        const sig = previousSearchSignatureFromEntry(entry);
        const withoutDup = sig
          ? previousSearches.filter((item) => previousSearchSignatureFromEntry(item) !== sig)
          : previousSearches;
        set({
          previousSearches: [entry, ...withoutDup.slice(0, 9)],
        });
      },

      // Previous Searches
      addToPreviousSearches: async (params: {
        carIds?: string | string[];
        makeModelTypeId?: string;
        oeReference?: string;
        categoryId?: string;
      }) => {
        const { previousSearches } = get();

        const modifiedFormattedData: PreviousSearchDataInterface = {
          make: "",
          model: "",
          engine: "",
          timeAgo: new Date().toISOString(),
          OERef: null,
          parts: null,
          categoryId: null,
          carLabel: null,
          title: null,
          subtitle: null,
          mmytData: null,
        };

        const carIds = Array.isArray(params.carIds)
          ? params.carIds.map((id) => String(id).trim()).filter(Boolean)
          : parseCarIdsParam(typeof params.carIds === "string" ? params.carIds : null);

        if (carIds.length > 0) {
          modifiedFormattedData.carIds = carIds;
          try {
            const response = await getCarById(carIds[0]!);
            const car = response.data;
            modifiedFormattedData.carLabel = formatCarDisplayLabel(car);
            modifiedFormattedData.make = car.make ?? "";
            modifiedFormattedData.model = car.model ?? "";
          } catch {
            modifiedFormattedData.carLabel = carIds[0] ?? null;
          }
        } else if (params.makeModelTypeId) {
          try {
            const mmeSearchData = await get().returnMmeSearchData(params.makeModelTypeId);

            if (mmeSearchData) {
              modifiedFormattedData.make = mmeSearchData.make?.value || "";
              modifiedFormattedData.model = mmeSearchData.model?.value || "";
              modifiedFormattedData.engine = mmeSearchData.engine?.value || "";
              modifiedFormattedData.makeModelTypeId = params.makeModelTypeId;
              modifiedFormattedData.mmytData = mmeSearchData;
              modifiedFormattedData.carLabel =
                `${mmeSearchData.make?.value || ""} ${mmeSearchData.model?.value || ""}`.trim();
            }
          } catch (error) {
            console.error("❌ PREVSEARCH Error generating MME data:", error);
          }
        }

        if (params.oeReference) {
          modifiedFormattedData.OERef = params.oeReference;
        }

        if (params.categoryId) {
          modifiedFormattedData.categoryId = params.categoryId;
          const nestedMasterCategoryList: any[] =
            getCategorySearchStore().getState().nestedMasterCategoryList;
          const selectedCategories = flattenTree(nestedMasterCategoryList, "children").filter(
            (itm: { id?: string }) => itm.id === params.categoryId,
          );
          if (selectedCategories.length > 0) {
            modifiedFormattedData.parts = selectedCategories;
          }
        }

        const hasCar =
          (modifiedFormattedData.carIds?.length ?? 0) > 0 ||
          Boolean(modifiedFormattedData.make?.trim());
        const hasCategory = Boolean(modifiedFormattedData.categoryId?.trim());
        const hasOe = Boolean(modifiedFormattedData.OERef?.trim());

        if (hasCar || hasOe || hasCategory) {
          const sig = previousSearchSignatureFromEntry(modifiedFormattedData);
          const withoutDup = sig
            ? previousSearches.filter((item) => previousSearchSignatureFromEntry(item) !== sig)
            : previousSearches;
          set({
            previousSearches: [modifiedFormattedData, ...withoutDup.slice(0, 9)],
          });
        }
      },

      // Reusable function that returns MME search data without setting it in store
      returnMmeSearchData: async (makeModelTypeId: string) => {
        try {
          // Step 1: Find the last non-zero position to determine which level user completed
          let lastNonZeroPosition = -1;
          for (let i = 0; i < makeModelTypeId.length; i++) {
            if (makeModelTypeId[i] !== "0") {
              lastNonZeroPosition = i;
            }
          }

          // Step 2: Determine which level was completed based on last non-zero position
          let completedLevel = 0;
          if (lastNonZeroPosition >= 0 && lastNonZeroPosition <= 2) {
            completedLevel = 1;
          } else if (lastNonZeroPosition >= 3 && lastNonZeroPosition <= 8) {
            completedLevel = 2;
          } else if (lastNonZeroPosition >= 11) {
            completedLevel = 3;
          }

          // Step 3: Extract IDs based on completed level
          let makeId = "";
          let modelId = "";
          let modelIdWithYear = "";
          let engineId = "";

          if (completedLevel >= 1) {
            makeId = makeModelTypeId.substring(0, 3);
          }
          if (completedLevel >= 2) {
            modelId = makeModelTypeId.substring(3, 9);
            modelIdWithYear = makeModelTypeId.substring(3, 11);
          }
          if (completedLevel >= 3) {
            engineId = makeModelTypeId.substring(9, 17);
          }

          // Step 4: Create actual usable IDs by concatenating with zeros
          const actualMakeId = makeId + "00000000000000";
          const actualModelId = makeId + modelId + "00000000";
          const actualModelIdWithYear = makeId + modelIdWithYear + "000000";
          const actualEngineId = makeModelTypeId;

          // Step 5: Generate search data by calling APIs in sequence
          const { getBrands, getModalTypes, getEngines } = await import("@/services/search");
          const newSearchData: SearchData = {
            makeModelTypeId: makeModelTypeId,
            make: null,
            model: null,
            engine: null,
          };

          // Step 5a: Get Make data
          if (makeId && makeId !== "000") {
            const brandsResponse = await getBrands();
            if (brandsResponse?.data) {
              const makeData = brandsResponse.data.find(
                (brand: MakeModelTypeBrandItem) => brand.id === actualMakeId,
              );
              if (makeData) {
                newSearchData.make = {
                  key: actualMakeId,
                  value: makeData.brand ?? "",
                  originalData: makeData,
                };
              }
            }
          }

          // Step 5b: Get Model data
          if (modelId && newSearchData.make?.key) {
            const modelsResponse = await getModalTypes(actualMakeId);
            if (modelsResponse?.data) {
              // Group models by model name (same logic as fetchModels)
              const groupedModels = modelsResponse.data.reduce((acc: any, item: any) => {
                if (!acc[item.model]) {
                  acc[item.model] = [];
                }
                acc[item.model].push(item);
                return acc;
              }, {});

              // Try to find model by ID first (actualModelId)
              let modelData = modelsResponse.data.find((model: any) => model.id === actualModelId);

              // If not found, try with actualModelIdWithYear as fallback
              if (!modelData) {
                modelData = modelsResponse.data.find(
                  (model: any) => model.id === actualModelIdWithYear,
                );
              }

              // If still not found, try to find by model name within grouped data
              if (!modelData) {
                // Look through each grouped model to find a match
                for (const [modelName, modelVariants] of Object.entries(groupedModels)) {
                  const variants = modelVariants as any[];

                  // Try to find a variant that matches either actualModelId or actualModelIdWithYear
                  const matchingVariant = variants.find(
                    (variant: any) =>
                      variant.id === actualModelId || variant.id === actualModelIdWithYear,
                  );

                  if (matchingVariant) {
                    modelData = matchingVariant;

                    break;
                  }
                }
              }

              if (modelData) {
                newSearchData.model = {
                  key: modelData.id, // Use the actual ID that was found
                  value: `${modelData.model} ${modelData.type || ""}`.trim(),
                  originalData: modelData,
                };
              } else {
              }
            }
          }

          // Step 5c: Get Engine data
          if (engineId && newSearchData.model?.key) {
            const enginesResponse = await getEngines(actualModelId);
            if (enginesResponse?.data) {
              const engineData = enginesResponse.data.find(
                (engine: MakeModelTypeBrandItem) => engine.id === actualEngineId,
              );
              if (engineData) {
                const engineDisplay = engineData.engine ?? "Engine not specified";
                newSearchData.engine = {
                  key: actualEngineId,
                  value: engineDisplay,
                  originalData: engineData,
                };
              }
            }
          }

          return newSearchData;
        } catch (error) {
          console.error("❌ PREVSEARCH Error generating MME search data:", error);
          return null;
        }
      },

      getCarDataMME: () => {
        const { searchData, carByVinResults } = get();
        const carData = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          engine: searchData.engine?.value || carByVinResults[0]?.engine || "",
          mmytData: searchData.make?.value ? searchData : carByVinResults[0],
        };
        return JSON.stringify(carData);
      },

      // Reset Functions
      resetSearch: () => {
        set({
          searchData: {
            make: null,
            model: null,
            engine: null,
          },
          oeReference: undefined,
          currentStep: 1,
          searchValue: "",
          carByVinResults: [],
          searchResults: [],
          vinValidation: {
            isValid: false,
            error: "",
          },
          selectedSavedCarInLandingPage: null,
        });
        get().setStep(1);
      },

      resetVinSearch: () => {
        set({
          searchMode: "vin",
          searchData: {
            make: null,
            model: null,
            engine: null,
          },
          currentStep: 1,
          searchValue: "",
          carByVinResults: [],
          vinValidation: {
            isValid: false,
            error: "",
          },
        });
      },

      resetOeRefSearch: () => {
        set({
          searchMode: "oeRef",
          searchData: {
            make: null,
            model: null,
            engine: null,
          },
          oeReference: undefined,
          currentStep: 1,
          searchValue: "",
          carByVinResults: [],
          searchResults: [],
          vinValidation: {
            isValid: false,
            error: "",
          },
        });
      },

      // Clear previous searches for testing
      clearPreviousSearches: () => {
        set({ previousSearches: [] });
      },

      // Modal Actions
      openMmeModal: (step = 2) => {
        set({
          isMmeModalOpen: true,
          mmeModalStep: step,
          entryMmeModalStep: step,
          saveCarToGarage: true,
        });
      },

      closeMmeModal: () => {
        set({
          isMmeModalOpen: false,
          mmeModalStep: 2,
          entryMmeModalStep: 2,
          saveCarToGarage: true,
        }); // Reset to Step 2 when closing
      },

      setMmeModalStep: (step: number) => {
        set({ mmeModalStep: step });
      },

      setSaveCarToGarage: (save: boolean) => {
        set({ saveCarToGarage: save });
      },

      // Engine Bay Actions
      setIsEB: (isEB: boolean) => {
        set({ isEB });
      },

      setEbMode: (mode: "add" | "edit") => {
        set({ ebMode: mode });
      },
    }),
    {
      name: "mme-search-storage",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
