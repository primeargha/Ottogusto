import { Routes } from "@/config/routes";
import type { ManufacturerListItem } from "@/services/products";
import { buildBrandEmptyCategoriesSrpHref } from "@/utils/categorySearchUrl";
import { slugifyManufacturerForPdp } from "@/utils/legacyPartPdp";

/**
 * Brand list / homepage tile href:
 * - has brand-scoped categories → clean brand landing
 * - empty `GET /Category?brandId=` → search-results (Other + manufacturerIds)
 */
export function resolveManufacturerBrandHref(
  languageCountry: string,
  item: Pick<ManufacturerListItem, "id" | "name">,
  hasCategories: boolean,
): string {
  if (!hasCategories) {
    return buildBrandEmptyCategoriesSrpHref(languageCountry, item.id);
  }
  const slug = slugifyManufacturerForPdp(item.name);
  return Routes.carPartBrand(languageCountry, slug);
}
