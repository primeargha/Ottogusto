/**
 * Cockpit may emit literal tokens in JSON-LD strings; replace them on the server
 * before parse/render. ($minValue$ / $maxValue$ handled separately when needed.)
 */
export function applyProductSchemaServerPlaceholders(
  schemaRaw: string,
  fullUrl: string,
  countryCode: string | null,
): string {
  let out = schemaRaw.replaceAll("$URL$", fullUrl);
  if (countryCode) {
    out = out.replaceAll("$LOCALE$", countryCode);
  }
  return out;
}
