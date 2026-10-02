/**
 * Product Cache Service
 * Provides methods to store and retrieve product data from server-side cache
 */

interface CacheResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cachedAt?: string;
}

export class ProductCacheService {
  private static baseUrl = "/api/cache/product";

  /**
   * Get the full URL for the cache API
   * Returns absolute URL on server, relative URL on client
   */
  private static getBaseUrl(): string {
    // Check if we're on the server
    if (typeof window === "undefined") {
      // Server-side: use absolute URL
      const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || process.env.NEXT_PUBLIC_FRONTEND_DEV_URL;
      return `${baseUrl}${this.baseUrl}`;
    }
    // Client-side: use relative URL
    return this.baseUrl;
  }

  /**
   * Store product data in cache
   * @param id - Product ID
   * @param data - Product data to cache
   */
  // TODO: replace with types from api docs
  static async set(id: string, data: any): Promise<CacheResponse<void>> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, data }),
      });

      return await response.json();
    } catch (error) {
      console.error("[ProductCacheService] Error setting cache:", error);
      return { success: false, error: "Failed to set cache" };
    }
  }

  /**
   * Retrieve product data from cache by ID
   * @param id - Product ID
   */
  static async get<T = any>(id: string): Promise<CacheResponse<T>> {
    try {
      const response = await fetch(`${this.getBaseUrl()}?id=${id}`, {
        method: "GET",
      });

      return await response.json();
    } catch (error) {
      console.error("[ProductCacheService] Error getting cache:", error);
      return { success: false, error: "Failed to get cache" };
    }
  }

  /**
   * Delete specific product from cache
   * @param id - Product ID
   */
  static async delete(id: string): Promise<CacheResponse<void>> {
    try {
      const response = await fetch(`${this.getBaseUrl()}?id=${id}`, {
        method: "DELETE",
      });

      return await response.json();
    } catch (error) {
      console.error("[ProductCacheService] Error deleting cache:", error);
      return { success: false, error: "Failed to delete cache" };
    }
  }

  /**
   * Clear all product cache
   */
  static async clearAll(): Promise<CacheResponse<void>> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: "DELETE",
      });

      return await response.json();
    } catch (error) {
      console.error("[ProductCacheService] Error clearing cache:", error);
      return { success: false, error: "Failed to clear cache" };
    }
  }
}
