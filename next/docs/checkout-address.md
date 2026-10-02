# Guest Checkout Address Validation Flow

## Overview

This document describes the address form handling and validation flow for **guest users only** in the checkout process. Authenticated users follow a different flow and are not covered in this document.

## Key Components

- **Checkout Page**: `next/screens/shoppingcart/checkout/page.tsx`
- **Address Input Component**: `next/components/DeliveryaddressInput.tsx`
- **Note**: Guest users always use `DeliveryaddressInput.tsx` for both billing and delivery addresses (NOT `BillingaddressInput.tsx`)

## Form Structure

### Personal Tab (isBusiness = false)

1. **Billing Address Form**
   - Component: `DeliveryaddressInput.tsx` with `isBillingForm={true}`
   - Stores form data in: `guestBillingFormData` (Cart Store)
   - Uses Zod validation schema (same as delivery form)

2. **isSameShipping Checkbox**
   - When checked: Delivery address uses same data as billing
   - When unchecked: Separate delivery address form is shown

3. **Delivery/Shipping Address Form** (only when isSameShipping = false)
   - Component: `DeliveryaddressInput.tsx` with `isBillingForm={false}`
   - Stores form data in: `guestDeliveryFormData` (Cart Store)
   - Uses same Zod validation schema as billing form

4. **Confirm Button**
   - Enabled when both forms are valid according to the rules below

## Validation Rules

### Rule 1: Same Shipping Address

- **Condition**: `guestBillingFormData` is valid AND `isSameShipping` = true
- **Action**:
  - Make `guestDeliveryFormData` also valid (treat as valid)
  - Enable Confirm button
  - Set both `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` to `guestBillingFormData`

### Rule 2: Different Shipping Address

- **Condition**: `guestBillingFormData` is valid AND `isSameShipping` = false
- **Action**:
  - Check validation of `guestDeliveryFormData`
  - If `guestDeliveryFormData` is valid:
    - Enable Confirm button
    - Set `selectedSavedBillingAddress` to `guestBillingFormData`
    - Set `selectedSavedDeliveryAddress` to `guestDeliveryFormData`
  - If `guestDeliveryFormData` is invalid:
    - Disable Confirm button
    - Keep `selectedSavedBillingAddress` as `guestBillingFormData`
    - Clear `selectedSavedDeliveryAddress` (set to null)

### Rule 3: Invalid Billing Form

- **Condition**: `guestBillingFormData` is invalid
- **Action**:
  - Disable Confirm button
  - Clear both `selectedSavedBillingAddress` and `selectedSavedDeliveryAddress` (set to null)

## Form Data Validation

The validation function `validateGuestAddressFormData` checks:

1. **Required Fields**: `street`, `city`, `postalCode`, `country` must be filled
2. **House Number**: Required for BE, NL, LU countries; optional for others
3. **Phone Number**: Optional, but must be valid if provided (uses `isPossiblePhoneNumber`)

## Data Flow

### Form Data Storage

- Guest users do NOT call API for address saving
- Form data is stored in Cart Store:
  - `guestBillingFormData`: Billing address form data
  - `guestDeliveryFormData`: Delivery address form data

### Address Selection

- When forms are valid, form data is copied to:
  - `selectedSavedBillingAddress`: Used for billing
  - `selectedSavedDeliveryAddress`: Used for delivery/shipping

### Validation Updates

- Validation runs continuously (every 500ms) for real-time button state updates
- Validation checks form data stored in Cart Store, not form refs
- Selected addresses are updated automatically when forms become valid

## Implementation Details

### DeliveryaddressInput Component

- Accepts `isBillingForm` prop to distinguish billing vs delivery usage
- When `isBillingForm={true}`:
  - Shows "Billing Address" label instead of "Delivery Address"
  - Stores form data in `guestBillingFormData`
  - Uses `guestBillingFormData` for default values
- When `isBillingForm={false}`:
  - Shows "Delivery Address" label
  - Stores form data in `guestDeliveryFormData`
  - Uses `guestDeliveryFormData` for default values

### Checkout Page Validation

- Uses `validateGuestAddressFormData()` function to validate stored form data
- Does NOT use form refs for guest users (only for authenticated users)
- Updates `guestAddressFormsValid` state based on validation rules
- Automatically updates selected addresses when forms are valid

## Important Notes

1. **No API Calls**: Guest users do not save addresses to the server. Form data is only stored in Cart Store.
2. **Component Reuse**: `DeliveryaddressInput.tsx` is used for both billing and delivery forms for guest users.
3. **Real-time Validation**: Validation runs every 500ms to provide immediate feedback.
4. **State Management**: All guest form data and validation state is managed in Cart Store (`useCartStore`).
