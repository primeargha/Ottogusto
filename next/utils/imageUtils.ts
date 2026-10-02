import noImage from "@/assets/Frame.svg";

/**
 * Utility function to handle different image URL formats from API responses
 * @param imageUrl - The image URL from the API response
 * @returns A properly formatted image URL or the default noImage fallback
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  // If imageUrl is null or undefined, return the default noImage
  if (!imageUrl) {
    return noImage.src;
  }

  // If imageUrl already contains the full CDN URL, return as is
  if (imageUrl.startsWith("https://cdn.ottogusto.group/")) {
    return imageUrl;
  }

  // If imageUrl starts with "/", it's a relative path, prepend the CDN base URL
  if (imageUrl.startsWith("/")) {
    return `https://cdn.ottogusto.group${imageUrl}`;
  }

  // For any other format, return the default noImage
  return noImage.src;
}

const DEFAULT_CDN_BASE_URL = "https://cdn.ottogusto.group";
const DEFAULT_STORE = "ottogusto";

function resolveStoreSlug() {
  return process.env.STORE || process.env.NEXT_PUBLIC_STORE || DEFAULT_STORE;
}

function resolveCdnBaseUrl() {
  return process.env.NEXT_PUBLIC_CDN_BASE_URL || DEFAULT_CDN_BASE_URL;
}

type CategoryImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
};

/**
 * Builds a category image URL using the configured store.
 * - Client components should rely on NEXT_PUBLIC_STORE
 * - Server components can rely on STORE
 */
export function getCategoryImageUrl(
  categoryId: string,
  options: CategoryImageOptions = {},
): string {
  const { width, height, quality } = options;
  const params = new URLSearchParams();

  if (typeof width === "number") params.set("width", String(width));
  if (typeof height === "number") params.set("height", String(height));
  if (typeof quality === "number") params.set("quality", String(quality));

  const query = params.toString();
  const basePath = `${resolveCdnBaseUrl()}/${resolveStoreSlug()}/cat_${categoryId}.png`;
  return query ? `${basePath}?${query}` : basePath;
}
