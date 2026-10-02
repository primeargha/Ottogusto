import { apiClient, ApiError } from "@/config/api";

export interface MyCarItem {
  id: string;
  carId: string;
  title?: string | null;
  subtitle?: string | null;
}

export interface MyCarsResponse {
  data: MyCarItem[];
}

export interface UpsertMyCarPayload {
  id?: string;
  carId: string;
  title?: string | null;
  subtitle?: string | null;
}

/** Dummy backend endpoint for upcoming logged-in saved-car experience. */
export const getMyCars = async (): Promise<MyCarsResponse> => {
  try {
    return await apiClient.get<MyCarsResponse>("/my-cars");
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn("[my-cars] GET failed, falling back to empty list", error.message);
    }
    return { data: [] };
  }
};

/** Dummy backend endpoint for add/save/edit car. */
export const upsertMyCar = async (payload: UpsertMyCarPayload): Promise<MyCarItem> => {
  try {
    const response = await apiClient.post<{ data: MyCarItem }>("/my-cars", payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn("[my-cars] POST failed", error.message);
    }
    throw error;
  }
};

/** Dummy backend endpoint for deleting saved car. */
export const deleteMyCar = async (id: string): Promise<void> => {
  try {
    await apiClient.delete<void>(`/my-cars/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn("[my-cars] DELETE failed", error.message);
    }
    throw error;
  }
};
