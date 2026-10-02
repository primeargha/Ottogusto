import { describe, expect, it } from "vitest";

import {
  appendCategorySearchQuery,
  appendCurrentVehicleQueryToHref,
  appendNavigationCarIdsToPartsHref,
  appendVehicleContextToHref,
  buildBrandEmptyCategoriesSrpHref,
  buildCategorySearchQueryString,
  buildPartsCatalogUrl,
  getCarIdsFromSearchParams,
  getCategoryIdFromSearchParams,
  pickPrimaryCategoryId,
  resolveNavigationCarIds,
  resolveNavigationVin,
} from "./categorySearchUrl";

describe("buildCategorySearchQueryString", () => {
  it("uses categoryId not categoryIds", () => {
    const qs = buildCategorySearchQueryString({ categoryId: "001" });

    expect(qs).toContain("categoryId=001");

    expect(qs).not.toContain("categoryIds");
  });

  it("includes carIds when provided", () => {
    const qs = buildCategorySearchQueryString({
      categoryId: "001001002",
      carIds: ["car-abc"],
    });

    expect(qs).toContain("categoryId=001001002");
    expect(qs).toContain("carIds=car-abc");
    expect(qs).not.toContain("makeModelTypeId");
  });

  it("includes vin when provided (URL marker only)", () => {
    const qs = buildCategorySearchQueryString({
      categoryId: "001",
      carIds: ["id1", "id2"],
      vin: "vf7sabhy6gw595849",
    });

    expect(qs).toContain("carIds=id1%2Cid2");
    expect(qs).toContain("vin=VF7SABHY6GW595849");
  });
});

describe("getCategoryIdFromSearchParams", () => {
  it("reads categoryId from URL", () => {
    const sp = new URLSearchParams("categoryId=001");

    expect(getCategoryIdFromSearchParams(sp as any)).toBe("001");
  });

  it("returns null when categoryId is absent", () => {
    const sp = new URLSearchParams("take=12");

    expect(getCategoryIdFromSearchParams(sp as any)).toBeNull();
  });
});

describe("pickPrimaryCategoryId", () => {
  it("picks the most specific (longest) id", () => {
    expect(pickPrimaryCategoryId(["001", "001001002"])).toBe("001001002");
  });
});

describe("appendCategorySearchQuery", () => {
  it("appends with correct separator", () => {
    expect(appendCategorySearchQuery("/en-BE/search-results", { categoryId: "001" })).toBe(
      "/en-BE/search-results?categoryId=001&take=12&order=priority",
    );

    expect(
      appendCategorySearchQuery("/en-BE/volvo?makeModelTypeId=x", { categoryId: "001" }),
    ).toContain("categoryId=001");
  });
});

describe("buildBrandEmptyCategoriesSrpHref", () => {
  it("builds Other category SRP with manufacturerIds", () => {
    expect(buildBrandEmptyCategoriesSrpHref("en-BE", "gpGujipGujipGu")).toBe(
      "/en-BE/search-results?categoryId=000000000&take=12&order=priority&manufacturerIds=gpGujipGujipGu",
    );
  });
});

describe("getCarIdsFromSearchParams", () => {
  it("parses comma-separated carIds", () => {
    const sp = new URLSearchParams("carIds=a,b");
    expect(getCarIdsFromSearchParams(sp as any)).toEqual(["a", "b"]);
  });
});

describe("buildPartsCatalogUrl", () => {
  it("builds localized catalog path with carIds", () => {
    expect(buildPartsCatalogUrl("en-BE", ["id1", "id2"])).toBe(
      "/en-BE/car-parts/?carIds=id1%2Cid2",
    );
  });
});

describe("appendVehicleContextToHref", () => {
  it("appends carIds only", () => {
    expect(
      appendVehicleContextToHref("/en-BE/car-parts/", {
        carIds: ["x"],
      }),
    ).toBe("/en-BE/car-parts/?carIds=x");
  });

  it("merges with existing query", () => {
    expect(
      appendVehicleContextToHref("/en-BE/car-parts/category/engine?foo=1", { carIds: ["y"] }),
    ).toContain("carIds=y");
    expect(
      appendVehicleContextToHref("/en-BE/car-parts/category/engine?foo=1", { carIds: ["y"] }),
    ).toContain("foo=1");
  });

  it("appends vin with carIds", () => {
    expect(
      appendVehicleContextToHref("/en-BE/search-results", {
        carIds: ["a", "b"],
        vin: "VF7SABHY6GW595849",
      }),
    ).toBe("/en-BE/search-results?carIds=a%2Cb&vin=VF7SABHY6GW595849");
  });

  it("clears vin when explicitly null", () => {
    expect(
      appendVehicleContextToHref("/en-BE/car-parts/?carIds=a&vin=VF7SABHY6GW595849", {
        carIds: ["b"],
        vin: null,
      }),
    ).toBe("/en-BE/car-parts/?carIds=b");
  });
});

