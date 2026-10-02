import { describe, expect, it } from "vitest";
import type { GarageItem } from "@/type";
import {
  filterNewMmeGarageCars,
  findGarageRecordIdByCarId,
  garageItemToHeroShape,
  hasGarageCarId,
} from "./garageCarId";

describe("garageCarId", () => {
  it("hasGarageCarId requires id and carId", () => {
    expect(hasGarageCarId({ id: "g1", carId: "c1" } as GarageItem)).toBe(true);
    expect(hasGarageCarId({ id: "g1", carId: null } as GarageItem)).toBe(false);
    expect(hasGarageCarId({ id: null, carId: "c1" } as GarageItem)).toBe(false);
  });

  it("findGarageRecordIdByCarId returns garage id", () => {
    const rows = [{ id: "my_car_id", carId: "cars-api-9" }] as GarageItem[];
    expect(findGarageRecordIdByCarId(rows, "cars-api-9")).toBe("my_car_id");
    expect(filterNewMmeGarageCars(rows)).toHaveLength(1);
  });

  it("garageItemToHeroShape uses brand/model labels", () => {
    const item = {
      id: "g1",
      carId: "c1",
      brandName: "BMW",
      modelName: "320",
    } as GarageItem;
    expect(garageItemToHeroShape(item)).toMatchObject({
      id: "g1",
      carId: "c1",
      title: "BMW",
      subtitle: "320",
    });
  });
});
