export function getApiDataset(): string | undefined {
  return process.env.NEXT_PUBLIC_AXIOM_DATASET?.trim() || undefined;
}

/** UI errors from both stores ingest here (prod: ottogusto-logs). Falls back to API dataset. */
export function getUiDataset(): string | undefined {
  const uiDataset = process.env.NEXT_PUBLIC_AXIOM_UI_DATASET?.trim();
  if (uiDataset) return uiDataset;
  return getApiDataset();
}

export function getStoreDisplayName(): string {
  const store = (process.env.NEXT_PUBLIC_STORE || process.env.STORE || "").toLowerCase();
  if (store === "qverde") return "Qverde";
  if (store === "ottogusto") return "Ottogusto";
  return "Unknown";
}
