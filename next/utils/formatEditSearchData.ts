import type { MakeModelTypeBrandItem } from "@/type";
import { getBrands, getModels, getYears, getTypes } from "@/services/search";

interface SearchData {
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;
}

interface CarInfoInterface {
  brandId?: string;
  makeId?: string;
  modelId?: string;
  modelName?: string;
  typeId?: string;
  typeName?: string;
  makeModelTypeId?: string;
  year?: string | number;
}

interface Type {
  id: string;
  type: string;
}

const formatEditSearchData = async (carInfo: CarInfoInterface): Promise<SearchData> => {
  try {
    const searchData: SearchData = {
      make: null,
      model: null,
      year: null,
      type: null,
    };

    // Step 1: Fetch all brands
    const brandsResponse = await getBrands();
    if (!brandsResponse || !brandsResponse.data || brandsResponse.data.length === 0) {
      console.error("No brands found");
      return searchData;
    }

    // Step 2: Find the matching brand using makeId
    const matchedBrand = brandsResponse.data.find(
      (brand: MakeModelTypeBrandItem) => brand.id === carInfo.brandId?.padEnd(17, "0"),
    );
    if (!matchedBrand) {
      console.error("Brand not found with ID:", carInfo.brandId);
      return searchData;
    }

    // Store the matched brand in searchData
    searchData.make = {
      key: matchedBrand.id,
      value: matchedBrand.brand ?? "",
    };

    // Step 3: Fetch models for the selected brand
    const modelsResponse = await getModels(searchData.make.key);
    if (!modelsResponse || !modelsResponse.data || modelsResponse.data.length === 0) {
      console.error("No models found for brand:", searchData.make.value);
      return searchData;
    }

    const modelIdTmp = carInfo.makeModelTypeId?.substring(0, 6).padEnd(17, "0") ?? "";
    const matchedModel = modelsResponse.data.find(
      (model: MakeModelTypeBrandItem) => model.id === modelIdTmp,
    );

    if (!matchedModel) {
      console.error("Model not found with ID:", carInfo.modelId);
      return searchData;
    }

    searchData.model = {
      key: matchedModel.id,
      value: carInfo.modelName ?? matchedModel.model ?? "",
    };

    const yearsResponse = await getYears(searchData.model.key);
    if (!yearsResponse || !yearsResponse.data || yearsResponse.data.length === 0) {
      console.error("No years found for model:", searchData.model.value);
      return searchData;
    }

    // Find the matching year
    const matchedYear = yearsResponse.data.find(
      (year: string | number) => year.toString() === carInfo.year?.toString(),
    );

    if (!matchedYear) {
      console.error("Year not found:", carInfo.year);
      return searchData;
    }

    // Store the matched year in searchData
    searchData.year = {
      key: searchData.model.key,
      value: matchedYear.toString(),
    };

    const typesResponse = await getTypes({
      modelId: searchData.model.key,
      year: searchData.year.value,
    });

    if (!typesResponse || !typesResponse.data || typesResponse.data.length === 0) {
      console.error(
        "No types found for model and year:",
        searchData.model.value,
        searchData.year.value,
      );
      return searchData;
    }

    // Step 7: Find the matching type using typeId
    const matchedType = typesResponse.data.find(
      (type: Type) => type.id === carInfo.typeId || type.id === carInfo.makeModelTypeId,
    );
    if (!matchedType) {
      console.error("Type not found with ID:", carInfo.typeId || carInfo.makeModelTypeId);
      return searchData;
    }

    // Store the matched type in searchData
    searchData.type = {
      key: matchedType.id,
      value: carInfo.typeName ?? matchedType.type,
    };

    return searchData;
  } catch (error) {
    console.error("Error formatting edit search data:", error);
    return {
      make: null,
      model: null,
      year: null,
      type: null,
    };
  }
};

export default formatEditSearchData;
