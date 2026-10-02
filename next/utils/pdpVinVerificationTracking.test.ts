import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { getGtmLocale, trackPdpVinVerification } from "@/utils/gtm";
import { trackPdpVinVerificationFromResult } from "@/utils/pdpVinVerificationTracking";

type DataLayerEntry = Record<string, unknown>;

function stubBrowserDataLayer() {
  const dataLayer: DataLayerEntry[] = [];
  vi.stubGlobal("window", { dataLayer } as Window & { dataLayer: DataLayerEntry[] });
  vi.stubGlobal("localStorage", {
    store: {} as Record<string, string>,
    getItem(key: string) {
      return this.store[key] ?? null;
    },
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    clear() {
      this.store = {};
    },
  });
  return dataLayer;
}

describe("getGtmLocale", () => {
  beforeEach(() => {
    stubBrowserDataLayer();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers URL locale segment", () => {
    localStorage.setItem("locale", "fr-BE");
    expect(getGtmLocale("nl-NL")).toBe("nl-NL");
  });

  it("falls back to localStorage then default", () => {
    expect(getGtmLocale(null)).toBe("en-BE");
    localStorage.setItem("locale", "fr-FR");
    expect(getGtmLocale(undefined)).toBe("fr-FR");
  });
});

describe("trackPdpVinVerification", () => {
  let dataLayer: DataLayerEntry[];

  beforeEach(() => {
    dataLayer = stubBrowserDataLayer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pushes vin_verification payload to dataLayer", () => {
    trackPdpVinVerification({
      productId: "part-123",
      vinVerificationResult: "FIT",
      customerType: "guest",
      locale: "en-BE",
    });

    expect(dataLayer).toContainEqual({
      event: "vin_verification",
      vin_verification_result: "FIT",
      product_id: "part-123",
      customer_type: "guest",
      store: expect.any(String),
      locale: "en-BE",
    });
  });

  it("skips empty product id", () => {
    trackPdpVinVerification({
      productId: "  ",
      vinVerificationResult: "NO_FIT",
      customerType: "logged_in",
      locale: "nl-NL",
    });
    expect(dataLayer).toHaveLength(0);
  });
});

describe("trackPdpVinVerificationFromResult", () => {
  let dataLayer: DataLayerEntry[];

  beforeEach(() => {
    dataLayer = stubBrowserDataLayer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps VinCheckResult to GA4 event", () => {
    trackPdpVinVerificationFromResult(
      {
        vin: "WVWZZZ1JZYW386752",
        checkedAt: Date.now(),
        items: [{ id: "abc", isMatch: "MAY_FIT" }],
      },
      "abc",
      true,
      "de-BE",
    );

    expect(dataLayer[0]).toMatchObject({
      event: "vin_verification",
      vin_verification_result: "MAY_FIT",
      product_id: "abc",
      customer_type: "logged_in",
      locale: "de-BE",
    });
  });
});
