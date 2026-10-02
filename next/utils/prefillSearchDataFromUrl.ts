import type { MakeModelTypeBrandItem } from "@/type";
import { getBrands, getModels, getYears, getTypes } from "@/services/search";
import { getCarDataFromMMYTId } from "@/services/products";
import formatEditSearchData from "./formatEditSearchData";

interface SearchData {
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;
}

interface GeneratedIds {
  makeId: string;
  modelId?: string;
  typeId?: string;
  idType: "make" | "model" | "type" | "complete";
}

interface CarInfoInterface {
  makeId?: string;
  modelId?: string;
  typeId?: string;
  makeModelTypeId?: string;
  year?: string | number;
}

interface MMYTCarData {
  brandId: string;
  modelId: string;
  typeId: string;
  brandName: string;
  modelName: string;
  typeName: string;
  yearFrom?: string | number;
  year?: string | number;
}

interface Type {
  id: string;
  type: string;
}

/**
 * Determines the type of ID and generates the parent IDs based on the pattern
 * @param makeModelTypeId - The 14-digit ID from URL
 * @returns Object containing the generated IDs and the type
 */
const generateIdsFromMakeModelTypeId = (makeModelTypeId: string): GeneratedIds => {
  if (!makeModelTypeId || makeModelTypeId.length !== 17) {
    throw new Error("Invalid makeModelTypeId: must be 17 digits");
  }

  // Check from the back to determine ID type
  const reversedId = makeModelTypeId.split("").reverse().join("");

  // Count consecutive zeros from the end
  let zeroCount = 0;
  for (let i = 0; i < reversedId.length; i++) {
    if (reversedId[i] === "0") {
      zeroCount++;
    } else {
      break;
    }
  }

  // Check for complete makeModelTypeId: scan from front, if non-zero found after 6th position
  // (first 6 positions are for make and model id, rest contains year and type info)
  let hasNonZeroAfter6thPosition = false;
  for (let i = 6; i < makeModelTypeId.length; i++) {
    // Check positions 6 onwards from the front
    if (makeModelTypeId[i] !== "0") {
      hasNonZeroAfter6thPosition = true;

      break;
    }
  }

  if (hasNonZeroAfter6thPosition) {
    // Complete makeModelTypeId - needs API call to getCarDataFromMMYTId

    return {
      makeId: "", // Will be generated from API response
      modelId: "", // Will be generated from API response
      typeId: makeModelTypeId,
      idType: "complete",
    };
  } else if (zeroCount === 5) {
    // Simple Type ID - generate makeId and modelId
    const makeId = makeModelTypeId.substring(0, 3) + "00000000000";
    const modelId = makeModelTypeId.substring(0, 6) + "00000000";

    return {
      makeId,
      modelId,
      typeId: makeModelTypeId,
      idType: "type",
    };
  } else if (zeroCount === 8) {
    // Model ID - generate makeId
    const makeId = makeModelTypeId.substring(0, 3) + "00000000000";

    return {
      makeId,
      modelId: makeModelTypeId,
      idType: "model",
    };
  } else if (zeroCount === 11) {
    // Make ID

    return {
      makeId: makeModelTypeId,
      idType: "make",
    };
  } else {
    console.error("🔍 UNKNOWN ID PATTERN - zeroCount:", zeroCount);
    throw new Error("Invalid makeModelTypeId pattern");
  }
};

/**
 * Creates car data from the API response for complete makeModelTypeId
 * @param apiResponse - Response from getCarDataFromMMYTId API
 * @returns CarInfoInterface object
 */
const createCarDataFromApiResponse = (
  apiResponse: { data?: MMYTCarData } & Partial<MMYTCarData>,
): CarInfoInterface => {
  // Handle both cases: data wrapped in 'data' property or direct response
  const data = apiResponse.data || apiResponse;

  // Generate IDs according to the pattern
  const makeId = (data.brandId || "") + "00000000000"; // brandId + 11 zeros
  const modelId = (data.brandId || "") + (data.modelId || "") + "00000000"; // brandId + modelId + 8 zeros
  const typeId = (data.brandId || "") + (data.modelId || "") + (data.typeId || "") + "00000"; // brandId + modelId + typeId + 5 zeros

  // Use yearFrom if available, otherwise use year
  const yearValue = data.yearFrom || data.year || "";

  return {
    makeId,
    modelId,
    typeId,
    year: yearValue,
  };
};

