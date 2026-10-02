import { trackPdpVinVerification } from "@/utils/gtm";
import type { VinCheckResult } from "@/utils/vinCheck";

/** Fire GA4 `vin_verification` when a PDP check resolves to a part result. */
export function trackPdpVinVerificationFromResult(
  result: VinCheckResult,
  productId: string,
  isAuthenticated: boolean,
  locale?: string | null,
): void {
  const match = result.items[0]?.isMatch;
  if (!match || !productId.trim()) return;

  trackPdpVinVerification({
    productId,
    vinVerificationResult: match,
    customerType: isAuthenticated ? "logged_in" : "guest",
    locale,
  });
}
