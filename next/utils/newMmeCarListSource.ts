/**
 * Auth-isolated car id lists for new MME banner dropdown and hero slider.
 * Guest → session only; logged-in → Garage only. No cross-source merge.
 */
export function buildNewMmeCarListIds(
  usesSession: boolean,
  sessionCarIds: string[],
  garageCarIds: string[],
): string[] {
  return usesSession ? [...sessionCarIds] : [...garageCarIds];
}
