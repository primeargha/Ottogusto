// // Example usage:
import { apiClient, ApiError } from "@/config/api";
import type { GetPartByIdResponse, GetStockByIdResponse } from "@/type";
import {
  isValidPartIdForApi,
  logPartApiCall,
  logSkippedPartApiCall,
  normalizePartId,
} from "@/utils/part-id";
import {
  isCompatibleCarSectionEnabled,
  isNewMmeFeatureEnabledForCountry,
} from "@/utils/legacyCarCompatibility";

/** GET /api/Parts/{id}. Path: id (required). Returns { data: GetPartByIdResponse }. */
export const getProductInformation = async (
  productId: string | number,
): Promise<{ data: GetPartByIdResponse }> => {
  const id = normalizePartId(productId);
  if (!id || !isValidPartIdForApi(id)) {
    logSkippedPartApiCall("getProductInformation", productId);
    throw new ApiError(400, "Invalid part id");
  }
  try {
    logPartApiCall("getProductInformation", id, { method: "GET", path: `/Parts/${id}` });
    const response = await apiClient.get<{ data: GetPartByIdResponse }>(`/Parts/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
export const getmatchingcarsInformation = async (partId: string | null) => {
  if (!isCompatibleCarSectionEnabled()) {
    return { data: [] as never[] };
  }
  if (isNewMmeFeatureEnabledForCountry()) {
    return { data: [] as never[] };
  }
  const id = normalizePartId(partId);
  if (!id || !isValidPartIdForApi(id)) {
    logSkippedPartApiCall("getmatchingcarsInformation", partId);
    return { data: [] };
  }
  try {
    logPartApiCall("getmatchingcarsInformation", id, {
      method: "GET",
      path: `/MakeModelType/part/${id}`,
    });
    const matchingcardetails = await apiClient.get<any>(`/MakeModelType/part/${id}`);
    return matchingcardetails;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
export const getManufacturingformation = async () => {
  try {
    const productdetails = await apiClient.get<any>(`/Manufacturer`);
    return productdetails;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Stock/{id}. Path: id (required). Returns { data: GetStockByIdResponse }. */
export const getInstockInformation = async (
  id: string | number,
): Promise<{ data: GetStockByIdResponse }> => {
  try {
    const response = await apiClient.get<{ data: GetStockByIdResponse }>(`/Stock/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const checkPartCompatibility = async (
  makeModelTypeId: string,
  partId: string,
  // TODO: replace with types from api docs
): Promise<{ isCompatible: boolean; relatedMMTs?: any[] }> => {
  const id = normalizePartId(partId);
  if (!id || !isValidPartIdForApi(id)) {
    logSkippedPartApiCall("checkPartCompatibility", partId);
    return { isCompatible: false };
  }
  try {
    logPartApiCall("checkPartCompatibility", id, {
      method: "GET",
      path: `/MakeModelType/${makeModelTypeId}/check/${id}`,
    });
    const response = await apiClient.get<any>(`/MakeModelType/${makeModelTypeId}/check/${id}`);

    // Check if response status is 204 (No Content = not compatible)
    if (response.status === 204) {
      return {
        isCompatible: false,
      };
    }

    // Check if response has data (array with items)
    // Handle both direct array response and wrapped response (response.data or response.data.data)
    let responseData = response?.data;

    // If response.data is not an array, check if response.data.data is an array (wrapped response)
    if (!Array.isArray(responseData) && responseData?.data && Array.isArray(responseData.data)) {
      responseData = responseData.data;
    }

    const isArray = Array.isArray(responseData);
    const hasData = isArray && responseData.length > 0;

    // If we get a response with data array, it's compatible
    if (hasData) {
      return {
        isCompatible: true,
        relatedMMTs: responseData,
      };
    }

    // No data or empty array means not compatible
    return {
      isCompatible: false,
    };
  } catch (error: any) {
    // TODO: replace with types from api docs

    // Handle 204 No Content error (not compatible)
    if (error?.response?.status === 204) {
      return {
        isCompatible: false,
      };
    }

    // For other errors, assume not compatible
    return {
      isCompatible: false,
    };
  }
};
