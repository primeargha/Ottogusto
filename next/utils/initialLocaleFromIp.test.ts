import { describe, expect, it } from "vitest";

import { resolveInitialLocaleFromCountryCode } from "./initialLocaleFromIp";

describe("resolveInitialLocaleFromCountryCode", () => {
  it("auto-applies Netherlands + Nederlands without modal", () => {
    expect(resolveInitialLocaleFromCountryCode("NL")).toEqual({
      locale: "nl-NL",
      language: "nl",
      country: "NL",
      showModal: false,
    });
  });

  it("auto-applies France + Français without modal", () => {
    expect(resolveInitialLocaleFromCountryCode("fr")).toEqual({
      locale: "fr-FR",
      language: "fr",
      country: "FR",
      showModal: false,
    });
  });

  it("shows modal for Belgium with English preselected", () => {
    expect(resolveInitialLocaleFromCountryCode("BE")).toEqual({
      locale: "en-BE",
      language: "en",
      country: "BE",
      showModal: true,
    });
  });

  it("shows modal for Luxembourg with Français preselected", () => {
    expect(resolveInitialLocaleFromCountryCode("LU")).toEqual({
      locale: "fr-LU",
      language: "fr",
      country: "LU",
      showModal: true,
    });
  });

  it("falls back to Belgium + English without modal for unknown/unsupported", () => {
    expect(resolveInitialLocaleFromCountryCode("DE")).toEqual({
      locale: "en-BE",
      language: "en",
      country: "BE",
      showModal: false,
    });
    expect(resolveInitialLocaleFromCountryCode(null)).toEqual({
      locale: "en-BE",
      language: "en",
      country: "BE",
      showModal: false,
    });
    expect(resolveInitialLocaleFromCountryCode("")).toEqual({
      locale: "en-BE",
      language: "en",
      country: "BE",
      showModal: false,
    });
  });
});
