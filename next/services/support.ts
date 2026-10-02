import { apiClient, ApiError } from "@/config/api";
import type {
  GetReturnQueryParams,
  GetReturnResponse,
  PostReturnPayload,
  PostSupportPayload,
  PostSupportResponse,
} from "@/type";

/** POST /api/Support (send support message). Body: PostSupportPayload. */
export const submitSupport = async (
  data: PostSupportPayload,
): Promise<{ data: PostSupportResponse }> => {
  try {
    const response = await apiClient.post<{ data: PostSupportResponse }>(`/Support`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** POST /api/Return (commit return). Body: PostReturnPayload. Returns { data: GetReturnResponse }. */
export const submitSupportForReturn = async (
  data: PostReturnPayload,
): Promise<{ data: GetReturnResponse }> => {
  try {
    const response = await apiClient.post<{ data: GetReturnResponse }>(`/Return`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Return/{id}. Path: id (required). Query: createNew (boolean, default false). */
export const getRefundForAuthUser = async (
  id: string,
  query?: GetReturnQueryParams,
): Promise<{ data: GetReturnResponse }> => {
  try {
    const params = new URLSearchParams();
    if (query?.createNew === true) params.set("createNew", "true");
    const queryString = params.toString();
    const url = `/Return/${id}${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<{ data: GetReturnResponse }>(url);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Return/{id}/{email}. Path: id, email (required). Query: createNew (boolean, default false). */
export const getRefundForGuestUser = async (
  id: string,
  email: string,
  query?: GetReturnQueryParams,
): Promise<{ data: GetReturnResponse }> => {
  try {
    const params = new URLSearchParams();
    if (query?.createNew === true) params.set("createNew", "true");
    const queryString = params.toString();
    const url = `/Return/${id}/${email}${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<{ data: GetReturnResponse }>(url);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
