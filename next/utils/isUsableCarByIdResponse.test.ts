import { describe, expect, it } from "vitest";
import { isUsableCarByIdResponse } from "./isUsableCarByIdResponse";

describe("isUsableCarByIdResponse", () => {
  it("rejects null/undefined", () => {
    expect(isUsableCarByIdResponse(null)).toBe(false);
    expect(isUsableCarByIdResponse(undefined)).toBe(false);
  });

  it("rejects missing id", () => {
    expect(
      isUsableCarByIdResponse({
        id: "",
        make: "Fiat",
        model: "500",
        variant: null,
        body: null,
        engine: null,
        engineCode: null,
        gearBox: null,
        gearBoxCode: null,
      }),
    ).toBe(false);
  });

  it("rejects id-only payload (no make/model)", () => {
    expect(
      isUsableCarByIdResponse({
        id: "bad-id",
        make: null,
        model: null,
        variant: null,
        body: null,
        engine: null,
        engineCode: null,
        gearBox: null,
        gearBoxCode: null,
      }),
    ).toBe(false);
  });

  it("accepts make and/or model", () => {
    expect(
      isUsableCarByIdResponse({
        id: "ok",
        make: "Fiat",
        model: "500",
        variant: null,
        body: null,
        engine: null,
        engineCode: null,
        gearBox: null,
        gearBoxCode: null,
      }),
    ).toBe(true);
    expect(
      isUsableCarByIdResponse({
        id: "ok2",
        make: "Fiat",
        model: null,
        variant: null,
        body: null,
        engine: null,
        engineCode: null,
        gearBox: null,
        gearBoxCode: null,
      }),
    ).toBe(true);
  });
});
