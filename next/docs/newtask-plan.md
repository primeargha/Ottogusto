# New Task Plan

## Current User Flow

### Step 1: Landing Page

- **URL**: https://dev.ottogusto.com/en-BE
- **Page Elements**:
  - Landing page with search interface
  - "Find car parts" button
  - Search filter fields:
    - **Make** dropdown (e.g., pre-filled with "VOLVO")
    - **Model** dropdown ("Select Model")
    - **Engine** dropdown ("Select Engine")
  - Two search options available:
    - "Car details" (radio button option)
    - "Part reference number" (radio button option)
  - "Clear all" link
  - Header with:
    - Ottogusto logo (green stylized font)
    - Language/region selector (EN with Belgian flag icon)
    - LOGIN link
    - Shopping cart icon
  - Promotional banner with messaging: "Take Back The Tools. Find Your Parts."
  - Trust indicators section:
    - OE & Premium parts
    - Expert support
    - Secure payment
    - 14-Day returns
  - Product display grid at bottom showing car part categories
- **User Action**: User selects Make, Model, Engine (MME) data and clicks "Find car parts" button

### Step 2: Category Selection Page

- **URL**: https://dev.ottogusto.com/en-BE/car-parts
- **Page Elements**:
  - Header with:
    - Ottogusto logo (white text on dark green banner)
    - Language/region selector (EN with Belgian flag icon)
    - LOGIN link
    - Shopping cart icon
  - Main heading: "← What kind of part are you looking for?" (with left arrow icon)
  - Grid layout of 12 car part category cards, each with an image and label:
    - **First Row**: ENGINE, TRANSMISSION, CHASSIS, BRAKING SYSTEM, EXHAUST SYSTEM, LIGHTING
    - **Second Row**: CLIMATE CONTROL, ELECTRICS, BODY, INTERIOR, MAINTENANCE & ..., TOOLS & ACCESS...
  - Bottom navigation/filter bar showing category labels (ENGINE is underlined in green, indicating selected state)
- **User Action**: User selects a category from the grid
- **IMPORTANT NOTE**: On this Category Catalogue page, there is **NO WAY to change MME (Make, Model, Engine) data**. The MME selection from Step 1 is carried forward but cannot be modified on this page.

### Step 3: Search Results Page

- **URL**: https://dev.ottogusto.com/en-BE/search-results?categoryIds=001&take=12&order=ASC
- **URL Parameters**:
  - `categoryIds=001` (category ID passed from Step 2)
  - `take=12` (pagination)
  - `order=ASC` (sorting)
- **Page Elements**:
  - Header with:
    - Ottogusto logo
    - Language/region selector (EN with Belgian flag icon)
    - LOGIN link
  - Page title/breadcrumb: "← ENGINE for VOLVO" (showing selected category and make)
  - **Left Sidebar (Filters and Navigation)**:
    - **Vehicle Selection Section**:
      - "VOLVO" dropdown (showing selected make)
      - "Select Model" dropdown (placeholder, not editable in current context)
      - "Select Engine" dropdown (placeholder, not editable in current context)
      - Grey "Search" button
    - **Category Filters Section**:
      - Expanded section titled "Category"
      - Multiple checkboxes with categories (all checked): ENGINE, FILTERS, IGNITION, COOLING, FUEL SYSTEM, INTAKE SYSTEM, BELT DRIVE, CYLINDER HEAD, CYLINDER BLOCK, ENGINE ELECTRICS, TIMING
      - Each category has a dropdown arrow for sub-categories
  - **Main Content Area**:
    - **Active Filters Bar**:
      - "ENGINE" tag with 'X' icon (active filter indicator)
      - "Remove Filters" link
    - **Sorting and View Options**:
      - "Price Low-High" dropdown for sorting
      - Grid view icon (selected)
      - List view icon (unselected)
    - **Product Cards (Grid Layout)**:
      - Product images
      - Product titles (e.g., "FIAT GROUP - RETAINING BLOCK - 14115781")
      - Manufacturer name
      - OE Reference number
      - Price with VAT information
      - "Add to cart" button (green with plus sign and car icon)
