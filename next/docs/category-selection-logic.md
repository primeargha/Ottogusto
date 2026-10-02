# Hierarchical Category Selection Logic

## Overview

This document explains the enhanced category selection logic implemented in the `updateCategoryList` method in `next/helpers/UtilityHelper.ts`. The logic handles hierarchical category selection with automatic sibling selection and toggle behavior for 3-level category trees.

## Category Structure

Categories are organized in a 3-level hierarchy:

- **Level 1 (L1)**: 3-digit IDs (e.g., "001", "002", "003")
- **Level 2 (L2)**: 6-digit IDs (e.g., "001001", "001002", "001003")
- **Level 3 (L3)**: 9+ digit IDs (e.g., "001001001", "001001002", "001001003")

## Selection Behaviors

### Core Principles

1. **Sibling Selection**: When a parent category is selected and a child category is clicked, all siblings of that child (at the same level) are automatically selected, except the clicked child itself.

2. **Toggle Behavior**: Clicking the same category again toggles the selection off.

3. **Preservation**: Selections from unrelated category branches are preserved during operations.

### Case 1: L1 → L2 Selection

**Scenario**: Level 1 category is selected and user clicks a Level 2 category from the same parent.

**Behavior**:

- **First Click**: Selects all L2 siblings except the clicked one
- **Second Click**: Deselects all L2 categories (toggle off)

**Example**:

```
Selected: ["001"] (ENGINE)
Click: "001001" (FILTERS)
Result: ["001002", "001003", "001004", ...] (all L2 except FILTERS)

Click "001001" again:
Result: [] (all deselected)
```

### Case 2: L1 → L3 Selection (Direct)

**Scenario**: Level 1 category is selected and user directly clicks a Level 3 category (without first selecting L2).

**Behavior**:

- **First Click**: Converts L1 selection to all L2 categories
- **Second Click**: Selects all L3 siblings except the clicked one
- **Third Click**: Deselects all L2 categories (toggle off)

**Example**:

```
Selected: ["001"] (ENGINE)
Click: "001001001" (OIL FILTER)
Result: ["001001", "001002", "001003", ...] (all L2 categories)

Click "001001001" again:
Result: ["001001002", "001001003", ...] (all L3 except OIL FILTER)

Click "001001001" again:
Result: [] (all deselected)
```

### Case 3: L2 → L3 Selection

**Scenario**: Level 2 category is selected and user clicks a Level 3 category from the same parent.

**Behavior**:

- **First Click**: Selects all L3 siblings except the clicked one
- **Second Click**: Deselects all L2 and L3 categories (toggle off)

**Example**:

```
Selected: ["001001"] (FILTERS)
Click: "001001001" (OIL FILTER)
Result: ["001001002", "001001003", ...] (all L3 except OIL FILTER)

Click "001001001" again:
Result: [] (all deselected)
```

## Implementation Details

### Method Structure

```typescript
export const updateCategoryList = async (
  existingIds: PartsCategoryInterface[],
  newId: string,
  newParentId?: string,
  newNode?: PartsCategoryInterface,
  nestedCategoryData?: PartsCategoryInterface[],
): Promise<PartsCategoryInterface[]>
```

### Logic Flow

1. **Determine Category Level**: Uses `getCategoryLevel(newId)` to identify if the new category is L1, L2, or L3.

2. **Check Special Cases**: Evaluates three main scenarios in order:
   - L1 selected + L2 clicked
   - L1 selected + L3 clicked (direct)
   - L2 selected + L3 clicked

3. **Apply Appropriate Logic**: Each case has specific handling for:
   - Finding parent/child relationships
   - Filtering related/unrelated categories
   - Toggle behavior detection
   - Sibling selection logic

4. **Fallback to Original Logic**: If no special cases apply, uses the original `updateCategoryListSub` method.

### Key Functions

- `getCategoryLevel()`: Determines the hierarchical level of a category ID
- `updateCategoryListSub()`: Original category selection logic for standard cases
- `flattenTree()`: Utility for traversing the category tree structure

