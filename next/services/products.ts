// Example usage:
import { cache } from "react";
import { apiClient, ApiError } from "@/config/api";
import { MAX_COUNT } from "@/constants";
import { Axios, AxiosHeaders, AxiosResponse } from "axios";
import type { PostPartsSearchPayload, PostPartsSearchResponse } from "@/type";

/** POST /api/Parts (search/filter parts). Body: PostPartsSearchPayload. Returns { data: PostPartsSearchResponse }. */
export const getParts = async (
  data: PostPartsSearchPayload,
): Promise<{ data: PostPartsSearchResponse }> => {
  try {
    const response = await apiClient.post<{ data: PostPartsSearchResponse }>(`/Parts`, data);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export const getManufacturer = async () => {
  try {
    const parts = await apiClient.get<any>(`/Manufacturer`);
    return parts;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export type ManufacturerListItem = {
  id: string;
  name: string;
  type?: string | null;
  image?: string | null;
};

/** Unwrap `GET /Manufacturer` whether the body is an array or `{ data: [...] }` (and apiClient `{ data: body }`). */
export function unwrapManufacturerList(payload: unknown): ManufacturerListItem[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const raw = item as Record<string, unknown>;
      const id = raw.id == null ? "" : String(raw.id).trim();
      const name = raw.name == null ? "" : String(raw.name).trim();
      if (!id || !name) return [];
      return [
        {
          id,
          name,
          type: raw.type == null ? null : String(raw.type),
          image: raw.image == null ? null : String(raw.image),
        } satisfies ManufacturerListItem,
      ];
    });
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    return unwrapManufacturerList((payload as { data: unknown }).data);
  }
  return [];
}

/** Car Part Brand detail by public path slug (`GET /Manufacturer/slug/{slug}`). */
export type ManufacturerBySlug = {
  id: string;
  name: string;
  type: string | null;
  image: string | null;
  slug: string | null;
  shortDescriptions: Record<string, string> | string | null;
  fullDescriptions: Record<string, string> | string | null;
};

// `cache()`-wrapped: both the brand+L3 and brand-only pages call this once from
// `generateMetadata` and once from the page body — dedupe to one request per
// render pass instead of two independent network calls per page load.
export const getManufacturerBySlug = cache(
  async (slug: string): Promise<ManufacturerBySlug | null> => {
    try {
      // apiClient wraps the JSON body as `{ data: body }`.
      const response = await apiClient.get<{ data: ManufacturerBySlug }>(
        `/Manufacturer/slug/${encodeURIComponent(slug)}`,
      );
      const payload = response?.data;
      if (!payload || typeof payload !== "object" || !payload.id) return null;
      return payload;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`Error ${error.status}: ${error.message}`);
      }
      return null;
    }
  },
);

export const getCarDataFromMMYTId = async (mmytId: string) => {
  try {
    const response = await apiClient.get<any>(`/MakeModelType/${mmytId}`);

    return response;
  } catch (error) {
    console.error("❌ API ERROR: getCarDataFromMMYTId", error);
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export type EngineTrimResponseDataInterface = {
  engineSize: string[];
  fuel: string[];
  powerHp: string[];
  body: string[];
  doors: string[];
  seats: string[];
  variant: string[];
};
// | { error: Error };

export const getCarEngineNTrimByMMTId = async (
  mmtId: string = "00a00b00000000",
): Promise<EngineTrimResponseDataInterface> => {
  try {
    const response = await apiClient.get<AxiosResponse>(`/MakeModelType/trims/${mmtId}`);
    // debugger;
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ API ERROR: getCarEngineNTrimByMMTId", error);
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};
