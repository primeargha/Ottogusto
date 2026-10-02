import { apiClient, ApiError } from "@/config/api";
// @ts-ignore
import MakeModelsDATA from "../data/makemodels.json";
import { getBrands } from "./search";
import ts from "typescript";

/**
 * Get Car brands data with Images
 * ✅ Now uses cached getBrands() from search.ts
 * @returns
 */
export const getBrandsWithCarImage = async () => {
  // Use the cached getBrands function instead of calling API directly
  return getBrands();
};

/**
 * Get available brands
 * @returns
 */
export const getAvailableBrands = async () => {
  try {
    // const MakeModelsDATA = await apiClient.get(`/MakeModelType/brands`);
    // return MakeModelsDATA.data;

    return MakeModelsDATA;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
  }
};
