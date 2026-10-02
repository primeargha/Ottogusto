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
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import type { MakeModelTypeBrandItem } from "@/type";
import { PartsCategoryInterface, useAdvancedSearchStore } from "./useAdvancedSearchStore";
import type { IManufacturer } from "./useFilter";
import { useCategorySearchStore } from "./useCategorySearchStore";

type SearchMode = "vehicle" | "vin";

interface SearchData {
  id?: string; // for edit mode
  // Existing fields (SAME AS ORIGINAL)
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;

  // NEW FIELDS for Step 5 - Engine (simplified strings for now)
  cc: string;
  fuel: string;
  hp: string;

  // NEW FIELDS for Step 6 - Trim (simplified strings for now)
  body: string; // renamed from body to frame
  doors: string;
  variant: string;
}

export interface PreviousSearchDataInterface {
  make: string;
  model: string;
  year: string;
  type: string;
  timeAgo: string;
  OERef?: string | null;
  parts?: object | null;
  title?: string | null;
  subtitle?: string | null;
  mmytData: any;
  cc: string;
  fuel: string;
  hp: string;
  body: string;
  doors: string;
  variant: string;
}

interface SearchResult {
  key: string;
  value: string;
}

interface NewSearchModalStore {
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
  searchData: SearchData; // stored as previousSearch and will be passed to search query
  searchValue: string; // search value
  searchResults: SearchResult[]; // search result based on value
  previousSearches: PreviousSearchDataInterface[]; // previous searches
  carByVinResults: any[]; // car by vin results
  vinValidation: VinValidationResult;

  // Dropdown arrays state
  engineSize: any[];
  fuel: any[];
  powerHp: any[];
  body: any[];
  doors: any[];
  seats: any[];
  variant: any[];

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
  fetchCarByVin: (value: string) => Promise<any | null>;
  setIsSearching: (isSearching: boolean) => void;
  setIsOgSearch: (isOgSearch: boolean) => void;
  setIsCarVerified: (isCarVerified: boolean) => void;
  setSearchMode: (mode: SearchMode) => void;
  setSearchValue: (value: string, currentStep: number) => void;
  updateSearchData: (data: { key: string; value: string } | any, currentStep: number) => void;
  getMakeModelTypeId: (mmytData?: object) => string;
  addToPreviousSearches: () => void;
  addOERefToPreviousSearches: (data: any) => void;
  addToPreviousSearchesFromAdvSearchStore: (
    data: PartsCategoryInterface[] | [],
    title?: string,
  ) => void;
  setSearchResults: (results: SearchResult[]) => void;
  fetchSearchResults: (currentStep: number) => void;
  handleStepChange: (step: number) => Promise<void>; // New function to handle step changes
  setCarByVinResults: (results: any[]) => void;
  setVinValidation: (vinValidation: VinValidationResult) => void;

  // Dropdown setters
  setEngineSize: (engineSize: any[]) => void;
  setFuel: (fuel: any[]) => void;
  setPowerHp: (powerHp: any[]) => void;
  setBody: (body: any[]) => void;
  setDoors: (doors: any[]) => void;
  setSeats: (seats: any[]) => void;
  setVariant: (variant: any[]) => void;
  fetchEngineTrimData: (mmtId: string) => Promise<void>;

  getCarDataMMYTorVIN: () => any;
  carHash: string;
  setCarHash: (val: string) => void;
  prefillFromUrl: (makeModelTypeId: string, urlYear?: string) => Promise<void>;
  prefillManufacturerIdsFromUrl: (manufacturerIds: string) => Promise<void>;
  prefillCategoriesFromUrl: (categoryIds: string, categoriesData: any) => Promise<void>;
  savedCar: object | null;
  setSavedCar: (car: object | null) => void;
  resetSavedCar: () => void;
}

