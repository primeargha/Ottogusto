// Example usage:
import { apiClient, ApiError } from "@/config/api";
import type {
  GetBranddataByManufacturerResponse,
  GetBrandsResponse,
  GetEnginesResponse,
  GetModelsResponse,
  GetPartsByOeRefResponse,
  PostPartsSearchPayload,
  PostPartsSearchResponse,
} from "@/type";
import { cache } from "react";
import { shouldFetchMakeModelBrandsApi } from "@/utils/legacyCarCompatibility";

const EMPTY_BRANDS_RESPONSE: GetBrandsResponse = { data: [] };

export interface TypeData {
  id: string;
  type: string;
  /** Present when API returns full make/model/type info. */
  brand?: string | null;
  /** Present when API returns full make/model/type info. */
  model?: string | null;
}

export interface VinResponseData {
  brandName: string;
  modelName: string;
  year: string | number;
  typeName: string;
  vin: string;
  makeModelTypeId: string;
  /** Engine name when returned by VIN decode API. */
  engineName?: string;
}

// ✅ In-memory cache for brands (24 hours)
let brandsCache: { data: GetBrandsResponse; timestamp: number } | null = null;
let brandsPendingPromise: Promise<GetBrandsResponse> | null = null; // ✅ Track pending request
const BRANDS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ✅ Server-side cached version using React cache() for request deduplication
const getBrandsCached = cache(async (): Promise<GetBrandsResponse> => {
  try {
    const brands = await apiClient.get<GetBrandsResponse>(`/MakeModelType/brands`);
    return brands;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
});

//  will call for react query - query
// ✅ Added 24-hour caching for brands with request deduplication
export const getBrands = async (): Promise<GetBrandsResponse> => {
  if (!shouldFetchMakeModelBrandsApi()) {
    return EMPTY_BRANDS_RESPONSE;
  }

  const now = Date.now();

  // Check if cache is valid
  if (brandsCache && now - brandsCache.timestamp < BRANDS_CACHE_DURATION) {
    return brandsCache.data;
  }

  // ✅ If a request is already in progress, wait for it (prevents duplicate concurrent calls)
  if (brandsPendingPromise) {
    return brandsPendingPromise;
  }

  // Fetch fresh data

  // ✅ Store the promise so concurrent calls can reuse it
  brandsPendingPromise = getBrandsCached()
    .then((result) => {
      // Update cache
      brandsCache = { data: result, timestamp: Date.now() };
      brandsPendingPromise = null; // Clear pending promise
      return result;
    })
    .catch((error) => {
      brandsPendingPromise = null; // Clear pending promise on error
      throw error;
    });

  return brandsPendingPromise;
};

// ✅ Utility to clear brands cache
export const clearBrandsCache = () => {
  brandsCache = null;
  brandsPendingPromise = null;
};

export const getManufacturerBrands = async () => {
  try {
    const manufacturerBrand = await apiClient.get<any>(`/Manufacturer`);
    return manufacturerBrand;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getBrandById = async (
  brandId: string,
): Promise<GetBranddataByManufacturerResponse> => {
  try {
    const res = await apiClient.get<GetBranddataByManufacturerResponse>(`/Manufacturer/${brandId}`);
    return res;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getModels = async (brandId: string): Promise<GetModelsResponse> => {
  try {
    const models = await apiClient.get<GetModelsResponse>(`/MakeModelType/models/${brandId}`);
    return models;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getYears = async (
  modelId: number | string,
): Promise<{ data: (string | number)[] }> => {
  try {
    const years = await apiClient.get<{ data: (string | number)[] }>(
      `/MakeModelType/years/${modelId}`,
    );
    return years;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getTypes = async (data: {
  modelId: string | number;
  year?: string | number | undefined;
}): Promise<{ data: TypeData[] }> => {
  try {
    const types = await apiClient.get<{ data: TypeData[] }>(
      `/MakeModelType/types/${data.modelId}${data.year ? `?year=${data.year}` : ""}`,
    );
    return types;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getEngines = async (modelId: string): Promise<GetEnginesResponse> => {
  try {
    const engines = await apiClient.get<GetEnginesResponse>(`/MakeModelType/engines/${modelId}`);
    return engines;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getCarByVinOld = async (vin: string): Promise<{ data: VinResponseData }> => {
  try {
    const response = await apiClient.get<{ data: VinResponseData }>(`/MakeModelType/vin/${vin}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
export const getCarByVin = async (vin: string): Promise<{ data: VinResponseData }> => {
  try {
    const response = await apiClient.get<{ data: VinResponseData }>(`/vin/${vin}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

// search API
// TODO: replace with types from api docs
export const searchMakeModelType = async (data: any) => {
  try {
    const response = await apiClient.post<any>(`/MakeModelType`, data.payload);
    // payload options: makeModelTypeId, year, name
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Parts/oeref/{input}. Path: input (required). Returns { data: GetPartsByOeRefResponse }. */
export const getOeRef = async (input: string): Promise<{ data: GetPartsByOeRefResponse }> => {
  try {
    const response = await apiClient.get<{ data: GetPartsByOeRefResponse }>(
      `/Parts/oeref/${input}`,
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
/** POST /api/Parts (search/filter parts). Same as getParts in products service. */
export const searchParts = async (
  data: PostPartsSearchPayload,
): Promise<{ data: PostPartsSearchResponse }> => {
  try {
    const response = await apiClient.post<{ data: PostPartsSearchResponse }>(`/Parts`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getModalTypes = async (brandId: string) => {
  try {
    const response = await apiClient.get<any>(`/MakeModelType/types/${brandId}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
