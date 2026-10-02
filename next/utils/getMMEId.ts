import { useMmeStore } from "@/stores/useMmeStore";

/**
 * Gets the latest level ID from MME store data or passed search data
 * Algorithm:
 * 1. Always take the latest level ID
 * 2. If engine key and value is there in searchData, return "key of engine"
 * 3. If no engine, check if model. If found then return "key of model"
 * 4. Else no model, no engine, if make, then return "key of make"
 * 5. If none found, return null
 *
 * @param searchData - Optional search data to use instead of store data
 * @returns The makeModelTypeId based on the highest completed level
 */
export const getMMEId = (searchData?: {
  make?: { key: string; value: string } | null;
  model?: { key: string; value: string } | null;
  engine?: { key: string; value: string } | null;
}): string | null => {
  let dataToUse: {
    make?: { key: string; value: string } | null;
    model?: { key: string; value: string } | null;
    engine?: { key: string; value: string } | null;
  };

  if (searchData) {
    // Use passed searchData
    dataToUse = searchData;
  } else {
    // Use store data
    const storeState = useMmeStore.getState();
    dataToUse = storeState.searchData;
  }

  // Check engine level (highest level in manual search)
  if (dataToUse.engine?.key && dataToUse.engine?.value) {
    return dataToUse.engine.key;
  }

  // Check model level
  if (dataToUse.model?.key && dataToUse.model?.value) {
    return dataToUse.model.key;
  }

  // Check make level
  if (dataToUse.make?.key && dataToUse.make?.value) {
    return dataToUse.make.key;
  }

  if (!searchData) {
    const { carByVinResults } = useMmeStore.getState();
    if (carByVinResults && carByVinResults.length > 0 && carByVinResults[0]?.id) {
      return carByVinResults[0].id;
    }
  }

  return null;
};
