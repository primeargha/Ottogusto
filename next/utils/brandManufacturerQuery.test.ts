import { describe, expect, it } from "vitest";
import {
  buildBrandL3HrefWithVehicleOnly,
  getBrandManufacturerIdFromSearchParams,
  hasBrandManufacturerQuery,
  hasLegacyBrandManufacturerQueryOnly,
} from "./brandManufacturerQuery";

describe("getBrandManufacturerIdFromSearchParams", () => {
  it("prefers brandId over legacy carId", () => {
    const sp = new URLSearchParams("brandId=new&carId=legacy");
    expect(getBrandManufacturerIdFromSearchParams(sp)).toBe("new");
  });

  it("falls back to carId when brandId missing", () => {
    const sp = new URLSearchParams("carId=legacy");
    expect(getBrandManufacturerIdFromSearchParams(sp)).toBe("legacy");
  });

  it("returns null when neither present", () => {
    expect(getBrandManufacturerIdFromSearchParams(new URLSearchParams("carIds=v1"))).toBeNull();
  });
});

describe("hasBrandManufacturerQuery", () => {
  it("is true when brandId or legacy carId is set", () => {
    expect(hasBrandManufacturerQuery(new URLSearchParams("brandId=x"))).toBe(true);
    expect(hasBrandManufacturerQuery(new URLSearchParams("carId=x"))).toBe(true);
  });

  it("is false for vehicle-only query", () => {
    expect(hasBrandManufacturerQuery(new URLSearchParams("carIds=v1&vin=ABC"))).toBe(false);
  });
});

describe("hasLegacyBrandManufacturerQueryOnly", () => {
  it("is true when only carId is set", () => {
    expect(hasLegacyBrandManufacturerQueryOnly(new URLSearchParams("carId=x"))).toBe(true);
  });

  it("is false when brandId is set", () => {
    expect(hasLegacyBrandManufacturerQueryOnly(new URLSearchParams("brandId=x&carId=y"))).toBe(
      false,
    );
  });
});

describe("buildBrandL3HrefWithVehicleOnly", () => {
  it("returns clean path when no vehicle", () => {
    expect(buildBrandL3HrefWithVehicleOnly("/en-BE/car-parts-brands/bosch/air-filter")).toBe(
      "/en-BE/car-parts-brands/bosch/air-filter",
    );
  });

  it("keeps carIds and vin only", () => {
    expect(
      buildBrandL3HrefWithVehicleOnly("/en-BE/car-parts-brands/bosch/air-filter", {
        carIds: ["v1", "v2"],
        vin: "VF7SABHY6GW595849",
      }),
    ).toBe("/en-BE/car-parts-brands/bosch/air-filter?carIds=v1%2Cv2&vin=VF7SABHY6GW595849");
  });
});
