import { describe, expect, it } from "vitest";

import {
  fixPartsLocaleSegmentsInPathname,
  getLegacyManufacturersRedirectPath,
  fixManufacturersLocaleSegmentsInPathname,
  getManufacturersLocaleSegmentMismatchNotFoundPath,
  rewriteLocalizedManufacturersUrlToCanonicalAppPath,
} from "@/config/url-segments";

describe("fixPartsLocaleSegmentsInPathname", () => {
  it("redirects wrong parts segment for nl locale (pieces-auto → auto-onderdelen)", () => {
    expect(fixPartsLocaleSegmentsInPathname("/nl-NL/pieces-auto")).toBe("/nl-NL/auto-onderdelen");
  });

  it("redirects canonical car-parts on nl locale to auto-onderdelen", () => {
    expect(fixPartsLocaleSegmentsInPathname("/nl-BE/car-parts")).toBe("/nl-BE/auto-onderdelen");
  });

  it("redirects wrong parts segment on fr locale to pieces-auto", () => {
    expect(fixPartsLocaleSegmentsInPathname("/fr-BE/car-parts")).toBe("/fr-BE/pieces-auto");
  });

  it("fixes category segment on deep paths", () => {
    expect(
      fixPartsLocaleSegmentsInPathname("/nl-NL/pieces-auto/category/maintenance-service/fluids"),
    ).toBe("/nl-NL/auto-onderdelen/categorie/maintenance-service/fluids");
  });

  it("fixes PDP paths with wrong parts segment", () => {
    expect(fixPartsLocaleSegmentsInPathname("/nl-NL/pieces-auto/fiat-group/m3hon3tjgwvejn")).toBe(
      "/nl-NL/auto-onderdelen/fiat-group/m3hon3tjgwvejn",
    );
  });

  it("returns null when segments already match locale", () => {
    expect(fixPartsLocaleSegmentsInPathname("/nl-NL/auto-onderdelen")).toBeNull();
    expect(fixPartsLocaleSegmentsInPathname("/en-BE/car-parts/category/engine")).toBeNull();
  });

  it("returns null for non-parts paths", () => {
    expect(fixPartsLocaleSegmentsInPathname("/en-BE/search-results")).toBeNull();
    expect(fixPartsLocaleSegmentsInPathname("/en-BE/about-us")).toBeNull();
  });
});

describe("rewriteLocalizedManufacturersUrlToCanonicalAppPath", () => {
  it("rewrites localized Car Part Brands list to the manufacturers app folder", () => {
    expect(rewriteLocalizedManufacturersUrlToCanonicalAppPath("/en-BE/car-parts-brands")).toBe(
      "/en-BE/manufacturers",
    );
    expect(
      rewriteLocalizedManufacturersUrlToCanonicalAppPath("/nl-BE/auto-onderdelen-merken"),
    ).toBe("/nl-BE/manufacturers");
    expect(rewriteLocalizedManufacturersUrlToCanonicalAppPath("/fr-BE/auto-pieces-marques")).toBe(
      "/fr-BE/manufacturers",
    );
    expect(rewriteLocalizedManufacturersUrlToCanonicalAppPath("/de-BE/autoteile-marken")).toBe(
      "/de-BE/manufacturers",
    );
  });

  it("rewrites brand landing paths", () => {
    expect(
      rewriteLocalizedManufacturersUrlToCanonicalAppPath("/en-BE/car-parts-brands/bosch"),
    ).toBe("/en-BE/manufacturers/bosch");
  });

  it("returns null when already on the canonical app folder", () => {
    expect(rewriteLocalizedManufacturersUrlToCanonicalAppPath("/en-BE/manufacturers")).toBeNull();
  });
});

