import { describe, expect, it } from "vitest";
import { resolveManufacturerBrandHref } from "./manufacturerBrandHref";

describe("resolveManufacturerBrandHref", () => {
  it("uses brand landing when categories exist", () => {
    expect(resolveManufacturerBrandHref("en-BE", { id: "abc", name: "Fiat Group" }, true)).toBe(
      "/en-BE/car-parts-brands/fiat-group",
    );
  });

  it("uses Other + manufacturerIds SRP when categories are empty", () => {
    expect(
      resolveManufacturerBrandHref("en-BE", { id: "gpGujipGujipGu", name: "Aisin" }, false),
    ).toBe(
      "/en-BE/search-results?categoryId=000000000&take=12&order=priority&manufacturerIds=gpGujipGujipGu",
    );
  });
});
