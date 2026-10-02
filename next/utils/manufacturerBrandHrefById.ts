import { hasBrandScopedCategories } from "@/services/categoryPageService";
import type { ManufacturerListItem } from "@/services/products";
import { resolveManufacturerBrandHref } from "@/utils/manufacturerBrandHref";

/** SSR map: manufacturer id → landing or SRP href (parallel lightweight Category checks). */
export async function buildManufacturerBrandHrefById(
  languageCountry: string,
  manufacturers: ManufacturerListItem[],
): Promise<Record<string, string>> {
  const pairs = await Promise.all(
    manufacturers.map(async (item) => {
      const hasCategories = await hasBrandScopedCategories(item.id);
      return [item.id, resolveManufacturerBrandHref(languageCountry, item, hasCategories)] as const;
    }),
  );
  return Object.fromEntries(pairs);
}
