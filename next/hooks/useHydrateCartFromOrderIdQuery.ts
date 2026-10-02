"use client";

import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  applySharedOrderHydrationFailure,
  consumeSharedOrderCartPageCalculateSkip,
  getLocaleSegmentFromPathname,
  hydrateCartFromSharedOrderId,
} from "@/utils/sharedOrderFromUrl";
import { appendCurrentVehicleQueryToHref } from "@/utils/categorySearchUrl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type HydrateStatus = "idle" | "loading" | "done";

const sharedOrderHydratePromises = new Map<string, Promise<"done" | "error">>();

function runSharedOrderHydrate(
  orderId: string,
  options: { isCheckout: boolean; isAuthenticated: boolean },
): Promise<"done" | "error"> {
  const existing = sharedOrderHydratePromises.get(orderId);
  if (existing) return existing;

  const promise = (async (): Promise<"done" | "error"> => {
    try {
      await hydrateCartFromSharedOrderId(orderId, options);
      return "done";
    } catch {
      return "error";
    } finally {
      sharedOrderHydratePromises.delete(orderId);
    }
  })();

  sharedOrderHydratePromises.set(orderId, promise);
  return promise;
}

function stripOrderIdFromUrl(
  pathname: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>,
): void {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete("orderId");
  nextParams.delete("orderid");
  const qs = nextParams.toString();
  router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
}

/**
 * When ?orderId= is present, load that order into the cart (items + cartid + prices only).
 * Address and other checkout state in cart-storage are left unchanged.
 */
export function useHydrateCartFromOrderIdQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const sharedOrderId = useMemo(() => {
    if (!searchParams) return "";
    const raw = searchParams.get("orderId") ?? searchParams.get("orderid");
    return raw?.trim() ?? "";
  }, [searchParams]);

  const [status, setStatus] = useState<HydrateStatus>(sharedOrderId ? "loading" : "idle");
  const hydrateCompletedRef = useRef<string | null>(null);

  const isCheckout = pathname?.includes("/shoppingcart/checkout") ?? false;

  useEffect(() => {
    if (!sharedOrderId) {
      setStatus(hydrateCompletedRef.current ? "done" : "idle");
      return;
    }

    if (hydrateCompletedRef.current === sharedOrderId) {
      setStatus("done");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    void runSharedOrderHydrate(sharedOrderId, { isCheckout, isAuthenticated }).then((result) => {
      if (result === "error") {
        applySharedOrderHydrationFailure();
        consumeSharedOrderCartPageCalculateSkip();

        if (isCheckout) {
          const locale = getLocaleSegmentFromPathname(pathname ?? "");
          router.replace(
            appendCurrentVehicleQueryToHref(
              getRouteLocaleString(Routes.shoppingCart, { "language-country": locale }),
              searchParams,
            ),
            {
              scroll: false,
            },
          );
        } else if (typeof window !== "undefined" && searchParams) {
          stripOrderIdFromUrl(pathname ?? "", searchParams, router);
        }

        if (!cancelled) {
          setStatus("idle");
        }
        return;
      }

      if (cancelled) return;

      hydrateCompletedRef.current = sharedOrderId;
      setStatus("done");
      consumeSharedOrderCartPageCalculateSkip();

      if (typeof window !== "undefined" && searchParams) {
        stripOrderIdFromUrl(pathname ?? "", searchParams, router);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sharedOrderId, isCheckout, isAuthenticated, pathname, router, searchParams]);

  return {
    sharedOrderId,
    isSharedOrderHydrating: Boolean(sharedOrderId) && status === "loading",
    isSharedOrderHydrateComplete: !sharedOrderId || status === "done",
  };
}
