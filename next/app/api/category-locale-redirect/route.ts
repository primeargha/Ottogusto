import { NextRequest, NextResponse } from "next/server";
import { detectPage } from "@/utils/detectPage";
import {
  fetchCategoryTree,
  findL1BySlug,
  findL2BySlug,
  findL3BySlug,
} from "@/services/categoryPageService";
import { Routes } from "@/config/routes";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import {
  isCategoryPathSegment,
  isKnownManufacturersRouteSegment,
  isKnownPartsRouteSegment,
} from "@/config/url-segments";
import { findL3ByLocaleSlug, getCategoryLocaleSlug } from "@/utils/carPartBrandCategories";
import { stripLegacyCategorySeoParams } from "@/utils/seoUrlParams";

function stripLeadingSlash(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

function swapLocale(pathname: string, toLocale: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${toLocale}`;
  segments[0] = toLocale;
  return `/${segments.join("/")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromPath = searchParams.get("fromPath");
  const toLocale = searchParams.get("toLocale");

  if (!fromPath || !toLocale) {
    return NextResponse.json({ redirectPath: fromPath ?? "/" });
  }

  try {
    const [rawPathname, rawSearch = ""] = fromPath.split("?");
    const pathname = rawPathname || "/";
    const legacyParams = new URLSearchParams(rawSearch);
    stripLegacyCategorySeoParams(legacyParams);
    const cleanedSearch = legacyParams.toString();
    const search = cleanedSearch ? `?${cleanedSearch}` : "";

    const pathSegments = pathname.split("/").filter(Boolean);
    const currentLocale = pathSegments[0] || "";
    const currentLang = currentLocale.split("-")[0] || "en";
    const targetLang = toLocale.split("-")[0] || "en";

    const pageType = detectPage(pathname);

    // Category pages: locale swap + preserve query string
    if (pageType === "car-part-brand-l3") {
      const manufacturersIndex = pathSegments.findIndex((segment) =>
        isKnownManufacturersRouteSegment(segment),
      );
      const afterManufacturers =
        manufacturersIndex !== -1 ? pathSegments.slice(manufacturersIndex + 1) : [];
      const brandSlug = afterManufacturers[0];
      const l3Slug = afterManufacturers[1];

      if (brandSlug && l3Slug) {
        const tree = await fetchCategoryTree();
        const match = findL3ByLocaleSlug(tree, l3Slug, currentLang);
        if (match) {
          const targetL3Slug = getCategoryLocaleSlug(match.l3, targetLang);
          const localizedPath = Routes.carPartBrandL3(toLocale, brandSlug, targetL3Slug);
          return NextResponse.json({ redirectPath: `${localizedPath}${search}` });
        }
      }

      const base = swapLocale(pathname, toLocale);
      return NextResponse.json({ redirectPath: `${base}${search}` });
    }

    // Non-category pages: simple locale swap + preserve query string
    if (
      pageType === "search-results" ||
      pageType === "product-details" ||
      pageType === "category-catalog"
    ) {
      const base = swapLocale(pathname, toLocale);
      return NextResponse.json({ redirectPath: `${base}${search}` });
    }

    const categoryIndex = pathSegments.findIndex((segment) => isKnownPartsRouteSegment(segment));

    if (categoryIndex === -1) {
      const base = swapLocale(pathname, toLocale);
      return NextResponse.json({ redirectPath: `${base}${search}` });
    }

    const afterCategory = pathSegments.slice(categoryIndex + 1);
    const partsSegment = pathSegments[categoryIndex];

    const categorySegment = afterCategory[0];
    if (!isCategoryPathSegment(categorySegment)) {
      const base = swapLocale(pathname, toLocale);
      return NextResponse.json({ redirectPath: `${base}${search}` });
    }

    const l1Slug = afterCategory[1];
    const l2Slug = afterCategory[2];
    const l3Slug = afterCategory[3];

    const tree = await fetchCategoryTree();

    let localizedPath: string | null = null;

    if (pageType === "category-l1" && l1Slug) {
      const l1 = findL1BySlug(tree, l1Slug, currentLang);
      if (l1) {
        const targetL1Slug = (l1.slugs && l1.slugs[targetLang]) || l1.name || l1Slug;
        localizedPath = Routes.categoryL1(toLocale, targetL1Slug);
      }
    } else if (pageType === "category-l2" && l1Slug && l2Slug) {
      const result = findL2BySlug(tree, l1Slug, l2Slug, currentLang);
      if (result) {
        const { l1, l2 } = result;
        const targetL1Slug = (l1.slugs && l1.slugs[targetLang]) || l1.name || l1Slug;
        const targetL2Slug = (l2.slugs && l2.slugs[targetLang]) || l2.name || l2Slug;
        localizedPath = Routes.categoryL2(toLocale, targetL1Slug, targetL2Slug);
      }
    } else if (pageType === "category-l3" && l1Slug && l2Slug && l3Slug) {
      const result = findL3BySlug(tree, l1Slug, l2Slug, l3Slug, currentLang);
      if (result) {
        const { l1, l2, l3 } = result;
        const targetL1Slug = (l1.slugs && l1.slugs[targetLang]) || l1.name || l1Slug;
        const targetL2Slug = (l2.slugs && l2.slugs[targetLang]) || l2.name || l2Slug;
        const targetL3Slug = (l3.slugs && l3.slugs[targetLang]) || l3.name || l3Slug;
        localizedPath = Routes.categoryL3(toLocale, targetL1Slug, targetL2Slug, targetL3Slug);
      }
    }

    if (!localizedPath) {
      const base = swapLocale(pathname, toLocale);
      return NextResponse.json({ redirectPath: `${base}${search}` });
    }

    return NextResponse.json({ redirectPath: `${localizedPath}${search}` });
  } catch (error) {
    console.error("[category-locale-redirect] Error:", formatHttpClientError(error));
    return NextResponse.json({ redirectPath: fromPath });
  }
}
