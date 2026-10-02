import { describe, expect, it } from "vitest";
import {
  getProductImagesForCarousel,
  isCategoryPlaceholderFromUrl,
  isCategoryPlaceholderImage,
  normalizePartImages,
  resolvePartImageDisplay,
  resolvePartImageFromSources,
} from "./partImageUtils";

describe("partImageUtils", () => {
  it("normalizes string and object image entries", () => {
    expect(normalizePartImages(["https://cdn.example.com/a.jpg"])).toEqual([
      { url: "https://cdn.example.com/a.jpg" },
    ]);
    expect(
      normalizePartImages([{ url: "https://cdn.example.com/parts/x.jpg", label: "Front" }]),
    ).toEqual([{ url: "https://cdn.example.com/parts/x.jpg", label: "Front" }]);
  });

  it("detects API category placeholder by label", () => {
    const images = [{ label: "Category", url: "https://cdn.example.com/qverde/cat_004.png" }];
    expect(isCategoryPlaceholderImage(images)).toBe(true);
    expect(resolvePartImageDisplay(images)).toEqual({
      src: "https://cdn.example.com/qverde/cat_004.png",
      isPlaceholder: true,
    });
  });

  it("treats real part images as non-placeholder", () => {
    const images = [{ url: "https://cdn.example.com/parts/a.jpg", label: "Front" }];
    expect(isCategoryPlaceholderImage(images)).toBe(false);
    expect(resolvePartImageDisplay(images)).toEqual({
      src: "https://cdn.example.com/parts/a.jpg",
      isPlaceholder: false,
    });
  });

  it("falls back to category CDN when images array is empty", () => {
    const result = resolvePartImageDisplay([], { categoryId: "004004003" });
    expect(result.isPlaceholder).toBe(true);
    expect(result.src).toContain("cat_004004003");
  });

  it("excludes category placeholder from carousel images", () => {
    const images = [{ label: "Category", url: "https://cdn.example.com/cat.png" }];
    expect(getProductImagesForCarousel(images)).toEqual([]);
  });

  it("detects category placeholder from flat URL", () => {
    expect(isCategoryPlaceholderFromUrl("https://cdn.example.com/qverde/cat_004004003.png")).toBe(
      true,
    );
    expect(isCategoryPlaceholderFromUrl("https://cdn.example.com/parts/x.jpg")).toBe(false);
  });

  it("resolvePartImageFromSources prefers images array over flat url", () => {
    const result = resolvePartImageFromSources({
      images: [{ url: "https://cdn.example.com/parts/a.jpg" }],
      imageUrl: "https://cdn.example.com/qverde/cat_001.png",
    });
    expect(result.isPlaceholder).toBe(false);
    expect(result.src).toBe("https://cdn.example.com/parts/a.jpg");
  });

  it("uses flat imageUrl for order line items when images array is absent", () => {
    const partImage = resolvePartImageFromSources({
      imageUrl: "https://cdn.ottogusto.group/parts/m3hkgy55db7kwn_tn4674.jpg",
      categoryId: null,
    });
    expect(partImage.isPlaceholder).toBe(false);
    expect(partImage.src).toBe("https://cdn.ottogusto.group/parts/m3hkgy55db7kwn_tn4674.jpg");

    const categoryImage = resolvePartImageFromSources({
      imageUrl: "https://cdn.ottogusto.group/qverde/cat_002005002.png",
      categoryId: null,
    });
    expect(categoryImage.isPlaceholder).toBe(true);
    expect(categoryImage.src).toBe("https://cdn.ottogusto.group/qverde/cat_002005002.png");
  });

  it("does not apply empty-array fallback when categoryId is null", () => {
    const result = resolvePartImageFromSources({
      images: undefined,
      imageUrl: null,
      categoryId: null,
    });
    expect(result).toEqual({ src: null, isPlaceholder: false });
  });
});
