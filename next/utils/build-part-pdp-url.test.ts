import { describe, expect, it } from "vitest";

import { buildPartPdpHref, partPdpOptionsFromSearchParams } from "@/utils/build-part-pdp-url";

describe("buildPartPdpHref", () => {
  const validId = "mfvctpr7v02v2t";

  const basePath = "/en-BE/car-parts/Brake-pad/mfvctpr7v02v2t";

  it("builds path without query when no vehicle context", () => {
    expect(buildPartPdpHref("en-BE", validId, { seoName: "Brake pad" })).toBe(basePath);
  });

  it("appends makeModelTypeId query", () => {
    expect(
      buildPartPdpHref("en-BE", validId, {
        seoName: "Brake pad",
        makeModelTypeId: "mmt-1",
      }),
    ).toBe(`${basePath}?makeModelTypeId=mmt-1`);
  });

  it("appends carIds query", () => {
    expect(
      buildPartPdpHref("en-BE", validId, {
        seoName: "Brake pad",
        carIds: ["mod8q0yipgqh3z"],
      }),
    ).toBe(`${basePath}?carIds=mod8q0yipgqh3z`);
  });

  it("appends both makeModelTypeId and carIds", () => {
    const href = buildPartPdpHref("en-BE", validId, {
      seoName: "Brake pad",
      makeModelTypeId: "mmt-1",
      carIds: "car-a,car-b",
    });
    expect(href).toContain("makeModelTypeId=mmt-1");
    expect(href).toContain("carIds=car-a%2Ccar-b");
  });

  it("appends vin with carIds", () => {
    const href = buildPartPdpHref("en-BE", validId, {
      seoName: "Brake pad",
      carIds: ["mod8q0yipgqh3z"],
      vin: "vf7sabhy6gw595849",
    });
    expect(href).toContain("carIds=mod8q0yipgqh3z");
    expect(href).toContain("vin=VF7SABHY6GW595849");
  });

  it("returns null for invalid part id", () => {
    expect(buildPartPdpHref("en-BE", "spark-plug-glow-plug", { seoName: "x" })).toBeNull();
  });
});

describe("partPdpOptionsFromSearchParams", () => {
  it("reads makeModelTypeId and carIds when includeCarIds is true", () => {
    const sp = new URLSearchParams("makeModelTypeId=mmt1&carIds=mod8q0yipgqh3z&categoryId=001");
    expect(partPdpOptionsFromSearchParams(sp, { includeCarIds: true })).toEqual({
      makeModelTypeId: "mmt1",
      carIds: ["mod8q0yipgqh3z"],
      vin: undefined,
    });
  });

  it("reads vin from search params", () => {
    const sp = new URLSearchParams("carIds=mod8q0yipgqh3z&vin=VF7SABHY6GW595849");
    expect(partPdpOptionsFromSearchParams(sp, { includeCarIds: true })).toEqual({
      makeModelTypeId: undefined,
      carIds: ["mod8q0yipgqh3z"],
      vin: "VF7SABHY6GW595849",
    });
  });

  it("omits carIds when includeCarIds is false", () => {
    const sp = new URLSearchParams("carIds=mod8q0yipgqh3z");
    expect(partPdpOptionsFromSearchParams(sp, { includeCarIds: false })).toEqual({
      makeModelTypeId: undefined,
      carIds: undefined,
      vin: undefined,
    });
  });
});
