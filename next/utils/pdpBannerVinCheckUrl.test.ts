import { describe, expect, it } from "vitest";
import {
  buildPdpPartVinCheckKey,
  isCurrentPdpPartVinCheckKey,
  shouldResetPdpBannerVinCheckOnUrlVinLoss,
} from "./pdpBannerVinCheckUrl";

const SAMPLE_VIN = "GRDGFDFDG45435354";
const OTHER_VIN = "JTPAAAAA20R067972";
const PART_ID = "mfl70az9jwk3y5";

describe("shouldResetPdpBannerVinCheckOnUrlVinLoss", () => {
  it("resets when URL loses vin (browser BACK)", () => {
    expect(shouldResetPdpBannerVinCheckOnUrlVinLoss(SAMPLE_VIN, null)).toBe(true);
  });

  it("keeps mid-Add result when URL never had vin yet", () => {
    expect(shouldResetPdpBannerVinCheckOnUrlVinLoss(null, null)).toBe(false);
  });

  it("does not reset when URL gains or keeps vin", () => {
    expect(shouldResetPdpBannerVinCheckOnUrlVinLoss(null, SAMPLE_VIN)).toBe(false);
    expect(shouldResetPdpBannerVinCheckOnUrlVinLoss(SAMPLE_VIN, SAMPLE_VIN)).toBe(false);
    expect(shouldResetPdpBannerVinCheckOnUrlVinLoss(SAMPLE_VIN, OTHER_VIN)).toBe(false);
  });
});

describe("isCurrentPdpPartVinCheckKey", () => {
  it("matches the in-flight check key", () => {
    const key = buildPdpPartVinCheckKey(SAMPLE_VIN, PART_ID);
    expect(isCurrentPdpPartVinCheckKey(key, SAMPLE_VIN, PART_ID)).toBe(true);
  });

  it("rejects stale responses after BACK cleared the key", () => {
    expect(isCurrentPdpPartVinCheckKey(null, SAMPLE_VIN, PART_ID)).toBe(false);
  });

  it("rejects responses for a different vin or part", () => {
    const key = buildPdpPartVinCheckKey(SAMPLE_VIN, PART_ID);
    expect(isCurrentPdpPartVinCheckKey(key, OTHER_VIN, PART_ID)).toBe(false);
    expect(isCurrentPdpPartVinCheckKey(key, SAMPLE_VIN, "other-part")).toBe(false);
  });
});
