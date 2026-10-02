import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths under [language-country] (e.g. /en-BE/en/wheel-suspension).
 * Ensures notFound() runs inside (public) so (public)/not-found.tsx is used and the header is shown.
 */
export default function NotFoundCatchAll() {
  notFound();
}