- **User Action**: User can view products, apply filters, sort, and add items to cart

**IMPORTANT NOTES**:

1. The `MMESearchFilter.tsx` component (located at `next/components/MMESearchFilter.tsx`) will be moved as part of this task. New design screenshot will be shared during implementation.
2. **Critical MME Behavior**: In `MMESearchFilter.tsx`, when MME (Make, Model, Engine) values are changed:
   - **NO API call is made** on change
   - **NO URL update occurs** on change
   - API calls and URL updates happen **ONLY on CLICK OF SEARCH BUTTON**

**Note**: This flow will be changed as part of this task.

---

## Planned Changes

### Changes to Previous Existing UI Steps

#### 1. Create New BaseSearchComponent

- **Component Name**: `BaseSearchComponent`
- **Reference Component**: Similar to `next/components/MMESearchFilter.tsx`
- **Location**: Will be placed at the top of the Category Catalogue page (Step 2)
- **Design Requirements**:
  - **Desktop Layout**:
    - HORIZONTAL WIDTH FULL BANNER layout
    - Section title: "Identify your vehicle to view compatible products" with car icon
    - Three dropdown fields displayed horizontally:
      - "1 Select make" (with green border when selected/active)
      - "2 Select model"
      - "3 Select engine"
    - "Enter" button (light grey) positioned to the right of the dropdowns
  - **Mobile Layout**:
    - VERTICAL CARD layout (similar to `MMESearchFilter.tsx`)
    - Section title: "Identify your vehicle to view compatible products" with car icon
    - Three dropdown fields displayed vertically/stacked:
      - "1 Select make" (highlighted in green when active)
      - "2 Select model"
      - "3 Select engine"
    - "Enter" button (light grey) positioned below the dropdowns
- **Functionality**:
  - Allows users to change MME (Make, Model, Engine) data on the Category Catalogue page
  - Displays currently selected vehicle information (e.g., "ALFA ROMEO 145 1.6 i.e. 16V T.S.")
  - Maintains the same MME behavior as `MMESearchFilter.tsx`:
    - NO API call on MME change
    - NO URL update on MME change
    - API calls and URL updates happen ONLY on CLICK OF ENTER BUTTON
- **Responsive Breakpoints**:
  - Use mobile screen width breakpoint: `640px` (as defined in `next/config/client-theme-config.ts` - `mobileBreakpoint: 640`)
  - Component should switch between desktop (horizontal banner) and mobile (vertical card) layouts based on this breakpoint
  - Desktop layout: screens >= 640px (horizontal banner layout)
  - Mobile layout: screens < 640px (vertical card layout)

#### 2. Category Page MME Change Flow

- **Location**: Category Catalogue page (Step 2)
- **Behavior on Dropdown Change**:
  - When user changes MME (Make, Model, Engine) dropdown values:
    - Update MME data in store: `next/stores/useMmeStore.ts`
    - **DO NOT** change the page title below the BaseSearchComponent
    - **DO NOT** redirect or update URL
    - **DO NOT** add `makeModelTypeId` to URL
- **Behavior on Enter Button Click**:
  - Update the page title below BaseSearchComponent to: `"Car Parts for [Make] [Model]"`
  - Example: "Car Parts for ALFA ROMEO 145" (see attached image)
  - **Enter Button Logic Check**:
    ```typescript
    if (page is category page) {
      // Update title below BaseSearchComponent
      // DO NOT redirect
      // DO NOT add makeModelTypeId to URL
      // Call save car API (if authenticated and saveCarToGarage flag enabled)
    } else if (NOT a category page) {
      // THEN redirect with reselected data
      // IMPORTANT: This logic already exists and works in:
      // - @next/components/MMESearchFilter.tsx
      // - @next/screens/products/products.tsx (products page)
      // Call save car API (if authenticated and saveCarToGarage flag enabled)
    }
    ```
