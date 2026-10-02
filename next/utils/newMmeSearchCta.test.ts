import { describe, expect, it } from "vitest";

import {
  areAllVisibleMmeFieldsSelected,
  getNewMmeDropdownLabelClass,
  getVisibleMmeFields,
  isNewMmeApplyCtaEnabled,
  isE2EMmeApplyCtaEnabled,
  isNewMmeSearchCtaEnabled,
  shouldE2EPrefillMakeModelOnly,
  toMakeModelOnlySelected,
} from "@/lib/newMmeFilters";
import type { NewMmeOptionsState, NewMmeSelectedState } from "@/stores/useNewMmeStore";

const emptyOptions: NewMmeOptionsState = {
  makes: [{ key: "m1", value: "Fiat" }],
  models: [{ key: "md1", value: "500" }],
  variants: [{ key: "v1", value: "2008" }],
  bodys: [],
  engines: [],
  gearBoxes: [],
  engineCodes: [],
  gearBoxCodes: [],
};

const makeModelSelected: NewMmeSelectedState = {
  make: "m1",
  model: "md1",
  variant: null,
  body: null,
  engine: null,
  gearBox: null,
  engineCode: null,
  gearBoxCode: null,
};

describe("isNewMmeSearchCtaEnabled", () => {
  it("returns true for a single non-empty car id", () => {
    expect(isNewMmeSearchCtaEnabled(["abc"])).toBe(true);
  });

  it("returns true when multiple non-empty car ids are resolved", () => {
    expect(isNewMmeSearchCtaEnabled(["a", "b"])).toBe(true);
  });

  it("returns false for empty array", () => {
    expect(isNewMmeSearchCtaEnabled([])).toBe(false);
  });

  it("returns false when every id is blank", () => {
    expect(isNewMmeSearchCtaEnabled(["  "])).toBe(false);
    expect(isNewMmeSearchCtaEnabled(["", "  "])).toBe(false);
  });

  it("returns true when at least one id in a mixed list is non-empty", () => {
    expect(isNewMmeSearchCtaEnabled(["", "valid-id"])).toBe(true);
  });

  it("returns false for null/undefined", () => {
    expect(isNewMmeSearchCtaEnabled(null)).toBe(false);
    expect(isNewMmeSearchCtaEnabled(undefined)).toBe(false);
  });
});

describe("getVisibleMmeFields", () => {
  it("includes variant when options exist after make and model", () => {
    const fields = getVisibleMmeFields(makeModelSelected, emptyOptions);
    expect(fields).toEqual(["make", "model", "variant"]);
  });

  it("stays at make and model when only those are set and no extra options", () => {
    const fields = getVisibleMmeFields(makeModelSelected, {
      ...emptyOptions,
      variants: [],
    });
    expect(fields).toEqual(["make", "model"]);
  });

  it("includes engineCode when API returns engineCodes dictionary", () => {
    const fields = getVisibleMmeFields(makeModelSelected, {
      ...emptyOptions,
      engineCodes: [{ key: "ec1", value: "199A4000" }],
    });
    expect(fields).toContain("engineCode");
    const engineCodeIndex = fields.indexOf("engineCode");
    const engineIndex = fields.indexOf("engine");
    if (engineIndex >= 0) {
      expect(engineCodeIndex).toBeGreaterThan(engineIndex);
    }
  });
});

describe("areAllVisibleMmeFieldsSelected", () => {
  it("returns false when a visible field has no selection", () => {
    const fields = getVisibleMmeFields(makeModelSelected, emptyOptions);
    expect(areAllVisibleMmeFieldsSelected(fields, makeModelSelected, emptyOptions)).toBe(false);
  });

  it("returns true when every visible field is selected", () => {
    const selected: NewMmeSelectedState = { ...makeModelSelected, variant: "v1" };
    const fields = getVisibleMmeFields(selected, emptyOptions);
    expect(areAllVisibleMmeFieldsSelected(fields, selected, emptyOptions)).toBe(true);
  });

  it("counts auto-filled singleton as complete", () => {
    const options: NewMmeOptionsState = {
      ...emptyOptions,
      variants: [{ key: "v-only", value: "Only variant" }],
    };
    const selected: NewMmeSelectedState = { ...makeModelSelected, variant: "v-only" };
    const fields = getVisibleMmeFields(selected, options);
    expect(areAllVisibleMmeFieldsSelected(fields, selected, options)).toBe(true);
  });
});

describe("isNewMmeApplyCtaEnabled", () => {
  it("returns false when carIds exist but visible fields are incomplete", () => {
    const fields = getVisibleMmeFields(makeModelSelected, emptyOptions);
    expect(isNewMmeApplyCtaEnabled(["car-1"], fields, makeModelSelected, emptyOptions)).toBe(false);
  });

  it("returns true when carIds exist and all visible fields are selected", () => {
    const selected: NewMmeSelectedState = { ...makeModelSelected, variant: "v1" };
    const fields = getVisibleMmeFields(selected, emptyOptions);
    expect(isNewMmeApplyCtaEnabled(["car-1"], fields, selected, emptyOptions)).toBe(true);
  });

  it("returns false when fields are complete but carIds are missing", () => {
    const selected: NewMmeSelectedState = { ...makeModelSelected, variant: "v1" };
    const fields = getVisibleMmeFields(selected, emptyOptions);
    expect(isNewMmeApplyCtaEnabled([], fields, selected, emptyOptions)).toBe(false);
  });
});

describe("isE2EMmeApplyCtaEnabled", () => {
  it("enables when carIds length is 1–5 even if progressive fields are incomplete", () => {
    expect(isE2EMmeApplyCtaEnabled(["a", "b"])).toBe(true);
    expect(isE2EMmeApplyCtaEnabled(["solo"])).toBe(true);
  });

  it("disables for empty or more than 5 ids", () => {
    expect(isE2EMmeApplyCtaEnabled([])).toBe(false);
    expect(isE2EMmeApplyCtaEnabled(["1", "2", "3", "4", "5", "6"])).toBe(false);
    expect(isE2EMmeApplyCtaEnabled(null)).toBe(false);
  });
});

describe("shouldE2EPrefillMakeModelOnly / toMakeModelOnlySelected", () => {
  it("is true only for 2–5 url car ids", () => {
    expect(shouldE2EPrefillMakeModelOnly(["a"])).toBe(false);
    expect(shouldE2EPrefillMakeModelOnly(["a", "b"])).toBe(true);
    expect(shouldE2EPrefillMakeModelOnly(["1", "2", "3", "4", "5"])).toBe(true);
    expect(shouldE2EPrefillMakeModelOnly(["1", "2", "3", "4", "5", "6"])).toBe(false);
  });

  it("strips deeper fields and keeps make + model", () => {
    const selected: NewMmeSelectedState = {
      ...makeModelSelected,
      body: "b1",
      variant: "v1",
      engine: "e1",
      gearBox: "g1",
    };
    expect(toMakeModelOnlySelected(selected)).toEqual({
      make: "m1",
      model: "md1",
      variant: null,
      body: null,
      engine: null,
      gearBox: null,
      engineCode: null,
      gearBoxCode: null,
    });
  });
});

describe("getNewMmeDropdownLabelClass", () => {
  it("uses muted text for placeholder state", () => {
    expect(getNewMmeDropdownLabelClass(false)).toContain("text-color-text-muted");
    expect(getNewMmeDropdownLabelClass(false)).not.toContain("text-color-text-emphasis");
  });

  it("uses emphasis text when a value is selected", () => {
    expect(getNewMmeDropdownLabelClass(true)).toContain("text-color-text-emphasis");
  });
});
