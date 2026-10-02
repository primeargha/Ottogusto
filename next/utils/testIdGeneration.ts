import { generateIdsFromMakeModelTypeId } from "./prefillSearchDataFromUrl";

// Test the ID generation algorithm
const testIdGeneration = () => {
  // Test Type ID
  const typeId = "00100j00700000";

  try {
    const result1 = generateIdsFromMakeModelTypeId(typeId);
  } catch (error) {
    console.error("Error:", error);
  }

  // Test Model ID
  const modelId = "00100j00000000";

  try {
    const result2 = generateIdsFromMakeModelTypeId(modelId);
  } catch (error) {
    console.error("Error:", error);
  }

  // Test Make ID
  const makeId = "00100000000000";

  try {
    const result3 = generateIdsFromMakeModelTypeId(makeId);
  } catch (error) {
    console.error("Error:", error);
  }

  // Test Complete makeModelTypeId
  const completeId = "00100j0075g000";

  for (let i = 6; i < completeId.length; i++) {}
  try {
    const result4 = generateIdsFromMakeModelTypeId(completeId);
  } catch (error) {
    console.error("Error:", error);
  }
};

export { testIdGeneration };
