// Example usage:
import { apiClient, ApiError } from "@/config/api";
import type { GetConfigResponse } from "@/type";

const cache = new Map<string, { data: GetConfigResponse; timestamp: number }>();

//  will call for react query - query
export const getConfig = async (): Promise<GetConfigResponse> => {
  try {
    const cached = cache.get(`config`);
    if (cached && Date.now() - cached.timestamp < 50 * 60 * 1000) {
      return cached.data;
    }
    const res = await apiClient.get<{ data: GetConfigResponse }>(`/Config`, {});
    // console.debug("Config API Response: \n\n",res.data);
    if (!res?.data) {
      return {} as GetConfigResponse;
    }
    const data = res.data;
    if (data.countries && typeof data.countries === "object") {
      const { eu, ...filteredCountries } = data.countries;
      data.countries = filteredCountries;
    }

    cache.set("config", { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
