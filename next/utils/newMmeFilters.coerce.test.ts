import { describe, expect, it } from "vitest";

import {
  buildBootstrapPrefillPayload,
  buildPayload,
  buildVinBootstrapPrefillPayload,
  coerceSelectedToKeys,
  getVisibleMmeFields,
  looksLikeMmeFilterKey,
  resolveToOptionKey,
} from "@/lib/newMmeFilters";
import type { NewMmeOptionsState, NewMmeSelectedState } from "@/stores/useNewMmeStore";

const sampleOptions: NewMmeOptionsState = {
  makes: [{ key: "m1", value: "Fiat" }],
  models: [{ key: "md1", value: "500" }],
  variants: [],
  bodys: [{ key: "b1", value: "Hatchback-3 Doors" }],
  engines: [{ key: "e1", value: "1.2 Petrol" }],
  gearBoxes: [],
  engineCodes: [{ key: "ec1", value: "199A4000" }],
  gearBoxCodes: [],
};

describe("resolveToOptionKey", () => {
  it("returns key when raw matches option key", () => {
    expect(resolveToOptionKey("m1", sampleOptions.makes)).toBe("m1");
  });

  it("returns key when raw matches display value", () => {
    expect(resolveToOptionKey("Fiat", sampleOptions.makes)).toBe("m1");
  });

  it("returns null when raw does not match any option", () => {
    expect(resolveToOptionKey("BMW", sampleOptions.makes)).toBeNull();
  });
});

describe("coerceSelectedToKeys", () => {
  it("maps display labels to keys for all fields", () => {
    const selected: NewMmeSelectedState = {
      make: "Fiat",
      model: "500",
      variant: null,
      body: "Hatchback-3 Doors",
      engine: "1.2 Petrol",
      gearBox: null,
      engineCode: "199A4000",
      gearBoxCode: null,
    };
    const coerced = coerceSelectedToKeys(selected, sampleOptions);
    expect(coerced.make).toBe("m1");
    expect(coerced.model).toBe("md1");
    expect(coerced.body).toBe("b1");
    expect(coerced.engine).toBe("e1");
    expect(coerced.engineCode).toBe("ec1");
  });
});

describe("buildPayload", () => {
  it("never sends display labels when options are provided", () => {
    const selected: NewMmeSelectedState = {
      make: "Fiat",
      model: "md1",
      variant: null,
      body: null,
      engine: null,
      gearBox: null,
      engineCode: null,
      gearBoxCode: null,
    };
    const payload = buildPayload(selected, sampleOptions);
    expect(payload.make).toBe("m1");
    expect(payload.model).toBe("md1");
    expect(payload.vin).toBeNull();
  });
});

describe("buildVinBootstrapPrefillPayload", () => {
  it("sends only vin with all MME fields null", () => {
    const payload = buildVinBootstrapPrefillPayload("vf7sabhy6gw595849");
    expect(payload).toEqual({
      make: null,
      model: null,
      body: null,
      engine: null,
      engineCode: null,
      variant: null,
      gearBox: null,
      gearBoxCode: null,
      vin: "VF7SABHY6GW595849",
    });
  });
});

describe("looksLikeMmeFilterKey", () => {
  it("detects 64-char hex keys", () => {
    expect(
      looksLikeMmeFilterKey("f7113b2a7680dd45ae9ac6586c00b596529defe380ef707b362a283a87a69a2e"),
    ).toBe(true);
    expect(looksLikeMmeFilterKey("ALFA ROMEO")).toBe(false);
  });
});

describe("buildBootstrapPrefillPayload", () => {
  it("passes through GET labels when downstream option lists are empty", () => {
    const merged: NewMmeSelectedState = {
      make: "Fiat",
      model: "500 (312)",
      variant: null,
      body: "Hatchback",
      engine: null,
      gearBox: null,
      engineCode: null,
      gearBoxCode: null,
    };
    const makesOnly: NewMmeOptionsState = {
      ...sampleOptions,
      models: [],
      bodys: [],
    };
    const payload = buildBootstrapPrefillPayload(merged, makesOnly);
    expect(payload.make).toBe("m1");
    expect(payload.model).toBe("500 (312)");
    expect(payload.body).toBe("Hatchback");
  });
});

describe("getVisibleMmeFields field order", () => {
  it("lists body before variant when both have options", () => {
    const selected: NewMmeSelectedState = {
      make: "m1",
      model: "md1",
      variant: null,
      body: null,
      engine: null,
      gearBox: null,
      engineCode: null,
      gearBoxCode: null,
    };
    const options: NewMmeOptionsState = {
      ...sampleOptions,
      variants: [{ key: "v1", value: "Other" }],
    };
    const fields = getVisibleMmeFields(selected, options);
    expect(fields).toEqual(["make", "model", "body", "variant", "engine", "engineCode"]);
  });

  it("hides fields with no options even when selected value is stale", () => {
    const selected: NewMmeSelectedState = {
      make: "m1",
      model: "md1",
      variant: "v-stale",
      body: null,
      engine: null,
      gearBox: null,
      engineCode: null,
      gearBoxCode: null,
    };
    const fields = getVisibleMmeFields(selected, sampleOptions);
    expect(fields).not.toContain("variant");
    expect(fields).toContain("body");
  });
});
