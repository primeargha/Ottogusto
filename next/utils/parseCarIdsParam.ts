/** Parse comma-separated `carIds` query param into a list of ids. */
export function parseCarIdsParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
