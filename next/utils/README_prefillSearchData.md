# Prefill Search Data Utility

This utility handles prefilling search data in the `useSearchModalStore` based on the `makeModelTypeId` parameter from the URL.

## How it works

### URL Structure

The products page URL contains a `makeModelTypeId` parameter:

```
http://localhost:3000/en-EU/products/?makeModelTypeId=00100000000000&take=10&minPrice=0&maxPrice=5000&order=priority
```

### ID Pattern Recognition

All IDs consist of 14 digits. The utility determines the type of ID by analyzing the pattern:

- **Make ID**: 11 consecutive zeros at the end (e.g., `00100000000000`)
- **Model ID**: 8 consecutive zeros at the end (e.g., `00100j00000000`)
- **Simple Type ID**: 5 consecutive zeros at the end (e.g., `00100j00700000`)
- **Complete makeModelTypeId**: Non-zero characters found after the 6th position from the front (e.g., `00100j0075g000`)

### ID Generation Algorithm

The utility reverse-engineers parent IDs from the given `makeModelTypeId`:

1. **If Complete makeModelTypeId is provided** (`00100j0075g000`):
   - Calls `getCarDataFromMMYTId` API with the full ID
   - API returns data like:
     ```json
     {
       "brandId": "001",
       "modelId": "00j",
       "typeId": "007",
       "year": 1996,
       "brandName": "ALFA ROMEO",
       "modelName": "146",
       "typeName": "1.6 i.e. 16V T.S."
     }
     ```
   - Generates IDs from API response:
     - Make ID: `brandId` + 11 zeros → `00100000000000`
     - Model ID: `brandId` + `modelId` + 8 zeros → `00100j00000000`
     - Type ID: `brandId` + `modelId` + `typeId` + 5 zeros → `00100j00700000`
   - Creates search data directly with complete type information:
     ```javascript
     {
       make: { key: makeId, value: brandName },
       model: { key: modelId, value: modelName },
       year: { key: modelId, value: yearFrom },
       type: { key: typeId, value: typeName }
     }
     ```

2. **If Simple Type ID is provided** (`00100j00700000`):
   - Generate Model ID: First 6 digits + 8 zeros → `00100j00000000`
   - Generate Make ID: First 3 digits + 11 zeros → `00100000000000`

3. **If Model ID is provided** (`00100j00000000`):
   - Generate Make ID: First 3 digits + 11 zeros → `00100000000000`

4. **If Make ID is provided** (`00100000000000`):
   - Use as-is

### API Calls and Data Population

The utility makes sequential API calls to populate the search data:

1. **Fetch Brands** → Find matching make
2. **Fetch Models** → Find matching model (if model/type ID provided)
3. **Fetch Years** → Get available years for the model
4. **Fetch Types** → Find matching type and determine the correct year

### Special Handling for Years

When a Type ID is provided but the specific year is not found, the utility uses the first available year as a fallback, as specified in the requirements.

## Usage

### In Products Page

The utility is automatically called when the products page loads with a `makeModelTypeId` parameter:

```typescript
// In products.tsx
const { prefillFromUrl } = useSearchModalStore();

useEffect(() => {
  const makeModelTypeId = queryParams.get("makeModelTypeId");
  if (makeModelTypeId) {
    await prefillFromUrl(makeModelTypeId);
  }
}, [queryParams]);
```

### Direct Usage

You can also use the utility functions directly:

```typescript
import {
  prefillSearchDataFromUrl,
  generateIdsFromMakeModelTypeId,
} from "@/utils/prefillSearchDataFromUrl";

// Generate IDs from makeModelTypeId
const ids = generateIdsFromMakeModelTypeId("00100j00700000");
// Returns: { makeId: "00100000000000", modelId: "00100j00000000", typeId: "00100j00700000", idType: "type" }

// Prefill search data
const searchData = await prefillSearchDataFromUrl("00100j00700000");
// Returns populated SearchData object
```

## Files

- `next/utils/prefillSearchDataFromUrl.ts` - Main utility functions
- `next/utils/testIdGeneration.ts` - Test functions for ID generation
- `next/stores/useSearchModalStore.ts` - Store integration
- `next/screens/products/products.tsx` - Implementation in products page
