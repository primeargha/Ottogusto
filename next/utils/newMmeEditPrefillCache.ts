import type { NewMmeOptionsState, NewMmeSelectedState } from "@/stores/useNewMmeStore";

/** Hydrated sidebar state after a successful Edit / hero Save prefill for one Cars API id. */
export type EditPrefillSnapshot = {
  selected: NewMmeSelectedState;
  options: NewMmeOptionsState;
  carIds: string[];
  hasCarIdsProperty: boolean;
};

const cache = new Map<string, EditPrefillSnapshot>();

function normalizeCarId(carId: string): string | null {
  const trimmed = carId.trim();
  return trimmed || null;
}

export function getEditPrefillCache(carId: string): EditPrefillSnapshot | null {
  const key = normalizeCarId(carId);
  if (!key) return null;
  return cache.get(key) ?? null;
}

export function setEditPrefillCache(carId: string, snapshot: EditPrefillSnapshot): void {
  const key = normalizeCarId(carId);
  if (!key) return;
  cache.set(key, snapshot);
}

export function invalidateEditPrefillCache(carId?: string | null): void {
  if (carId == null) {
    cache.clear();
    return;
  }
  const key = normalizeCarId(carId);
  if (!key) return;
  cache.delete(key);
}
