"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  deleteMyCar,
  getMyCars,
  type MyCarItem,
  upsertMyCar,
  type UpsertMyCarPayload,
} from "@/services/myCars";

export function useMyCarsQuery() {
  const { isAuthenticated, authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? "anonymous";

  return useQuery({
    queryKey: ["my-cars", userId] as const,
    queryFn: getMyCars,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });
}

export function useUpsertMyCarMutation() {
  const queryClient = useQueryClient();
  const { authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? "anonymous";
  return useMutation({
    mutationFn: (payload: UpsertMyCarPayload) => upsertMyCar(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-cars", userId] as const });
    },
  });
}

export function useDeleteMyCarMutation() {
  const queryClient = useQueryClient();
  const { authUser } = useAuthStore();
  const userId = (authUser as any)?.id ?? "anonymous";
  return useMutation({
    mutationFn: (id: string) => deleteMyCar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-cars", userId] as const });
    },
  });
}

export type { MyCarItem };
