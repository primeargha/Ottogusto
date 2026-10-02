import { apiClient, ApiError } from "@/config/api";
import type { PartVinCheckPayload, PartVinCheckResponse, VinCarsSearchResponse } from "@/type";

export const checkPartVin = async (
  data: PartVinCheckPayload,
): Promise<{ data: PartVinCheckResponse }> => {
  const vinNumber = String(data?.vinNumber ?? "")
    .trim()
    .toUpperCase();
  const partIds = (data?.partIds ?? []).map((id) => String(id).trim()).filter(Boolean);
  if (!vinNumber || partIds.length === 0) {
    throw new ApiError(400, "vinNumber and partIds are required for part VIN check");
  }

  try {
    const response = await apiClient.post<{ data: PartVinCheckResponse }>(`/Vin`, {
      vinNumber,
      partIds,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

/**
 * GET /api/Vin/{vinNumber} — resolve vehicles from VIN (E2E search flow).
 * Not the same as POST /Vin part Fit/Maybe/No check.
 */
export const searchCarsByVin = async (
  vinNumber: string,
): Promise<{ data: VinCarsSearchResponse }> => {
  const trimmed = vinNumber.trim().toUpperCase();
  try {
    return await apiClient.get<{ data: VinCarsSearchResponse }>(
      `/Vin/${encodeURIComponent(trimmed)}`,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