describe("appendCurrentVehicleQueryToHref", () => {
  const cart = "/en-BE/shoppingcart/";

  it("copies carIds and vin", () => {
    const sp = new URLSearchParams("carIds=mod8r6w96oo3g9&vin=ZAREAECU2H7516593");
    expect(appendCurrentVehicleQueryToHref(cart, sp)).toBe(
      "/en-BE/shoppingcart/?carIds=mod8r6w96oo3g9&vin=ZAREAECU2H7516593",
    );
  });

  it("copies carIds only", () => {
    const sp = new URLSearchParams("carIds=mod8r6w96oo3g9");
    expect(appendCurrentVehicleQueryToHref(cart, sp)).toBe(
      "/en-BE/shoppingcart/?carIds=mod8r6w96oo3g9",
    );
  });

  it("copies vin only", () => {
    const sp = new URLSearchParams("vin=ZAREAECU2H7516593");
    expect(appendCurrentVehicleQueryToHref(cart, sp)).toBe(
      "/en-BE/shoppingcart/?vin=ZAREAECU2H7516593",
    );
  });

  it("leaves href unchanged when URL has no vehicle query", () => {
    expect(appendCurrentVehicleQueryToHref(cart, new URLSearchParams("foo=1"))).toBe(cart);
  });

  it("does not copy unrelated query keys", () => {
    const sp = new URLSearchParams("carIds=abc&categoryId=001&take=12");
    expect(appendCurrentVehicleQueryToHref(cart, sp)).toBe("/en-BE/shoppingcart/?carIds=abc");
  });
});

describe("resolveNavigationCarIds", () => {
  it("returns empty when flag off", () => {
    expect(
      resolveNavigationCarIds({
        enabled: false,
        searchParams: new URLSearchParams("carIds=a") as any,
        heroCarsApiId: "b",
      }),
    ).toEqual([]);
  });

  it("prefers URL carIds over hero", () => {
    expect(
      resolveNavigationCarIds({
        enabled: true,
        searchParams: new URLSearchParams("carIds=url-id") as any,
        heroCarsApiId: "hero-id",
      }),
    ).toEqual(["url-id"]);
  });

  it("falls back to hero when URL has no carIds", () => {
    expect(
      resolveNavigationCarIds({
        enabled: true,
        searchParams: new URLSearchParams() as any,
        heroCarsApiId: "hero-id",
      }),
    ).toEqual(["hero-id"]);
  });

  it("returns empty when URL and hero are both cleared (deselect)", () => {
    expect(
      resolveNavigationCarIds({
        enabled: true,
        searchParams: new URLSearchParams() as any,
        heroCarsApiId: null,
      }),
    ).toEqual([]);
  });
});

describe("resolveNavigationVin", () => {
  const SAMPLE_VIN = "VF7SABHY6GW595849";

  it("returns null when flag off", () => {
    expect(
      resolveNavigationVin({
        enabled: false,
        searchParams: new URLSearchParams(`vin=${SAMPLE_VIN}`) as any,
        carIds: ["car-1"],
        getVinForCarId: () => SAMPLE_VIN,
      }),
    ).toBeNull();
  });

  it("prefers URL vin over saved-car lookup", () => {
    expect(
      resolveNavigationVin({
        enabled: true,
        searchParams: new URLSearchParams(`vin=${SAMPLE_VIN}`) as any,
        carIds: ["car-1"],
        getVinForCarId: () => "AAAAAAAAAAAAAAAAA",
      }),
    ).toBe(SAMPLE_VIN);
  });

  it("falls back to saved-car VIN for active nav car", () => {
    expect(
      resolveNavigationVin({
        enabled: true,
        searchParams: new URLSearchParams() as any,
        carIds: ["car-1"],
        getVinForCarId: (id) => (id === "car-1" ? SAMPLE_VIN : null),
      }),
    ).toBe(SAMPLE_VIN);
  });

  it("returns null for search-by-car (no stored VIN)", () => {
    expect(
      resolveNavigationVin({
        enabled: true,
        searchParams: new URLSearchParams() as any,
        carIds: ["car-1"],
        getVinForCarId: () => null,
      }),
    ).toBeNull();
  });
});

describe("appendNavigationCarIdsToPartsHref", () => {
  it("appends carIds to parts catalog href", () => {
    expect(appendNavigationCarIdsToPartsHref("/en-BE/car-parts/", ["car-1"])).toBe(
      "/en-BE/car-parts/?carIds=car-1",
    );
  });

  it("leaves non-parts href unchanged", () => {
    expect(appendNavigationCarIdsToPartsHref("/en-BE/support/", ["car-1"])).toBe("/en-BE/support/");
  });

  it("merges with manufacturerIds on catalog", () => {
    const href = appendNavigationCarIdsToPartsHref("/en-BE/car-parts/?manufacturerIds=mfr-1", [
      "car-1",
    ]);
    expect(href).toContain("manufacturerIds=mfr-1");
    expect(href).toContain("carIds=car-1");
  });

  it("appends carIds to search-results href", () => {
    expect(
      appendNavigationCarIdsToPartsHref(
        "/en-BE/search-results?categoryId=001&take=12&order=priority",
        ["car-1"],
      ),
    ).toBe("/en-BE/search-results?categoryId=001&take=12&order=priority&carIds=car-1");
  });

  it("appends vin with carIds on parts catalog href", () => {
    expect(
      appendNavigationCarIdsToPartsHref("/en-BE/car-parts/", ["car-1"], "VF7SABHY6GW595849"),
    ).toBe("/en-BE/car-parts/?carIds=car-1&vin=VF7SABHY6GW595849");
  });
});

describe("appendVehicleContextToHref brand path", () => {
  it("appends carIds onto clean Brand+L3 path", () => {
    expect(
      appendVehicleContextToHref("/en-BE/car-parts-brands/bosch/air-filter", {
        carIds: ["v1"],
      }),
    ).toBe("/en-BE/car-parts-brands/bosch/air-filter?carIds=v1");
  });
});
