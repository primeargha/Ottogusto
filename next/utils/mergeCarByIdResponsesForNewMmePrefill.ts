import type { CarByIdResponse } from "@/services/cars";
import type { NewMmeSelectedState } from "@/stores/useNewMmeStore";

const SCALAR_FIELDS = [
  "make",
  "model",
  "variant",
  "body",
  "engine",
  "gearBox",
  "engineCode",
  "gearBoxCode",
] as const;

type ScalarField = (typeof SCALAR_FIELDS)[number];

function uniqueOrdered(values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/**
 * Merge multiple GET /api/Cars/{id} payloads for New MME prefill.
 * For each key field: if all cars agree on one value, preselect it; if values differ, leave null.
 */
export function mergeCarByIdResponsesForNewMmePrefill(
  cars: CarByIdResponse[],
): NewMmeSelectedState {
  const selected: NewMmeSelectedState = {
    make: null,
    model: null,
    variant: null,
    body: null,
    engine: null,
    gearBox: null,
    engineCode: null,
    gearBoxCode: null,
  };

  for (const field of SCALAR_FIELDS) {
    const uniques = uniqueOrdered(cars.map((c) => c[field as ScalarField] as string | null));
    (selected as Record<ScalarField, string | null>)[field] =
      uniques.length === 1 ? uniques[0]! : null;
  }

  return selected;
}
