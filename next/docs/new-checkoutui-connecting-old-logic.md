# Checkout UI - Old Flow Documentation

## Overview

This document describes the **OLD checkout UI and logic flow** that was previously implemented. This serves as a reference for understanding the previous implementation when connecting the new UI to the existing logic.

## Old UI Structure

### Layout

- **2 Column Grid Layout**
  - **Left Column**: Accordions for user input (Contact Information, Order Type, Address)
  - **Right Column**: Overview card with cart items, pricing, and Pay Now button

## Old Accordion Structure (Left Column)

The left column contained **3 main accordions** in sequence:

### 1. Contact Information Accordion

- **Component**: [`next/screens/shoppingcart/checkout/Contactinformation.tsx`](next/screens/shoppingcart/checkout/Contactinformation.tsx)
- **Purpose**: Collects guest user contact information (name, email)
- **Visibility**: **Only visible for guest users** (`!isAuthenticated`) - positioned at the top of the accordion list
- **State Management**: Stores data in `useCartStore.ts` → `contactinfo` object
  ```typescript
  contactinfo: {
    firstName: string;
    lastName: string;
    email: string;
    emailconfirm: boolean;
  }
  ```
- **Behavior**:
  - Form fields update `contactinfo` in store in real-time (via `watch` and `useEffect`)
  - Has a **"Confirm" button** at the bottom
  - On confirm: Closes contact accordion, opens delivery address accordion (`setIsAccordionOpen(true)`)
  - Validation state affects Pay Now button enabled/disabled state

### 2. Order Type Accordion

- **Purpose**: Allows user to select Personal or Business order type
- **State Management**: Controlled by `isBusiness` boolean in `useCartStore.ts`
- **Components**:
  - Personal button (user icon)
  - Business button (briefcase icon) - disabled for guest users
- **Pre-selection Logic** (Runs on page load):
  - **Guest users**: Default to Personal (`isBusiness = false`)
  - **Authenticated users**:
    1. Fetch profile data
    2. Check if user has any business addresses (`isCompany === true`)
    3. If business address exists → Set `isBusiness = true`
    4. If no business addresses → Check last order's `billing.isCompany`
    5. If last order was business → Set `isBusiness = true`
    6. Otherwise → Default to Personal (`isBusiness = false`)
- **Behavior**:
  - Switching between Personal/Business filters billing addresses (business addresses for business mode, personal for personal mode)
  - Delivery addresses always show ALL addresses (not filtered)

### 3. Address Accordion

- **Purpose**: Manages billing and delivery addresses
- **State Management**: Multiple states in `useCartStore.ts`
- **Structure**:

  ```
  1. Billing Address Section
     - BillingaddressInput component (form)
     - OR SavedBillingAddress component (slider with saved addresses)

  2. Checkbox (isSameShipping)
     - "Delivery address same as billing address"
     - Controlled by isSameShipping boolean

  3. Delivery Address Section (shown when isSameShipping = false)
     - DeliveryaddressInput component (form)
     - OR SavedDeliveryAddress component (slider with saved addresses)

  4. Confirm Button (IMPORTANT)
     - Triggers form submission for both billing and delivery
     - Calls save address API (authenticated users only)
  ```

#### Address Components

**BillingaddressInput** (`next/components/BillingaddressInput.tsx`):

- Form for entering billing address
- For authenticated users: Has "Save Billing Address" button that calls save address API
- For guest users: No save button, data persists to `guestBillingFormData` in store
- Supports both Personal and Business address types
- Business mode shows: VAT number, Company name, Email fields
- Personal mode shows: Name field

**DeliveryaddressInput** (`next/components/DeliveryaddressInput.tsx`):

- Form for entering delivery address
- For authenticated users: Has "Save Delivery Address" button that calls save address API
- For guest users: No save button, data persists to `guestDeliveryFormData` in store
- Can be used for billing (guest users) via `isBillingForm` prop

**SavedBillingAddress** (`next/components/SavedBillingAddress.tsx`):

