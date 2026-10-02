import { z } from "zod";

/**
 * Zod schema factory for guest address validation (same as DeliveryaddressInput).
 * VAT number is required only when isBusiness and isAuthenticated (logged-in business tab purchase).
 * Guest users cannot do business purchase and must login first, so VAT is not required for guests.
 */
const COUNTRIES_WITH_STATE_FIELD = ["DE", "AT", "IT", "ES", "PT"];

export const createGuestAddressSchema = (
  getLabel: (key: string) => string,
  isBusiness?: boolean,
  isAuthenticated?: boolean,
) =>
  z
    .object({
      name: z.string().optional(),
      street: z.string().min(1, getLabel("Checkout_streetname_required")),
      houseNumber: z.string().optional(),
      buildingNumber: z.string().optional(),
      city: z.string().min(1, getLabel("Checkout_city_required")),
      state: z.string().optional(),
      postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
      country: z.string().min(1, "Country is required"),
      phoneNumber: z.string().optional(),
      isDefaultBilling: z.boolean().optional(),
      isDefaultShipping: z.boolean().optional(),
      vatNumber:
        isBusiness === true && isAuthenticated === true
          ? z.string().min(1, getLabel("vat_number_required") || "VAT number is required")
          : z.string().optional(),
    })
    .refine(
      (data) => {
        const requiredCountries = ["be", "nl", "lu"];
        const countryLower = data.country?.toLowerCase();
        if (requiredCountries.includes(countryLower)) {
          return !!data.houseNumber && data.houseNumber.trim() !== "";
        }
        return true;
      },
      {
        message: getLabel("Checkout_housenumber_required"),
        path: ["houseNumber"],
      },
    );
/* Note: state/region and Box/Unit/Bus Number are fully optional, no extra refine */

/**
 * Format address: street, house number, then bus/box (Bus-), then city, postal, country.
 */
export const formatAddress = (
  street: string,
  city: string,
  postalCode: string,
  state: string | undefined,
  country: string,
  houseNumber?: string,
  buildingNumber?: string,
): string => {
  let streetPart = street || "";
  if (houseNumber && houseNumber.trim()) {
    streetPart += ` ${houseNumber}`;
  }
  if (buildingNumber && buildingNumber.trim()) {
    streetPart += ` Bus-${buildingNumber}`;
  }
  const parts = [streetPart, city || "", postalCode || "", country || ""];
  return parts.filter((part) => part).join(", ");
};

/**
 * Returns true if the address data represents a business address (has isCompany or non-empty VAT).
 * Used for form prefill separation: delivery form must never use business data; billing form in business mode must only use business data.
 */
export function isBusinessAddress(
  data:
    | { isCompany?: boolean | undefined; vatNumber?: string | null | undefined }
    | null
    | undefined,
): boolean {
  if (!data) return false;
  if (data.isCompany === true) return true;
  const vat = data.vatNumber;
  return typeof vat === "string" && vat.trim() !== "";
}
