## Checkout address forms – context study

### 1. Fields per form

- **`EditAddressModal` (profile modal for logged-in users)**
  - Personal mode: `name`, `street`, `houseNumber`, `buildingNumber`, `postalCode`, `city`, `state` (conditional), `country`, `phoneNumber`, `isDefaultBilling`, `isDefaultShipping`.
  - Business mode: `vatNumber`, `companyName`, `phoneNumber`, `street`, `houseNumber`, `buildingNumber`, `postalCode`, `city`, `state` (conditional), `country`, `isDefaultBusinessBilling` plus implicit `isCompany`, `vatNumber`, `companyName` when building payload.

- **`BillingaddressInput` (checkout billing)**
  - Base fields: `name`, `street`, `houseNumber`, `buildingNumber`, `city`, `state`, `postalCode`, `country`, `phoneNumber`, `isDefaultBilling`, `isDefaultShipping`.
  - Business mode (`shouldShowBusinessFields === true`): additionally `vatNumber`, `companyName`, `email` (invoice email).

- **`DeliveryaddressInput` (checkout delivery / guest billing)**
  - Fields: `name`, `street`, `houseNumber`, `buildingNumber`, `city`, `state`, `postalCode`, `country`, `phoneNumber`, `isDefaultBilling`, `isDefaultShipping`.

### 2. Required vs optional fields

- **Common rules**
  - `street`, `city`, `postalCode`, `country` are **required** in all three forms.
  - `houseNumber` is **conditionally required** when `country` is one of `BE`, `NL`, `LU` (checked case-insensitively) in all three forms.
  - `state` is **conditionally required and visible only** when `country` is one of `DE`, `AT`, `IT`, `ES`, `PT` (Germany, Austria, Italy, Spain, Portugal) in all three forms; it is hidden and not required for all other countries.
  - `phoneNumber`:
    - `EditAddressModal`: optional, but when present must be a possible phone number.
    - `BillingaddressInput`: optional, must be a possible phone number when present.
    - `DeliveryaddressInput`: **required**, must be a valid phone number.

- **Per-form specifics**
  - `EditAddressModal`
    - Personal: `name` optional; `isDefaultBilling`, `isDefaultShipping` optional booleans.
    - Business: `vatNumber` and `companyName` are effectively **required** via `refine` when `isBusiness === true`; `isDefaultBusinessBilling` optional.
  - `BillingaddressInput`
    - Personal mode:
      - `name` **required**.
      - `phoneNumber` optional but validated when present.
    - Business mode:
      - `vatNumber`, `companyName`, `email` are **required** (zod `min(1, ...)`).
      - `phoneNumber` optional but validated when present.
  - `DeliveryaddressInput`
    - `name`, `street`, `city`, `postalCode`, `country`, `phoneNumber` are **required**.
    - `phoneNumber` error messages use brand labels `phone_required` / `phone_invalid`.

### 3. Phone number input library

- All three forms validate phone numbers using **`react-phone-number-input`**:
  - `EditAddressModal` imports and uses `isPossiblePhoneNumber` from `react-phone-number-input` and renders `OGPhoneInput`.
  - `BillingaddressInput` imports `PhoneInput, { isPossiblePhoneNumber }` from `react-phone-number-input` (only `isPossiblePhoneNumber` is used in validation; UI uses `OGPhoneInput`).
  - `DeliveryaddressInput` imports `PhoneInput, { isPossiblePhoneNumber }` from `react-phone-number-input` (again, only `isPossiblePhoneNumber` is used; UI uses `OGPhoneInput`).

### 4. Country dropdown behaviour

- **Data source**
  - All three forms use `useGetConfigQuery()` and build the country options from `config.countries` as:
    - `[{ label: name, value: code.toUpperCase() }, ...]`.

- **`EditAddressModal`**
  - Country is a required `OGSelectDropdown`.
  - When editing:
    - Pre-fills `country` from the selected address, normalizing case via `findMatchingCountryCode` so the stored code matches the config and is uppercased.
  - When adding or when modal closes:
    - Attempts to prefill `country` from `currentLocale.country_code` using `findMatchingCountryCode` against `config.countries`, uppercased.
  - On VAT lookup success in business mode:
    - Prefills address fields from the VAT API response.
    - Sets `country` from the VAT country code (normalized to match config and uppercased), **except** when the current locale country is `FR` and VAT country is not `FR` – in that case it keeps `FR` as country so that `houseNumber` remains optional.
  - On country change:
    - Triggers validation of `houseNumber` only when the selected country requires it (BE/NL/LU).