- **Save Car API Logic**:
  - **Both category page AND non-category page** should call save car API on Enter button click
  - Reference implementation: `next/components/MMESearchModal.tsx` (see `handleConfirm` function)
  - API call should:
    - Check if user is authenticated
    - Check if `saveCarToGarage` flag is enabled (from MME store)
    - Use `useAddUpdateMyCarsToEB` hook (from `@/hooks/garage`)
    - Prepare request body with `makeModelTypeId`, `name`, `year`, `isNew` flag
    - Handle success/error responses
    - Invalidate queries: `["get-my-saved-cars"]` and `["get-my-saved-cars-landing-page"]`
- **Reference Implementation**:
  - The redirect logic for non-category pages already exists in `MMESearchFilter.tsx` component used on the products page
  - Use similar pattern but with conditional check for category page vs products page
  - Save car API logic exists in `MMESearchModal.tsx` - extract and reuse the same pattern

#### 3. Products Search Results Page - Replace MMESearchFilter with BaseSearchComponent

- **Location**: Products/Search Results page (Step 3)
- **Current Implementation**:
  - `MMESearchFilter.tsx` is currently used in the left sidebar of the products page
  - Located in: `next/screens/products/products.tsx`
  - Reference: `next/components/MMESearchFilter.tsx`
- **Changes Required**:
  - Replace `MMESearchFilter.tsx` with `BaseSearchComponent` on the products/search results page
  - **Keep all existing logic the same** (MME store updates, API calls, URL redirects, etc.)
  - **Move component position**:
    - **From**: Left sidebar (current location)
    - **To**: Top of the main content area (above the page title/breadcrumb)
  - The `MMESearchModal.tsx` will no longer be in the left sidebar
- **Layout Changes**:
  - BaseSearchComponent will appear as a horizontal banner at the top of the main content area
  - Desktop: Full-width horizontal banner layout
  - Mobile: Vertical card layout
  - Position: Above the page title "← [Category] for [Make] [Model]"
- **Functionality**:
  - All existing MME search functionality must be preserved
  - Enter button behavior: Redirect with reselected data (existing logic from `MMESearchFilter.tsx`)
  - Store updates: Continue using `next/stores/useMmeStore.ts`
  - URL updates: Continue using existing redirect logic from products page

#### 4. Empty Products State - Visual Error Indicator

- **Location**: Products/Search Results page (Step 3)
- **Trigger Condition**:
  - When API returns empty array of products (no products found)
  - After user performs a search using:
    - **BaseSearchComponent** (MME search)
    - **Saved Car dropdown component** (when user selects saved car and clicks "Select car")
- **Visual Changes**:
  - **Border**: Change component border to red color
  - **Background**: Change component background to red color (light red background)
  - **Error Icon**: Show red car icon with white exclamation mark in red circle
  - **Error Message**: Display "No matches for the selected car" text
  - This provides visual feedback that the search returned no results (see attached images)
- **Implementation**:
  - Check if products array from API is empty
  - Apply red border and red background styles to the component (BaseSearchComponent or Saved Car dropdown component) when empty state is detected
  - Show error icon and error message
  - Reset to normal styling when products are found or new search is performed

#### 5. Saved Cars Dropdown in BaseSearchComponent

- **Location**: BaseSearchComponent (used on Category page and Products page)
- **Reference**: `next/screens/landing/LandingSavedcarsContainer.tsx or LandingSavedcarsContainer2` (shows slider card implementation for saved cars)
- **BaseSearchComponent Structure**:
  - **Single View/Step**: BaseSearchComponent consists of 1 view only (see attached screenshot)
  - Components: Car icon, title "Identify your vehicle to view compatible products", MME dropdowns (Make, Model, Engine), Enter button
  - On Enter button click: Save the car as saved car (if authenticated and saveCarToGarage flag is enabled)
