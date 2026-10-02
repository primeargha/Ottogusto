import type { QueryClient } from "@tanstack/react-query";
import type { GarageItem, GetGarageResponse } from "@/type";
import {
  isE2EGarageMakeModelOnlyName,
  normalizeSavedCarVin,
  parseGarageMakeModelOnlyCarIds,
  resolveUrlCarIdsForSavedCar,
} from "@/utils/e2eSavedCarMeta";

/** New MME rows must have Garage record `id` and Cars API `carId`. */
export function hasGarageCarId(item: GarageItem | null | undefined): boolean {
  return Boolean(item?.id?.trim() && item?.carId?.trim());
}

export function filterNewMmeGarageCars(items: GarageItem[] | null | undefined): GarageItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((row) => hasGarageCarId(row));
}

export function findGarageRecordIdByCarId(
  rows: GarageItem[] | null | undefined,
  carsApiId: string,
): string | undefined {
  const target = carsApiId.trim();
  if (!target) return undefined;
  return filterNewMmeGarageCars(rows)
    .find((row) => row.carId?.trim() === target)
    ?.id?.trim();
}

export function getGarageCarsFromCache(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): GarageItem[] {
  const data = queryClient.getQueryData<GetGarageResponse>(queryKey);
  return filterNewMmeGarageCars(data?.data);
}

export function findGarageRecordIdByCarIdFromCache(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  carsApiId: string,
): string | undefined {
  return findGarageRecordIdByCarId(getGarageCarsFromCache(queryClient, queryKey), carsApiId);
}

export function isCarIdInGarageCache(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  carsApiId: string,
): boolean {
  return Boolean(findGarageRecordIdByCarIdFromCache(queryClient, queryKey, carsApiId));
}

export function hasGarageDisplayNames(item: GarageItem | null | undefined): boolean {
  return Boolean(item?.brandName?.trim() || item?.modelName?.trim());
}

export function formatGarageItemDisplayLabel(item: GarageItem): string {
  const brand = item.brandName?.trim() ?? "";
  const model = item.modelName?.trim() ?? "";
  if (brand && model) return `${brand} ${model}`;
  if (brand) return brand;
  if (model) return model;
  // Never surface the E2E sentinel `name: "makeModelOnly…"` as a UI label.
  const rawName = item.name?.trim() ?? "";
  if (rawName && !isE2EGarageMakeModelOnlyName(rawName)) return rawName;
  return item.carId?.trim() || item.id?.trim() || "";
}

/** Logged-in E2E: Garage `name` makeModelOnly (+ optional encoded ids) → Make+Model prefill. */
export function isGarageItemMakeModelOnly(item: GarageItem | null | undefined): boolean {
  return isE2EGarageMakeModelOnlyName(item?.name);
}

/** Logged-in: valid VIN attached when the car was saved via Search by VIN. */
export function getGarageItemVin(item: GarageItem | null | undefined): string | null {
  return normalizeSavedCarVin(item?.vin);
}

export function findGarageVinByCarId(
  rows: GarageItem[] | null | undefined,
  carsApiId: string | null | undefined,
): string | null {
  const carId = carsApiId?.trim();
  if (!carId) return null;
  const row = filterNewMmeGarageCars(rows).find((item) => item.carId?.trim() === carId);
  return getGarageItemVin(row);
}

/** Logged-in: full filter carIds (2–5) encoded in Garage `name`, else null. */
export function findGarageSiblingCarIdsByCarId(
  rows: GarageItem[] | null | undefined,
  carsApiId: string | null | undefined,
): string[] | null {
  const carId = carsApiId?.trim();
  if (!carId) return null;
  const row = filterNewMmeGarageCars(rows).find((item) => item.carId?.trim() === carId);
  if (!row) return null;
  const fromName = parseGarageMakeModelOnlyCarIds(row.name);
  if (!fromName) return null;
  return resolveUrlCarIdsForSavedCar(carId, { getSiblingCarIds: () => fromName });
}

export function findGarageItemByRecordOrCarId(
  rows: GarageItem[] | null | undefined,
  garageRecordId: string | null | undefined,
  carsApiId: string | null | undefined,
): GarageItem | undefined {
  const list = filterNewMmeGarageCars(rows);
  const recordId = garageRecordId?.trim();
  if (recordId) {
    const byId = list.find((row) => row.id?.trim() === recordId);
    if (byId) return byId;
  }
  const carId = carsApiId?.trim();
  if (carId) {
    return list.find((row) => row.carId?.trim() === carId);
  }
  return undefined;
}

export function garageItemToHeroShape(item: GarageItem): {
  id: string;
  carId: string;
  title: string;
  subtitle: string;
} {
  const id = item.id?.trim() || "";
  const carId = item.carId?.trim() || "";
  const label = formatGarageItemDisplayLabel(item);
  const [title, ...rest] = label.split(" ");
  return {
    id,
    carId,
    title: title || label || carId,
    subtitle: rest.join(" ").trim(),
  };
}
