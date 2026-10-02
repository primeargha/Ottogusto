import type { PreviousSearchDataInterface as LegacyPreviousSearch } from "@/stores/useSearchModalStore";
import type { PreviousSearchDataInterface } from "@/stores/useMmeStore";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";
import { buildLegacyMmeCarLabel } from "@/utils/searchResultsDisplayTitle";

const LEGACY_STORAGE_KEY = "search-modal-storage";
const MIGRATION_FLAG_KEY = "previous_search_legacy_migrated_v1";

export function previousSearchSignature(entry: {
  OERef?: string | null;
  carIds?: string[];
  makeModelTypeId?: string;
  categoryId?: string | null;
}): string {
  const oe = entry.OERef?.trim();
  if (oe) return `oe:${oe}`;

  const carId = entry.carIds?.[0]?.trim();
  if (carId) return `car:${carId}:${entry.categoryId?.trim() ?? ""}`;

  const mmyt = entry.makeModelTypeId?.trim();
  if (mmyt) return `mmyt:${mmyt}:${entry.categoryId?.trim() ?? ""}`;

  const cat = entry.categoryId?.trim();
  if (cat) return `cat:${cat}`;

  return "";
}

export function previousSearchSignatureFromEntry(entry: {
  OERef?: string | null | undefined;
  carIds?: string[] | undefined;
  makeModelTypeId?: string | undefined;
  categoryId?: string | null | undefined;
}): string {
  const payload: {
    OERef?: string | null;
    carIds?: string[];
    makeModelTypeId?: string;
    categoryId?: string | null;
  } = {};

  if (entry.OERef != null) payload.OERef = entry.OERef;
  if (entry.carIds && entry.carIds.length > 0) payload.carIds = entry.carIds;
  if (entry.makeModelTypeId) payload.makeModelTypeId = entry.makeModelTypeId;
  if (entry.categoryId != null) payload.categoryId = entry.categoryId;

  return previousSearchSignature(payload);
}

export function legacyPreviousSearchToMmeItem(
  item: LegacyPreviousSearch,
): PreviousSearchDataInterface | null {
  const oeRef = item.OERef?.trim();
  const mmyt = item.mmytData as {
    make?: { value?: string };
    model?: { value?: string };
    engine?: { value?: string };
    type?: { value?: string };
  } | null;
  const make = item.make?.trim() || mmyt?.make?.value?.trim() || "";
  const model = item.model?.trim() || mmyt?.model?.value?.trim() || "";
  const engine =
    mmyt?.engine?.value?.trim() || item.type?.trim() || mmyt?.type?.value?.trim() || "";

  const partsList = Array.isArray(item.parts) ? item.parts : item.parts ? [item.parts] : [];
  const categoryId = pickPrimaryCategoryId(
    partsList.map((p: { id?: string }) => p?.id).filter(Boolean) as string[],
  );

  if (!oeRef && !make && !categoryId) return null;

  return {
    make,
    model,
    engine,
    timeAgo: item.timeAgo || new Date().toISOString(),
    OERef: oeRef || null,
    parts: item.parts ?? null,
    categoryId: categoryId ?? null,
    carLabel: buildLegacyMmeCarLabel(make, model) || null,
    title: item.title ?? null,
    subtitle: item.subtitle ?? null,
    makeModelTypeId: item.makeModelTypeId,
    mmytData: item.mmytData ?? null,
  };
}

/** One-time merge of `search-modal-storage` previous searches into `useMmeStore`. */
export function migrateLegacyPreviousSearchesOnce(
  prepend: (entry: PreviousSearchDataInterface) => void,
): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return;

  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATION_FLAG_KEY, "1");
      return;
    }

    const parsed = JSON.parse(raw) as { state?: { previousSearches?: LegacyPreviousSearch[] } };
    const legacy = parsed?.state?.previousSearches;
    if (!Array.isArray(legacy) || legacy.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, "1");
      return;
    }

    for (let i = legacy.length - 1; i >= 0; i--) {
      const converted = legacyPreviousSearchToMmeItem(legacy[i]!);
      if (converted) prepend(converted);
    }
  } catch {
    // ignore corrupt legacy storage
  } finally {
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
  }
}