- Horizontal slider showing saved billing addresses
- Only shown for authenticated users with saved addresses
- Selecting an address:
  - Sets `selectedSavedBillingAddress` in store
  - Hides the billing form (`formMode.billing = "hidden"`)
  - Updates `isSameBilling` checkbox state if delivery address matches

**SavedDeliveryAddress** (`next/components/SavedDeliveryAddress.tsx`):

- Horizontal slider showing saved delivery addresses
- Only shown for authenticated users with saved addresses
- Selecting an address:
  - Sets `selectedSavedDeliveryAddress` in store
  - If `isSameBilling` is true, also sets `selectedSavedBillingAddress`
  - Hides the delivery form (`formMode.delivery = "hidden"`)

#### Confirm Button (Critical for Old Flow)

**Location**: Inside the Address Accordion component

**Behavior**:

- **For Authenticated Users**:
  - Validates both billing and delivery forms (if needed)
  - Calls save address API for both addresses (if forms are filled)
  - Sets `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` in store
  - Closes address accordion
  - Opens payment accordion

- **For Guest Users**:
  - Validates forms using Zod schema
  - **NO API call** - just saves form data to store:
    - Sets `selectedSavedBillingAddress` = billing form data
    - Sets `selectedSavedDeliveryAddress` = delivery form data (or billing if `isSameShipping`)
  - Closes address accordion
  - Opens payment accordion

**Key Difference**: Guest users don't call save address API, just store form data in Zustand store.

## Pay Now Button

**Location**: [`next/screens/shoppingcart/overviewcard.tsx`](next/screens/shoppingcart/overviewcard.tsx) (Right column)

**Behavior**:

- Separate from address save button
- Uses `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` from store
- Calls payment API with address data
- **Enabled/Disabled State**: The Pay Now button gets enabled based on validation of:
  - **Contact Information accordion** (for guest users): Contact info must be valid (`contactinfo` with valid firstName, lastName, email)
  - **Address valid state** (address accordion): Billing and delivery addresses must be selected/valid
  - Payment method selected (if feature flag enabled)
- Disabled state checks:
  - Payment method selected (if feature flag enabled)
  - Billing address selected (`selectedSavedBillingAddress !== null`)
  - Delivery address selected (`selectedSavedDeliveryAddress !== null`)
  - For guest users: Contact info valid (`contactinfo.firstName`, `contactinfo.lastName`, `contactinfo.email`) and guest address forms valid (`guestAddressFormsValid`)

## State Management (useCartStore.ts)

### Address Related States

```typescript
// Saved addresses (from API - authenticated users only)
savedShippingAddresses: any[]
savedBillingAddresses: any[]

// Selected addresses (used for payment)
selectedSavedBillingAddress: any | null
selectedSavedDeliveryAddress: any | null

// Guest user form data (no API call)
guestBillingFormData: any | null
guestDeliveryFormData: any | null

// Form display mode
formMode: {
  delivery: "add" | "edit" | "hidden"
  billing: "add" | "edit" | "hidden"
}

// Checkbox states
isSameShipping: boolean  // Delivery same as billing
isSameBilling: boolean   // Billing same as delivery (legacy)

// Accordion state
isAccordionOpen: boolean  // Address accordion open/closed

// Order type
isBusiness: boolean  // Personal (false) or Business (true)
```

### Contact Information State

```typescript
contactinfo: {
  firstName: string;
  lastName: string;
  email: string;
  emailconfirm: boolean;
}
```

## Key Differences: Guest vs Authenticated Users

### Guest Users

