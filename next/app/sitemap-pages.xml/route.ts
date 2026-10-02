import { PUBLIC_LANG_COUNTRY_COMBINATIONS, CATEGORY_CACHE_TTL_MS } from "@/constants";
import { getManufacturersRouteSegmentForLang } from "@/config/url-segments";
import { fetchCategoryTree, hasBrandScopedCategories } from "@/services/categoryPageService";
import {
  getManufacturer,
  getParts,
  unwrapManufacturerList,
  type ManufacturerListItem,
} from "@/services/products";
import { slugifyManufacturerForPdp } from "@/utils/legacyPartPdp";
import { getCategoryLocaleSlug } from "@/utils/carPartBrandCategories";
import { Routes } from "@/config/routes";
import { type NextRequest } from "next/server";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import type { CategoryNode } from "@/types/categories";

/** Concurrency-limited map — avoids firing hundreds of `getParts` calls at once. */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      await fn(items[current]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/** `${brand.id}::${l3.id}` pairs with at least one product — cached like `fetchCategoryTree`. */
let brandL3PopulationCache: { data: Set<string>; timestamp: number } | null = null;
let brandL3PopulationPending: Promise<void> | null = null;

/**
 * Mutates `populated` live as each pair resolves, so callers reading the shared
 * cache mid-sweep see confirmed pairs immediately — not only once all ~24k
 * brand×L3 checks finish (which can take many minutes).
 */
async function computeBrandL3Population(
  brands: ManufacturerListItem[],
  l3Nodes: CategoryNode[],
  populated: Set<string>,
): Promise<void> {
  const pairs = brands.flatMap((brand) => l3Nodes.map((l3) => ({ brand, l3 })));
  await mapWithConcurrency(pairs, 20, async ({ brand, l3 }) => {
    try {
      const parts = await getParts({
        categoryId: l3.id,
        manufacturerIds: [brand.id],
        take: 1,
        language: 0,
      });
      if ((parts?.data?.parts?.length ?? 0) > 0) {
        populated.add(`${brand.id}::${l3.id}`);
      }
    } catch {
      // API failure → treat as unpopulated; exclude rather than risk indexing an empty page.
    }
  });
}

function getPopulatedBrandL3PairsNonBlocking(
  brands: ManufacturerListItem[],
  l3Nodes: CategoryNode[],
): Set<string> {
  const now = Date.now();
  if (brandL3PopulationCache && now - brandL3PopulationCache.timestamp < CATEGORY_CACHE_TTL_MS) {
    return brandL3PopulationCache.data;
  }
  if (!brandL3PopulationPending) {
    const populated = new Set<string>();
    // Registered before the sweep starts (not after) so readers see confirmed
    // pairs land live, instead of only once the full ~24k-check sweep finishes.
    brandL3PopulationCache = { data: populated, timestamp: now };
    brandL3PopulationPending = computeBrandL3Population(brands, l3Nodes, populated)
      .then(() => {
        brandL3PopulationPending = null;
      })
      .catch((error) => {
        brandL3PopulationPending = null;
        console.error("[sitemap] Brand+L3 population sweep failed:", formatHttpClientError(error));
      });
  }
  return brandL3PopulationCache?.data ?? new Set<string>();
}

/** Fetches live category tree — must not be statically generated. */
export const dynamic = "force-dynamic";

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export async function GET(req: NextRequest) {
  const baseUrl = process.env.FRONTEND_PROD_URL; // Replace with your domain

  // Static routes
  const staticRoutes = [
    "",
    "about-us",
    "support",
    // "support?categoryId=8", /https://dev.ottogusto.com/en-BE/support?categoryId=8
    "support/billing",
    "support/part-query",
    "support/order-issue",
    "support/account",
    "support/shipping",
    "support/return-query",
    "support/complaints",
    "support/other",
    // "garage-bay/",  // Removed for 2 Weeks
    // "og-search/",      // Permanently removed
  ];

  const allRoutes = [...staticRoutes];

  // Create Language and country code combinations (static routes only)
  const langCountryRoutes: string[] = [];
  PUBLIC_LANG_COUNTRY_COMBINATIONS?.map((code) => {
    allRoutes?.map((route) => {
      langCountryRoutes.push(`${code}${route == "" ? "" : "/" + route}`);
    });
  });

  // L1 and L2 category routes: path already includes locale, push directly (no double locale)
  try {
    const tree = await fetchCategoryTree();
    for (const l1 of tree) {
      for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
        const lang = locale.split("-")[0] || "en";
        const slug = (l1.slugs && l1.slugs[lang]) || l1.name?.toLowerCase();
        if (slug) {
          const path = Routes.categoryL1(locale, slug);
          langCountryRoutes.push(path.replace(/^\//, ""));
        }
      }
    }
    for (const l1 of tree) {
      for (const l2 of l1.children ?? []) {
        for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
          const lang = locale.split("-")[0] || "en";
          const l1Slug = (l1.slugs && l1.slugs[lang]) || l1.name?.toLowerCase();
          const l2Slug = (l2.slugs && l2.slugs[lang]) || l2.name?.toLowerCase();
          if (l1Slug && l2Slug) {
            const path = Routes.categoryL2(locale, l1Slug, l2Slug);
            langCountryRoutes.push(path.replace(/^\//, ""));
          }
        }
      }
      for (const l2 of l1.children ?? []) {
        for (const l3 of l2.children ?? []) {
          for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
            const lang = locale.split("-")[0] || "en";
            const l1Slug = (l1.slugs && l1.slugs[lang]) || l1.name?.toLowerCase();
            const l2Slug = (l2.slugs && l2.slugs[lang]) || l2.name?.toLowerCase();
            const l3Slug = (l3.slugs && l3.slugs[lang]) || l3.name?.toLowerCase();
            if (l1Slug && l2Slug && l3Slug) {
              const path = Routes.categoryL3(locale, l1Slug, l2Slug, l3Slug);
              langCountryRoutes.push(path.replace(/^\//, ""));
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[sitemap] Failed to fetch category tree:", formatHttpClientError(error));
  }

  // Car Part Brand pages (OD-2340: only when brand has scoped categories)
  // and Car Part Brand + L3 pages (OD-2433: only when populated with products).
  try {
    const brands = unwrapManufacturerList(await getManufacturer());
    const tree = await fetchCategoryTree();
    const l3ById = new Map<string, CategoryNode>();
    for (const l1 of tree) {
      for (const l2 of l1.children ?? []) {
        for (const l3 of l2.children ?? []) {
          if (l3?.id && !l3ById.has(l3.id)) l3ById.set(l3.id, l3);
        }
      }
    }
    const l3Nodes = Array.from(l3ById.values());

    const brandHasCategories = new Map<string, boolean>();
    await Promise.all(
      brands.map(async (brand) => {
        brandHasCategories.set(brand.id, await hasBrandScopedCategories(brand.id));
      }),
    );

    const brandSlugs = new Map<string, string>();
    for (const brand of brands) {
      const brandSlug = slugifyManufacturerForPdp(brand.name);
      if (!brandSlug) continue;
      brandSlugs.set(brand.id, brandSlug);
      if (!brandHasCategories.get(brand.id)) continue;
      for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
        langCountryRoutes.push(Routes.carPartBrand(locale, brandSlug).replace(/^\//, ""));
      }
    }

    const populatedPairs = getPopulatedBrandL3PairsNonBlocking(brands, l3Nodes);
    for (const brand of brands) {
      const brandSlug = brandSlugs.get(brand.id);
      if (!brandSlug) continue;
      for (const l3 of l3Nodes) {
        if (!populatedPairs.has(`${brand.id}::${l3.id}`)) continue;
        for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
          const lang = locale.split("-")[0] || "en";
          const l3Slug = getCategoryLocaleSlug(l3, lang);
          if (!l3Slug) continue;
          langCountryRoutes.push(
            Routes.carPartBrandL3(locale, brandSlug, l3Slug).replace(/^\//, ""),
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "[sitemap] Failed to build brand / brand+L3 routes:",
      formatHttpClientError(error),
    );
  }

  // Static category Routes for each locale
  langCountryRoutes.push(`en-BE/car-parts`);
  langCountryRoutes.push(`en-NL/car-parts`);
  langCountryRoutes.push(`en-FR/car-parts`);
  langCountryRoutes.push(`en-LU/car-parts`);

  langCountryRoutes.push(`fr-BE/pieces-auto`);
  langCountryRoutes.push(`fr-NL/pieces-auto`);
  langCountryRoutes.push(`fr-FR/pieces-auto`);
  langCountryRoutes.push(`fr-LU/pieces-auto`);

  langCountryRoutes.push(`nl-BE/auto-onderdelen`);
  langCountryRoutes.push(`nl-NL/auto-onderdelen`);
  langCountryRoutes.push(`nl-FR/auto-onderdelen`);
  langCountryRoutes.push(`nl-LU/auto-onderdelen`);

  langCountryRoutes.push(`de-BE/autoteile`);
  langCountryRoutes.push(`de-NL/autoteile`);
  langCountryRoutes.push(`de-FR/autoteile`);
  langCountryRoutes.push(`de-LU/autoteile`);

  for (const locale of PUBLIC_LANG_COUNTRY_COMBINATIONS) {
    const manufacturersSeg = getManufacturersRouteSegmentForLang(locale);
    langCountryRoutes.push(`${locale}/${manufacturersSeg}`);
  }

  // Start XML Sitemap stream as it could be a large XML Data
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`,
        ),
      );

      const uniqueRoutes = Array.from(new Set(langCountryRoutes));

      for (const route of uniqueRoutes) {
        const loc = escapeXml(`${baseUrl}/${route}`);
        const xml = `
            <url>
                <loc>${loc}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>\n`;
        controller.enqueue(encoder.encode(xml));
      }

      controller.enqueue(encoder.encode(`</urlset>`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/xml",
    },
    status: 200,
  });
}
