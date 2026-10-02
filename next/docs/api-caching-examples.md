# API Caching Examples

## Real-World Implementation Examples

### 1. E-commerce Product Catalog

```typescript
// services/productService.ts
import { apiClient, cacheUtils } from "@/config/api";

export class ProductService {
  // Get products with automatic caching (5 minutes TTL)
  static async getProducts(category?: string, page = 1) {
    const params = category ? { category, page } : { page };
    return apiClient.get<Product[]>("/api/products", params);
  }

  // Get single product with automatic caching
  static async getProduct(id: string) {
    return apiClient.get<Product>(`/api/products/${id}`);
  }

  // Update product (invalidates related cache automatically)
  static async updateProduct(id: string, data: Partial<Product>) {
    const result = await apiClient.put<Product>(`/api/products/${id}`, data);

    // Preload updated data.
    await cacheUtils.refresh(`/api/products/${id}`);

    return result;
  }

  // Add new product (invalidates product list cache)
  static async createProduct(data: CreateProductData) {
    const result = await apiClient.post<Product>("/api/products", data);

    // Clear product list caches
    cacheUtils.clearPattern("/api/products");

    return result;
  }

  // Preload popular products
  static async preloadPopularProducts() {
    await Promise.all([
      cacheUtils.preload("/api/products?category=electronics"),
      cacheUtils.preload("/api/products?category=clothing"),
      cacheUtils.preload("/api/products?category=books"),
    ]);
  }
}
```

### 2. User Authentication & Profile

```typescript
// services/userService.ts
import { apiClient, cacheUtils } from "@/config/api";

export class UserService {
  // Get user profile (cached for 5 minutes)
  static async getProfile() {
    return apiClient.get<UserProfile>("/api/user/profile");
  }

  // Update profile (invalidates cache)
  static async updateProfile(data: Partial<UserProfile>) {
    const result = await apiClient.put<UserProfile>("/api/user/profile", data);

    // Force refresh profile data
    await cacheUtils.refresh("/api/user/profile");

    return result;
  }

  // Login (clears all user-related cache)
  static async login(credentials: LoginCredentials) {
    const result = await apiClient.post<AuthResponse>("/api/auth/login", credentials);

    // Clear user-related cache on login
    cacheUtils.clearPattern("/api/user");
    cacheUtils.clearPattern("/api/auth");

    return result;
  }

  // Logout (clears all cache)
  static async logout() {
    await apiClient.post("/api/auth/logout");

    // Clear all cache on logout
    cacheUtils.clear();
  }

  // Check if profile cache is valid
  static hasValidProfile(): boolean {
    return cacheUtils.hasValid("/api/user/profile");
  }
}
```

### 3. Translation Management

```typescript
// services/translationService.ts
import { apiClient, cacheUtils } from "@/config/api";

export class TranslationService {
  // Get translations (cached for 1 hour)
  static async getTranslations(lang: string) {
    return apiClient.get<Translations>(`/api/translations/${lang}`);
  }

  // Update translations (invalidates cache)
  static async updateTranslations(lang: string, data: Partial<Translations>) {
    const result = await apiClient.put<Translations>(`/api/translations/${lang}`, data);

    // Clear translation cache for this language
    cacheUtils.clearPattern(`/api/translations/${lang}`);

    return result;
  }

  // Preload common languages
  static async preloadCommonLanguages() {
    const commonLanguages = ["en", "fr", "de", "es", "it"];

    await Promise.all(
      commonLanguages.map((lang) => cacheUtils.preload(`/api/translations/${lang}`)),
    );
  }

  // Get cached translations without network request
  static getCachedTranslations(lang: string): Translations | null {
    return cacheUtils.get<Translations>(`/api/translations/${lang}`);
  }
}
```

### 4. Dashboard Analytics