describe("getLegacyManufacturersRedirectPath", () => {
  it("redirects the legacy /manufacturers landing page per locale", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/manufacturers")).toBe(
      "/en-BE/car-parts-brands",
    );
    expect(getLegacyManufacturersRedirectPath("/nl-BE/manufacturers")).toBe(
      "/nl-BE/auto-onderdelen-merken",
    );
    expect(getLegacyManufacturersRedirectPath("/fr-BE/manufacturers")).toBe(
      "/fr-BE/auto-pieces-marques",
    );
    expect(getLegacyManufacturersRedirectPath("/de-BE/manufacturers")).toBe(
      "/de-BE/autoteile-marken",
    );
  });

  it("redirects legacy brand and L3 sub-paths", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/manufacturers/bosch")).toBe(
      "/en-BE/car-parts-brands/bosch",
    );
    expect(getLegacyManufacturersRedirectPath("/en-BE/manufacturers/bosch/engine")).toBe(
      "/en-BE/car-parts-brands/bosch/engine",
    );
  });

  it("redirects each locale's own pre-Sprint40 legacy word", () => {
    expect(getLegacyManufacturersRedirectPath("/nl-BE/fabrikant")).toBe(
      "/nl-BE/auto-onderdelen-merken",
    );
    expect(getLegacyManufacturersRedirectPath("/fr-BE/fabricant")).toBe(
      "/fr-BE/auto-pieces-marques",
    );
    expect(getLegacyManufacturersRedirectPath("/de-BE/hersteller")).toBe("/de-BE/autoteile-marken");
  });

  it("redirects brand sub-paths for the locale-specific legacy word", () => {
    expect(getLegacyManufacturersRedirectPath("/nl-BE/fabrikant/bosch")).toBe(
      "/nl-BE/auto-onderdelen-merken/bosch",
    );
    expect(getLegacyManufacturersRedirectPath("/de-BE/hersteller/bosch/engine")).toBe(
      "/de-BE/autoteile-marken/bosch/engine",
    );
  });

  it("does not redirect a legacy word paired with the wrong locale", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/fabrikant")).toBeNull();
    expect(getLegacyManufacturersRedirectPath("/nl-BE/hersteller")).toBeNull();
    expect(getLegacyManufacturersRedirectPath("/fr-BE/fabrikant")).toBeNull();
  });

  it("handles a trailing slash", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/manufacturers/")).toBe(
      "/en-BE/car-parts-brands",
    );
  });

  it("returns null for the new canonical Car Part Brands URL (no redirect loop)", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/car-parts-brands")).toBeNull();
    expect(getLegacyManufacturersRedirectPath("/nl-BE/auto-onderdelen-merken")).toBeNull();
  });

  it("returns null for unrelated or invalid paths", () => {
    expect(getLegacyManufacturersRedirectPath("/en-BE/about-us")).toBeNull();
    expect(getLegacyManufacturersRedirectPath("/manufacturers")).toBeNull();
    expect(getLegacyManufacturersRedirectPath("/xx-XX/manufacturers")).toBeNull();
  });
});

describe("fixManufacturersLocaleSegmentsInPathname", () => {
  it("301-corrects English brands slug on French locale", () => {
    expect(fixManufacturersLocaleSegmentsInPathname("/fr-FR/car-parts-brands")).toBe(
      "/fr-FR/auto-pieces-marques",
    );
  });

  it("301-corrects deep brand and brand×L3 paths", () => {
    expect(fixManufacturersLocaleSegmentsInPathname("/fr-FR/car-parts-brands/bosch")).toBe(
      "/fr-FR/auto-pieces-marques/bosch",
    );
    expect(
      fixManufacturersLocaleSegmentsInPathname("/fr-NL/autoteile-marken/bosch/air-filter"),
    ).toBe("/fr-NL/auto-pieces-marques/bosch/air-filter");
  });

  it("returns null when segment already matches locale", () => {
    expect(fixManufacturersLocaleSegmentsInPathname("/fr-FR/auto-pieces-marques")).toBeNull();
    expect(fixManufacturersLocaleSegmentsInPathname("/en-BE/car-parts-brands/bosch")).toBeNull();
  });
});

describe("getManufacturersLocaleSegmentMismatchNotFoundPath", () => {
  it("allows the locale-matching public slug", () => {
    expect(getManufacturersLocaleSegmentMismatchNotFoundPath("/en-BE/car-parts-brands")).toBeNull();
    expect(
      getManufacturersLocaleSegmentMismatchNotFoundPath("/nl-BE/auto-onderdelen-merken"),
    ).toBeNull();
  });

  it("maps the wrong-locale public slug to a not-found path (legacy helper)", () => {
    expect(getManufacturersLocaleSegmentMismatchNotFoundPath("/nl-BE/car-parts-brands")).toBe(
      "/nl-BE/not-found",
    );
  });
});
