import type { MakeModelTypeBrandItem } from "@/type";
import { getLabelUtility } from "@/helpers/UtilityHelper";
import { getCategoryByIdNested } from "@/services/advancedSearchService";
import { getCarById } from "@/services/cars";
import { formatCarDisplayLabel } from "@/utils/formatCarDisplayLabel";
import { parseCarIdsParam } from "@/utils/parseCarIdsParam";
import { parseSingleCategoryId } from "@/utils/singleCategoryFilter";
import {
  buildLegacyMmeCarLabel,
  buildSearchResultsDisplayTitle,
  resolveCategoryDisplayName,
} from "@/utils/searchResultsDisplayTitle";

interface PageTitleParams {
  translations: { [key: string]: string }[];
  params: {
    "language-country": string;
    searchdata: string;
  };
  searchParams: {
    carIds?: string | string[];
    makeModelTypeId?: string;
    take?: string;
    order?: string;
    year?: string;
    categoryId?: string;
    oeReference?: string;
  };
}

interface SearchData {
  makeModelTypeId?: string;
  make: { key: string; value: string; originalData?: any } | null;
  model: { key: string; value: string; originalData?: any } | null;
  engine: { key: string; value: string; originalData?: any } | null;
}

export const generateMmeSearchTITLE = async (makeModelTypeId: string) => {
  try {
    let lastNonZeroPosition = -1;
    for (let i = 0; i < makeModelTypeId.length; i++) {
      if (makeModelTypeId[i] !== "0") {
        lastNonZeroPosition = i;
      }
    }

    let completedLevel = 0;
    if (lastNonZeroPosition >= 0 && lastNonZeroPosition <= 2) {
      completedLevel = 1;
    } else if (lastNonZeroPosition >= 3 && lastNonZeroPosition <= 8) {
      completedLevel = 2;
    } else if (lastNonZeroPosition >= 11) {
      completedLevel = 3;
    }

    let makeId = "";
    let modelId = "";
    let engineId = "";

    if (completedLevel >= 1) {
      makeId = makeModelTypeId.substring(0, 3);
    }
    if (completedLevel >= 2) {
      modelId = makeModelTypeId.substring(3, 9);
    }
    if (completedLevel >= 3) {
      engineId = makeModelTypeId.substring(9, 17);
    }

    const actualMakeId = makeId.padEnd(17, "0");
    const actualModelId = (makeId + modelId).padEnd(17, "0");
    const actualEngineId = makeModelTypeId;

    const { getBrands, getModalTypes, getEngines } = await import("@/services/search");
    const newSearchData: SearchData = {
      makeModelTypeId: makeModelTypeId,
      make: null,
      model: null,
      engine: null,
    };

    if (makeId && makeId !== "000") {
      const brandsResponse = await getBrands();
      if (brandsResponse?.data) {
        const makeData = brandsResponse.data.find((brand: any) => brand.id === actualMakeId);
        if (makeData) {
          newSearchData.make = {
            key: actualMakeId,
            value: makeData.brand || "",
            originalData: makeData,
          };
        }
      }
    }

    if (modelId && newSearchData.make?.key) {
      const modelsResponse = await getModalTypes(actualMakeId);
      if (modelsResponse?.data) {
        const modelData = modelsResponse.data.find((model: any) =>
          model?.id?.includes(actualModelId),
        );
        if (modelData) {
          newSearchData.model = {
            key: actualModelId,
            value: `${modelData.model} ${modelData.type || ""}`.trim(),
            originalData: modelData,
          };
        }
      }
    }

    if (engineId && newSearchData.model?.key) {
      const enginesResponse = await getEngines(actualModelId);
      if (enginesResponse?.data) {
        const engineData = enginesResponse.data.find((engine: MakeModelTypeBrandItem) =>
          engine.id.includes(actualEngineId),
        );
        if (engineData) {
          const engineDisplay = engineData.engine ?? "Engine not specified";
          newSearchData.engine = {
            key: actualEngineId,
            value: engineDisplay,
            originalData: engineData,
          };
        }
      }
    }

    return newSearchData;
  } catch (error) {
    console.error("❌ PREVSEARCH Error generating MME search data:", error);
    return null;
  }
};

async function resolveCarLabelFromUrl(
  searchParams: PageTitleParams["searchParams"],
): Promise<string> {
  const carIdsRaw = searchParams.carIds;
  const carIds = Array.isArray(carIdsRaw)
    ? carIdsRaw
    : parseCarIdsParam(typeof carIdsRaw === "string" ? carIdsRaw : null);

  if (carIds.length > 0) {
    try {
      const response = await getCarById(carIds[0]!);
      return formatCarDisplayLabel(response.data);
    } catch {
      return carIds[0] ?? "";
    }
  }

  const makeModelTypeId = searchParams.makeModelTypeId?.trim();
  if (!makeModelTypeId) return "";

  const mmeData = await generateMmeSearchTITLE(makeModelTypeId);
  return buildLegacyMmeCarLabel(mmeData?.make?.value, mmeData?.model?.value);
}

export async function getSearchResultsPageTitle({
  translations,
  params,
  searchParams,
}: PageTitleParams) {
  const { "language-country": languagecountry = "en-BE" } = params;
  const locale = languagecountry.split("-")[0]?.toLowerCase() || "en";
  const WhiteLabels: any = translations ?? [];
  const getLabel = (keyName: string, replaceKeys?: { [key: string]: string }) =>
    getLabelUtility(WhiteLabels, keyName, replaceKeys);

  const categoryId = parseSingleCategoryId(searchParams.categoryId ?? null);
  let categoryName: string | null = null;

  if (categoryId) {
    const cateMaster = await getCategoryByIdNested();
    categoryName = resolveCategoryDisplayName(cateMaster as any[], categoryId, locale);
  }

  const carLabel = await resolveCarLabelFromUrl(searchParams);

  return buildSearchResultsDisplayTitle({
    carLabel,
    categoryName,
    oeReference: searchParams.oeReference ?? null,
    getLabel,
  });
}