```typescript
// services/analyticsService.ts
import { apiClient, cacheUtils } from "@/config/api";

export class AnalyticsService {
  // Get dashboard data (short TTL - 2 minutes)
  static async getDashboardData() {
    return apiClient.get<DashboardData>("/api/analytics/dashboard");
  }

  // Get sales report (cached for 15 minutes)
  static async getSalesReport(period: "daily" | "weekly" | "monthly") {
    return apiClient.get<SalesReport>(`/api/analytics/sales?period=${period}`);
  }

  // Real-time updates (no caching)
  static async getRealTimeMetrics() {
    // Invalidate cache to force fresh data
    cacheUtils.invalidateRelated("/api/analytics/dashboard", "GET");

    return apiClient.get<RealTimeMetrics>("/api/analytics/realtime");
  }

  // Export report (no caching)
  static async exportReport(type: string, filters: ReportFilters) {
    return apiClient.post<Blob>(`/api/analytics/export/${type}`, filters);
  }

  // Preload dashboard data
  static async preloadDashboard() {
    await Promise.all([
      cacheUtils.preload("/api/analytics/dashboard"),
      cacheUtils.preload("/api/analytics/sales?period=daily"),
      cacheUtils.preload("/api/analytics/sales?period=weekly"),
    ]);
  }
}
```

## React Integration Examples

### 1. Custom Hook with Cache Integration

```typescript
// hooks/useApiCache.ts
import { useState, useEffect } from "react";
import { apiClient, cacheUtils } from "@/config/api";

export function useApiCache<T>(
  url: string,
  params?: any,
  options: {
    ttl?: number;
    preload?: boolean;
    refreshOnMount?: boolean;
  } = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      let result: T;

      if (forceRefresh) {
        result = await cacheUtils.refresh<T>(url, params);
      } else {
        result = await apiClient.get<T>(url, params);
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.preload) {
      cacheUtils.preload(url, params);
    }

    if (options.refreshOnMount) {
      fetchData(true);
    } else {
      fetchData();
    }
  }, [url]);

  const refresh = () => fetchData(true);

  const invalidate = () => {
    cacheUtils.invalidateRelated(url, "GET");
  };

  return { data, loading, error, refresh, invalidate };
}
```

### 2. Usage in Components

```typescript
// components/ProductList.tsx
import { useApiCache } from '@/hooks/useApiCache';

export function ProductList({ category }: { category?: string }) {
  const url = category ? `/api/products?category=${category}` : '/api/products';

  const { data: products, loading, error, refresh } = useApiCache<Product[]>(url);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. Server Component Integration

```typescript
// app/products/page.tsx
import { cacheUtils } from '@/config/api';
import ProductList from '@/components/ProductList';

// Preload data on server
async function preloadProductData() {
  await Promise.all([
    cacheUtils.preload('/api/products'),
    cacheUtils.preload('/api/products?category=electronics'),
    cacheUtils.preload('/api/products?category=popular'),
  ]);
}

export default async function ProductsPage() {
  // Preload critical data
  await preloadProductData();

  return (
    <div>
      <h1>Products</h1>
      <ProductList />
    </div>
  );
}
```

## Advanced Examples

### 1. Cache Warming Strategy

```typescript
// utils/cacheWarmer.ts
import { cacheUtils } from "@/config/api";

