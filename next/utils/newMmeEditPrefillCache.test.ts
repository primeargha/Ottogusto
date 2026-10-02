import { describe, expect, it } from "vitest";

import {
  getEditPrefillCache,
  invalidateEditPrefillCache,
  setEditPrefillCache,
} from "@/utils/newMmeEditPrefillCache";
import type { NewMmeOptionsState, NewMmeSelectedState } from "@/stores/useNewMmeStore";

const emptySelected: NewMmeSelectedState = {
  make: "m1",
  model: "md1",
  variant: null,
  body: null,
  engine: null,
  gearBox: null,
  engineCode: null,
  gearBoxCode: null,
};

const emptyOptions: NewMmeOptionsState = {
  makes: [{ key: "m1", value: "Fiat" }],
  models: [{ key: "md1", value: "500" }],
  variants: [],
  bodys: [],
  engines: [],
  gearBoxes: [],
  engineCodes: [],
  gearBoxCodes: [],
};

describe("newMmeEditPrefillCache", () => {
  it("stores and retrieves snapshot by car id", () => {
    invalidateEditPrefillCache();
    setEditPrefillCache("car-123", {
      selected: emptySelected,
      options: emptyOptions,
      carIds: ["car-123"],
      hasCarIdsProperty: true,
    });
    const hit = getEditPrefillCache("car-123");
    expect(hit?.carIds).toEqual(["car-123"]);
    expect(hit?.selected.make).toBe("m1");
  });

  it("invalidates a single car id", () => {
    setEditPrefillCache("car-a", {
      selected: emptySelected,
      options: emptyOptions,
      carIds: ["car-a"],
      hasCarIdsProperty: true,
    });
    invalidateEditPrefillCache("car-a");
    expect(getEditPrefillCache("car-a")).toBeNull();
  });
});
