/**
 * Centralized query key factory for TanStack Query.
 * Use these keys in queryOptions(), invalidateQueries(), prefetchQuery(), fetchQuery(), etc.
 * Do not hardcode query key arrays elsewhere.
 */

// TODO: replace with types from api docs — filter/params types when API types exist
type PartsFilters = unknown;
type SearchTypesData = unknown;

export const queryKeys = {
  brands: () => ["brands"] as const,

  translations: (lang: string) => ["translations", lang] as const,

  config: () => ["get-config"] as const,

  profile: {
    formation: () => ["get-profile-formation"] as const,
    userData: () => ["get-user-profile-data"] as const,
  },

  cart: {
    orderById: (orderId: string | null, emailId: string | null, customerId: string | null) =>
      ["get-order-by-id", orderId, emailId, customerId] as const,
  },

  garage: {
    allCars: () => ["get-all-cars"] as const,
    savedCars: (userId?: string | null) => ["get-my-saved-cars", userId ?? "anonymous"] as const,
    savedCarsLanding: () => ["get-my-saved-cars-landing-page"] as const,
    savedCarsProdetails: (authenticated: boolean, partid: string, userId?: string | null) =>
      ["get-my-saved-carsprodetails", authenticated, partid, userId ?? "anonymous"] as const,
    carById: (id: string) => ["get-car-by-id", id] as const,
  },

  search: {
    brands: () => ["brands"] as const,
    models: (brandId: number) => ["models", brandId] as const,
    years: (modelId: number | string) => ["years", modelId] as const,
    types: (data: SearchTypesData) => ["types", data] as const,
  },

  cars: {
    byId: (id: string) => ["cars", "by-id", id] as const,
    /** GET /Cars/{id} batch for SRP compatibility banner dropdown. */
    bannerLabelData: (carIdsKey: string) =>
      ["cars", "banner-label-data", "make-model", carIdsKey] as const,
    /** GET /Cars/part/{partId} — PDP compatible cars (new MME). */
    partCompatible: (partId: string) => ["cars", "part-compatible", partId] as const,
  },

  vin: {
    /** GET /Vin/{vinNumber} — cache key for E2E VIN → cars search. */
    carsByVin: (vinNumber: string) => ["vin", "cars-by-vin", vinNumber] as const,
  },

  categories: {
    byId: (id: string) => ["get-l2-l3-categories", id] as const,
    /** `localeKey` e.g. `nl-BE` — separate cache per language-country; invalidates when locale changes. */
    /** v4: bust RQ-persisted poison trees (L1 ok, all L2 empty) from pre-retry client logic. */
    nested: (localeKey: string) => ["get-l2-l3-categories-nested-v4", localeKey] as const,
    singleById: (id: string) => ["get-l2-l3-single-categories", id] as const,
  },

  manufacturers: {
    list: () => ["manufacturers"] as const,
    bySlug: (slug: string) => ["manufacturer-by-slug", slug] as const,
  },

  products: {
    /** Use for partial match (e.g. removeQueries) to clear all parts queries regardless of filters */
    partsPrefix: () => ["parts"] as const,
    parts: (filters: PartsFilters) => ["parts", filters] as const,
    manufacturer: () => ["Manufacturer"] as const,
  },

  productdetails: {
    instock: (productId: string | number) => ["get-instock-information", productId] as const,
    productFormation: () => ["get-product-formation"] as const,
    manufacturerFormation: () => ["get-manufacturer-formation"] as const,
    matchingCars: (partId: string | null) => ["get-matching-cars-formation", partId] as const,
  },

  orders: {
    all: () => ["get-allorders"] as const,
    allSupport: (isAuthenticated: boolean) => ["get-allorderssupport", isAuthenticated] as const,
    pagination: () => ["orders"] as const,
    returnDetails: (orderId: string, emailId: string) =>
      ["returnDetails", orderId, emailId] as const,
    orderInvoice: (orderId: string) => ["orderInvoice", orderId] as const,
    orderById: (orderId: string, emailId: string, customerId?: string) =>
      ["orderById", orderId, emailId, customerId ?? null] as const,
    orderByIdWithoutEmail: (orderId: string) => ["orderByIdWithoutEmail", orderId] as const,
  },

  policy: {
    fitmentDetails: (store: string, languageCode: string) =>
      [`fitmentDetails_${store}`, languageCode, store] as const,
    returnPolicy: (store: string, languageCode: string) =>
      [`returnPolicy_${store}`, languageCode, store] as const,
    migrationFAQ: (store: string, languageCode: string) =>
      [`migrationFAQ_${store}`, languageCode] as const,
  },

  test: {
    user: (id: number) => ["user", id] as const,
  },
} as const;

/**
 * Centralized mutation key factory for TanStack Query.
 * Use these keys in useMutation({ mutationKey: mutationKeys.*() }).
 */
export const mutationKeys = {
  garage: {
    addUpdate: () => ["add-update-my-cars-to-eb"] as const,
    deleteCar: () => ["delete-car-from-eb"] as const,
  },
  cart: {
    calculatePrice: () => ["calculate-price"] as const,
    payOrder: () => ["pay-order"] as const,
    vinCheck: () => ["vin-check-order"] as const,
  },
  vin: {
    partCheck: () => ["vin-check-part"] as const,
    /** GET /Vin/{vinNumber} — vehicle list for E2E VIN search (per-VIN cache key). */
    searchCars: (vinNumber?: string) =>
      vinNumber
        ? (["vin-search-cars", vinNumber.trim().toUpperCase()] as const)
        : (["vin-search-cars"] as const),
  },
  profile: {
    updateProfile: () => ["update-profile-information"] as const,
    updateHasLoggedIn: () => ["update-has-logged-in-information"] as const,
    deleteAccount: () => ["delete-account"] as const,
  },
  search: {
    searchParts: () => ["search-parts"] as const,
  },
  cars: {
    filters: () => ["cars", "filters"] as const,
  },
  address: {
    saveAddress: () => ["save-address"] as const,
    deleteAddress: () => ["delete-address"] as const,
  },
  support: {
    submit: () => ["submit-support"] as const,
    submitForReturn: () => ["submit-support-for-return"] as const,
  },
  test: {
    updateUser: (id: number) => ["update-user", id] as const,
  },
} as const;