## Filter Logic

### Preserving Unrelated Categories

All special cases use filtering to preserve selections from unrelated branches:

```typescript
const otherCategories = existingIds.filter(
  (cat) =>
    cat.id !== parentId && // Remove the parent itself
    !cat.id.startsWith(parentId), // Remove any existing children of this parent
);
```

### Sibling Selection

```typescript
const allSiblings =
  nestedCategoryData
    .find((cat) => cat.id === parentId)
    ?.children?.map((child) => ({ ...child, parentId })) || [];

return [...otherCategories, ...allSiblings.filter((cat) => cat.id !== newId)];
```

## Toggle Detection

Toggle behavior is detected by checking if the clicked category is already in the current selection:

```typescript
const isAlreadySelected = existingIds.find((cat) => cat.id === newId);

if (isAlreadySelected) {
  // Toggle off - remove related categories
  const otherCategories = existingIds.filter((cat) => !cat.id.startsWith(parentId));
  return otherCategories;
} else {
  // Toggle on - select siblings
  // ... sibling selection logic
}
```

## Edge Cases Handled

1. **Multiple L1 Selection**: Users can select multiple L1 categories simultaneously
2. **Mixed Selections**: L1 from one branch + L2 from another branch works correctly
3. **Empty Selection**: Toggle behavior works when no categories are selected; deselecting the last item clears the selection completely
4. **Invalid IDs**: Gracefully handles missing or invalid category IDs
5. **Missing Data**: Handles cases where `nestedCategoryData` is undefined

## Performance Considerations

- **Early Returns**: Special cases return immediately to avoid unnecessary processing
- **Efficient Filtering**: Uses array methods optimized for performance
- **Minimal Data Processing**: Only processes relevant category branches
- **Async Handling**: Maintains async compatibility with existing codebase

## Testing Scenarios

### Basic Functionality

1. Select L1 → Click L2 → Verify all L2 siblings selected
2. Select L1 → Click L3 → Verify L2 conversion on first click
3. Select L2 → Click L3 → Verify all L3 siblings selected

### Toggle Behavior

1. Click same category twice → Verify toggle off
2. L1→L3 three-click sequence → Verify proper state transitions

### Edge Cases

1. Select multiple L1 categories → Click L3 from one branch
2. Mix L1 and L2 selections from different branches
3. Rapid clicking → Verify no state corruption
4. Deselect all categories one by one → Verify selection clears completely and URL removes `categoryIds`

## Future Enhancements

Potential improvements for future versions:

1. **Configurable Behavior**: Allow users to choose between sibling selection and individual selection
2. **Visual Feedback**: Add loading states during complex selection operations
3. **Performance Optimization**: Memoization for frequently accessed category data
4. **Accessibility**: Enhanced keyboard navigation and screen reader support
5. **Analytics**: Track user selection patterns for UI optimization

## Troubleshooting

### Common Issues

1. **Double-Click Required**: Ensure special logic cases are returning early and not falling through to original logic
2. **Unrelated Categories Deselected**: Check filtering logic for proper parent ID handling
3. **Toggle Not Working**: Verify toggle detection logic is checking the correct category ID
4. **Last Item Cannot Be Deselected**: This was caused by two bugs in `OGCategoriesSearcBlock/index.tsx`:
   - A guard that prevented `updateFilters` from being called with an empty list when `categoryIds` was still in the URL
   - The URL-to-store sync effect had `storeIdsSet.size > 0` as an extra condition, which meant an empty store (size 0) was never treated as user-initiated removal — causing the sync to restore categories from the stale URL. Both guards have been removed.

### Debug Tips

1. Add console logs to track `existingIds` at each step
2. Verify category level detection is working correctly
3. Check that parent-child relationships are properly identified
4. Ensure filtering preserves unrelated categories correctly

## Conclusion

This enhanced category selection logic provides an intuitive user experience with automatic sibling selection and consistent toggle behavior across all three hierarchical levels. The implementation maintains backward compatibility while adding powerful new features for hierarchical category navigation.