- ✅ Contact Information accordion shown
- ✅ No saved address sliders (SavedBillingAddress/SavedDeliveryAddress)
- ✅ Only address input forms shown
- ✅ **NO save address API calls**
- ✅ Address form data stored in `guestBillingFormData` and `guestDeliveryFormData`
- ✅ Confirm button in address accordion just validates and stores data
- ✅ Business mode disabled (can't select business for guests)

### Authenticated Users

- ❌ No Contact Information accordion (user info comes from auth)
- ✅ Saved address sliders shown (if addresses exist)
- ✅ Address input forms shown (if no saved addresses or adding new)
- ✅ **Save address API calls** when clicking "Save Billing Address" or "Save Delivery Address" buttons
- ✅ Confirm button validates and calls save address API
- ✅ Business mode enabled
- ✅ Address filtering: Billing addresses filtered by Personal/Business mode, Delivery shows ALL addresses

## Form Mode Logic

The `formMode` state controls which forms are visible:

- `"add"`: Show input form
- `"edit"`: Show input form (for editing existing address)
- `"hidden"`: Hide form, show saved address slider

**Rules**:

- If saved addresses exist → Show slider, hide form (`formMode = "hidden"`)
- If no saved addresses → Show form (`formMode = "add"`)
- When user clicks "Add New Address" → Set `formMode = "add"` or `"edit"`
- When user selects saved address → Set `formMode = "hidden"`

## Pre-selected Tab Logic (Personal/Business)

**Implementation**: `useEffect` hook in checkout page (lines 512-588)

**Logic Flow**:

1. Only runs on initial page load (`isInitialLoad.current === true`)
2. Guest users → Always Personal (`isBusiness = false`)
3. Authenticated users:
   - Fetch fresh profile data
   - Check addresses for business addresses (`isCompany === true`)
   - If business address found → `isBusiness = true`
   - If no business addresses → Fetch orders
   - Check last order's `billing.isCompany`
   - If last order was business → `isBusiness = true`
   - Otherwise → `isBusiness = false` (Personal)

**Why this matters**: The pre-selection affects which addresses are shown in the billing address slider (filtered by Personal/Business mode).

## Address Selection Logic

### When User Selects Saved Address

1. User clicks address card in slider
2. `setSelectedSavedBillingAddress(address)` or `setSelectedSavedDeliveryAddress(address)` called
3. Form mode set to `"hidden"` to hide input form
4. If `isSameShipping` is true and billing address selected → Also set delivery address
5. If `isSameBilling` is true and delivery address selected → Also set billing address

### When User Clicks "Add New Address"

1. `setSelectedSavedBillingAddress(null)` or `setSelectedSavedDeliveryAddress(null)`
2. `setFormMode({ billing: "add" })` or `setFormMode({ delivery: "add" })`
3. Form becomes visible

### When User Saves New Address (Authenticated)

1. Fill out form
2. Click "Save Billing Address" or "Save Delivery Address" button
3. Form validation runs
4. Save address API called
5. Profile data refetched
6. Saved addresses list updated
7. Form mode set to `"hidden"`
8. New address automatically selected

## Flow Diagram

```
User Lands on Checkout Page
│
├─→ Pre-select Personal/Business Tab (based on addresses/orders)
│
├─→ For Guest Users:
│   ├─→ Show Contact Information Accordion
│   ├─→ User fills contact info → Confirm → Closes accordion
│   └─→ Show Order Type Accordion (Personal only)
│
├─→ For Authenticated Users:
│   └─→ Show Order Type Accordion (Personal/Business based on pre-selection)
│
├─→ Show Address Accordion
│   ├─→ If saved addresses exist → Show address sliders
│   ├─→ If no saved addresses → Show input forms
│   ├─→ User selects address OR fills form
│   └─→ User clicks "Confirm" button
│       ├─→ For Authenticated: Validate + Save API + Store selected
│       └─→ For Guest: Validate + Store form data (no API)
│
└─→ Address Accordion closes → Payment Accordion opens
    └─→ User clicks "Pay Now" in Overview Card (right column)
        └─→ Payment API called with selected addresses
```

## Key Takeaways for New UI Integration

1. **Two Separate Buttons**: Address save/confirm button (in accordion) is separate from Pay Now button (in overview card)
2. **Guest vs Authenticated**: Different flows - guest users don't call save address API
3. **Form Mode Management**: `formMode` controls visibility of forms vs sliders
4. **Address Filtering**: Billing addresses filtered by Personal/Business mode, delivery shows ALL
5. **Pre-selection Logic**: Personal/Business tab pre-selected based on addresses/orders
6. **State Persistence**: Guest form data stored in store, authenticated users use API-saved addresses
7. **Checkbox Logic**: `isSameShipping` controls whether delivery address form/slider is shown

---

# Checkout UI - New Implementation Logic

## Overview

This section describes the **NEW checkout UI implementation** that replaces the old accordion-based structure with a card-based layout. The UI is already implemented - this documentation focuses on connecting the old logic to the new UI structure.

## New UI Structure

### Layout Changes

- **No Accordions**: Replaced with **Card-based layout**
- **2 Column Grid Layout** (maintained):
  - **Left Column**: Cards for user input (Delivery/Collect, Details)
  - **Right Column**: Overview card with cart items, pricing, and Pay Now button

## New Card Structure (Left Column)

The left column now contains **2 main cards** in sequence:

### 1. Delivery or Collect Card

- **Purpose**: Allows user to select delivery method
- **Component**: Radio group with 2 options
- **Options**:
  1. **Standard Delivery** (`homeDelivery`)
     - Shows shipping fee price
     - Description text
  2. **Warehouse Collection** (`warehousePickup`)
     - Shows "Free" price
     - Description text
- **State Management**: Uses `activeTab` from `useTabsStore` (same as old implementation)
- **Behavior**:
  - User selects one of the two radio options
  - Selection stored in `activeTab` state
  - Replaces old accordion-based delivery method selection

### 2. Details Card

- **Purpose**: Contains Personal/Business selection, Contact Information, and Address inputs
- **Structure**: Single card with multiple sections

#### Section A: Personal/Business Tab Selection

- **Purpose**: Allows user to select Personal or Business order type
- **State Management**: Controlled by `isBusiness` boolean in `useCartStore.ts` (same as old)
- **Pre-selection Logic**: **Same as old implementation** (runs on page load):
  - Guest users → Always Personal (`isBusiness = false`)
  - Authenticated users:
    1. Fetch profile data
    2. Check if user has any business addresses (`isCompany === true`)
    3. If business address exists → Set `isBusiness = true`
    4. If no business addresses → Check last order's `billing.isCompany`
    5. If last order was business → Set `isBusiness = true`
    6. Otherwise → Default to Personal (`isBusiness = false`)
- **Components**:
  - Personal button (user icon)
  - Business button (briefcase icon) - disabled for guest users
- **Behavior**:
  - Switching between Personal/Business filters billing addresses (same as old)
  - Delivery addresses always show ALL addresses (same as old)

#### Section B: Contact Information

- **Component**: [`next/screens/shoppingcart/checkout/ConatctInfo2.tsx`](next/screens/shoppingcart/checkout/ConatctInfo2.tsx)
- **Purpose**: Collects contact information (name, email)
- **Visibility**: **Now visible for BOTH logged in and guest users** (changed from old implementation)
- **State Management**: Stores data in `useCartStore.ts` → `contactinfo` object (same as old)
  ```typescript
  contactinfo: {
    firstName: string;
    lastName: string;
    email: string;
    emailconfirm: boolean;
  }
  ```
- **Behavior**:
  - Form fields update `contactinfo` in store in real-time (via `watch` and `useEffect`)
  - No separate "Confirm" button (integrated into "ORDER AND PAY" button)
  - Data stored in `useCartStore.ts` as user types

#### Section C: Address Inputs

Address handling varies based on user authentication and saved address status:

##### For Guest Users OR Logged In Users with No Saved Addresses

- **Component**: [`next/components/BillingaddressInput.tsx`](next/components/BillingaddressInput.tsx)
- **Behavior**:
  - **Guest users**: Address form data stored directly in `useCartStore.ts` → `guestBillingFormData` and `guestDeliveryFormData` (no API call)
  - **Logged in users with no saved addresses**: Address form data will be saved via API when "ORDER AND PAY" button is clicked
- **Form Display**: Address input form is visible

##### For Logged In Users with Saved Addresses

**Address List Display Logic**:

1. **When NO address is selected**:
   - Shows full list of address cards using:
     - [`next/components/SavedBillingAddress2.tsx`](next/components/SavedBillingAddress2.tsx) for billing
     - [`next/components/SavedDeliveryAddress2.tsx`](next/components/SavedDeliveryAddress2.tsx) for delivery
   - User can scroll/select from the list

2. **When address IS selected**:
   - Shows **ONLY the selected address card** with a "Change Address" button
   - Clicking "Change Address" reveals the full list again
   - Uses `showAllAddresses` state in SavedBillingAddress2/SavedDeliveryAddress2 components

**Add/Edit Address Modal**:

- **Component**: [`next/screens/profile/EditAddressModal.tsx`](next/screens/profile/EditAddressModal.tsx)
- **Trigger**: "Add Address" button (when user has saved addresses)
- **Behavior**:
  - Opens the same modal used in Profile page
  - Supports both "Add" and "Edit" modes
  - On save: Address is saved via API, profile data refetched, new address automatically selected
  - Modal state managed by `useEditAddressModalStore`

#### Section D: isSameShipping Checkbox

- **Purpose**: "Delivery address same as billing address" checkbox
- **State Management**: `isSameShipping` boolean in `useCartStore.ts` (same as old)
- **Behavior**:
  - When checked: Delivery address uses billing address
  - When unchecked: Shows separate delivery address input/selection
  - **Same logic as old implementation** - maintain existing behavior

#### Section E: ORDER AND PAY Button

- **Location**: Bottom of Details Card
- **Purpose**: Single button that handles both address saving and payment initiation
- **Behavior varies by user state**:

##### f-a) For Guest Users (Logged Out)

- **Flow**:
  1. Validates contact information form
  2. Validates address forms (billing and delivery if `isSameShipping = false`)
  3. **NO save address API call**
  4. Stores form data in `useCartStore.ts`:
     - `contactinfo` → contact information
     - `guestBillingFormData` → billing address form data
     - `guestDeliveryFormData` → delivery address form data (or billing if `isSameShipping`)
  5. Sets `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` to form data objects
  6. Calls payment API with contact info and address data as payload

##### f-b) For Logged In Users with No Saved Addresses

- **Flow**:
  1. Validates contact information form
  2. Validates address forms (billing and delivery if `isSameShipping = false`)
  3. **AWAIT save address API call** for billing address (and delivery if different)
  4. After address API success:
     - Profile data refetched
     - New address automatically selected
  5. Sets `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` to saved addresses
  6. Calls payment API with contact info and selected address data

**Key Point**: Single button handles both save address and payment - must await address API completion before payment API call.

##### f-c) For Logged In Users with Saved Addresses

- **Flow**:
  1. User can either:
     - **Option 1**: Select existing saved address from list
     - **Option 2**: Click "Add Address" → Opens EditAddressModal → Save new address → New address auto-selected
  2. Validates contact information form
  3. Validates that address is selected (`selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` are not null)
  4. **NO save address API call** (addresses already saved)
  5. Calls payment API with contact info and selected address data

**Key Point**: If user adds new address via modal, that address is automatically selected after save, then payment API is called.

## State Management (Same as Old)

All state management remains the same as old implementation:

- `useCartStore.ts` - All existing states maintained
- `useTabsStore` - For delivery method selection
- `useEditAddressModalStore` - For add/edit address modal
- `useAuthStore` - For authentication state

## Key Differences from Old Implementation

### 1. UI Structure

- ❌ **Old**: 3 separate accordions (Contact Info, Order Type, Address)
- ✅ **New**: 2 cards (Delivery/Collect, Details with all sections)

### 2. Contact Information Visibility

- ❌ **Old**: Only visible for guest users
- ✅ **New**: Visible for BOTH guest and logged in users

### 3. Contact Information Location

- ❌ **Old**: Separate accordion at top
- ✅ **New**: Inside Details card, below Personal/Business tabs

### 4. Address Save Button

- ❌ **Old**: Separate "Save Billing Address" and "Save Delivery Address" buttons in forms
- ✅ **New**: Single "ORDER AND PAY" button at bottom of Details card

### 5. Address Selection Display

- ❌ **Old**: Horizontal slider always showing all addresses
- ✅ **New**:
  - Shows full list when no address selected
  - Shows single selected card with "Change Address" button when address selected
  - Clicking "Change Address" reveals full list again

### 6. Add/Edit Address

- ❌ **Old**: Inline forms within address accordion
- ✅ **New**: Modal popup (`EditAddressModal`) same as Profile page

### 7. Button Flow

- ❌ **Old**: Two separate buttons - "Confirm" (in accordion) and "Pay Now" (in overview card)
- ✅ **New**: Single "ORDER AND PAY" button that handles both save address (if needed) and payment

## Implementation Notes

### ⚠️ CRITICAL IMPLEMENTATION REQUIREMENTS

#### 1. Address Input Forms Visibility Rules

**IMPORTANT**: The following components should **ONLY** be visible for:

- **Guest users** (not authenticated)
- **Logged in users with NO saved addresses**

**Components**:

- [`next/components/BillingaddressInput.tsx`](next/components/BillingaddressInput.tsx)
- [`next/components/DeliveryaddressInput.tsx`](next/components/DeliveryaddressInput.tsx)

**Conditional Rendering Logic**:

```typescript
// Show input forms ONLY for:
// 1. Guest users (!isAuthenticated)
// 2. Logged in users with no saved addresses (!savedBillingAddresses || savedBillingAddresses.length === 0)

// NEVER show input forms for logged in users WITH saved addresses
```

#### 2. Saved Address Components - Two View System

For logged in users **WITH saved addresses**, use:

- [`next/components/SavedBillingAddress2.tsx`](next/components/SavedBillingAddress2.tsx) for billing addresses
- [`next/components/SavedDeliveryAddress2.tsx`](next/components/SavedDeliveryAddress2.tsx) for delivery addresses

**These components MUST implement a two-view system**:

##### View 1: Single Selected Address Card

- **When**: An address is selected (`selectedSavedBillingAddress` or `selectedSavedDeliveryAddress` is set)
- **Display**: Shows **ONLY** the selected address card
- **Features**:
  - Displays selected address details
  - Has a **"Change Address"** button
  - Clicking the button switches to View 2

##### View 2: Full Address List

- **When**: User clicks "Change Address" button OR no address is selected initially
- **Display**: Shows **vertical list** of all saved addresses (replaces old horizontal slider)
- **Features**:
  - Each address card has an **"Edit"** button
  - Clicking "Edit" opens `EditAddressModal` in edit mode
  - **"Add Address"** button at the bottom of the list
  - Clicking "Add Address" opens `EditAddressModal` in add mode
  - Clicking any address card selects it and switches back to View 1

**State Management**:

- Use `showAllBillingAddresses` and `showAllDeliveryAddresses` in `useCartStore.ts` to control view switching
- View 1: `showAllAddresses = false` (component internal state)
- View 2: `showAllAddresses = true` (component internal state)

#### 3. Add/Edit Address Modal Integration

**Component**: [`next/screens/profile/EditAddressModal.tsx`](next/screens/profile/EditAddressModal.tsx)

**Behavior**:

- **Add Mode**: Triggered by "Add Address" button in View 2
- **Edit Mode**: Triggered by "Edit" button on any address card in View 2
- **On Save Success**:
  1. Address is saved via API
  2. **MUST refetch profile data** to get updated address list
  3. Update `savedBillingAddresses` and `savedShippingAddresses` in store
  4. **Auto-select the newly added address** (if adding) or keep selected address (if editing)
  5. Switch to View 1 (single selected card view)
  6. Show full address list view (`showAllBillingAddresses = true`, `showAllDeliveryAddresses = true`) after modal closes

**Implementation**:

- Watch for `isEditAddressModalOpen` state change in checkout page
- When modal closes (transitions from `true` to `false`):
  - Refetch profile data using `getProfile()`
  - Update address lists in store
  - Auto-select new address if one was added
  - Ensure View 2 is shown (full list) so user can see the new address

#### 4. Address Preselection Logic

**CRITICAL**: The preselection logic from the old implementation **MUST be maintained**.

**On Page Load**:

- For logged in users with saved addresses:
  - **Billing Address**: Auto-select based on:
    1. Default billing address (`isDefaultBilling === true`)
    2. First address in filtered list (filtered by Personal/Business mode)
  - **Delivery Address**: Auto-select based on:
    1. Default shipping address (`isDefaultShipping === true`)
    2. First address in the list
  - If `isSameShipping === true`, use billing address for delivery

**Implementation**:

- Use the same `useEffect` logic from old checkout page (lines 512-588)
- Run on initial page load only (`isInitialLoad.current === true`)
- Filter billing addresses by `isBusiness` mode (business addresses for business mode, personal for personal mode)
- Delivery addresses show ALL addresses (no filtering)

### Reusing Old Components

The following old components/logic should be reused:

1. **BillingaddressInput.tsx** - For guest users and logged in users with no saved addresses
2. **DeliveryaddressInput.tsx** - For delivery address input (when `isSameShipping = false`)
3. **SavedBillingAddress2.tsx** - For displaying saved billing addresses (with two-view system)
4. **SavedDeliveryAddress2.tsx** - For displaying saved delivery addresses (with two-view system)
5. **EditAddressModal.tsx** - For adding/editing addresses (reuse from Profile page)
6. **ContactInfo2.tsx** - For contact information form
7. **Pre-selection logic** - Same `useEffect` hook for Personal/Business tab (lines 512-588 in old checkout page)
8. **isSameShipping logic** - Maintain existing checkbox behavior
9. **Address filtering logic** - Billing filtered by Personal/Business, Delivery shows ALL
10. **Form validation** - Same Zod schemas and validation logic

### New Logic to Implement

1. **"ORDER AND PAY" button handler** - Must handle three different flows:
   - Guest user: Validate → Store in state → Call payment API
   - Logged in (no saved): Validate → Save address API → Wait → Call payment API
   - Logged in (with saved): Validate → Call payment API

2. **Two-View System in SavedBillingAddress2/SavedDeliveryAddress2**:
   - **View 1 (Single Card)**:
     - Show when `selectedSavedBillingAddress` or `selectedSavedDeliveryAddress` is set
     - Display only the selected address
     - "Change Address" button toggles to View 2
     - Controlled by `showAllAddresses = false` (component internal state)

   - **View 2 (Full List)**:
     - Show when `showAllAddresses = true` OR no address selected
     - Vertical list of all addresses (replaces old horizontal slider)
     - Each card has "Edit" button → Opens EditAddressModal in edit mode
     - "Add Address" button at bottom → Opens EditAddressModal in add mode
     - Clicking any address card selects it and switches to View 1
     - Controlled by `showAllAddresses = true` (component internal state)

3. **EditAddressModal Integration**:
   - Watch for modal close (`isEditAddressModalOpen` changes from `true` to `false`)
   - On close: Refetch profile data → Update address lists → Auto-select new address (if added)
   - Show View 2 (full list) after modal closes to display new address
   - Use `useEditAddressModalStore` for modal state management

4. **Address Preselection on Load**:
   - Maintain old implementation logic (lines 512-588 in old checkout page)
   - Auto-select default billing address or first filtered billing address
   - Auto-select default shipping address or first shipping address
   - Respect `isSameShipping` checkbox state

5. **Conditional Rendering for Input Forms**:
   - **NEVER** show `BillingaddressInput` or `DeliveryaddressInput` for logged in users with saved addresses
   - **ONLY** show for:
     - Guest users (`!isAuthenticated`)
     - Logged in users with no saved addresses (`!savedBillingAddresses || savedBillingAddresses.length === 0`)

6. **Contact info validation** - Ensure contact info is validated before enabling "ORDER AND PAY" button

## Flow Diagram (New Implementation)

```
User Lands on Checkout Page
│
├─→ Pre-select Personal/Business Tab (same logic as old)
│
├─→ Show "Delivery or Collect" Card
│   └─→ User selects Standard Delivery or Warehouse Collection
│
├─→ Show "Details" Card
│   ├─→ Personal/Business Tab Selection (same as old)
│   ├─→ Contact Information Form (visible for ALL users)
│   │   └─→ Data stored in useCartStore.ts contactinfo (real-time)
│   │
│   └─→ Address Section
│       │
│       ├─→ For Guest Users:
│       │   ├─→ Show BillingaddressInput form
│       │   ├─→ Show isSameShipping checkbox
│       │   ├─→ If isSameShipping = false → Show DeliveryaddressInput form
│       │   └─→ Data stored in guestBillingFormData/guestDeliveryFormData
│       │
│       ├─→ For Logged In (No Saved Addresses):
│       │   ├─→ Show BillingaddressInput form
│       │   ├─→ Show isSameShipping checkbox
│       │   ├─→ If isSameShipping = false → Show DeliveryaddressInput form
│       │   └─→ Address will be saved when "ORDER AND PAY" clicked
│       │
│       └─→ For Logged In (With Saved Addresses):
│           ├─→ If no address selected:
│           │   └─→ Show full list (SavedBillingAddress2/SavedDeliveryAddress2)
│           ├─→ If address selected:
│           │   └─→ Show single card with "Change Address" button
│           ├─→ "Add Address" button → Opens EditAddressModal
│           └─→ "Edit Address" → Opens EditAddressModal
│
└─→ User clicks "ORDER AND PAY" button
    │
    ├─→ For Guest:
    │   ├─→ Validate contact info + addresses
    │   ├─→ Store in useCartStore.ts (no API)
    │   └─→ Call payment API
    │
    ├─→ For Logged In (No Saved):
    │   ├─→ Validate contact info + addresses
    │   ├─→ AWAIT save address API
    │   ├─→ Refetch profile → Auto-select new address
    │   └─→ Call payment API
    │
    └─→ For Logged In (With Saved):
        ├─→ Validate contact info + address selection
        └─→ Call payment API
```

## Key Takeaways for Implementation

1. **Single Button Flow**: "ORDER AND PAY" button replaces old two-button flow (Confirm + Pay Now)
2. **Contact Info Always Visible**: Now shown for both guest and logged in users
3. **Address Display Logic**: Toggle between full list and single card based on selection state
4. **Modal for Add/Edit**: Reuse EditAddressModal from Profile page
5. **Async Address Save**: For logged in users with no saved addresses, must await address API before payment API
6. **Auto-selection**: New addresses saved via modal are automatically selected
7. **Maintain Old Logic**: Pre-selection, filtering, isSameShipping, and validation logic remain the same

## ⚠️ CRITICAL CHECKLIST FOR IMPLEMENTATION

Before considering the implementation complete, verify:

- [ ] **Input Forms Visibility**: `BillingaddressInput` and `DeliveryaddressInput` are **ONLY** visible for:
  - Guest users
  - Logged in users with NO saved addresses
  - **NEVER** visible for logged in users WITH saved addresses

- [ ] **Two-View System**: `SavedBillingAddress2` and `SavedDeliveryAddress2` implement:
  - View 1: Single selected address card with "Change Address" button
  - View 2: Vertical list of all addresses with "Edit" buttons and "Add Address" button at bottom

- [ ] **EditAddressModal Integration**:
  - Opens correctly for both "Add" and "Edit" modes
  - Refetches profile data on close
  - Updates address lists in store
  - Auto-selects newly added address
  - Shows View 2 (full list) after modal closes

- [ ] **Address Preselection**:
  - Default addresses are auto-selected on page load
  - Uses same logic as old implementation
  - Respects Personal/Business filtering for billing addresses
  - Delivery addresses show ALL addresses

- [ ] **isSameShipping Checkbox**:
  - Works correctly for all user types
  - Updates delivery address selection appropriately
  - Does not cause input forms to appear for logged in users with saved addresses
