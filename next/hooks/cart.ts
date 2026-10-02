import {
  getOrderById,
  getOrderByIdWithoutemail,
  payOrder,
  saveCart,
  vinCheckOrder,
} from "@/services/cart";
import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type {
  OrderCalculatePayload,
  OrderCalculateResponse,
  OrderPayPayload,
  OrderPayResponse,
  OrderVinCheckPayload,
  OrderVinCheckResponse,
} from "@/type";

export const useCalculatePriceMutation = (
  options?: UseMutationOptions<{ data: OrderCalculateResponse }, Error, OrderCalculatePayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.cart.calculatePrice(),
    mutationFn: saveCart,
    ...options,
  });

  return mutation;
};

export const useVinCheckMutation = (
  options?: UseMutationOptions<{ data: OrderVinCheckResponse }, Error, OrderVinCheckPayload>,
) => {
  return useMutation({
    mutationKey: mutationKeys.cart.vinCheck(),
    mutationFn: vinCheckOrder,
    ...options,
  });
};
export const usePayOrderMutation = (
  options?: UseMutationOptions<{ data: OrderPayResponse }, Error, OrderPayPayload>,
) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.cart.payOrder(),
    mutationFn: payOrder,
    ...options,
  });

  return mutation;
};
const orderByIdQueryFn = (
  orderId: string | null,
  emailId: string | null,
  customerId: string | null,
) => {
  if (!orderId) throw new Error("Order ID are required");
  if (emailId) return getOrderById(orderId, emailId);
  if (customerId) return getOrderById(orderId, "", customerId);
  return getOrderByIdWithoutemail(orderId);
};

export const orderByIdQueryOptions = (
  orderId: string | null,
  emailId: string | null,
  customerId: string | null,
  options?: { allowOrderIdOnly?: boolean },
) =>
  queryOptions({
    queryKey: queryKeys.cart.orderById(orderId, emailId, customerId),
    queryFn: () => orderByIdQueryFn(orderId, emailId, customerId),
    enabled: !!orderId && (!!emailId || !!customerId || options?.allowOrderIdOnly === true),
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useGetOrderByIdQuery = (
  orderId: string | null,
  emailId: string | null,
  customerId: string | null,
  options?: { allowOrderIdOnly?: boolean },
) => {
  return useQuery(orderByIdQueryOptions(orderId, emailId, customerId, options));
};
