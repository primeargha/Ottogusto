import type { CategoryNode } from "@/types/categories";
import { slugifyManufacturerForPdp } from "@/utils/legacyPartPdp";

/** Localized path slug for a category node (prefer backend `slugs[lang]`). */
export function getCategoryLocaleSlug(category: CategoryNode, lang: string): string {
  const fromSlugs = category.slugs?.[lang] || category.slugs?.en;
  if (fromSlugs) return fromSlugs;
  const title = category.titles?.[lang] || category.titles?.en || category.name || "";
  return slugifyManufacturerForPdp(title);
}

/**
 * Flatten all L3s under an L1 (via L2 children), skipping L2 UI.
 * Dedupes by L3 id when the same L3 appears under multiple L2s.
 */
export function collectL3UnderL1(l1: CategoryNode): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  for (const l2 of l1.children ?? []) {
    for (const l3 of l2.children ?? []) {
      if (!l3?.id || byId.has(l3.id)) continue;
      byId.set(l3.id, l3);
    }
  }
  return Array.from(byId.values());
}

/**
 * Find an L3 anywhere in the tree by localized slug (brand+L3 URLs omit L1/L2).
 */
export function findL3ByLocaleSlug(
  tree: CategoryNode[],
  l3Slug: string,
  locale: string,
): { l1: CategoryNode; l2: CategoryNode; l3: CategoryNode } | null {
  const normalized = (l3Slug || "").trim().toLowerCase();
  if (!normalized) return null;

  for (const l1 of tree) {
    for (const l2 of l1.children ?? []) {
      for (const l3 of l2.children ?? []) {
        const slug = (l3.slugs?.[locale] || l3.slugs?.en || "").toLowerCase();
        if (slug && slug === normalized) {
          return { l1, l2, l3 };
        }
        // Fallback: slugify name/title when slugs map is empty for this locale
        const fallback = getCategoryLocaleSlug(l3, locale).toLowerCase();
        if (fallback === normalized) {
          return { l1, l2, l3 };
        }
      }
    }
  }
  return null;
}

/** Sibling L3s under the same L1 (for “People also looked”), excluding `excludeL3Id`. */
export function collectRelatedL3sUnderL1(
  l1: CategoryNode,
  excludeL3Id: string,
  limit = 8,
): CategoryNode[] {
  return collectL3UnderL1(l1)
    .filter((l3) => l3.id !== excludeL3Id)
    .slice(0, limit);
}

export function sortCategoriesByDisplayOrder(nodes: CategoryNode[]): CategoryNode[] {
  return [...nodes].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}
