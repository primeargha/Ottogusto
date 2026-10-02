import {
  containsUnresolvedLabelPlaceholders,
  safeNextLinkHref,
} from "@/utils/translationDisplayMode";

export const normalizeFooterPath = (
  rawPath: string | null | undefined,
  languageCountry: string,
): string => {
  let path = (rawPath ?? "").toString().trim();

  if (containsUnresolvedLabelPlaceholders(path)) {
    const home = languageCountry ? `/${languageCountry}` : "/";
    return safeNextLinkHref(home, "#");
  }

  // Replace [locale] or [local] placeholders with the current language-country
  if (languageCountry) {
    path = path.replace(/\[(?:locale|local)\]/gi, languageCountry);
  }

  // If Cockpit stores a full URL, drop the origin so we always stay on the
  // current host (prod vs dev) and keep only the path + query + hash.
  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      path = `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    } catch {
      path = "/";
    }
  }

  // Ensure we always return at least a leading slash
  if (!path) {
    return "/";
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return safeNextLinkHref(path, languageCountry ? `/${languageCountry}` : "#");
};

/** Footer explore links that belong to Featured Makes / all-brands discovery. */
export function isFeaturedMakesDiscoveryFooterLink(
  item: { textKey: string; urlKey: string },
  href: string,
): boolean {
  if (href.includes("/allbrands")) return true;
  if (item.textKey === "footer_link_1") return true;
  return false;
}
