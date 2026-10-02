import {
  carMakes,
  getModelsByMake,
  getTypesByModelYear,
  getYearsByModel,
} from "@/data/previousSearch/car-makes";
import { flattenTree, groupBy } from "@/helpers/UtilityHelper";
import {
  getBrands,
  getCarByVin,
  getModels,
  getTypes,
  getYears,
  searchMakeModelType,
} from "@/services/search";
import { debouncedSearch } from "@/utils/debounce";
import { validateVIN, VinValidationResult } from "@/utils/vinStringValidationCheck";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import type { MakeModelTypeBrandItem } from "@/type";
import type { PartsCategoryInterface } from "@/types/categories";
import type { IManufacturer } from "./useFilter";
import type { EngineTrimResponseDataInterface } from "@/services/products";
// Lazy accessors to avoid circular dependency: useSearchModalStore ↔ useAdvancedSearchStore ↔ useCategorySearchStore
const getAdvancedSearchStore = () => require("./useAdvancedSearchStore").useAdvancedSearchStore;
const getCategorySearchStore = () => require("./useCategorySearchStore").useCategorySearchStore;
const getMmeStore = () => require("./useMmeStore").useMmeStore;

function syncPreviousSearchToMmeStore(params: {
  carIds?: string | string[];
  makeModelTypeId?: string | null;
  oeReference?: string;
  categoryId?: string | null;
}) {
  const payload: {
    carIds?: string | string[];
    makeModelTypeId?: string;
    oeReference?: string;
    categoryId?: string;
  } = {};

  if (params.carIds) payload.carIds = params.carIds;
  if (params.makeModelTypeId) payload.makeModelTypeId = params.makeModelTypeId;
  if (params.oeReference) payload.oeReference = params.oeReference;
  if (params.categoryId) payload.categoryId = params.categoryId;

  if (Object.keys(payload).length === 0) return;
  void getMmeStore().getState().addToPreviousSearches(payload);
}

function syncAdvSearchEntriesToMme(
  entries: PreviousSearchDataInterface[],
  getMakeModelTypeId: () => string | null,
) {
  if (entries.length === 0) return;
  const { pickPrimaryCategoryId } = require("@/utils/categorySearchUrl");
  const mmytId = getMakeModelTypeId();

  for (const entry of entries) {
    const partsList = Array.isArray(entry.parts) ? entry.parts : entry.parts ? [entry.parts] : [];
    const categoryId = pickPrimaryCategoryId(
      partsList.map((p: { id?: string }) => p?.id).filter(Boolean),
    );
    syncPreviousSearchToMmeStore({
      makeModelTypeId: mmytId,
      categoryId: categoryId ?? null,
    });
  }
}

type SearchMode = "vehicle" | "vin";

// Extend SearchData interface
interface SearchData {
  makeModelTypeId?: string | undefined;
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;
  // Engine and Trim fields (optional)
  cc?: string | undefined;
  fuel?: string | undefined;
  hp?: string | undefined;
  body?: string | undefined;
  doors?: string | undefined;
  variant?: string | undefined;
  oeReference?: string | undefined;
  availability?: string | undefined;
}

export interface CarByVinResult {
  brand?: string | undefined;
  model?: string | undefined;
  yearFrom?: string | number | undefined;
  year?: string | number | undefined;
  type?: string | undefined;
  vin?: string | undefined;
  id?: string | undefined;
  makeModelTypeId?: string | undefined;
}

export interface PreviousSearchDataInterface {
  make: string;
  model: string;
  year: string;
  type: string;
  timeAgo: string;
  OERef?: string | null | undefined;
  parts?: unknown | null | undefined;
  title?: string | null | undefined;
  subtitle?: string | null | undefined;

  makeModelTypeId?: string | undefined;
  mmytData: SearchData | CarByVinResult;
  // Engine and Trim fields (optional)
  cc?: string | undefined;
  fuel?: string | undefined;
  hp?: string | undefined;
  body?: string | undefined;
  doors?: string | undefined;
  variant?: string | undefined;
}

interface SearchResult {
  key: string;
  value: string;
}

interface SearchModalStore {
  isOpen: boolean;
  isSearching: boolean;
  isOgSearchModalOpen: boolean;
  isEB: boolean;
  ebMode: "add" | "edit";
  fromRoute: "garage-bay" | "search-by-car" | "saved-cars" | "og-search";
  ogSearchModalContent: "saved" | "car" | "category" | "oe";
  isOgSearch: boolean;
  isCarVerified: boolean;
  searchMode: SearchMode; // search by vehicle or vin
  currentStep: number; // tract of current step
  searchData: SearchData; // stored as previousSearch and will be passed to search query
  searchValue: string; // search value
  searchResults: SearchResult[]; // search result based on value
  previousSearches: PreviousSearchDataInterface[]; // previous searches
  carByVinResults: CarByVinResult[]; // car by vin results
  vinValidation: VinValidationResult;

