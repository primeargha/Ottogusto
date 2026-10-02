"use client";

import { useParams, useSearchParams } from "next/navigation";

import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { appendCurrentVehicleQueryToHref } from "@/utils/categorySearchUrl";

/** Shopping cart URL, copying current `carIds` / `vin` query when present. */
export function useShoppingCartHref(): string {
  const params = useParams();
  const searchParams = useSearchParams();
  return appendCurrentVehicleQueryToHref(
    getRouteLocaleString(Routes.shoppingCart, params),
    searchParams,
  );
}

/** Checkout URL, copying current `carIds` / `vin` query when present. */
export function useCheckoutHref(): string {
  const params = useParams();
  const searchParams = useSearchParams();
  return appendCurrentVehicleQueryToHref(
    getRouteLocaleString(Routes.checkout, params),
    searchParams,
  );
}
