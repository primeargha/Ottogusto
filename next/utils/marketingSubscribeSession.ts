export const MARKETING_SUBSCRIBED_SESSION_KEY = "marketing_subscribed";

export function isMarketingSubscribedInSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(MARKETING_SUBSCRIBED_SESSION_KEY) === "1";
}

export function markMarketingSubscribedInSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MARKETING_SUBSCRIBED_SESSION_KEY, "1");
}
