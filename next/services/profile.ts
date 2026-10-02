// Example usage:
import { apiClient, ApiError } from "@/config/api";
import type { DeleteProfileResponse, GetCustomerVatResponse, GetProfileResponse } from "@/type";
import { ProfileUpdatePayload, Address } from "@/types/profile";
import { useAuthStore, AuthUserType } from "@/stores/useAuthStore";
import { AUTH_0 } from "@/config/app";

//  will call for react query - query
// skipCache: when true, appends a query param to bypass Next.js/HTTP cache (e.g. when returning to checkout)
export const getProfileInformation = async (options?: {
  skipCache?: boolean;
}): Promise<GetProfileResponse> => {
  try {
    const url = options?.skipCache === true ? `/Profile?refresh=${Date.now()}` : `/Profile`;
    const response = await apiClient.get<GetProfileResponse>(url);
    useAuthStore.getState().setAuthUser(response.data as AuthUserType);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const vatLookup = async (vatNumber: string) => {
  try {
    const response = await apiClient.get<{ data: Address }>(`/Profile/vat/${vatNumber}`);
    return response;
  } catch (error) {
    throw error;
  }
};
export const companyVatLookup = async (vatNumber: string): Promise<GetCustomerVatResponse> => {
  try {
    const response = await apiClient.get<GetCustomerVatResponse>(`/customer/vat/${vatNumber}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.data;
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const updateProfileInformation = async (data: ProfileUpdatePayload) => {
  try {
    const response = await apiClient.post<AuthUserType>(`/Profile`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
export const deleteAccount = async (): Promise<DeleteProfileResponse> => {
  try {
    const response = await apiClient.delete<DeleteProfileResponse>(`/Profile`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const revokeToken = async (token: string) => {
  const response = await fetch(`https://${AUTH_0.DOMAIN}/oauth/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to revoke token");
  }
};
