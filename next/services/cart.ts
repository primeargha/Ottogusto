import { apiClient, ApiError } from "@/config/api";
import type {
  GetOrderInvoiceResponse,
  GetOrderListItem,
  GetOrderResponse,
  GetOrdersResponse,
  OrderCalculatePayload,
  OrderCalculateResponse,
  OrderPayPayload,
  OrderPayResponse,
  OrderVinCheckPayload,
  OrderVinCheckResponse,
} from "@/type";

export const vinCheckOrder = async (
  data: OrderVinCheckPayload,
): Promise<{ data: OrderVinCheckResponse }> => {
  try {
    const response = await apiClient.post<{ data: OrderVinCheckResponse }>(`/Order/VinCheck`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const saveCart = async (
  data: OrderCalculatePayload,
): Promise<{ data: OrderCalculateResponse }> => {
  try {
    const response = await apiClient.post<{ data: OrderCalculateResponse }>(
      `/Order/Calculate`,
      data,
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
export const payOrder = async (data: OrderPayPayload): Promise<{ data: OrderPayResponse }> => {
  try {
    const params = new URLSearchParams();
    if (data.returnUrl != null) params.set("returnUrl", data.returnUrl);
    if (data.paymentMethod != null) params.set("paymentMethod", data.paymentMethod);
    const query = params.toString();
    const url = `/Order/Pay${query ? `?${query}` : ""}`;
    const response = await apiClient.post<{ data: OrderPayResponse }>(url, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
/** GET /api/Order/{orderId}/{email}. Path: orderId, email; query: customerId?, checkStatus?. */
export const getOrderById = async (
  orderId: string,
  email: string,
  customerId?: string,
): Promise<GetOrderResponse> => {
  try {
    const params = new URLSearchParams();
    if (customerId != null) params.set("customerId", customerId);
    const query = params.toString();
    const url = `/Order/${orderId}/${email}${query ? `?${query}` : ""}`;
    const response = await apiClient.get<{ data: GetOrderResponse }>(url);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getOrderByIdWithoutemail = async (orderId: string): Promise<GetOrderResponse> => {
  try {
    const response = await apiClient.get<{ data: GetOrderResponse }>(`/Order/${orderId}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Order (order list). Returns data array only. */
export const getAllOrders = async (): Promise<GetOrderListItem[]> => {
  try {
    const response = await apiClient.get<{ data: GetOrdersResponse }>(
      `/Order?ExcludeStatus=PaidFailed&ExcludeStatus=Abandoned&ExcludeStatus=New&ExcludeStatus=Cancelled`,
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Order?IncludeStatus=New (current cart). Returns data array only. */
export const getCheckCartId = async (): Promise<GetOrderListItem[]> => {
  try {
    const response = await apiClient.get<{ data: GetOrdersResponse }>(`/Order?IncludeStatus=New`);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Order (support order list). Returns data array only. */
export const getAllOrderssupport = async (): Promise<GetOrderListItem[]> => {
  try {
    const response = await apiClient.get<{ data: GetOrdersResponse }>(
      `/Order?ExcludeStatus=Failed&ExcludeStatus=Abandoned&ExcludeStatus=New&ExcludeStatus=Cancelled`,
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Order (paginated). Returns data array only. */
export const getAllOrderspagination = async (): Promise<GetOrderListItem[]> => {
  try {
    const response = await apiClient.get<{ data: GetOrdersResponse }>(
      `/Order?ExcludeStatus=Failed&ExcludeStatus=Abandoned&ExcludeStatus=Cancelled`,
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getReturnDetailById = async (orderId: string, emailId: string) => {
  try {
    const response = await apiClient.get<any>(`/Return/${orderId}/${emailId}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/** GET /api/Order/{orderId}/invoice. Path: orderId (required). */
export const getOrderInvoice = async (orderId: string): Promise<GetOrderInvoiceResponse> => {
  try {
    const response = await apiClient.get<{ data: GetOrderInvoiceResponse }>(
      `/Order/${orderId}/invoice`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
