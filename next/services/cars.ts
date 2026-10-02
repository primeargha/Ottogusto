import { apiClient, ApiError } from "@/config/api";
import { normalizePartCompatibleCarsResponse } from "@/utils/partCompatibleCars";

export interface CarsFiltersPayload {
  make: string | null;
  model: string | null;
  body: string | null;
  engine: string | null;
  engineCode: string | null;
  variant: string | null;
  gearBox: string | null;
  gearBoxCode: string | null;
  /**
   * Optional VIN hydrate (E2E). Backend: VIN overrules other body fields.
   * Send only on the first Cars request; omit/null after the user changes MME.
   */
  vin?: string | null;
}

export type CarsFilterDictionary = Record<string, string>;

export interface CarsFiltersResponse {
  makes?: CarsFilterDictionary;
  models?: CarsFilterDictionary;
  bodys?: CarsFilterDictionary;
  engines?: CarsFilterDictionary;
  engineCodes?: CarsFilterDictionary;
  variants?: CarsFilterDictionary;
  gearBoxes?: CarsFilterDictionary;
  gearBoxCodes?: CarsFilterDictionary;
  carIds?: string[];
  make?: string | null;
  model?: string | null;
  body?: string | null;
  engine?: string | null;
  engineCode?: string | null;
  variant?: string | null;
  gearBox?: string | null;
  gearBoxCode?: string | null;
}

export interface CarByIdResponse {
  id: string;
  make: string | null;
  model: string | null;
  variant: string | null;
  body: string | null;
  engine: string | null;
  engineCode: string | null;
  gearBox: string | null;
  gearBoxCode: string | null;
  umc?: string | null;
  equipmentCodes?: string | null;
}

export const postCarsFilters = async (
  payload: CarsFiltersPayload,
): Promise<{ data: CarsFiltersResponse }> => {
  try {
    return await apiClient.post<{ data: CarsFiltersResponse }>(`/Cars`, payload);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getCarById = async (id: string): Promise<{ data: CarByIdResponse }> => {
  try {
    return await apiClient.get<{ data: CarByIdResponse }>(`/Cars/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /Cars/part/{partId} — cars compatible with a part (new MME PDP fitment). */
export interface PartCompatibleCar {
  id: string;
  make: string;
  model: string;
  variant: string;
  body: string;
  engine: string;
  engineCode: string;
  gearBox: string;
  gearBoxCode: string;
  verifiedMatch: boolean;
}

export const getPartCompatibleCars = async (
  partId: string,
): Promise<{ data: PartCompatibleCar[] }> => {
  try {
    const response = await apiClient.get<{ data: unknown }>(`/Cars/part/${partId}`);
    return { data: normalizePartCompatibleCarsResponse(response.data) };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
