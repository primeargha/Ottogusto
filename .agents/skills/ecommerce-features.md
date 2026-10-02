---
description: E-commerce specific features and business logic
---

# E-commerce Features

## Core E-commerce Functionality

### Product Catalog
- **Multi-category** product browsing
- **Advanced search** with filters
- **Product details** with specifications
- **Image galleries** with zoom
- **Product comparisons** and recommendations

### Shopping Cart
- **Add to cart** with quantity management
- **Cart persistence** across sessions
- **Price calculations** with taxes
- **Stock availability** checking
- **Guest checkout** support

### Vehicle Fitment System
- **Make/Model/Engine** (MME) selection
- **Vehicle compatibility** checking
- **Garage management** for saved vehicles
- **Fitment validation** for parts
- **Year-specific** product filtering

## Search & Discovery

### Advanced Search
```typescript
// Search filters interface
interface SearchFilters {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  vehicleFitment: VehicleInfo;
  keywords: string;
  availability: 'in-stock' | 'all';
}
```

### Search Features
- **Real-time search** suggestions
- **Faceted search** navigation
- **Search history** tracking
- **Saved searches** functionality
- **OE number** lookup for parts

### Product Filtering
- **Category-based** filtering
- **Brand filtering** with logos
- **Price range** sliders
- **Vehicle-specific** filters
- **Availability** status

## User Account Management

### Authentication
- **Multi-provider** login (email, social)
- **JWT token** management
- **Session persistence**
- **Password reset** functionality
- **Account verification**

### User Profiles
- **Personal information** management
- **Address book** for shipping
- **Order history** tracking
- **Wishlist** management
- **Vehicle garage** storage

## Order Management

### Checkout Process
- **Multi-step** checkout flow
- **Address validation** and suggestions
- **Payment method** integration
- **Order confirmation** and tracking
- **Email notifications**

### Order Features
- **Order status** tracking
- **Return and exchange** processing
- **Invoice generation** and download
- **Shipping tracking** integration
- **Order history** with filters

## Business Logic

### Pricing Strategy
- **Dynamic pricing** based on quantity
- **Promotional pricing** with discounts
- **Tax calculations** by region
- **Currency support** for multi-language
- **Membership pricing** tiers

### Inventory Management
- **Real-time stock** tracking
- **Backorder management**
- **Supplier integration**
- **Warehouse allocation**
- **Stock alerts** for low inventory

## Multi-Store Operations

### Store-Specific Features
- **Ottogusto** - Automotive parts focus
- **Qverde** - Sustainable products focus
- **Shared catalog** with store-specific filtering
- **Separate branding** and theming
- **Store-specific** promotions

### Localization
- **Multi-language** support (EN, FR, NL, DE)
- **Region-specific** product catalogs
- **Currency conversion** and display
- **Local payment** methods
- **Cultural adaptations** for UI