export class CacheWarmer {
  static async warmApplicationCache() {
    console.log("🔥 Warming up application cache...");

    const startTime = Date.now();

    try {
      // Preload critical data
      await Promise.all([
        // Translations
        cacheUtils.preload("/api/translations/en"),
        cacheUtils.preload("/api/translations/fr"),

        // Configuration
        cacheUtils.preload("/api/config/app"),
        cacheUtils.preload("/api/config/features"),

        // Popular content
        cacheUtils.preload("/api/products?category=popular"),
        cacheUtils.preload("/api/brands"),

        // User-related (if authenticated)
        // cacheUtils.preload('/api/user/preferences'),
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Cache warmed in ${duration}ms`);

      // Log cache stats
      const stats = cacheUtils.getStats();
      console.log(`📊 Cache stats: ${stats.cacheSize} entries, ${stats.pendingRequests} pending`);
    } catch (error) {
      console.error("❌ Cache warming failed:", error);
    }
  }

  static async schedulePeriodicWarmup(intervalMinutes = 30) {
    setInterval(
      () => {
        this.warmApplicationCache();
      },
      intervalMinutes * 60 * 1000,
    );
  }
}
```

### 2. Cache Health Monitoring

```typescript
// utils/cacheMonitor.ts
import { cacheUtils } from "@/config/api";

export class CacheMonitor {
  static getHealthStatus() {
    const stats = cacheUtils.getStats();
    const memoryUsage = process.memoryUsage();

    return {
      cacheSize: stats.cacheSize,
      pendingRequests: stats.pendingRequests,
      memoryUsage: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
      expiredEntries: stats.cacheEntries.filter((entry) => entry.expired).length,
      averageAge:
        stats.cacheEntries.reduce((sum, entry) => sum + entry.age, 0) / stats.cacheEntries.length ||
        0,
    };
  }

  static logHealthStatus() {
    const status = this.getHealthStatus();

    console.log("🏥 Cache Health Status:");
    console.log(`  Cache Size: ${status.cacheSize} entries`);
    console.log(`  Pending Requests: ${status.pendingRequests}`);
    console.log(`  Memory Usage: ${status.memoryUsage.percentage.toFixed(1)}%`);
    console.log(`  Expired Entries: ${status.expiredEntries}`);
    console.log(`  Average Age: ${(status.averageAge / 1000).toFixed(1)}s`);

    // Health warnings
    if (status.memoryUsage.percentage > 85) {
      console.warn("⚠️ High memory usage detected!");
    }

    if (status.expiredEntries > status.cacheSize * 0.1) {
      console.warn("⚠️ Many expired entries in cache!");
    }

    if (status.pendingRequests > 10) {
      console.warn("⚠️ High number of pending requests!");
    }
  }

  static startHealthMonitoring(intervalSeconds = 60) {
    setInterval(() => {
      this.logHealthStatus();
    }, intervalSeconds * 1000);
  }
}
```

### 3. Cache Testing Utilities

```typescript
// utils/cacheTest.ts
import { cacheUtils } from "@/config/api";

export class CacheTest {
  static async testCachePerformance() {
    console.log("🧪 Testing cache performance...");

    const testUrl = "/api/test/performance";
    const iterations = 100;

    // Clear cache first
    cacheUtils.clear();

    // Test without cache
    const startNoCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      await cacheUtils.refresh(testUrl);
    }
    const noCacheTime = Date.now() - startNoCache;

    // Test with cache
    const startWithCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      (await cacheUtils.get(testUrl)) || (await cacheUtils.refresh(testUrl));
    }
    const withCacheTime = Date.now() - startWithCache;

    const improvement = ((noCacheTime - withCacheTime) / noCacheTime) * 100;

    console.log(`📊 Performance Results:`);
    console.log(`  Without Cache: ${noCacheTime}ms`);
    console.log(`  With Cache: ${withCacheTime}ms`);
    console.log(`  Improvement: ${improvement.toFixed(1)}%`);

    return { noCacheTime, withCacheTime, improvement };
  }

  static async testMemoryUsage() {
    const initialMemory = process.memoryUsage().heapUsed;

    // Fill cache with test data
    for (let i = 0; i < 50; i++) {
      await cacheUtils.preload(`/api/test/data/${i}`);
    }

    const afterCacheMemory = process.memoryUsage().heapUsed;
    const cacheMemoryUsage = afterCacheMemory - initialMemory;

    console.log(`💾 Memory Usage Test:`);
    console.log(`  Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  After Cache: ${(afterCacheMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Cache Memory: ${(cacheMemoryUsage / 1024 / 1024).toFixed(2)}MB`);

    // Cleanup
    cacheUtils.clear();

    return { initialMemory, afterCacheMemory, cacheMemoryUsage };
  }
}
```

## Error Handling Examples

### 1. Robust API Service

```typescript
// services/robustApiService.ts
import { apiClient, cacheUtils } from "@/config/api";

export class RobustApiService {
  static async getWithFallback<T>(url: string, fallbackData: T): Promise<T> {
    try {
      // Try cache first
      const cached = cacheUtils.get<T>(url);
      if (cached) return cached;

      // Try API
      return await apiClient.get<T>(url);
    } catch (error) {
      console.warn(`API failed for ${url}, using fallback:`, error);

      // Clear potentially corrupted cache
      cacheUtils.invalidateRelated(url, "GET");

      return fallbackData;
    }
  }

  static async getWithRetry<T>(url: string, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiClient.get<T>(url);
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          // Clear cache on final failure
          cacheUtils.invalidateRelated(url, "GET");
          throw lastError;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }
}
```

---

These examples demonstrate real-world usage patterns and best practices for the API caching system. Adapt them to your specific use cases and requirements.