/**
 * Creates search data directly from the API response for complete makeModelTypeId
 * @param apiResponse - Response from getCarDataFromMMYTId API
 * @param urlYear - Year value from URL parameter (optional)
 * @returns SearchData object
 */
const createSearchDataFromApiResponse = (
  apiResponse: { data?: MMYTCarData } & Partial<MMYTCarData>,
  urlYear?: string,
): SearchData => {
  // Handle both cases: data wrapped in 'data' property or direct response
  const data = apiResponse.data || apiResponse;

  // Generate IDs according to the pattern
  const makeId = (data.brandId || "") + "00000000000"; // brandId + 11 zeros
  const modelId = (data.brandId || "") + (data.modelId || "") + "00000000"; // brandId + modelId + 8 zeros
  const typeId = (data.brandId || "") + (data.modelId || "") + (data.typeId || "") + "00000"; // brandId + modelId + typeId + 5 zeros

  // Use year from URL if provided, otherwise fall back to API response
  const yearValue = urlYear || data.yearFrom || data.year || "";

  const result: SearchData = {
    make: {
      key: makeId,
      value: data.brandName || "",
    },
    model: {
      key: modelId,
      value: data.modelName || "",
    },
    year: {
      key: modelId, // Use modelId as key for year as per existing pattern
      value: yearValue.toString(),
    },
    type: {
      key: typeId,
      value: data.typeName || "",
    },
  };

  return result;
};

/**
 * Prefills SearchData based on makeModelTypeId from URL
 * @param makeModelTypeId - The 17-digit ID from URL parameters
 * @param urlYear - Year value from URL parameter (optional)
 * @returns Promise<SearchData> - Formatted search data object
 */
