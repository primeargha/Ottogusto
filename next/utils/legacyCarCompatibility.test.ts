import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  isCompatibleCarSectionEnabled,
  isNewMmeFeatureEnabledForCountry,
  shouldFetchMakeModelBrandsApi,
} from "./legacyCarCompatibility";

describe("legacyCarCompatibility", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG = JSON.stringify({
      default: false,
      exception_countries: [],
    });
    process.env.NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG = JSON.stringify({
      default: false,
      exception_countries: [],
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("shouldFetchMakeModelBrandsApi is true when new MME is off", () => {
    expect(shouldFetchMakeModelBrandsApi("BE")).toBe(true);
  });

  it("shouldFetchMakeModelBrandsApi is false when new MME is on", () => {
    process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG = JSON.stringify({
      default: true,
      exception_countries: [],
    });
    expect(shouldFetchMakeModelBrandsApi("BE")).toBe(false);
  });

  it("isCompatibleCarSectionEnabled is false when flag default is false", () => {
    expect(isCompatibleCarSectionEnabled("BE")).toBe(false);
  });

  it("isCompatibleCarSectionEnabled is true when flag default is true", () => {
    process.env.NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG = JSON.stringify({
      default: true,
      exception_countries: [],
    });
    expect(isCompatibleCarSectionEnabled("BE")).toBe(true);
  });

  it("isCompatibleCarSectionEnabled is independent of new MME flag", () => {
    process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG = JSON.stringify({
      default: true,
      exception_countries: [],
    });
    process.env.NEXT_PUBLIC_COMPATIBLE_CAR_SECTION_FLAG = JSON.stringify({
      default: true,
      exception_countries: [],
    });
    expect(isCompatibleCarSectionEnabled("BE")).toBe(true);
  });

  it("isNewMmeFeatureEnabledForCountry uses env default when no country", () => {
    process.env.NEXT_PUBLIC_NEW_MME_FEATURE_FLAG = JSON.stringify({
      default: true,
      exception_countries: [],
    });
    expect(isNewMmeFeatureEnabledForCountry(null)).toBe(true);
  });
});
