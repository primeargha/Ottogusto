import {
  isCategoryPathSegment,
  isKnownManufacturersRouteSegment,
  isKnownPartsRouteSegment,
} from "@/config/url-segments";

/**
 * Detects the page type based on the pathname
 * Note: language-country is always present in all paths, so detection focuses on segments after it
 *
 * @param pathname - The URL pathname (e.g., "/en-BE/car-parts", "/en-BE/car-parts/volvo/mf88rz4rfnbqn")
 * @returns The detected page type: "category-catalog" | "category-l1" | "category-l2" | "category-l3" | "search-results" | "product-details" | "checkout" | "saved-addresses"
 *
 * @example
 * detectPage("/en-BE/car-parts") => "category-catalog"
 * detectPage("/en-BE/auto-onderdelen") => "category-catalog"
 * detectPage("/en-BE/car-parts/volvo/mf88rz4rfnbqn") => "product-details"
 * detectPage("/en-BE/ABARTH-500-14-16V") => "search-results"
 */
export function detectPage(
  pathname: string,
):
  | "category-catalog"
  | "category-l1"
  | "category-l2"
  | "category-l3"
  | "search-results"
  | "product-details"
  | "checkout"
  | "saved-addresses"
  | "car-part-brands"
  | "car-part-brand"
  | "car-part-brand-l3" {
  if (!pathname) return "search-results";

  const cleanPathname = (pathname.split("?")[0] ?? "").replace(/\/$/, "");
  const pathSegments = cleanPathname.split("/").filter(Boolean);

  if (pathSegments.includes("saved-addresses")) return "saved-addresses";
  if (pathSegments.includes("checkout")) return "checkout";

  const manufacturersIndex = pathSegments.findIndex((segment) =>
    isKnownManufacturersRouteSegment(segment),
  );
  if (manufacturersIndex !== -1) {
    const after = pathSegments.length - manufacturersIndex - 1;
    if (after >= 2) return "car-part-brand-l3";
    if (after === 1) return "car-part-brand";
    return "car-part-brands";
  }

  const categoryIndex = pathSegments.findIndex((segment) => isKnownPartsRouteSegment(segment));

  if (categoryIndex !== -1) {
    const afterCategory = pathSegments.slice(categoryIndex + 1);

    // Expect patterns like:
    // /{locale}/{parts-segment}/category/{l1-slug}
    // /{locale}/{parts-segment}/categorie/{l1-slug}
    // /{locale}/{parts-segment}/category/{l1-slug}/{l2-slug}
    // /{locale}/{parts-segment}/categorie/{l1-slug}/{l2-slug}
    // /{locale}/{parts-segment}/category/{l1-slug}/{l2-slug}/{l3-slug}
    // /{locale}/{parts-segment}/categorie/{l1-slug}/{l2-slug}/{l3-slug}
    const categorySegment = afterCategory[0];
    if (isCategoryPathSegment(categorySegment) && afterCategory[1]) {
      if (afterCategory[2] && afterCategory[3]) {
        return "category-l3";
      }
      if (afterCategory[2]) {
        return "category-l2";
      }
      return "category-l1";
    }

    const segmentsAfterCategory = pathSegments.length - categoryIndex - 1;
    if (segmentsAfterCategory >= 2) {
      return "product-details";
    }
  }

  if (categoryIndex !== -1 && categoryIndex === pathSegments.length - 1) {
    return "category-catalog";
  }

  return "search-results";
}

/** Category catalog + L1/L2/L3 SEO pages (OD-2300 legacy param 301 scope). */
export function isCategorySeoPage(pathname: string): boolean {
  const page = detectPage(pathname);
  return (
    page === "category-catalog" ||
    page === "category-l1" ||
    page === "category-l2" ||
    page === "category-l3"
  );
}

/**
 * Pages where vehicle apply (banner / sidebar Finish) should only update
 * `carIds` / `vin` on the current path — not navigate to `/car-parts`.
 * Includes catalog L1–L3, PDP, and Car Part Brand SEO pages.
 */
export function shouldStayOnPathAfterCarApply(pathname: string | null | undefined): boolean {
  const page = detectPage(pathname ?? "");
  return (
    page === "category-l1" ||
    page === "category-l2" ||
    page === "category-l3" ||
    page === "product-details" ||
    page === "car-part-brands" ||
    page === "car-part-brand" ||
    page === "car-part-brand-l3"
  );
}

/**
 * True only on product listing routes (SRP / MMT slug), not on locale home (`/en-BE`).
 * `detectPage` returns `"search-results"` for homepage paths — do not use that alone for listing logic.
 */
export function isSearchResultsListingPage(pathname: string | null | undefined): boolean {
  const clean = (pathname?.split("?")[0] ?? "").replace(/\/$/, "");
  const segments = clean.split("/").filter(Boolean);

  if (segments.length === 0) return false;
  if (segments.includes("search-results")) return true;

  const page = detectPage(pathname ?? "");
  if (
    page === "category-catalog" ||
    page === "category-l1" ||
    page === "category-l2" ||
    page === "category-l3" ||
    page === "product-details" ||
    page === "checkout" ||
    page === "saved-addresses" ||
    page === "car-part-brands" ||
    page === "car-part-brand" ||
    page === "car-part-brand-l3"
  ) {
    return false;
  }

  if (page === "search-results") {
    // Locale-only home, e.g. /en-BE
    if (segments.length === 1) return false;
    return true;
  }

  return false;
}
