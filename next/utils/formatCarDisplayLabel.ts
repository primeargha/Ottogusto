import type { CarByIdResponse } from "@/services/cars";

/** SRP compatibility banner dropdown: only API `make` and `model` (no variant/body/engine/gearbox). */
export function formatCarDisplayLabel(car: CarByIdResponse): string {
  const make = car.make != null ? String(car.make).trim() : "";
  const model = car.model != null ? String(car.model).trim() : "";

  if (make && model) return `${make} ${model}`;
  if (make) return make;
  if (model) return model;

  return car.id;
}