  // Dropdown arrays state
  engineSize: string[];
  fuel: string[];
  powerHp: string[];
  body: string[];
  doors: string[];
  seats: string[];
  variant: string[];

  // Actions
  openModal: () => void;
  setSearchData: (data: SearchData) => void;
  setIsEB: (isEB: boolean) => void;
  setEbMode: (ebMode: "add" | "edit") => void;
  openOgSearchModal: () => void;
  setOgSearchModalContent: (content: "saved" | "car" | "category" | "oe") => void;
  resetSearch: () => void;
  resetOgSearch: () => void;
  resetEB: () => void;
  closeModal: () => void;
  setFromRoute: (fromRoute: "garage-bay" | "search-by-car" | "saved-cars" | "og-search") => void;
  closeOgSearchModal: () => void;
  fetchCarByVin: (value: string) => Promise<void | null>;
  setIsSearching: (isSearching: boolean) => void;
  setIsOgSearch: (isOgSearch: boolean) => void;
  setIsCarVerified: (isCarVerified: boolean) => void;
  setCurrentStep: (step: number) => void;
  setSearchMode: (mode: SearchMode) => void;
  setSearchValue: (value: string) => void;
  updateSearchData: (data: { key: string; value: string }) => void;
  getMakeModelTypeId: (mmytData?: SearchData | CarByVinResult) => string | null;
  setStep: (step: number) => void;
  addToPreviousSearches: () => void;
  addOERefToPreviousSearches: (data: { OERef: string; parts: unknown }) => void;
  addToPreviousSearchesFromAdvSearchStore: (
    data: PartsCategoryInterface[] | [],
    title?: string,
  ) => void;
  setSearchResults: (results: SearchResult[]) => void;
  fetchSearchResults: () => void;
  setCarByVinResults: (results: CarByVinResult[]) => void;
  setVinValidation: (vinValidation: VinValidationResult) => void;

  // Dropdown setters
  setEngineSize: (engineSize: string[]) => void;
  setFuel: (fuel: string[]) => void;
  setPowerHp: (powerHp: string[]) => void;
  setBody: (body: string[]) => void;
  setDoors: (doors: string[]) => void;
  setSeats: (seats: string[]) => void;
  setVariant: (variant: string[]) => void;
  fetchEngineTrimData: (mmtId: string) => Promise<void>;

  getCarDataMMYTorVIN: () => string;
  carHash: string;
  setCarHash: (val: string) => void;
  prefillFromUrl: (makeModelTypeId: string, urlYear?: string) => Promise<void>;
  prefillManufacturerIdsFromUrl: (manufacturerIds: string) => Promise<void>;
  prefillCategoriesFromUrl: (
    categoryIds: string,
    categoriesData: PartsCategoryInterface[],
  ) => Promise<void>;
}

