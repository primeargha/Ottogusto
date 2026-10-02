import { HERO_CAROUSEL_IMAGE_SEARCH } from "@/screens/landing/heroCarouselImage";
import { getCategoryImageUrl, getImageUrl } from "@/utils/imageUtils";

/** CDN URL for homepage hero carousel slide 1 (must match HeroCard2 + preload). */
export function getHomeHeroLcpImageUrl(): string {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "https://cdn.ottogusto.group";
  const storeFolder = process.env.NEXT_PUBLIC_STORE || "ottogusto";
  return `${cdnBase}/${storeFolder}/hero_001.jpg${HERO_CAROUSEL_IMAGE_SEARCH}`;
}

/** Category description hero image — same params as CategoryDescription. */
export function getCategoryLcpImageUrl(categoryId: string): string {
  return getCategoryImageUrl(categoryId, { width: 560, quality: 80 });
}

/** PDP main image URL for preload (first product image). */
export function getProductLcpImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const resolved = getImageUrl(imageUrl);
  if (!resolved || resolved.includes("Frame.svg")) return null;
  return resolved;
}
