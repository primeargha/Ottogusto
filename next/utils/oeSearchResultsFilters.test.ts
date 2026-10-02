import { describe, expect, it } from "vitest";
import { buildOeSearchResultsFilters } from "./oeSearchResultsFilters";

describe("buildOeSearchResultsFilters", () => {
  it("clears categoryId and carIds, keeps take/order", () => {
    const sp = new URLSearchParams(
      "categoryId=001&carIds=mod8pdkumnduio&take=12&order=priority",
    ) as unknown as import("next/navigation").ReadonlyURLSearchParams;

    const filters = buildOeSearchResultsFilters(sp, "99999", "en-BE");

    expect(filters.oeReference).toBe("99999");
    expect(filters.categoryId).toBeNull();
    expect(filters.carIds).toBeNull();
    expect(filters).not.toHaveProperty("makeModelTypeId");
    expect(filters).not.toHaveProperty("manufacturerTypes");
    expect(filters.take).toBe(12);
    expect(filters.order).toBe("priority");
  });
});