const prefillSearchDataFromUrl = async (
  makeModelTypeId: string,
  urlYear?: string,
): Promise<SearchData> => {
  try {
    // Initialize searchData with null values
    const searchData: SearchData = {
      make: null,
      model: null,
      year: null,
      type: null,
    };

    if (!makeModelTypeId) {
      return searchData;
    }

    // Generate the individual IDs
    const generatedIds = generateIdsFromMakeModelTypeId(makeModelTypeId);

    // Handle complete makeModelTypeId case
    if (generatedIds.idType === "complete") {
      try {
        // Call the API to get car data

        const apiResponse = await getCarDataFromMMYTId(makeModelTypeId);

        if (apiResponse && (apiResponse.data || apiResponse.brandId)) {
          // Create search data directly from API response, using URL year if provided

          const searchData = createSearchDataFromApiResponse(apiResponse, urlYear);

          return searchData;
        } else {
          console.error("No data found for makeModelTypeId:", makeModelTypeId);
          return searchData;
        }
      } catch (error) {
        console.error("Error fetching car data for makeModelTypeId:", error);
        return searchData;
      }
    }

    // Step 1: Fetch all brands and find the matching make
    const brandsResponse = await getBrands();
    if (!brandsResponse || !brandsResponse.data || brandsResponse.data.length === 0) {
      console.error("No brands found");
      return searchData;
    }

    const matchedBrand = brandsResponse.data.find(
      (brand: MakeModelTypeBrandItem) => brand.id === generatedIds.makeId,
    );
    if (!matchedBrand) {
      console.error("Brand not found with ID:", generatedIds.makeId);
      return searchData;
    }

    searchData.make = {
      key: matchedBrand.id,
      value: matchedBrand.brand ?? "",
    };

    // If we only have makeId, return early (years typically not relevant for make-only)
    if (generatedIds.idType === "make") {
      // Note: For make-only IDs, year is typically not relevant, but we could set it if needed
      if (urlYear) {
        // We could set it, but make-only searches typically don't use years
      }

      return searchData;
    }

    // Step 2: Fetch models and find the matching model
    const modelsResponse = await getModels(searchData.make.key);
    if (!modelsResponse || !modelsResponse.data || modelsResponse.data.length === 0) {
      console.error("No models found for brand:", searchData.make.value);
      return searchData;
    }

    const matchedModel = modelsResponse.data.find(
      (model: MakeModelTypeBrandItem) => model.id === generatedIds.modelId,
    );
    if (!matchedModel) {
      console.error("Model not found with ID:", generatedIds.modelId);
      return searchData;
    }

    searchData.model = {
      key: matchedModel.id,
      value: matchedModel.model ?? "",
    };

    // If we only have modelId, check if we need to set year before returning
    if (generatedIds.idType === "model") {
      // If URL year is provided, set it before returning
      if (urlYear) {
        searchData.year = {
          key: searchData.model.key,
          value: urlYear,
        };
      }

      return searchData;
    }

    // Step 3: Fetch years for the selected model
    const yearsResponse = await getYears(searchData.model.key);
    if (!yearsResponse || !yearsResponse.data || yearsResponse.data.length === 0) {
      console.error("No years found for model:", searchData.model.value);
      return searchData;
    }

    // Step 4: Fetch types to find the matching type and extract year
    const typesResponse = await getTypes({
      modelId: searchData.model.key,
      year: yearsResponse.data[0], // Use first year to get types initially
    });

    if (!typesResponse || !typesResponse.data || typesResponse.data.length === 0) {
      console.error("No types found for model:", searchData.model.value);
      return searchData;
    }

    // Find the matching type across all years
    let matchedType: Type | null = null;
    let matchedYear: string | null = null;

    // Use URL year if provided, otherwise find the type across different years
    if (urlYear) {
      matchedYear = urlYear; // Always use URL year when provided

      // Try to find the type for the specific year from URL
      const yearTypesResponse = await getTypes({
        modelId: searchData.model.key,
        year: urlYear,
      });

      if (yearTypesResponse && yearTypesResponse.data) {
        const foundType = yearTypesResponse.data.find(
          (type: Type) => type.id === generatedIds.typeId,
        );
        if (foundType) {
          matchedType = foundType;
        } else {
        }
      }
    } else {
      // Try to find the type across different years (existing logic)
      for (const year of yearsResponse.data) {
        const yearTypesResponse = await getTypes({
          modelId: searchData.model.key,
          year: year.toString(),
        });

        if (yearTypesResponse && yearTypesResponse.data) {
          const foundType = yearTypesResponse.data.find(
            (type: Type) => type.id === generatedIds.typeId,
          );
          if (foundType) {
            matchedType = foundType;
            matchedYear = year.toString();

            break;
          }
        }
      }
    }

    // Fallback for year if not set yet (only when urlYear is not provided)
    if (!matchedYear) {
      console.error("Type not found with ID:", generatedIds.typeId);
      if (urlYear) {
        // If urlYear was provided but somehow matchedYear is still null, use urlYear

        matchedYear = urlYear;
      } else if (yearsResponse?.data && yearsResponse.data.length > 0) {
        // Only use API fallback if no urlYear was provided
        matchedYear = String(yearsResponse.data[0]);
      } else {
        matchedYear = "2024"; // Final fallback
      }
    }

    // Store the year - this should ALWAYS be set when we reach this point
    if (!matchedYear) {
      console.error("❌ CRITICAL: matchedYear is null/undefined! This should not happen.");
      console.error("❌ urlYear:", urlYear);
      console.error("❌ generatedIds:", generatedIds);
      console.error("❌ yearsResponse.data:", yearsResponse?.data);
      // Last resort: if everything fails and we have urlYear, use it
      if (urlYear) {
        matchedYear = urlYear;
      } else if (yearsResponse?.data && yearsResponse.data.length > 0) {
        matchedYear = String(yearsResponse.data[0]);
      } else {
        console.error("🆘 COMPLETE FAILURE: No year available at all");
        matchedYear = "2024"; // Ultimate fallback
      }
    }

    searchData.year = {
      key: searchData.model.key,
      value: matchedYear!,
    };

    // Store the type if found
    if (matchedType) {
      searchData.type = {
        key: matchedType.id,
        value: matchedType.type,
      };
    } else {
    }

    return searchData;
  } catch (error) {
    console.error("Error prefilling search data from URL:", error);
    return {
      make: null,
      model: null,
      year: null,
      type: null,
    };
  }
};

export {
  prefillSearchDataFromUrl,
  generateIdsFromMakeModelTypeId,
  createCarDataFromApiResponse,
  createSearchDataFromApiResponse,
};
export type { SearchData, GeneratedIds, CarInfoInterface };
