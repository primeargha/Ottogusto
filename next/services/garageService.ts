import { apiClient, ApiError } from "@/config/api";
import type {
  DeleteGarageCarResponse,
  GetGarageCarResponse,
  GetGarageResponse,
  PostGaragePayload,
} from "@/type";

interface CarsTokenResponse {
  success: boolean;
  message: string;
}

export const getAllCars = async (token: string): Promise<CarsTokenResponse> => {
  try {
    const response = await apiClient.post<CarsTokenResponse>(
      "/Garage",
      new URLSearchParams({ token }), // Request body
    );

    return response; // Ensure response is properly typed
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getMySavedCars = async (): Promise<GetGarageResponse> => {
  try {
    const response = await apiClient.get<GetGarageResponse>(`/Garage`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getCarById = async (id: string): Promise<GetGarageCarResponse> => {
  try {
    const response = await apiClient.get<GetGarageCarResponse>(`/Garage/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const addUpdateCarToEB = async (body: PostGaragePayload): Promise<GetGarageResponse> => {
  try {
    const response = await apiClient.post<GetGarageResponse>(`/Garage`, body);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** New MME add: POST /Garage `{ carId }` (+ optional E2E `name` / `vin`). */
export type PostGarageNewMmePayload =
  | { carId: string; name?: string | null; vin?: string | null }
  | { id: string; carId: string; name?: string | null; vin?: string | null };

export const postGarageNewMmeCar = async (payload: {
  id?: string;
  carId: string;
  /** E2E: `"makeModelOnly"` or `"makeModelOnly:id0,id1,…"` when saved from 2–5 carIds; `null` clears. */
  name?: string | null;
  /** E2E: VIN when saved via Search by VIN; `null` clears after search-by-car. */
  vin?: string | null;
}): Promise<GetGarageResponse> => {
  const carId = payload.carId.trim();
  const recordId = payload.id?.trim();
  const body: PostGarageNewMmePayload = recordId ? { id: recordId, carId } : { carId };
  if (payload.name !== undefined) {
    body.name = payload.name;
  }
  if (payload.vin !== undefined) {
    body.vin = payload.vin;
  }
  return addUpdateCarToEB(body as PostGaragePayload);
};

export const deleteCarFromEB = async (id: string): Promise<DeleteGarageCarResponse> => {
  try {
    const response = await apiClient.delete<DeleteGarageCarResponse>(`/Garage/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
