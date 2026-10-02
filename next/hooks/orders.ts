import { apiClient } from "@/config/api";
import { MAX_COUNT } from "@/constants";
import {
  getAllOrders,
  getOrderById,
  getOrderByIdWithoutemail,
  getReturnDetailById,
} from "@/services/cart";
import type { GetOrdersResponse } from "@/type";
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { X_API_KEY } from "@/config/app";
import { appendApiIpHeader } from "@/lib/clientIp";

export const allOrdersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.orders.all(),
    queryFn: () => getAllOrders(),
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetAllOrders = () => {
  return useQuery(allOrdersQueryOptions());
};

export const allOrdersSupportQueryOptions = (isAuthenticated: boolean) =>
  queryOptions({
    queryKey: queryKeys.orders.allSupport(isAuthenticated),
    queryFn: () => getAllOrders(),
    enabled: !!isAuthenticated,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetAllOrderssupport = (isAuthenticated: boolean) => {
  return useQuery(allOrdersSupportQueryOptions(isAuthenticated));
};

const ordersPaginationQueryFn = async ({
  pageParam = null,
}: {
  pageParam: unknown;
}): Promise<GetOrdersResponse> => {
  const response = await apiClient.get<{ data: GetOrdersResponse }>(
    `/Order?ExcludeStatus=PaidFailed&ExcludeStatus=Abandoned&ExcludeStatus=New&ExcludeStatus=Cancelled&take=${MAX_COUNT}&continuationToken=${pageParam === 1 ? "" : pageParam}`,
  );
  return response.data;
};

export const ordersPaginationInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.orders.pagination(),
    queryFn: ordersPaginationQueryFn,
    getNextPageParam: (lastPage: GetOrdersResponse) => lastPage.continuationToken ?? false,
    initialPageParam: 1 as string | number | false,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetAllOrdersPagination = () => {
  return useInfiniteQuery(ordersPaginationInfiniteQueryOptions());
};

export const orderByIdQueryOptions = (orderId: string, emailId: string, customerId?: string) =>
  queryOptions({
    queryKey: queryKeys.orders.orderById(orderId, emailId, customerId),
    queryFn: () => getOrderById(orderId, emailId, customerId),
    enabled: !!orderId && !!emailId,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetOrderById = (orderId: string, emailId: string, customerId?: string) => {
  return useQuery(orderByIdQueryOptions(orderId, emailId, customerId));
};

export const orderByIdWithoutEmailQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: queryKeys.orders.orderByIdWithoutEmail(orderId),
    queryFn: () => getOrderByIdWithoutemail(orderId),
    enabled: !!orderId,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetOrderByIdWithoutEmail = (orderId: string) => {
  return useQuery(orderByIdWithoutEmailQueryOptions(orderId));
};

export const returnDetailByIdQueryOptions = (orderId: string, emailId: string) =>
  queryOptions({
    queryKey: queryKeys.orders.returnDetails(orderId, emailId),
    queryFn: () => getReturnDetailById(orderId, emailId),
    enabled: !!orderId && !!emailId,
    staleTime: 5 * 60 * 1000,
  });

export const useGetReturnDetailById = (orderId: string, emailId: string) => {
  return useQuery(returnDetailByIdQueryOptions(orderId, emailId));
};

export type OrderInvoiceDownload = {
  blob: Blob;
  filename: string;
};

export const orderInvoiceQueryOptions = (orderId: string, enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.orders.orderInvoice(orderId),
    // Fetch invoice as a blob for download
    queryFn: async (): Promise<OrderInvoiceDownload> => {
      if (typeof window === "undefined") {
        throw new Error("Invoice download is only supported in the browser.");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-dev.ottogusto.com/api";

      const headers: Record<string, string> = {
        "x-api-key": X_API_KEY || "--no-key--",
      };

      try {
        const authStoreRaw = localStorage.getItem("auth-store");
        const token = authStoreRaw ? JSON.parse(authStoreRaw)?.state?.accessToken : null;
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const locale = localStorage.getItem("locale");
        if (locale) {
          const [lang, country] = locale.split("-");
          if (lang) headers["X-API-Lang"] = lang;
          if (country && country !== "BE") headers["X-API-Country"] = country;
        }

        appendApiIpHeader(headers);
      } catch {
        // Ignore header enrichment errors – request will still be attempted
      }

      const response = await fetch(`${baseUrl}/Order/${orderId}/invoice`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Empty invoice file received.");
      }

      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `invoice-${orderId}.pdf`;

      return { blob, filename };
    },
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const useGetOrderInvoice = (orderId: string, enabled: boolean = false) => {
  return useQuery(orderInvoiceQueryOptions(orderId, enabled));
};
// export const useGetAllOrdersPagination = () => {
//   return useInfiniteQuery({
//     queryKey: ['orders'],
//     queryFn: async ({ pageParam = null }) => {
//       // Add debug logging

//       const response = await apiClient.get('/Order', {
//         params: {
//           ExcludeStatus: ['Failed', 'Abandond'],
//           take: 10,
//           continuationToken: pageParam === 1 ? "" : pageParam
//         }
//       });

//       // Add debug logging
//       return response.data;
//     },
//     getNextPageParam: (lastPage) => {
//       // Add debug logging

//       // Explicitly handle undefined/null case
//       return lastPage.continuationToken ?? false
//     },
//     initialPageParam: 1
//   });
// };
