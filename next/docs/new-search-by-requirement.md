# Search By Car - New Requirements Implementation

## Overview

Transform the existing Search Modal into a dedicated search page with URL-based step navigation and minimal changes to maintain application stability.

## Implementation Strategy

- **Approach**: Page-based navigation (localhost:3000/en-US/search-by-car?step=1)
- **Data Source**: URL parameters instead of useSearchModalStore
- **Principle**: Minimal changes to prevent application breakage
- **Implementation**: One step at a time

## Critical Store Architecture Decision

### Preserve Existing Store (CRITICAL)

**DO NOT MODIFY** the existing `useSearchModalStore.ts` as it is used throughout the application in many other places and maintains the current step in store state. Any changes to this store could break existing functionality.

### Create New Store for Manual Search

Create a new store `useNewSearchStore.ts` that will handle the manually search functionality with the following changes:

#### Change 1: Extended Search Data Structure

The new store will have the same functionality as `useSearchModalStore` but with extended search data:

```typescript
interface SearchData {
  // Existing fields (SAME AS ORIGINAL)
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;

  // NEW FIELDS for Step 5 - Engine
  cc: { key: string; value: string } | null;
  fuel: { key: string; value: string } | null;
  hp: { key: string; value: string } | null;

  // NEW FIELDS for Step 6 - Trim
  body: { key: string; value: string } | null;
  doors: { key: string; value: string } | null;
  variant: { key: string; value: string } | null;
}
```

#### Change 2: URL-Driven Step Management

- **REMOVE** all step-related fields from the new store (`currentStep`, `setCurrentStep`, etc.)
- **ALWAYS** read the current step from URL parameters (as implemented in `page.tsx`)
- The step state is managed entirely through URL navigation
- This ensures deep linking, browser back/forward functionality, and proper state management

#### Change 3: Dummy Data for New Steps

Since GET APIs for Engine (Step 5) and Trim (Step 6) dropdown options are not available, create a `dummyData.ts` file with dummy constants:

```typescript
// Engine Step 5 Options
export const cc_options = ["1.4", "2.3", "1.6", "2.0", "2.5", "3.0"];
export const hp_options = ["100HP", "115HP", "150HP", "180HP", "200HP", "250HP"];
export const fuel_options = ["petrol", "diesel", "hybrid", "electric"];

// Trim Step 6 Options
export const body_options = ["break", "hatchback", "sedan", "suv", "coupe", "convertible"];
export const doors_options = ["5 Doors", "4 Doors", "3 Doors", "2 Doors"];
export const variant_options = ["base", "top", "sport", "luxury", "premium"];
```

#### Change 4: Simplified Search Data Structure (Initial Implementation)

For the initial implementation, use simplified string values instead of key-value objects:

```typescript
interface SearchData {
  // Existing fields (SAME AS ORIGINAL)
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;

  // NEW FIELDS for Step 5 - Engine (simplified strings for now)
  cc: string;
  fuel: string;
  hp: string;

  // NEW FIELDS for Step 6 - Trim (simplified strings for now)
  body: string;
  doors: string;
  variant: string;
}
```

**Note**: The key-value structure can be added later when APIs are available, but for now use simple strings to maintain consistency with the existing implementation pattern.

## Step Structure

### Previous Structure (5 steps)

1. **Step 1**: Car Make
2. **Step 2**: Car Model
3. **Step 3**: Car Year
4. **Step 4**: Car Type
5. **Step 5**: Car Confirmation

### New Structure (7 steps)

1. **Step 1**: Car Make
2. **Step 2**: Car Model
3. **Step 3**: Car Year
4. **Step 4**: Car Type
5. **Step 5**: Car Engine (NEW)
6. **Step 6**: Car Trim (NEW)
7. **Step 7**: Car Confirmation

## Data Structure Requirements

### Existing SearchData Interface (DO NOT CHANGE)

```typescript
interface SearchData {
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;
}
```

### New Fields to Add (Maintain Existing Structure)

```typescript
interface SearchData {
  // Existing fields (DO NOT MODIFY)
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string } | null;
  type: { key: string; value: string } | null;

  // Step 5 - Engine fields
  cc: { key: string; value: string } | null;
  fuel: { key: string; value: string } | null;
  hp: { key: string; value: string } | null;

  // Step 6 - Trim fields
  body: { key: string; value: string } | null;
  doors: { key: string; value: string } | null;
  variant: { key: string; value: string } | null;
}
```

## UI Tracking Requirements

### Step Grouping for UI Indicators

1. **BODY Group** (Steps 1-4): Make, Model, Year, Type
   - Active when user is in step 1, 2, 3, or 4
   - UI should show "BODY" as active section

2. **ENGINE Group** (Step 5): Engine specifications
   - Active when user is in step 5
   - UI should show "ENGINE" as active section

3. **TRIM Group** (Step 6): Trim specifications
   - Active when user is in step 6
   - UI should show "TRIM" as active section

### Completion Indicators (Tick Symbols)

- **BODY Completion**: Show tick when user is in step 5 or higher (> 4)
- **ENGINE Completion**: Show tick when user is in step 6 or higher (> 5)
- **TRIM Completion**: Show tick when user is in step 7 (Car Confirmation page)

## Technical Implementation Notes

### URL Structure

- Base URL: `localhost:3000/en-US/search-by-car`
- Step parameter: `?step=1` through `?step=7`
- Example: `localhost:3000/en-US/search-by-car?step=5` (Engine step)

### Data Persistence

- Maintain existing `useSearchModalStore` structure
- Add new fields to `searchData` object
- Ensure backward compatibility with existing dependencies

### Navigation

- URL-based step navigation
- Maintain step state in URL parameters
- Preserve existing modal functionality where needed

## Implementation Priority

1. **Phase 1**: Implement URL-based navigation
2. **Phase 2**: Add Step 5 (Engine) functionality
3. **Phase 3**: Add Step 6 (Trim) functionality
4. **Phase 4**: Update UI indicators and completion tracking
5. **Phase 5**: Testing and validation

## Dependencies to Preserve

- Existing `useSearchModalStore` structure
- Current search data format
- All existing search-related components
- Backward compatibility with current implementation

## Success Criteria

- [ ] URL-based step navigation working
- [ ] All 7 steps functional
- [ ] UI indicators showing correct active states
- [ ] Completion ticks appearing at appropriate steps
- [ ] No breaking changes to existing functionality
- [ ] Search data structure maintained
- [ ] All existing dependencies preserved