export const useSearchModalStore = create<SearchModalStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isSearching: false,
      isEB: false,
      ebMode: "add",
      fromRoute: "search-by-car",
      isOgSearchModalOpen: false,
      ogSearchModalContent: "car",
      isOgSearch: false, // by default it is not og search
      isCarVerified: false,
      searchMode: "vehicle",
      vinValidation: {
        isValid: false,
        error: "",
      },
      currentStep: 1,
      searchData: {
        make: null,
        model: null,
        year: null,
        type: null,
        cc: "",
        fuel: "",
        hp: "",
        body: "",
        doors: "",
        variant: "",
        oeReference: undefined,
      },
      searchValue: "",
      searchResults: [],
      previousSearches: [],
      carByVinResults: [],
      // Dropdown arrays state
      engineSize: [],
      fuel: [],
      powerHp: [],
      body: [],
      doors: [],
      seats: [],
      variant: [],
      setIsSearching: (isSearching: boolean) => set({ isSearching }),
      setFromRoute: (fromRoute: "garage-bay" | "search-by-car" | "saved-cars" | "og-search") =>
        set({ fromRoute }),
      openModal: () => {
        set({ isOpen: true });
        get().fetchSearchResults();
      },
      openOgSearchModal: () => set({ isOgSearchModalOpen: true }),
      setSearchData: (data: SearchData) => {
        set({ searchData: data });
      },
      setVinValidation: (vinValidation: VinValidationResult) => set({ vinValidation }),
      // Dropdown setters
      setEngineSize: (engineSize: string[]) => set({ engineSize }),
      setFuel: (fuel: string[]) => set({ fuel }),
      setPowerHp: (powerHp: string[]) => set({ powerHp }),
      setBody: (body: string[]) => set({ body }),
      setDoors: (doors: string[]) => set({ doors }),
      setSeats: (seats: string[]) => set({ seats }),
      setVariant: (variant: string[]) => set({ variant }),
      fetchEngineTrimData: async (mmtId: string) => {
        try {
          const { getCarEngineNTrimByMMTId } = await import("@/services/products");
          const EngineTrimData = await getCarEngineNTrimByMMTId(mmtId);

          set({
            engineSize: EngineTrimData.engineSize || [],
            fuel: EngineTrimData.fuel || [],
            powerHp: EngineTrimData.powerHp || [],
            body: EngineTrimData.body || [],
            doors: EngineTrimData.doors || [],
            seats: EngineTrimData.seats || [],
            variant: EngineTrimData.variant || [],
          });
        } catch (error) {
          console.error("❌ Error fetching engine/trim data:", error);
          // Set default values on error
          set({
            engineSize: [],
            fuel: [],
            powerHp: [],
            body: [],
            doors: [],
            seats: [],
            variant: [],
          });
        }
      },
      getMakeModelTypeId: (mmytData) => {
        const { searchData: fromStoreSearchData, carByVinResults } = get();

        if (carByVinResults?.[0]?.makeModelTypeId) {
          return carByVinResults?.[0]?.makeModelTypeId;
        }

        let searchData: SearchData | CarByVinResult = fromStoreSearchData;
        if (mmytData) {
          searchData = mmytData;
        }

        const dataAsSearchData = searchData as SearchData;
        const dataAsVinResult = searchData as CarByVinResult;

        if (dataAsSearchData.type?.key) {
          return dataAsSearchData.type.key;
        }

        if (dataAsSearchData.year?.key) {
          return dataAsSearchData.year.key;
        }

        if (dataAsSearchData.model?.key) {
          return dataAsSearchData.model.key;
        }
        if (dataAsSearchData.make?.key) {
          return dataAsSearchData.make?.key;
        }

        if (dataAsVinResult.id) {
          return dataAsVinResult.id;
        } else {
          return carByVinResults[0]?.id || null;
        }
      },
      resetSearch: () => {
        set({
          searchData: {
            make: null,
            model: null,
            year: null,
            type: null,
            cc: "",
            fuel: "",
            hp: "",
            body: "",
            doors: "",
            variant: "",
            oeReference: undefined,
          },
          currentStep: 1,
          searchValue: "",
          carByVinResults: [],
          isCarVerified: false,
          isOgSearch: false,
          isEB: false,
          ebMode: "add",
          fromRoute: "search-by-car",
          searchMode: "vehicle",
          ogSearchModalContent: "car",
          isOgSearchModalOpen: false,
          vinValidation: {
            isValid: false,
            error: "",
          },
          searchResults: [],
        });
        get().setStep(1); // Call the setStep action
      },
      resetOgSearch: () => {
        set({
          searchMode: "vin",
          searchData: {
            make: null,
            model: null,
            year: null,
            type: null,
            cc: "",
            fuel: "",
            hp: "",
            body: "",
            doors: "",
            variant: "",
            oeReference: undefined,
          },
          currentStep: 1,
          searchValue: "",
          carByVinResults: [],
          isCarVerified: false,
          isOgSearch: true,
          isEB: false,
          ebMode: "add",
          fromRoute: "search-by-car",
          vinValidation: {
            isValid: false,
            error: "",
          },
        });
        get().setStep(1); // Call the setStep action
      },
      resetEB: () => {
        set({
          isEB: true,
          ebMode: "add",
          fromRoute: "search-by-car",
          carByVinResults: [],
          searchData: {
            make: null,
            model: null,
            year: null,
            type: null,
            cc: "",
            fuel: "",
            hp: "",
            body: "",
            doors: "",
            variant: "",
            oeReference: undefined,
          },
          currentStep: 1,
          searchValue: "",
          isCarVerified: false,
          isOgSearch: false,
        });
      },
      setOgSearchModalContent: (content: "saved" | "car" | "category" | "oe") =>
        set({ ogSearchModalContent: content }),
      setIsOgSearch: (isOgSearch: boolean) => set({ isOgSearch }),
      setIsCarVerified: (isCarVerified: boolean) => set({ isCarVerified }),
      closeModal: () =>
        set({
          isOpen: false,
          ebMode: "add",
          isEB: false,
        }),
      closeOgSearchModal: () => set({ isOgSearchModalOpen: false, ebMode: "add", isEB: false }),
      setCurrentStep: (step: number) => set({ currentStep: step }),
      setIsEB: (isEB: boolean) => set({ isEB }),
      setEbMode: (ebMode: "add" | "edit") => set({ ebMode }),
      setSearchMode: (mode) => {
        if (get().isEB) {
          if (get().searchMode === "vin") {
            set({ searchMode: "vehicle" });

            get().resetEB();
          } else {
            set({ searchMode: mode });
          }
        } else {
          if (get().searchMode === "vin") {
            set({ searchMode: "vehicle" });
            get().resetSearch();
          } else {
            set({ searchMode: mode });
          }
        }
      },
      setSearchResults: (results: SearchResult[]) => set({ searchResults: results }),
      setCarByVinResults: (results: CarByVinResult[]) => set({ carByVinResults: results }),
      // called for the first time
      fetchSearchResults: async () => {
        const { currentStep, searchResults } = get();

        if (currentStep === 1 && searchResults?.length === 0) {
          const response = await getBrands();
          if (response && response.data.length > 0) {
            let results = response?.data?.map((brand: MakeModelTypeBrandItem) => ({
              key: brand.id,
              value: brand.brand ?? "",
            }));
            set({ searchResults: results });
          } else {
            set({ searchResults: [] });
          }
        }
      },

      // when user try to directly go to any step.
      setStep: async (step: number) => {
        const { searchData } = get();
        set({ searchMode: "vehicle" });
        // set({ currentStep: step });
        const newSearchData = { ...searchData };

        switch (step) {
          case 1:
            set({ searchValue: "" });

            set({ searchResults: [] }); // clear the previous list

            let makes: SearchResult[] = [];
            const brandsResponse = await getBrands();
            if (brandsResponse && brandsResponse.data.length > 0) {
              makes = brandsResponse.data?.map((item: MakeModelTypeBrandItem) => ({
                key: item.id,
                value: item.brand ?? "",
              }));
            } else {
              makes = [];
            }
            set({ searchResults: makes });
            set({ searchData: newSearchData });
            set({ currentStep: step });

            break;

          case 2:
            set({ searchValue: "" });
            if (searchData.make?.value) {
              set({ searchResults: [] }); // clear the previous list

              let models: SearchResult[] = [];
              const modelResponse = await getModels(searchData.make.key);
              if (modelResponse && modelResponse.data.length > 0) {
                models = modelResponse.data?.map((item: MakeModelTypeBrandItem) => ({
                  key: item.id,
                  value: item.model ?? "",
                }));
              } else {
                models = [];
              }
              set({ searchResults: models });
              set({ searchData: newSearchData });
              set({ currentStep: step });
            }
            break;

          case 3:
            set({ searchValue: "" });
            if (searchData.make?.value && searchData.model?.value) {
              set({ searchResults: [] }); // clear the previous list

              let years: SearchResult[] = [];
              const yearResponse = await getYears(searchData.model.key);
              if (yearResponse && yearResponse.data.length > 0) {
                years = yearResponse.data?.map((item: string | number) => ({
                  key: searchData?.model?.key || "", // model id
                  value: String(item), // item is the year value here
                }));
              } else {
                years = [];
              }
              set({ searchResults: years });
              set({ searchData: newSearchData });
              set({ currentStep: step });
            }
            break;

          case 4:
            set({ searchValue: "" });
            if (searchData.make?.value && searchData.model?.value && searchData.year?.value) {
              set({ searchResults: [] }); // clear the previous list

              let types: SearchResult[] = [];
              const typeResponse = await getTypes({
                modelId: searchData.year.key,
                year: searchData.year.value,
              });
              if (typeResponse && typeResponse.data.length > 0) {
                types = typeResponse.data?.map((item: { id: string; type: string }) => ({
                  key: item?.id, // model id
                  value: item?.type, // item is the year value here
                }));
              } else {
                types = [];
              }
              set({ searchResults: types });
              set({ currentStep: step });
            }
            break;
        }
      },

      setSearchValue: async (value) => {
        const { currentStep, searchData, searchMode } = get();
        set({ searchValue: value });

        if (searchMode === "vehicle") {
          // always clear the list first
          set({ searchResults: [] });
          set({ isSearching: true });

          let results: { key: string; value: string }[] = [];

          switch (currentStep) {
            case 1:
              if (value) {
                const response = await debouncedSearch(
                  "brandSearch", // unique key for this search type
                  async () =>
                    searchMakeModelType({
                      payload: {
                        name: value,
                      },
                    }),
                  300,
                );

                set({ isSearching: false });
                if (
                  response &&
                  (response as { data: { id: string; brand: string }[] }).data?.length > 0
                ) {
                  results = (response as { data: { id: string; brand: string }[] }).data.map(
                    (item) => ({
                      key: item.id,
                      value: item.brand, // as in step 1, so we set brand as value
                    }),
                  );
                } else {
                  results = [];
                }
              } else {
                // call the List API
                const response = await debouncedSearch(
                  "brandSearchWhenEmptyValue",
                  async () => getBrands(),
                  800,
                );
                set({ isSearching: false });
                if (
                  response &&
                  (response as { data: { id: string; brand: string }[] }).data?.length > 0
                ) {
                  results = (response as { data: { id: string; brand: string }[] }).data.map(
                    (item) => ({
                      key: item.id,
                      value: item.brand,
                    }),
                  );
                } else {
                  results = [];
                }
              }

              break;

            case 2:
              if (value) {
                const response = (await debouncedSearch(
                  "modelSearch",
                  async () =>
                    searchMakeModelType({
                      payload: {
                        makeModelTypeId: searchData.make?.key,
                        name: value,
                      },
                    }),
                  300,
                )) as { data: { id: string; model: string }[] };

                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: { id: string; model: string }) => ({
                    key: item.id,
                    value: item.model,
                  }));
                } else {
                  results = [];
                }
              } else {
                if (searchData && searchData?.make && searchData?.make?.key !== null) {
                  const response = await debouncedSearch(
                    "modelSearchWhenEmptyValue",
                    async () => getModels(searchData.make!.key),
                    800,
                  );
                  set({ isSearching: false });
                  if (
                    response &&
                    (response as { data: { id: string; model: string }[] }).data?.length > 0
                  ) {
                    results = (response as { data: { id: string; model: string }[] }).data.map(
                      (item) => ({
                        key: item.id,
                        value: item.model,
                      }),
                    );
                  } else {
                    results = [];
                  }
                }
              }
              break;

            case 3:
              if (value && searchData.model?.key) {
                const yearResponse = await getYears(searchData.model.key);

                if (yearResponse && yearResponse.data.length > 0) {
                  results = yearResponse.data
                    .filter((year: string | number) => year.toString().includes(value))
                    ?.map((year: string | number) => ({
                      key: searchData.model?.key || "",
                      value: String(year),
                    }));
                } else {
                  //
                  results = [];
                }
              } else {
                if (searchData && searchData?.model && searchData?.model?.key !== null) {
                  const response = await debouncedSearch(
                    "yearSearchWhenEmptyValue",
                    async () => getYears(searchData.model!.key),
                    800,
                  );
                  set({ isSearching: false });
                  if (response && (response as { data: (string | number)[] }).data?.length > 0) {
                    results = (response as { data: (string | number)[] }).data.map((item) => ({
                      key: searchData.model!.key,
                      value: String(item),
                    }));
                  } else {
                    results = [];
                  }
                }
              }

              break;

            case 4:
              if (value && searchData.year?.key && searchData.year?.value) {
                const response = (await debouncedSearch(
                  "typeSearch",
                  async () =>
                    searchMakeModelType({
                      payload: {
                        makeModelTypeId: searchData.year!.key,
                        year: searchData.year!.value,
                        name: value,
                      },
                    }),
                  300,
                )) as { data: { id: string; type: string }[] };
                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: { id: string; type: string }) => ({
                    key: item.id,
                    value: item.type,
                  }));
                } else {
                  results = [];
                }
              } else {
                if (
                  searchData &&
                  searchData?.year &&
                  searchData?.year?.key !== null &&
                  searchData.year.value !== null
                ) {
                  const response = await debouncedSearch(
                    "modelSearchWhenEmptyValue",
                    async () =>
                      getTypes({
                        modelId: searchData.year?.key!,
                        year: searchData.year?.value!,
                      }),
                    800,
                  );
                  set({ isSearching: false });
                  if (
                    response &&
                    (response as { data: { id: string; type: string }[] }).data?.length > 0
                  ) {
                    results = (response as { data: { id: string; type: string }[] }).data.map(
                      (item) => ({
                        key: item.id,
                        value: item.type,
                      }),
                    );
                  } else {
                    results = [];
                  }
                }
              }
              break;
          }
          set({ searchResults: results });
        } else {
          // Search mode is VIN

          const vinValidation = validateVIN(value);
          set({ vinValidation });
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
          const response = await getCarByVin(value);
          set({ isSearching: false });
          if (response && Object.keys(response.data).length > 0) {
            const data = {
              // ...response.data,
              brand: response.data.brandName,
              model: response.data.modelName,
              yearFrom: response.data.year,
              year: response.data.year,
              // id: response.data.modelName,
              type: response.data.typeName,
              vin: response.data.vin,
              id: response.data.makeModelTypeId,
            };
            set({ carByVinResults: [data] });
          } else {
            set({ carByVinResults: [] });
            return null;
          }
        } catch (error) {
          console.error("🚗 Error in fetchCarByVin:", error);
          set({ isSearching: false });
          set({ carByVinResults: [] });
          return null;
        }
      },

      // when user clicked on Search Item
      updateSearchData: async (data: { key: string; value: string }) => {
        const { currentStep, searchData } = get();
        const newSearchData = { ...searchData };

        switch (currentStep) {
          case 1:
            set({ isSearching: true });

            // Check if the make value is actually changing
            const previousMakeValue = searchData.make?.value;
            const newMakeValue = data.value;
            const isMakeValueChanged = String(previousMakeValue) !== String(newMakeValue);

            newSearchData.make = data;

            // Only clear subsequent values if the make value actually changed
            if (isMakeValueChanged) {
              newSearchData.model = null;
              newSearchData.year = null;
              newSearchData.type = null;
            } else {
            }

            set({ currentStep: 2 });
            set({ searchData: newSearchData });

            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let models: SearchResult[] = [];
            const modelResponse = await getModels(data.key);
            set({ isSearching: false });
            if (modelResponse && modelResponse.data?.length > 0) {
              models = modelResponse.data?.map((item: MakeModelTypeBrandItem) => ({
                key: item.id,
                value: item.model ?? "",
              }));
            } else {
              models = [];
            }

            // populate the list for next step
            set({ searchResults: models });
            break;
          case 2:
            set({ isSearching: true });

            // Check if the model value is actually changing
            const previousModelValue = searchData.model?.value;
            const newModelValue = data.value;
            const isModelValueChanged = String(previousModelValue) !== String(newModelValue);

            newSearchData.model = data;

            // Only clear subsequent values if the model value actually changed
            if (isModelValueChanged) {
              newSearchData.year = null;
              newSearchData.type = null;
            } else {
            }

            set({ currentStep: 3 });
            set({ searchData: newSearchData });

            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let years: SearchResult[] = [];
            const yearResponse = await getYears(data.key);
            set({ isSearching: false });
            if (yearResponse && (yearResponse as { data: (string | number)[] }).data?.length > 0) {
              years = (yearResponse as { data: (string | number)[] }).data?.map((item) => ({
                key: data.key, // model id
                value: String(item), // item is the year value here
              }));
            } else {
              years = [];
            }

            // populate the list for next step
            set({ searchResults: years });

            break;
          case 3:
            set({ isSearching: true });

            // Check if the year value is actually changing
            const previousYearValue = searchData.year?.value;
            const newYearValue = data.value;
            // Convert both to strings for comparison to handle type differences
            const isYearValueChanged = String(previousYearValue) !== String(newYearValue);

            newSearchData.year = data;

            // Only clear subsequent values if the year value actually changed
            if (isYearValueChanged) {
              newSearchData.type = null;
              // Clear engine and trim data when year changes
              newSearchData.cc = "";
              newSearchData.fuel = "";
              newSearchData.hp = "";
              newSearchData.body = "";
              newSearchData.doors = "";
              newSearchData.variant = "";
            } else {
            }

            set({ currentStep: 4 });
            set({ searchData: newSearchData });
            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let types: SearchResult[] = [];
            const typeResponse = await getTypes({
              modelId: data.key,
              year: data.value,
            });
            set({ isSearching: false });
            if (
              typeResponse &&
              (typeResponse as { data: { id: string; type: string }[] }).data?.length > 0
            ) {
              types = (typeResponse as { data: { id: string; type: string }[] }).data?.map(
                (item) => ({
                  key: item?.id, // model id
                  value: item?.type, // item is the year value here
                }),
              );
            } else {
              types = [];
            }

            set({ searchResults: types });

            break;
          case 4:
            // Check if the type value is actually changing
            const previousTypeValue = searchData.type?.value;
            const newTypeValue = data.value;
            const isTypeValueChanged = String(previousTypeValue) !== String(newTypeValue);

            newSearchData.type = data;
            set({ searchData: newSearchData });
            set({ currentStep: 5 });

            break;
        }
      },

      addToPreviousSearches: () => {
        const { searchData, previousSearches, carByVinResults } = get();

        const modifiedFormattedData: PreviousSearchDataInterface = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
          type: searchData.type?.value || carByVinResults[0]?.type || "",
          cc: searchData.cc || "",
          fuel: searchData.fuel || "",
          hp: searchData.hp || "",
          body: searchData.body || "",
          doors: searchData.doors || "",
          variant: searchData.variant || "",
          timeAgo: new Date().toISOString(),
          mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
        };

        if (modifiedFormattedData.year === "" || modifiedFormattedData.type === "") {
          modifiedFormattedData.title = `Car parts for ${searchData.make?.value} ${searchData.model?.value || ""} ${searchData.year?.value || ""} ${searchData.type?.value || ""}`;
        }
        if (modifiedFormattedData.make) {
          set({
            previousSearches: [modifiedFormattedData, ...previousSearches.slice(0, 9)],
          });
          syncPreviousSearchToMmeStore({
            makeModelTypeId: get().getMakeModelTypeId(),
          });
        }
      },
      getCarDataMMYTorVIN: () => {
        const { searchData, carByVinResults } = get();

        const carData = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
          type: searchData.type?.value || carByVinResults[0]?.type || "",

          mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
        };
        return JSON.stringify(carData);
      },
      carHash: "",
      setCarHash: (val: string) => {
        set({ carHash: val });
      },
      prefillFromUrl: async (makeModelTypeId: string, urlYear?: string) => {
        try {
          const { prefillSearchDataFromUrl } = await import("@/utils/prefillSearchDataFromUrl");
          let searchData = await prefillSearchDataFromUrl(makeModelTypeId, urlYear);

          // --- Prefill engine/trim fields from URL if present ---
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const engineFields = ["cc", "hp", "fuel", "body", "doors", "variant"];
            engineFields.forEach((field) => {
              const val = params.get(field);
              if (val) {
                (searchData as unknown as Record<string, string | undefined>)[field] = val;
              }
            });
          }
          // --- End prefill ---

          set({ searchData });
        } catch (error) {
          console.error("Error prefilling search data from URL:", error);
        }
      },
      prefillManufacturerIdsFromUrl: async (manufacturerIds: string) => {
        try {
          const decodedString = decodeURIComponent(manufacturerIds);

          const manufacturerIdsArray = decodedString
            .split(",")
            ?.map((id) => id.trim())
            .filter((id) => id.length > 0);

          // Import getManufacturer to fetch actual manufacturer data
          const { getManufacturer } = await import("@/services/products");

          const manufacturerResponse = await getManufacturer();

          if (manufacturerResponse && manufacturerResponse.data) {
            // Create manufacturer objects with actual names
            const manufacturerObjects: IManufacturer[] = manufacturerIdsArray
              ?.map((id): IManufacturer | null => {
                const manufacturer = manufacturerResponse.data.find(
                  (m: { id: string }) => m.id === id,
                );
                if (manufacturer) {
                  return {
                    id: manufacturer.id,
                    name: manufacturer.name, // Use actual name from API
                    type: "OEM",
                  };
                } else {
                  console.warn("🏭 Manufacturer not found for ID:", id);
                  return null;
                }
              })
              .filter((item): item is IManufacturer => item !== null); // Proper type guard

            // manufacturerIds are URL-driven; do not sync into useFilterStore anymore.
            // Keep this block intentionally commented for migration traceability.
            // const { useFilterStore } = await import("@/stores/useFilter");
            // useFilterStore
            //   .getState()
            //   .setManufacturerIds(manufacturerObjects.length > 0 ? manufacturerObjects : null);
          } else {
            console.error("🏭 Failed to fetch manufacturer data");
          }
        } catch (error) {
          console.error("Error prefilling manufacturer IDs from URL:", error);
        }
      },
      prefillCategoriesFromUrl: async (
        categoryIds: string,
        categoriesData: PartsCategoryInterface[],
      ) => {
        try {
          const decodedString = decodeURIComponent(categoryIds);

          const categoryIdsArray = decodedString
            .split(",")
            ?.map((id) => id.trim())
            .filter((id) => id.length > 0);

          let selectedCategoriesObjects: PartsCategoryInterface[] = [];
          const flattenCategoriesData = flattenTree(categoriesData) as PartsCategoryInterface[];
          selectedCategoriesObjects = flattenCategoriesData.filter((catNode) => {
            if (categoryIdsArray.includes(catNode.id)) {
              return catNode;
            }
          });
          const categoryStore = getCategorySearchStore().getState();
          const currentStoreIds = categoryStore.SelectedCategoriesId ?? [];
          const incomingSet = new Set(categoryIdsArray);
          const currentSet = new Set(currentStoreIds);
          const alreadySynced =
            incomingSet.size === currentSet.size &&
            categoryIdsArray.every((id) => currentSet.has(id));
          if (alreadySynced) {
            return;
          }
          const { setSelectedCategories } = categoryStore;
          setSelectedCategories(selectedCategoriesObjects);

          // call the Utility method with categoryIdsArray
        } catch (error) {
          throw error;
        }
      },
      addOERefToPreviousSearches: (data: { OERef: string; parts: unknown }) => {
        const { searchData, previousSearches, carByVinResults } = get();
        const modifiedFormattedData: PreviousSearchDataInterface = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
          type: searchData.type?.value || carByVinResults[0]?.type || "",
          timeAgo: new Date().toISOString(),
          OERef: data.OERef,
          title: `OE Ref: ${data.OERef}`,
          parts: data.parts,
          mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
        };
        if (data.OERef) {
          set({
            previousSearches: [modifiedFormattedData, ...previousSearches.slice(0, 9)],
          });
          syncPreviousSearchToMmeStore({ oeReference: data.OERef });
        }
      },
      addToPreviousSearchesFromAdvSearchStore: (
        data: PartsCategoryInterface[] | [],
        title?: string,
      ) => {
        const { searchData, previousSearches, carByVinResults } = get();
        const finalArray: PreviousSearchDataInterface[] = [];
        const advSrchStore = getAdvancedSearchStore().getState();

        let r = groupBy(data, "parentId");

        if (r.hasOwnProperty("root") && Object.keys(r).length > 1) {
          delete r.root;
        }

        if (Object.keys(r).length > 1) {
          const modifiedFormattedData: PreviousSearchDataInterface = {
            make: searchData.make?.value || carByVinResults[0]?.brand || "",
            model: searchData.model?.value || carByVinResults[0]?.model || "",
            year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
            type: searchData.type?.value || carByVinResults[0]?.type || "",
            timeAgo: new Date().toISOString(),
            parts: advSrchStore.L1Categories.find(
              (itm) => itm.id === data[0]?.parentId.slice(0, 3),
            ),
            title: title ?? null,
            mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
          };
          finalArray.push(modifiedFormattedData);
        } else {
          if (Object.keys(r)?.length === 0) {
            const modifiedFormattedData: PreviousSearchDataInterface = {
              make: searchData.make?.value || carByVinResults[0]?.brand || "",
              model: searchData.model?.value || carByVinResults[0]?.model || "",
              year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
              type: searchData.type?.value || carByVinResults[0]?.type || "",
              timeAgo: new Date().toISOString(),
              parts: [],
              title: "Car parts for",
              mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
            };
            finalArray.push(modifiedFormattedData);
            set({
              previousSearches: [...finalArray, ...previousSearches.slice(0, 9)],
            });
            syncAdvSearchEntriesToMme(finalArray, () => get().getMakeModelTypeId());
            return;
          }

          Object.keys(r).forEach((parentId, indx) => {
            const l1Matched = advSrchStore.L1Categories.find((itm) => itm.id === parentId);
            const l2Matched = advSrchStore.L2Categories.find((itm) => itm.id === parentId);
            const l3Matched = advSrchStore.L3Categories.find((itm) => itm.id === parentId);
            const parentCategory = l1Matched || l2Matched || l3Matched;

            if (r[parentId].length > 1) {
              const modifiedFormattedData: PreviousSearchDataInterface = {
                make: searchData.make?.value || carByVinResults[0]?.brand || "",
                model: searchData.model?.value || carByVinResults[0]?.model || "",
                year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
                type: searchData.type?.value || carByVinResults[0]?.type || "",
                timeAgo: new Date().toISOString(),
                parts: parentCategory,
                title: title ?? null,
                mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
              };
              finalArray.push(modifiedFormattedData);
            } else if (r[parentId].length === 1) {
              const modifiedFormattedData: PreviousSearchDataInterface = {
                make: searchData.make?.value || carByVinResults[0]?.brand || "",
                model: searchData.model?.value || carByVinResults[0]?.model || "",
                year: String(searchData.year?.value || carByVinResults[0]?.yearFrom || ""),
                type: searchData.type?.value || carByVinResults[0]?.type || "",
                timeAgo: new Date().toISOString(),
                parts: r[parentId][0],
                title: title ?? null,
                mmytData: (searchData.make?.value ? searchData : carByVinResults[0]) || searchData,
              };
              finalArray.push(modifiedFormattedData);
            } else {
            }
          });
        }

        set({
          previousSearches: [...finalArray, ...previousSearches.slice(0, 9)],
        });
        syncAdvSearchEntriesToMme(finalArray, () => get().getMakeModelTypeId());
      },
    }),
    {
      name: "search-modal-storage",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