- **View Changes Based on Saved Cars**:
  - **If user has NO saved cars**:
    - Show standard MME search interface (Make, Model, Engine dropdowns)
    - Show Enter button
  - **If user HAS saved cars**:
    - **Replace MME search interface with "Saved Cars Component"**
    - **Component Structure**:
      - Car icon with checkmark (green) on the left
      - Text: "Showing products compatible with"
      - **Dropdown field** displaying selected car: "[Make] [Model] [Engine]" format
        - Example: "ALFA ROMEO 145 1.6 i.e. 16V T.S."
        - Dropdown arrow indicator on the right
      - **"Select car" button** on the right (green button with white text)
    - **Saved Cars Dropdown List**:
      - **List view** showing saved cars with **Make + Model name** format
      - Example: "ALFA ROMEO 145" (Make + Model only, no Engine)
      - **Recently added car** should be **automatically selected** when dropdown opens
      - **Menu item inside dropdown**: "Add Another Car" option
        - Clicking "Add Another Car" opens MME search interface (no confirm car pop-up)
        - Allows user to add a new car without confirmation modal
    - **On saved car selection from dropdown**:
      - Populate MME data from selected saved car
      - Call `generateMmeSearchData(car.makeModelTypeId)` to populate MME store
      - Update BaseSearchComponent to show selected car's full details in dropdown field
      - Reference saved car structure from `LandingSavedcarsContainer.tsx`:
        - `car.brandName` → Make
        - `car.modelName` → Model
        - `car.engineName` → Engine
        - `car.makeModelTypeId` → Use for generating MME search data
- **Implementation Details**:
  - Fetch saved cars using: `useGetMySavedCarsQuery()` hook (from `@/hooks/garage`)
  - Check if user is authenticated: `useAuthStore()` - `isAuthenticated`
  - Check if saved cars array has items: `savedCarsData.length > 0`
  - **Auto-select logic**:
    - Identify recently added car (check `car.isNew` flag or use most recent by timestamp)
    - Automatically select and populate MME data for recently added car
  - **Dropdown styling**:
    - Desktop: Horizontal banner layout with green background/white dropdown field (see attached desktop image)
    - Mobile: Vertical card layout with white background and green border (see attached mobile image)
    - Green car icon with checkmark overlay
    - "Select car" button styled as green button with white text

#### 6. Saved Cars Dropdown View - Selection and Search Logic

- **Location**: BaseSearchComponent - Saved Cars Component dropdown
- **Dropdown Functionality**:
  - Users can select from their saved cars in the dropdown
  - Can search/filter saved cars using `makeModelTypeId` data
  - Search logic similar to BaseSearchComponent MME search logic
  - Dropdown displays saved cars in list view format (Make + Model name)
- **Behavior Based on Page Type**:
  - **If Category Page**:
    - User can select different saved car from dropdown (car selection can change)
    - **On "Select car" button click**:
      - Update the page title below BaseSearchComponent to: `"Car Parts for [Make] [Model]"`
      - Use selected car's `makeModelTypeId` to update title
      - **DO NOT redirect**
      - **DO NOT add makeModelTypeId to URL**
      - Only update the title when "Select car" button is clicked
  - **If NOT Category Page (e.g., Products/Search Results page)**:
    - User selects saved car from dropdown
    - **On "Select car" button click**:
      - Use selected car's `makeModelTypeId` to redirect to URL
      - Redirect with `makeModelTypeId` parameter in URL
      - Similar to existing redirect logic in `MMESearchFilter.tsx` and `products.tsx`
- **Implementation Details**:
  - When user selects saved car from dropdown:
    - Store selected car's `makeModelTypeId` temporarily (don't update URL immediately)
    - Display selected car's details in dropdown field
  - On "Select car" button click:
    - Check if current page is category page or not
    - If category page: Update title only (no redirect/URL update)
    - If not category page: Redirect with `makeModelTypeId` in URL
  - Use `generateMmeSearchData(car.makeModelTypeId)` to populate MME store when car is selected
  - Reference existing redirect logic from `next/screens/products/products.tsx` for non-category pages

#### 7. Component Display Logic - SearchContainer with Conditional Rendering

- **Location**: SearchContainer component (wrapper component that handles conditional rendering)
- **Component Structure**:
  - Create a **SearchContainer** component that wraps the conditional rendering logic
  - SearchContainer will determine which component to display based on authentication and saved cars
- **Display Rules**:
  - **For Guest Users (Not Authenticated)**:
    - **Always show BaseSearchComponent** (MME search interface with Make, Model, Engine dropdowns)
    - Never show Saved Cars dropdown component
  - **For Logged In Users (Authenticated)**:
    - **If user has NO saved cars**:
      - Show **BaseSearchComponent** (MME search interface)
    - **If user HAS saved cars**:
      - Show **Saved Cars dropdown component** (with car icon, "Showing products compatible with" text, dropdown, and "Select car" button)
