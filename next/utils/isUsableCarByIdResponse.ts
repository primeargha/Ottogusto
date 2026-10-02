import type { CarByIdResponse } from "@/services/cars";

/** True when GET /Cars/{id} returned a car we can show (not a bare / empty payload). */
export function isUsableCarByIdResponse(car: CarByIdResponse | null | undefined): boolean {
  if (!car) return false;
  const id = car.id != null ? String(car.id).trim() : "";
  if (!id) return false;
  const make = car.make != null ? String(car.make).trim() : "";
  const model = car.model != null ? String(car.model).trim() : "";
  // No make/model → nothing meaningful for the banner dropdown (would fall back to raw id).
  return Boolean(make || model);
}
