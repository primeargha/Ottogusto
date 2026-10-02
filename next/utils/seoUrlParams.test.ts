import { describe, expect, it } from "vitest";

import {
  cleanHrefForBreadcrumbSchema,
  sanitizeLocaleSwitchQueryString,
  shouldNofollowBreadcrumbHref,
  stripLegacyCategorySeoParams,
} from "./seoUrlParams";

describe("shouldNofollowBreadcrumbHref", () => {
  it("returns true for brandId part-brand manufacturer id", () => {
    expect(shouldNofollowBreadcrumbHref("/en-BE/car-parts-brands/bosch?brandId=abc")).toBe(true);
  });

  it("returns true for legacy carId brand manufacturer id", () => {
    expect(shouldNofollowBreadcrumbHref("/en-BE/car-parts-brands/bosch?carId=abc")).toBe(true);
  });

  it("returns true for vin", () => {
    expect(shouldNofollowBreadcrumbHref("/en-BE/car-parts?vin=VF7SABHY6GW595849")).toBe(true);
  });

  it("returns true for makeModelTypeId", () => {
    expect(shouldNofollowBreadcrumbHref("/en-BE/car-parts?makeModelTypeId=001")).toBe(true);
  });

  it("returns false for clean href", () => {
    expect(shouldNofollowBreadcrumbHref("/en-BE/car-parts")).toBe(false);
  });
});

describe("cleanHrefForBreadcrumbSchema", () => {
  it("strips carIds, brandId, carId, vin and makeModelTypeId", () => {
    expect(
      cleanHrefForBreadcrumbSchema(
        "/en-BE/car-parts-brands/bosch?brandId=id1&carId=legacy&carIds=a&vin=VF7&makeModelTypeId=b&foo=1",
      ),
    ).toBe("/en-BE/car-parts-brands/bosch?foo=1");
  });

  it("strips from=brand", () => {
    expect(cleanHrefForBreadcrumbSchema("/en-BE/car-parts?from=brand")).toBe("/en-BE/car-parts");
  });
});

describe("stripLegacyCategorySeoParams", () => {
  it("removes makeModelTypeId and from=brand", () => {
    const params = new URLSearchParams("makeModelTypeId=001&from=brand&carIds=x");
    expect(stripLegacyCategorySeoParams(params)).toBe(true);
    expect(params.toString()).toBe("carIds=x");
  });
});

describe("sanitizeLocaleSwitchQueryString", () => {
  it("preserves carIds and brandId; drops makeModelTypeId", () => {
    expect(sanitizeLocaleSwitchQueryString("?carIds=a&brandId=mfr&makeModelTypeId=b")).toBe(
      "?carIds=a&brandId=mfr",
    );
  });
});
