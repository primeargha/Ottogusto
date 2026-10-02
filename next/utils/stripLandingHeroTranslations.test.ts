import { describe, expect, it } from "vitest";
import {
  detectPage,
  isSearchResultsListingPage,
  shouldStayOnPathAfterCarApply,
} from "./detectPage";
import {
  isLandingHeroTranslationKey,
  stripLandingHeroTranslations,
} from "./stripLandingHeroTranslations";

describe("stripLandingHeroTranslations", () => {
  it("matches API and code hero key variants", () => {
    expect(isLandingHeroTranslationKey("landing_page_hero_image1")).toBe(true);
    expect(isLandingHeroTranslationKey("landing_page_hero_image_1")).toBe(true);
    expect(isLandingHeroTranslationKey("hero_title_3")).toBe(true);
    expect(isLandingHeroTranslationKey("hero_body_2")).toBe(true);
    expect(isLandingHeroTranslationKey("hero_url_5")).toBe(true);
    expect(isLandingHeroTranslationKey("footer_link_1")).toBe(false);
    expect(isLandingHeroTranslationKey("ribbon_url_01")).toBe(false);
    expect(isLandingHeroTranslationKey("pit_stop")).toBe(false);
  });

  it("removes hero keys and keeps other labels", () => {
    const input = {
      pit_stop: "Home",
      landing_page_hero_image1: "https://cdn.ottogusto.group/ottogusto/hero_001.jpg",
      hero_title_1: "Take Back The Tools",
      hero_body_1: "Expert knowledge",
      footer_link_1: "Shop By Car Brands",
    };

    expect(stripLandingHeroTranslations(input)).toEqual({
      pit_stop: "Home",
      footer_link_1: "Shop By Car Brands",
    });
  });

  it("returns null/undefined unchanged", () => {
    expect(stripLandingHeroTranslations(null)).toBe(null);
    expect(stripLandingHeroTranslations(undefined)).toBe(undefined);
  });
});

describe("detectPage product-details", () => {
  it("classifies PDP paths used for translation stripping", () => {
    expect(detectPage("/en-BE/car-parts/fiat-group-cover/abc123")).toBe("product-details");
    expect(detectPage("/nl-BE/auto-onderdelen/volvo/xyz")).toBe("product-details");
    expect(detectPage("/en-BE")).not.toBe("product-details");
    expect(detectPage("/en-BE/car-parts/category/engine")).not.toBe("product-details");
  });
});

describe("isSearchResultsListingPage", () => {
  it("treats locale home as not listing (Phase 4b catalog redirect)", () => {
    expect(detectPage("/en-BE")).toBe("search-results");
    expect(isSearchResultsListingPage("/en-BE")).toBe(false);
    expect(isSearchResultsListingPage("/en-BE/")).toBe(false);
  });

  it("treats explicit search-results as listing", () => {
    expect(isSearchResultsListingPage("/en-BE/search-results")).toBe(true);
    expect(isSearchResultsListingPage("/en-BE/search-results?carIds=abc")).toBe(true);
  });

  it("treats car-parts catalog as not listing", () => {
    expect(isSearchResultsListingPage("/en-BE/car-parts")).toBe(false);
    expect(isSearchResultsListingPage("/nl-BE/auto-onderdelen")).toBe(false);
  });

  it("treats car part brands list as not listing", () => {
    expect(detectPage("/en-BE/car-parts-brands")).toBe("car-part-brands");
    expect(isSearchResultsListingPage("/en-BE/car-parts-brands")).toBe(false);
    expect(detectPage("/nl-BE/auto-onderdelen-merken")).toBe("car-part-brands");
  });
});

describe("shouldStayOnPathAfterCarApply", () => {
  it("stays on catalog L1–L3 and PDP", () => {
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts/category/engine")).toBe(true);
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts/category/engine/filters")).toBe(true);
    expect(
      shouldStayOnPathAfterCarApply("/en-BE/car-parts/category/engine/filters/oil-filter"),
    ).toBe(true);
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts/fiat-group/abc123")).toBe(true);
  });

  it("stays on car part brand SEO pages", () => {
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts-brands")).toBe(true);
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts-brands/fiat-group")).toBe(true);
    expect(
      shouldStayOnPathAfterCarApply("/en-BE/car-parts-brands/fiat-group/oil-filter?brandId=x"),
    ).toBe(true);
    expect(shouldStayOnPathAfterCarApply("/nl-BE/auto-onderdelen-merken/bosch")).toBe(true);
  });

  it("does not stay on homepage or car-parts catalog hub", () => {
    expect(shouldStayOnPathAfterCarApply("/en-BE")).toBe(false);
    expect(shouldStayOnPathAfterCarApply("/en-BE/car-parts")).toBe(false);
    expect(shouldStayOnPathAfterCarApply("/en-BE/search-results")).toBe(false);
  });
});
