import type { ProductDoc } from "@/types/product";

export const getDocFileNameFromUrl = (url: string): string => {
  try {
    const sanitizedUrl = url.split("#")[0]?.split("?")[0];
    const fileName = sanitizedUrl?.split("/").pop() || "Document.pdf";
    return decodeURIComponent(fileName);
  } catch {
    return "Document.pdf";
  }
};

/** Filters by non-empty url; preserves API order when every item has order 0; otherwise sorts by order ascending. */
export function normalizeProductDocs(
  docs: ProductDoc[] | undefined | null | unknown,
): ProductDoc[] {
  if (!docs || !Array.isArray(docs)) return [];
  const valid: ProductDoc[] = [];
  for (const raw of docs) {
    const d = raw as Partial<ProductDoc>;
    if (d && typeof d.url === "string" && d.url.trim().length > 0) {
      const order = typeof d.order === "number" && !Number.isNaN(d.order) ? d.order : 0;
      const name = typeof d.name === "string" ? d.name : "";
      valid.push({ order, name, url: d.url.trim() });
    }
  }
  if (valid.length === 0) return [];
  const allOrderZero = valid.every((item) => (item.order ?? 0) === 0);
  if (allOrderZero) return valid;
  return valid
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const oa = a.item.order ?? 0;
      const ob = b.item.order ?? 0;
      if (oa !== ob) return oa - ob;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
