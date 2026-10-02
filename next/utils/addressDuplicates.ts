import type { Address } from "@/types/profile";

type AddressLike = Pick<
  Address,
  | "id"
  | "companyName"
  | "name"
  | "houseNumber"
  | "street"
  | "city"
  | "postalCode"
  | "country"
  | "isCompany"
>;

export const normalizeAddressField = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase();

const personalFieldsEqual = (a: AddressLike, b: AddressLike): boolean =>
  normalizeAddressField(a.houseNumber) === normalizeAddressField(b.houseNumber) &&
  normalizeAddressField(a.street) === normalizeAddressField(b.street) &&
  normalizeAddressField(a.city) === normalizeAddressField(b.city) &&
  normalizeAddressField(a.postalCode) === normalizeAddressField(b.postalCode) &&
  normalizeAddressField(a.country) === normalizeAddressField(b.country);

// API/store often uses `name` for company name on business addresses; compare using either
const companyNameNorm = (x: AddressLike): string => normalizeAddressField(x.companyName ?? x.name);

const businessFieldsEqual = (a: AddressLike, b: AddressLike): boolean =>
  companyNameNorm(a) === companyNameNorm(b) &&
  normalizeAddressField(a.houseNumber) === normalizeAddressField(b.houseNumber) &&
  normalizeAddressField(a.street) === normalizeAddressField(b.street) &&
  normalizeAddressField(a.city) === normalizeAddressField(b.city) &&
  normalizeAddressField(a.postalCode) === normalizeAddressField(b.postalCode) &&
  normalizeAddressField(a.country) === normalizeAddressField(b.country);

export interface FindDuplicateOptions {
  excludeId?: string | null;
  mode: "personal" | "business";
}

export function findDuplicateAddress(
  candidate: AddressLike,
  existing: AddressLike[] | undefined | null,
  options: FindDuplicateOptions,
): AddressLike | null {
  if (!existing || existing.length === 0) return null;

  const { excludeId, mode } = options;

  const hasAllRequiredFields =
    mode === "personal"
      ? !!candidate.houseNumber &&
        !!candidate.street &&
        !!candidate.city &&
        !!candidate.postalCode &&
        !!candidate.country
      : !!candidate.companyName &&
        !!candidate.houseNumber &&
        !!candidate.street &&
        !!candidate.city &&
        !!candidate.postalCode &&
        !!candidate.country;

  if (!hasAllRequiredFields) return null;

  const match = existing.find((addr) => {
    if (excludeId && addr.id && addr.id === excludeId) return false;
    if (mode === "personal") {
      if (addr.isCompany) return false;
      return personalFieldsEqual(candidate, addr);
    }
    if (!addr.isCompany) return false;
    return businessFieldsEqual(candidate, addr);
  });

  return match ?? null;
}
