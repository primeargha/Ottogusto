## Checkout address cards – where they are rendered

- **Entry point file**: `next/screens/shoppingcart/checkout/page.tsx`.
- **Key render location** (for both **home delivery** and **warehouse pickup**, personal or business, logged-in users with saved addresses):

```975:1010:next/screens/shoppingcart/checkout/page.tsx
  return (
    <Box className={`flex min-h-screen min-w-full flex-col justify-between base:gap-0`}>
      <Box className={`flex w-full flex-col items-start gap-content-to-footer gap-header-to-title`}>
        <Box
          className={`flex w-full flex-row items-center gap-6 gap-title-to-content section-standard`}
        >
          <Typography
            type="h1"
            className="text-color-text-body typography-heading-01"
            hasBack
            backroute={`${getRouteLocaleString(Routes.shoppingCart, params)}`}
          >
            {getLabel("checkout")}
          </Typography>
        </Box>

        <Box className="flex section-split-primary-right base:mb-0 base:h-full base:w-full base:flex-col gtlg:w-full gtlg:flex-row ml:flex ml:flex-row">
          <Box className="flex max-w-full flex-col grid-gap-listing gtsm:pb-0 gtlg:flex-1">
            <DeliveryMethodSelector
              activeTab={activeTab}
              onChange={(value) => {
                if (value === "homeDelivery" || value === "warehousePickup") {
                  handleDeliveryMethodChange(value);
                } else {
                  setActiveTab(value);
                }
              }}
              standardDeliveryShippingFee={standardDeliveryShippingFee ?? 0}
              shippingfee={shippingfee}
              getLabel={getLabel}
              localeCODE={localeCODE}
              showWarehouseOption={getClientFeatureFlag("delivery_method_flag")}
            />

            {useTabsStore((state) => state.tabs.find((tab) => tab.id === state.activeTab)?.content)}
```

- **How address cards appear**:
  - `useCheckoutTabs(...)` (called earlier in `page.tsx`) configures `useTabsStore` with tab `content` for the current combination of:
    - **Delivery method**: `homeDelivery` vs `warehousePickup`.
    - **Account type**: personal vs business (`isBusiness`).
    - **Auth state** and **saved addresses**: `savedBillingAddresses`, `savedShippingAddresses`, `selectedSavedBillingAddress`, `selectedSavedDeliveryAddress`, `formMode`, `isSameShipping`, etc.
  - Those tab `content` elements are React trees that render the **address cards** (billing + delivery) for logged-in users with saved addresses, or the **address forms** when there are no saved addresses / form mode is `"add"`.
  - In other words, the **actual visual cards** (for home delivery / warehouse pickup, personal/business) live inside the components returned by `useCheckoutTabs`, but they are **mounted into the page here** via the tab `content` render shown above.

## NOTE

When analysing or changing **address card behaviour for logged-in users with saved addresses** (personal or business, home delivery or warehouse pickup), this is the key hook-up:

- Business logic (which addresses to show, which is selected, when the accordion is open, etc.) is handled in `page.tsx` with:
  - `savedShippingAddresses`, `savedBillingAddresses`, `selectedSavedBillingAddress`, `selectedSavedDeliveryAddress`, `formMode`, `isSameShipping`, `doesHaveSavedAddresses`, `isBusiness`, `activeTab`, `setIsAccordionOpen`, `handleBillingAddressSaved`, `handleDeliveryAddressSaved`, and related effects.
  - All of these are passed into `useCheckoutTabs(...)`.
- `useCheckoutTabs(...)` builds the tab `content` that actually contains the **address card components**.
- The **only place those card trees are inserted into the checkout layout** is the `{useTabsStore(...).content}` expression shown above, inside the main left column under `DeliveryMethodSelector`.

To inspect or modify the structure/markup of the individual address cards themselves (card layout, buttons, labels for personal vs business, home vs warehouse, etc.), you will need to open the components/tabs returned from `useCheckoutTabs`, but this file shows **where** that content is hooked into the checkout page.

### Meaning of `openedFrom` in `EditAddressModal` store

- `openedFrom` in `useEditAddressModalStore` is used to track **which section of the checkout address UI** opened `EditAddressModal`, **not which page**:
  - When opened from billing cards (`SavedBillingAddress2`), we call `setOpenedFrom("billing")`.
  - When opened from delivery cards (`SavedDeliveryAddress2`), we call `setOpenedFrom("delivery")`.
- This allows checkout logic (e.g. after the modal closes) to know whether the user was editing/adding a **billing** or **delivery** address, while still using the same shared `EditAddressModal` component mounted in `checkout/page.tsx`.

### MOST IMPORTANT: where “selected address after save” is controlled

- The logic that decides **which saved address becomes selected after you SAVE in `EditAddressModal`** is implemented **in `checkout/page.tsx`, not in the modal itself**.
- After `EditAddressModal` successfully saves an address and closes, `checkout/page.tsx`:
  - Reads the fresh `authUser.addresses` from `useAuthStore`.
  - Computes `latestBillingAddress` and `latestShippingAddress` (by sorting addresses and taking the newest).
  - Uses `openedFrom`:
    - `"billing"` → sets `selectedSavedBillingAddress` (and `selectedSavedDeliveryAddress` when `isSameShipping` is true) to the latest billing address.
    - `"delivery"` → sets `selectedSavedDeliveryAddress` (and, when `isSameShipping`, `selectedSavedBillingAddress`) to the latest shipping address.
  - Updates `savedBillingAddresses` / `savedShippingAddresses`, hides the add/edit forms (`formMode.billing/delivery = "hidden"`), and flags `addresschanged`.
- **Future overrides (e.g. when handling duplicate addresses or custom selection rules) should hook into or adjust this effect in `checkout/page.tsx`, because that is the single place where “which address is selected after save” is finalized.**