export const useNewSearchModalStore = create<NewSearchModalStore>()(
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
        // Note: fetchSearchResults now requires currentStep parameter from URL
      },
      openOgSearchModal: () => set({ isOgSearchModalOpen: true }),
      setSearchData: (data: SearchData) => {
        set({ searchData: data });
        // Keep old search store in sync
        useSearchModalStore.getState().setSearchData({
          make: data.make,
          model: data.model,
          year: data.year,
          type: data.type,
          cc: data.cc,
          fuel: data.fuel,
          hp: data.hp,
          body: data.body,
          doors: data.doors,
          variant: data.variant,
        });
      },
      setVinValidation: (vinValidation: VinValidationResult) => set({ vinValidation }),
      // Dropdown setters
      setEngineSize: (engineSize: any[]) => set({ engineSize }),
      setFuel: (fuel: any[]) => set({ fuel }),
      setPowerHp: (powerHp: any[]) => set({ powerHp }),
      setBody: (body: any[]) => set({ body }),
      setDoors: (doors: any[]) => set({ doors }),
      setSeats: (seats: any[]) => set({ seats }),
      setVariant: (variant: any[]) => set({ variant }),
      fetchEngineTrimData: async (mmtId: string) => {
        try {
          const { getCarEngineNTrimByMMTId } = await import("@/services/products");
          const EngineTrimData = await getCarEngineNTrimByMMTId(mmtId as any);

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
      savedCar: null,
      setSavedCar: (car: object | null) => set({ savedCar: car }),
      resetSavedCar: () => set({ savedCar: null }),
      getMakeModelTypeId: (mmytData) => {
        const { searchData: fromStoreSearchData, carByVinResults } = get();

        if (carByVinResults?.[0]?.makeModelTypeId) {
          return carByVinResults?.[0]?.makeModelTypeId;
        }

        let searchData: any = fromStoreSearchData;
        if (mmytData) {
          searchData = mmytData;
        }

        if (searchData.type?.key) {
          return searchData.type.key;
        }

        if (searchData.year?.key) {
          return searchData.year.key;
        }

        if (searchData.model?.key) {
          return searchData.model.key;
        }
        if (searchData.make?.key) {
          return searchData.make.key;
        }

        if (searchData?.id) {
          return searchData?.id;
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
          },
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
        // Keep old search store in sync
        useSearchModalStore.getState().resetSearch();
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
          },
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
          },
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
      setCarByVinResults: (results: any[]) => set({ carByVinResults: results }),

      // Modified to accept currentStep parameter from URL
      fetchSearchResults: async (currentStep: number) => {
        const { searchResults } = get();

        if (currentStep === 1 && searchResults?.length === 0) {
          // only for step 1 set all list directly(no dependency)
          const response = await getBrands();
          // debugger;
          if (response && response.data.length > 0) {
            let results = response?.data?.map((brand: any) => ({
              key: brand.id,
              value: brand.brand,
            }));
            set({ searchResults: results });
          } else {
            set({ searchResults: [] });
          }
        }
      },

      // New function to step changes (replaces setStep from original store)
      handleStepChange: async (step: number) => {
        const { searchData } = get();
        set({ searchMode: "vehicle" });
        const newSearchData = { ...searchData };

        // Check if engine_trim feature flag is enabled
        const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");

        switch (step) {
          case 1:
            set({ searchValue: "" });
            set({ searchResults: [] }); // clear the previous list

            // Fetch makes data
            let makes: SearchResult[] = [];
            const brandsResponse = await getBrands();
            const brandsListData = brandsResponse?.data;

            if (brandsListData && brandsListData.length > 0) {
              makes = brandsListData?.map((item: MakeModelTypeBrandItem) => {
                return {
                  key: item.id,
                  value: item.brand ?? "",
                };
              });
            } else {
              makes = [];
            }
            set({ searchResults: makes });
            set({ searchData: newSearchData });
            break;

          case 2:
            set({ searchValue: "" });
            if (searchData.make?.value) {
              set({ searchResults: [] }); // clear the previous list

              // Fetch models data
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
            }
            break;

          case 3:
            set({ searchValue: "" });
            if (searchData.make?.value && searchData.model?.value) {
              set({ searchResults: [] }); // clear the previous list

              // Fetch years data
              let years: SearchResult[] | any = [];
              const yearResponse = await getYears(searchData.model.key);
              if (yearResponse && yearResponse.data.length > 0) {
                years = yearResponse.data?.map((item: any) => ({
                  key: searchData?.model?.key, // model id
                  value: item, // item is the year value here
                }));
              } else {
                years = [];
              }
              set({ searchResults: years });
              set({ searchData: newSearchData });
            }
            break;

          case 4:
            set({ searchValue: "" });
            if (searchData.make?.value && searchData.model?.value && searchData.year?.value) {
              set({ searchResults: [] }); // clear the previous list

              // Fetch types data
              let types: SearchResult[] = [];
              const typeResponse = await getTypes({
                modelId: searchData.year.key,
                year: searchData.year.value,
              });
              if (typeResponse && typeResponse.data.length > 0) {
                types = typeResponse.data?.map((item: any) => ({
                  key: item?.id, // model id
                  value: item?.type, // item is the year value here
                }));
              } else {
                types = [];
              }
              set({ searchResults: types });

              // If engine_trim feature flag is disabled, skip fetching engine/trim data
              if (!isEngineTrimEnabled) {
              }
            }
            break;

          case 5:
            // Engine step - only execute if feature flag is enabled
            if (isEngineTrimEnabled) {
              set({ searchValue: "" });
              set({ searchResults: [] });
            } else {
            }
            break;

          case 6:
            // Trim step - only execute if feature flag is enabled
            if (isEngineTrimEnabled) {
              set({ searchValue: "" });
              set({ searchResults: [] });
            } else {
            }
            break;

          case 7:
            // Confirmation step - no API calls needed
            set({ searchValue: "" });
            set({ searchResults: [] });
            break;
        }
      },

      // when user type in the search input
      setSearchValue: async (value, currentStep: number) => {
        const { searchData, searchMode } = get();
        set({ searchValue: value });

        // Check if engine_trim feature flag is enabled
        const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");

        if (searchMode === "vehicle") {
          // always clear the list first
          set({ searchResults: [] });
          set({ isSearching: true });

          // this will store the search result
          let results: { key: string; value: string }[] = [];

          // depending on the step, get the result from different API later
          switch (currentStep) {
            case 1:
              // to case if no value and if value
              if (value) {
                const response = (await debouncedSearch(
                  "brandSearch", // unique key for this search type
                  async () =>
                    searchMakeModelType({
                      payload: {
                        name: value,
                      },
                    }),
                  300,
                )) as any;

                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: any) => ({
                    key: item.id,
                    value: item.brand, // as in step 1, so we set brand as value
                  }));
                } else {
                  results = [];
                }
              } else {
                // call the List API
                const response = (await debouncedSearch(
                  "brandSearchWhenEmptyValue",
                  async () => getBrands(),
                  800,
                )) as any;
                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: any) => ({
                    key: item.id,
                    value: item.brand,
                  }));
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
                )) as any;

                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: any) => ({
                    key: item.id,
                    value: item.model,
                  }));
                } else {
                  results = [];
                }
              } else {
                if (searchData && searchData?.make && searchData?.make?.key !== null) {
                  const response = (await debouncedSearch(
                    "modelSearchWhenEmptyValue",
                    // @ts-ignore
                    async () => getModels(searchData.make.key),
                    800,
                  )) as any;
                  set({ isSearching: false });
                  if (response && response.data.length > 0) {
                    results = response.data?.map((item: any) => ({
                      key: item.id,
                      value: item.model,
                    }));
                  } else {
                    results = [];
                  }
                }
              }
              break;

            case 3:
              if (value && searchData.model?.key) {
                const yearResponse: any = await getYears(searchData.model.key);

                if (yearResponse && yearResponse.data.length > 0) {
                  results = yearResponse.data
                    .filter((year: string) => year.toString().includes(value.toString()))
                    .map((year: string) => ({
                      key: searchData.model?.key,
                      value: year,
                    }));
                } else {
                  results = [];
                }
              } else {
                if (searchData && searchData?.model && searchData?.model?.key !== null) {
                  const response = (await debouncedSearch(
                    "yearSearchWhenEmptyValue",
                    // @ts-ignore
                    async () => getYears(searchData.model.key),
                    800,
                  )) as any;
                  set({ isSearching: false });
                  if (response && response.data.length > 0) {
                    results = response.data?.map((item: any) => ({
                      // @ts-ignore
                      key: searchData.model.key,
                      value: item,
                    }));
                  } else {
                    results = [];
                  }
                }
              }

              break;

            case 4:
              if (value) {
                const response = (await debouncedSearch(
                  "typeSearch",
                  async () =>
                    searchMakeModelType({
                      payload: {
                        makeModelTypeId: searchData.year?.key,
                        year: searchData.year?.value,
                        name: value,
                      },
                    }),
                  300,
                )) as any;
                set({ isSearching: false });
                if (response && response.data.length > 0) {
                  results = response.data?.map((item: any) => ({
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
                  const response = (await debouncedSearch(
                    "modelSearchWhenEmptyValue",
                    async () =>
                      getTypes({
                        modelId: searchData.year?.key ?? "",
                        year: searchData.year?.value,
                      }),
                    800,
                  )) as any;
                  set({ isSearching: false });
                  if (response && response.data.length > 0) {
                    results = response.data?.map((item: any) => ({
                      key: item.id,
                      value: item.type,
                    }));
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
            // 5YJSA7E13GF162880
            set({ carByVinResults: [data] });
            return data;
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
      updateSearchData: async (data: { key: string; value: string } | any, currentStep: number) => {
        const { searchData } = get();
        const newSearchData = { ...searchData };

        // Check if engine_trim feature flag is enabled
        const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");

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
              // Clear engine and trim data when make changes
              newSearchData.cc = "";
              newSearchData.fuel = "";
              newSearchData.hp = "";
              newSearchData.body = "";
              newSearchData.doors = "";
              newSearchData.variant = "";
            } else {
            }

            set({ searchData: newSearchData });
            // Keep old search store in sync
            useSearchModalStore.getState().setSearchData({
              make: newSearchData.make,
              model: newSearchData.model,
              year: newSearchData.year,
              type: newSearchData.type,
              cc: newSearchData.cc,
              fuel: newSearchData.fuel,
              hp: newSearchData.hp,
              body: newSearchData.body,
              doors: newSearchData.doors,
              variant: newSearchData.variant,
            });

            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let models: SearchResult[] = [];
            const modelResponse = await getModels(data.key);
            set({ isSearching: false });
            if (modelResponse && modelResponse.data.length > 0) {
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
              // Clear engine and trim data when model changes
              newSearchData.cc = "";
              newSearchData.fuel = "";
              newSearchData.hp = "";
              newSearchData.body = "";
              newSearchData.doors = "";
              newSearchData.variant = "";
            } else {
            }

            set({ searchData: newSearchData });
            // Keep old search store in sync
            useSearchModalStore.getState().setSearchData({
              make: newSearchData.make,
              model: newSearchData.model,
              year: newSearchData.year,
              type: newSearchData.type,
              cc: newSearchData.cc,
              fuel: newSearchData.fuel,
              hp: newSearchData.hp,
              body: newSearchData.body,
              doors: newSearchData.doors,
              variant: newSearchData.variant,
            });

            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let years: SearchResult[] = [];
            const yearResponse = await getYears(data.key);
            set({ isSearching: false });
            if (yearResponse && yearResponse.data.length > 0) {
              years = yearResponse.data?.map((item: any) => ({
                key: data.key, // model id
                value: item, // item is the year value here
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

            set({ searchData: newSearchData });
            // Keep old search store in sync
            useSearchModalStore.getState().setSearchData({
              make: newSearchData.make,
              model: newSearchData.model,
              year: newSearchData.year,
              type: newSearchData.type,
              cc: newSearchData.cc,
              fuel: newSearchData.fuel,
              hp: newSearchData.hp,
              body: newSearchData.body,
              doors: newSearchData.doors,
              variant: newSearchData.variant,
            });
            // clear the list for next step
            set({ searchResults: [] });

            // with this make data call the Model api
            let types: SearchResult[] = [];
            const typeResponse = await getTypes({
              modelId: data.key,
              year: data.value,
            });
            set({ isSearching: false });
            if (typeResponse && typeResponse.data.length > 0) {
              types = typeResponse.data?.map((item: any) => ({
                key: item?.id, // model id
                value: item?.type, // item is the year value here
              }));
            } else {
              types = [];
            }

            // populate the list for next step
            set({ searchResults: types });

            break;

          case 4:
            // Check if the type value is actually changing
            const previousTypeValue = searchData.type?.value;
            const newTypeValue = data.value;
            const isTypeValueChanged = String(previousTypeValue) !== String(newTypeValue);

            newSearchData.type = data;

            // Only clear engine and trim data if the type value actually changed
            if (isTypeValueChanged) {
              // Clear engine and trim data when type changes
              newSearchData.cc = "";
              newSearchData.fuel = "";
              newSearchData.hp = "";
              newSearchData.body = "";
              newSearchData.doors = "";
              newSearchData.variant = "";
            } else {
            }

            set({ searchData: newSearchData });
            // Keep old search store in sync
            useSearchModalStore.getState().setSearchData({
              make: newSearchData.make,
              model: newSearchData.model,
              year: newSearchData.year,
              type: newSearchData.type,
              cc: newSearchData.cc,
              fuel: newSearchData.fuel,
              hp: newSearchData.hp,
              body: newSearchData.body,
              doors: newSearchData.doors,
              variant: newSearchData.variant,
            });

            // Fetch engine/trim data for the selected type only if feature flag is enabled
            if (isEngineTrimEnabled) {
              try {
                await get().fetchEngineTrimData(data.key);
              } catch (error) {
                console.error("❌ Error fetching engine/trim data:", error);
              }
            } else {
            }

            // Add a small delay to ensure state is updated
            setTimeout(() => {}, 100);

            // show is this your car? Please confirm
            break;

          case 5:
            // Only execute if engine_trim feature flag is enabled
            if (isEngineTrimEnabled) {
              // Handle engine data (cc, fuel, hp)
              if (data.cc) newSearchData.cc = data.cc;
              if (data.fuel) newSearchData.fuel = data.fuel;
              if (data.hp) newSearchData.hp = data.hp;
              set({ searchData: newSearchData });
              // Keep old search store in sync
              useSearchModalStore.getState().setSearchData({
                make: newSearchData.make,
                model: newSearchData.model,
                year: newSearchData.year,
                type: newSearchData.type,
                cc: newSearchData.cc,
                fuel: newSearchData.fuel,
                hp: newSearchData.hp,
                body: newSearchData.body,
                doors: newSearchData.doors,
                variant: newSearchData.variant,
              });
            } else {
            }
            break;

          case 6:
            // Only execute if engine_trim feature flag is enabled
            if (isEngineTrimEnabled) {
              // Handle trim data (body, doors, variant)
              if (data.body) newSearchData.body = data.body;
              if (data.doors) newSearchData.doors = data.doors;
              if (data.variant) newSearchData.variant = data.variant;
              set({ searchData: newSearchData });
              // Keep old search store in sync
              useSearchModalStore.getState().setSearchData({
                make: newSearchData.make,
                model: newSearchData.model,
                year: newSearchData.year,
                type: newSearchData.type,
                cc: newSearchData.cc,
                fuel: newSearchData.fuel,
                hp: newSearchData.hp,
                body: newSearchData.body,
                doors: newSearchData.doors,
                variant: newSearchData.variant,
              });
            } else {
            }
            break;
        }
      },

      addToPreviousSearches: () => {
        const { searchData, previousSearches, carByVinResults } = get();

        const modifiedFormattedData: PreviousSearchDataInterface = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
          type: searchData.type?.value || carByVinResults[0]?.type || "",
          cc: searchData.cc || "",
          fuel: searchData.fuel || "",
          hp: searchData.hp || "",
          body: searchData.body || "",
          doors: searchData.doors || "",
          variant: searchData.variant || "",
          timeAgo: new Date().toISOString(),
          mmytData: searchData.make?.value ? searchData : carByVinResults[0],
        } as any;

        if (modifiedFormattedData.year === "" || modifiedFormattedData.type === "") {
          modifiedFormattedData.title = `Car parts for ${searchData.make?.value} ${searchData.model?.value || ""} ${searchData.year?.value || ""} ${searchData.type?.value || ""}`;
        }
        if (modifiedFormattedData.make) {
          modifiedFormattedData.title = `Car parts for ${searchData.make?.value} ${searchData.model?.value || ""} ${searchData.year?.value || ""} ${searchData.type?.value || ""}`;
          set({
            previousSearches: [modifiedFormattedData, ...previousSearches.slice(0, 9)],
          });
        }
      },
      getCarDataMMYTorVIN: () => {
        const { searchData, carByVinResults } = get();
        // const carData: PreviousSearchDataInterface = {
        const carData = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
          type: searchData.type?.value || carByVinResults[0]?.type || "",
          // timeAgo: new Date().toISOString(),
          mmytData: searchData.make?.value ? searchData : carByVinResults[0],
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

          const searchData = await prefillSearchDataFromUrl(makeModelTypeId, urlYear);

          // Extend the search data with new fields
          const extendedSearchData = {
            ...searchData,
            cc: "",
            fuel: "",
            hp: "",
            body: "",
            doors: "",
            variant: "",
          };

          set({ searchData: extendedSearchData });
        } catch (error) {
          console.error("Error prefilling search data from URL:", error);
        }
      },
      prefillManufacturerIdsFromUrl: async (manufacturerIds: string) => {
        try {
          // First decode the URL-encoded string, then split by comma
          const decodedString = decodeURIComponent(manufacturerIds);

          const manufacturerIdsArray = decodedString
            .split(",")
            ?.map((id) => id.trim())
            .filter((id) => id.length > 0);

          // Import getManufacturer to fetch actual manufacturer data
          const { getManufacturer } = await import("@/services/products");

          // Fetch manufacturer data to get actual names

          const manufacturerResponse = await getManufacturer();

          if (manufacturerResponse && manufacturerResponse.data) {
            // Create manufacturer objects with actual names
            const manufacturerObjects: IManufacturer[] = manufacturerIdsArray
              ?.map((id): IManufacturer | null => {
                const manufacturer = manufacturerResponse.data.find((m: any) => m.id === id);
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
      prefillCategoriesFromUrl: async (categoryIds: string, categoriesData: any) => {
        try {
          // First decode the URL-encoded string, then split by comma
          const decodedString = decodeURIComponent(categoryIds);

          const categoryIdsArray = decodedString
            .split(",")
            ?.map((id) => id.trim())
            .filter((id) => id.length > 0);

          // const nestedCategories = await getCategoryByIdNested();
          // const {data } = await useFetchCategoriesNested();

          let selectedCategoriesObjects: any = [];
          const flattenCategoriesData = flattenTree(categoriesData);
          selectedCategoriesObjects = flattenCategoriesData.filter((catNode) => {
            if (categoryIdsArray.includes(catNode.id)) {
              return catNode;
            }
            // debugger;
          });

          const { setSelectedCategories } = useCategorySearchStore.getState();
          setSelectedCategories(selectedCategoriesObjects);

          // debugger;

          // call the Utility method with categoryIdsArray
        } catch (error) {
          throw error;
        }
        // debugger;
        // const searchData = await prefillSearchDataFromUrl(makeModelTypeId, urlYear);
      },
      addOERefToPreviousSearches: (data: any) => {
        const { searchData, previousSearches, carByVinResults } = get();
        const modifiedFormattedData: PreviousSearchDataInterface = {
          make: searchData.make?.value || carByVinResults[0]?.brand || "",
          model: searchData.model?.value || carByVinResults[0]?.model || "",
          year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
          type: searchData.type?.value || carByVinResults[0]?.type || "",
          cc: searchData.cc || "",
          fuel: searchData.fuel || "",
          hp: searchData.hp || "",
          body: searchData.body || "",
          doors: searchData.doors || "",
          variant: searchData.variant || "",
          timeAgo: new Date().toISOString(),
          OERef: data.OERef,
          title: `OE Ref: ${data.OERef}`,
          parts: data.parts,
          mmytData: searchData.make?.value ? searchData : carByVinResults[0],
        };
        if (data.OERef) {
          set({
            previousSearches: [modifiedFormattedData, ...previousSearches.slice(0, 9)],
          });
        }
      },
      addToPreviousSearchesFromAdvSearchStore: (
        data: PartsCategoryInterface[] | [],
        title?: string,
      ) => {
        const { searchData, previousSearches, carByVinResults } = get();
        const finalArray: PreviousSearchDataInterface[] = [];
        const advSrchStore = useAdvancedSearchStore.getState();

        let r = groupBy(data, "parentId");
        // Remove L1 if any other Categories Selected
        if (r.hasOwnProperty("root") && Object.keys(r).length > 1) {
          delete r.root;
        }

        // if multiple L2 then select L1
        if (Object.keys(r).length > 1) {
          const firstSelectedCategory = data[0];
          const l1IdPrefix = firstSelectedCategory?.parentId?.slice(0, 3);
          const modifiedFormattedData: PreviousSearchDataInterface = {
            make: searchData.make?.value || carByVinResults[0]?.brand || "",
            model: searchData.model?.value || carByVinResults[0]?.model || "",
            year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
            type: searchData.type?.value || carByVinResults[0]?.type || "",
            cc: searchData.cc || "",
            fuel: searchData.fuel || "",
            hp: searchData.hp || "",
            body: searchData.body || "",
            doors: searchData.doors || "",
            variant: searchData.variant || "",
            timeAgo: new Date().toISOString(),
            parts: l1IdPrefix
              ? (advSrchStore.L1Categories.find((itm) => itm.id === l1IdPrefix) ?? null)
              : null,
            title: title ?? null,
            mmytData: searchData.make?.value ? searchData : (carByVinResults[0] ?? searchData),
          };
          finalArray.push(modifiedFormattedData);
        } else {
          if (Object.keys(r)?.length === 0) {
            const modifiedFormattedData: PreviousSearchDataInterface = {
              make: searchData.make?.value || carByVinResults[0]?.brand || "",
              model: searchData.model?.value || carByVinResults[0]?.model || "",
              year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
              type: searchData.type?.value || carByVinResults[0]?.type || "",
              cc: searchData.cc || "",
              fuel: searchData.fuel || "",
              hp: searchData.hp || "",
              body: searchData.body || "",
              doors: searchData.doors || "",
              variant: searchData.variant || "",
              timeAgo: new Date().toISOString(),
              parts: [],
              title: "Car parts for",
              mmytData: searchData.make?.value ? searchData : carByVinResults[0],
            };
            finalArray.push(modifiedFormattedData);
            set({
              previousSearches: [...finalArray, ...previousSearches.slice(0, 9)],
            });
            return;
          }

          Object.keys(r).forEach((parentId, indx) => {
            const l1Matched = advSrchStore.L1Categories.find((itm) => itm.id === parentId);
            const l2Matched = advSrchStore.L2Categories.find((itm) => itm.id === parentId);
            const l3Matched = advSrchStore.L3Categories.find((itm) => itm.id === parentId);
            const parentCategory = l1Matched || l2Matched || l3Matched;

            // If there is more than one L3 selected - Show L2
            if (r[parentId].length > 1) {
              const modifiedFormattedData: PreviousSearchDataInterface | any = {
                make: searchData.make?.value || carByVinResults[0]?.brand || "",
                model: searchData.model?.value || carByVinResults[0]?.model || "",
                year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
                type: searchData.type?.value || carByVinResults[0]?.type || "",
                cc: searchData.cc || "",
                fuel: searchData.fuel || "",
                hp: searchData.hp || "",
                body: searchData.body || "",
                doors: searchData.doors || "",
                variant: searchData.variant || "",
                timeAgo: new Date().toISOString(),
                parts: parentCategory,
                title: title,
                mmytData: searchData.make?.value ? searchData : carByVinResults[0],
              };
              finalArray.push(modifiedFormattedData);
            } else if (r[parentId].length === 1) {
              // For Single Item L3 Category
              const modifiedFormattedData: PreviousSearchDataInterface | any = {
                make: searchData.make?.value || carByVinResults[0]?.brand || "",
                model: searchData.model?.value || carByVinResults[0]?.model || "",
                year: searchData.year?.value || carByVinResults[0]?.yearFrom || "",
                type: searchData.type?.value || carByVinResults[0]?.type || "",
                cc: searchData.cc || "",
                fuel: searchData.fuel || "",
                hp: searchData.hp || "",
                body: searchData.body || "",
                doors: searchData.doors || "",
                variant: searchData.variant || "",
                timeAgo: new Date().toISOString(),
                parts: r[parentId][0],
                title: title,
                mmytData: searchData.make?.value ? searchData : carByVinResults[0],
              };
              finalArray.push(modifiedFormattedData);
            } else {
            }
          });
        }

        set({
          previousSearches: [...finalArray, ...previousSearches.slice(0, 9)],
        });
      },
    }),
    {
      name: "new-search-modal-storage",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