- **`BillingaddressInput`**
  - Country is a required `OGSelectDropdown`.
  - Default value comes from:
    - `guestBillingFormData.country`, or
    - `currentLocale.country_code` mapped via `findMatchingCountryCode` and uppercased.
  - Change handler:
    - Wrapped to call `setaddresschanged(true)` so checkout calculation hook can react.
  - VAT lookup behaviour (business mode):
    - VAT lookup via `companyVatLookup` can prefill `street`, `city`, `postalCode`, `country`, `houseNumber`, `buildingNumber`, `state`.
    - Country from VAT is normalized via `findMatchingCountryCode` and uppercased.
    - If locale is `FR` and VAT country is not `FR`, country is kept as `FR` (same FR exception as `EditAddressModal`) to keep `houseNumber` optional.
  - As in the modal, country changes trigger `houseNumber` revalidation when required.

- **`DeliveryaddressInput`**
  - Country is a required `OGSelectDropdown`.
  - Default value comes from:
    - `guestDeliveryFormData.country` (or `guestBillingFormData` when used as guest billing form), or
    - `currentLocale.country_code` mapped via `findMatchingCountryCode` and uppercased.
  - Change handler:
    - Calls `setaddresschanged(true)` to trigger checkout recalculation.
  - On country change:
    - Triggers validation for `houseNumber`; requirement is again conditional on `BE/NL/LU`.

### 5. When each form is used

- **Logged-in users with saved addresses (Personal/Business; Home delivery or warehouse)**
  - Checkout page:
    - Shows saved address cards (billing + delivery) using data from the profile.
    - Uses `EditAddressModal` (imported into checkout) for **adding/editing** both personal and business addresses from checkout.
    - Address selection and filtering between personal/business is handled in the checkout store and `SavedAddresses`-like logic; modal always edits a single address.
  - Profile `SavedAddresses` page:
    - Renders address list cards from `authUser.addresses`.
    - Uses `EditAddressModal` for **add/edit** (only this modal is used on this page).

- **Logged-out users OR logged-in users with no saved addresses**
  - Checkout page:
    - Uses:
      - `BillingaddressInput` for billing address form.
      - `DeliveryaddressInput` for delivery address form (and also as a billing form when `isBillingForm` is set for certain guest flows).
    - These forms manage guest address data in the cart store (`guestBillingFormData`, `guestDeliveryFormData`), and validation is coordinated with `createGuestAddressSchema` in `checkout/helpers`.

### 6. Summary of required behaviour for modifications

- **Fields**: All three forms share the same core address fields; `EditAddressModal` and `BillingaddressInput` add business-only fields (`vatNumber`, `companyName`, `email`), with the modal also carrying flags like `isDefaultBusinessBilling`.
- **Required fields**:
  - Always required: `street`, `city`, `postalCode`, `country`.
  - Conditionally required: `houseNumber` for BE/NL/LU, `state` for DE/AT/IT/ES/PT, and `buildingNumber` (box/bus/unit) for BE only.
  - Phone:
    - Optional in profile modal and checkout billing; required in checkout delivery.
  - Business-only required fields:
    - Modal: `vatNumber`, `companyName` when `isBusiness` is true.
    - Checkout billing: `vatNumber`, `companyName`, `email` when business billing is active.
- **Phone library**: Input UI uses `OGPhoneInput`, but **validation is based on `react-phone-number-input`’s `isPossiblePhoneNumber`** everywhere.
- **Country dropdown**:
  - Populated from `config.countries`.
  - Selection always uppercases country codes.
  - Changing country:
    - Revalidates `houseNumber` for BE/NL/LU.
    - In billing/delivery forms, also flags `addresschanged` so shipping calculation can re-run.
    - If the phone field is empty or contains only a country calling code, changing the country will auto-fill the phone input with the new country’s calling code; if the phone already contains a full code + number, it is left unchanged when the country changes.
  - VAT lookups may override country from VAT response, except for the FR-locale exceptions where FR must remain selected to keep `houseNumber` optional.

### 7. Extra implementation references (for next tasks)

- **Phone input implementation details**
  - Library docs for `react-phone-number-input` (used behind `OGPhoneInput` for parsing/validation/flags) are here:
    - `https://www.npmjs.com/package/react-phone-number-input`
  - When extending phone behaviour (flags, default country, formatting), use the patterns and props recommended in this documentation, then wrap them via `OGPhoneInput` to keep styling consistent with the design system.

- **Country list coming from Config API**
  - The country dropdown options in these forms must use the exact country codes/names coming from the Config API:
    - `BE`: Belgium
    - `NL`: Netherlands
    - `FR`: France
    - `DE`: Germany
    - `AT`: Austria
    - `IT`: Italy
    - `PL`: Poland
    - `ES`: Spain
    - `PT`: Portugal
    - `CZ`: Czechia
    - `HU`: Hungary
    - `SK`: Slovakia
    - `SI`: Slovenia
    - `HR`: Croatia
    - `SE`: Sweden
    - `DK`: Denmark
    - `FI`: Finland
    - `LU`: Luxembourg
  - **Requirement for future changes**: all new country-dependent logic (validation, defaults, VAT behaviour, UI labelling) in checkout/profile address flows should assume this config-driven list and not rely on hard-coded country names or ad-hoc mappings.
