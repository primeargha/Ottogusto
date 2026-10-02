# Product Cache Usage Examples

## Overview

This demonstrates how to use the persistent server-side cache for product data. The cache is shared across all devices (laptop, mobile, etc.) and persists for 1 hour.

## API Routes

### Store Product Data (POST)

```typescript
// POST /api/cache/product
{
  "id": "PART123",
  "data": {
    "name": "Product Name",
    "price": 99.99,
    // ... any product data
  }
}
```

### Get Product Data (GET)

```typescript
// GET /api/cache/product?id=PART123
```

### Delete Product Cache (DELETE)

```typescript
// DELETE /api/cache/product?id=PART123  // Delete specific
// DELETE /api/cache/product              // Clear all
```

---

## Usage Examples

### Example 1: Using the Service Class (Recommended)

```typescript
import { ProductCacheService } from "@/services/productCacheService";

// Store product in cache
async function cacheProduct() {
  const productData = {
    id: "PART123",
    name: "Brake Pad",
    price: 49.99,
    availability: "InStock",
  };

  const result = await ProductCacheService.set("PART123", productData);

  if (result.success) {
    console.log("Product cached successfully!");
  }
}

// Retrieve product from cache
async function getProductFromCache() {
  const result = await ProductCacheService.get("PART123");

  if (result.success && result.data) {
    console.log("Product from cache:", result.data);
    console.log("Cached at:", result.cachedAt);
  } else {
    console.log("Product not in cache");
  }
}
```

### Example 2: Modified fetchProduct with Cache

```typescript
import { ProductCacheService } from "@/services/productCacheService";
import { createApiClient } from "@/lib/api-client";

const fetchProduct = async (partid: string) => {
  try {
    // Try to get from cache first
    const cached = await ProductCacheService.get(partid);

    if (cached.success && cached.data) {
      console.log("✅ Product loaded from cache");
      return cached.data;
    }

    // If not in cache, fetch from API
    console.log("📡 Fetching from API...");
    const api = createApiClient({ isServer: true });
    const res = await api.get(`/parts/${partid}`);

    // Store in cache for future requests
    await ProductCacheService.set(partid, res.data);

    return res.data;
  } catch (error) {
    console.error(`Error fetching product ${partid}:`, error);
    return null;
  }
};
```

### Example 3: Client-Side Usage (React Component)

```typescript
'use client';

import { ProductCacheService } from '@/services/productCacheService';
import { useEffect, useState } from 'react';

export function ProductDisplay({ productId }: { productId: string }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      // Try cache first
      const cached = await ProductCacheService.get(productId);

      if (cached.success && cached.data) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

      // Fetch from your API if not cached
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      // Store in cache
      await ProductCacheService.set(productId, data);
      setProduct(data);
      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  return <div>{product?.name}</div>;
}
```

### Example 4: Server-Side Page with Cache

```typescript
// app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx

import { ProductCacheService } from '@/services/productCacheService';
import { createApiClient } from '@/lib/api-client';

async function fetchProductWithCache(partid: string) {
  // Check cache first (server-side)
  const cached = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cache/product?id=${partid}`);
  const cacheResult = await cached.json();

  if (cacheResult.success && cacheResult.data) {
    console.log('✅ Loaded from server cache');
    return cacheResult.data;
  }

  // Fetch from external API
  const api = createApiClient({ isServer: true });
  const res = await api.get(`/parts/${partid}`);

  // Store in cache
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cache/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: partid, data: res.data })
  });

  return res.data;
}

export default async function ProductPage({ params }: { params: { partid: string } }) {
  const product = await fetchProductWithCache(params.partid);

  return <div>{/* Your product display */}</div>;
}
```

---

## Key Benefits

✅ **Shared Across Devices**: Cache from laptop is accessible on mobile  
✅ **Persistent**: Survives across page reloads (until TTL expires)  
✅ **Fast**: Reduces API calls to external services  
✅ **Simple**: Easy-to-use service class

## Cache Behavior

- **TTL**: 1 hour (configurable in route.ts)
- **Storage**: Server memory (resets on server restart)
- **Scope**: Global (all users share the same cache)

> **Note**: For production with multiple server instances, consider using Redis instead of in-memory Map.
