import { describe, expect, it } from "vitest";

import type { PartCompatibleCar } from "@/services/cars";
import {
  buildSavedCompatibleGroups,
  formatCompatibleCarLine,
  groupCompatibleCarsByMake,
  makeGroupKey,
} from "./partCompatibleCars";

const car = (
  overrides: Partial<PartCompatibleCar> & Pick<PartCompatibleCar, "id" | "make">,
): PartCompatibleCar => ({
  id: overrides.id,
  make: overrides.make,
  model: overrides.model ?? "MODEL",
  variant: overrides.variant ?? "Other",
  body: overrides.body ?? "Hatchback",
  engine: overrides.engine ?? "1.0 Petrol",
  engineCode: overrides.engineCode ?? "",
  gearBox: overrides.gearBox ?? "Manual",
  gearBoxCode: overrides.gearBoxCode ?? "",
  verifiedMatch: overrides.verifiedMatch ?? false,
});

describe("partCompatibleCars", () => {
  it("makeGroupKey normalizes make names", () => {
    expect(makeGroupKey("ALFA ROMEO")).toBe("ALFA-ROMEO");
  });

  it("formatCompatibleCarLine uses sidebar field order and skips empty values", () => {
    const line = formatCompatibleCarLine(
      car({
        id: "1",
        make: "FIAT",
        model: "PANDA",
        body: "5D",
        variant: "",
        engine: "999cc",
        engineCode: "ABC",
      }),
    );
    expect(line).toBe("PANDA · 5D · 999cc · ABC · Manual");
  });

  it("groupCompatibleCarsByMake groups and sorts makes", () => {
    const groups = groupCompatibleCarsByMake([
      car({ id: "1", make: "B" }),
      car({ id: "2", make: "A" }),
      car({ id: "3", make: "A" }),
    ]);
    expect(groups.map((g) => g.make)).toEqual(["A", "B"]);
    expect(groups[0]!.cars).toHaveLength(2);
    expect(groups[1]!.cars).toHaveLength(1);
  });

  it("buildSavedCompatibleGroups returns empty when no saved ids", () => {
    expect(buildSavedCompatibleGroups([], [car({ id: "1", make: "A" })])).toEqual([]);
  });

  it("buildSavedCompatibleGroups returns empty when no overlap", () => {
    expect(buildSavedCompatibleGroups(["x"], [car({ id: "1", make: "A" })])).toEqual([]);
  });

  it("buildSavedCompatibleGroups intersects and groups by make", () => {
    const compatible = [
      car({ id: "777", make: "A", model: "M1" }),
      car({ id: "123", make: "A", model: "M2" }),
      car({ id: "999", make: "B", model: "M3" }),
      car({ id: "444", make: "C", model: "M4" }),
    ];
    const groups = buildSavedCompatibleGroups(["777", "008", "123", "999"], compatible);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      make: "A",
      cars: expect.arrayContaining([
        expect.objectContaining({ id: "777" }),
        expect.objectContaining({ id: "123" }),
      ]),
    });
    expect(groups[1]).toMatchObject({ make: "B", cars: [expect.objectContaining({ id: "999" })] });
  });
});
