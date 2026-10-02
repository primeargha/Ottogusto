import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const RESTRICTED_ROUTES = [
  "shoppingcart",
  "checkout",
  "payment",
  "order-confirmation",
  "car-parts",
  "auto-onderdelen",
  "pieces-auto",
  "autoteile",
];
const CONSENT_KEY = "marketing_consent"; // ✅ localStorage key
const DELAY_MS = 20_000; // ✅ 20 seconds (easy to change)

const useIsRestrictedRoute = () => {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  // segments[0] is always the [language-country] locale; home page has no segments beyond it
  const isHome = segments.length <= 1;
  const lastSegment = segments.at(-1);
  return isHome || RESTRICTED_ROUTES.includes(lastSegment ?? "");
};

export const useMarketingConsentModal = () => {
  const [showModal, setShowModal] = useState(false);
  const isRestricted = useIsRestrictedRoute();

  useEffect(() => {
    // ✅ Don't start timer if on restricted route
    if (isRestricted) return;

    // ✅ Don't show if user already gave consent decision
    const hasDecided = localStorage.getItem(CONSENT_KEY);
    if (hasDecided) return;

    // ✅ Start 20 second timer
    const timer = setTimeout(() => {
      setShowModal(true);
    }, DELAY_MS);

    return () => clearTimeout(timer); // cleanup on unmount
  }, [isRestricted]);

  // Called when user accepts or declines
  const handleDecision = (decision: "accepted" | "declined") => {
    localStorage.setItem(CONSENT_KEY, decision); // ✅ persist decision
    setShowModal(false);
  };

  return { showModal, handleDecision };
};