- **Implementation Details**:
  - **SearchContainer component** should contain the conditional rendering logic
  - Check authentication status: `useAuthStore()` - `isAuthenticated`
  - Check saved cars count: `useGetMySavedCarsQuery()` - `savedCarsData.length`
  - Conditional rendering logic inside SearchContainer:

    ```typescript
    // SearchContainer component
    const SearchContainer = () => {
      const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
      const { data: savedCarsData } = useGetMySavedCarsQuery();

      if (!isAuthenticated) {
        // Always show BaseSearchComponent for guest users
        return <BaseSearchComponent />;
      } else {
        // For logged in users
        if (savedCarsData?.length === 0) {
          // No saved cars - show BaseSearchComponent
          return <BaseSearchComponent />;
        } else {
          // Has saved cars - show Saved Cars dropdown component
          return <SavedCarsDropdownComponent />;
        }
      }
    };
    ```

#### 8. Whole End-to-End Flow - SearchContainer Component

- **Main Component**: **SearchContainer**
  - Contains 2 views that can switch between each other:
    - **View 1**: BaseSearchComponent (MME search interface)
    - **View 2**: SavedCarDropdown component (saved cars dropdown)

- **Complete Flow**:

  **a) Partial MME Data (Make only or Make + Model) - Enter Button Click:**
  - User fills partial data (M or MM) in BaseSearchComponent
  - User clicks Enter button
  - **If on catalog page**: Update catalog page title only (no redirect, no URL update)
  - **If NOT on catalog page**: Redirect with partial MME data in URL
  - View remains as View 1 (BaseSearchComponent)
  - **DO NOT** call save car API for partial data

  **b) Complete MME Data (Make + Model + Engine) - Enter Button Click:**
  - User fills complete MME data in BaseSearchComponent
  - User clicks Enter button
  - **Auto call save car API** (if authenticated and saveCarToGarage flag enabled)
  - **Auto select** the newly added car in SavedCarDropdown
  - **View changes from View 1 to View 2** (BaseSearchComponent → SavedCarDropdown)
  - Newly added car appears in dropdown and is automatically selected
  - **If on catalog page**: Update catalog page title with selected car
  - **If NOT on catalog page**: Redirect with makeModelTypeId in URL

  **c) Switching Back to View 1 (BaseSearchComponent):**
  - User is currently in View 2 (SavedCarDropdown)
  - User clicks **"Add a Car"** menu item inside the dropdown
  - **View changes from View 2 to View 1** (SavedCarDropdown → BaseSearchComponent)
  - User can now add a new car and search for new car using MME interface
  - BaseSearchComponent is displayed with empty/cleared MME fields

  **d) Duplicate Car Error Handling:**
  - User fills complete MME data in BaseSearchComponent
  - User clicks Enter button
  - Save car API is called
  - **API returns duplicate car error** (status 409, "Duplicate Car")
  - **View changes from View 1 to View 2** (BaseSearchComponent → SavedCarDropdown)
  - **Preselect the duplicate car** in SavedCarDropdown using its `makeModelTypeId`
  - The existing duplicate car (with same MME data) should be automatically selected in dropdown
  - User sees the duplicate car already in their saved cars list

- **Implementation Notes**:
  - SearchContainer manages the view state (View 1 vs View 2)
  - View switching logic should be handled within SearchContainer
  - Auto-selection of newly added car should happen immediately after successful API call
  - Duplicate car detection should match based on `makeModelTypeId` or MME combination
  - Error handling for duplicate car should gracefully switch views and preselect existing car
