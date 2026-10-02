import { ApiError } from "@/config/api";
import { VALID_VIN_REGEX } from "@/utils/vinCheck";
import type { VinCarsSearchCar, VinCarsSearchResponse } from "@/type";

/** Client format errors — same rules as PDP / checkout. Returns null when valid. */
export function getVinClientFormatError(
  vin: string,
  getLabel: (key: string) => string,
): string | null {
  const trimmed = vin.trim().toUpperCase();
  if (!trimmed) return null;
  if (trimmed.length !== 17) {
    const label = getLabel("vin_length_error");
    return label && label !== "vin_length_error" ? label : "VIN must be 17 characters long";
  }
  if (!VALID_VIN_REGEX.test(trimmed)) {
    const label = getLabel("vin_invalid_characters");
    return label && label !== "vin_invalid_characters"
      ? label
      : "VIN must contain only letters and numbers, excluding I, O, and Q.";
  }
  return null;
}

export function normalizeVinCarsToCarIds(cars: VinCarsSearchCar[] | undefined | null): string[] {
  if (!cars?.length) return [];
  return cars.map((car) => (car?.id || "").trim()).filter(Boolean);
}

export function unwrapVinCarsSearchPayload(
  response: { data: VinCarsSearchResponse } | VinCarsSearchResponse,
): VinCarsSearchResponse {
  const raw = response as { data?: VinCarsSearchResponse } & VinCarsSearchResponse;
  if (raw?.data && Array.isArray(raw.data.cars)) {
    return raw.data;
  }
  return raw as VinCarsSearchResponse;
}

/** Case 2 HTTP errors for VIN → cars search (doc §4.3). */
export function isVinCarsSearchHttpFailure(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  const status = error.status;
  return status === 400 || status === 409 || status === 500 || status >= 400;
}

/** GET /Vin/{vin} → 406 Not Acceptable (brand not supported by this store). */
export function isVinCarsSearchBrandUnsupported(error: unknown): boolean {
  return error instanceof ApiError && error.status === 406;
}

/** Problem+json `detail` — for 406 this is the brand name (e.g. "TOYOTA"), or null. */
export function getVinCarsSearchErrorDetail(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const detail = error.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  return null;
}

export function getVinSearchUnableSelectLabel(getLabel: (key: string) => string): string {
  const label = getLabel("vin_side_panel_vehicle_not_found_message");
  return label && label !== "vin_side_panel_vehicle_not_found_message"
    ? label
    : "We were unable to select your vehicle using VIN. Try again or continue selecting your car below.";
}

/**
 * Map GET /Vin failure → sidebar VIN error (+ brand-unsupported flag for 406 support form).
 * 406: `vin_side_panel_brand_not_supported_message` with `{brand_name}` from API `detail`
 * (locale may place the brand anywhere — do not append).
 */
export function resolveVinCarsSearchFailureUi(
  error: unknown,
  getLabel: (key: string, replaceKeys?: { [key: string]: string | number }) => string,
): { message: string; brandUnsupported: boolean } {
  if (isVinCarsSearchBrandUnsupported(error)) {
    const brand = getVinCarsSearchErrorDetail(error) || "";
    const fallback = "Unfortunately, we currently do not support {brand_name}.";
    const raw = getLabel("vin_side_panel_brand_not_supported_message", {
      brand_name: brand,
    });
    const message =
      raw && raw !== "vin_side_panel_brand_not_supported_message"
        ? raw
        : fallback.replace(/\{brand_name\}/g, brand);
    return {
      message,
      brandUnsupported: true,
    };
  }
  return {
    message: getVinSearchUnableSelectLabel(getLabel),
    brandUnsupported: false,
  };
}
