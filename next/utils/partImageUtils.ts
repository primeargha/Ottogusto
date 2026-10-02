import { getCategoryImageUrl } from "@/utils/imageUtils";

export type PartImageItem = {
  order?: number;
  url?: string;
  label?: string;
  type?: string;
  hash?: string;
};

export const CATEGORY_PLACEHOLDER_LABEL = "Category";

type ResolvePartImageOptions = {
  /** First category id (9 chars) — used when images array is empty (legacy fallback). */
  categoryId?: string | null;
  /** CDN query params for frontend-built category fallback only. */
  categoryImageOptions?: { width?: number; height?: number; quality?: number };
};

export function normalizePartImages(images: unknown): PartImageItem[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((item): PartImageItem | null => {
      if (item == null) return null;
      if (typeof item === "string" && item.trim()) {
        return { url: item };
      }
      if (
        typeof item === "object" &&
        "url" in item &&
        typeof (item as PartImageItem).url === "string"
      ) {
        return item as PartImageItem;
      }
      return null;
    })
    .filter((item): item is PartImageItem => item != null && Boolean(item.url?.trim()));
}

export function isCategoryPlaceholderImage(images: unknown): boolean {
  const first = normalizePartImages(images)[0];
  if (!first) return false;
  return first.label === CATEGORY_PLACEHOLDER_LABEL;
}

/** When only a flat image URL is available (cart/order APIs). */
export function isCategoryPlaceholderFromUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\/cat_\d+\.png/i.test(url);
}

function hasCategoryIdForFallback(categoryId?: string | null): categoryId is string {
  return typeof categoryId === "string" && categoryId.length > 0;
}

function resolveEmptyImagesFallback(
  categoryId?: string | null,
  options?: ResolvePartImageOptions,
): string {
  const id = categoryId?.slice(0, 9) || "001001";
  return getCategoryImageUrl(id, options?.categoryImageOptions);
}

/**
 * Resolves display src and whether to show the grayed "NO IMAGE AVAILABLE" overlay.
 * - Real part images: isPlaceholder false
 * - API category placeholder (label "Category"): isPlaceholder true, src from API
 * - Empty images[]: frontend category fallback, isPlaceholder true
 */
export function resolvePartImageDisplay(
  images: unknown,
  options: ResolvePartImageOptions = {},
): { src: string | null; isPlaceholder: boolean } {
  const normalized = normalizePartImages(images);

  if (normalized.length === 0) {
    if (hasCategoryIdForFallback(options.categoryId)) {
      return {
        src: resolveEmptyImagesFallback(options.categoryId, options),
        isPlaceholder: true,
      };
    }
    return { src: null, isPlaceholder: false };
  }

  const first = normalized[0]!;
  const isPlaceholder = first.label === CATEGORY_PLACEHOLDER_LABEL;

  return {
    src: first.url ?? null,
    isPlaceholder,
  };
}

export function getProductImagesForCarousel(images: unknown): PartImageItem[] {
  return normalizePartImages(images).filter((img) => img.label !== CATEGORY_PLACEHOLDER_LABEL);
}

export function resolvePartImageFromSources(sources: {
  images?: unknown;
  imageUrl?: string | null;
  categoryId?: string | null;
  categoryImageOptions?: ResolvePartImageOptions["categoryImageOptions"];
}): { src: string | null; isPlaceholder: boolean } {
  const normalized = normalizePartImages(sources.images);

  // 1. Part API images[] (product cards, PDP, cart product.images)
  if (normalized.length > 0) {
    const displayOptions: ResolvePartImageOptions = {};
    if (sources.categoryImageOptions !== undefined) {
      displayOptions.categoryImageOptions = sources.categoryImageOptions;
    }
    return resolvePartImageDisplay(sources.images, displayOptions);
  }

  // 2. Flat image string (order/return line items, calculate API item.image)
  const flatUrl = sources.imageUrl?.trim();
  if (flatUrl) {
    return {
      src: flatUrl,
      isPlaceholder: isCategoryPlaceholderFromUrl(flatUrl),
    };
  }

  // 3. Legacy fallback when images[] is empty and no flat URL
  if (hasCategoryIdForFallback(sources.categoryId)) {
    const fallbackOptions: ResolvePartImageOptions = { categoryId: sources.categoryId };
    if (sources.categoryImageOptions !== undefined) {
      fallbackOptions.categoryImageOptions = sources.categoryImageOptions;
    }
    return {
      src: resolveEmptyImagesFallback(sources.categoryId, fallbackOptions),
      isPlaceholder: true,
    };
  }

  return { src: null, isPlaceholder: false };
}
