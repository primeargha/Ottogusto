"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import useRouter from "@unitools/router";
import { useCartStore } from "@/stores/useCartStore";
import {
  buildInterruptedPaymentStatusUrl,
  getPaymentSession,
  shouldRedirectCheckoutToPaymentFailed,
} from "@/utils/paymentSession";

/**
 * Checkout: payment_session with payment_completed=false → Bump in the Road.
 * Session is cleared on the fail page, not here.
 */
export function usePaymentInterruptedRedirect(enabled = true) {
  const params = useParams();
  const router = useRouter();
  const settry_again = useCartStore((s) => s.settry_again);
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const redirect = () => {
      if (redirectingRef.current || !shouldRedirectCheckoutToPaymentFailed()) return;

      const session = getPaymentSession();
      if (!session?.orderId) return;

      redirectingRef.current = true;
      settry_again(true);
      router.replace(
        buildInterruptedPaymentStatusUrl(params ?? {}, session.orderId, session.customerId),
      );
    };

    redirect();

    const onPageshow = (e: PageTransitionEvent) => {
      if (e.persisted) redirect();
    };
    window.addEventListener("pageshow", onPageshow);
    return () => window.removeEventListener("pageshow", onPageshow);
  }, [enabled, params, router, settry_again]);
}
