import { describe, expect, it } from "vitest";

import {
  buildCanonicalPartPdpPath,
  isLegacyPartUrl,
  parseLegacyPartPdpCandidate,
  resolveCanonicalLocaleForLegacyPart,
  slugifyManufacturerForPdp,
} from "./legacyPartPdp";

describe("parseLegacyPartPdpCandidate", () => {
  it("parses /{locale}/part/{slug}/{partId}", () => {
    expect(parseLegacyPartPdpCandidate("/fr-NL/part/toyota/mfkuxwsjc4sjyr")).toEqual({
      locale: "fr-NL",
      slug: "toyota",
      partid: "mfkuxwsjc4sjyr",
    });
  });

  it("parses category-name slug (legacy product.name)", () => {
    expect(parseLegacyPartPdpCandidate("/fr-BE/part/REGELEENHEID/mf9amhxxfx6xn3")).toEqual({
      locale: "fr-BE",
      slug: "REGELEENHEID",
      partid: "mf9amhxxfx6xn3",
    });
  });

  it("parses older /{locale}/part/{partId} shape", () => {
    expect(parseLegacyPartPdpCandidate("/en-BE/part/mfkuxwsjc4sjyr")).toEqual({
      locale: "en-BE",
      slug: null,
      partid: "mfkuxwsjc4sjyr",
    });
  });

  it("returns null for live car-parts PDPs", () => {
    expect(parseLegacyPartPdpCandidate("/en-BE/car-parts/toyota/mfkuxwsjc4sjyr")).toBeNull();
  });

  it("returns null for SEO category slug as partid", () => {
    expect(parseLegacyPartPdpCandidate("/en-BE/part/foo/spark-plug-glow-plug")).toBeNull();
  });

  it("returns null for extra path segments", () => {
    expect(parseLegacyPartPdpCandidate("/en-BE/part/a/b/c")).toBeNull();
  });
});

describe("isLegacyPartUrl", () => {
  it("detects literal part segment", () => {
    expect(isLegacyPartUrl("/en-EU/part/toyota/mfk2pt4unzdohu")).toBe(true);
    expect(isLegacyPartUrl("/en-BE/part/bad-slug-only")).toBe(true);
    expect(isLegacyPartUrl("/en-BE/car-parts/toyota/x")).toBe(false);
  });
});

describe("resolveCanonicalLocaleForLegacyPart", () => {
  it("keeps allowlisted locales", () => {
    expect(resolveCanonicalLocaleForLegacyPart("fr-NL")).toBe("fr-NL");
    expect(resolveCanonicalLocaleForLegacyPart("en-BE")).toBe("en-BE");
  });

  it("maps phantom -EU locales to language default", () => {
    expect(resolveCanonicalLocaleForLegacyPart("en-EU")).toBe("en-BE");
    expect(resolveCanonicalLocaleForLegacyPart("nl-EU")).toBe("nl-BE");
    expect(resolveCanonicalLocaleForLegacyPart("fr-EU")).toBe("fr-BE");
  });
});

describe("buildCanonicalPartPdpPath", () => {
  it("builds live parts segment for valid locale", () => {
    expect(buildCanonicalPartPdpPath("fr-NL", "Toyota", "mfkuxwsjc4sjyr")).toBe(
      "/fr-NL/pieces-auto/toyota/mfkuxwsjc4sjyr",
    );
  });

  it("maps en-EU to en-BE car-parts", () => {
    expect(buildCanonicalPartPdpPath("en-EU", "Toyota", "mfk2pt4unzdohu")).toBe(
      "/en-BE/car-parts/toyota/mfk2pt4unzdohu",
    );
  });
});

describe("slugifyManufacturerForPdp", () => {
  it("slugifies manufacturer names", () => {
    expect(slugifyManufacturerForPdp("AC+Delco")).toBe("acplusdelco");
    expect(slugifyManufacturerForPdp("  Bosch  ")).toBe("bosch");
  });
});
