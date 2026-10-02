"use client";

import { useEffect } from "react";
import { useRestoreCartOnLogin } from "@/hooks/useRestoreCartOnLogin";
import { useCartStore } from "@/stores/useCartStore";
import { getCartSessionRemainingMs } from "@/utils/cartSession";

export default function CartSessionHydrator() {
  useRestoreCartOnLogin();
  const cartSessionStartedAt = useCartStore((s) => s.cartSessionStartedAt);
  const hasCartItems = useCartStore((s) => s.cartitems.length > 0);
  const touchCartSession = useCartStore((s) => s.touchCartSession);
  const expireCartSessionIfNeeded = useCartStore((s) => s.expireCartSessionIfNeeded);

  useEffect(() => {
    if (hasCartItems && cartSessionStartedAt == null) {
      touchCartSession();
    }
  }, [hasCartItems, cartSessionStartedAt, touchCartSession]);

  useEffect(() => {
    expireCartSessionIfNeeded();
  }, [expireCartSessionIfNeeded]);

  useEffect(() => {
    const remaining = getCartSessionRemainingMs(cartSessionStartedAt);
    if (remaining === null) return;

    if (remaining <= 0) {
      expireCartSessionIfNeeded();
      return;
    }

    const timer = window.setTimeout(() => {
      expireCartSessionIfNeeded();
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [cartSessionStartedAt, expireCartSessionIfNeeded]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        expireCartSessionIfNeeded();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [expireCartSessionIfNeeded]);

  return null;
}
