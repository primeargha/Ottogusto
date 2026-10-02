import { apiClient, ApiError } from "@/config/api";
import type { DeleteAddressResponse, SaveAddressPayload, SaveAddressResponse } from "@/type";

export const saveAddress = async (data: SaveAddressPayload): Promise<SaveAddressResponse> => {
  try {
    const payload =
      typeof data?.country === "string" ? { ...data, country: data.country.toUpperCase() } : data;
    const response = await apiClient.post<SaveAddressResponse>(`/Profile/address`, payload);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const deleteAddress = async (id: string): Promise<DeleteAddressResponse> => {
  try {
    const response = await apiClient.delete<DeleteAddressResponse>(`/Profile/address/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
