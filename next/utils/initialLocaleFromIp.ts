/**
 * First-visit country/language decision from IP country code.
 * Returning users with a saved preference must never call this path for overwrite.
 */

export type InitialLocaleDecision = {
  /** Full locale, e.g. "nl-NL" */
  locale: string;
  /** Language code, e.g. "nl" */
  language: string;
  /** Country code uppercase, e.g. "NL" */
  country: string;
  /** Whether the country/language modal should be shown */
  showModal: boolean;
};

const FALLBACK: InitialLocaleDecision = {
  locale: "en-BE",
  language: "en",
  country: "BE",
  showModal: false,
};

/**
 * Map an ISO country code (from IP geolocation) to the initial locale UX decision.
 *
 * NL/FR → auto-apply, no modal
 * BE/LU → show modal with defaults preselected
 * Unknown / unsupported → Belgium + English, no modal
 */
export function resolveInitialLocaleFromCountryCode(
  countryCode: string | null | undefined,
): InitialLocaleDecision {
  const code = (countryCode || "").trim().toUpperCase();

  switch (code) {
    case "NL":
      return { locale: "nl-NL", language: "nl", country: "NL", showModal: false };
    case "FR":
      return { locale: "fr-FR", language: "fr", country: "FR", showModal: false };
    case "BE":
      return { locale: "en-BE", language: "en", country: "BE", showModal: true };
    case "LU":
      return { locale: "fr-LU", language: "fr", country: "LU", showModal: true };
    default:
      return FALLBACK;
  }
}
