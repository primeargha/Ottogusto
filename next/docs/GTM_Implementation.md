# Google Tag Manager (GTM) Implementation

This document outlines the implementation of Google Tag Manager for ecommerce tracking on the Ottogusto platform.

## Container Setup

GTM container selection is environment-driven via `NEXT_PUBLIC_GTM_ID`.

For Ottogusto:

- **Dev (`main`)**: `GTM-NXBSK7J5`
- **Production (`master`)**: `GTM-NDBN8VX9`

The app reads this value from the active env file at build/deploy time.

## Implementation Overview

## Installation

### GTM Container Setup

- The GTM container script is added to the root layout (`app/layout.tsx`)
- GTM script is loaded in the `<head>` section
- GTM noscript iframe is added to the `<body>` section
- Works across all routes automatically

### Files Added/Modified

1. **Components Added:**
   - `components/GTM.tsx` - GTM container and noscript components
2. **Utilities Added:**
   - `utils/gtm.ts` - All GTM ecommerce event functions and utilities
3. **Modified Files:**
   - `app/layout.tsx` - Added GTM components
   - `screens/products/ProductList.tsx` - Added view_item_list and add_to_cart tracking
   - `screens/productdetails/productdetails.tsx` - Added view_item tracking
   - `screens/productdetails/addtocart.tsx` - Added add_to_cart tracking (mobile)
   - `screens/productdetails/productcart.tsx` - Added add_to_cart tracking (desktop)
   - `screens/shoppingcart/overviewcard.tsx` - Added begin_checkout tracking
   - `screens/payment-status/paymentstatus.tsx` - Added purchase tracking

## Implemented Events

### 1. view_item_list

**Trigger:** When product search results or category pages are loaded
**Location:** `screens/products/ProductList.tsx`
**Data Tracked:**

- List of products (max 10 for performance)
- List name (e.g., "Search Results: brake pads", "Category Products")
- List ID (e.g., "search_results", "category_123")
- Product details (ID, name, price, brand, category)

### 2. view_item

**Trigger:** When a product detail page is viewed
**Location:** `screens/productdetails/productdetails.tsx`
**Data Tracked:**

- Product ID, name, price, brand, category
- Currency (EUR)
- Product value

### 3. add_to_cart

**Trigger:** When products are added to cart from any location
**Locations:**

- `screens/products/ProductList.tsx` (product listing)
- `screens/productdetails/addtocart.tsx` (mobile product detail)
- `screens/productdetails/productcart.tsx` (desktop product detail)
  **Data Tracked:**
- Product details
- Quantity added
- Total value of items added
- Currency (EUR)

### 4. begin_checkout

**Trigger:** When user clicks "Proceed to Checkout"
**Location:** `screens/shoppingcart/overviewcard.tsx`
**Data Tracked:**

- All cart items
- Total cart value
- Currency (EUR)
- Any coupon codes (if applicable)

### 5. purchase

**Trigger:** When payment is successful (order confirmed)
**Location:** `screens/payment-status/paymentstatus.tsx`
**Data Tracked:**

- Transaction ID (order ID)
- All purchased items
- Total purchase value
- Tax amount
- Shipping cost
- Currency (EUR)
- Affiliation ("Ottogusto")
- Any coupon codes

## Data Structure

### GTM Item Format

```typescript
interface GTMItem {
  item_id: string; // Product ID
  item_name: string; // Product name/title
  item_brand?: string; // Manufacturer/brand
  item_category?: string; // Product category
  price: number; // Product price (incl. VAT)
  quantity: number; // Quantity
  currency: string; // Always "EUR"
  index?: number; // Position in list (for view_item_list)
}
```

### Event Data Format

Events follow GA4 Enhanced Ecommerce format:

```typescript
{
  event: 'view_item_list' | 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase',
  ecommerce: {
    currency: 'EUR',
    value: number,           // Total value
    items: GTMItem[],        // Array of products
    transaction_id?: string, // For purchase events
    item_list_name?: string, // For view_item_list events
    // ... other relevant fields
  }
}
```

## Usage

### Utility Functions

```typescript
import {
  trackViewItemList,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  convertProductToGTMItem,
  convertCartItemsToGTMItems,
} from "@/utils/gtm";

// Convert product to GTM format
const gtmItem = convertProductToGTMItem(product, quantity, index);

// Track product list view
trackViewItemList(gtmItems, "Search Results", "search_results");

// Track single product view
trackViewItem(gtmItem);

// Track add to cart
trackAddToCart([gtmItem]);

// Track checkout begin
trackBeginCheckout(gtmItems, "EUR", couponCode);

// Track purchase
trackPurchase(orderId, gtmItems, "EUR", totalValue, tax, shipping);
```

## Testing

### Development Testing

- Events are logged to console for debugging
- Use browser's Developer Tools > Console to see GTM events
- Check dataLayer: `window.dataLayer` in browser console

### GTM Preview Mode

1. Open GTM container in preview mode
2. Navigate to the website
3. Verify events are firing correctly
4. Check event data structure

### GA4 Debug Mode

1. Install GA4 Debug extension
2. Enable debug mode in GA4
3. Verify events reach GA4 correctly

## Browser Compatibility

- Works across desktop, tablet, and mobile views
- Compatible with all modern browsers
- Gracefully handles cases where GTM fails to load
- Uses Next.js Script component for optimal loading

## Performance Considerations

- GTM script loaded with `strategy="afterInteractive"`
- Product lists limited to 10 items per event (GA4 recommendation)
- Events only fire when relevant data is available
- No blocking of main thread

## Troubleshooting

### Common Issues

1. **Events not firing:** Check browser console for errors, verify GTM container ID
2. **Missing data:** Verify product data structure matches expected format
3. **Duplicate events:** Ensure components aren't re-triggering events unnecessarily

### Debug Commands

```javascript
// Check if GTM is loaded
console.log(window.dataLayer);

// View recent events
console.log(window.dataLayer.slice(-5));

// Check GTM container
console.log(window.google_tag_manager);
```
