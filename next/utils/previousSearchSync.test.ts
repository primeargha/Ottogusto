import { describe, expect, it } from "vitest";

import { legacyPreviousSearchToMmeItem, previousSearchSignature } from "./previousSearchSync";

describe("previousSearchSignature", () => {
  it("keys oe ref searches", () => {
    expect(previousSearchSignature({ OERef: "5454" })).toBe("oe:5454");
  });
});

describe("legacyPreviousSearchToMmeItem", () => {
  it("maps oe ref legacy item", () => {
    const item = legacyPreviousSearchToMmeItem({
      make: "",
      model: "",
      year: "",
      type: "",
      timeAgo: "2026-01-01",
      OERef: "5454",
      mmytData: null,
    } as any);
    expect(item?.OERef).toBe("5454");
  });

  it("maps car legacy item", () => {
    const item = legacyPreviousSearchToMmeItem({
      make: "FIAT",
      model: "PUNTO",
      year: "2010",
      type: "1.4",
      timeAgo: "2026-01-01",
      mmytData: { make: { value: "FIAT" }, model: { value: "PUNTO" } },
    } as any);
    expect(item?.make).toBe("FIAT");
    expect(item?.carLabel).toContain("FIAT");
  });
});
