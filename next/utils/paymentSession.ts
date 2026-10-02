import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";

export const PAYMENT_SESSION_KEY = "payment_session";

const MAX_PAYMENT_SESSION_MS = 2 * 60 * 60 * 1000;
const PAYMENT_REDIRECT_GRACE_MS = 800;

export interface PaymentSession {
  orderId: string;
  payment_completed: boolean;
  customerId?: string | null;
  startedAt: number;
}

export function isPayNlUrl(url: string): boolean {
  try {
    return /pay\.nl/i.test(new URL(url).hostname);
  } catch {
    return /pay\.nl/i.test(url);
  }
}

export function startPaymentSession(
  data: Omit<PaymentSession, "payment_completed" | "startedAt">,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PAYMENT_SESSION_KEY,
    JSON.stringify({
      ...data,
      payment_completed: false,
      startedAt: Date.now(),
    } satisfies PaymentSession),
  );
}

export function clearPaymentSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PAYMENT_SESSION_KEY);
}

export function getPaymentSession(): PaymentSession | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PAYMENT_SESSION_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as PaymentSession;
    if (!data?.orderId) {
      clearPaymentSession();
      return null;
    }
    if (Date.now() - (data.startedAt ?? 0) > MAX_PAYMENT_SESSION_MS) {
      clearPaymentSession();
      return null;
    }
    return data;
  } catch {
    clearPaymentSession();
    return null;
  }
}

export function isPaymentIncomplete(): boolean {
  const session = getPaymentSession();
  return session !== null && session.payment_completed === false;
}

export function markPaymentCompleted(): void {
  clearPaymentSession();
}

export function buildInterruptedPaymentStatusUrl(
  params: { "language-country"?: string } | Record<string, string | string[] | undefined>,
  orderId: string,
  customerId?: string | null,
): string {
  const base = getRouteLocaleString(Routes.paymentStatus, params);
  const search = new URLSearchParams({ orderId, interrupted: "1" });
  if (customerId) {
    search.set("customerId", customerId);
  }
  return `${base}?${search.toString()}`;
}

export function openPayNlPaymentGateway(
  url: string,
  data: Omit<PaymentSession, "payment_completed" | "startedAt">,
): void {
  if (isPayNlUrl(url)) {
    startPaymentSession(data);
  }
  window.open(url, "_self");
}

export function shouldRedirectCheckoutToPaymentFailed(): boolean {
  const session = getPaymentSession();
  if (!session || session.payment_completed !== false) return false;
  if (Date.now() - session.startedAt < PAYMENT_REDIRECT_GRACE_MS) return false;
  return true;
}
