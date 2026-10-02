/**
 * OD-2300: SEO/crawler helpers for vehicle / brand-manufacturer query params in public URLs.
 * User-facing `<Link href>` values are unchanged except where emitters migrate to `carIds`.
 *
 * `brandId` = part-brand manufacturer id (Brand+L3). `carId` kept briefly for legacy links.
 * `carIds` = vehicle. Do not confuse the three.
 */

/** Query keys stripped from JSON-LD breadcrumb schema (crawlers see clean URLs). */
const CRAWLER_STRIP_PARAM_KEYS = ["carIds", "brandId", "carId", "vin", "makeModelTypeId"] as const;

function parseHrefParts(href: string): { pathname: string; search: string; hash: string } {
  const hashIndex = href.indexOf("#");
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const qIndex = withoutHash.indexOf("?");
  const pathname = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  const search = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "";
  return { pathname, search, hash };
}

function stripParamsFromSearchString(search: string, stripKeys: readonly string[]): string {
  if (!search) return "";
  const params = new URLSearchParams(search);
  for (const key of stripKeys) {
    params.delete(key);
  }
  if (params.get("from") === "brand") {
    params.delete("from");
  }
  return params.toString();
}

/** True when breadcrumb link should use `rel="nofollow"` (vehicle / brand-manufacturer params). */
export function shouldNofollowBreadcrumbHref(href: string): boolean {
  if (!href || href === "#") return false;
  const { search } = parseHrefParts(href);
  if (!search) return false;
  const params = new URLSearchParams(search);
  if (params.has("carIds")) return true;
  if (params.has("brandId")) return true;
  if (params.has("carId")) return true;
  if (params.has("vin")) return true;
  if (params.has("makeModelTypeId")) return true;
  if (params.get("from") === "brand") return true;
  return false;
}

/** Clean href for JSON-LD `BreadcrumbList` `item` URLs (no vehicle / brandId context params). */
export function cleanHrefForBreadcrumbSchema(href: string): string {
  if (!href || href === "#") return href;
  const { pathname, search, hash } = parseHrefParts(href);
  const qs = stripParamsFromSearchString(search, CRAWLER_STRIP_PARAM_KEYS);
  return qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;
}

/** Strip legacy category SEO params; returns true if anything was removed. */
export function stripLegacyCategorySeoParams(params: URLSearchParams): boolean {
  let changed = false;
  if (params.has("makeModelTypeId")) {
    params.delete("makeModelTypeId");
    changed = true;
  }
  if (params.get("from") === "brand") {
    params.delete("from");
    changed = true;
  }
  return changed;
}

/** Preserve `carIds` / `brandId` and other keys; drop retired `makeModelTypeId` / `from=brand` on locale switch. */
export function sanitizeLocaleSwitchQueryString(search: string): string {
  if (!search) return "";
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  stripLegacyCategorySeoParams(params);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
