import type { CarBrand, CarItem } from "@/types/cars";
import type { PartCompatibleCar } from "@/services/cars";

/** Display order on PDP rows — matches RightSidebar dropdown order, excluding make (accordion title). */
export const PDP_CAR_DISPLAY_FIELDS = [
  "model",
  "body",
  "variant",
  "engine",
  "engineCode",
  "gearBox",
  "gearBoxCode",
] as const satisfies readonly (keyof PartCompatibleCar)[];

export type CompatibleCarGroup = {
  make: string;
  makeKey: string;
  cars: PartCompatibleCar[];
};

export function makeGroupKey(make: string): string {
  return make.trim().toUpperCase().replace(/\s+/g, "-");
}

export function formatCompatibleCarLine(car: PartCompatibleCar): string {
  return PDP_CAR_DISPLAY_FIELDS.map((field) => car[field]?.trim())
    .filter(Boolean)
    .join(" · ");
}

/** Groups compatible cars by make (stable make order A–Z). */
export function groupCompatibleCarsByMake(cars: PartCompatibleCar[]): CompatibleCarGroup[] {
  if (!Array.isArray(cars) || cars.length === 0) return [];

  const byMake = new Map<string, PartCompatibleCar[]>();

  for (const car of cars) {
    const make = car.make?.trim() || "Unknown";
    const existing = byMake.get(make);
    if (existing) {
      existing.push(car);
    } else {
      byMake.set(make, [car]);
    }
  }

  return Array.from(byMake.entries())
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([make, groupCars]) => ({
      make,
      makeKey: makeGroupKey(make),
      cars: groupCars,
    }));
}

/**
 * Intersects saved Cars API ids with part-compatible cars, then groups by make.
 * Returns [] when there are no saved ids or no matches (hide Saved Cars section).
 */
export function buildSavedCompatibleGroups(
  savedCarIds: string[],
  compatibleCars: PartCompatibleCar[],
): CompatibleCarGroup[] {
  if (!savedCarIds.length || !compatibleCars.length) return [];

  const compatibleById = new Map(compatibleCars.map((car) => [car.id, car]));
  const matched: PartCompatibleCar[] = [];

  for (const id of savedCarIds) {
    const car = compatibleById.get(id);
    if (car) matched.push(car);
  }

  return groupCompatibleCarsByMake(matched);
}

function partCompatibleCarToCarItem(
  car: PartCompatibleCar,
  options?: { isSaved?: boolean },
): CarItem {
  return {
    id: car.id,
    partitionKey: "",
    normalizedName: "",
    brandNr: 0,
    brandId: makeGroupKey(car.make),
    brandName: car.make,
    modelNr: 0,
    modelId: "",
    modelName: car.model,
    typeNr: 0,
    typeId: "",
    typeName: car.variant,
    year: 0,
    level: 0,
    partsCount: 0,
    powerHp: 0,
    powerKw: 0,
    cylinders: 0,
    cylinderCapacity: 0,
    engine: car.engine,
    engineName: car.engine,
    tecDoc: { manuId: 0, autoCreate: false },
    popularityIndex: 0,
    displayLine: formatCompatibleCarLine(car),
    body: car.body,
    variant: car.variant,
    engineCode: car.engineCode,
    gearBox: car.gearBox,
    gearBoxCode: car.gearBoxCode,
    isMatching: options?.isSaved ? true : car.verifiedMatch,
  };
}

export function toCarBrandGroups(
  groups: CompatibleCarGroup[],
  options?: { isSaved?: boolean },
): CarBrand[] {
  return groups.map((group) => {
    const brand: CarBrand = {
      brandId: group.makeKey,
      brandName: group.make,
      items: group.cars.map((car) => partCompatibleCarToCarItem(car, options)),
    };
    if (options?.isSaved) {
      brand.isSaved = true;
    }
    return brand;
  });
}

export function normalizePartCompatibleCarsResponse(payload: unknown): PartCompatibleCar[] {
  if (Array.isArray(payload)) return payload as PartCompatibleCar[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: PartCompatibleCar[] }).data;
  }
  return [];
}