- **Reference for Duplicate Car API Implementation**:
  - **API Hook**: Use `useAddUpdateMyCarsToEB` hook (from `@/hooks/garage`)
  - **Error Handling**: Check for error response:
    - Status code: `409`
    - Error title: `"Duplicate Car"`
    - Reference implementation in:
      - `next/components/MMESearchModal.tsx` (see `handleConfirm` function, `onError` callback)
      - `next/screens/landing/LandingSavedcarsContainer.tsx` (see `useAddUpdateMyCarsToEB` usage)
      - `next/screens/landing/LandingSavedcarsContainer2.tsx` (see `addUpdateMyCarsMutation` usage)
  - **Duplicate Car Flow**:
    - When API returns 409 error with "Duplicate Car" title:
      - Switch view from View 1 (BaseSearchComponent) to View 2 (SavedCarDropdown)
      - Find the existing duplicate car in saved cars list by matching `makeModelTypeId`
      - Preselect that duplicate car in the SavedCarDropdown
      - User can see the car already exists in their saved cars

#### 9. SearchContainer Component Implementation Details

- **Location**: `next/components/SearchContainer.tsx`
- **Store**: `next/stores/useSearchContainerStore.ts`
- **Usage Pages**:
  - Category Catalogue page (Step 2) - at the top
  - Products/Search Results page (Step 3) - at the top (MMESearchFilter.tsx remains in sidebar for now)

- **SearchContainer Styling States**:
  - **View 1 default state**:
    - `border-top`: `1px solid var(--color-border-emphasis, #E1DED3)`
    - `border-bottom`: `1px solid var(--color-border-emphasis, #E1DED3)`
    - `background`: `var(--color-background-emphasis, #FAF9F6)`
  - **View 2 default state**:
    - `border-top`: `1px solid var(--color-border-positive, #009F4D)`
    - `border-bottom`: `1px solid var(--color-border-positive, #009F4D)`
    - `background`: `var(--color-background-positive-muted, #EEF6F4)`
  - **Incompatible state** (both View 1 and View 2):
    - `border-top`: `1px solid var(--color-border-danger, #C20000)`
    - `border-bottom`: `1px solid var(--color-border-danger, #C20000)`
    - `background`: `var(--color-background-danger-muted, #FFEAE6)`

- **Responsive Design**:
  - **View 1 (BaseSearchComponent)**:
    - Desktop (>= 640px): MME fields and Enter button arranged horizontally
    - Mobile (< 640px): MME fields and Enter button arranged vertically
  - **View 2 (SavedCarDropdown)**:
    - Desktop (>= 640px): Left-aligned, full-width layout
    - Mobile (< 640px): Center-aligned layout

#### 10. SavedCarDropdown Component - Dropdown Structure

- **Location**: Inside SearchContainer (View 2)
- **Dropdown Menu Structure** (similar to MMESearchFilter.tsx Model dropdown):
  1. **"Add new car"** - First item (always shown)
     - Clicking this switches view from View 2 to View 1 (BaseSearchComponent)
  2. **"Favorite" Section** (conditional - only shown if any car has `isFavorite: true`)
     - Section header: Gray background, semibold text (similar to MMESearchFilter model sections)
     - List all cars where `isFavorite: true`
     - Display format: `[BrandName] [ModelName]` (e.g., "AUDI A4")
     - Show checkmark icon for currently selected car
  3. **"Most Recent" Section** (always shown if there are cars)
     - Section header: Gray background, semibold text
     - List cars that are NOT in Favorite section
     - Display format: `[BrandName] [ModelName]` (e.g., "ALFA ROMEO 145")
     - Show checkmark icon for currently selected car

- **Saved Cars API Structure** (from `useGetMySavedCarsQuery`):

  ```typescript
  {
    brandId: string;
    brandName: string;
    modelId: string;
    modelName: string;
    typeId: string;
    typeName: string;
    engineId: string;
    engineName: string;
    id: string;
    name: string; // Full car name
    year: number;
    makeModelTypeId: string;
    isFavorite: boolean;
    isNew: boolean;
  }
  ```

- **Dropdown Implementation Reference**:
  - Use similar structure to `MMESearchFilter.tsx` Model dropdown (lines 431-447)
  - Section headers use: `bg-gray-50 p-2 font-semibold text-gray-700`
  - Dropdown items use: `cursor-pointer p-2 hover:bg-[#e3e9e7]`
  - Selected item shows checkmark: `<span className="mr-2 text-green-600">✓</span>`
